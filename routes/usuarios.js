const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../db/database');
const { verificarToken, verificarRol } = require('./auth');

// Listar todos los usuarios (solo admin)
router.get('/', verificarToken, verificarRol('admin'), (req, res) => {
  const rows = db.prepare('SELECT id_usuario, nombre_usuario, RUT, email, telefono, rol FROM Usuario ORDER BY id_usuario DESC').all();
  res.json(rows);
});

// Obtener usuario por id (solo admin)
router.get('/:id', verificarToken, verificarRol('admin'), (req, res) => {
  const id = Number(req.params.id);
  const row = db.prepare('SELECT id_usuario, nombre_usuario, RUT, email, telefono, rol FROM Usuario WHERE id_usuario = ?').get(id);
  if (!row) return res.status(404).json({ error: 'Usuario no encontrado' });
  res.json(row);
});

// Crear usuario (solo admin)
router.post('/', verificarToken, verificarRol('admin'), async (req, res) => {
  const { nombre_usuario, RUT, email, contrasena, telefono, rol } = req.body;
  
  if (!['admin', 'operador de ventas', 'inventario'].includes(rol)) {
    return res.status(400).json({ error: 'Rol inválido' });
  }
  
  try {
    const hash = await bcrypt.hash(contrasena, 10);
    const stmt = db.prepare('INSERT INTO Usuario (nombre_usuario, RUT, email, contrasena, telefono, rol) VALUES (?,?,?,?,?,?)');
    const info = stmt.run(nombre_usuario, RUT, email, hash, telefono || null, rol);
    const nuevo = db.prepare('SELECT id_usuario, nombre_usuario, RUT, email, telefono, rol FROM Usuario WHERE id_usuario = ?').get(info.lastInsertRowid);
    res.status(201).json(nuevo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Actualizar usuario (solo admin)
router.put('/:id', verificarToken, verificarRol('admin'), async (req, res) => {
  const id = Number(req.params.id);
  const { nombre_usuario, RUT, email, contrasena, telefono, rol } = req.body;
  
  if (!['admin', 'operador de ventas', 'inventario'].includes(rol)) {
    return res.status(400).json({ error: 'Rol inválido' });
  }
  
  try {
    let sql, params;
    
    if (contrasena) {
      const hash = await bcrypt.hash(contrasena, 10);
      sql = 'UPDATE Usuario SET nombre_usuario=?, RUT=?, email=?, contrasena=?, telefono=?, rol=? WHERE id_usuario=?';
      params = [nombre_usuario, RUT, email, hash, telefono || null, rol, id];
    } else {
      sql = 'UPDATE Usuario SET nombre_usuario=?, RUT=?, email=?, telefono=?, rol=? WHERE id_usuario=?';
      params = [nombre_usuario, RUT, email, telefono || null, rol, id];
    }
    
    const stmt = db.prepare(sql);
    const info = stmt.run(...params);
    
    if (info.changes === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    const updated = db.prepare('SELECT id_usuario, nombre_usuario, RUT, email, telefono, rol FROM Usuario WHERE id_usuario = ?').get(id);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Borrar usuario (solo admin)
router.delete('/:id', verificarToken, verificarRol('admin'), (req, res) => {
  const id = Number(req.params.id);
  try {
    const info = db.prepare('DELETE FROM Usuario WHERE id_usuario = ?').run(id);
    if (info.changes === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
