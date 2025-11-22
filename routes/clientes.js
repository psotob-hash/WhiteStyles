const express = require('express');
const router = express.Router();
const db = require('../db/database');

// Listar todos los clientes
router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM Cliente ORDER BY id_cliente DESC').all();
  res.json(rows);
});

// Obtener cliente por id
router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  const row = db.prepare('SELECT * FROM Cliente WHERE id_cliente = ?').get(id);
  if (!row) return res.status(404).json({ error: 'Cliente no encontrado' });
  res.json(row);
});

// Buscar cliente por RUT
router.get('/rut/:rut', (req, res) => {
  const row = db.prepare('SELECT * FROM Cliente WHERE RUT = ?').get(req.params.rut);
  if (!row) return res.status(404).json({ error: 'Cliente no encontrado' });
  res.json(row);
});

// Crear cliente
router.post('/', (req, res) => {
  const { RUT, nombre, apellido, telefono, email } = req.body;
  try {
    const stmt = db.prepare('INSERT INTO Cliente (RUT, nombre, apellido, telefono, email) VALUES (?,?,?,?,?)');
    const info = stmt.run(RUT, nombre, apellido, telefono || null, email);
    const nuevo = db.prepare('SELECT * FROM Cliente WHERE id_cliente = ?').get(info.lastInsertRowid);
    res.status(201).json(nuevo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Actualizar cliente
router.put('/:id', (req, res) => {
  const id = Number(req.params.id);
  const { RUT, nombre, apellido, telefono, email } = req.body;
  try {
    const stmt = db.prepare('UPDATE Cliente SET RUT=?, nombre=?, apellido=?, telefono=?, email=? WHERE id_cliente=?');
    const info = stmt.run(RUT, nombre, apellido, telefono || null, email, id);
    if (info.changes === 0) return res.status(404).json({ error: 'Cliente no encontrado' });
    const updated = db.prepare('SELECT * FROM Cliente WHERE id_cliente = ?').get(id);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Borrar cliente
router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  try {
    const info = db.prepare('DELETE FROM Cliente WHERE id_cliente = ?').run(id);
    if (info.changes === 0) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: 'No se puede borrar cliente con ventas asociadas' });
  }
});

module.exports = router;
