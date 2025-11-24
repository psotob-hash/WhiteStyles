# WhiteStyles — Sistema de Gestión Completo

Sistema integral de gestión para la tienda de pantalones WhiteStyles, con base de datos local SQLite para demostración al cliente antes de implementar una BD en producción.

## 🎯 Características Principales

### Autenticación y Seguridad
- Sistema de login/registro con JWT
- Contraseñas hasheadas con bcrypt (10 rounds)
- 3 roles con permisos diferenciados:
  - **Admin**: Acceso total al sistema
  - **Operador de ventas**: Gestión de ventas y clientes
  - **Inventario**: Gestión de productos y stock

### Gestión de Productos
- CRUD completo de productos (Crear, Leer, Actualizar, Eliminar)
- Control de stock en tiempo real
- Vinculación con proveedores
- Búsqueda por SKU o nombre
- Botón "Cancelar" para deshacer ediciones accidentales

### Gestión de Proveedores
- CRUD completo de proveedores
- Relación con productos
- Información de contacto (teléfono, email)

### Sistema de Ventas
- Registro completo de ventas
- Gestión de clientes (RUT, nombre, contacto)
- Búsqueda de productos por SKU/nombre
- Múltiples productos por venta
- Descuentos por producto
- Métodos de pago: efectivo, tarjeta, transferencia
- Actualización automática de stock
- Historial completo de ventas
- Detalle de cada venta con productos

### Alertas Inteligentes
- **Pop-ups automáticos** cuando hay productos con stock bajo (≤ 5 unidades)
- Botón "Ir a Productos" para solución rápida
- Gestión de alertas en tabla `AlertaStock`
- Resolución manual de alertas
- Alertas se crean/actualizan automáticamente al modificar stock

### Sistema de Reportes
- **Reporte de Ventas**:
  - Filtrado por rango de fechas
  - Total de ventas, ingresos totales, ticket promedio
  - Venta mínima y máxima
  - Detalle completo de todas las ventas
  - **Descarga en CSV** para análisis externo
- Estadísticas en tiempo real

### Panel de Administración (Solo Admin)
- Gestión completa de usuarios
- Crear/editar/eliminar operadores
- Asignación de roles
- Control de accesos

## 📋 Requisitos

- Node.js >= 14
- Navegador moderno (Chrome, Firefox, Edge)

## 📱 Guía de Uso

<<<<<<< HEAD
### Primera Vez

1. **Iniciar sesión**
   - Ingresa tu usuario y contraseña
   - Click en "Ingresar"

### Flujo de Trabajo Recomendado

=======
>>>>>>> 579e341d880b9927a77b8388353e37fcc3bafc91
1. **Configuración inicial (Admin)**
   - Tab **Proveedores**: Crear proveedores
   - Tab **Productos**: Crear catálogo de productos
   - Tab **Usuarios**: Crear operadores de ventas

2. **Operación diaria**
   - Tab **Ventas**: Registrar ventas del día
   - Tab **Alertas**: Revisar productos con stock bajo
   - Tab **Productos**: Actualizar stock cuando lleguen pedidos

3. **Análisis y reportes**
   - Tab **Reportes**: Generar reportes de ventas
   - Descargar CSV para análisis en Excel

### Funcionalidades Clave

#### Registrar una Venta
1. Ir a tab "Ventas"
2. Buscar cliente por RUT (o crear nuevo)
3. Buscar productos por SKU o nombre
4. Agregar productos a la venta
5. Ajustar cantidades y descuentos
6. Seleccionar método de pago
7. Click "Registrar Venta"

#### Gestionar Alertas
- **Pop-ups automáticos**: Aparecen al iniciar sesión si hay stock bajo
- Click "Ir a Productos" para resolver directamente
- Tab "Alertas": Ver todas las alertas activas
- Click "Resolver" cuando se reabastezca el producto

#### Generar Reportes
1. Tab "Reportes"
2. Seleccionar rango de fechas (opcional)
3. Click "Generar Reporte"
4. Revisar estadísticas y detalle
5. Click "Descargar CSV" para exportar

## 🔌 API Endpoints

### Autenticación
- `POST /api/auth/register` — Registrar usuario
- `POST /api/auth/login` — Login (retorna JWT)
- `GET /api/auth/verify` — Verificar token

### Productos
- `GET /api/productos` — Listar todos
- `GET /api/productos/:id` — Obtener por ID
- `POST /api/productos` — Crear (genera alertas automáticamente)
- `PUT /api/productos/:id` — Actualizar (actualiza alertas)
- `DELETE /api/productos/:id` — Eliminar

### Proveedores
- `GET /api/proveedores` — Listar todos
- `POST /api/proveedores` — Crear
- `PUT /api/proveedores/:id` — Actualizar
- `DELETE /api/proveedores/:id` — Eliminar

### Clientes
- `GET /api/clientes` — Listar todos
- `GET /api/clientes/rut/:rut` — Buscar por RUT
- `POST /api/clientes` — Crear
- `PUT /api/clientes/:id` — Actualizar
- `DELETE /api/clientes/:id` — Eliminar

### Ventas
- `GET /api/ventas` — Listar todas
- `GET /api/ventas/:id` — Detalle completo
- `POST /api/ventas` — Crear (actualiza stock y genera alertas)
- `GET /api/ventas/stats/summary` — Estadísticas

### Alertas
- `GET /api/alertas` — Listar alertas activas
- `PUT /api/alertas/:id/resolver` — Marcar como resuelta

### Usuarios (Solo Admin)
- `GET /api/usuarios` — Listar todos
- `POST /api/usuarios` — Crear
- `PUT /api/usuarios/:id` — Actualizar
- `DELETE /api/usuarios/:id` — Eliminar

### Reportes
- `GET /api/reportes/ventas?fecha_inicio=YYYY-MM-DD&fecha_fin=YYYY-MM-DD` — Reporte de ventas
- `GET /api/reportes/inventario` — Reporte de inventario
- `GET /api/reportes/proveedores` — Reporte de proveedores

## 🗄️ Base de Datos

- **Motor**: SQLite (sql.js) - 100% JavaScript, sin compilación nativa
- **Ubicación**: `db/data.db` (se crea automáticamente)
- **Esquema**: `db/init.sql` (se ejecuta en primera ejecución)
- **Datos de ejemplo**: 1 proveedor + 2 productos de prueba

### Tablas Implementadas
- `Usuario` — Usuarios del sistema
- `Producto` — Catálogo de productos (incluye campo `stock`)
- `Proveedor` — Proveedores
- `Cliente` — Clientes de la tienda
- `Venta` — Cabecera de ventas
- `DetalleVenta` — Productos vendidos en cada venta
- `AlertaStock` — Alertas de stock bajo
- `PedidoProveedor`, `DetallePedido`, `Reporte` (preparadas para futuras expansiones)

## 🔒 Seguridad

- JWT con expiración de 24 horas
- Tokens almacenados en localStorage del navegador
- Contraseñas nunca se almacenan en texto plano
- Middleware de verificación en rutas protegidas
- Control de roles a nivel de API y UI

## 🎨 Tecnologías Utilizadas

### Backend
- Node.js + Express
- SQLite (sql.js)
- bcryptjs (hashing de contraseñas)
- jsonwebtoken (autenticación)
- CORS habilitado

### Frontend
- HTML5 + JavaScript vanilla
- Bootstrap 5.3 (UI responsiva)
- Fetch API (comunicación con backend)
- Modales y notificaciones dinámicas
- chartjs

## 📊 Próximas Mejoras Sugeridas

- [ ] Módulo de pedidos a proveedores (`PedidoProveedor`)
- [✔] Gestión de devoluciones y cambios
- [✔] Dashboard con gráficos (Chart.js)
- [ ] Exportar reportes en PDF
- [✔] Sistema de categorías para productos
- [ ] Código de barras/QR para productos
- [ ] Integración con sistemas de pago
- [ ] Respaldo automático de base de datos
- [ ] Multi-sucursal
- [ ] App móvil (PWA)

<<<<<<< HEAD

=======
>>>>>>> 579e341d880b9927a77b8388353e37fcc3bafc91
## 📞 Soporte

Para reportar problemas o sugerencias, contactar al equipo de desarrollo.
