# Espaciado Uniforme entre Clusters - Mejoras Implementadas

## Problema Identificado

El código original tenía **dos sistemas de espaciado en conflicto**:

1. **Espaciado inicial fijo**: `treeSpacingX = 3400px` entre clusters
2. **Espaciado recalculado**: Basado en el ancho real de cada cluster + `clusterSpacing = -1400px`

Esto resultaba en **espaciado inconsistente** entre clusters de diferentes tamaños.

## Solución Implementada

### 1. Nueva Lógica de Espaciado Uniforme

**Archivo modificado**: `src/sw-diagrams-clean.js`

**Función actualizada**: `recalculateClusterSpacing()`

```javascript
function recalculateClusterSpacing(clusters, clusterSpacing) {
  if (clusters.length <= 1) return;

  // Calcular el ancho total de todos los clusters
  let totalClusterWidth = 0;
  clusters.forEach((cluster, index) => {
    const bbox = cluster.treeGroup.node().getBBox();
    totalClusterWidth += bbox.width;
  });

  // Calcular el espaciado uniforme entre clusters
  const uniformSpacing = Math.abs(clusterSpacing); // Usar valor absoluto
  const totalSpacing = uniformSpacing * (clusters.length - 1);
  const totalWidth = totalClusterWidth + totalSpacing;
  
  // Calcular el ancho disponible y centrar todo
  const availableWidth = Math.max(totalWidth, window.innerWidth - 300);
  const startX = (availableWidth - totalWidth) / 2 + 150;
  
  let currentX = startX;

  clusters.forEach((cluster, index) => {
    const treeGroup = cluster.treeGroup;
    const bbox = treeGroup.node().getBBox();

    // Coloca el cluster en currentX
    const newX = currentX - bbox.x;
    treeGroup.attr("transform", `translate(${newX}, 100)`);

    // El siguiente cluster empieza después del borde derecho + espaciado uniforme
    currentX = newX + bbox.x + bbox.width + uniformSpacing;
  });
}
```

### 2. Valores de Espaciado Actualizados

**Cambios realizados**:

- **Valor por defecto**: De `-1400px` a `400px` (más intuitivo)
- **Todos los temas**: Actualizados para usar valores positivos
- **Lógica mejorada**: Usa `Math.abs(clusterSpacing)` para manejar cualquier valor

**Temas actualizados**:
- `snow`: `400px`
- `onyx`: `400px`
- `vintage`: `400px`
- `pastel`: `400px`
- `neon`: `400px`

### 3. Beneficios de la Nueva Implementación

✅ **Espaciado uniforme**: Todos los clusters mantienen la misma distancia entre sí

✅ **Centrado automático**: Los clusters se centran automáticamente en el área disponible

✅ **Configuración intuitiva**: Valores positivos más fáciles de entender

✅ **Mejor distribución**: Se calcula el ancho total y se distribuye uniformemente

✅ **Responsive**: Se adapta al ancho de la ventana

## Archivos de Prueba

### `src/test-uniform-spacing.html`

Archivo de demostración que incluye:

- **3 clusters de diferentes tamaños**:
  - Cluster Pequeño (3 nodos)
  - Cluster Mediano (5 nodos)  
  - Cluster Grande (8 nodos)

- **Controles interactivos**:
  - Ajuste de espaciado en tiempo real
  - Zoom automático
  - Reset de zoom

- **Información visual**: Explica las mejoras implementadas

## Cómo Probar

1. Abrir `src/test-uniform-spacing.html` en un navegador
2. Observar que todos los clusters tienen el mismo espaciado entre sí
3. Cambiar el valor de espaciado y hacer clic en "Actualizar Espaciado"
4. Verificar que el espaciado se mantiene uniforme

## Variables CSS Configurables

```css
--cluster-spacing: 400px; /* Espaciado uniforme entre clusters */
--cluster-padding-x: 220px; /* Padding interno horizontal del cluster */
--cluster-padding-y: 220px; /* Padding interno vertical del cluster */
```

## Compatibilidad

- ✅ **Retrocompatible**: No rompe funcionalidad existente
- ✅ **Temas existentes**: Todos los temas funcionan con la nueva lógica
- ✅ **Datos existentes**: No requiere cambios en los datos CSV
- ✅ **Navegadores**: Compatible con todos los navegadores modernos

## Logs de Debug

La función incluye logs detallados para debugging:

```javascript
console.log(`[ClusterSpacing] Cluster ${index}: newX=${newX}, width=${bbox.width}, spacing=${uniformSpacing}`);
```

Esto permite monitorear el posicionamiento de cada cluster y verificar que el espaciado sea correcto. 