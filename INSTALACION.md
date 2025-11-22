# 🚀 Instalación Rápida - WhiteStyles

## Para ejecutar en otra computadora:

### 📋 Requisitos Previos:
1. **Node.js 18 o superior** 
   - Descargar de: https://nodejs.org
   - Elegir la versión "LTS" (recomendada)
   - Instalar con las opciones predeterminadas

### 🔧 Pasos de Instalación:

1. **Copiar esta carpeta completa** a la nueva computadora

2. **Abrir PowerShell** en esta carpeta:
   - Clic derecho en la carpeta → "Abrir en Terminal"
   - O navegar con: `cd ruta\a\PrototipoCuatro`

3. **Ejecutar el script de inicio:**
   ```powershell
   .\start.ps1
   ```

4. **Abrir navegador en:**
   ```
   http://localhost:3000
   ```

5. **Iniciar sesión:**
   - Usuario: `admin`
   - Contraseña: `admin123`

---

## 🌐 Acceso desde Otros Dispositivos (Misma Red WiFi)

Si quieres acceder desde un teléfono o tablet en la misma red:

1. Ejecuta el servidor con `.\start.ps1`
2. El script mostrará la IP local (ejemplo: 192.168.1.100)
3. Desde el otro dispositivo, abre: `http://192.168.1.100:3000`

---

## ⚠️ Solución de Problemas

### "No se puede ejecutar scripts en este sistema"

Ejecutar en PowerShell como Administrador:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Luego volver a intentar `.\start.ps1`

### "Puerto 3000 ya está en uso"

```powershell
# Detener proceso en puerto 3000
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force
```

### Instalación manual (si el script no funciona)

```powershell
npm install
npm start
```

---

## 📦 Datos Incluidos

El sistema incluye datos de demostración:
- ✅ 1 Usuario administrador (admin/admin123)
- ✅ 4 Proveedores de ejemplo
- ✅ 8 Productos variados
- ✅ 3 Clientes registrados

Todos los datos se guardan en `db/data.db`

---

## 🔐 Seguridad

**IMPORTANTE:** Esta es una versión de demostración local.

Para uso en producción:
- Cambiar todas las contraseñas
- Usar base de datos en servidor dedicado
- Configurar HTTPS
- Implementar backups automáticos

---

## 📞 Soporte

Para cualquier duda o problema, contactar con el desarrollador.
