# Separación de Layout y Type - Swanix Diagrams

## Descripción General

Se ha implementado una separación clara entre los conceptos de **Layout** y **Type** en Swanix Diagrams para evitar confusiones y proporcionar mayor flexibilidad en la definición de diagramas.

## Cambios Implementados

### Antes (Estructura Anterior)
- **Type**: Se usaba tanto para definir el tipo de elemento como para definir el layout/thumbnail
- Esto causaba confusión y limitaba la flexibilidad

### Ahora (Nueva Estructura)

#### Columna `Type`
Define el **tipo de elemento** en el diagrama:
- **Section** (por defecto) - Elementos de sección general
- **Group** - Elementos de grupo/equipo
- **Person** - Elementos de persona individual

#### Columna `Layout`
Define el **diseño/thumbnail** que se muestra:
- **Detail** (por defecto) - Thumbnail de detalle
- **List** - Thumbnail de lista
- **Grid** - Thumbnail de cuadrícula
- **Form** - Thumbnail de formulario
- **Report** - Thumbnail de reporte
- **Modal** - Thumbnail de modal
- **Settings** - Thumbnail de configuración
- **Profile** - Thumbnail de perfil
- **Document** - Thumbnail de documento
- **File PDF** - Thumbnail de archivo PDF
- **File XLS** - Thumbnail de archivo Excel
- **File CSV** - Thumbnail de archivo CSV
- **File TXT** - Thumbnail de archivo de texto
- **File Docx** - Thumbnail de archivo Word

## Ejemplo de Uso

```csv
Name,Type,Layout,Img,Node,Url,Subtitle
Juan Pérez,Person,Profile,,JP001,https://example.com/juan,Desarrollador Senior
Equipo Desarrollo,Group,Grid,,ED001,https://example.com/dev,Equipo de Desarrollo
Documentación,Section,Document,,DT001,https://example.com/docs,Documentación del Proyecto
```

## Configuración de Columnas

### Configuración por Diagrama
```javascript
{
  name: "Mi Diagrama",
  url: "data/mi-datos.csv",
  cols: {
    id: "Node",
    name: "Name",
    parent: "Parent",
    subtitle: "Subtitle",
    type: "Type",
    layout: "Layout",
    img: "Img"
  },
  options: {
    thumbnailMode: "custom"
  }
}
```

### Configuración Global
```javascript
window.$xDiagrams = {
  columns: {
    id: "Node",
    name: "Name",
    parent: "Parent",
    subtitle: "Subtitle",
    type: "Type",
    layout: "Layout",
    img: "Img"
  }
};
```

## Compatibilidad

### Valores por Defecto
- Si no se especifica `Type`: **Section**
- Si no se especifica `Layout`: **Detail**

### Fallback para Compatibilidad
- Si no existe columna `Layout`, se usa `Type` como fallback para thumbnails
- Esto mantiene compatibilidad con diagramas existentes

## Casos de Uso Comunes

### 1. Organigrama de Empresa
```csv
Name,Type,Layout
CEO,Person,Profile
Equipo Desarrollo,Group,Grid
Equipo Diseño,Group,Grid
```

### 2. Documentación de Proyecto
```csv
Name,Type,Layout
README,Section,Document
Configuración,Section,Settings
Reporte Mensual,Section,Report
```

### 3. Sistema de Archivos
```csv
Name,Type,Layout
Manual Usuario,Section,File PDF
Datos Ventas,Section,File XLS
Configuración,Section,File CSV
```

## Ventajas de la Nueva Estructura

1. **Claridad Conceptual**: Separación clara entre tipo de elemento y diseño visual
2. **Flexibilidad**: Un mismo tipo puede tener diferentes layouts
3. **Escalabilidad**: Fácil agregar nuevos tipos y layouts sin conflictos
4. **Mantenibilidad**: Código más limpio y fácil de entender
5. **Extensibilidad**: Base sólida para futuras funcionalidades

## Migración de Datos Existentes

Para migrar datos existentes:

1. **Renombrar columna**: Cambiar `Type` por `Layout` en archivos CSV
2. **Agregar columna Type**: Añadir nueva columna `Type` con valores apropiados
3. **Actualizar configuración**: Modificar `cols` en configuración de diagramas

### Ejemplo de Migración

**Antes:**
```csv
Name,Type
Juan Pérez,Person
Equipo Dev,Grid
```

**Después:**
```csv
Name,Type,Layout
Juan Pérez,Person,Profile
Equipo Dev,Group,Grid
```

## Archivos de Prueba

Se incluyen archivos de prueba que demuestran la nueva estructura:

1. **`src/data/test-new-layout-type.csv`** - Ejemplos de todos los tipos y layouts disponibles
2. **`src/data/companies-board-new.csv`** - Versión actualizada del organigrama con nueva estructura

## Diagramas de Prueba

- **"Test New Layout & Type"** - Demuestra todos los tipos y layouts disponibles
- **"Multiclusters (New Structure)"** - Organigrama usando la nueva estructura
- **"Multiclusters"** - Organigrama original (compatibilidad con `thumbType`)

## Solución de Problemas

### Error: "0 filas cargadas"
Si un diagrama muestra "0 filas cargadas", verifica:
1. La configuración de columnas (`cols`) en el diagrama
2. Los nombres de las columnas en el archivo CSV
3. Que el archivo CSV tenga datos válidos

### Migración de Diagramas Existentes
Para migrar diagramas que usan la estructura antigua:
1. Actualizar la configuración `cols` para incluir `layout`
2. Mapear la columna antigua (ej: `thumbType`) a `layout`
3. Agregar columna `type` con valores apropiados 