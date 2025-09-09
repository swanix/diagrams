/**
 * XDiagrams Floating Title Pill Module
 * Maneja el pill flotante que muestra el título y logo del diagrama
 */

class XDiagramsFloatingTitlePill {
  constructor() {
    this.pillElement = null;
    this.isInitialized = false;
  }

  /**
   * Inicializa el pill flotante
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
    this.pillElement.id = 'xdiagrams-floating-title-pill';
    this.pillElement.className = 'floating-title-pill';
    
    // Agregar al DOM
    document.body.appendChild(this.pillElement);
  }

  /**
   * Actualiza el contenido del pill flotante
   * @param {string} title - Título del diagrama
   * @param {string} logoUrl - URL del logo
   */
  update(title, logoUrl) {
    // Verificar si el elemento existe en el DOM
    if (!this.pillElement || !document.body.contains(this.pillElement)) {
      this.init();
    }
    
    // Limpiar contenido existente
    this.pillElement.innerHTML = '';
    
    // Agregar logo si está disponible, o SVG de rombo si no hay logo
    if (logoUrl) {
      const logoElement = document.createElement('img');
      logoElement.className = 'floating-logo';
      logoElement.src = logoUrl;
      logoElement.alt = 'Logo';
      this.pillElement.appendChild(logoElement);
    } else {
      // Crear SVG de rombo con agujero interno
      const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svgElement.setAttribute('width', '24');
      svgElement.setAttribute('height', '24');
      svgElement.setAttribute('viewBox', '0 0 24 24');
      svgElement.className = 'floating-logo';
      
      // Rombo exterior
      const outerDiamond = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      outerDiamond.setAttribute('d', 'M12 2L22 12L12 22L2 12L12 2Z');
      outerDiamond.setAttribute('fill', 'currentColor');
      outerDiamond.setAttribute('opacity', '0.8');
      
      // Rombo interior (agujero)
      const innerDiamond = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      innerDiamond.setAttribute('d', 'M12 6L18 12L12 18L6 12L12 6Z');
      innerDiamond.setAttribute('fill', 'var(--ui-panel-bg)');
      
      svgElement.appendChild(outerDiamond);
      svgElement.appendChild(innerDiamond);
      this.pillElement.appendChild(svgElement);
    }
    
    // Agregar título
    if (title) {
      const titleElement = document.createElement('h2');
      titleElement.className = 'floating-title';
      titleElement.textContent = title;
      this.pillElement.appendChild(titleElement);
    }
    
    // Asegurar que el pill sea visible
    this.pillElement.style.display = 'flex';
    this.pillElement.style.visibility = 'visible';
    this.pillElement.style.opacity = '1';
    
    // Forzar la aplicación de estilos CSS
    this.forceApplyStyles();
  }

  /**
   * Obtiene el título del diagrama desde la configuración
   * @param {Object} config - Configuración del diagrama
   * @returns {string} Título del diagrama
   */
  getTitleFromConfig(config) {
    // Prioridad: config.title > config.name > document.title
    if (config.title) return config.title;
    if (config.name) return config.name;
    
    const pageTitle = document.querySelector('title');
    return pageTitle ? pageTitle.textContent : 'Diagrama';
  }

  /**
   * Obtiene la URL del logo desde la configuración
   * @param {Object} config - Configuración del diagrama
   * @returns {string|null} URL del logo
   */
  getLogoFromConfig(config) {
    // Prioridad: config.logo > window.$xDiagrams.logo
    if (config.logo) return config.logo;
    if (window.$xDiagrams && window.$xDiagrams.logo) return window.$xDiagrams.logo;
    
    return null;
  }

  /**
   * Actualiza el pill flotante con la configuración del diagrama
   * @param {Object} config - Configuración del diagrama
   */
  updateFromConfig(config) {
    const title = this.getTitleFromConfig(config);
    const logoUrl = this.getLogoFromConfig(config);
    
    this.update(title, logoUrl);
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

  /**
   * Inicia el monitoreo de visibilidad
   */
  startVisibilityMonitoring() {
    // Verificar cada 2 segundos que el pill esté visible
    setInterval(() => {
      this.ensureVisible();
    }, 2000);
  }

  /**
   * Escucha cambios de tema y actualiza el pill
   */
  setupThemeListener() {
    // Escuchar cambios en el atributo data-theme del body
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
          this.updateThemeStyles();
        }
      });
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['data-theme']
    });
  }

  /**
   * Actualiza los estilos del pill según el tema actual
   */
  updateThemeStyles() {
    if (!this.pillElement) return;

    // Los estilos CSS ya se aplican automáticamente a través de las variables CSS
    // Solo necesitamos asegurar que el pill esté visible
    this.ensureVisible();
  }


  /**
   * Fuerza la aplicación de estilos CSS
   */
  forceApplyStyles() {
    if (!this.pillElement) return;

    // Forzar el recálculo de estilos
    this.pillElement.offsetHeight;
  }
}

export { XDiagramsFloatingTitlePill };
