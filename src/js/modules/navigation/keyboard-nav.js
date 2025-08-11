/**
 * XDiagrams Keyboard Navigation Module
 * Manejo de navegación por teclado y atajos
 */

class XDiagramsKeyboardNav {
  constructor(navigation) {
    this.navigation = navigation;
    this.core = navigation.core;
    this.keyboardHandler = null;
  }

  setup(container) {
    this.keyboardHandler = (event) => {
      // Evitar manejo doble (captura + burbujeo), especialmente en Firefox
      if (event.__xdiHandled) return;
      event.__xdiHandled = true;

      if ((event.metaKey || event.ctrlKey) && (event.key === '=' || event.key === '+')) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        this.navigation.zoomControlsInstance.adjustZoom(0.01);
        return false;
      } else if ((event.metaKey || event.ctrlKey) && event.key === '-') {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        this.navigation.zoomControlsInstance.adjustZoom(-0.01);
        return false;
      } else if ((event.metaKey || event.ctrlKey) && event.key === '0') {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        this.navigation.zoomControlsInstance.resetZoom(container);
        return false;
      } else if (event.key === 'Tab') {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        this.navigation.escapeLevel = 0;
        const selectedNode = d3.select('.node-selected');
        if (!selectedNode.empty()) {
          this.navigation.nodeNavInstance.handleTabNavigation();
        } else {
          this.navigation.clusterNavInstance.handleTabNavigation();
        }
      } else if (event.key === 'Enter') {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        this.navigation.escapeLevel = 0;
        
        const selectedNode = d3.select('.node-selected');
        if (!selectedNode.empty()) {
          return;
        }
        
        const allClusters = d3.selectAll('.cluster-bg');
        if (allClusters.empty()) {
          return;
        }
        
        const currentCluster = d3.select('.cluster-bg:focus');
        const currentIndex = currentCluster.empty() ? -1 : Array.from(allClusters.nodes()).indexOf(currentCluster.node());
        
        if (currentIndex === -1) {
          const firstCluster = allClusters.nodes()[0];
          if (firstCluster) {
            d3.select(firstCluster).node().focus();
            const clusterGroup = d3.select(firstCluster.parentNode);
            this.navigation.clusterNavInstance.highlightCluster(clusterGroup);
            this.navigation.clusterNavInstance.zoomToCluster(clusterGroup, this.core.globalContainer, true);
          }
          return;
        }
        
        this.navigation.nodeNavInstance.selectFirstNodeInCluster(currentCluster);
      } else if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        
        const selectedNode = d3.select('.node-selected');
        
        if (!selectedNode.empty()) {
          this.navigation.nodeNavInstance.exitNodeNavigationMode();
          this.navigation.escapeLevel = 1;
        } else if (this.navigation.escapeLevel === 1) {
          this.navigation.zoomControlsInstance.resetZoom(container);
          this.navigation.escapeLevel = 0;
        } else {
          this.navigation.zoomControlsInstance.resetZoom(container);
          this.navigation.escapeLevel = 0;
        }
      } else if (event.key === 'R' && event.ctrlKey && event.shiftKey) {
        event.preventDefault();
        this.core.clearCacheAndReload();
      } else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        
        this.navigation.escapeLevel = 0;
        
        const selectedNode = d3.select('.node-selected');
        if (!selectedNode.empty()) {
          this.navigation.nodeNavInstance.handleNodeArrowNavigation(event.key);
        } else {
          this.navigation.clusterNavInstance.handleArrowNavigation(event.key);
        }
      }
    };

    document.addEventListener('keydown', this.keyboardHandler, { capture: true, passive: false });
    
    if (navigator.userAgent.includes('Firefox')) {
      document.addEventListener('keydown', this.keyboardHandler, { passive: false });
    }
  }

  initialize() {
    const allClusters = d3.selectAll('.cluster-bg');
    const firstCluster = d3.select('.cluster-bg').node();
    if (firstCluster) {
      firstCluster.focus();
    }
  }

  destroy() {
    if (this.keyboardHandler) {
      document.removeEventListener('keydown', this.keyboardHandler, { capture: true });
      if (navigator.userAgent.includes('Firefox')) {
        document.removeEventListener('keydown', this.keyboardHandler);
      }
      this.keyboardHandler = null;
    }
  }
}

export { XDiagramsKeyboardNav }; 