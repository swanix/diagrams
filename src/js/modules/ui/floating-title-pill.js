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
    if (this.isInitialized) return;
    
    console.log('[Floating Title Pill] Iniciando...');
    this.createPillElement();
    this.isInitialized = true;
    console.log('[Floating Title Pill] Inicializado correctamente');
  }

  /**
   * Crea el elemento del pill flotante
   */
  createPillElement() {
    console.log('[Floating Title Pill] Creando elemento...');
    this.pillElement = document.createElement('div');
    this.pillElement.className = 'floating-title-pill';
    this.pillElement.id = 'xdiagrams-floating-title-pill';
    
    // Estilos básicos inline para posicionamiento y visibilidad
    this.pillElement.style.cssText = `
      position: fixed !important;
      top: 20px !important;
      left: 20px !important;
      z-index: 9999 !important;
      visibility: visible !important;
      opacity: 1 !important;
      pointer-events: auto !important;
    `;
    
    document.body.appendChild(this.pillElement);
    console.log('[Floating Title Pill] Elemento creado y agregado al DOM');
  }

  /**
   * Actualiza el contenido del pill flotante
   * @param {string} title - Título del diagrama
   * @param {string} logoUrl - URL del logo
   */
  update(title, logoUrl) {
    // Verificar si el elemento existe en el DOM
    if (!this.pillElement || !document.body.contains(this.pillElement)) {
      console.log('[Floating Title Pill] Elemento no encontrado en DOM, reinicializando...');
      this.init();
    }

    console.log('[Floating Title Pill] Actualizando con título:', title, 'y logo:', logoUrl);
    
    // Limpiar contenido existente
    this.pillElement.innerHTML = '';
    
    // Agregar logo si está disponible
    if (logoUrl) {
      const logoElement = document.createElement('img');
      logoElement.className = 'floating-logo';
      logoElement.src = logoUrl;
      logoElement.alt = 'Logo';
      this.pillElement.appendChild(logoElement);
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
    
    console.log('[Floating Title Pill] Actualizado correctamente');
    console.log('[Floating Title Pill] Elemento HTML:', this.pillElement.outerHTML);
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
      console.log('[Floating Title Pill] Elemento perdido, restaurando...');
      this.init();
      return;
    }

    // Verificar si el elemento está visible
    const rect = this.pillElement.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0 || this.pillElement.style.display === 'none') {
      console.log('[Floating Title Pill] Elemento no visible, restaurando...');
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
          console.log('[Floating Title Pill] Tema cambiado, actualizando estilos...');
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

    const currentTheme = document.body.getAttribute('data-theme') || 'light';
    const bodyClasses = document.body.className;
    console.log('[Floating Title Pill] Tema actual:', currentTheme);
    console.log('[Floating Title Pill] Clases del body:', bodyClasses);
    console.log('[Floating Title Pill] Variables CSS aplicadas:', {
      '--ui-panel-bg': getComputedStyle(this.pillElement).getPropertyValue('--ui-panel-bg'),
      '--ui-panel-text': getComputedStyle(this.pillElement).getPropertyValue('--ui-panel-text'),
      '--ui-panel-border': getComputedStyle(this.pillElement).getPropertyValue('--ui-panel-border')
    });

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
    
    // Aplicar estilos CSS críticos
    const computedStyle = getComputedStyle(this.pillElement);
    console.log('[Floating Title Pill] Estilos computados:', {
      background: computedStyle.background,
      color: computedStyle.color,
      border: computedStyle.border,
      display: computedStyle.display,
      visibility: computedStyle.visibility,
      opacity: computedStyle.opacity
    });
  }
}

export { XDiagramsFloatingTitlePill };
