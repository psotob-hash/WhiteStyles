// Script para insertar ventas de ejemplo en la base de datos
const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

async function insertarVentasEjemplo() {
  try {
    // Inicializar sql.js
    const SQL = await initSqlJs();
    
    // Leer la base de datos existente
    const dbPath = path.join(__dirname, 'db', 'data.db');
    const buffer = fs.readFileSync(dbPath);
    const db = new SQL.Database(buffer);
    
    // Leer el script SQL de ventas
    const sqlScript = fs.readFileSync(path.join(__dirname, 'db', 'insert_ventas_ejemplo.sql'), 'utf8');
    
    // Ejecutar el script
    db.run(sqlScript);
    
    // Guardar los cambios
    const data = db.export();
    fs.writeFileSync(dbPath, data);
    
    console.log('✅ Ventas de ejemplo insertadas exitosamente!');
    console.log('📊 Se agregaron 36 ventas distribuidas en los últimos 90 días');
    console.log('💰 Total aproximado en ventas: $3,200,000 CLP');
    
    db.close();
  } catch (error) {
    console.error('❌ Error al insertar ventas:', error);
  }
}

insertarVentasEjemplo();
