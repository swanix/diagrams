# Configuración de Zoom Manual

## Descripción

El sistema de zoom manual permite controlar el rango de zoom que se puede hacer en cada diagrama con la rueda del mouse. Cada diagrama puede tener su propia configuración de zoom, o usar la configuración global por defecto.

## Configuración Global

Puedes establecer una configuración de zoom por defecto para todos los diagramas:

```javascript
window.$xDiagrams = {
  title: "Diagrams",
  // Configuración global de zoom (por defecto para todos los diagramas)
  zoom: {
    minScale: 0.01,    // Zoom mínimo (1% del tamaño original)
    maxScale: 2.5,     // Zoom máximo (250% del tamaño original)
    wheelDelta: 0.002  // Sensibilidad del zoom con la rueda del mouse
  },
  diagrams: [
    // ... tus diagramas
  ]
};
```

## Configuración por Diagrama

Cada diagrama puede tener su propia configuración de zoom que sobrescribe la configuración global:

```javascript
{
  name: "Mi Diagrama",
  url: "data/mi-diagrama.csv",
  zoom: {
    minScale: 0.05,    // Zoom mínimo específico para este diagrama
    maxScale: 3.0,     // Zoom máximo específico para este diagrama
    wheelDelta: 0.003  // Sensibilidad específica para este diagrama
  }
}
```

## Parámetros de Configuración

### `minScale`
- **Descripción**: El nivel mínimo de zoom (más alejado)
- **Valores típicos**: 
  - `0.01` = 1% del tamaño original (muy alejado)
  - `0.05` = 5% del tamaño original
  - `0.1` = 10% del tamaño original
- **Recomendación**: Usar valores más pequeños para diagramas grandes

### `maxScale`
- **Descripción**: El nivel máximo de zoom (más cercano)
- **Valores típicos**:
  - `1.5` = 150% del tamaño original
  - `2.0` = 200% del tamaño original
  - `3.0` = 300% del tamaño original
- **Recomendación**: Usar valores más grandes para diagramas pequeños

### `wheelDelta`
- **Descripción**: Sensibilidad del zoom con la rueda del mouse
- **Valores típicos**:
  - `0.0005` = Zoom muy lento (para diagramas grandes)
  - `0.001` = Zoom lento
  - `0.002` = Zoom normal (por defecto)
  - `0.003` = Zoom rápido
- **Recomendación**: Usar valores más pequeños para diagramas grandes

## Ejemplos de Configuración

### Diagrama Pequeño (Un Cluster)
```javascript
{
  name: "One Cluster",
  url: "data/one-cluster.csv",
  zoom: {
    minScale: 0.1,     // Menos zoom out para cluster único
    maxScale: 3.0,     // Más zoom in para cluster único
    wheelDelta: 0.003  // Zoom más rápido para cluster único
  }
}
```

### Diagrama Mediano (Multi-Clusters)
```javascript
{
  name: "Clusters Simple",
  url: "data/multi-clusters.csv",
  grid: 3,
  zoom: {
    minScale: 0.05,    // Más zoom out para multi-clusters
    maxScale: 2.0,     // Menos zoom in para multi-clusters
    wheelDelta: 0.001  // Zoom más lento para multi-clusters
  }
}
```

### Diagrama Grande (1000 Nodos)
```javascript
{
  name: "Flat - 1000 Nodes",
  url: "data/flat-1000-nodes.json",
  grid: 30,
  zoom: {
    minScale: 0.005,   // Zoom muy alejado para diagramas grandes
    maxScale: 1.5,     // Zoom limitado para diagramas grandes
    wheelDelta: 0.0005 // Zoom muy lento para diagramas grandes
  }
}
```

## Comportamiento del Sistema

1. **Configuración por Defecto**: Si no se especifica configuración de zoom, se usa la configuración global
2. **Sobrescritura**: La configuración específica del diagrama sobrescribe la configuración global
3. **Aplicación Automática**: La configuración se aplica automáticamente al cambiar de diagrama
4. **Compatibilidad**: Funciona con todos los tipos de diagramas (clusters, árboles, listas planas)

## Funciones de Debug

El sistema incluye funciones de debug disponibles en la consola:

```javascript
// Obtener información del zoom actual
window.getZoomInfo()

// Aplicar zoom personalizado
window.applyCustomZoom(0.5)

// Resetear zoom
window.resetZoom()

// Verificar si el zoom está en estado problemático
window.isZoomProblematic()
```

## Notas Técnicas

- El sistema se aplica automáticamente cuando se cambia de diagrama
- La configuración se mantiene durante la sesión
- Es compatible con el auto-zoom y el side panel
- No afecta el comportamiento de arrastrar y soltar 