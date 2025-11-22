const express = require('express');
const router = express.Router();
const db = require('../db/database');

// Generar reporte de ventas
router.get('/ventas', (req, res) => {
  const { fecha_inicio, fecha_fin } = req.query;
  
  let whereClause = '';
  let params = [];
  
  if (fecha_inicio && fecha_fin) {
    whereClause = 'WHERE v.fecha_venta BETWEEN ? AND ?';
    params = [fecha_inicio + ' 00:00:00', fecha_fin + ' 23:59:59'];
  }
  
  const ventas = db.prepare(`
    SELECT 
      v.id_venta,
      v.fecha_venta,
      v.total_venta,
      v.metodo_pago,
      c.nombre || ' ' || c.apellido as cliente,
      c.RUT
    FROM Venta v
    JOIN Cliente c ON v.id_cliente = c.id_cliente
    ${whereClause}
    ORDER BY v.fecha_venta DESC
  `).all(...params);
  
  // Obtener detalles de cada venta
  const ventasConDetalles = ventas.map(venta => {
    const detalles = db.prepare(`
      SELECT 
        p.nombre,
        p.SKU,
        dv.cantidad_vendida,
        dv.precio_unitario_venta,
        dv.descuento_aplicado
      FROM DetalleVenta dv
      JOIN Producto p ON dv.id_producto = p.id_producto
      WHERE dv.id_venta = ?
    `).all(venta.id_venta);
    
    return { ...venta, detalles };
  });
  
  // Estadísticas
  const stats = db.prepare(`
    SELECT 
      COUNT(*) as total_ventas,
      SUM(total_venta) as ingresos_totales,
      AVG(total_venta) as ticket_promedio,
      MIN(total_venta) as venta_minima,
      MAX(total_venta) as venta_maxima
    FROM Venta v ${whereClause}
  `).get(...params);
  
  res.json({
    ventas: ventasConDetalles,
    estadisticas: stats,
    periodo: { fecha_inicio: fecha_inicio || 'Todas', fecha_fin: fecha_fin || 'Todas' }
  });
});

// Generar reporte de inventario
router.get('/inventario', (req, res) => {
  const productos = db.prepare(`
    SELECT 
      p.*,
      pr.nombre as proveedor_nombre
    FROM Producto p
    JOIN Proveedor pr ON p.id_proveedor = pr.id_proveedor
    ORDER BY p.stock ASC
  `).all();
  
  const stats = db.prepare(`
    SELECT 
      COUNT(*) as total_productos,
      SUM(stock) as unidades_totales,
      SUM(stock * precio_venta) as valor_inventario
    FROM Producto
  `).get();
  
  const bajoStock = db.prepare(`
    SELECT COUNT(*) as productos_bajo_stock
    FROM Producto
    WHERE stock <= 5
  `).get();
  
  res.json({
    productos,
    estadisticas: { ...stats, ...bajoStock }
  });
});

// Generar reporte de proveedores
router.get('/proveedores', (req, res) => {
  const proveedores = db.prepare(`
    SELECT 
      pr.*,
      COUNT(p.id_producto) as total_productos,
      SUM(p.stock) as total_unidades
    FROM Proveedor pr
    LEFT JOIN Producto p ON pr.id_proveedor = p.id_proveedor
    GROUP BY pr.id_proveedor
    ORDER BY total_productos DESC
  `).all();
  
  res.json({ proveedores });
});

module.exports = router;
