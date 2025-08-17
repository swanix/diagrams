# Configuración de Netlify Functions para APIs Protegidas

## 🎯 **Enfoque Seguro**

Este proyecto usa **Netlify Functions** para manejar APIs protegidas de forma segura, sin exponer API Keys en el frontend.

## 📁 **Estructura de Archivos**

```
netlify/
  functions/
    sheetbest-proxy.js    # Proxy para SheetBest API
netlify.toml              # Configuración de Netlify
```

## 🔧 **Configuración en Netlify**

### 1. Variables de Entorno

En tu dashboard de Netlify, ve a **Site settings > Environment variables** y agrega:

```
VITE_SHEETBEST_API_KEY = tu_api_key_de_sheetbest
```

### 2. Despliegue

1. Conecta tu repositorio a Netlify
2. Configura el directorio de build como `docs`
3. Las funciones se desplegarán automáticamente

## 🚀 **Cómo Funciona**

### Frontend (Seguro)
```javascript
// El frontend llama a la Netlify Function
fetch('/api/sheetbest-proxy?url=https://api.sheetbest.com/...')
```

### Backend (Seguro)
```javascript
// La Netlify Function usa la API Key desde variables de entorno
const apiKey = process.env.VITE_SHEETBEST_API_KEY;
fetch(url, { headers: { 'X-Api-Key': apiKey } })
```

## 🔍 **Testing Local**

Para probar localmente:

1. Instala Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Ejecuta el servidor de desarrollo:
   ```bash
   netlify dev
   ```

3. Las funciones estarán disponibles en `http://localhost:8888/.netlify/functions/`

## 📊 **Ventajas de Seguridad**

- ✅ **API Keys nunca en el frontend**
- ✅ **Variables de entorno seguras en Netlify**
- ✅ **CORS configurado correctamente**
- ✅ **Logs de errores detallados**
- ✅ **Fácil de mantener y escalar**

## 🛠 **Troubleshooting**

### Error: "API Key no configurada"
- Verifica que `VITE_SHEETBEST_API_KEY` esté configurada en Netlify
- Revisa los logs de la función en Netlify

### Error: "CORS"
- La función ya incluye headers CORS apropiados
- Verifica que estés llamando desde el dominio correcto

### Error: "Function not found"
- Asegúrate de que el archivo esté en `netlify/functions/`
- Verifica que `netlify.toml` esté configurado correctamente
