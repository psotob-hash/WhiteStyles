const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');

const DB_DIR = path.join(__dirname);
const DB_FILE = path.join(DB_DIR, 'data.db');
const INIT_SQL = path.join(DB_DIR, 'init.sql');

let db;
let dbInitialized = false;
let saveTimeout = null;

// Inicializar DB de forma síncrona al cargar el módulo
(async function initDatabase() {
  try {
    const SQL = await initSqlJs();
    
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }

    // Cargar DB existente o crear nueva
    if (fs.existsSync(DB_FILE)) {
      console.log('Loading existing database...');
      const buffer = fs.readFileSync(DB_FILE);
      db = new SQL.Database(buffer);
      console.log('Database loaded successfully');
    } else {
      console.log('Creating new database...');
      db = new SQL.Database();
      
      // Ejecutar esquema inicial
      const initSql = fs.readFileSync(INIT_SQL, 'utf8');
      db.exec(initSql);
      
      // Guardar DB
      saveDatabase();
      console.log('New database created and saved');
    }

    dbInitialized = true;
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
})();

function saveDatabase() {
  if (db && dbInitialized) {
    try {
      const data = db.export();
      const buffer = Buffer.from(data);
      fs.writeFileSync(DB_FILE, buffer);
      console.log('Database saved to disk');
    } catch (err) {
      console.error('Error saving database:', err);
    }
  }
}

// Guardar con debounce para evitar escrituras excesivas
function saveDatabaseDebounced() {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }
  saveTimeout = setTimeout(() => {
    saveDatabase();
  }, 100);
}

// Wrapper para prepare que auto-guarda después de cambios
class PreparedStatement {
  constructor(stmt, sql) {
    this.stmt = stmt;
    this.sql = sql;
  }

  run(...params) {
    if (!dbInitialized) {
      throw new Error('Database not ready yet');
    }
    
    try {
      this.stmt.bind(params);
      this.stmt.step();
      
      // Obtener información de la operación
      const changesResult = db.exec('SELECT changes() as changes');
      const changesCount = changesResult[0] ? changesResult[0].values[0][0] : 0;
      
      const lastIdResult = db.exec('SELECT last_insert_rowid() as id');
      const lastInsertRowid = lastIdResult[0] ? lastIdResult[0].values[0][0] : null;
      
      this.stmt.reset();
      
      // Auto-guardar después de modificaciones
      const sqlTrimmed = this.sql.trim().toUpperCase();
      if (sqlTrimmed.startsWith('INSERT') || sqlTrimmed.startsWith('UPDATE') || sqlTrimmed.startsWith('DELETE')) {
        saveDatabase(); // Guardar inmediatamente
      }
      
      return { changes: changesCount, lastInsertRowid };
    } catch (error) {
      this.stmt.reset();
      throw error;
    }
  }

  get(...params) {
    if (!dbInitialized) {
      throw new Error('Database not ready yet');
    }
    
    try {
      this.stmt.bind(params);
      const result = this.stmt.step() ? this.stmt.getAsObject() : null;
      this.stmt.reset();
      return result;
    } catch (error) {
      this.stmt.reset();
      throw error;
    }
  }

  all(...params) {
    if (!dbInitialized) {
      throw new Error('Database not ready yet');
    }
    
    try {
      this.stmt.bind(params);
      const results = [];
      while (this.stmt.step()) {
        results.push(this.stmt.getAsObject());
      }
      this.stmt.reset();
      return results;
    } catch (error) {
      this.stmt.reset();
      throw error;
    }
  }
}

// Interfaz compatible con better-sqlite3
const dbWrapper = {
  prepare(sql) {
    if (!dbInitialized) {
      throw new Error('Database not ready yet');
    }
    const stmt = db.prepare(sql);
    return new PreparedStatement(stmt, sql);
  },
  
  exec(sql) {
    if (!dbInitialized) {
      throw new Error('Database not ready yet');
    }
    db.exec(sql);
    saveDatabase();
  }
};

module.exports = dbWrapper;
