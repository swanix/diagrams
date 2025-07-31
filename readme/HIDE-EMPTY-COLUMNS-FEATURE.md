# Funcionalidad de Ocultar Columnas Vacías

Esta funcionalidad permite controlar la visibilidad de las columnas vacías en el side panel de manera granular.

## Configuración

### Opciones Disponibles

1. **`hideEmptyColumns: "all"`** - Oculta todas las columnas que no tienen valor
2. **`hideEmptyColumns: ["columna1", "columna2"]`** - Oculta solo las columnas específicas mencionadas si están vacías
3. **`hideEmptyColumns: false`** - Muestra todas las columnas (comportamiento por defecto)

### Configuración por Diagrama

```javascript
{
  name: "Mi Diagrama",
  url: "data/mi-datos.csv",
  options: {
    hideEmptyColumns: "all" // Oculta todas las columnas vacías
  }
}
```

```javascript
{
  name: "Mi Diagrama",
  url: "data/mi-datos.csv",
  options: {
    hideEmptyColumns: ["Notes", "Comments", "Extra_Info"] // Oculta solo estas columnas si están vacías
  }
}
```

### Configuración Global

```javascript
window.$xDiagrams = {
  // ... otras configuraciones
  options: {
    hideEmptyColumns: "all" // Aplica a todos los diagramas por defecto
  }
}
```

## Ejemplos de Uso

### Ejemplo 1: Ocultar todas las columnas vacías
```javascript
{
  name: "Organigrama",
  url: "data/org-chart.csv",
  options: {
    hideEmptyColumns: "all"
  }
}
```

### Ejemplo 2: Ocultar columnas específicas
```javascript
{
  name: "Proyectos",
  url: "data/projects.csv",
  options: {
    hideEmptyColumns: ["Notes", "Comments", "Priority"]
  }
}
```

### Ejemplo 3: Configuración mixta
```javascript
{
  name: "Equipo",
  url: "data/team.csv",
  options: {
    autoImages: true,
    autoImageColumns: ["Developer", "Designer"],
    hideEmptyColumns: ["Phone", "Address"] // Solo oculta teléfono y dirección si están vacías
  }
}
```

## Comportamiento

- **Columnas con valor**: Siempre se muestran, independientemente de la configuración
- **Columnas vacías**: Se ocultan según la configuración:
  - Si `hideEmptyColumns: "all"` → Se ocultan todas
  - Si `hideEmptyColumns: ["col1", "col2"]` → Solo se ocultan las especificadas
  - Si `hideEmptyColumns: false` → Se muestran todas

## Prioridad de Configuración

1. **Configuración del diagrama** (más específica)
2. **Configuración global** (por defecto)
3. **Comportamiento por defecto** (mostrar todas las columnas)

## Compatibilidad

Esta funcionalidad es compatible con:
- ✅ Configuración de auto imágenes
- ✅ Configuración de columnas personalizadas
- ✅ Todos los tipos de datos (CSV, JSON, APIs)
- ✅ Side panel existente
- ✅ Tooltips y funcionalidades existentes 