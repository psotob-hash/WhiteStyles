-- Ventas de ejemplo para visualización en el dashboard
-- Distribuidas en los últimos 90 días

-- Ventas hace 85-90 días
INSERT INTO Venta (fecha_venta, total_venta, metodo_pago, id_cliente) 
VALUES (datetime('now', '-87 days'), 89970, 'efectivo', 1);
INSERT INTO DetalleVenta (cantidad_vendida, precio_unitario_venta, descuento_aplicado, id_venta, id_producto) 
VALUES (3, 29990, 0, last_insert_rowid(), 1);

INSERT INTO Venta (fecha_venta, total_venta, metodo_pago, id_cliente) 
VALUES (datetime('now', '-85 days'), 62980, 'tarjeta', 2);
INSERT INTO DetalleVenta (cantidad_vendida, precio_unitario_venta, descuento_aplicado, id_venta, id_producto) 
VALUES (2, 31990, 0, last_insert_rowid(), 5);

-- Ventas hace 75-80 días
INSERT INTO Venta (fecha_venta, total_venta, metodo_pago, id_cliente) 
VALUES (datetime('now', '-78 days'), 104970, 'transferencia', 1);
INSERT INTO DetalleVenta (cantidad_vendida, precio_unitario_venta, descuento_aplicado, id_venta, id_producto) 
VALUES (3, 34990, 0, last_insert_rowid(), 2);

INSERT INTO Venta (fecha_venta, total_venta, metodo_pago, id_cliente) 
VALUES (datetime('now', '-76 days'), 77980, 'efectivo', 3);
INSERT INTO DetalleVenta (cantidad_vendida, precio_unitario_venta, descuento_aplicado, id_venta, id_producto) 
VALUES (2, 38990, 0, last_insert_rowid(), 4);

INSERT INTO Venta (fecha_venta, total_venta, metodo_pago, id_cliente) 
VALUES (datetime('now', '-75 days'), 51980, 'tarjeta', 2);
INSERT INTO DetalleVenta (cantidad_vendida, precio_unitario_venta, descuento_aplicado, id_venta, id_producto) 
VALUES (2, 25990, 0, last_insert_rowid(), 8);

-- Ventas hace 60-70 días
INSERT INTO Venta (fecha_venta, total_venta, metodo_pago, id_cliente) 
VALUES (datetime('now', '-68 days'), 92970, 'efectivo', 1);
INSERT INTO DetalleVenta (cantidad_vendida, precio_unitario_venta, descuento_aplicado, id_venta, id_producto) 
VALUES (3, 30990, 0, last_insert_rowid(), 7);

INSERT INTO Venta (fecha_venta, total_venta, metodo_pago, id_cliente) 
VALUES (datetime('now', '-65 days'), 98970, 'tarjeta', 3);
INSERT INTO DetalleVenta (cantidad_vendida, precio_unitario_venta, descuento_aplicado, id_venta, id_producto) 
VALUES (3, 32990, 0, last_insert_rowid(), 3);

INSERT INTO Venta (fecha_venta, total_venta, metodo_pago, id_cliente) 
VALUES (datetime('now', '-62 days'), 55980, 'transferencia', 2);
INSERT INTO DetalleVenta (cantidad_vendida, precio_unitario_venta, descuento_aplicado, id_venta, id_producto) 
VALUES (2, 27990, 0, last_insert_rowid(), 6);

-- Ventas hace 45-55 días
INSERT INTO Venta (fecha_venta, total_venta, metodo_pago, id_cliente) 
VALUES (datetime('now', '-52 days'), 116970, 'efectivo', 1);
INSERT INTO DetalleVenta (cantidad_vendida, precio_unitario_venta, descuento_aplicado, id_venta, id_producto) 
VALUES (3, 38990, 0, last_insert_rowid(), 4);

INSERT INTO Venta (fecha_venta, total_venta, metodo_pago, id_cliente) 
VALUES (datetime('now', '-50 days'), 89970, 'tarjeta', 2);
INSERT INTO DetalleVenta (cantidad_vendida, precio_unitario_venta, descuento_aplicado, id_venta, id_producto) 
VALUES (3, 29990, 0, last_insert_rowid(), 1);

INSERT INTO Venta (fecha_venta, total_venta, metodo_pago, id_cliente) 
VALUES (datetime('now', '-48 days'), 64980, 'efectivo', 3);
INSERT INTO DetalleVenta (cantidad_vendida, precio_unitario_venta, descuento_aplicado, id_venta, id_producto) 
VALUES (2, 32990, 0, last_insert_rowid(), 3);

INSERT INTO Venta (fecha_venta, total_venta, metodo_pago, id_cliente) 
VALUES (datetime('now', '-45 days'), 95980, 'transferencia', 1);
INSERT INTO DetalleVenta (cantidad_vendida, precio_unitario_venta, descuento_aplicado, id_venta, id_producto) 
VALUES (3, 31990, 0, last_insert_rowid(), 5);

-- Ventas hace 30-40 días
INSERT INTO Venta (fecha_venta, total_venta, metodo_pago, id_cliente) 
VALUES (datetime('now', '-38 days'), 104970, 'tarjeta', 2);
INSERT INTO DetalleVenta (cantidad_vendida, precio_unitario_venta, descuento_aplicado, id_venta, id_producto) 
VALUES (3, 34990, 0, last_insert_rowid(), 2);

INSERT INTO Venta (fecha_venta, total_venta, metodo_pago, id_cliente) 
VALUES (datetime('now', '-35 days'), 77980, 'efectivo', 3);
INSERT INTO DetalleVenta (cantidad_vendida, precio_unitario_venta, descuento_aplicado, id_venta, id_producto) 
VALUES (2, 38990, 0, last_insert_rowid(), 4);

INSERT INTO Venta (fecha_venta, total_venta, metodo_pago, id_cliente) 
VALUES (datetime('now', '-33 days'), 92970, 'transferencia', 1);
INSERT INTO DetalleVenta (cantidad_vendida, precio_unitario_venta, descuento_aplicado, id_venta, id_producto) 
VALUES (3, 30990, 0, last_insert_rowid(), 7);

INSERT INTO Venta (fecha_venta, total_venta, metodo_pago, id_cliente) 
VALUES (datetime('now', '-30 days'), 51980, 'tarjeta', 2);
INSERT INTO DetalleVenta (cantidad_vendida, precio_unitario_venta, descuento_aplicado, id_venta, id_producto) 
VALUES (2, 25990, 0, last_insert_rowid(), 8);

-- Ventas hace 20-28 días
INSERT INTO Venta (fecha_venta, total_venta, metodo_pago, id_cliente) 
VALUES (datetime('now', '-26 days'), 89970, 'efectivo', 1);
INSERT INTO DetalleVenta (cantidad_vendida, precio_unitario_venta, descuento_aplicado, id_venta, id_producto) 
VALUES (3, 29990, 0, last_insert_rowid(), 1);

INSERT INTO Venta (fecha_venta, total_venta, metodo_pago, id_cliente) 
VALUES (datetime('now', '-24 days'), 98970, 'tarjeta', 3);
INSERT INTO DetalleVenta (cantidad_vendida, precio_unitario_venta, descuento_aplicado, id_venta, id_producto) 
VALUES (3, 32990, 0, last_insert_rowid(), 3);

INSERT INTO Venta (fecha_venta, total_venta, metodo_pago, id_cliente) 
VALUES (datetime('now', '-22 days'), 116970, 'transferencia', 2);
INSERT INTO DetalleVenta (cantidad_vendida, precio_unitario_venta, descuento_aplicado, id_venta, id_producto) 
VALUES (3, 38990, 0, last_insert_rowid(), 4);

INSERT INTO Venta (fecha_venta, total_venta, metodo_pago, id_cliente) 
VALUES (datetime('now', '-20 days'), 63980, 'efectivo', 1);
INSERT INTO DetalleVenta (cantidad_vendida, precio_unitario_venta, descuento_aplicado, id_venta, id_producto) 
VALUES (2, 31990, 0, last_insert_rowid(), 5);

-- Ventas hace 10-18 días
INSERT INTO Venta (fecha_venta, total_venta, metodo_pago, id_cliente) 
VALUES (datetime('now', '-17 days'), 104970, 'tarjeta', 2);
INSERT INTO DetalleVenta (cantidad_vendida, precio_unitario_venta, descuento_aplicado, id_venta, id_producto) 
VALUES (3, 34990, 0, last_insert_rowid(), 2);

INSERT INTO Venta (fecha_venta, total_venta, metodo_pago, id_cliente) 
VALUES (datetime('now', '-15 days'), 92970, 'efectivo', 3);
INSERT INTO DetalleVenta (cantidad_vendida, precio_unitario_venta, descuento_aplicado, id_venta, id_producto) 
VALUES (3, 30990, 0, last_insert_rowid(), 7);

INSERT INTO Venta (fecha_venta, total_venta, metodo_pago, id_cliente) 
VALUES (datetime('now', '-13 days'), 77980, 'transferencia', 1);
INSERT INTO DetalleVenta (cantidad_vendida, precio_unitario_venta, descuento_aplicado, id_venta, id_producto) 
VALUES (2, 38990, 0, last_insert_rowid(), 4);

INSERT INTO Venta (fecha_venta, total_venta, metodo_pago, id_cliente) 
VALUES (datetime('now', '-11 days'), 55980, 'tarjeta', 2);
INSERT INTO DetalleVenta (cantidad_vendida, precio_unitario_venta, descuento_aplicado, id_venta, id_producto) 
VALUES (2, 27990, 0, last_insert_rowid(), 6);

INSERT INTO Venta (fecha_venta, total_venta, metodo_pago, id_cliente) 
VALUES (datetime('now', '-10 days'), 98970, 'efectivo', 3);
INSERT INTO DetalleVenta (cantidad_vendida, precio_unitario_venta, descuento_aplicado, id_venta, id_producto) 
VALUES (3, 32990, 0, last_insert_rowid(), 3);

-- Ventas última semana
INSERT INTO Venta (fecha_venta, total_venta, metodo_pago, id_cliente) 
VALUES (datetime('now', '-7 days'), 89970, 'transferencia', 1);
INSERT INTO DetalleVenta (cantidad_vendida, precio_unitario_venta, descuento_aplicado, id_venta, id_producto) 
VALUES (3, 29990, 0, last_insert_rowid(), 1);

INSERT INTO Venta (fecha_venta, total_venta, metodo_pago, id_cliente) 
VALUES (datetime('now', '-6 days'), 116970, 'tarjeta', 2);
INSERT INTO DetalleVenta (cantidad_vendida, precio_unitario_venta, descuento_aplicado, id_venta, id_producto) 
VALUES (3, 38990, 0, last_insert_rowid(), 4);

INSERT INTO Venta (fecha_venta, total_venta, metodo_pago, id_cliente) 
VALUES (datetime('now', '-5 days'), 104970, 'efectivo', 3);
INSERT INTO DetalleVenta (cantidad_vendida, precio_unitario_venta, descuento_aplicado, id_venta, id_producto) 
VALUES (3, 34990, 0, last_insert_rowid(), 2);

INSERT INTO Venta (fecha_venta, total_venta, metodo_pago, id_cliente) 
VALUES (datetime('now', '-4 days'), 64980, 'transferencia', 1);
INSERT INTO DetalleVenta (cantidad_vendida, precio_unitario_venta, descuento_aplicado, id_venta, id_producto) 
VALUES (2, 32990, 0, last_insert_rowid(), 3);

INSERT INTO Venta (fecha_venta, total_venta, metodo_pago, id_cliente) 
VALUES (datetime('now', '-3 days'), 92970, 'tarjeta', 2);
INSERT INTO DetalleVenta (cantidad_vendida, precio_unitario_venta, descuento_aplicado, id_venta, id_producto) 
VALUES (3, 30990, 0, last_insert_rowid(), 7);

INSERT INTO Venta (fecha_venta, total_venta, metodo_pago, id_cliente) 
VALUES (datetime('now', '-2 days'), 77980, 'efectivo', 3);
INSERT INTO DetalleVenta (cantidad_vendida, precio_unitario_venta, descuento_aplicado, id_venta, id_producto) 
VALUES (2, 38990, 0, last_insert_rowid(), 4);

INSERT INTO Venta (fecha_venta, total_venta, metodo_pago, id_cliente) 
VALUES (datetime('now', '-1 days'), 95980, 'transferencia', 1);
INSERT INTO DetalleVenta (cantidad_vendida, precio_unitario_venta, descuento_aplicado, id_venta, id_producto) 
VALUES (3, 31990, 0, last_insert_rowid(), 5);

-- Ventas de hoy
INSERT INTO Venta (fecha_venta, total_venta, metodo_pago, id_cliente) 
VALUES (datetime('now'), 104970, 'tarjeta', 2);
INSERT INTO DetalleVenta (cantidad_vendida, precio_unitario_venta, descuento_aplicado, id_venta, id_producto) 
VALUES (3, 34990, 0, last_insert_rowid(), 2);

INSERT INTO Venta (fecha_venta, total_venta, metodo_pago, id_cliente) 
VALUES (datetime('now'), 89970, 'efectivo', 3);
INSERT INTO DetalleVenta (cantidad_vendida, precio_unitario_venta, descuento_aplicado, id_venta, id_producto) 
VALUES (3, 29990, 0, last_insert_rowid(), 1);
