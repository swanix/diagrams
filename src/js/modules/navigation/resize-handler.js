/**
 * XDiagrams Resize Handler Module
 * Manejo de redimensionamiento de ventana y ajuste automático
 */

class XDiagramsResizeHandler {
  constructor(navigation) {
    this.navigation = navigation;
    this.core = navigation.core;
    this.resizeHandler = null;
  }

  setup() {
    let resizeTimeout;
    let isResizing = false;
    let lastWidth = window.innerWidth;
    let lastHeight = window.innerHeight;
    
    this.resizeHandler = () => {
      const currentWidth = window.innerWidth;
      const currentHeight = window.innerHeight;
      
      const widthChange = Math.abs(currentWidth - lastWidth);
      const heightChange = Math.abs(currentHeight - lastHeight);
      const isSignificantChange = widthChange > 10 || heightChange > 10;
      
      if (!isResizing) {
        isResizing = true;
      }
      
      const svg = d3.select('#diagram');
      if (!svg.empty()) {
        svg
          .attr('width', currentWidth)
          .attr('height', currentHeight);
        
        if (this.core.config.fitOnResize && this.core.globalContainer && this.core.globalTrees) {
          const bounds = this.core.calculateDiagramBounds();
          this.core.applyInitialZoomImmediate(this.core.globalContainer, bounds.width, bounds.height);
        } else if (isSignificantChange && this.core.globalContainer && this.core.globalTrees) {
          const currentZoom = this.core.navigation?.zoomManagerInstance?.getCurrentZoom() || 1;
          const zoomThreshold = 0.20;
          if (currentZoom <= zoomThreshold) {
            const bounds = this.core.calculateDiagramBounds();
            this.core.applyInitialZoomImmediate(this.core.globalContainer, bounds.width, bounds.height);
          }
        }
      }
      
      lastWidth = currentWidth;
      lastHeight = currentHeight;
      
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        isResizing = false;
      }, 100);
    };
    
    window.addEventListener('resize', this.resizeHandler);
  }

  destroy() {
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
      this.resizeHandler = null;
    }
  }
}

export { XDiagramsResizeHandler }; 