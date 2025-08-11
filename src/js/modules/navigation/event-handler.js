/**
 * XDiagrams Event Handler Module
 * Maneja eventos específicos de navegación
 */

class XDiagramsEventHandler {
  constructor() {
    this.setupEventListeners();
  }

  /**
   * Configura los event listeners necesarios
   */
  setupEventListeners() {
    // Al cerrar el InfoPanel, deseleccionar nodo
    try {
      window.addEventListener('xdiagrams:infopanel:close', () => {
        this.handleInfoPanelClose();
      });
    } catch (error) {
      console.warn('Error setting up infopanel close listener:', error);
    }
  }

  /**
   * Maneja el evento de cierre del InfoPanel
   */
  handleInfoPanelClose() {
    try {
      d3.selectAll('.node rect')
        .classed('node-selected', false)
        .style('stroke', null)
        .style('stroke-width', null);
    } catch (error) {
      console.warn('Error handling infopanel close:', error);
    }
  }

  /**
   * Limpia los event listeners
   */
  destroy() {
    try {
      window.removeEventListener('xdiagrams:infopanel:close', this.handleInfoPanelClose);
    } catch (error) {
      console.warn('Error removing event listeners:', error);
    }
  }
}

export { XDiagramsEventHandler }; 