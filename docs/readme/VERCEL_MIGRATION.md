# 🚀 Migración a Vercel Functions

## 📋 Resumen

La implementación de APIs Protegidas de XDiagrams es **100% portable** a Vercel Functions. Solo necesitas adaptar la estructura de archivos y configuración.

## 🔄 Cambios Necesarios

### 1. Estructura de Archivos

#### Antes (Netlify)
```
netlify/
  functions/
    sheetbest-proxy.js
netlify.toml
```

#### Después (Vercel)
```
api/
  sheetbest-proxy.js
vercel.json
```

### 2. Función Adaptada para Vercel

```javascript
// api/sheetbest-proxy.js
const fetch = require('node-fetch');

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');

  // Manejar preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Obtener API Key desde variables de entorno de Vercel
    const apiKey = process.env.SHEETBEST_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({
        error: 'API Key no configurada en el servidor',
        suggestion: 'Verifica que SHEETBEST_API_KEY esté configurada en Vercel'
      });
    }

    // Extraer la URL de SheetBest de los query parameters
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({
        error: 'URL de SheetBest no proporcionada',
        suggestion: 'Proporciona la URL como query parameter: ?url=https://api.sheetbest.com/...'
      });
    }

    const response = await fetch(url, {
      headers: {
        'X-Api-Key': apiKey,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({
        error: `Error desde SheetBest: ${response.status}`,
        details: errorText
      });
    }

    const data = await response.json();
    
    return res.status(200).json(data);
    
  } catch (error) {
    return res.status(500).json({
      error: 'Error interno del servidor',
      details: error.message
    });
  }
};
```

### 3. Configuración de Vercel

```json
// vercel.json
{
  "functions": {
    "api/sheetbest-proxy.js": {
      "maxDuration": 10
    }
  },
  "env": {
    "SHEETBEST_API_KEY": "@sheetbest-api-key"
  }
}
```

### 4. Variables de Entorno en Vercel

```bash
# Usar Vercel CLI
vercel env add SHEETBEST_API_KEY

# O en el dashboard de Vercel
# Project Settings > Environment Variables
```

## 🔧 Diferencias Principales

| Aspecto | Netlify | Vercel |
|---|---|---|
| **Estructura** | `netlify/functions/` | `api/` |
| **Configuración** | `netlify.toml` | `vercel.json` |
| **Handler** | `exports.handler` | `module.exports` |
| **Request/Response** | `event, context` | `req, res` |
| **Query Params** | `event.queryStringParameters` | `req.query` |
| **CORS** | Headers en response | `res.setHeader()` |

## 🚀 Comandos de Migración

```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Inicializar proyecto
vercel

# 3. Configurar variables de entorno
vercel env add SHEETBEST_API_KEY

# 4. Deploy
vercel --prod
```

## ✅ Ventajas de Vercel

- **Mejor performance** en edge functions
- **Integración nativa** con Next.js
- **Analytics** más detallados
- **Edge caching** automático
- **CI/CD** con GitHub

---

**La migración es directa y mantiene toda la funcionalidad de seguridad.** 🔒
