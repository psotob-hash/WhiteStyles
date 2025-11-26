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
  },

  // Dashboard
  dashboard: {
    stats: (periodo) => fetch('/api/dashboard/stats?periodo=' + (periodo || '7'), { headers: api.headers() }).then(r => r.json()),
    ventasTiempo: (periodo) => fetch('/api/dashboard/ventas-tiempo?periodo=' + (periodo || '7'), { headers: api.headers() }).then(r => r.json()),
    productosTop: (periodo, limit) => fetch('/api/dashboard/productos-top?periodo=' + (periodo || '7') + '&limit=' + (limit || '10'), { headers: api.headers() }).then(r => r.json()),
    stockBajo: () => fetch('/api/dashboard/stock-bajo', { headers: api.headers() }).then(r => r.json()),
    clientesDetalle: () => fetch('/api/dashboard/clientes-detalle', { headers: api.headers() }).then(r => r.json())
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
    ${onResolve ? '<button class="btn btn-sm btn-success mt-2 resolve-btn">Ir a Productos</button>' : ''}
  `;
  
  container.appendChild(popup);
  
  if (onResolve) {
    const resolveBtn = popup.querySelector('.resolve-btn');
    if (resolveBtn) {
      resolveBtn.addEventListener('click', () => {
        onResolve();
        popup.remove();
      });
    }
  }
  
  // Auto-cerrar después de 10 segundos
  setTimeout(() => {
    if (popup.parentElement) {
      popup.remove();
    }
  }, 10000);
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
  
  // Configurar menú móvil
  configurarMenuMovil();
  
  loadAll();
  checkAlertas();
}

// ========== MENÚ MÓVIL ==========
function configurarMenuMovil() {
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const mobileClose = document.getElementById('mobile-menu-close');
  const mobileSidebar = document.getElementById('mobile-sidebar');
  const mobileOverlay = document.getElementById('mobile-sidebar-overlay');
  const mobileNavItems = document.getElementById('mobile-nav-items');

  // Obtener todos los tabs visibles
  const tabs = document.querySelectorAll('#main-tabs .nav-item:not([style*="display: none"]) button');
  
  // Generar items del menú móvil
  mobileNavItems.innerHTML = '';
  tabs.forEach((tab, index) => {
    const target = tab.getAttribute('data-bs-target');
    const icon = tab.querySelector('i').className;
    const text = tab.textContent.trim();
    
    const item = document.createElement('div');
    item.className = 'mobile-nav-item' + (index === 0 ? ' active' : '');
    
    // Si es la pestaña de alertas, agregar el badge
    if (target === '#tab-alertas') {
      item.innerHTML = `<i class="${icon}"></i><span>${text}</span><span class="badge bg-danger rounded-pill ms-2" id="alertas-badge-mobile" style="display: none;">0</span>`;
    } else {
      item.innerHTML = `<i class="${icon}"></i><span>${text}</span>`;
    }
    
    item.setAttribute('data-target', target);
    
    item.addEventListener('click', () => {
      // Activar tab
      tab.click();
      
      // Actualizar active
      document.querySelectorAll('.mobile-nav-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      
      // Cerrar sidebar
      mobileSidebar.classList.remove('active');
    });
    
    mobileNavItems.appendChild(item);
  });

  // Toggle sidebar
  mobileToggle?.addEventListener('click', () => {
    mobileSidebar.classList.add('active');
  });

  mobileClose?.addEventListener('click', () => {
    mobileSidebar.classList.remove('active');
  });

  mobileOverlay?.addEventListener('click', () => {
    mobileSidebar.classList.remove('active');
  });
}

// Click en logo para ir al dashboard
document.addEventListener('DOMContentLoaded', () => {
  const logoButton = document.getElementById('logo-to-dashboard');
  if (logoButton) {
    logoButton.addEventListener('click', () => {
      const dashboardTab = document.querySelector('[data-bs-target="#tab-dashboard"]');
      if (dashboardTab) {
        dashboardTab.click();
        // Cerrar sidebar móvil si está abierto
        const mobileSidebar = document.getElementById('mobile-sidebar');
        if (mobileSidebar) {
          mobileSidebar.classList.remove('active');
        }
      }
    });
  }
});

function configurarAccesoPorRol() {
  const rol = currentUser.rol;
  
  // Obtener todos los tabs
  const tabDashboard = document.querySelector('[data-bs-target="#tab-dashboard"]').parentElement;
  const tabProductos = document.querySelector('[data-bs-target="#tab-productos"]').parentElement;
  const tabProveedores = document.querySelector('[data-bs-target="#tab-proveedores"]').parentElement;
  const tabVentas = document.querySelector('[data-bs-target="#tab-ventas"]').parentElement;
  const tabAlertas = document.querySelector('[data-bs-target="#tab-alertas"]').parentElement;
  const tabReportes = document.querySelector('[data-bs-target="#tab-reportes"]').parentElement;
  const tabUsuarios = document.getElementById('tab-usuarios-link');
  
  // Ocultar todos por defecto
  tabDashboard.style.display = 'none';
  tabProductos.style.display = 'none';
  tabProveedores.style.display = 'none';
  tabVentas.style.display = 'none';
  tabAlertas.style.display = 'none';
  tabReportes.style.display = 'none';
  tabUsuarios.style.display = 'none';
  
  if (rol === 'admin') {
    // Admin ve todo
    tabDashboard.style.display = 'block';
    tabProductos.style.display = 'block';
    tabProveedores.style.display = 'block';
    tabVentas.style.display = 'block';
    tabAlertas.style.display = 'block';
    tabReportes.style.display = 'block';
    tabUsuarios.style.display = 'block';
  } else if (rol === 'inventario') {
    // Inventario ve: Dashboard (solo stock), Productos, Proveedores, Alertas
    tabDashboard.style.display = 'block';
    tabProductos.style.display = 'block';
    tabProveedores.style.display = 'block';
    tabAlertas.style.display = 'block';
  } else if (rol === 'operador de ventas') {
    // Operador de ventas ve: Dashboard, Ventas, Reportes
    tabDashboard.style.display = 'block';
    tabVentas.style.display = 'block';
    tabReportes.style.display = 'block';
  }
}

// Productos
let productosData = [];
let productosSortState = { column: null, direction: 'none' };

async function renderProductos() {
  productosData = await api.productos.list();
  renderProductosTable(productosData);
}

function renderProductosTable(rows) {
  const tbody = document.querySelector('#productos-table tbody');
  tbody.innerHTML = '';
  rows.forEach(r => {
    const tr = document.createElement('tr');
    tr.setAttribute('data-sku', r.SKU);
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

// Ordenar productos
document.querySelector('#productos-table thead').addEventListener('click', (e) => {
  const th = e.target.closest('th.sortable');
  if (!th) return;
  
  const column = th.dataset.column;
  
  // Actualizar estado de ordenamiento
  if (productosSortState.column === column) {
    // Cambiar dirección: asc -> desc -> none (reset)
    if (productosSortState.direction === 'asc') {
      productosSortState.direction = 'desc';
    } else if (productosSortState.direction === 'desc') {
      productosSortState.direction = 'none';
      productosSortState.column = null;
    } else {
      productosSortState.direction = 'asc';
    }
  } else {
    productosSortState.column = column;
    productosSortState.direction = 'asc';
  }
  
  // Actualizar iconos
  document.querySelectorAll('#productos-table thead th.sortable').forEach(header => {
    header.classList.remove('active');
    const icon = header.querySelector('.sort-icon');
    icon.className = 'fas fa-sort sort-icon';
  });
  
  // Si no hay ordenamiento, mostrar datos originales
  if (productosSortState.direction === 'none') {
    renderProductosTable(productosData);
    return;
  }
  
  th.classList.add('active');
  const icon = th.querySelector('.sort-icon');
  if (productosSortState.direction === 'asc') {
    icon.className = 'fas fa-sort-up sort-icon';
  } else if (productosSortState.direction === 'desc') {
    icon.className = 'fas fa-sort-down sort-icon';
  }
  
  // Ordenar datos
  const sorted = [...productosData].sort((a, b) => {
    let valA = a[column];
    let valB = b[column];
    
    // Conversión según tipo de columna
    if (column === 'precio_venta' || column === 'stock' || column === 'id_proveedor') {
      valA = Number(valA);
      valB = Number(valB);
    } else if (typeof valA === 'string') {
      valA = valA.toLowerCase();
      valB = valB.toLowerCase();
    }
    
    if (valA < valB) return productosSortState.direction === 'asc' ? -1 : 1;
    if (valA > valB) return productosSortState.direction === 'asc' ? 1 : -1;
    return 0;
  });
  
  renderProductosTable(sorted);
});

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
  ventasData = await api.ventas.list();
  renderVentasTable(ventasData);
}

function renderVentasTable(rows) {
  const tbody = document.querySelector('#ventas-table tbody');
  tbody.innerHTML = '';
  rows.forEach(r => {
    const tr = document.createElement('tr');
    const fecha = new Date(r.fecha_venta).toLocaleString('es-CL');
    
    // Función para obtener el badge de estado
    const getEstadoBadge = (estado) => {
      const estadosConfig = {
        'por imprimir': { color: 'danger', icon: 'print', texto: 'Por Imprimir' },
        'pendiente': { color: 'warning', icon: 'clock', texto: 'Pendiente' },
        'en espera': { color: 'info', icon: 'pause-circle', texto: 'En Espera' },
        'enviado': { color: 'success', icon: 'check-circle', texto: 'Enviado' }
      };
      const config = estadosConfig[estado] || estadosConfig['por imprimir'];
      return `<span class="badge bg-${config.color} estado-badge" data-id="${r.id_venta}" data-estado="${estado}" style="cursor: pointer;">
        <i class="fas fa-${config.icon} me-1"></i>${config.texto} <i class="fas fa-caret-down ms-1"></i>
      </span>`;
    };
    
    tr.innerHTML = `
      <td>${r.id_venta}</td>
      <td>${fecha}</td>
      <td>${r.nombre} ${r.apellido}</td>
      <td>$${r.total_venta.toLocaleString()}</td>
      <td>${r.metodo_pago}</td>
      <td>${getEstadoBadge(r.estado_pedido || 'por imprimir')}</td>
      <td><button class="btn btn-sm btn-outline-info" data-id="${r.id_venta}" data-action="view">Ver</button></td>
    `;
    tbody.appendChild(tr);
  });
  
  // Agregar event listeners para los badges de estado
  document.querySelectorAll('.estado-badge').forEach(badge => {
    badge.addEventListener('click', (e) => {
      e.stopPropagation();
      mostrarMenuEstado(badge);
    });
  });
}

// Mostrar menú dropdown de estados (estilo Shopify)
function mostrarMenuEstado(badge) {
  // Remover menú existente si hay uno
  const menuExistente = document.querySelector('.estado-dropdown-menu');
  if (menuExistente) menuExistente.remove();
  
  const idVenta = badge.dataset.id;
  const estadoActual = badge.dataset.estado;
  
  const estados = [
    { value: 'por imprimir', icon: 'print', texto: 'Por Imprimir', color: 'danger' },
    { value: 'pendiente', icon: 'clock', texto: 'Pendiente', color: 'warning' },
    { value: 'en espera', icon: 'pause-circle', texto: 'En Espera', color: 'info' },
    { value: 'enviado', icon: 'check-circle', texto: 'Enviado', color: 'success' }
  ];
  
  const menu = document.createElement('div');
  menu.className = 'estado-dropdown-menu card shadow-sm';
  menu.style.cssText = 'position: absolute; z-index: 1050; min-width: 180px;';
  
  let menuHTML = '<div class="list-group list-group-flush">';
  estados.forEach(estado => {
    const isActive = estado.value === estadoActual ? 'active' : '';
    menuHTML += `
      <a href="#" class="list-group-item list-group-item-action ${isActive}" data-estado="${estado.value}" data-id="${idVenta}">
        <i class="fas fa-${estado.icon} me-2 text-${estado.color}"></i>${estado.texto}
        ${isActive ? '<i class="fas fa-check float-end"></i>' : ''}
      </a>
    `;
  });
  menuHTML += '</div>';
  
  menu.innerHTML = menuHTML;
  
  // Posicionar el menú
  const rect = badge.getBoundingClientRect();
  menu.style.top = `${rect.bottom + window.scrollY}px`;
  menu.style.left = `${rect.left + window.scrollX}px`;
  
  document.body.appendChild(menu);
  
  // Event listeners para las opciones del menú
  menu.querySelectorAll('.list-group-item').forEach(item => {
    item.addEventListener('click', async (e) => {
      e.preventDefault();
      const nuevoEstado = item.dataset.estado;
      const id = item.dataset.id;
      
      try {
        const response = await fetch(`/api/ventas/${id}/estado`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ estado_pedido: nuevoEstado })
        });
        
        if (response.ok) {
          await renderVentas();
          menu.remove();
        } else {
          alert('Error al actualizar el estado');
        }
      } catch (err) {
        console.error('Error:', err);
        alert('Error al actualizar el estado');
      }
    });
  });
  
  // Cerrar menú al hacer click fuera
  setTimeout(() => {
    document.addEventListener('click', function cerrarMenu(e) {
      if (!menu.contains(e.target)) {
        menu.remove();
        document.removeEventListener('click', cerrarMenu);
      }
    });
  }, 100);
}

// Ordenar ventas
let ventasData = [];
let ventasSortState = { column: null, direction: 'none' };

document.querySelector('#ventas-table thead').addEventListener('click', (e) => {
  const th = e.target.closest('th.sortable');
  if (!th) return;
  
  const column = th.dataset.column;
  
  // Actualizar estado de ordenamiento
  if (ventasSortState.column === column) {
    // Cambiar dirección: asc -> desc -> none (reset)
    if (ventasSortState.direction === 'asc') {
      ventasSortState.direction = 'desc';
    } else if (ventasSortState.direction === 'desc') {
      ventasSortState.direction = 'none';
      ventasSortState.column = null;
    } else {
      ventasSortState.direction = 'asc';
    }
  } else {
    ventasSortState.column = column;
    ventasSortState.direction = 'asc';
  }
  
  // Actualizar iconos
  document.querySelectorAll('#ventas-table thead th.sortable').forEach(header => {
    header.classList.remove('active');
    const icon = header.querySelector('.sort-icon');
    icon.className = 'fas fa-sort sort-icon';
  });
  
  // Si no hay ordenamiento, mostrar datos originales
  if (ventasSortState.direction === 'none') {
    aplicarFiltroEstado();
    return;
  }
  
  th.classList.add('active');
  const icon = th.querySelector('.sort-icon');
  if (ventasSortState.direction === 'asc') {
    icon.className = 'fas fa-sort-up sort-icon';
  } else if (ventasSortState.direction === 'desc') {
    icon.className = 'fas fa-sort-down sort-icon';
  }
  
  // Aplicar filtro (que incluye ordenamiento)
  aplicarFiltroEstado();
});

// Filtro de estados
let estadoFiltroActivo = null;

document.querySelector('.filterable-estado').addEventListener('click', (e) => {
  e.stopPropagation();
  
  // Remover menú existente si hay uno
  const menuExistente = document.querySelector('.filtro-estado-menu');
  if (menuExistente) {
    menuExistente.remove();
    return;
  }
  
  const th = e.currentTarget;
  const estados = [
    { value: null, icon: 'times', texto: 'Todos', color: 'secondary' },
    { value: 'por imprimir', icon: 'print', texto: 'Por Imprimir', color: 'danger' },
    { value: 'pendiente', icon: 'clock', texto: 'Pendiente', color: 'warning' },
    { value: 'en espera', icon: 'pause-circle', texto: 'En Espera', color: 'info' },
    { value: 'enviado', icon: 'check-circle', texto: 'Enviado', color: 'success' }
  ];
  
  const menu = document.createElement('div');
  menu.className = 'filtro-estado-menu card shadow-sm';
  menu.style.cssText = 'position: absolute; z-index: 1050; min-width: 200px;';
  
  let menuHTML = '<div class="list-group list-group-flush">';
  estados.forEach(estado => {
    const isActive = estadoFiltroActivo === estado.value ? 'active' : '';
    menuHTML += `
      <a href="#" class="list-group-item list-group-item-action ${isActive}" data-estado-filtro="${estado.value}">
        <i class="fas fa-${estado.icon} me-2 text-${estado.color}"></i>${estado.texto}
        ${isActive ? '<i class="fas fa-check float-end"></i>' : ''}
      </a>
    `;
  });
  menuHTML += '</div>';
  
  menu.innerHTML = menuHTML;
  
  // Posicionar el menú
  const rect = th.getBoundingClientRect();
  menu.style.top = `${rect.bottom + window.scrollY}px`;
  menu.style.left = `${rect.left + window.scrollX}px`;
  
  document.body.appendChild(menu);
  
  // Event listeners para las opciones del menú
  menu.querySelectorAll('.list-group-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const filtro = item.dataset.estadoFiltro;
      estadoFiltroActivo = filtro === 'null' ? null : filtro;
      
      // Actualizar icono del header
      const icon = th.querySelector('i');
      if (estadoFiltroActivo) {
        icon.className = 'fas fa-filter-circle-xmark ms-1';
        th.style.color = '#3498db';
      } else {
        icon.className = 'fas fa-filter ms-1';
        th.style.color = '';
      }
      
      // Aplicar filtro
      aplicarFiltroEstado();
      menu.remove();
    });
  });
  
  // Cerrar menú al hacer click fuera
  setTimeout(() => {
    document.addEventListener('click', function cerrarMenuFiltro(e) {
      if (!menu.contains(e.target) && !th.contains(e.target)) {
        menu.remove();
        document.removeEventListener('click', cerrarMenuFiltro);
      }
    });
  }, 100);
});

function aplicarFiltroEstado() {
  let datosFiltrados = ventasData;
  
  if (estadoFiltroActivo) {
    datosFiltrados = ventasData.filter(v => v.estado_pedido === estadoFiltroActivo);
  }
  
  // Si hay ordenamiento activo, aplicarlo también
  if (ventasSortState.column && ventasSortState.direction !== 'none') {
    const column = ventasSortState.column;
    datosFiltrados = [...datosFiltrados].sort((a, b) => {
      let valA, valB;
      
      if (column === 'fecha_venta') {
        valA = new Date(a.fecha_venta);
        valB = new Date(b.fecha_venta);
      } else if (column === 'cliente') {
        valA = `${a.nombre} ${a.apellido}`.toLowerCase();
        valB = `${b.nombre} ${b.apellido}`.toLowerCase();
      } else if (column === 'total_venta') {
        valA = Number(a.total_venta);
        valB = Number(b.total_venta);
      } else if (column === 'metodo_pago') {
        valA = a.metodo_pago.toLowerCase();
        valB = b.metodo_pago.toLowerCase();
      } else {
        valA = a[column];
        valB = b[column];
      }
      
      if (valA < valB) return ventasSortState.direction === 'asc' ? -1 : 1;
      if (valA > valB) return ventasSortState.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }
  
  renderVentasTable(datosFiltrados);
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
            <label class="form-label small mb-1">Descuento %</label>
            <input type="number" class="form-control form-control-sm" placeholder="0" value="${p.descuento}" min="0" max="100" data-idx="${idx}" data-field="descuento">
          </div>
        </div>
        <div class="mt-2 text-end">
          <strong>Subtotal: $${((p.precio_unitario_venta * p.cantidad) * (1 - p.descuento / 100)).toLocaleString()}</strong>
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
    productosVenta[idx].descuento = Math.min(Math.max(value, 0), 100);
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
    return sum + (p.precio_unitario_venta * p.cantidad) * (1 - p.descuento / 100);
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
      descuento_aplicado: (p.precio_unitario_venta * p.cantidad) * (p.descuento / 100)
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
  
  // Actualizar badge de alertas
  const badge = document.getElementById('alertas-badge');
  const badgeMobile = document.getElementById('alertas-badge-mobile');
  
  if (rows.length > 0) {
    if (badge) {
      badge.textContent = rows.length;
      badge.style.display = 'inline-block';
    }
    if (badgeMobile) {
      badgeMobile.textContent = rows.length;
      badgeMobile.style.display = 'inline-block';
    }
  } else {
    if (badge) badge.style.display = 'none';
    if (badgeMobile) badgeMobile.style.display = 'none';
  }
  
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
      <div>
        <button class="btn btn-sm btn-primary me-2" onclick="irAProducto('${r.SKU}')">
          <i class="fas fa-arrow-right me-1"></i>Ir
        </button>
        <button class="btn btn-sm btn-warning" onclick="resolverAlerta(${r.id_alerta})">
          <i class="fas fa-clock me-1"></i>Posponer
        </button>
      </div>
    </div>
  `).join('');
}

window.irAProducto = (sku) => {
  // Ir a la pestaña de productos
  document.querySelector('[data-bs-target="#tab-productos"]').click();
  
  // Esperar a que se renderice y resaltar el producto
  setTimeout(() => {
    resaltarProductoPorSKU(sku);
  }, 500);
};

window.resolverAlerta = async (id) => {
  await api.alertas.resolver(id);
  renderAlertas();
  checkAlertas();
};

async function checkAlertas() {
  const alertas = await api.alertas.list();
  
  // Actualizar badge de alertas
  const badge = document.getElementById('alertas-badge');
  const badgeMobile = document.getElementById('alertas-badge-mobile');
  
  if (alertas.length > 0) {
    if (badge) {
      badge.textContent = alertas.length;
      badge.style.display = 'inline-block';
    }
    if (badgeMobile) {
      badgeMobile.textContent = alertas.length;
      badgeMobile.style.display = 'inline-block';
    }
    
    alertas.forEach(a => {
      showNotification(
        `<strong>⚠️ Stock Bajo</strong><br>${a.nombre} (${a.SKU})<br>Stock: ${a.stock_actual} unidades`,
        'warning',
        () => {
          // Ir a la pestaña de productos
          document.querySelector('[data-bs-target="#tab-productos"]').click();
          
          // Esperar a que se renderice y resaltar el producto
          setTimeout(() => {
            resaltarProductoPorSKU(a.SKU);
          }, 500);
        }
      );
    });
  } else {
    if (badge) badge.style.display = 'none';
    if (badgeMobile) badgeMobile.style.display = 'none';
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

// Búsqueda de productos
document.getElementById('buscar-producto-input').addEventListener('input', (e) => {
  const query = e.target.value.toLowerCase().trim();
  const rows = document.querySelectorAll('#productos-table tbody tr');
  
  rows.forEach(row => {
    const nombre = row.cells[1]?.textContent.toLowerCase() || '';
    const sku = row.cells[2]?.textContent.toLowerCase() || '';
    const talla = row.cells[3]?.textContent.toLowerCase() || '';
    const color = row.cells[4]?.textContent.toLowerCase() || '';
    
    const matches = nombre.includes(query) || 
                   sku.includes(query) || 
                   talla.includes(query) || 
                   color.includes(query);
    
    row.style.display = matches ? '' : 'none';
  });
});

// Búsqueda de ventas
document.getElementById('buscar-venta-input').addEventListener('input', (e) => {
  const query = e.target.value.toLowerCase().trim();
  const rows = document.querySelectorAll('#ventas-table tbody tr');
  
  rows.forEach(row => {
    const fecha = row.cells[1]?.textContent.toLowerCase() || '';
    const cliente = row.cells[2]?.textContent.toLowerCase() || '';
    const total = row.cells[3]?.textContent.toLowerCase() || '';
    const metodo = row.cells[4]?.textContent.toLowerCase() || '';
    
    const matches = fecha.includes(query) || 
                   cliente.includes(query) || 
                   total.includes(query) || 
                   metodo.includes(query);
    
    row.style.display = matches ? '' : 'none';
  });
});

// Carga inicial
async function loadAll() {
  const rol = currentUser.rol;
  
  // Cargar dashboard para todos los roles
  await loadDashboard();
  
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

// ========== DASHBOARD ==========
let dashboardCharts = {
  lineChart: null,
  barChart: null,
  doughnutChart: null
};

let dashboardPeriodo = '7'; // Por defecto: última semana

async function loadDashboard() {
  try {
    // Cargar todas las métricas en paralelo
    const [stats, ventasTiempo, productosTop, stockBajo] = await Promise.all([
      api.dashboard.stats(dashboardPeriodo),
      api.dashboard.ventasTiempo(dashboardPeriodo),
      api.dashboard.productosTop(dashboardPeriodo, 10),
      api.dashboard.stockBajo()
    ]);

    // Actualizar KPIs
    document.getElementById('kpi-total-ventas').textContent = stats.totalVentas || 0;
    document.getElementById('kpi-ingresos').textContent = '$' + (parseInt(stats.ingresos) || 0).toLocaleString();
    document.getElementById('kpi-productos-vendidos').textContent = stats.productosVendidos || 0;
    document.getElementById('kpi-clientes').textContent = stats.clientesActivos || 0;

    // Renderizar gráficos
    renderVentasLineChart(ventasTiempo);
    renderProductosBarChart(productosTop);
    renderStockDoughnutChart(stockBajo);

  } catch (err) {
    console.error('Error cargando dashboard:', err);
    showNotification('Error al cargar el dashboard', 'danger');
  }
}

function renderVentasLineChart(datos) {
  const ctx = document.getElementById('ventasLineChart');
  
  // Destruir gráfico anterior si existe
  if (dashboardCharts.lineChart) {
    dashboardCharts.lineChart.destroy();
  }

  const labels = datos.map(d => {
    const fecha = new Date(d.fecha);
    return fecha.toLocaleDateString('es-CL', { day: '2-digit', month: 'short' });
  });
  
  const ventasData = datos.map(d => d.ventas);
  const ingresosData = datos.map(d => d.ingresos);

  dashboardCharts.lineChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Ventas',
          data: ventasData,
          borderColor: '#3498db',
          backgroundColor: 'rgba(52, 152, 219, 0.1)',
          tension: 0.4,
          fill: true,
          yAxisID: 'y'
        },
        {
          label: 'Ingresos ($)',
          data: ingresosData,
          borderColor: '#2ecc71',
          backgroundColor: 'rgba(46, 204, 113, 0.1)',
          tension: 0.4,
          fill: true,
          yAxisID: 'y1'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: {
          display: true,
          position: 'top'
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              if (context.dataset.yAxisID === 'y1') {
                label += '$' + context.parsed.y.toLocaleString();
              } else {
                label += context.parsed.y;
              }
              return label;
            }
          }
        }
      },
      scales: {
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          title: {
            display: true,
            text: 'Cantidad de Ventas'
          }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          title: {
            display: true,
            text: 'Ingresos ($)'
          },
          grid: {
            drawOnChartArea: false
          }
        }
      }
    }
  });
}

function renderProductosBarChart(datos) {
  const ctx = document.getElementById('productosBarChart');
  
  if (dashboardCharts.barChart) {
    dashboardCharts.barChart.destroy();
  }

  const labels = datos.map(d => d.nombre);
  const cantidades = datos.map(d => d.cantidad_vendida);
  
  dashboardCharts.barChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Unidades Vendidas',
        data: cantidades,
        backgroundColor: [
          '#3498db',
          '#2ecc71',
          '#9b59b6',
          '#f39c12',
          '#e74c3c',
          '#1abc9c',
          '#34495e',
          '#16a085',
          '#27ae60',
          '#2980b9'
        ],
        borderWidth: 0,
        barThickness: 25,
        maxBarThickness: 30
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return 'Vendidos: ' + context.parsed.x + ' unidades';
            }
          }
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Unidades'
          }
        }
      }
    }
  });
}

function renderStockDoughnutChart(datos) {
  const ctx = document.getElementById('stockDoughnutChart');
  
  if (dashboardCharts.doughnutChart) {
    dashboardCharts.doughnutChart.destroy();
  }

  // Agrupar por estado
  const estados = {
    'Sin Stock': 0,
    'Crítico': 0,
    'Bajo': 0
  };

  datos.forEach(d => {
    if (estados[d.estado] !== undefined) {
      estados[d.estado]++;
    }
  });

  dashboardCharts.doughnutChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Sin Stock', 'Crítico (1-5)', 'Bajo (6-10)'],
      datasets: [{
        data: [estados['Sin Stock'], estados['Crítico'], estados['Bajo']],
        backgroundColor: ['#e74c3c', '#f39c12', '#f1c40f'],
        borderWidth: 2,
        borderColor: '#fff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'bottom'
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return context.label + ': ' + context.parsed + ' productos';
            }
          }
        }
      }
    }
  });
}

// Event listeners para filtros de dashboard
document.getElementById('dashboard-filtros').addEventListener('click', async (e) => {
  if (e.target.tagName === 'BUTTON') {
    // Remover clase active de todos los botones
    document.querySelectorAll('#dashboard-filtros button').forEach(btn => {
      btn.classList.remove('active');
    });
    
    // Agregar clase active al botón clickeado
    e.target.classList.add('active');
    
    // Actualizar período y recargar dashboard
    dashboardPeriodo = e.target.getAttribute('data-periodo');
    await loadDashboard();
  }
});

// Event listener para KPI de clientes activos
document.getElementById('kpi-clientes-card').addEventListener('click', async () => {
  try {
    // Mostrar modal
    const modal = new bootstrap.Modal(document.getElementById('clientesModal'));
    modal.show();
    
    // Cargar datos
    const clientes = await api.dashboard.clientesDetalle();
    
    // Renderizar tabla
    const tbody = document.getElementById('clientes-modal-tbody');
    
    if (clientes.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No hay clientes registrados</td></tr>';
      return;
    }
    
    tbody.innerHTML = clientes.map(c => {
      const esActivo = c.es_activo === 1;
      const rowClass = esActivo ? 'cliente-activo' : 'cliente-inactivo';
      const ultimaCompra = c.ultima_compra 
        ? new Date(c.ultima_compra).toLocaleDateString('es-CL')
        : 'Sin compras';
      
      return `
        <tr class="${rowClass}">
          <td>${c.RUT}</td>
          <td>${c.nombre}</td>
          <td>${c.apellido}</td>
          <td>${c.email}</td>
          <td>${c.telefono || 'N/A'}</td>
          <td>${ultimaCompra}</td>
          <td>${c.total_compras || 0}</td>
        </tr>
      `;
    }).join('');
    
  } catch (err) {
    console.error('Error al cargar clientes:', err);
    alert('Error al cargar la información de clientes');
  }
});

// Event listener para gráfico de stock bajo
document.getElementById('stock-bajo-card').addEventListener('click', async () => {
  try {
    // Mostrar modal
    const modal = new bootstrap.Modal(document.getElementById('stockBajoModal'));
    modal.show();
    
    // Cargar datos
    const productos = await api.dashboard.stockBajo();
    
    // Renderizar tabla
    const tbody = document.getElementById('stock-modal-tbody');
    
    if (productos.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No hay productos con stock bajo</td></tr>';
      return;
    }
    
    tbody.innerHTML = productos.map(p => {
      let badgeStyle = '';
      let badgeText = '';
      
      if (p.estado === 'Sin Stock') {
        badgeStyle = 'background-color: #e74c3c; color: white;';
        badgeText = 'Sin Stock';
      } else if (p.estado === 'Crítico') {
        badgeStyle = 'background-color: #f39c12; color: white;';
        badgeText = 'Crítico';
      } else if (p.estado === 'Bajo') {
        badgeStyle = 'background-color: #f1c40f; color: #1a1a1a;';
        badgeText = 'Bajo';
      }
      
      return `
        <tr class="producto-row-clickable" data-sku="${p.SKU}" style="cursor: pointer;">
          <td><span class="badge" style="${badgeStyle}">${badgeText}</span></td>
          <td>${p.SKU}</td>
          <td>${p.nombre}</td>
          <td>${p.talla}</td>
          <td>${p.color}</td>
          <td><strong>${p.stock}</strong></td>
        </tr>
      `;
    }).join('');
    
    // Agregar event listeners a las filas
    document.querySelectorAll('.producto-row-clickable').forEach(row => {
      row.addEventListener('click', function() {
        const sku = this.dataset.sku;
        
        // Cerrar el modal
        bootstrap.Modal.getInstance(document.getElementById('stockBajoModal')).hide();
        
        // Ir a la pestaña de productos
        document.querySelector('[data-bs-target="#tab-productos"]').click();
        
        // Esperar a que se renderice la tabla
        setTimeout(() => {
          resaltarProductoPorSKU(sku);
        }, 500);
      });
      
      // Efecto hover
      row.addEventListener('mouseenter', function() {
        this.style.backgroundColor = '#f8f9fa';
      });
      
      row.addEventListener('mouseleave', function() {
        this.style.backgroundColor = '';
      });
    });
    
  } catch (err) {
    console.error('Error al cargar productos con stock bajo:', err);
    alert('Error al cargar la información de stock');
  }
});

// Función para resaltar producto por SKU
function resaltarProductoPorSKU(sku) {
  // Limpiar resaltados previos
  document.querySelectorAll('#productos-table tbody tr').forEach(row => {
    row.classList.remove('producto-resaltado');
  });
  
  // Buscar la fila del producto por data-sku
  const fila = document.querySelector(`#productos-table tbody tr[data-sku="${sku}"]`);
  
  if (fila) {
    // Agregar clase de resaltado
    fila.classList.add('producto-resaltado');
    
    // Hacer scroll a la fila
    fila.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Quitar el resaltado después de 5 segundos
    setTimeout(() => {
      fila.classList.remove('producto-resaltado');
    }, 5000);
  } else {
    console.warn('No se encontró el producto con SKU:', sku);
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

// ========== VALIDACIONES DE FORMULARIOS ==========

// Validación de RUT chileno
function validarRUT(rut) {
  // Remover puntos y guiones, convertir a mayúsculas
  const rutLimpio = rut.replace(/\./g, '').replace(/-/g, '').toUpperCase();
  
  // Verificar formato básico
  if (!/^[0-9]{7,8}[0-9K]$/.test(rutLimpio)) {
    return false;
  }
  
  const cuerpo = rutLimpio.slice(0, -1);
  const dv = rutLimpio.slice(-1);
  
  // Calcular dígito verificador
  let suma = 0;
  let multiplicador = 2;
  
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo[i]) * multiplicador;
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }
  
  const dvCalculado = 11 - (suma % 11);
  const dvFinal = dvCalculado === 11 ? '0' : dvCalculado === 10 ? 'K' : dvCalculado.toString();
  
  return dv === dvFinal;
}

// Formatear RUT automáticamente (agregar guión)
function formatearRUT(input) {
  let valor = input.value.replace(/\./g, '').replace(/-/g, '').toUpperCase();
  
  if (valor.length > 1) {
    const cuerpo = valor.slice(0, -1);
    const dv = valor.slice(-1);
    
    if (valor.length > 1) {
      input.value = cuerpo + '-' + dv;
    }
  }
}

// Validación de teléfono
function validarTelefono(telefono) {
  if (!telefono || telefono.trim() === '') return true; // Opcional
  return /^[0-9]{8,9}$/.test(telefono);
}

// Event listeners para validación en tiempo real de RUT
document.addEventListener('DOMContentLoaded', () => {
  // Campos de RUT
  const camposRUT = ['user-rut', 'cliente-rut'];
  
  camposRUT.forEach(id => {
    const input = document.getElementById(id);
    if (input) {
      // Formatear al perder el foco
      input.addEventListener('blur', function() {
        if (this.value) {
          formatearRUT(this);
          
          // Validar y mostrar feedback
          if (!validarRUT(this.value)) {
            this.classList.add('is-invalid');
            this.classList.remove('is-valid');
          } else {
            this.classList.add('is-valid');
            this.classList.remove('is-invalid');
          }
        }
      });
      
      // Limpiar validación al escribir
      input.addEventListener('input', function() {
        this.classList.remove('is-invalid', 'is-valid');
      });
    }
  });
  
  // Campos de teléfono (solo números)
  const camposTelefono = ['prov-telefono', 'user-telefono', 'cliente-telefono'];
  
  camposTelefono.forEach(id => {
    const input = document.getElementById(id);
    if (input) {
      // Solo permitir números
      input.addEventListener('input', function() {
        this.value = this.value.replace(/[^0-9]/g, '');
      });
      
      // Validar longitud
      input.addEventListener('blur', function() {
        if (this.value && !validarTelefono(this.value)) {
          this.classList.add('is-invalid');
          this.classList.remove('is-valid');
        } else if (this.value) {
          this.classList.add('is-valid');
          this.classList.remove('is-invalid');
        } else {
          this.classList.remove('is-invalid', 'is-valid');
        }
      });
      
      input.addEventListener('input', function() {
        if (!this.value) {
          this.classList.remove('is-invalid', 'is-valid');
        }
      });
    }
  });
});

// Inicialización
verificarAuth();
