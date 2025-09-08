# XDiagrams Demo - SheetBest

Este directorio contiene los archivos de demo de XDiagrams usando archivos bundle de producción.

## Archivos Disponibles

- `index.html` - Demo principal con datos locales
- `sheetbest.html` - Demo con SheetBest (requiere API Key)
- `xdiagrams.min.js` - Bundle de producción (JS)
- `xdiagrams.min.css` - Bundle de producción (CSS)

**Nota:** Las API Keys se configuran en el archivo `.env` de la raíz del proyecto

## Configuración para SheetBest

### 1. Obtener API Key de SheetBest

1. Ve a [SheetBest](https://sheet.best/)
2. Crea una cuenta o inicia sesión
3. Crea un nuevo proyecto
4. Copia tu API Key

### 2. Configurar API Key (Forma Segura)

**IMPORTANTE:** Nunca expongas API Keys en el código HTML o JavaScript.

Edita el archivo `.env` en la raíz del proyecto:

```bash
# API Keys para XDiagrams
SHEETBEST_API_KEY="tu_api_key_real_aqui"
```

### 3. Verificar Configuración

El bundle de producción se construye automáticamente con las variables de entorno. Para regenerar:

```bash
npm run build
```

### 3. Probar el Demo

1. Ejecuta el servidor:
   ```bash
   npm run demo
   ```

2. Abre en tu navegador:
   ```
   http://localhost:8002/sheetbest.html
   ```

## Estructura de Datos

El demo espera datos en formato CSV con las siguientes columnas:
- `Node` - ID único del nodo
- `Name` - Nombre del nodo
- `Parent` - ID del nodo padre (vacío para raíz)
- `Type` - Tipo de nodo (company, profile, etc.)
- `Img` - Icono del nodo
- `Description` - Descripción del nodo
- `Position` - Cargo/posición
- `Department` - Departamento

## Troubleshooting

### Error: "API requiere autenticación"
- Verifica que tu API Key esté configurada en el archivo `.env`
- Asegúrate de que la API Key tenga permisos para acceder a la hoja
- Regenera el bundle con `npm run build` después de cambiar las variables de entorno

### Error: "You do not have permission to perform this action"
- La API Key es válida pero no tiene permisos para esa hoja específica
- Crea una nueva hoja en SheetBest o solicita permisos al propietario
- Para probar, usa una hoja pública o crea tu propia hoja de prueba

### Error: "No se puede cargar el archivo"
- Verifica que la URL de SheetBest sea correcta
- Asegúrate de que la hoja sea pública o que tengas permisos

### Error: "CORS"
- El servidor de demo está configurado para permitir CORS
- Si persiste, verifica la configuración de SheetBest
