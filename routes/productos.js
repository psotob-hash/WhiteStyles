const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { verificarYCrearAlertas } = require('./alertas');

// Listar todos los productos
router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM Producto ORDER BY id_producto DESC').all();
  res.json(rows);
});

// Obtener un producto por id
router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  const row = db.prepare('SELECT * FROM Producto WHERE id_producto = ?').get(id);
  if (!row) return res.status(404).json({ error: 'Producto no encontrado' });
  res.json(row);
});

// Crear producto
router.post('/', (req, res) => {
  const { nombre, SKU, talla, color, precio_venta, stock, id_proveedor } = req.body;
  try {
    const stmt = db.prepare('INSERT INTO Producto (nombre, SKU, talla, color, precio_venta, stock, id_proveedor) VALUES (?,?,?,?,?,?,?)');
    const info = stmt.run(nombre, SKU, talla, color, precio_venta, stock || 0, id_proveedor);
    const nuevo = db.prepare('SELECT * FROM Producto WHERE id_producto = ?').get(info.lastInsertRowid);
    
    // Verificar y crear alerta si es necesario
    verificarYCrearAlertas(info.lastInsertRowid);
    
    res.status(201).json(nuevo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Actualizar producto
router.put('/:id', (req, res) => {
  const id = Number(req.params.id);
  const { nombre, SKU, talla, color, precio_venta, stock, id_proveedor } = req.body;
  try {
    const stmt = db.prepare('UPDATE Producto SET nombre=?, SKU=?, talla=?, color=?, precio_venta=?, stock=?, id_proveedor=? WHERE id_producto=?');
    const info = stmt.run(nombre, SKU, talla, color, precio_venta, stock || 0, id_proveedor, id);
    if (info.changes === 0) return res.status(404).json({ error: 'Producto no encontrado' });
    const updated = db.prepare('SELECT * FROM Producto WHERE id_producto = ?').get(id);
    
    // Verificar y actualizar alertas
    verificarYCrearAlertas(id);
    
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Borrar producto
router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  const info = db.prepare('DELETE FROM Producto WHERE id_producto = ?').run(id);
  if (info.changes === 0) return res.status(404).json({ error: 'Producto no encontrado' });
  res.json({ success: true });
});

module.exports = router;
