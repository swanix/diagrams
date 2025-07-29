# Selección Automática del Nodo Padre del Cluster

Esta funcionalidad permite que cuando se hace zoom a un cluster, automáticamente se seleccione el nodo padre del cluster y se abra el side-panel con su información.

## Funcionamiento

### Proceso Automático

1. **Clic en Cluster**: El usuario hace clic en un cluster
2. **Zoom al Cluster**: Se ejecuta la animación de zoom hacia el cluster seleccionado
3. **Identificación del Nodo Padre**: Se identifica automáticamente el nodo padre del cluster
4. **Actualización del Side-Panel**: Se actualiza el contenido del side-panel con la información del nodo padre (sin cerrar/abrir)
5. **Selección Visual**: El nodo padre se selecciona visualmente

### Identificación del Nodo Padre

El sistema identifica el nodo padre del cluster de la siguiente manera:

- **Cluster ID**: Cada cluster tiene un `data-root-id` que corresponde al ID del nodo padre
- **Búsqueda en Datos**: Se busca en `window.$xDiagrams.currentData` el nodo que coincida con el ID del cluster
- **Validación**: Se verifica que el nodo padre exista antes de proceder

## Implementación Técnica

### Función `getClusterParentNode(clusterInfo)`

```javascript
function getClusterParentNode(clusterInfo) {
  if (!clusterInfo || !clusterInfo.id) {
    console.warn('[ClusterParent] No cluster info provided');
    return null;
  }
  
  // Find the node in currentData that matches the cluster ID
  const parentNode = window.$xDiagrams.currentData.find(node => node.id === clusterInfo.id);
  
  if (!parentNode) {
    console.warn('[ClusterParent] Parent node not found for cluster:', clusterInfo.id);
    return null;
  }
  
  return parentNode;
}
```

### Función `updateSidePanelContent(nodeData)`

```javascript
function updateSidePanelContent(nodeData) {
  const sidePanel = document.getElementById('side-panel');
  const content = document.getElementById('side-panel-content');
  const titleElement = document.getElementById('side-panel-title');
  
  if (!sidePanel || !content || !titleElement) {
    console.error('[SidePanel] Side panel elements not found');
    return;
  }
  
  // Check if panel is currently open
  const isPanelOpen = sidePanel.classList.contains('open');
  
  if (!isPanelOpen) {
    // If panel is not open, use the regular openSidePanel function
    openSidePanel(nodeData);
    return;
  }
  
  // Update content without closing/opening animation
  // ... (actualización de título, contenido y selección visual)
}
```

### Integración en `zoomToCluster()`

La funcionalidad se integra en la función `zoomToCluster()` al final de la animación de zoom:

```javascript
.on("end", function() {
  // Zoom completed - cluster is already styled as selected
  console.log('[ClusterClickMode] Zoom completed for cluster:', clusterInfo.id);
  
  // Re-enable hover and tooltips after zoom animation completes
  reEnableHoverAndTooltipsAfterZoom();
  
  // Get the parent node of the cluster and update side panel content
  const parentNode = getClusterParentNode(clusterInfo);
  if (parentNode && isOptionEnabled('sidePanel') !== false) {
    console.log('[ClusterClickMode] Updating side panel for cluster parent node:', parentNode.name);
    
    // Add a small delay to ensure zoom animation is fully complete
    setTimeout(() => {
      updateSidePanelContent(parentNode);
    }, 100);
  }
  
  // Reset zooming flag
  setTimeout(() => {
    window.$xDiagrams.clusterClickMode.isZoomingToCluster = false;
  }, 500);
});
```

## Características

### ✅ Funcionalidades Implementadas

- **Selección Automática**: El nodo padre se selecciona automáticamente al hacer zoom
- **Actualización Fluida del Side-Panel**: Se actualiza el contenido del side-panel sin cerrar/abrir (igual que navegar entre nodos)
- **Timing Optimizado**: Se espera a que termine la animación de zoom antes de actualizar el panel
- **Validación de Configuración**: Respeta la configuración de `sidePanel` en las opciones
- **Logging Detallado**: Incluye logs para debugging y monitoreo

### 🎯 Beneficios de UX

- **Flujo Natural**: El usuario ve inmediatamente la información del cluster al hacer zoom
- **Reducción de Clics**: No necesita hacer clic adicional para ver la información
- **Contexto Inmediato**: Obtiene contexto sobre el cluster seleccionado
- **Consistencia**: Mantiene la consistencia con el comportamiento de clic en nodos
- **Navegación Fluida**: El side-panel se mantiene abierto al cambiar entre clusters (sin parpadeos)

### ⚙️ Configuración

La funcionalidad respeta la configuración global del side-panel:

```javascript
options: {
  sidePanel: true, // Habilita/deshabilita la apertura automática
  // ... otras opciones
}
```

## Casos de Uso

### Diagramas Jerárquicos
- **Organigramas**: Al hacer zoom a un departamento, se muestra la información del jefe
- **Árboles de Proyectos**: Al hacer zoom a un equipo, se muestra la información del líder

### Diagramas de Clusters
- **Agrupaciones**: Al hacer zoom a un grupo, se muestra la información del nodo padre
- **Categorías**: Al hacer zoom a una categoría, se muestra la información del contenedor

## Notas Técnicas

- **Dependencias**: Requiere que `window.$xDiagrams.currentData` esté disponible
- **Performance**: La búsqueda del nodo padre es O(n) pero se ejecuta solo al final del zoom
- **Compatibilidad**: Funciona con todos los tipos de diagramas que soporten clusters
- **Fallback**: Si no se encuentra el nodo padre, no se abre el side-panel (graceful degradation)

## Debugging

### Logs Disponibles

- `[ClusterParent] No cluster info provided` - Cuando no se proporciona información del cluster
- `[ClusterParent] Parent node not found for cluster: [ID]` - Cuando no se encuentra el nodo padre
- `[ClusterParent] Found parent node for cluster: [ID]` - Cuando se encuentra exitosamente
- `[ClusterClickMode] Opening side panel for cluster parent node: [NAME]` - Cuando se abre el panel

### Verificación

Para verificar que la funcionalidad funciona correctamente:

1. Abrir la consola del navegador
2. Hacer clic en un cluster
3. Verificar que aparezcan los logs de selección del nodo padre
4. Confirmar que el side-panel se abre con la información correcta 