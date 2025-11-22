const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/database');

const JWT_SECRET = process.env.JWT_SECRET || 'whitestyles-secret-dev-2024';

// Registro de usuario
router.post('/register', async (req, res) => {
  const { nombre_usuario, RUT, email, contrasena, telefono, rol } = req.body;
  
  if (!nombre_usuario || !RUT || !email || !contrasena || !rol) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }

  if (!['admin', 'operador de ventas', 'inventario'].includes(rol)) {
    return res.status(400).json({ error: 'Rol inválido' });
  }

  try {
    const hash = await bcrypt.hash(contrasena, 10);
    const stmt = db.prepare('INSERT INTO Usuario (nombre_usuario, RUT, email, contrasena, telefono, rol) VALUES (?,?,?,?,?,?)');
    const info = stmt.run(nombre_usuario, RUT, email, hash, telefono || null, rol);
    
    const usuario = db.prepare('SELECT id_usuario, nombre_usuario, RUT, email, telefono, rol FROM Usuario WHERE id_usuario = ?').get(info.lastInsertRowid);
    res.status(201).json({ success: true, usuario });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { nombre_usuario, contrasena } = req.body;
  
  if (!nombre_usuario || !contrasena) {
    return res.status(400).json({ error: 'Faltan credenciales' });
  }

  try {
    const usuario = db.prepare('SELECT * FROM Usuario WHERE nombre_usuario = ?').get(nombre_usuario);
    
    if (!usuario) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const valido = await bcrypt.compare(contrasena, usuario.contrasena);
    
    if (!valido) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { id_usuario: usuario.id_usuario, rol: usuario.rol },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      usuario: {
        id_usuario: usuario.id_usuario,
        nombre_usuario: usuario.nombre_usuario,
        email: usuario.email,
        rol: usuario.rol
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Verificar token (middleware exportable)
const verificarToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};

// Middleware para verificar rol
const verificarRol = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({ error: 'No tienes permisos para esta acción' });
    }
    next();
  };
};

router.get('/verify', verificarToken, (req, res) => {
  try {
    const usuario = db.prepare('SELECT id_usuario, nombre_usuario, RUT, email, telefono, rol FROM Usuario WHERE id_usuario = ?').get(req.usuario.id_usuario);
    
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    res.json(usuario);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
module.exports.verificarToken = verificarToken;
module.exports.verificarRol = verificarRol;
