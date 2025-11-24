const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Rutas API
app.use('/api/auth', require('./routes/auth'));
app.use('/api/productos', require('./routes/productos'));
app.use('/api/proveedores', require('./routes/proveedores'));
app.use('/api/alertas', require('./routes/alertas'));
app.use('/api/clientes', require('./routes/clientes'));
app.use('/api/ventas', require('./routes/ventas'));
app.use('/api/usuarios', require('./routes/usuarios'));
app.use('/api/reportes', require('./routes/reportes'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Endpoint legacy de alertas por umbral (mantener compatibilidad)
const db = require('./db/database');
app.get('/api/stock-alerts', (req, res) => {
  const umbral = Number(req.query.umbral || 5);
  const rows = db.prepare('SELECT id_producto, nombre, SKU, stock FROM Producto WHERE stock <= ? ORDER BY stock ASC').all(umbral);
  res.json(rows);
});

// Servir frontend estático
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n========================================`);
  console.log(`WhiteStyles - Sistema de Gestión`);
  console.log(`========================================`);
  console.log(`Servidor corriendo en:`);
  console.log(`  Local:   http://localhost:${PORT}`);
  console.log(`  Red:     http://192.168.100.120:${PORT}`);
  console.log(`========================================\n`);
});
