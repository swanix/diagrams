# Side Panel Default Image Fallback Feature

## Descripción

Esta funcionalidad implementa un sistema de fallback para las imágenes automáticas en el sidebar. Cuando se activa la opción de auto imagen y no se encuentra una coincidencia con el nombre de la persona en la columna configurada, el sistema ahora usa por defecto la imagen `default.png` en lugar de ocultar la imagen completamente.

## Funcionalidad Implementada

### 1. Sistema Global de Auto Imágenes

Se creó un sistema global de auto imágenes que puede ser utilizado tanto por `resolveNodeImage` como por `generateSidePanelContent`:

- **`globalAutoImageCache`**: Cache global para almacenar las imágenes automáticas precargadas
- **`normalizeNameForImage()`**: Función global para normalizar nombres de imagen
- **`preloadGlobalAutoImages()`**: Función para precargar imágenes automáticas disponibles
- **`findGlobalAutoImageByName()`**: Función para buscar imágenes automáticas por nombre

### 2. Modificación en `generateSidePanelContent`

La función `generateSidePanelContent` fue modificada para:

- Usar el sistema global de auto imágenes
- Verificar si las auto imágenes están habilitadas
- Buscar imágenes automáticas usando `findGlobalAutoImageByName()`
- Usar `default.png` como fallback cuando no se encuentra una imagen
- Cambiar el `onerror` handler para usar `default.png` en lugar de ocultar la imagen

### 3. Cambios en el HTML del Sidebar

El HTML generado para las imágenes del equipo ahora incluye:

```html
<img src="${imageUrl}" class="side-panel-team-avatar" width="40" height="40" onerror="this.src='img/photos/default.png'">
```

## Configuración

### Habilitar Auto Imágenes

Para habilitar esta funcionalidad, asegúrate de que en la configuración del diagrama tengas:

```javascript
options: {
  autoImages: true,
  autoImageColumns: ["Responsable_Desarrollo", "Responsable_Diseno", "Responsable_Testing", "Responsable_DevOps"]
}
```

### Imagen por Defecto

La imagen `default.png` debe estar ubicada en:
```
src/img/photos/default.png
```

## Flujo de Funcionamiento

1. **Activación**: Cuando se abre el sidebar de un nodo
2. **Verificación**: Se verifica si las auto imágenes están habilitadas
3. **Precarga**: Si es la primera vez, se precargan las imágenes automáticas disponibles
4. **Búsqueda**: Para cada columna configurada, se busca una imagen automática
5. **Fallback**: Si no se encuentra, se usa `default.png`
6. **Renderizado**: Se genera el HTML con la imagen correspondiente

## Beneficios

- **Mejor UX**: Los usuarios siempre ven una imagen en lugar de espacios vacíos
- **Consistencia**: Todas las personas tienen una representación visual
- **Flexibilidad**: Fácil de personalizar cambiando `default.png`
- **Performance**: Sistema de cache para evitar verificaciones repetidas

## Archivos Modificados

- `src/xdiagrams.js`: Agregadas funciones globales y modificada `generateSidePanelContent`
- `src/img/photos/default.png`: Imagen por defecto (ya existía)

## Compatibilidad

Esta funcionalidad es compatible con:
- Todas las configuraciones existentes de auto imágenes
- Diferentes tipos de diagramas
- Sistemas de cache existentes
- Funcionalidades del sidebar existentes 