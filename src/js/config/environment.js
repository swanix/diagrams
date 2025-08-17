/**
 * XDiagrams Environment Configuration
 * Maneja las variables de entorno de forma segura en el navegador
 */

class XDiagramsEnvironment {
  constructor() {
    this.config = this.loadConfig();
  }

  /**
   * Carga la configuración desde múltiples fuentes
   * @returns {Object} Configuración cargada
   */
  loadConfig() {
    const config = {
      // Valores por defecto
      LOCAL_URL: 'http://localhost:8888',
      NETLIFY_URL: '/.netlify/functions',
      ENVIRONMENT: 'development'
    };

    // 1. Intentar cargar desde configuración global (window.XDiagramsConfig)
    if (typeof window !== 'undefined' && window.XDiagramsConfig) {
      Object.assign(config, window.XDiagramsConfig);
    }

    // 2. Intentar cargar desde meta tags
    this.loadFromMetaTags(config);

    // 3. Detectar entorno automáticamente
    config.ENVIRONMENT = this.detectEnvironment();

    return config;
  }

  /**
   * Carga configuración desde meta tags
   * @param {Object} config - Objeto de configuración a actualizar
   */
  loadFromMetaTags(config) {
    if (typeof document === 'undefined') return;

    const metaTags = document.querySelectorAll('meta[name^="xdiagrams-"]');
    metaTags.forEach(meta => {
      const key = meta.getAttribute('name').replace('xdiagrams-', '').toUpperCase();
      const value = meta.getAttribute('content');
      if (value) {
        config[key] = value;
      }
    });
  }

  /**
   * Detecta el entorno actual
   * @returns {string} 'development' o 'production'
   */
  detectEnvironment() {
    if (typeof window === 'undefined') return 'development';

    // En desarrollo local
    if (window.location.hostname === 'localhost' || 
        window.location.hostname === '127.0.0.1' ||
        window.location.protocol === 'file:') {
      return 'development';
    }
    
    // En producción (Netlify)
    return 'production';
  }

  /**
   * Obtiene una variable de configuración
   * @param {string} key - Nombre de la variable
   * @param {*} defaultValue - Valor por defecto
   * @returns {*} Valor de la variable o el valor por defecto
   */
  get(key, defaultValue = undefined) {
    return this.config[key] !== undefined ? this.config[key] : defaultValue;
  }

  /**
   * Obtiene toda la configuración
   * @returns {Object} Configuración completa
   */
  getAll() {
    return { ...this.config };
  }

  /**
   * Verifica si estamos en desarrollo
   * @returns {boolean} True si estamos en desarrollo
   */
  isDevelopment() {
    return this.config.ENVIRONMENT === 'development';
  }

  /**
   * Verifica si estamos en producción
   * @returns {boolean} True si estamos en producción
   */
  isProduction() {
    return this.config.ENVIRONMENT === 'production';
  }
}

// Crear instancia global
const environment = new XDiagramsEnvironment();

export { XDiagramsEnvironment, environment };
