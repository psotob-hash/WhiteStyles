const express = require('express');
const router = express.Router();
const db = require('../db/database');

// Listar todas las alertas activas
router.get('/', (req, res) => {
  const rows = db.prepare(`
    SELECT a.*, p.nombre, p.SKU, p.stock 
    FROM AlertaStock a 
    JOIN Producto p ON a.id_producto = p.id_producto 
    WHERE a.estado = 'activo'
    ORDER BY a.fecha_creacion DESC
  `).all();
  res.json(rows);
});

// Resolver alerta
router.put('/:id/resolver', (req, res) => {
  const id = Number(req.params.id);
  const stmt = db.prepare('UPDATE AlertaStock SET estado = ? WHERE id_alerta = ?');
  const info = stmt.run('resuelto', id);
  
  if (info.changes === 0) {
    return res.status(404).json({ error: 'Alerta no encontrada' });
  }
  
  res.json({ success: true });
});

// Función para verificar y crear alertas automáticamente
// Se exporta para usarla desde otros módulos
function verificarYCrearAlertas(id_producto) {
  const UMBRAL_DEFAULT = 5;
  
  const producto = db.prepare('SELECT * FROM Producto WHERE id_producto = ?').get(id_producto);
  
  if (!producto) return;
  
  // Si el stock está por debajo del umbral
  if (producto.stock <= UMBRAL_DEFAULT) {
    // Verificar si ya existe una alerta activa para este producto
    const alertaExistente = db.prepare(
      'SELECT * FROM AlertaStock WHERE id_producto = ? AND estado = ?'
    ).get(id_producto, 'activo');
    
    if (!alertaExistente) {
      // Crear nueva alerta
      db.prepare(`
        INSERT INTO AlertaStock (umbral_minimo, stock_actual, estado, id_producto)
        VALUES (?, ?, 'activo', ?)
      `).run(UMBRAL_DEFAULT, producto.stock, id_producto);
    } else {
      // Actualizar stock_actual de la alerta existente
      db.prepare(
        'UPDATE AlertaStock SET stock_actual = ? WHERE id_alerta = ?'
      ).run(producto.stock, alertaExistente.id_alerta);
    }
  } else {
    // Si el stock está sobre el umbral, resolver alertas activas
    db.prepare(
      'UPDATE AlertaStock SET estado = ? WHERE id_producto = ? AND estado = ?'
    ).run('resuelto', id_producto, 'activo');
  }
}

module.exports = router;
module.exports.verificarYCrearAlertas = verificarYCrearAlertas;
