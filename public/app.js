// Estado de la aplicación
let token = localStorage.getItem('token');
let currentUser = null;
let productosVenta = [];
let clienteActual = null;
let reporteActual = null;

// API con autenticación
const api = {
  headers: () => ({ 
    'Content-Type': 'application/json', 
    ...(token && { 'Authorization': 'Bearer ' + token }) 
  }),
  
  // Auth
  login: (nombre_usuario, contrasena) => fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre_usuario, contrasena })
  }).then(r => r.json()),
  
  register: (data) => fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  
  // Productos
  productos: {
    list: () => fetch('/api/productos', { headers: api.headers() }).then(r => r.json()),
    get: (id) => fetch('/api/productos/' + id, { headers: api.headers() }).then(r => r.json()),
    create: (data) => fetch('/api/productos', { method: 'POST', headers: api.headers(), body: JSON.stringify(data) }).then(r => r.json()),
    update: (id, data) => fetch('/api/productos/' + id, { method: 'PUT', headers: api.headers(), body: JSON.stringify(data) }).then(r => r.json()),
    del: (id) => fetch('/api/productos/' + id, { method: 'DELETE', headers: api.headers() }).then(r => r.json())
  },
  
  // Proveedores
  proveedores: {
    list: () => fetch('/api/proveedores', { headers: api.headers() }).then(r => r.json()),
    get: (id) => fetch('/api/proveedores/' + id, { headers: api.headers() }).then(r => r.json()),
    create: (data) => fetch('/api/proveedores', { method: 'POST', headers: api.headers(), body: JSON.stringify(data) }).then(r => r.json()),
    update: (id, data) => fetch('/api/proveedores/' + id, { method: 'PUT', headers: api.headers(), body: JSON.stringify(data) }).then(r => r.json()),
    del: (id) => fetch('/api/proveedores/' + id, { method: 'DELETE', headers: api.headers() }).then(r => r.json())
  },
  
  // Clientes
  clientes: {
    list: () => fetch('/api/clientes', { headers: api.headers() }).then(r => r.json()),
    get: (id) => fetch('/api/clientes/' + id, { headers: api.headers() }).then(r => r.json()),
    getRUT: (rut) => fetch('/api/clientes/rut/' + rut, { headers: api.headers() }).then(r => r.json()),
    create: (data) => fetch('/api/clientes', { method: 'POST', headers: api.headers(), body: JSON.stringify(data) }).then(r => r.json()),
    update: (id, data) => fetch('/api/clientes/' + id, { method: 'PUT', headers: api.headers(), body: JSON.stringify(data) }).then(r => r.json()),
    del: (id) => fetch('/api/clientes/' + id, { method: 'DELETE', headers: api.headers() }).then(r => r.json())
  },
  
  // Ventas
  ventas: {
    list: () => fetch('/api/ventas', { headers: api.headers() }).then(r => r.json()),
    get: (id) => fetch('/api/ventas/' + id, { headers: api.headers() }).then(r => r.json()),
    create: (data) => fetch('/api/ventas', { method: 'POST', headers: api.headers(), body: JSON.stringify(data) }).then(r => r.json()),
    stats: (fecha_inicio, fecha_fin) => {
      let url = '/api/ventas/stats/summary';
      if (fecha_inicio && fecha_fin) {
        url += `?fecha_inicio=${fecha_inicio}&fecha_fin=${fecha_fin}`;
      }
      return fetch(url, { headers: api.headers() }).then(r => r.json());
    }
  },
  
  // Usuarios (solo admin)
  usuarios: {
    list: () => fetch('/api/usuarios', { headers: api.headers() }).then(r => r.json()),
    get: (id) => fetch('/api/usuarios/' + id, { headers: api.headers() }).then(r => r.json()),
    create: (data) => fetch('/api/usuarios', { method: 'POST', headers: api.headers(), body: JSON.stringify(data) }).then(r => r.json()),
    update: (id, data) => fetch('/api/usuarios/' + id, { method: 'PUT', headers: api.headers(), body: JSON.stringify(data) }).then(r => r.json()),
    del: (id) => fetch('/api/usuarios/' + id, { method: 'DELETE', headers: api.headers() }).then(r => r.json())
  },
  
  // Alertas
  alertas: {
    list: () => fetch('/api/alertas', { headers: api.headers() }).then(r => r.json()),
    resolver: (id) => fetch('/api/alertas/' + id + '/resolver', { method: 'PUT', headers: api.headers() }).then(r => r.json())
  },

  // Reportes
  reportes: {
    ventas: (fecha_inicio, fecha_fin) => {
      let url = '/api/reportes/ventas';
      if (fecha_inicio && fecha_fin) {
        url += `?fecha_inicio=${fecha_inicio}&fecha_fin=${fecha_fin}`;
      }
      return fetch(url, { headers: api.headers() }).then(r => r.json());
    },
    inventario: () => fetch('/api/reportes/inventario', { headers: api.headers() }).then(r => r.json()),
    proveedores: () => fetch('/api/reportes/proveedores', { headers: api.headers() }).then(r => r.json())
  }
};

// Notificaciones pop-up
function showNotification(message, type = 'warning', onResolve = null) {
  const container = document.getElementById('notifications-container');
  const id = 'notif-' + Date.now();
  
  const popup = document.createElement('div');
  popup.id = id;
  popup.className = `alert alert-${type} alert-dismissible notification-popup`;
  popup.innerHTML = `
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    <div>${message}</div>
    ${onResolve ? '<button class="btn btn-sm btn-success mt-2" id="' + id + '-resolve">Ir a Productos</button>' : ''}
  `;
  
  container.appendChild(popup);
  
  if (onResolve) {
    document.getElementById(id + '-resolve').addEventListener('click', () => {
      onResolve();
      popup.remove();
    });
  }
  
  setTimeout(() => popup.remove(), 10000);
}

// Login/Register
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('login-username').value;
  const password = document.getElementById('login-password').value;
  
  try {
    const result = await api.login(username, password);
    if (result.success) {
      token = result.token;
      currentUser = result.usuario;
      localStorage.setItem('token', token);
      showMainScreen();
    } else {
      alert(result.error || 'Error al iniciar sesión');
    }
  } catch (err) {
    alert('Error de conexión');
  }
});

document.getElementById('logout-btn').addEventListener('click', () => {
  token = null;
  currentUser = null;
  localStorage.removeItem('token');
  showLoginScreen();
});

function showLoginScreen() {
  document.getElementById('login-screen').style.display = 'block';
  document.getElementById('main-screen').style.display = 'none';
}

function showMainScreen() {
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('main-screen').style.display = 'block';
  document.getElementById('user-info').textContent = currentUser.nombre_usuario + ' (' + currentUser.rol + ')';
  
  // Control de acceso por roles
  configurarAccesoPorRol();
  
  loadAll();
  checkAlertas();
}

function configurarAccesoPorRol() {
  const rol = currentUser.rol;
  
  // Obtener todos los tabs
  const tabProductos = document.querySelector('[data-bs-target="#tab-productos"]').parentElement;
  const tabProveedores = document.querySelector('[data-bs-target="#tab-proveedores"]').parentElement;
  const tabVentas = document.querySelector('[data-bs-target="#tab-ventas"]').parentElement;
  const tabAlertas = document.querySelector('[data-bs-target="#tab-alertas"]').parentElement;
  const tabReportes = document.querySelector('[data-bs-target="#tab-reportes"]').parentElement;
  const tabUsuarios = document.getElementById('tab-usuarios-link');
  
  // Ocultar todos por defecto
  tabProductos.style.display = 'none';
  tabProveedores.style.display = 'none';
  tabVentas.style.display = 'none';
  tabAlertas.style.display = 'none';
  tabReportes.style.display = 'none';
  tabUsuarios.style.display = 'none';
  
  if (rol === 'admin') {
    // Admin ve todo
    tabProductos.style.display = 'block';
    tabProveedores.style.display = 'block';
    tabVentas.style.display = 'block';
    tabAlertas.style.display = 'block';
    tabReportes.style.display = 'block';
    tabUsuarios.style.display = 'block';
  } else if (rol === 'inventario') {
    // Inventario ve: Productos, Proveedores, Alertas
    tabProductos.style.display = 'block';
    tabProveedores.style.display = 'block';
    tabAlertas.style.display = 'block';
    // Activar tab de productos por defecto
    document.querySelector('[data-bs-target="#tab-productos"]').click();
  } else if (rol === 'operador de ventas') {
    // Operador de ventas ve: Ventas, Reportes
    tabVentas.style.display = 'block';
    tabReportes.style.display = 'block';
    // Activar tab de ventas por defecto
    document.querySelector('[data-bs-target="#tab-ventas"]').click();
  }
}

// Productos
async function renderProductos() {
  const rows = await api.productos.list();
  const tbody = document.querySelector('#productos-table tbody');
  tbody.innerHTML = '';
  rows.forEach(r => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${r.id_producto}</td>
      <td>${r.nombre}</td>
      <td>${r.SKU}</td>
      <td>${r.talla}</td>
      <td>${r.color}</td>
      <td>$${r.precio_venta.toLocaleString()}</td>
      <td>${r.stock}</td>
      <td>${r.id_proveedor}</td>
      <td>
        <button class="btn btn-sm btn-outline-secondary" data-id="${r.id_producto}" data-action="edit">Editar</button>
        <button class="btn btn-sm btn-outline-danger" data-id="${r.id_producto}" data-action="del">Borrar</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

document.querySelector('#productos-table tbody').addEventListener('click', async (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;
  const id = btn.dataset.id;
  if (btn.dataset.action === 'edit') {
    const p = await api.productos.get(id);
    document.getElementById('id_producto').value = p.id_producto;
    document.getElementById('nombre').value = p.nombre;
    document.getElementById('SKU').value = p.SKU;
    document.getElementById('talla').value = p.talla;
    document.getElementById('color').value = p.color;
    document.getElementById('precio_venta').value = p.precio_venta;
    document.getElementById('stock').value = p.stock;
    document.getElementById('id_proveedor').value = p.id_proveedor;
    document.getElementById('producto-form-title').textContent = 'Editar Producto';
  } else if (btn.dataset.action === 'del') {
    if (confirm('¿Borrar producto?')) {
      await api.productos.del(id);
      renderProductos();
      renderAlertas();
    }
  }
});

document.getElementById('producto-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('id_producto').value;
  const data = {
    nombre: document.getElementById('nombre').value,
    SKU: document.getElementById('SKU').value,
    talla: document.getElementById('talla').value,
    color: document.getElementById('color').value,
    precio_venta: Number(document.getElementById('precio_venta').value),
    stock: Number(document.getElementById('stock').value),
    id_proveedor: Number(document.getElementById('id_proveedor').value)
  };
  
  try {
    if (id) {
      await api.productos.update(id, data);
    } else {
      await api.productos.create(data);
    }
    resetProductoForm();
    renderProductos();
    renderAlertas();
    checkAlertas();
  } catch (err) {
    alert('Error al guardar producto');
  }
});

document.getElementById('producto-cancelar').addEventListener('click', resetProductoForm);

function resetProductoForm() {
  document.getElementById('producto-form').reset();
  document.getElementById('id_producto').value = '';
  document.getElementById('producto-form-title').textContent = 'Nuevo Producto';
}

// Proveedores
async function renderProveedores() {
  const rows = await api.proveedores.list();
  const tbody = document.querySelector('#proveedores-table tbody');
  tbody.innerHTML = '';
  
  const select = document.getElementById('id_proveedor');
  select.innerHTML = '<option value="">Selecciona proveedor</option>';
  rows.forEach(p => {
    select.innerHTML += `<option value="${p.id_proveedor}">${p.nombre}</option>`;
  });
  
  rows.forEach(r => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${r.id_proveedor}</td>
      <td>${r.nombre}</td>
      <td>${r.telefono}</td>
      <td>${r.email}</td>
      <td>
        <button class="btn btn-sm btn-outline-secondary" data-id="${r.id_proveedor}" data-action="edit">Editar</button>
        <button class="btn btn-sm btn-outline-danger" data-id="${r.id_proveedor}" data-action="del">Borrar</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

document.querySelector('#proveedores-table tbody').addEventListener('click', async (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;
  const id = btn.dataset.id;
  if (btn.dataset.action === 'edit') {
    const p = await api.proveedores.get(id);
    document.getElementById('id_proveedor_edit').value = p.id_proveedor;
    document.getElementById('prov-nombre').value = p.nombre;
    document.getElementById('prov-telefono').value = p.telefono;
    document.getElementById('prov-email').value = p.email;
    document.getElementById('proveedor-form-title').textContent = 'Editar Proveedor';
  } else if (btn.dataset.action === 'del') {
    if (confirm('¿Borrar proveedor?')) {
      try {
        await api.proveedores.del(id);
        renderProveedores();
      } catch (err) {
        alert('No se puede borrar proveedor con productos asociados');
      }
    }
  }
});

document.getElementById('proveedor-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('id_proveedor_edit').value;
  const data = {
    nombre: document.getElementById('prov-nombre').value,
    telefono: document.getElementById('prov-telefono').value,
    email: document.getElementById('prov-email').value
  };
  
  try {
    if (id) {
      await api.proveedores.update(id, data);
    } else {
      await api.proveedores.create(data);
    }
    resetProveedorForm();
    renderProveedores();
  } catch (err) {
    alert('Error al guardar proveedor');
  }
});

document.getElementById('proveedor-cancelar').addEventListener('click', resetProveedorForm);

function resetProveedorForm() {
  document.getElementById('proveedor-form').reset();
  document.getElementById('id_proveedor_edit').value = '';
  document.getElementById('proveedor-form-title').textContent = 'Nuevo Proveedor';
}

// Ventas
async function renderVentas() {
  const rows = await api.ventas.list();
  const tbody = document.querySelector('#ventas-table tbody');
  tbody.innerHTML = '';
  rows.forEach(r => {
    const tr = document.createElement('tr');
    const fecha = new Date(r.fecha_venta).toLocaleString('es-CL');
    tr.innerHTML = `
      <td>${r.id_venta}</td>
      <td>${fecha}</td>
      <td>${r.nombre} ${r.apellido}</td>
      <td>$${r.total_venta.toLocaleString()}</td>
      <td>${r.metodo_pago}</td>
      <td><button class="btn btn-sm btn-outline-info" data-id="${r.id_venta}" data-action="view">Ver</button></td>
    `;
    tbody.appendChild(tr);
  });
}

document.querySelector('#ventas-table tbody').addEventListener('click', async (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;
  if (btn.dataset.action === 'view') {
    const venta = await api.ventas.get(btn.dataset.id);
    mostrarDetalleVenta(venta);
  }
});

function mostrarDetalleVenta(venta) {
  const content = document.getElementById('detalle-venta-content');
  const fecha = new Date(venta.fecha_venta).toLocaleString('es-CL');
  
  let html = `
    <div class="mb-3">
      <strong>Venta #${venta.id_venta}</strong> - ${fecha}<br>
      <strong>Cliente:</strong> ${venta.nombre} ${venta.apellido} (${venta.RUT})<br>
      <strong>Método de pago:</strong> ${venta.metodo_pago}
    </div>
    <table class="table table-sm">
      <thead>
        <tr><th>Producto</th><th>SKU</th><th>Cantidad</th><th>Precio Unit.</th><th>Descuento</th><th>Subtotal</th></tr>
      </thead>
      <tbody>
  `;
  
  venta.detalles.forEach(d => {
    const subtotal = (d.precio_unitario_venta * d.cantidad_vendida) - d.descuento_aplicado;
    html += `
      <tr>
        <td>${d.nombre}</td>
        <td>${d.SKU}</td>
        <td>${d.cantidad_vendida}</td>
        <td>$${d.precio_unitario_venta.toLocaleString()}</td>
        <td>$${d.descuento_aplicado.toLocaleString()}</td>
        <td>$${subtotal.toLocaleString()}</td>
      </tr>
    `;
  });
  
  html += `</tbody></table><div class="text-end"><strong>Total: $${venta.total_venta.toLocaleString()}</strong></div>`;
  content.innerHTML = html;
  
  const modal = new bootstrap.Modal(document.getElementById('detalleVentaModal'));
  modal.show();
}

// Búsqueda de cliente (RUT o Email)
document.getElementById('buscar-cliente').addEventListener('click', async () => {
  const busqueda = document.getElementById('venta-cliente-buscar').value.trim();
  if (!busqueda) return alert('Ingresa RUT o Email del cliente');
  
  try {
    let cliente;
    
    // Intentar buscar por RUT primero
    if (busqueda.includes('@')) {
      // Es un email, buscar en la lista
      const clientes = await api.clientes.list();
      cliente = clientes.find(c => c.email.toLowerCase() === busqueda.toLowerCase());
      if (!cliente) throw new Error('Cliente no encontrado');
    } else {
      // Es RUT
      cliente = await api.clientes.getRUT(busqueda);
    }
    
    clienteActual = cliente;
    document.getElementById('venta-id-cliente').value = cliente.id_cliente;
    
    // Mostrar información del cliente
    document.getElementById('cliente-info-nombre').textContent = `${cliente.nombre} ${cliente.apellido}`;
    document.getElementById('cliente-info-rut').textContent = cliente.RUT;
    document.getElementById('cliente-info-email').textContent = cliente.email;
    document.getElementById('cliente-info-telefono').textContent = cliente.telefono || 'No registrado';
    document.getElementById('cliente-info-card').style.display = 'block';
  } catch (err) {
    alert('Cliente no encontrado');
    document.getElementById('cliente-info-card').style.display = 'none';
  }
});

// Nuevo cliente
document.getElementById('nuevo-cliente').addEventListener('click', () => {
  document.getElementById('cliente-form').reset();
  const busqueda = document.getElementById('venta-cliente-buscar').value.trim();
  if (busqueda && !busqueda.includes('@')) {
    document.getElementById('cliente-rut').value = busqueda;
  }
  const modal = new bootstrap.Modal(document.getElementById('nuevoClienteModal'));
  modal.show();
});

document.getElementById('guardar-cliente').addEventListener('click', async () => {
  const data = {
    RUT: document.getElementById('cliente-rut').value,
    nombre: document.getElementById('cliente-nombre').value,
    apellido: document.getElementById('cliente-apellido').value,
    telefono: document.getElementById('cliente-telefono').value,
    email: document.getElementById('cliente-email').value
  };
  
  try {
    const cliente = await api.clientes.create(data);
    clienteActual = cliente;
    document.getElementById('venta-id-cliente').value = cliente.id_cliente;
    document.getElementById('venta-cliente-buscar').value = cliente.RUT;
    
    // Mostrar información del cliente
    document.getElementById('cliente-info-nombre').textContent = `${cliente.nombre} ${cliente.apellido}`;
    document.getElementById('cliente-info-rut').textContent = cliente.RUT;
    document.getElementById('cliente-info-email').textContent = cliente.email;
    document.getElementById('cliente-info-telefono').textContent = cliente.telefono || 'No registrado';
    document.getElementById('cliente-info-card').style.display = 'block';
    
    bootstrap.Modal.getInstance(document.getElementById('nuevoClienteModal')).hide();
  } catch (err) {
    alert('Error al crear cliente: ' + err.message);
  }
});

// Modal de búsqueda de productos
let todosProductos = [];

document.getElementById('agregar-producto-btn').addEventListener('click', async () => {
  // Cargar todos los productos
  todosProductos = await api.productos.list();
  
  // Mostrar modal
  const modal = new bootstrap.Modal(document.getElementById('buscarProductoModal'));
  modal.show();
  
  // Renderizar todos los productos inicialmente
  renderProductosModal(todosProductos);
});

// Búsqueda en tiempo real en el modal
document.getElementById('modal-buscar-producto').addEventListener('input', (e) => {
  const query = e.target.value.trim().toLowerCase();
  
  if (!query) {
    renderProductosModal(todosProductos);
    return;
  }
  
  const resultados = todosProductos.filter(p => 
    p.nombre.toLowerCase().includes(query) ||
    p.SKU.toLowerCase().includes(query) ||
    p.talla.toLowerCase().includes(query) ||
    p.color.toLowerCase().includes(query)
  );
  
  renderProductosModal(resultados);
});

function renderProductosModal(productos) {
  const div = document.getElementById('modal-productos-lista');
  
  if (productos.length === 0) {
    div.innerHTML = '<div class="alert alert-info">No se encontraron productos</div>';
    return;
  }
  
  div.innerHTML = productos.map(p => `
    <div class="producto-item" data-producto='${JSON.stringify(p).replace(/'/g, "&apos;")}'>
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <strong>${p.nombre}</strong><br>
          <small class="text-muted">
            SKU: ${p.SKU} | Talla: ${p.talla} | Color: ${p.color}
          </small>
        </div>
        <div class="text-end">
          <div><strong>$${p.precio_venta.toLocaleString()}</strong></div>
          <small class="text-muted">Stock: ${p.stock}</small>
        </div>
      </div>
    </div>
  `).join('');
}

document.getElementById('modal-productos-lista').addEventListener('click', (e) => {
  const item = e.target.closest('.producto-item');
  if (!item) return;
  
  const producto = JSON.parse(item.dataset.producto);
  agregarProductoVenta(producto);
  
  // Cerrar modal
  bootstrap.Modal.getInstance(document.getElementById('buscarProductoModal')).hide();
  
  // Limpiar búsqueda
  document.getElementById('modal-buscar-producto').value = '';
});

function agregarProductoVenta(producto) {
  const existente = productosVenta.find(p => p.id_producto === producto.id_producto);
  if (existente) {
    existente.cantidad++;
  } else {
    productosVenta.push({
      id_producto: producto.id_producto,
      nombre: producto.nombre,
      SKU: producto.SKU,
      precio_unitario_venta: producto.precio_venta,
      cantidad: 1,
      descuento: 0,
      stock_disponible: producto.stock
    });
  }
  renderProductosVenta();
}

function renderProductosVenta() {
  const div = document.getElementById('productos-venta');
  if (productosVenta.length === 0) {
    div.innerHTML = '<div class="alert alert-secondary"><i class="fas fa-info-circle me-1"></i>No hay productos agregados</div>';
    calcularTotalVenta();
    return;
  }
  
  div.innerHTML = productosVenta.map((p, idx) => `
    <div class="card mb-2 shadow-sm">
      <div class="card-body p-2">
        <div class="d-flex justify-content-between align-items-start mb-2">
          <div class="flex-grow-1">
            <strong>${p.nombre}</strong><br>
            <small class="text-muted">
              <i class="fas fa-barcode me-1"></i>${p.SKU} | 
              <i class="fas fa-tag me-1"></i>$${p.precio_unitario_venta.toLocaleString()}
            </small>
          </div>
          <button class="btn btn-sm btn-danger" data-idx="${idx}" data-action="remove">
            <i class="fas fa-trash"></i>
          </button>
        </div>
        <div class="row g-2">
          <div class="col-6">
            <label class="form-label small mb-1">Cantidad</label>
            <input type="number" class="form-control form-control-sm" value="${p.cantidad}" min="1" max="${p.stock_disponible}" data-idx="${idx}" data-field="cantidad">
            <small class="text-muted">Máx: ${p.stock_disponible}</small>
          </div>
          <div class="col-6">
            <label class="form-label small mb-1">Descuento $</label>
            <input type="number" class="form-control form-control-sm" placeholder="0" value="${p.descuento}" min="0" data-idx="${idx}" data-field="descuento">
          </div>
        </div>
        <div class="mt-2 text-end">
          <strong>Subtotal: $${((p.precio_unitario_venta * p.cantidad) - p.descuento).toLocaleString()}</strong>
        </div>
      </div>
    </div>
  `).join('');
  
  calcularTotalVenta();
}

document.getElementById('productos-venta').addEventListener('input', (e) => {
  const input = e.target.closest('input[data-idx]');
  if (!input) return;
  
  const idx = parseInt(input.dataset.idx);
  const field = input.dataset.field;
  const value = parseInt(input.value) || 0;
  
  if (field === 'cantidad') {
    productosVenta[idx].cantidad = Math.min(value, productosVenta[idx].stock_disponible);
  } else if (field === 'descuento') {
    productosVenta[idx].descuento = value;
  }
  
  calcularTotalVenta();
});

document.getElementById('productos-venta').addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-action="remove"]');
  if (!btn) return;
  
  const idx = parseInt(btn.dataset.idx);
  productosVenta.splice(idx, 1);
  renderProductosVenta();
});

function calcularTotalVenta() {
  const total = productosVenta.reduce((sum, p) => {
    return sum + (p.precio_unitario_venta * p.cantidad) - p.descuento;
  }, 0);
  
  document.getElementById('venta-total').textContent = total.toLocaleString();
}

document.getElementById('venta-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const id_cliente = document.getElementById('venta-id-cliente').value;
  const metodo_pago = document.getElementById('venta-metodo').value;
  
  if (!id_cliente) return alert('Selecciona un cliente');
  if (productosVenta.length === 0) return alert('Agrega al menos un producto');
  
  const data = {
    id_cliente: parseInt(id_cliente),
    metodo_pago,
    detalles: productosVenta.map(p => ({
      id_producto: p.id_producto,
      cantidad_vendida: p.cantidad,
      precio_unitario_venta: p.precio_unitario_venta,
      descuento_aplicado: p.descuento
    }))
  };
  
  try {
    await api.ventas.create(data);
    alert('Venta registrada exitosamente');
    
    // Resetear formulario
    document.getElementById('venta-form').reset();
    document.getElementById('venta-id-cliente').value = '';
    document.getElementById('venta-cliente-buscar').value = '';
    document.getElementById('cliente-info-card').style.display = 'none';
    productosVenta = [];
    renderProductosVenta();
    renderVentas();
    renderProductos();
    checkAlertas();
  } catch (err) {
    alert('Error al registrar venta: ' + err.message);
  }
});

// Alertas
async function renderAlertas() {
  const rows = await api.alertas.list();
  const div = document.getElementById('alertas-list');
  if (rows.length === 0) {
    div.innerHTML = '<div class="alert alert-success">No hay alertas activas</div>';
    return;
  }
  div.innerHTML = rows.map(r => `
    <div class="alert alert-warning d-flex justify-content-between align-items-center">
      <div>
        <strong>${r.nombre}</strong> (SKU: ${r.SKU}) — 
        Stock actual: ${r.stock_actual} | Umbral: ${r.umbral_minimo} | 
        Creada: ${new Date(r.fecha_creacion).toLocaleDateString()}
      </div>
      <button class="btn btn-sm btn-success" onclick="resolverAlerta(${r.id_alerta})">Resolver</button>
    </div>
  `).join('');
}

window.resolverAlerta = async (id) => {
  await api.alertas.resolver(id);
  renderAlertas();
  checkAlertas();
};

async function checkAlertas() {
  const alertas = await api.alertas.list();
  if (alertas.length > 0) {
    alertas.forEach(a => {
      showNotification(
        `<strong>⚠️ Stock Bajo</strong><br>${a.nombre} (${a.SKU})<br>Stock: ${a.stock_actual} unidades`,
        'warning',
        () => {
          document.querySelector('[data-bs-target="#tab-productos"]').click();
        }
      );
    });
  }
}

// Usuarios (solo admin)
async function renderUsuarios() {
  if (currentUser.rol !== 'admin') return;
  
  const rows = await api.usuarios.list();
  const tbody = document.querySelector('#usuarios-table tbody');
  tbody.innerHTML = '';
  
  rows.forEach(r => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${r.id_usuario}</td>
      <td>${r.nombre_usuario}</td>
      <td>${r.RUT}</td>
      <td>${r.email}</td>
      <td><span class="badge bg-secondary">${r.rol}</span></td>
      <td>
        <button class="btn btn-sm btn-outline-secondary" data-id="${r.id_usuario}" data-action="edit">Editar</button>
        <button class="btn btn-sm btn-outline-danger" data-id="${r.id_usuario}" data-action="del">Borrar</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

document.querySelector('#usuarios-table tbody').addEventListener('click', async (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;
  const id = btn.dataset.id;
  
  if (btn.dataset.action === 'edit') {
    const u = await api.usuarios.get(id);
    document.getElementById('id_usuario_edit').value = u.id_usuario;
    document.getElementById('user-nombre').value = u.nombre_usuario;
    document.getElementById('user-rut').value = u.RUT;
    document.getElementById('user-email').value = u.email;
    document.getElementById('user-telefono').value = u.telefono || '';
    document.getElementById('user-rol').value = u.rol;
    document.getElementById('user-password').placeholder = 'Dejar vacío para mantener';
    document.getElementById('usuario-form-title').textContent = 'Editar Usuario';
  } else if (btn.dataset.action === 'del') {
    if (confirm('¿Borrar usuario?')) {
      await api.usuarios.del(id);
      renderUsuarios();
    }
  }
});

document.getElementById('usuario-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('id_usuario_edit').value;
  const data = {
    nombre_usuario: document.getElementById('user-nombre').value,
    RUT: document.getElementById('user-rut').value,
    email: document.getElementById('user-email').value,
    telefono: document.getElementById('user-telefono').value,
    rol: document.getElementById('user-rol').value
  };
  
  const password = document.getElementById('user-password').value;
  if (password) data.contrasena = password;
  
  try {
    if (id) {
      await api.usuarios.update(id, data);
    } else {
      if (!password) return alert('La contraseña es requerida');
      data.contrasena = password;
      await api.usuarios.create(data);
    }
    resetUsuarioForm();
    renderUsuarios();
  } catch (err) {
    alert('Error al guardar usuario');
  }
});

document.getElementById('usuario-cancelar').addEventListener('click', resetUsuarioForm);

function resetUsuarioForm() {
  document.getElementById('usuario-form').reset();
  document.getElementById('id_usuario_edit').value = '';
  document.getElementById('user-password').placeholder = 'Contraseña';
  document.getElementById('usuario-form-title').textContent = 'Nuevo Usuario';
}

// Reportes
document.getElementById('generar-reporte-ventas').addEventListener('click', async () => {
  const fecha_inicio = document.getElementById('reporte-fecha-inicio').value;
  const fecha_fin = document.getElementById('reporte-fecha-fin').value;
  
  try {
    reporteActual = await api.reportes.ventas(fecha_inicio, fecha_fin);
    mostrarReporteVentas(reporteActual);
    document.getElementById('descargar-reporte-ventas').style.display = 'block';
  } catch (err) {
    alert('Error al generar reporte');
  }
});

function mostrarReporteVentas(data) {
  const div = document.getElementById('reporte-resultado');
  const { ventas, estadisticas, periodo } = data;
  
  let html = `
    <div class="card">
      <div class="card-header"><strong>Reporte de Ventas</strong></div>
      <div class="card-body">
        <p><strong>Periodo:</strong> ${periodo.fecha_inicio} - ${periodo.fecha_fin}</p>
        <div class="row mb-3">
          <div class="col-md-3">
            <div class="card bg-light">
              <div class="card-body text-center">
                <h6>Total Ventas</h6>
                <h4>${estadisticas.total_ventas}</h4>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card bg-light">
              <div class="card-body text-center">
                <h6>Ingresos</h6>
                <h4>$${(estadisticas.ingresos_totales || 0).toLocaleString()}</h4>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card bg-light">
              <div class="card-body text-center">
                <h6>Ticket Promedio</h6>
                <h4>$${Math.round(estadisticas.ticket_promedio || 0).toLocaleString()}</h4>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card bg-light">
              <div class="card-body text-center">
                <h6>Venta Máxima</h6>
                <h4>$${(estadisticas.venta_maxima || 0).toLocaleString()}</h4>
              </div>
            </div>
          </div>
        </div>
        <h6>Detalle de Ventas</h6>
        <div class="table-responsive" style="max-height:400px">
          <table class="table table-sm table-striped">
            <thead class="sticky-top bg-white">
              <tr><th>#</th><th>Fecha</th><th>Cliente</th><th>RUT</th><th>Total</th><th>Método</th></tr>
            </thead>
            <tbody>
  `;
  
  ventas.forEach(v => {
    const fecha = new Date(v.fecha_venta).toLocaleString('es-CL');
    html += `
      <tr>
        <td>${v.id_venta}</td>
        <td>${fecha}</td>
        <td>${v.cliente}</td>
        <td>${v.RUT}</td>
        <td>$${v.total_venta.toLocaleString()}</td>
        <td>${v.metodo_pago}</td>
      </tr>
    `;
  });
  
  html += '</tbody></table></div></div></div>';
  div.innerHTML = html;
}

document.getElementById('descargar-reporte-ventas').addEventListener('click', () => {
  if (!reporteActual) return;
  
  let csv = 'ID,Fecha,Cliente,RUT,Total,Metodo\n';
  reporteActual.ventas.forEach(v => {
    csv += `${v.id_venta},"${v.fecha_venta}","${v.cliente}","${v.RUT}",${v.total_venta},"${v.metodo_pago}"\n`;
  });
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `reporte_ventas_${Date.now()}.csv`;
  a.click();
});

// Carga inicial
async function loadAll() {
  const rol = currentUser.rol;
  
  if (rol === 'admin') {
    // Admin carga todo
    await renderProveedores();
    await renderProductos();
    await renderAlertas();
    await renderVentas();
    await renderUsuarios();
  } else if (rol === 'inventario') {
    // Inventario: Productos, Proveedores, Alertas
    await renderProveedores();
    await renderProductos();
    await renderAlertas();
  } else if (rol === 'operador de ventas') {
    // Ventas: Ventas y Reportes
    await renderVentas();
  }
}

// Verificar autenticación al cargar
async function verificarAuth() {
  if (!token) {
    showLoginScreen();
    return;
  }
  
  try {
    const res = await fetch('/api/auth/verify', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    
    if (res.ok) {
      currentUser = await res.json();
      showMainScreen();
    } else {
      localStorage.removeItem('token');
      token = null;
      showLoginScreen();
    }
  } catch (err) {
    console.error('Error verificando autenticación:', err);
    localStorage.removeItem('token');
    token = null;
    showLoginScreen();
  }
}

// Inicialización
verificarAuth();
