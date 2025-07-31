# Configuración de Columnas Vacías

## Descripción

Esta funcionalidad permite controlar si las columnas vacías se muestran o se ocultan en el panel lateral cuando se hace clic en un nodo.

## Comportamiento por Defecto

**Por defecto, las columnas vacías se muestran** con un valor "-" para indicar que están vacías.

## Configuración

### Opción Global

Puedes configurar el comportamiento globalmente en el objeto de configuración principal:

```javascript
window.$xDiagrams = {
  title: "Diagrams",
  options: {
    showAllColumns: false  // Oculta columnas vacías globalmente
  },
  diagrams: [...]
};
```

### Opción por Diagrama

Puedes configurar el comportamiento específicamente para cada diagrama:

```javascript
{
  name: "Mi Diagrama",
  url: "data/mi-datos.csv",
  options: {
    thumbnailMode: "custom",
    showAllColumns: false  // Oculta columnas vacías solo para este diagrama
  }
}
```

## Valores de Configuración

- `showAllColumns: true` (por defecto) - Muestra todas las columnas, incluyendo las vacías
- `showAllColumns: false` - Oculta las columnas que no tienen valor

## Ejemplos

### Mostrar columnas vacías (comportamiento por defecto)
```javascript
{
  name: "Diagrama con columnas vacías visibles",
  url: "data/datos.csv",
  options: {
    thumbnailMode: "custom"
    // showAllColumns: true (implícito)
  }
}
```

### Ocultar columnas vacías
```javascript
{
  name: "Diagrama con columnas vacías ocultas",
  url: "data/datos.csv",
  options: {
    thumbnailMode: "custom",
    showAllColumns: false
  }
}
```

## Casos de Uso

### Mostrar columnas vacías cuando:
- Quieres que los usuarios vean toda la estructura de datos
- Las columnas vacías tienen significado (ej: "Manager" vacío indica que es el CEO)
- Necesitas consistencia visual entre nodos

### Ocultar columnas vacías cuando:
- Quieres una interfaz más limpia
- Las columnas vacías no aportan información útil
- Tienes muchos campos opcionales que pueden confundir

## Notas Técnicas

- La configuración se aplica al panel lateral (side panel) cuando se hace clic en un nodo
- Las columnas vacías se muestran con un valor "-" y tienen la clase CSS `empty`
- La configuración se hereda de global → diagrama específico
- Si no se especifica, el valor por defecto es `true` (mostrar columnas vacías) 