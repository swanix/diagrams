/**
 * XDiagrams Floating Sections Count Pill Module
 * Maneja el pill flotante que muestra el contador de secciones visibles
 */

class XDiagramsFloatingSectionsCountPill {
  constructor() {
    this.pillElement = null;
    this.isInitialized = false;
  }

  /**
   * Inicializa el pill flotante de contador de secciones
   */
  init() {
    this.createPillElement();
  }

  /**
   * Crea el elemento del pill flotante
   */
  createPillElement() {
    // Crear el elemento pill
    this.pillElement = document.createElement('div');
    this.pillElement.id = 'xdiagrams-floating-sections-count-pill';
    this.pillElement.className = 'floating-sections-count-pill';
    
    // Agregar al DOM
    document.body.appendChild(this.pillElement);
  }

  /**
   * Actualiza el contador de secciones visibles
   * @param {number} visibleCount - Número de secciones visibles
   */
  updateSectionsCount(visibleCount) {
    if (!this.pillElement) return;

    this.pillElement.textContent = `${visibleCount} Secciones`;
    this.pillElement.title = `${visibleCount} secciones visibles`;
  }

  /**
   * Muestra el pill flotante
   */
  show() {
    if (this.pillElement) {
      this.pillElement.style.display = 'flex';
    }
  }

  /**
   * Oculta el pill flotante
   */
  hide() {
    if (this.pillElement) {
      this.pillElement.style.display = 'none';
    }
  }

  /**
   * Destruye el pill flotante
   */
  destroy() {
    if (this.pillElement) {
      this.pillElement.remove();
      this.pillElement = null;
      this.isInitialized = false;
    }
  }

  /**
   * Verifica que el pill esté visible y lo restaura si es necesario
   */
  ensureVisible() {
    if (!this.pillElement || !document.body.contains(this.pillElement)) {
      this.init();
      return;
    }

    // Verificar si el elemento está visible
    const rect = this.pillElement.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0 || this.pillElement.style.display === 'none') {
      this.pillElement.style.display = 'flex';
      this.pillElement.style.visibility = 'visible';
      this.pillElement.style.opacity = '1';
    }
  }
}

export { XDiagramsFloatingSectionsCountPill };
