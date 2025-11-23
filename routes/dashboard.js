const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET /api/dashboard/stats - Estadísticas generales (KPIs)
router.get('/stats', (req, res) => {
  try {
    const { periodo = '7' } = req.query;
    
    // Calcular fecha de inicio según período
    let fechaInicio = '';
    if (periodo !== 'all') {
      const dias = parseInt(periodo);
      const fecha = new Date();
      fecha.setDate(fecha.getDate() - dias);
      fechaInicio = fecha.toISOString().split('T')[0];
    }

    // Total de ventas
    const ventasQuery = periodo === 'all' 
      ? 'SELECT COUNT(*) as total FROM Venta'
      : 'SELECT COUNT(*) as total FROM Venta WHERE DATE(fecha_venta) >= ?';
    const totalVentas = periodo === 'all'
      ? db.prepare(ventasQuery).get().total
      : db.prepare(ventasQuery).get(fechaInicio).total;

    // Ingresos totales
    const ingresosQuery = periodo === 'all'
      ? 'SELECT COALESCE(SUM(total_venta), 0) as ingresos FROM Venta'
      : 'SELECT COALESCE(SUM(total_venta), 0) as ingresos FROM Venta WHERE DATE(fecha_venta) >= ?';
    const ingresos = periodo === 'all'
      ? db.prepare(ingresosQuery).get().ingresos
      : db.prepare(ingresosQuery).get(fechaInicio).ingresos;

    // Productos vendidos (cantidad total de items)
    const productosQuery = periodo === 'all'
      ? 'SELECT COALESCE(SUM(dv.cantidad_vendida), 0) as total FROM DetalleVenta dv'
      : `SELECT COALESCE(SUM(dv.cantidad_vendida), 0) as total 
         FROM DetalleVenta dv 
         JOIN Venta v ON v.id_venta = dv.id_venta 
         WHERE DATE(v.fecha_venta) >= ?`;
    const productosVendidos = periodo === 'all'
      ? db.prepare(productosQuery).get().total
      : db.prepare(productosQuery).get(fechaInicio).total;

    // Clientes únicos que han comprado
    const clientesQuery = periodo === 'all'
      ? 'SELECT COUNT(DISTINCT id_cliente) as total FROM Venta'
      : 'SELECT COUNT(DISTINCT id_cliente) as total FROM Venta WHERE DATE(fecha_venta) >= ?';
    const clientesActivos = periodo === 'all'
      ? db.prepare(clientesQuery).get().total
      : db.prepare(clientesQuery).get(fechaInicio).total;

    res.json({
      totalVentas,
      ingresos: parseFloat(ingresos).toFixed(0),
      productosVendidos,
      clientesActivos
    });
  } catch (err) {
    console.error('Error en /stats:', err);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

// GET /api/dashboard/ventas-tiempo - Ventas agrupadas por fecha
router.get('/ventas-tiempo', (req, res) => {
  try {
    const { periodo = '7' } = req.query;
    
    let fechaInicio = '';
    if (periodo !== 'all') {
      const dias = parseInt(periodo);
      const fecha = new Date();
      fecha.setDate(fecha.getDate() - dias);
      fechaInicio = fecha.toISOString().split('T')[0];
    }

    const query = periodo === 'all'
      ? `SELECT DATE(fecha_venta) as fecha, COUNT(*) as ventas, SUM(total_venta) as ingresos 
         FROM Venta 
         GROUP BY DATE(fecha_venta) 
         ORDER BY fecha ASC`
      : `SELECT DATE(fecha_venta) as fecha, COUNT(*) as ventas, SUM(total_venta) as ingresos 
         FROM Venta 
         WHERE DATE(fecha_venta) >= ? 
         GROUP BY DATE(fecha_venta) 
         ORDER BY fecha ASC`;

    const datos = periodo === 'all'
      ? db.prepare(query).all()
      : db.prepare(query).all(fechaInicio);

    res.json(datos);
  } catch (err) {
    console.error('Error en /ventas-tiempo:', err);
    res.status(500).json({ error: 'Error al obtener datos de ventas' });
  }
});

// GET /api/dashboard/productos-top - Productos más vendidos
router.get('/productos-top', (req, res) => {
  try {
    const { periodo = '7', limit = '10' } = req.query;
    
    let fechaInicio = '';
    if (periodo !== 'all') {
      const dias = parseInt(periodo);
      const fecha = new Date();
      fecha.setDate(fecha.getDate() - dias);
      fechaInicio = fecha.toISOString().split('T')[0];
    }

    const query = periodo === 'all'
      ? `SELECT p.nombre, p.SKU, SUM(dv.cantidad_vendida) as cantidad_vendida, SUM(dv.cantidad_vendida * dv.precio_unitario_venta) as ingresos
         FROM DetalleVenta dv
         JOIN Producto p ON p.id_producto = dv.id_producto
         GROUP BY dv.id_producto
         ORDER BY cantidad_vendida DESC
         LIMIT ?`
      : `SELECT p.nombre, p.SKU, SUM(dv.cantidad_vendida) as cantidad_vendida, SUM(dv.cantidad_vendida * dv.precio_unitario_venta) as ingresos
         FROM DetalleVenta dv
         JOIN Producto p ON p.id_producto = dv.id_producto
         JOIN Venta v ON v.id_venta = dv.id_venta
         WHERE DATE(v.fecha_venta) >= ?
         GROUP BY dv.id_producto
         ORDER BY cantidad_vendida DESC
         LIMIT ?`;

    const datos = periodo === 'all'
      ? db.prepare(query).all(parseInt(limit))
      : db.prepare(query).all(fechaInicio, parseInt(limit));

    res.json(datos);
  } catch (err) {
    console.error('Error en /productos-top:', err);
    res.status(500).json({ error: 'Error al obtener productos top' });
  }
});

// GET /api/dashboard/stock-bajo - Productos con stock crítico
router.get('/stock-bajo', (req, res) => {
  try {
    const query = `
      SELECT p.nombre, p.stock, p.SKU, p.talla, p.color,
             CASE 
               WHEN p.stock = 0 THEN 'Sin Stock'
               WHEN p.stock <= 5 THEN 'Crítico'
               WHEN p.stock <= 10 THEN 'Bajo'
               ELSE 'Normal'
             END as estado
      FROM Producto p
      WHERE p.stock <= 10
      ORDER BY p.stock ASC
    `;

    const datos = db.prepare(query).all();
    res.json(datos);
  } catch (err) {
    console.error('Error en /stock-bajo:', err);
    res.status(500).json({ error: 'Error al obtener stock bajo' });
  }
});

// GET /api/dashboard/clientes-detalle - Lista de todos los clientes con su actividad
router.get('/clientes-detalle', (req, res) => {
  try {
    // Fecha hace 30 días
    const fecha30Dias = new Date();
    fecha30Dias.setDate(fecha30Dias.getDate() - 30);
    const fechaLimite = fecha30Dias.toISOString().split('T')[0];

    const query = `
      SELECT 
        c.RUT,
        c.nombre,
        c.apellido,
        c.email,
        c.telefono,
        MAX(v.fecha_venta) as ultima_compra,
        COUNT(v.id_venta) as total_compras,
        COALESCE(SUM(v.total_venta), 0) as monto_total,
        CASE 
          WHEN MAX(DATE(v.fecha_venta)) >= ? THEN 1 
          ELSE 0 
        END as es_activo
      FROM Cliente c
      LEFT JOIN Venta v ON c.id_cliente = v.id_cliente
      GROUP BY c.id_cliente, c.RUT, c.nombre, c.apellido, c.email, c.telefono
      ORDER BY es_activo DESC, ultima_compra DESC, c.nombre ASC
    `;

    const clientes = db.prepare(query).all(fechaLimite);
    res.json(clientes);
  } catch (err) {
    console.error('Error en /clientes-detalle:', err);
    res.status(500).json({ error: 'Error al obtener detalle de clientes' });
  }
});

module.exports = router;
