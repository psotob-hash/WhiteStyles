const express = require('express');
const router = express.Router();
const db = require('../db/database');

// Listar todas las ventas con información del cliente
router.get('/', (req, res) => {
  const rows = db.prepare(`
    SELECT v.*, c.nombre, c.apellido, c.RUT 
    FROM Venta v 
    JOIN Cliente c ON v.id_cliente = c.id_cliente 
    ORDER BY v.fecha_venta DESC
  `).all();
  res.json(rows);
});

// Obtener venta por id con detalles
router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  const venta = db.prepare(`
    SELECT v.*, c.nombre, c.apellido, c.RUT, c.email 
    FROM Venta v 
    JOIN Cliente c ON v.id_cliente = c.id_cliente 
    WHERE v.id_venta = ?
  `).get(id);
  
  if (!venta) return res.status(404).json({ error: 'Venta no encontrada' });
  
  const detalles = db.prepare(`
    SELECT dv.*, p.nombre, p.SKU, p.talla, p.color 
    FROM DetalleVenta dv 
    JOIN Producto p ON dv.id_producto = p.id_producto 
    WHERE dv.id_venta = ?
  `).all(id);
  
  res.json({ ...venta, detalles });
});

// Crear venta con detalles
router.post('/', (req, res) => {
  const { id_cliente, metodo_pago, detalles } = req.body;
  
  if (!detalles || detalles.length === 0) {
    return res.status(400).json({ error: 'Debe incluir al menos un producto' });
  }
  
  try {
    // Calcular total
    let total_venta = 0;
    detalles.forEach(d => {
      const subtotal = (d.precio_unitario_venta * d.cantidad_vendida) - (d.descuento_aplicado || 0);
      total_venta += subtotal;
    });
    
    // Crear venta
    const stmtVenta = db.prepare('INSERT INTO Venta (total_venta, metodo_pago, id_cliente) VALUES (?,?,?)');
    const infoVenta = stmtVenta.run(total_venta, metodo_pago, id_cliente);
    const id_venta = infoVenta.lastInsertRowid;
    
    console.log('Venta creada con ID:', id_venta);
    
    // Insertar detalles y actualizar stock
    detalles.forEach(d => {
      // Obtener stock actual antes de actualizar
      const productoAntes = db.prepare('SELECT stock, nombre FROM Producto WHERE id_producto = ?').get(d.id_producto);
      console.log(`Producto ${d.id_producto} (${productoAntes.nombre}) - Stock antes: ${productoAntes.stock}`);
      
      // Insertar detalle (nuevo statement para cada iteración)
      const stmtDetalle = db.prepare('INSERT INTO DetalleVenta (cantidad_vendida, precio_unitario_venta, descuento_aplicado, id_venta, id_producto) VALUES (?,?,?,?,?)');
      stmtDetalle.run(d.cantidad_vendida, d.precio_unitario_venta, d.descuento_aplicado || 0, id_venta, d.id_producto);
      
      // Actualizar stock (nuevo statement para cada iteración)
      const stmtStock = db.prepare('UPDATE Producto SET stock = stock - ? WHERE id_producto = ?');
      const resultStock = stmtStock.run(d.cantidad_vendida, d.id_producto);
      console.log(`Actualización stock - Changes: ${resultStock.changes}`);
      
      // Verificar stock después
      const productoDespues = db.prepare('SELECT stock FROM Producto WHERE id_producto = ?').get(d.id_producto);
      console.log(`Producto ${d.id_producto} - Stock después: ${productoDespues.stock}`);
      
      // Verificar alertas de stock
      const { verificarYCrearAlertas } = require('./alertas');
      verificarYCrearAlertas(d.id_producto);
    });
    
    const nueva = db.prepare('SELECT * FROM Venta WHERE id_venta = ?').get(id_venta);
    res.status(201).json(nueva);
  } catch (err) {
    console.error('Error en venta:', err);
    res.status(400).json({ error: err.message });
  }
});

// Obtener estadísticas de ventas
router.get('/stats/summary', (req, res) => {
  const { fecha_inicio, fecha_fin } = req.query;
  
  let whereClause = '';
  let params = [];
  
  if (fecha_inicio && fecha_fin) {
    whereClause = 'WHERE fecha_venta BETWEEN ? AND ?';
    params = [fecha_inicio, fecha_fin];
  }
  
  const stats = db.prepare(`
    SELECT 
      COUNT(*) as total_ventas,
      SUM(total_venta) as ingresos_totales,
      AVG(total_venta) as ticket_promedio
    FROM Venta ${whereClause}
  `).get(...params);
  
  const porMetodo = db.prepare(`
    SELECT metodo_pago, COUNT(*) as cantidad, SUM(total_venta) as total
    FROM Venta ${whereClause}
    GROUP BY metodo_pago
  `).all(...params);
  
  res.json({ ...stats, por_metodo: porMetodo });
});

module.exports = router;
