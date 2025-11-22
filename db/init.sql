-- Esquema adaptado para SQLite. Añadí columna `stock` en Producto para control de inventario local.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS Proveedor (
  id_proveedor INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  telefono TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS Producto (
  id_producto INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  SKU TEXT UNIQUE NOT NULL,
  talla TEXT NOT NULL,
  color TEXT NOT NULL,
  precio_venta INTEGER NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  id_proveedor INTEGER NOT NULL,
  FOREIGN KEY (id_proveedor) REFERENCES Proveedor(id_proveedor)
);

CREATE TABLE IF NOT EXISTS AlertaStock (
  id_alerta INTEGER PRIMARY KEY AUTOINCREMENT,
  umbral_minimo INTEGER NOT NULL,
  stock_actual INTEGER NOT NULL,
  fecha_creacion DATETIME DEFAULT (datetime('now')),
  estado TEXT NOT NULL CHECK (estado IN ('activo','resuelto')),
  id_producto INTEGER NOT NULL,
  FOREIGN KEY (id_producto) REFERENCES Producto(id_producto)
);

CREATE TABLE IF NOT EXISTS PedidoProveedor (
  id_pedido_proveedor INTEGER PRIMARY KEY AUTOINCREMENT,
  fecha_pedido DATETIME DEFAULT (datetime('now')),
  estado TEXT NOT NULL CHECK (estado IN ('pendiente','recibido','cancelado')),
  costo_total INTEGER NOT NULL,
  id_proveedor INTEGER NOT NULL,
  FOREIGN KEY (id_proveedor) REFERENCES Proveedor(id_proveedor)
);

CREATE TABLE IF NOT EXISTS DetallePedido (
  id_detalle INTEGER PRIMARY KEY AUTOINCREMENT,
  cantidad_solicitada INTEGER NOT NULL,
  precio_unitario_compra INTEGER NOT NULL,
  id_pedido_proveedor INTEGER NOT NULL,
  id_producto INTEGER NOT NULL,
  FOREIGN KEY (id_pedido_proveedor) REFERENCES PedidoProveedor(id_pedido_proveedor),
  FOREIGN KEY (id_producto) REFERENCES Producto(id_producto)
);

CREATE TABLE IF NOT EXISTS Cliente (
  id_cliente INTEGER PRIMARY KEY AUTOINCREMENT,
  RUT TEXT NOT NULL UNIQUE,
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  telefono TEXT,
  email TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS Venta (
  id_venta INTEGER PRIMARY KEY AUTOINCREMENT,
  fecha_venta DATETIME DEFAULT (datetime('now')),
  total_venta INTEGER NOT NULL,
  metodo_pago TEXT NOT NULL CHECK (metodo_pago IN ('efectivo','tarjeta','transferencia')),
  id_cliente INTEGER NOT NULL,
  FOREIGN KEY (id_cliente) REFERENCES Cliente(id_cliente)
);

CREATE TABLE IF NOT EXISTS DetalleVenta (
  id_detalle_venta INTEGER PRIMARY KEY AUTOINCREMENT,
  cantidad_vendida INTEGER NOT NULL,
  precio_unitario_venta INTEGER NOT NULL,
  descuento_aplicado INTEGER DEFAULT 0,
  id_venta INTEGER NOT NULL,
  id_producto INTEGER NOT NULL,
  FOREIGN KEY (id_venta) REFERENCES Venta(id_venta),
  FOREIGN KEY (id_producto) REFERENCES Producto(id_producto)
);

CREATE TABLE IF NOT EXISTS Usuario (
  id_usuario INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre_usuario TEXT NOT NULL UNIQUE,
  RUT TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  contrasena TEXT NOT NULL,
  telefono TEXT,
  rol TEXT NOT NULL CHECK (rol IN ('admin','operador de ventas','inventario'))
);

CREATE TABLE IF NOT EXISTS Reporte (
  id_reporte INTEGER PRIMARY KEY AUTOINCREMENT,
  tipo_reporte TEXT NOT NULL CHECK (tipo_reporte IN ('ventas','inventario','proveedores')),
  fecha_generacion DATETIME DEFAULT (datetime('now')),
  estado_reporte TEXT NOT NULL CHECK (estado_reporte IN ('generado','en proceso','error')),
  id_usuario INTEGER NOT NULL,
  FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario)
);

-- Datos de ejemplo (opcional)
-- Proveedores
INSERT OR IGNORE INTO Proveedor (id_proveedor, nombre, telefono, email) VALUES (1,'Textiles Santiago SpA','+56223456789','ventas@textiles-stgo.cl');
INSERT OR IGNORE INTO Proveedor (id_proveedor, nombre, telefono, email) VALUES (2,'Importadora Fashion Ltda','+56987654321','contacto@importfashion.cl');
INSERT OR IGNORE INTO Proveedor (id_proveedor, nombre, telefono, email) VALUES (3,'Distribuidora Denim Chile','+56912345678','pedidos@denimchile.cl');
INSERT OR IGNORE INTO Proveedor (id_proveedor, nombre, telefono, email) VALUES (4,'Confecciones Premium SA','+56998877665','info@confecpremium.cl');

-- Productos
INSERT OR IGNORE INTO Producto (id_producto, nombre, SKU, talla, color, precio_venta, stock, id_proveedor) VALUES (1,'Pantalón Classic Fit','WS-CL-001','M','Negro',29990,12,1);
INSERT OR IGNORE INTO Producto (id_producto, nombre, SKU, talla, color, precio_venta, stock, id_proveedor) VALUES (2,'Pantalón Skinny Fit','WS-SK-002','S','Azul Oscuro',34990,3,2);
INSERT OR IGNORE INTO Producto (id_producto, nombre, SKU, talla, color, precio_venta, stock, id_proveedor) VALUES (3,'Pantalón Slim Fit','WS-SL-003','L','Gris',32990,8,1);
INSERT OR IGNORE INTO Producto (id_producto, nombre, SKU, talla, color, precio_venta, stock, id_proveedor) VALUES (4,'Pantalón Cargo','WS-CG-004','XL','Verde Militar',38990,15,3);
INSERT OR IGNORE INTO Producto (id_producto, nombre, SKU, talla, color, precio_venta, stock, id_proveedor) VALUES (5,'Pantalón Chino','WS-CH-005','M','Beige',31990,4,4);
INSERT OR IGNORE INTO Producto (id_producto, nombre, SKU, talla, color, precio_venta, stock, id_proveedor) VALUES (6,'Pantalón Jogger','WS-JG-006','S','Negro',27990,2,2);
INSERT OR IGNORE INTO Producto (id_producto, nombre, SKU, talla, color, precio_venta, stock, id_proveedor) VALUES (7,'Pantalón Recto','WS-RT-007','L','Azul Claro',30990,20,1);
INSERT OR IGNORE INTO Producto (id_producto, nombre, SKU, talla, color, precio_venta, stock, id_proveedor) VALUES (8,'Pantalón Deportivo','WS-DP-008','M','Gris Oscuro',25990,10,3);

-- Clientes de muestra
INSERT OR IGNORE INTO Cliente (id_cliente, RUT, nombre, apellido, telefono, email) VALUES (1,'12345678-9','Juan','Pérez','+56912345678','juan.perez@email.com');
INSERT OR IGNORE INTO Cliente (id_cliente, RUT, nombre, apellido, telefono, email) VALUES (2,'98765432-1','María','González','+56987654321','maria.gonzalez@email.com');
INSERT OR IGNORE INTO Cliente (id_cliente, RUT, nombre, apellido, telefono, email) VALUES (3,'11223344-5','Pedro','Rodríguez','+56911223344','pedro.rodriguez@email.com');
