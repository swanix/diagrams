# APIs Protegidas en XDiagrams

Este documento explica cómo usar el sistema de APIs protegidas con autenticación en XDiagrams.

## Configuración de Desarrollo

### Opción 1: Desarrollo completo (Recomendado)

Ejecuta ambos servidores simultáneamente:

```bash
npm run dev:full
```

Esto iniciará:
- **Vite** en `http://localhost:5500` (desarrollo frontend)
- **Servidor de funciones API** en `http://localhost:8888` (APIs protegidas)

### Opción 2: Solo servidor de funciones API

Si solo quieres probar las APIs protegidas:

```bash
npm run api-server
```

### Opción 3: Solo Vite (desarrollo normal)

```bash
npm run dev
```

## Cómo funciona

### Arquitectura

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │  Servidor API    │    │   SheetBest     │
│  (Vite 5500)    │───▶│   (Node 8888)    │───▶│   (API Key)     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Flujo de trabajo

1. **Frontend** detecta URL de SheetBest
2. **Cliente** envía petición a `http://localhost:8888/fetch-protected-data`
3. **Servidor API** usa API key para autenticarse con SheetBest
4. **Datos** se devuelven al frontend

## Configuración de API Key

### Para desarrollo local

```bash
# Configurar API key real
export SHEETBEST_API_KEY=tu-api-key-real

# Ejecutar servidor
npm run api-server
```

### Para producción (Netlify)

Las variables de entorno ya están configuradas en Netlify:
- `SHEETBEST_API_KEY`: Tu API key de SheetBest
- `LOCAL_URL`: `http://localhost:8888`
- `NETLIFY_URL`: `/.netlify/functions`

## Pruebas

### Página de prueba simple

Abre `http://localhost:5500/test-simple.html` para verificar que los módulos se cargan correctamente.

### Página de prueba completa

Abre `http://localhost:5500/test-protected-api.html` para probar con URLs reales de SheetBest.

### Ejemplo de URL de prueba

```
https://api.sheetbest.com/sheets/tu-sheet-id
```

## Archivos importantes

### Configuración
- `src/js/config/environment.js` - Manejo de variables de entorno
- `src/js/modules/loader/api-config.js` - Configuración de APIs protegidas

### Módulos principales
- `src/js/modules/loader/auth-manager.js` - Gestor de autenticación
- `src/js/modules/loader/netlify-client.js` - Cliente para funciones
- `src/js/modules/loader/data-loader.js` - Cargador de datos (modificado)

### Servidor de desarrollo
- `dev-server.js` - Servidor local para simular Netlify Functions
- `netlify/functions/fetch-protected-data.js` - Función de producción

## Troubleshooting

### Error: "No se pudo conectar con el servidor"

- Verifica que el servidor API esté corriendo en puerto 8888
- Usa `npm run dev:full` para ejecutar ambos servidores

### Error: "API key no configurada"

- Configura `export SHEETBEST_API_KEY=tu-api-key`
- O usa datos simulados (por defecto)

### Error: "Error de autenticación"

- Verifica que la API key sea válida
- Asegúrate de que tenga permisos para la URL específica

## Desarrollo vs Producción

### Desarrollo
- Servidor local en puerto 8888
- Datos simulados por defecto
- API key opcional

### Producción
- Netlify Functions
- Variables de entorno de Netlify
- API key requerida

## Comandos útiles

```bash
# Desarrollo completo
npm run dev:full

# Solo servidor API
npm run api-server

# Solo Vite
npm run dev

# Configurar API key
export SHEETBEST_API_KEY=tu-api-key

# Verificar configuración
node -e "console.log('API Key:', process.env.SHEETBEST_API_KEY || 'No configurada')"
```
