/**
 * XDiagrams Zoom Controls Module
 * Manejo de controles de zoom y UI relacionada
 */

class XDiagramsZoomControls {
  constructor(navigation) {
    this.navigation = navigation;
    this.core = navigation.core;
    this.zoomControls = null;
    this.zoomInput = null;
  }

  create() {
    document.getElementById('zoom-controls')?.remove();

    const zoomControls = document.createElement('div');
    zoomControls.id = 'zoom-controls';
    zoomControls.className = 'zoom-controls';

    const zoomOutBtn = document.createElement('button');
    zoomOutBtn.className = 'zoom-btn';
    zoomOutBtn.innerHTML = '−';
    zoomOutBtn.title = 'Reducir zoom';
    zoomOutBtn.onclick = () => this.adjustZoom(-0.08);

    const inputContainer = document.createElement('div');
    inputContainer.className = 'zoom-input-container';

    const zoomInput = document.createElement('input');
    zoomInput.className = 'zoom-input';
    zoomInput.type = 'text';
    zoomInput.placeholder = '100';
    zoomInput.title = 'Nivel de zoom en porcentaje (6-150%)';
    zoomInput.onchange = (e) => this.setZoomFromInput(e.target.value);
    zoomInput.onkeydown = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        this.setZoomFromInput(e.target.value);
        e.target.blur();
      }
    };

    const zoomPercent = document.createElement('span');
    zoomPercent.className = 'zoom-percent-inline';
    zoomPercent.textContent = '%';

    const zoomInBtn = document.createElement('button');
    zoomInBtn.className = 'zoom-btn';
    zoomInBtn.innerHTML = '+';
    zoomInBtn.title = 'Aumentar zoom';
    zoomInBtn.onclick = () => this.adjustZoom(0.08);

    inputContainer.appendChild(zoomInput);
    inputContainer.appendChild(zoomPercent);

    zoomControls.appendChild(zoomOutBtn);
    zoomControls.appendChild(inputContainer);
    zoomControls.appendChild(zoomInBtn);

    document.body.appendChild(zoomControls);
    this.zoomControls = zoomControls;
    this.zoomInput = zoomInput;
  }

  updateZoomInput(scale) {
    if (this.zoomInput) {
      this.zoomInput.value = Math.round(scale * 100);
    }
  }

  resetZoom(container) {
    const svg = d3.select('#diagram');
    
    this.navigation.clusterNavInstance.deselectActiveCluster();

    try {
      d3.selectAll('.node rect')
        .classed('node-selected', false)
        .style('stroke', null)
        .style('stroke-width', null)
        .style('fill', null);
    } catch (_) {}
    
    const initialTransform = this.core.navigation?.zoomManagerInstance?.getInitialTransform();
    if (initialTransform) {
          if (this.core.uiManager && typeof this.core.uiManager.closeInfoPanel === 'function') {
      this.core.uiManager.closeInfoPanel();
    }
      // Usar módulo de navegación para resetear zoom
      if (this.core.navigation && this.core.navigation.zoomManagerInstance) {
        this.core.navigation.zoomManagerInstance.zoomTo(initialTransform, 1000);
      } else {
        svg.transition()
          .duration(1000)
          .ease(d3.easeCubicOut)
          .call(d3.zoom().transform, initialTransform);
      }
      
      document.getElementById('zoom-status')?.style.setProperty('display', 'none');
      return;
    }
    
    const svgNode = svg.node();
    const svgRect = svgNode.getBoundingClientRect();
    const { width: svgWidth, height: svgHeight } = svgRect;
    
    const realBounds = this.core.calculateDiagramBounds();
    if (this.core.uiManager && typeof this.core.uiManager.closeInfoPanel === 'function') {
      this.core.uiManager.closeInfoPanel();
    }
    const actualWidth = realBounds.width || 8000;
    const actualHeight = realBounds.height || 8000;
    
    const scaleX = svgWidth / actualWidth;
    const scaleY = svgHeight / actualHeight;
    const scale = Math.min(scaleX, scaleY) * 0.95;
    
    const scaledDiagramWidth = actualWidth * scale;
    const scaledDiagramHeight = actualHeight * scale;
    
    const translateX = (svgWidth - scaledDiagramWidth) / 2;
    const translateY = (svgHeight - scaledDiagramHeight) / 2;
    
    const targetTransform = d3.zoomIdentity.translate(translateX, translateY).scale(scale);
    
    // Usar módulo de navegación para aplicar transformación
    if (this.core.navigation && this.core.navigation.zoomManagerInstance) {
      this.core.navigation.zoomManagerInstance.zoomTo(targetTransform, this.core.config.transitionDuration.reset);
    } else {
      svg.transition()
        .duration(this.core.config.transitionDuration.reset)
        .ease(d3.easeCubicOut)
        .call(d3.zoom().transform, targetTransform);
    }
    
    document.getElementById('zoom-status')?.style.setProperty('display', 'none');
  }

  adjustZoom(delta) {
    if (!this.core.navigation || !this.core.navigation.zoomManagerInstance) return;

    const svg = d3.select('#diagram');
    const svgNode = svg.node();
    const svgRect = svgNode.getBoundingClientRect();
    const { width: svgWidth, height: svgHeight } = svgRect;
    const currentTransform = d3.zoomTransform(svgNode);
    
    const initialTransform = this.core.navigation?.zoomManagerInstance?.getInitialTransform();
    if (currentTransform.k < 0.05 && delta > 0 && initialTransform) {
      const initialScale = initialTransform.k;
      
      const viewportCenterX = svgWidth / 2;
      const viewportCenterY = svgHeight / 2;
      
      const scaleRatio = initialScale / currentTransform.k;
      const newX = viewportCenterX - (viewportCenterX - currentTransform.x) * scaleRatio;
      const newY = viewportCenterY - (viewportCenterY - currentTransform.y) * scaleRatio;
      
      const newTransform = d3.zoomIdentity
        .translate(newX, newY)
        .scale(initialScale);

      this.core.navigation.zoomManagerInstance.zoomTo(newTransform, 300);
      return;
    }
    
    let jumpSize;
    if (delta > 0) {
      if (currentTransform.k >= 1.0) {
        jumpSize = 0.75;
      } else if (currentTransform.k >= 0.5) {
        jumpSize = 0.50;
      } else if (currentTransform.k >= 0.25) {
        jumpSize = 0.25;
      } else {
        jumpSize = 0.10;
      }
    } else {
      if (currentTransform.k >= 1.0) {
        jumpSize = 0.50;
      } else if (currentTransform.k >= 0.5) {
        jumpSize = 0.25;
      } else if (currentTransform.k >= 0.25) {
        jumpSize = 0.15;
      } else {
        jumpSize = 0.10;
      }
    }
    
    const actualDelta = delta > 0 ? jumpSize : -jumpSize;
    const newScale = Math.max(0.05, Math.min(2.0, currentTransform.k + actualDelta));
    
    const viewportCenterX = svgWidth / 2;
    const viewportCenterY = svgHeight / 2;
    
    const scaleRatio = newScale / currentTransform.k;
    const newX = viewportCenterX - (viewportCenterX - currentTransform.x) * scaleRatio;
    const newY = viewportCenterY - (viewportCenterY - currentTransform.y) * scaleRatio;
    
    const newTransform = d3.zoomIdentity
      .translate(newX, newY)
      .scale(newScale);

    this.core.navigation.zoomManagerInstance.zoomTo(newTransform, 300);
  }

  setZoomFromInput(value) {
    if (!this.core.navigation || !this.core.navigation.zoomManagerInstance) return;

    const percentage = parseFloat(value);
    if (isNaN(percentage) || percentage < 6 || percentage > 200) {
      const svg = d3.select('#diagram');
      const currentTransform = d3.zoomTransform(svg.node());
      this.zoomInput.value = Math.round(currentTransform.k * 100);
      return;
    }

    const scale = percentage / 100;
    const svg = d3.select('#diagram');
    const svgNode = svg.node();
    const svgRect = svgNode.getBoundingClientRect();
    const { width: svgWidth, height: svgHeight } = svgRect;
    const currentTransform = d3.zoomTransform(svgNode);
    
    const viewportCenterX = svgWidth / 2;
    const viewportCenterY = svgHeight / 2;
    
    const scaleRatio = scale / currentTransform.k;
    const newX = viewportCenterX - (viewportCenterX - currentTransform.x) * scaleRatio;
    const newY = viewportCenterY - (viewportCenterY - currentTransform.y) * scaleRatio;
    
    const newTransform = d3.zoomIdentity
      .translate(newX, newY)
      .scale(scale);

    this.core.navigation.zoomManagerInstance.zoomTo(newTransform, 300);
  }

  destroy() {
    if (this.zoomControls) {
      this.zoomControls.remove();
      this.zoomControls = null;
      this.zoomInput = null;
    }
  }
}

export { XDiagramsZoomControls }; 