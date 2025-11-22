# 🚀 Guía de Despliegue - WhiteStyles

## 📋 Opciones para Mostrar al Cliente

### ✅ Opción 1: Acceso en Red Local (RECOMENDADO - Más Simple)

**Requisitos:** Tu PC y la laptop del cliente en la misma red WiFi

**Pasos:**

1. **En tu PC:**
   ```powershell
   cd "c:\Users\Payiyu\Documents\1 PROGRAMASION\WhiteStyles\PrototipoCuatro"
   npm start
   ```

2. **Desde la laptop del cliente:**
   - Abrir navegador
   - Ir a: `http://192.168.100.120:3000`
   - Login: `admin` / `admin123`

**Ventajas:**
- ✅ No requiere instalación en la laptop
- ✅ Base de datos en tu PC (control total)
- ✅ Funcionamiento inmediato

---

### ✅ Opción 2: Copiar Todo a la Laptop del Cliente

**Archivos a copiar:**
- Toda la carpeta `PrototipoCuatro`

**Pasos en la laptop del cliente:**

1. **Instalar Node.js** (si no lo tiene):
   - Descargar de: https://nodejs.org (versión LTS)
   - Instalar con opciones por defecto

2. **Copiar la carpeta completa**

3. **Abrir PowerShell en la carpeta** y ejecutar:
   ```powershell
   npm install
   npm start
   ```

4. **Abrir navegador en:**
   - `http://localhost:3000`
   - Login: `admin` / `admin123`

**Ventajas:**
- ✅ Funciona sin conexión a internet
- ✅ El cliente puede probar solo
- ✅ Datos se guardan localmente

---

### ✅ Opción 3: Desplegar en Internet (Para Acceso Remoto)

**Plataformas gratuitas recomendadas:**

#### A) Render.com (RECOMENDADO)

1. **Crear cuenta en:** https://render.com

2. **Modificar `package.json`** - agregar:
   ```json
   "scripts": {
     "start": "node server.js",
     "build": "npm install"
   },
   "engines": {
     "node": ">=18.0.0"
   }
   ```

3. **Crear nuevo Web Service:**
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Free tier

4. **URL generada:** `https://whitestyles.onrender.com`

**Nota:** La base de datos SQLite funciona, pero los datos se pierden al reiniciar. Para producción, migrar a PostgreSQL.

#### B) Railway.app

Similar a Render, con 500 horas gratis al mes.

#### C) Vercel / Netlify

Requieren adaptación del backend (serverless functions).

---

### ✅ Opción 4: Usar ngrok (Túnel Temporal)

**Para mostrar rápido sin configuración:**

1. **Descargar ngrok:** https://ngrok.com/download

2. **En tu PC:**
   ```powershell
   # Terminal 1
   npm start

   # Terminal 2 (en otra ventana)
   ngrok http 3000
   ```

3. **Compartir URL generada:**
   - Ejemplo: `https://abc123.ngrok.io`
   - Válida por 8 horas (gratis)

---

## 🔧 Configuración del Firewall (Para Opción 1)

Si la laptop no puede conectarse:

```powershell
# Ejecutar como Administrador
New-NetFirewallRule -DisplayName "WhiteStyles" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow
```

---

## 📦 Crear Paquete Portable (Para Llevar en USB)

```powershell
# Comprimir carpeta completa
Compress-Archive -Path "PrototipoCuatro" -DestinationPath "WhiteStyles-Portable.zip"
```

**En la laptop del cliente:**
1. Descomprimir ZIP
2. Instalar Node.js (solo primera vez)
3. `npm install` (solo primera vez)
4. `npm start`

---

## 🗄️ Migración de Datos

### Backup de la Base de Datos:

```powershell
# Copiar base de datos
Copy-Item "db\data.db" -Destination "backup\data-$(Get-Date -Format 'yyyyMMdd-HHmm').db"
```

### Restaurar en otra máquina:

```powershell
# Pegar data.db en la carpeta db/ del nuevo sistema
```

---

## 🌐 Producción Real (Futuro)

**Para un sistema en producción:**

1. **Base de Datos:**
   - Migrar de SQLite a PostgreSQL/MySQL
   - Usar servicio cloud: Supabase, PlanetScale, etc.

2. **Backend:**
   - Desplegar en: Render, Railway, DigitalOcean
   - Variables de entorno para configuración

3. **Frontend:**
   - Separar en carpeta `client/`
   - Desplegar en Vercel/Netlify (opcional)

4. **Seguridad:**
   - HTTPS obligatorio
   - Tokens con expiración corta
   - Rate limiting

---

## 🆘 Solución de Problemas

### Error: "Cannot GET /"
- Verificar que `public/index.html` existe

### Error: "Port 3000 already in use"
```powershell
# Matar proceso en puerto 3000
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process
```

### No se pueden conectar desde la laptop
1. Verificar firewall
2. Confirmar que están en la misma red
3. Probar con IP: `ipconfig` en tu PC

---

## 📞 Credenciales de Demo

**Usuario Administrador:**
- Usuario: `admin`
- Contraseña: `admin123`

**Datos de Prueba:**
- 4 Proveedores
- 8 Productos (variados)
- 3 Clientes

---

## ✅ Checklist Pre-Demostración

- [ ] Base de datos con datos de ejemplo
- [ ] Servidor corriendo (`npm start`)
- [ ] Probado en navegador local
- [ ] Firewall configurado (si usas red local)
- [ ] Cliente puede hacer login
- [ ] Todas las funcionalidades probadas:
  - [ ] CRUD Productos
  - [ ] CRUD Proveedores
  - [ ] Registro de Ventas
  - [ ] Alertas de Stock
  - [ ] Reportes
  - [ ] Gestión de Usuarios (admin)
