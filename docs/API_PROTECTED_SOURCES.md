# APIs Protegidas en XDiagrams

Este documento explica cómo usar APIs protegidas con autenticación en XDiagrams.

## Configuración

### Variables de Entorno

El sistema utiliza las siguientes variables de entorno:

- `SHEETBEST_API_KEY`: API key para SheetBest
- `LOCAL_URL`: URL base para desarrollo local (opcional)
- `NETLIFY_URL`: URL base para Netlify Functions (opcional)

### Configuración en Netlify

1. Ve al dashboard de Netlify
2. Selecciona tu sitio
3. Ve a **Site settings** > **Environment variables**
4. Agrega las variables necesarias:
   - `SHEETBEST_API_KEY`: Tu API key de SheetBest
   - `LOCAL_URL`: `http://localhost:8888` (para desarrollo)
   - `NETLIFY_URL`: `/.netlify/functions` (para producción)

## Uso

### URLs de SheetBest

El sistema detecta automáticamente las URLs de SheetBest y las maneja como APIs protegidas:

```javascript
// Ejemplo de URL de SheetBest
const sheetBestUrl = 'https://api.sheetbest.com/sheets/tu-sheet-id';

// El sistema automáticamente:
// 1. Detecta que es una API protegida
// 2. Usa la Netlify Function para hacer la petición
// 3. Incluye la API key en el header X-Api-Key
// 4. Devuelve los datos procesados
```

### Detección Automática

El sistema detecta automáticamente los siguientes patrones como APIs protegidas:

- `api.sheetbest.com`
- `sheetbest.com`

### Flujo de Trabajo

1. **Cliente**: Detecta URL protegida
2. **Netlify Function**: Recibe petición con URL
3. **API Key**: Se obtiene desde variables de entorno
4. **Petición Autenticada**: Se hace a la API con header `X-Api-Key`
5. **Respuesta**: Se devuelve al cliente

## Desarrollo Local

Para desarrollo local, puedes usar Netlify CLI:

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Configurar variables de entorno locales
netlify env:set SHEETBEST_API_KEY tu-api-key

# Ejecutar funciones localmente
netlify dev
```

## Estructura de Archivos

```
src/js/modules/loader/
├── api-config.js          # Configuración de APIs
├── auth-manager.js        # Gestor de autenticación
├── netlify-client.js      # Cliente para Netlify Functions
├── data-loader.js         # Cargador de datos (modificado)
└── source-detector.js     # Detector de fuentes (modificado)

netlify/functions/
└── fetch-protected-data.js # Netlify Function
```

## Manejo de Errores

El sistema maneja los siguientes tipos de errores:

- **401/403**: Error de autenticación (API key inválida)
- **404**: URL no encontrada
- **500+**: Error interno del servidor de la API
- **Timeout**: Petición tardó demasiado
- **Conexión**: Problemas de red

## Ejemplos

### Cargar datos de SheetBest

```javascript
import { XDiagramsLoader } from './modules/loader/index.js';

const loader = new XDiagramsLoader();

// URL de SheetBest (se detecta automáticamente como protegida)
const sheetBestUrl = 'https://api.sheetbest.com/sheets/tu-sheet-id';

loader.loadData(sheetBestUrl, (data, error) => {
  if (error) {
    console.error('Error:', error.message);
    return;
  }
  
  console.log('Datos cargados:', data);
});
```

### Verificar si una URL requiere autenticación

```javascript
const authManager = loader.authManagerInstance;

if (authManager.requiresAuthentication(url)) {
  console.log('Esta URL requiere autenticación');
} else {
  console.log('Esta URL es pública');
}
```

## Troubleshooting

### Error: "API key no configurada"

- Verifica que `SHEETBEST_API_KEY` esté configurada en Netlify
- Asegúrate de que la variable esté en el entorno correcto (production/development)

### Error: "Error de autenticación"

- Verifica que la API key sea válida
- Asegúrate de que la API key tenga permisos para la URL específica

### Error: "No se pudo conectar con el servidor"

- Verifica tu conexión a internet
- Asegúrate de que la URL sea correcta
- Verifica que la API esté funcionando

### Error: "Timeout"

- La petición tardó más de 30 segundos
- Verifica que la API esté respondiendo
- Considera usar un timeout más largo si es necesario
