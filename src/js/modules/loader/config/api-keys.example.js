/**
 * XDiagrams API Keys Configuration - EXAMPLE FILE
 * 
 * IMPORTANTE: Este es un archivo de ejemplo. NO incluyas API Keys reales aquí.
 * 
 * Para configurar API Keys:
 * 1. Copia este archivo como api-keys.js
 * 2. Reemplaza los valores vacíos con tus API Keys reales
 * 3. Asegúrate de que api-keys.js esté en .gitignore
 */

class XDiagramsApiKeysConfig {
  constructor() {
    this.apiKeys = this.loadApiKeys();
  }

  /**
   * Carga las API Keys desde variables de entorno
   * @returns {Object} Configuración de API Keys
   */
  loadApiKeys() {
    // Intentar obtener desde variables de entorno globales
    const env = typeof process !== 'undefined' ? process.env : {};
    
    // También intentar obtener desde window.__XDIAGRAMS_CONFIG__ si existe
    const windowConfig = typeof window !== 'undefined' && window.__XDIAGRAMS_CONFIG__ 
      ? window.__XDIAGRAMS_CONFIG__.API_KEYS 
      : {};

    return {
      // SheetBest API Keys - Priorizar window config sobre env
      'sheet.best': windowConfig.SHEETBEST_API_KEY || env.SHEETBEST_API_KEY || '',
      'sheetbest.com': windowConfig.SHEETBEST_API_KEY || env.SHEETBEST_API_KEY || '',
      'api.sheetbest.com': windowConfig.SHEETBEST_API_KEY || env.SHEETBEST_API_KEY || '',
      
      // Otras APIs
      'api.example.com': windowConfig.EXAMPLE_API_KEY || env.EXAMPLE_API_KEY || '',
      
      // Configuración por URL específica - Priorizar window config
      'https://sheet.best/api/sheets/': windowConfig.SHEETBEST_API_KEY || env.SHEETBEST_API_KEY || '',
      'https://api.sheetbest.com/sheets/': windowConfig.SHEETBEST_API_KEY || env.SHEETBEST_API_KEY || '',
      
      // Configuración personalizada por dominio
      ...windowConfig
    };
  }

  /**
   * Obtiene la API Key para una URL específica
   * @param {string} url - La URL para la cual buscar la API Key
   * @returns {string|null} La API Key o null si no se encuentra
   */
  getApiKey(url) {
    if (!url) return null;

    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname;
      const fullUrl = urlObj.origin + urlObj.pathname;

      // Buscar por URL completa primero
      for (const [pattern, apiKey] of Object.entries(this.apiKeys)) {
        if (fullUrl.startsWith(pattern) && apiKey) {
          return apiKey;
        }
      }

      // Buscar por hostname
      for (const [pattern, apiKey] of Object.entries(this.apiKeys)) {
        if (hostname.includes(pattern) && apiKey) {
          return apiKey;
        }
      }

      return null;
    } catch (error) {
      console.warn('Error parsing URL for API key lookup:', error);
      return null;
    }
  }

  /**
   * Verifica si una URL requiere autenticación
   * @param {string} url - La URL a verificar
   * @returns {boolean} True si requiere autenticación
   */
  requiresAuthentication(url) {
    return this.getApiKey(url) !== null;
  }

  /**
   * Agrega una API Key temporalmente (no persiste)
   * @param {string} pattern - Patrón de URL o hostname
   * @param {string} apiKey - La API Key
   */
  addTemporaryApiKey(pattern, apiKey) {
    this.apiKeys[pattern] = apiKey;
  }

  /**
   * Remueve una API Key temporal
   * @param {string} pattern - Patrón de URL o hostname
   */
  removeApiKey(pattern) {
    delete this.apiKeys[pattern];
  }

  /**
   * Obtiene todas las configuraciones de API Keys (sin mostrar las keys)
   * @returns {Array} Lista de patrones configurados
   */
  getConfiguredPatterns() {
    return Object.keys(this.apiKeys).filter(pattern => this.apiKeys[pattern]);
  }

  /**
   * Verifica si hay API Keys configuradas
   * @returns {boolean} True si hay al menos una API Key configurada
   */
  hasConfiguredKeys() {
    return this.getConfiguredPatterns().length > 0;
  }
}

// Instancia singleton
const apiKeysConfig = new XDiagramsApiKeysConfig();

export { XDiagramsApiKeysConfig, apiKeysConfig };
