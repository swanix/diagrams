# Modos de Thumbnail - Swanix Diagrams

Esta documentación describe la nueva funcionalidad de control de thumbnails en Swanix Diagrams, que permite configurar cómo se muestran las imágenes en los nodos.

## Descripción General

La nueva propiedad `thumbnailMode` permite controlar la visualización de thumbnails en los nodos del diagrama. Esta funcionalidad ofrece tres modos diferentes para adaptarse a diferentes necesidades de visualización.

## Modos Disponibles

### 1. `default` (Por Defecto)
- **Comportamiento**: Solo muestra thumbnails embebidos por defecto basados en la columna `Type`
- **Uso**: Ignora completamente la columna `Img` y solo usa thumbnails del sistema embebidos
- **Ideal para**: Diagramas donde quieres una apariencia consistente usando solo los iconos del sistema

### 2. `custom` (Personalizado)
- **Comportamiento**: Comportamiento actual - la columna `Img` tiene prioridad absoluta sobre `Type`
- **Uso**:
  - Si existe valor en `Img`, lo usa (puede ser URL externa, archivo local, o thumbnail embebido)
  - Si `Img` está vacío, usa `Type` como fallback
- **Ideal para**: Diagramas donde quieres control total sobre las imágenes de cada nodo

### 3. `none` (Sin Imágenes)
- **Comportamiento**: No muestra ninguna imagen, solo texto
- **Uso**: Los nodos solo muestran el texto sin ningún thumbnail
- **Ideal para**: Diagramas minimalistas o cuando las imágenes no son necesarias

### 4. `simple` (Simple)
- **Comportamiento**: Usa siempre el mismo thumbnail (`detail`) para todos los nodos
- **Uso**: Ignora completamente las columnas `Type` e `Img`, todos los nodos muestran el mismo icono
- **Ideal para**: Diagramas donde quieres máxima simplicidad visual con un icono uniforme

## Configuración

### Configuración Global
```javascript
window.$xDiagrams = {
  options: {
    thumbnailMode: "default" // "default", "custom", "none", "simple"
  }
};
```

### Configuración por Diagrama
```javascript
window.$xDiagrams = {
  diagrams: [
    {
      name: "Mi Diagrama",
      url: "data/mi-diagrama.csv",
      options: {
        thumbnailMode: "custom"
      }
    }
  ]
};
```

### Cambio Dinámico
```javascript
// Cambiar el modo dinámicamente
window.$xDiagrams.options.thumbnailMode = "none";

// Recargar el diagrama para aplicar el cambio
const currentDiagram = window.$xDiagrams.diagrams[0];
initDiagram(currentDiagram.url, null, 0, currentDiagram);
```

## Ejemplos de Uso

### Ejemplo 1: Modo Default
```javascript
window.$xDiagrams = {
  options: {
    thumbnailMode: "default"
  },
  diagrams: [
    {
      name: "Organigrama Simple",
      url: "data/organigrama.csv"
    }
  ]
};
```
**Resultado**: Todos los nodos usan thumbnails embebidos basados en su `Type` (company, department, team, etc.)

### Ejemplo 2: Modo Custom
```javascript
window.$xDiagrams = {
  options: {
    thumbnailMode: "custom"
  },
  diagrams: [
    {
      name: "Organigrama Personalizado",
      url: "data/organigrama-custom.csv"
    }
  ]
};
```
**Resultado**: Los nodos usan imágenes personalizadas de la columna `Img`, con fallback a `Type` si `Img` está vacío.

### Ejemplo 3: Modo None
```javascript
window.$xDiagrams = {
  options: {
    thumbnailMode: "none"
  },
  diagrams: [
    {
      name: "Organigrama Minimalista",
      url: "data/organigrama.csv"
    }
  ]
};
```
**Resultado**: Los nodos solo muestran texto, sin ninguna imagen.

### Ejemplo 4: Modo Simple
```javascript
window.$xDiagrams = {
  options: {
    thumbnailMode: "simple"
  },
  diagrams: [
    {
      name: "Organigrama Simple",
      url: "data/organigrama.csv"
    }
  ]
};
```
**Resultado**: Todos los nodos muestran el mismo thumbnail (`detail`), ignorando `Type` e `Img`.

## Estructura de Datos

### CSV con Modo Default
```csv
Node,Name,Description,Parent,Type,URL,Img
ROOT,Empresa,Empresa principal,,company,https://empresa.com,
DEV,Desarrollo,Equipo de desarrollo,ROOT,department,https://dev.com,
```

### CSV con Modo Custom
```csv
Node,Name,Description,Parent,Type,URL,Img
ROOT,Empresa,Empresa principal,,company,https://empresa.com,logo-empresa.svg
DEV,Desarrollo,Equipo de desarrollo,ROOT,department,https://dev.com,dev-team.png
QA,Calidad,Equipo de QA,ROOT,department,https://qa.com,
```

### CSV con Modo None
```csv
Node,Name,Description,Parent,Type,URL,Img
ROOT,Empresa,Empresa principal,,company,https://empresa.com,logo.svg
DEV,Desarrollo,Equipo de desarrollo,ROOT,department,https://dev.com,dev.png
```

### CSV con Modo Simple
```csv
Node,Name,Description,Parent,Type,URL,Img
ROOT,Empresa,Empresa principal,,company,https://empresa.com,logo.svg
DEV,Desarrollo,Equipo de desarrollo,ROOT,department,https://dev.com,dev-team.png
QA,Calidad,Equipo de QA,ROOT,department,https://qa.com,qa-icon.svg
```
**Nota**: En modo `simple`, las columnas `Type` e `Img` son ignoradas. Todos los nodos mostrarán el mismo thumbnail (`detail`).

## Compatibilidad

- ✅ **Retrocompatible**: Si no se especifica `thumbnailMode`, usa `default`
- ✅ **Flexible**: Se puede cambiar dinámicamente sin recargar la página
- ✅ **Consistente**: Funciona con todos los tipos de diagramas (árboles, clusters, grid)
- ✅ **Eficiente**: El modo `none` mejora el rendimiento al no cargar imágenes

## Casos de Uso

### 1. Diagramas Corporativos
- **Modo**: `default`
- **Razón**: Apariencia consistente con iconos estándar del sistema

### 2. Diagramas de Proyectos
- **Modo**: `custom`
- **Razón**: Permite logos específicos de cada proyecto o tecnología

### 3. Diagramas de Documentación
- **Modo**: `none`
- **Razón**: Enfoque en el contenido textual sin distracciones visuales

### 4. Diagramas de Arquitectura
- **Modo**: `custom`
- **Razón**: Permite iconos específicos de tecnologías (AWS, Azure, etc.)

### 5. Diagramas de Flujo Simple
- **Modo**: `simple`
- **Razón**: Máxima simplicidad visual con un icono uniforme para todos los elementos

## Demostración

Para ver la funcionalidad en acción, abre el archivo `src/thumbnail-modes-demo.html` en tu navegador. Este archivo incluye:

- Tres diagramas idénticos con diferentes modos de thumbnail
- Controles para cambiar el modo dinámicamente
- Datos de ejemplo que muestran las diferencias entre modos

## Notas Técnicas

- El modo se aplica a nivel de configuración global o por diagrama
- Los cambios dinámicos requieren recargar el diagrama
- El modo `none` mejora el rendimiento al eliminar la carga de imágenes
- Los thumbnails embebidos siguen disponibles en todos los modos excepto `none`
- La funcionalidad es completamente retrocompatible 