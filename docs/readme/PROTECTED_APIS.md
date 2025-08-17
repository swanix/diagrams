# 🔐 APIs Protegidas - XDiagrams

## 📋 Resumen

XDiagrams implementa un sistema seguro de manejo de APIs protegidas que **nunca expone credenciales en el frontend**. Utiliza **Netlify Functions** como proxy seguro para manejar autenticación y acceso a APIs externas.

## 🏗️ Arquitectura de Seguridad

### Principios Fundamentales
- ❌ **Nunca** inyectar API Keys en el bundle del frontend
- ❌ **Nunca** exponer credenciales en el código cliente
- ✅ **Siempre** usar variables de entorno del servidor
- ✅ **Siempre** usar proxy serverless para APIs protegidas

### Flujo de Datos Seguro
```
Frontend → Netlify Function → API Externa → Netlify Function → Frontend
```

## 🚀 Implementación

### 1. Configuración del Frontend

#### Detección Automática de APIs Protegidas
```javascript
// src/js/modules/loader/source-detector.js
const protectedApiPatterns = [
  'sheet.best',
  'sheetbest.com', 
  'api.sheetbest.com'
];

// Detección automática
if (protectedApiPatterns.some(pattern => url.includes(pattern))) {
  return 'protected-api';
}
```

#### Carga de Datos Via Proxy
```javascript
// src/js/modules/loader/data-loader.js
async loadFromProtectedApi(url, options) {
  // Construir URL del proxy
  const proxyUrl = `/api/sheetbest-proxy?url=${encodeURIComponent(url)}`;
  
  // Llamada al proxy (sin credenciales en frontend)
  const response = await fetch(proxyUrl, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
  
  return response.json();
}
```

### 2. Netlify Function (Backend Seguro)

#### Estructura del Proyecto
```
netlify/
  functions/
    sheetbest-proxy.js    # Proxy para SheetBest
    [otro-proxy].js       # Otros proxies según necesidad
```

#### Implementación del Proxy
```javascript
// netlify/functions/sheetbest-proxy.js
const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE'
  };

  try {
    // Obtener API Key desde variables de entorno de Netlify
    const apiKey = process.env.VITE_SHEETBEST_API_KEY;
    
    if (!apiKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'API Key no configurada' })
      };
    }

    // Extraer URL de los query parameters
    const { url } = event.queryStringParameters || {};
    
    // Llamada a la API externa con credenciales
    const response = await fetch(url, {
      headers: {
        'X-Api-Key': apiKey,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data)
    };
    
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
```

### 3. Configuración de Netlify

#### netlify.toml
```toml
[build]
  functions = "netlify/functions"
  publish = "docs/demo"

[build.environment]
  NODE_VERSION = "18"

# Redirecciones para el proxy
[[redirects]]
  from = "/.netlify/functions/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200
```

#### Variables de Entorno en Netlify
```bash
# En el dashboard de Netlify > Site settings > Environment variables
VITE_SHEETBEST_API_KEY = tu_api_key_real_aqui
```

## 📝 Uso para Desarrolladores

### 1. Configuración Inicial

#### Crear el Proxy
```bash
# Crear directorio de funciones
mkdir -p netlify/functions

# Crear archivo del proxy
touch netlify/functions/sheetbest-proxy.js
```

#### Instalar Dependencias
```json
// package.json
{
  "dependencies": {
    "node-fetch": "^2.7.0"
  }
}
```

### 2. Configurar Variables de Entorno

#### Desarrollo Local
```bash
# .env.local
VITE_SHEETBEST_API_KEY=tu_api_key_aqui
```

#### Producción (Netlify)
```bash
# En Netlify Dashboard
VITE_SHEETBEST_API_KEY=tu_api_key_real_aqui
```

### 3. Uso en el Frontend

#### HTML Básico
```html
<!DOCTYPE html>
<html>
<head>
  <link href="xdiagrams.min.css" rel="stylesheet" />
</head>
<body>
  <div id="app"></div>
  
  <script>
    window.$xDiagrams = {
      url: "https://api.sheetbest.com/sheets/tu-sheet-id/tabs/TuTab",
      title: "Mi Diagrama Protegido",
      clustersPerRow: "6 3 7 6 3"
    };
  </script>
  
  <script src="xdiagrams.min.js"></script>
</body>
</html>
```

## 🔧 Testing y Debugging

### 1. Testing Local con Netlify CLI
```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Ejecutar en modo desarrollo
netlify dev

# El servidor se ejecutará en puerto 8888
# Las funciones estarán disponibles en /api/
```

### 2. Debugging del Proxy
```javascript
// Agregar logs en la función
console.log('🚀 [Netlify Function] Function invoked');
console.log('🔍 [Netlify Function] Environment check:', {
  hasApiKey: !!apiKey,
  apiKeyLength: apiKey ? apiKey.length : 0
});
```

### 3. Verificación de Seguridad
```bash
# Verificar que no hay API Keys en el bundle
grep -r "tu_api_key" docs/demo/

# Verificar que las funciones están configuradas
ls netlify/functions/

# Verificar variables de entorno en Netlify
netlify env:list
```

## 🛡️ Ventajas de Seguridad

### ✅ Beneficios
1. **Cero exposición de credenciales** en el frontend
2. **Variables de entorno seguras** en el servidor
3. **CORS manejado automáticamente** por Netlify
4. **Escalabilidad automática** con serverless
5. **Logs centralizados** en Netlify Functions
6. **Fácil rotación de credenciales** sin cambios en código

### ❌ Lo que NO se hace
- ❌ Inyectar variables de entorno en el bundle
- ❌ Hardcodear API Keys en archivos JavaScript
- ❌ Exponer credenciales en logs del frontend
- ❌ Usar archivos de configuración con credenciales

## 🔄 Migración desde Implementación Anterior

### Antes (Inseguro)
```javascript
// ❌ API Key expuesta en el frontend
const apiKey = process.env.VITE_SHEETBEST_API_KEY;
const response = await fetch(url, {
  headers: { 'X-Api-Key': apiKey }
});
```

### Después (Seguro)
```javascript
// ✅ Sin credenciales en el frontend
const proxyUrl = `/api/sheetbest-proxy?url=${encodeURIComponent(url)}`;
const response = await fetch(proxyUrl);
```

## 📚 Casos de Uso Soportados

### 1. SheetBest API
- ✅ **URLs soportadas**: `api.sheetbest.com`, `sheet.best`
- ✅ **Autenticación**: `X-Api-Key` header
- ✅ **Formato de respuesta**: JSON automático

### 2. APIs Personalizadas
Para agregar nuevas APIs protegidas:

1. **Crear nuevo proxy** en `netlify/functions/`
2. **Agregar patrones** en `source-detector.js`
3. **Configurar variables** de entorno en Netlify
4. **Actualizar documentación**

## 🚨 Troubleshooting

### Error: "API Key no configurada"
```bash
# Verificar variable en Netlify
netlify env:list

# Verificar en función
console.log('API Key presente:', !!process.env.VITE_SHEETBEST_API_KEY);
```

### Error: "You do not have permission"
```bash
# Verificar permisos de la API Key
# Verificar que la URL es correcta
# Verificar que la API Key tiene acceso al recurso
```

### Error: CORS
```javascript
// Verificar headers en la función
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE'
};
```

## 📋 Checklist de Implementación

- [ ] Crear directorio `netlify/functions/`
- [ ] Implementar proxy para la API
- [ ] Configurar `netlify.toml`
- [ ] Agregar variables de entorno en Netlify
- [ ] Actualizar patrones de detección
- [ ] Probar en desarrollo local
- [ ] Probar en producción
- [ ] Verificar logs de seguridad
- [ ] Documentar para el equipo

## 🎯 Conclusión

Esta implementación proporciona un sistema robusto y seguro para manejar APIs protegidas en XDiagrams, siguiendo las mejores prácticas de seguridad web y manteniendo la simplicidad de uso para los desarrolladores.

**La seguridad es prioritaria: las credenciales nunca tocan el frontend.** 🔒
