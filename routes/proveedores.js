const express = require('express');
const router = express.Router();
const db = require('../db/database');

// Listar todos los proveedores
router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM Proveedor ORDER BY id_proveedor DESC').all();
  res.json(rows);
});

// Obtener proveedor por id
router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  const row = db.prepare('SELECT * FROM Proveedor WHERE id_proveedor = ?').get(id);
  if (!row) return res.status(404).json({ error: 'Proveedor no encontrado' });
  res.json(row);
});

// Crear proveedor
router.post('/', (req, res) => {
  const { nombre, telefono, email } = req.body;
  try {
    const stmt = db.prepare('INSERT INTO Proveedor (nombre, telefono, email) VALUES (?,?,?)');
    const info = stmt.run(nombre, telefono, email);
    const nuevo = db.prepare('SELECT * FROM Proveedor WHERE id_proveedor = ?').get(info.lastInsertRowid);
    res.status(201).json(nuevo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Actualizar proveedor
router.put('/:id', (req, res) => {
  const id = Number(req.params.id);
  const { nombre, telefono, email } = req.body;
  try {
    const stmt = db.prepare('UPDATE Proveedor SET nombre=?, telefono=?, email=? WHERE id_proveedor=?');
    const info = stmt.run(nombre, telefono, email, id);
    if (info.changes === 0) return res.status(404).json({ error: 'Proveedor no encontrado' });
    const updated = db.prepare('SELECT * FROM Proveedor WHERE id_proveedor = ?').get(id);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Borrar proveedor
router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  try {
    const info = db.prepare('DELETE FROM Proveedor WHERE id_proveedor = ?').run(id);
    if (info.changes === 0) return res.status(404).json({ error: 'Proveedor no encontrado' });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: 'No se puede borrar proveedor con productos asociados' });
  }
});

module.exports = router;
