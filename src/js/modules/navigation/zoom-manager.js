/**
 * XDiagrams Zoom Manager Module
 * Maneja toda la lógica de zoom y transformaciones de D3
 */

class XDiagramsZoomManager {
  constructor() {
    this.zoom = null;
    this.currentTransform = null;
    this.initialTransform = null;
    this.zoomChangeListeners = [];
  }

  setupZoom(diagram, navigation) {
    this.zoom = d3.zoom()
      .scaleExtent([0.05, 2])
      .wheelDelta(event => -event.deltaY * 0.002)
      .on('zoom', (event) => {
        const transform = event.sourceEvent?.type === 'mousemove' 
          ? d3.zoomIdentity.translate(event.transform.x, event.transform.y).scale(d3.zoomTransform(diagram.node()).k)
          : event.transform;

        this.currentTransform = transform;
        
        // Aplicar transformación al contenedor
        const container = diagram.select('g');
        if (!container.empty()) {
          container.attr('transform', transform);
        }
        
        // Apply zoom-based cluster hover classes
        this.applyZoomBasedClusterClasses(transform.k);
        
        // Notificar a los listeners de cambio de zoom
        this.notifyZoomChangeListeners(transform.k);
        
        // Actualizar panel de información
        this.updateInfoPanel(transform);
        
        // Actualizar controles de zoom
        if (navigation && navigation.zoomControlsInstance) {
          navigation.zoomControlsInstance.updateZoomInput(transform.k);
        }
      });

    // Zoom configurado correctamente

    diagram
      .call(this.zoom)
      .on('dblclick.zoom', null);
    
    // No aplicar transformación inicial aquí, se hará después del renderizado

    return this.zoom;
  }

  getCurrentZoom() {
    const diagram = d3.select('#diagram');
    if (diagram.empty()) return 1;
    
    const node = diagram.node();
    return d3.zoomTransform(node).k;
  }

  getCurrentTransform() {
    return this.currentTransform;
  }

  zoomTo(transform, duration = 750) {
    if (!this.zoom) return;
    
    const diagram = d3.select('#diagram');
    if (diagram.empty()) return;
    
    diagram.transition()
      .duration(duration)
      .ease(d3.easeCubicOut)
      .call(this.zoom.transform, transform);
  }

  zoomToImmediate(transform) {
    if (!this.zoom) return;
    
    const diagram = d3.select('#diagram');
    if (diagram.empty()) return;
    
    // Aplicar transformación inmediatamente sin transición
    diagram.call(this.zoom.transform, transform);
  }

  zoomToScale(scale) {
    if (!this.currentTransform) return;
    
    const newTransform = d3.zoomIdentity
      .translate(this.currentTransform.x, this.currentTransform.y)
      .scale(scale);
    
    this.zoomTo(newTransform);
  }

  resetZoom() {
    if (!this.zoom) return;
    
    const diagram = d3.select('#diagram');
    if (diagram.empty()) return;
    
    diagram.transition()
      .duration(750)
      .call(this.zoom.transform, d3.zoomIdentity);
  }

  updateInfoPanel(transform) {
    // Usar el TransformManager del módulo UI
    if (this.navigation && this.navigation.core && this.navigation.core.uiManager) {
      this.navigation.core.uiManager.updateInfoPanel(transform);
    }
  }

  destroyZoom() {
    if (this.zoom) {
      const diagram = d3.select('#diagram');
      if (!diagram.empty()) {
        diagram.on('.zoom', null);
      }
      this.zoom = null;
      this.currentTransform = null;
    }
  }

  getZoomInstance() {
    return this.zoom;
  }

  setInitialTransform(transform) {
    this.initialTransform = transform;
  }

  getInitialTransform() {
    return this.initialTransform;
  }

  /**
   * Apply zoom-based CSS classes to cluster backgrounds for different hover styles
   * @param {number} zoomLevel - Current zoom level (transform.k)
   */
  applyZoomBasedClusterClasses(zoomLevel) {
    // Get all cluster background elements
    const clusterBgs = d3.selectAll('.cluster-bg');
    
    if (clusterBgs.empty()) {
      return;
    }
    
    // Remove existing zoom classes
    clusterBgs.classed('zoom-out', false).classed('zoom-in', false);
    
    // Apply appropriate class based on zoom level
    // Zoom <= 10% (0.10) = vista general (color naranja)
    // Zoom > 10% (0.10) = vista detallada (color verde)
    if (zoomLevel <= 0.10) {
      clusterBgs.classed('zoom-out', true);
      // Solo log si no está desactivado
      if (this.navigation && this.navigation.core && this.navigation.core.config && this.navigation.core.config.enableNavigationLogs !== false) {
        console.log('[ZoomClasses] Applied zoom-out class (zoom <= 10%):', zoomLevel);
      }
    } else {
      clusterBgs.classed('zoom-in', true);
      // Solo log si no está desactivado
      if (this.navigation && this.navigation.core && this.navigation.core.config && this.navigation.core.config.enableNavigationLogs !== false) {
        console.log('[ZoomClasses] Applied zoom-in class (zoom > 10%):', zoomLevel);
      }
    }
  }

  /**
   * Registrar un listener para cambios de zoom
   * @param {Function} listener - Función a llamar cuando cambie el zoom
   */
  onZoomChange(listener) {
    this.zoomChangeListeners.push(listener);
  }

  /**
   * Notificar a todos los listeners de cambio de zoom
   * @param {number} zoomLevel - Nivel de zoom actual
   */
  notifyZoomChangeListeners(zoomLevel) {
    this.zoomChangeListeners.forEach(listener => {
      try {
        listener(zoomLevel);
      } catch (error) {
        console.error('[ZoomManager] Error en listener de zoom:', error);
      }
    });
  }
}

export { XDiagramsZoomManager }; 