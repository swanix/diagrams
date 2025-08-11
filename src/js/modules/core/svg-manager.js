/**
 * XDiagrams SVG Manager Module
 * Maneja la creación y gestión del elemento SVG del diagrama
 */

class XDiagramsSVGManager {
  constructor() {
    this.diagram = null;
    this.container = null;
  }

  createDiagram() {
    // Crear o obtener el elemento SVG del diagrama
    let diagram = d3.select('#diagram');
    if (diagram.empty()) {
      const app = d3.select('#app');
      if (app.empty()) {
        console.error('XDiagrams: Elemento #app no encontrado');
        return null;
      }

      const width = window.innerWidth;
      const height = window.innerHeight;

      diagram = app.append('svg')
        .attr('id', 'diagram')
        .attr('width', width)
        .attr('height', height)
        .style('position', 'absolute')
        .style('top', '0')
        .style('left', '0')
        .style('width', '100%')
        .style('height', '100%');
    }

    // Crear contenedor principal
    const container = diagram.append('g')
      .style('opacity', 0)
      .style('visibility', 'hidden');

    // Configurar diagrama inicialmente oculto
    diagram
      .style('opacity', 0)
      .style('visibility', 'hidden');

    this.diagram = diagram;
    this.container = container;

    return { diagram, container };
  }

  ensureDiagramHidden() {
    const diagram = document.getElementById('diagram');
    if (diagram) {
      diagram.style.cssText = 'opacity: 0; visibility: hidden; transition: opacity 0.8s ease-in-out, visibility 0.8s ease-in-out';
    }
  }

  showDiagram() {
    if (this.diagram) {
      this.diagram
        .style('opacity', 1)
        .style('visibility', 'visible');
      
      if (this.container) {
        this.container
          .style('opacity', 1)
          .style('visibility', 'visible');
      }
    }
  }

  hideDiagram() {
    if (this.diagram) {
      this.diagram
        .style('opacity', 0)
        .style('visibility', 'hidden');
      
      if (this.container) {
        this.container
          .style('opacity', 0)
          .style('visibility', 'hidden');
      }
    }
  }

  clearDiagram() {
    if (this.diagram) {
      this.diagram.selectAll('*').remove();
    }
  }

  getDiagram() {
    return this.diagram;
  }

  getContainer() {
    return this.container;
  }

  getDiagramDimensions() {
    if (!this.diagram) return { width: 0, height: 0 };
    
    const node = this.diagram.node();
    return {
      width: node.clientWidth || window.innerWidth,
      height: node.clientHeight || window.innerHeight
    };
  }
}

export { XDiagramsSVGManager }; 