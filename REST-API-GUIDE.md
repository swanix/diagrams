# 🚀 Guía de APIs REST para Swanix Diagrams

## 📋 Resumen

Swanix Diagrams ahora soporta múltiples fuentes de datos, incluyendo **APIs REST** que permiten mayor privacidad y flexibilidad. Esto es especialmente útil para usuarios que quieren usar servicios como **SheetDB** o **Sheetson** para convertir Google Sheets en APIs privadas.

## 🌟 Nuevas Funcionalidades

### ✅ Fuentes de Datos Soportadas

1. **📄 Archivos CSV locales** (drag & drop)
2. **🌐 URLs CSV remotas** (Google Sheets, archivos en servidor)
3. **🔗 APIs REST** (SheetDB, Sheetson, Airtable, APIs personalizadas)
4. **📊 Objetos con datos** (ya procesados)

### 🔍 Detección Automática

La librería detecta automáticamente el tipo de fuente de datos basándose en la URL:

- **APIs REST**: URLs que contienen `api.`, `.json`, `/api/`, `sheetdb.io`, `sheetson.com`, etc.
- **CSV**: URLs que terminan en `.csv` o contienen `output=csv`
- **Google Sheets**: URLs que contienen `google.com/spreadsheets`

## 🛠️ Configuración

### Configuración Básica

```javascript
window.$xDiagrams = {
  title: "Mi Diagrama",
  diagrams: [
    {
      name: "Mi API SheetDB",
      url: "https://sheetdb.io/api/v1/YOUR_SHEET_ID",
      edit: "https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit"
    },
    {
      name: "Mi API Sheetson", 
      url: "https://api.sheetson.com/v2/sheets/YOUR_SHEET_ID",
      edit: "https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit"
    }
  ],
  // ... resto de configuración
};
```

### Configuración Avanzada

```javascript
window.$xDiagrams = {
  title: "Diagrama Avanzado",
  diagrams: [
    {
      name: "API con Autenticación",
      url: "https://api.example.com/data",
      headers: {
        "Authorization": "Bearer YOUR_TOKEN",
        "Content-Type": "application/json"
      },
      edit: "https://admin.example.com/edit"
    }
  ],
  hooks: {
    onLoad: function(diagram) {
      console.log('Fuente de datos:', diagram.sourceType);
      console.log('Registros cargados:', diagram.data.length);
    }
  }
};
```

## 📊 Formato de Datos

### Estructura JSON Esperada

Tu API debe devolver uno de estos formatos:

#### 1. Array de Objetos (Recomendado)
```json
[
  {
    "Node": "ROOT",
    "Name": "Empresa",
    "Parent": "",
    "Type": "company",
    "URL": "https://empresa.com",
    "Description": "Descripción de la empresa"
  },
  {
    "Node": "DEV",
    "Name": "Desarrollo", 
    "Parent": "ROOT",
    "Type": "department",
    "URL": "https://github.com",
    "Description": "Equipo de desarrollo"
  }
]
```

#### 2. Objeto con Propiedad `data`
```json
{
  "data": [
    {
      "Node": "ROOT",
      "Name": "Empresa",
      "Parent": "",
      "Type": "company"
    }
  ]
}
```

#### 3. Formato Airtable
```json
{
  "records": [
    {
      "fields": {
        "Node": "ROOT",
        "Name": "Empresa",
        "Parent": "",
        "Type": "company"
      }
    }
  ]
}
```

### Mapeo de Columnas

La librería usa esta configuración por defecto:

```javascript
columns: {
  id: "Node",        // ID único del nodo
  name: "Name",      // Nombre del nodo
  parent: "Parent",  // ID del nodo padre
  img: "thumbnail",  // Identificador de imagen/icono
  url: "URL",        // Enlace del nodo
  type: "Type",      // Tipo de nodo
  subtitle: "Description" // Descripción
}
```

## 🔧 Servicios Soportados

### 1. SheetDB.io

**Ventajas:**
- ✅ Fácil de configurar
- ✅ API REST automática
- ✅ Soporte para Google Sheets
- ✅ Gratis para uso básico

**Configuración:**
1. Ve a [sheetdb.io](https://sheetdb.io)
2. Sube tu Google Sheet o crea uno nuevo
3. Copia la URL de la API
4. Úsala en tu configuración

```javascript
{
  name: "SheetDB Example",
  url: "https://sheetdb.io/api/v1/YOUR_SHEET_ID"
}
```

### 2. Sheetson.com

**Ventajas:**
- ✅ API REST completa
- ✅ CRUD operations
- ✅ Autenticación avanzada
- ✅ Webhooks

**Configuración:**
1. Ve a [sheetson.com](https://sheetson.com)
2. Conecta tu Google Sheet
3. Obtén la URL de la API
4. Configura autenticación si es necesario

```javascript
{
  name: "Sheetson Example",
  url: "https://api.sheetson.com/v2/sheets/YOUR_SHEET_ID"
}
```

### 3. Airtable

**Ventajas:**
- ✅ Base de datos completa
- ✅ API robusta
- ✅ Colaboración en tiempo real

**Configuración:**
```javascript
{
  name: "Airtable Example",
  url: "https://api.airtable.com/v0/YOUR_BASE_ID/YOUR_TABLE_NAME",
  headers: {
    "Authorization": "Bearer YOUR_API_KEY"
  }
}
```

### 4. APIs Personalizadas

Puedes usar cualquier API que devuelva JSON en el formato correcto:

```javascript
{
  name: "Mi API",
  url: "https://api.miservicio.com/diagram-data",
  headers: {
    "Authorization": "Bearer YOUR_TOKEN"
  }
}
```

## 🚀 Ejemplos Prácticos

### Ejemplo 1: SheetDB Básico

```html
<!DOCTYPE html>
<html>
<head>
  <title>Diagrama con SheetDB</title>
  <script src="xloader.js"></script>
  <link href="xdiagrams.css" rel="stylesheet">
  <script src="https://d3js.org/d3.v7.min.js"></script>
  <script src="https://unpkg.com/papaparse@5.3.0/papaparse.min.js"></script>
</head>
<body>
<div class="xcanvas"></div>
<script>
window.$xDiagrams = {
  title: "Mi Organigrama",
  diagrams: [
    {
      name: "Organigrama Empresa",
      url: "https://sheetdb.io/api/v1/abc123def456",
      edit: "https://docs.google.com/spreadsheets/d/abc123def456/edit"
    }
  ],
  columns: {
    id: "ID",
    name: "Nombre", 
    parent: "Jefe",
    type: "Departamento",
    url: "LinkedIn",
    subtitle: "Descripción"
  }
};
</script>
<script src="xdiagrams.js"></script>
</body>
</html>
```

### Ejemplo 2: Múltiples Fuentes

```javascript
window.$xDiagrams = {
  title: "Dashboard Completo",
  diagrams: [
    {
      name: "Organigrama (SheetDB)",
      url: "https://sheetdb.io/api/v1/org-chart"
    },
    {
      name: "Proyectos (Sheetson)",
      url: "https://api.sheetson.com/v2/sheets/projects"
    },
    {
      name: "Clientes (Airtable)",
      url: "https://api.airtable.com/v0/app123/Clientes"
    },
    {
      name: "Backup Local",
      url: "data/backup.csv"
    }
  ]
};
```

## 🔒 Privacidad y Seguridad

### Ventajas de las APIs REST

1. **🔐 Privacidad**: Los datos no están expuestos públicamente
2. **🔑 Autenticación**: Puedes usar tokens y API keys
3. **📊 Control**: Acceso granular a los datos
4. **🔄 Actualizaciones**: Datos en tiempo real
5. **📈 Escalabilidad**: Manejo de grandes volúmenes de datos
6. **📦 Cache Inteligente**: Reduce llamadas a la API automáticamente

### Mejores Prácticas

1. **Usa HTTPS** para todas las APIs
2. **Implementa autenticación** cuando sea posible
3. **Configura CORS** correctamente en tu servidor
4. **Usa rate limiting** para proteger tu API
5. **Mantén backups** de tus datos

### Mejores Prácticas para Cache

1. **Configura TTL apropiado** según la frecuencia de cambios de tus datos
2. **Monitorea el uso del cache** regularmente con `xDiagramsCache.stats()`
3. **Limpia cache manualmente** cuando actualices datos importantes
4. **Usa diferentes configuraciones** para desarrollo y producción
5. **Implementa invalidación automática** para datos críticos
6. **Mantén el cache bajo 8MB** para evitar limpieza automática
7. **Documenta tus configuraciones de cache** en tu proyecto

## 📦 Sistema de Cache Inteligente

### ¿Qué es?

El sistema de cache inteligente reduce automáticamente las llamadas a la API almacenando los datos en el navegador. Esto es especialmente útil para servicios con límites de API como SheetDB (500 llamadas/mes).

### ¿Cómo funciona?

1. **Primera carga**: Se hace una llamada a la API y se guarda en cache
2. **Cargas posteriores**: Se usa el cache (más rápido, sin llamada a API)
3. **Expiración automática**: El cache se limpia después de 1 hora
4. **Límite de tamaño**: Máximo 10MB de cache

### Comandos de Consola

Puedes gestionar el cache desde la consola del navegador:

```javascript
// Ver estadísticas del cache
xDiagramsCache.stats()

// Listar todas las URLs cacheadas
xDiagramsCache.list()

// Ver tamaño del cache
xDiagramsCache.size()

// Limpiar cache específico
xDiagramsCache.clear('https://sheetdb.io/api/v1/YOUR_ID')

// Limpiar todo el cache
xDiagramsCache.clearAll()

// Forzar actualización (limpiar cache y recargar)
xDiagramsCache.refresh('https://sheetdb.io/api/v1/YOUR_ID')
```

### Configuración del Cache

#### Configuración Básica
```javascript
// El cache se configura automáticamente, pero puedes ajustar:
const CACHE_CONFIG = {
  DEFAULT_TTL: 60 * 60 * 1000,  // 1 hora en milisegundos
  MAX_SIZE: 10,                 // 10MB máximo
  VERSION: '1.0'                // Versión para invalidación
};
```

#### Configuración con Constantes (Recomendado)
```javascript
window.$xDiagrams = {
  cache: {
    // Usando constantes predefinidas (más legible)
    ttl: CACHE_TTL.FIVE_MINUTES,     // 5 minutos
    maxSize: 5
  }
};
```

#### Constantes Disponibles

**🔄 Corta duración (desarrollo/testing):**
```javascript
CACHE_TTL.ONE_MINUTE      // 1 minuto
CACHE_TTL.FIVE_MINUTES    // 5 minutos
CACHE_TTL.FIFTEEN_MINUTES // 15 minutos
CACHE_TTL.THIRTY_MINUTES  // 30 minutos
```

**⚡ Duración media (producción):**
```javascript
CACHE_TTL.ONE_HOUR        // 1 hora
CACHE_TTL.TWO_HOURS       // 2 horas
CACHE_TTL.FOUR_HOURS      // 4 horas
CACHE_TTL.SIX_HOURS       // 6 horas
```

**📅 Larga duración (datos estables):**
```javascript
CACHE_TTL.TWELVE_HOURS    // 12 horas
CACHE_TTL.ONE_DAY         // 24 horas
CACHE_TTL.THREE_DAYS      // 3 días
CACHE_TTL.ONE_WEEK        // 1 semana
```

**🎯 Valores especiales:**
```javascript
CACHE_TTL.NO_CACHE        // Sin caché (0)
CACHE_TTL.INFINITE        // Caché permanente (-1)
```

### Beneficios

- **🚀 Velocidad**: Cargas instantáneas después de la primera vez
- **💰 Ahorro**: Reduce llamadas a la API en un 90%+
- **📱 Offline**: Los datos están disponibles sin conexión
- **🔄 Automático**: No requiere configuración manual

### Ejemplos Prácticos de Cache

#### Ejemplo 1: Monitoreo de Uso
```javascript
// Verificar cuántas llamadas a la API has ahorrado
const stats = xDiagramsCache.stats();
console.log(`Has ahorrado aproximadamente ${stats.entries * 10} llamadas a la API`);

// Listar todas las APIs cacheadas
xDiagramsCache.list();
```

#### Ejemplo 2: Gestión Proactiva
```javascript
// Limpiar cache de una API específica antes de actualizar datos
xDiagramsCache.clear('https://sheetdb.io/api/v1/abc123');

// Recargar el diagrama para obtener datos frescos
window.$xDiagrams.loadDiagram('SheetDB Example');
```

#### Ejemplo 3: Cache Personalizado
```javascript
// Configurar cache más largo para datos que cambian poco
window.$xDiagrams = {
  cache: {
    ttl: CACHE_TTL.ONE_DAY,    // 24 horas
    maxSize: 50                // 50MB
  }
};

// Configurar cache más corto para datos que cambian frecuentemente
window.$xDiagrams = {
  cache: {
    ttl: CACHE_TTL.FIFTEEN_MINUTES,  // 15 minutos
    maxSize: 5                       // 5MB
  }
};
```

### Casos de Uso Avanzados

#### 1. Cache Selectivo por Tipo de Datos
```javascript
// Solo cachear APIs de producción, no de desarrollo
if (window.location.hostname === 'production.com') {
  // El cache se activa automáticamente
} else {
  // Forzar recarga cada vez en desarrollo
  xDiagramsCache.clearAll();
}
```

#### 2. Cache con Autenticación
```javascript
// Para APIs que requieren tokens, el cache incluye el token en la clave
const apiUrl = 'https://api.airtable.com/v0/app123/table1';
const token = 'YOUR_API_KEY';

// El cache maneja automáticamente las URLs con parámetros
xDiagramsCache.refresh(apiUrl);

// Configurar cache específico para APIs con autenticación
window.$xDiagrams = {
  cache: {
    ttl: CACHE_TTL.THIRTY_MINUTES,  // 30 minutos para APIs autenticadas
    maxSize: 10
  }
};
```

#### 3. Cache para Múltiples Entornos
```javascript
// Configurar diferentes configuraciones de cache por entorno
const env = window.location.hostname;
const cacheConfigs = {
  'localhost': { ttl: CACHE_TTL.FIVE_MINUTES, maxSize: 1 },     // 5 min, 1MB
  'staging.com': { ttl: CACHE_TTL.THIRTY_MINUTES, maxSize: 5 }, // 30 min, 5MB
  'production.com': { ttl: CACHE_TTL.ONE_HOUR, maxSize: 10 }    // 1 hora, 10MB
};

// Aplicar configuración según el entorno
window.$xDiagrams = {
  cache: cacheConfigs[env] || { ttl: CACHE_TTL.ONE_HOUR, maxSize: 10 }
};
```

### Integración con Otros Servicios

#### SheetDB
```javascript
// El cache es especialmente útil para SheetDB
const sheetdbUrl = 'https://sheetdb.io/api/v1/YOUR_ID';

// Verificar uso del cache
xDiagramsCache.stats();
// Resultado: { entries: 1, size: 0.05, timestamp: 1234567890 }

// Limpiar cache cuando actualices la hoja
xDiagramsCache.refresh(sheetdbUrl);
```

#### Airtable
```javascript
// Airtable tiene límites de API más generosos, pero el cache sigue siendo útil
const airtableUrl = 'https://api.airtable.com/v0/app123/table1';

// El cache funciona igual con autenticación
xDiagramsCache.list();
// Mostrará: - https://api.airtable.com/v0/app123/table1 (45 min ago)
```

#### APIs Personalizadas
```javascript
// Para APIs propias, puedes implementar invalidación automática
const customApiUrl = 'https://api.miservicio.com/diagram-data';

// Agregar timestamp para forzar actualización
const urlWithTimestamp = `${customApiUrl}?t=${Date.now()}`;
xDiagramsCache.clear(customApiUrl);
```

### Métricas y Monitoreo

#### Estadísticas Detalladas
```javascript
// Obtener estadísticas completas
const stats = xDiagramsCache.stats();
console.log(`
📊 Cache Statistics:
- Entries: ${stats.entries}
- Size: ${stats.size.toFixed(2)} MB
- Last Updated: ${new Date(stats.timestamp).toLocaleString()}
- Efficiency: ${((stats.entries / 30) * 100).toFixed(1)}% (estimated API calls saved)
`);
```

#### Monitoreo en Tiempo Real
```javascript
// Crear un dashboard de monitoreo
function createCacheDashboard() {
  const stats = xDiagramsCache.stats();
  const dashboard = document.createElement('div');
  dashboard.innerHTML = `
    <div style="position: fixed; bottom: 20px; left: 20px; background: rgba(0,0,0,0.8); color: white; padding: 15px; border-radius: 8px; font-family: monospace; font-size: 12px;">
      <h4>📦 Cache Monitor</h4>
      <p>Entries: ${stats.entries}</p>
      <p>Size: ${stats.size.toFixed(2)} MB</p>
      <p>Last Update: ${new Date(stats.timestamp).toLocaleTimeString()}</p>
    </div>
  `;
  document.body.appendChild(dashboard);
}

// Actualizar cada 30 segundos
setInterval(() => {
  const dashboard = document.querySelector('.cache-dashboard');
  if (dashboard) {
    const stats = xDiagramsCache.stats();
    dashboard.querySelector('p:nth-child(2)').textContent = `Entries: ${stats.entries}`;
    dashboard.querySelector('p:nth-child(3)').textContent = `Size: ${stats.size.toFixed(2)} MB`;
    dashboard.querySelector('p:nth-child(4)').textContent = `Last Update: ${new Date(stats.timestamp).toLocaleTimeString()}`;
  }
}, 30000);
```

#### Alertas de Cache
```javascript
// Configurar alertas cuando el cache se llene
function checkCacheHealth() {
  const stats = xDiagramsCache.stats();
  
  if (stats.size > 8) { // 80% del límite
    console.warn('⚠️ Cache size approaching limit:', stats.size.toFixed(2), 'MB');
  }
  
  if (stats.entries > 20) {
    console.warn('⚠️ Many cache entries, consider cleanup');
  }
}

// Verificar cada hora
setInterval(checkCacheHealth, 60 * 60 * 1000);
```

## 🧩 Detalles Técnicos

### 🔍 ¿Cómo se detecta que una URL es API REST?
La lógica vive en la función `isRestApiEndpoint(url)` dentro de `xdiagrams.js`.  Por defecto se verifica que la URL cumpla **al menos uno** de estos patrones:

| Patrón | Ejemplo que coincide |
|--------|----------------------|
| `api.` | `https://api.miempresa.com/v1/users` |
| `.json` | `https://datos.gob.mx/covid.json` |
| `/api/` | `https://miapp.com/api/v2/report` |
| `sheetdb.io` | `https://sheetdb.io/api/v1/abcd1234` |
| `sheetson.com` | `https://api.sheetson.com/v2/sheets/ventas` |
| `sheetbest.com` | `https://api.sheetbest.com/sheets/fghij7890` |
| `airtable.com` | `https://api.airtable.com/v0/app123/tabla` |
| `notion.so` | `https://api.notion.so/v1/pages` |

> **Tip 💡**  Si tu servicio no coincide con ninguno de los patrones, solo añade un nuevo `RegExp` a la lista en tu fork:
>
> ```javascript
> // xdiagrams.js
> const restPatterns = [
>   /api\./i,
>   /\.json$/i,
>   /\/api\//i,
>   /mi-servidor\.com/i, // ← nuevo patrón
>   // ...
> ];
> ```
>
> A partir de ese momento la URL será cacheada.

### 🧹 Limpieza de caché: `clearCache()` vs `xDiagramsCache.*`

| Método | Qué limpia | Cuándo usarlo |
|--------|------------|---------------|
| `window.$xDiagrams.clearCache()` | • **Solo** caché heredada (antigua) y archivos CSV/SVG del navegador.<br>• **Preserva** las entradas `xdiagrams_cache_*` y `xdiagrams_cache_stats`. | Cuando cambias de diagrama o quieres forzar la recarga de imágenes sin perder la caché inteligente de las APIs. |
| `xDiagramsCache.clear(url)` | Elimina la entrada de caché **específica** de esa URL API. | Cuando actualizas los datos de una sola hoja o endpoint. |
| `xDiagramsCache.clearAll()` | Elimina **todas** las entradas de la caché inteligente. | Mantenimiento general o depuración profunda. |

De esta forma puedes refrescar datos sin perder las ventajas del sistema de caché para el resto de tus APIs.

## 🐛 Solución de Problemas

### Error: "No se encontraron datos válidos"

**Causa:** La API no devuelve el formato JSON esperado
**Solución:** Verifica que tu API devuelva un array de objetos

### Error: "CORS error"

**Causa:** El servidor no permite peticiones desde tu dominio
**Solución:** Configura CORS en tu servidor o usa un proxy

### Error: "HTTP 401/403"

**Causa:** Problemas de autenticación
**Solución:** Verifica tu API key o token

### Error: "NetworkError"

**Causa:** Problemas de conectividad
**Solución:** La librería reintentará automáticamente

### Error: "Cache corrupted"

**Causa:** Datos corruptos en localStorage
**Solución:** Ejecuta `xDiagramsCache.clearAll()` en la consola

### Error: "Cache not working"

**Causa:** El cache no se está activando para tu API
**Solución:** Verifica que la URL sea detectada como API REST con `isRestApiEndpoint(url)`

### Error: "Cache size limit reached"

**Causa:** El cache ha alcanzado el límite de 10MB
**Solución:** El sistema limpia automáticamente, pero puedes forzar limpieza con `xDiagramsCache.clearAll()`

### Error: "Cache expired too quickly"

**Causa:** Los datos se expiran antes de lo esperado
**Solución:** Ajusta `CACHE_CONFIG.DEFAULT_TTL` para un tiempo más largo

### Error: "Cache not updating"

**Causa:** Los datos no se actualizan cuando cambias la hoja
**Solución:** Usa `xDiagramsCache.refresh(url)` para forzar actualización

### Error: "Cache conflicts between environments"

**Causa:** Diferentes entornos comparten el mismo localStorage
**Solución:** Usa diferentes dominios o implementa cache selectivo por entorno

## 📚 Recursos Adicionales

- [SheetDB Documentation](https://docs.sheetdb.io/)
- [Sheetson Documentation](https://docs.sheetson.com/)
- [Airtable API Documentation](https://airtable.com/api)
- [Ejemplo completo](rest-api-example.html)

## 🔄 Migración desde CSV

Si ya tienes diagramas usando CSV, puedes migrar fácilmente:

1. **Sube tu CSV a SheetDB o Sheetson**
2. **Reemplaza la URL en la configuración**
3. **¡Listo!** No necesitas cambiar nada más

```javascript
// Antes (CSV)
{
  name: "Mi Diagrama",
  url: "https://docs.google.com/spreadsheets/d/.../pub?output=csv"
}

// Después (API REST)
{
  name: "Mi Diagrama", 
  url: "https://sheetdb.io/api/v1/YOUR_SHEET_ID"
}
```

---

¿Necesitas ayuda? Revisa los ejemplos en `rest-api-example.html` o consulta la documentación de tu servicio preferido. 