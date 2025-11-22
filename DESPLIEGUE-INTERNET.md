# 🌐 Guía de Despliegue en Internet - WhiteStyles

## 📋 Opciones para Acceso Remoto (Diferentes Redes)

---

## ⚡ OPCIÓN 1: ngrok (Rápido - Temporal)

**Ideal para:** Demostración inmediata, presentaciones, pruebas

**Tiempo de configuración:** 5 minutos

### Pasos:

1. **Descargar ngrok:**
   - Ve a: https://ngrok.com/download
   - Descarga la versión para Windows
   - Extrae `ngrok.exe` en la carpeta del proyecto

2. **Ejecutar el script:**
   ```powershell
   .\start-ngrok.ps1
   ```

3. **Obtendrás una URL pública:**
   ```
   Forwarding: https://abc123.ngrok.io -> http://localhost:3000
   ```

4. **Compartir la URL con el cliente:**
   - Envía: `https://abc123.ngrok.io`
   - Usuario: `admin`
   - Contraseña: `admin123`

### Ventajas:
- ✅ Configuración en minutos
- ✅ No requiere cuenta (gratis)
- ✅ HTTPS automático
- ✅ Funciona desde cualquier lugar

### Desventajas:
- ⚠️ URL cambia cada vez que reinicias
- ⚠️ Límite de 40 conexiones/minuto (gratis)
- ⚠️ Tu PC debe estar encendida

**Duración:** La sesión dura 2 horas en plan gratuito (se puede reiniciar)

---

## 🚀 OPCIÓN 2: Render.com (Permanente - Gratis)

**Ideal para:** Despliegue de producción, acceso 24/7, múltiples usuarios

**Tiempo de configuración:** 15-20 minutos

### Pasos:

1. **Crear cuenta en Render:**
   - Ve a: https://render.com
   - Regístrate con GitHub (gratis)

2. **Subir tu código a GitHub:**
   
   ```powershell
   # En la carpeta del proyecto
   git init
   git add .
   git commit -m "WhiteStyles - Sistema de gestión"
   
   # Crear repositorio en GitHub y seguir instrucciones para push
   ```

3. **Crear Web Service en Render:**
   - Click en "New +" → "Web Service"
   - Conectar tu repositorio de GitHub
   - Configuración:
     - **Name:** whitestyles
     - **Environment:** Node
     - **Build Command:** `npm install`
     - **Start Command:** `npm start`
     - **Plan:** Free

4. **Desplegar:**
   - Click en "Create Web Service"
   - Esperar 5-10 minutos

5. **Tu URL será:**
   ```
   https://whitestyles.onrender.com
   ```

### Ventajas:
- ✅ Acceso permanente 24/7
- ✅ URL fija y personalizable
- ✅ HTTPS automático
- ✅ No requiere tu PC encendida
- ✅ 750 horas gratis/mes

### Desventajas:
- ⚠️ La app se "duerme" tras 15 min de inactividad (tarda 30s en despertar)
- ⚠️ Los datos se pierden al reiniciar (SQLite no es persistente en Render)

**Solución para datos:** Para producción real, migrar a PostgreSQL (Render lo ofrece gratis)

---

## 🔥 OPCIÓN 3: Cloudflare Tunnel (Avanzado)

**Ideal para:** Máximo control, sin límites de tiempo

### Pasos:

1. **Descargar Cloudflare Tunnel:**
   ```powershell
   winget install Cloudflare.cloudflared
   ```

2. **Iniciar túnel:**
   ```powershell
   # Terminal 1
   npm start
   
   # Terminal 2
   cloudflared tunnel --url http://localhost:3000
   ```

3. **Obtener URL:**
   ```
   https://random-name.trycloudflare.com
   ```

### Ventajas:
- ✅ Sin límites de conexiones
- ✅ Más rápido que ngrok
- ✅ HTTPS automático

### Desventajas:
- ⚠️ URL cambia cada vez
- ⚠️ Requiere instalación adicional

---

## 🏢 OPCIÓN 4: Railway.app

Similar a Render, también gratis:

1. **Cuenta en:** https://railway.app
2. **Deploy desde GitHub**
3. **500 horas gratis/mes**
4. **URL:** `https://whitestyles.up.railway.app`

---

## 📊 Comparación Rápida:

| Opción | Tiempo Setup | Costo | Duración | Requiere PC |
|--------|--------------|-------|----------|-------------|
| **ngrok** | 5 min | Gratis | 2h/sesión | ✅ Sí |
| **Render** | 20 min | Gratis | 24/7 | ❌ No |
| **Cloudflare** | 10 min | Gratis | Mientras ejecutes | ✅ Sí |
| **Railway** | 20 min | Gratis | 24/7 | ❌ No |

---

## 🎯 Recomendación por Escenario:

### 📱 **Para demostración HOY (en 5 minutos):**
```powershell
# Opción: ngrok
.\start-ngrok.ps1
```

### 🌐 **Para que el cliente pruebe varios días:**
```
Opción: Render.com
- Despliegue permanente
- No requiere tu PC encendida
```

### 💼 **Para producción real:**
```
Opción: Render + PostgreSQL
- Base de datos persistente
- Backups automáticos
- Escalable
```

---

## 🔧 Script ngrok - Uso:

```powershell
# 1. Descargar ngrok de https://ngrok.com/download
# 2. Poner ngrok.exe en la carpeta del proyecto
# 3. Ejecutar:
.\start-ngrok.ps1

# 4. Compartir la URL que aparece
# Ejemplo: https://1234-abcd.ngrok.io
```

---

## ⚠️ IMPORTANTE - Seguridad:

Si despliegas en Internet:

1. **Cambiar contraseña del admin:**
   - En `db/init.sql` modificar el hash de la contraseña
   
2. **Variables de entorno:**
   ```javascript
   // En Render, agregar:
   JWT_SECRET=tu-secreto-super-seguro-aqui
   ```

3. **CORS configurado:**
   - Ya está configurado en `server.js`

4. **HTTPS:**
   - Todas las opciones proveen HTTPS automático

---

## 📞 Soporte:

Para cualquier duda sobre el despliegue, revisar:
- Documentación de ngrok: https://ngrok.com/docs
- Documentación de Render: https://render.com/docs
- O contactar con el desarrollador

---

## ✅ Checklist Pre-Despliegue:

- [ ] Datos de ejemplo en la base de datos
- [ ] Contraseñas seguras (para producción)
- [ ] Todos los archivos commiteados en Git (si usas Render)
- [ ] Variables de entorno configuradas
- [ ] Probado localmente (http://localhost:3000)
