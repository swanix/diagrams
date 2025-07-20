# Sistema de Thumbnails Embebidos

## Descripción

El sistema de thumbnails embebidos permite almacenar los SVGs de los thumbnails directamente en JavaScript como data URIs, eliminando la necesidad de peticiones HTTP externas para los iconos más comunes.

## Ventajas

- **Rendimiento mejorado**: No hay peticiones HTTP para thumbnails comunes
- **Carga más rápida**: Los thumbnails están disponibles inmediatamente
- **Menos dependencias**: No requiere archivos externos para thumbnails básicos
- **Fácil mantenimiento**: Todos los thumbnails en un solo lugar

## Cómo funciona

### 1. Thumbnails Embebidos Disponibles

Los siguientes thumbnails están disponibles como embebidos:

#### Básicos del Sistema
- `detail` - Icono de detalle
- `document` - Icono de documento
- `form` - Icono de formulario
- `list` - Icono de lista
- `mosaic` - Icono de mosaico
- `report` - Icono de reporte
- `settings` - Icono de configuración
- `modal` - Icono de modal

#### Archivos
- `file-csv` - Archivo CSV
- `file-pdf` - Archivo PDF
- `file-xls` - Archivo Excel
- `file-xml` - Archivo XML
- `file-html` - Archivo HTML
- `file-js` - Archivo JavaScript
- `file-css` - Archivo CSS
- `file-txt` - Archivo de texto
- `file-docx` - Archivo Word

#### Especiales
- `home` - Icono de inicio
- `profile` - Icono de perfil
- `logo` - Icono de logo

### 2. Prioridad de Resolución

El sistema sigue este orden de prioridad:

1. **URLs absolutas** (http/https) - Se usan directamente
2. **Thumbnails embebidos** - Se buscan en la biblioteca interna
3. **Archivos externos** - Se buscan en la carpeta `img/`
4. **Fallback por tipo** - Se usa el tipo del nodo como thumbnail

### 3. Uso en Datos

```csv
ID,Name,Type,Img
1,Usuario 1,user,profile
2,Documento 1,document,file-pdf
3,Configuración,system,settings
```

En este ejemplo:
- El nodo 1 usará el thumbnail embebido `profile`
- El nodo 2 usará el thumbnail embebido `file-pdf`
- El nodo 3 usará el thumbnail embebido `settings`

## API del Sistema

### Funciones Disponibles

```javascript
// Obtener un thumbnail embebido
const thumbnail = getEmbeddedThumbnail('document');
// Retorna: "data:image/svg+xml;charset=utf-8,..."

// Verificar si existe como embebido
const exists = isEmbeddedThumbnailAvailable('document');
// Retorna: true

// Obtener lista de thumbnails disponibles
const available = getAvailableEmbeddedThumbnails();
// Retorna: ['detail', 'document', 'form', ...]
```

### Resolución Automática

El sistema resuelve automáticamente los thumbnails:

```javascript
// En resolveNodeImage()
const imageUrl = resolveNodeImage(node);
// Si node.img = "document", retorna el data URI del thumbnail embebido
```

## Agregar Nuevos Thumbnails

### 1. Crear el SVG

Primero, crea tu archivo SVG con las dimensiones estándar (200x180):

```svg
<svg width="200" height="180" viewBox="0 0 200 180" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Tu contenido SVG aquí -->
</svg>
```

### 2. Agregar al Objeto EMBEDDED_THUMBNAILS

En `thumbnail-engine.js`, agrega tu thumbnail al objeto `EMBEDDED_THUMBNAILS`:

```javascript
const EMBEDDED_THUMBNAILS = {
  // ... thumbnails existentes ...
  
  'mi-nuevo-icono': `<svg width="200" height="180" viewBox="0 0 200 180" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Tu SVG aquí -->
  </svg>`,
  
  // ... más thumbnails ...
};
```

### 3. Usar en Datos

```csv
ID,Name,Type,Img
1,Elemento Nuevo,element,mi-nuevo-icono
```

## Migración desde Archivos Externos

Si tienes thumbnails como archivos SVG externos, puedes migrarlos:

1. **Copiar el contenido SVG** del archivo
2. **Agregar al objeto EMBEDDED_THUMBNAILS**
3. **Actualizar referencias** en tus datos para usar el nombre sin extensión
4. **Opcional**: Eliminar los archivos SVG externos

### Ejemplo de Migración

**Antes:**
```csv
ID,Name,Type,Img
1,Documento,document,document.svg
```

**Después:**
```csv
ID,Name,Type,Img
1,Documento,document,document
```

## Consideraciones

### Tamaño del Bundle

- Los thumbnails embebidos aumentan el tamaño del archivo JavaScript
- Para proyectos grandes, considera mantener solo los más usados como embebidos
- Los thumbnails menos comunes pueden seguir siendo archivos externos

### Compatibilidad

- Los data URIs son compatibles con todos los navegadores modernos
- El sistema mantiene compatibilidad con archivos externos como fallback

### Rendimiento

- Los thumbnails embebidos se cargan instantáneamente
- No hay latencia de red para thumbnails comunes
- El parsing de data URIs es muy rápido

## Debugging

Para ver qué thumbnails se están usando:

```javascript
// En la consola del navegador
console.log(getAvailableEmbeddedThumbnails());
console.log(getEmbeddedThumbnail('document'));
```

Los logs del sistema mostrarán cuando se usan thumbnails embebidos:

```
[resolveNodeImage] imgVal: "document" -> thumbnail embebido encontrado
``` 