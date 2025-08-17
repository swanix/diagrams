/**
 * XDiagrams Authentication Manager
 * Maneja la autenticación para APIs protegidas
 */

// Configuración de API Keys movida a Netlify Functions
// No necesitamos importar api-keys.js aquí

class XDiagramsAuthManager {
  constructor() {
    this.authMethods = {
      'sheet.best': this.createSheetBestAuth,
      'sheetbest.com': this.createSheetBestAuth,
      'default': this.createDefaultAuth
    };
  }

  /**
   * Crea headers de autenticación para SheetBest
   * @param {string} apiKey - La API Key
   * @returns {Object} Headers de autenticación
   */
  createSheetBestAuth(apiKey) {
    return {
      'X-Api-Key': apiKey,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Crea headers de autenticación por defecto
   * @param {string} apiKey - La API Key
   * @returns {Object} Headers de autenticación
   */
  createDefaultAuth(apiKey) {
    return {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Obtiene los headers de autenticación para una URL
   * @param {string} url - La URL para la cual obtener headers
   * @returns {Object|null} Headers de autenticación o null si no requiere autenticación
   */
  getAuthHeaders(url) {
    // Ahora manejado por Netlify Functions - no necesitamos headers aquí
    return null;
  }

  /**
   * Verifica si una URL requiere autenticación
   * @param {string} url - La URL a verificar
   * @returns {boolean} True si requiere autenticación
   */
  requiresAuthentication(url) {
    // Detectar APIs protegidas basándose en patrones de URL
    if (!url) return false;
    const urlLower = url.toLowerCase();
    return urlLower.includes('sheet.best') || urlLower.includes('sheetbest.com');
  }

  /**
   * Agrega un método de autenticación personalizado
   * @param {string} pattern - Patrón de hostname
   * @param {Function} authMethod - Función que crea headers de autenticación
   */
  addAuthMethod(pattern, authMethod) {
    this.authMethods[pattern] = authMethod;
  }

  /**
   * Obtiene información de autenticación para debugging
   * @param {string} url - La URL a analizar
   * @returns {Object} Información de autenticación
   */
  getAuthInfo(url) {
    const requiresAuth = this.requiresAuthentication(url);
    
    return {
      url,
      requiresAuthentication: requiresAuth,
      hasApiKey: requiresAuth, // Ahora manejado por Netlify Functions
      configuredPatterns: ['sheet.best', 'sheetbest.com'],
      authMethod: requiresAuth ? this.getAuthMethodName(url) : null
    };
  }

  /**
   * Obtiene el nombre del método de autenticación para una URL
   * @param {string} url - La URL
   * @returns {string} Nombre del método de autenticación
   */
  getAuthMethodName(url) {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname;
      
      for (const [pattern, method] of Object.entries(this.authMethods)) {
        if (hostname.includes(pattern)) {
          return pattern;
        }
      }
      
      return 'default';
    } catch (error) {
      return 'unknown';
    }
  }

  /**
   * Valida si una API Key es válida (formato básico)
   * @param {string} apiKey - La API Key a validar
   * @returns {boolean} True si el formato parece válido
   */
  validateApiKeyFormat(apiKey) {
    if (!apiKey || typeof apiKey !== 'string') {
      return false;
    }
    
    // Validación básica: debe tener al menos 10 caracteres
    return apiKey.trim().length >= 10;
  }

  /**
   * Maneja errores de autenticación
   * @param {Response} response - Respuesta del fetch
   * @param {string} url - URL que causó el error
   * @returns {Error} Error con información específica de autenticación
   */
  handleAuthError(response, url) {
    let errorMessage = 'Error de autenticación';
    
    switch (response.status) {
      case 401:
        errorMessage = 'API Key inválida o expirada. Verifica tu configuración.';
        break;
      case 403:
        errorMessage = 'Acceso denegado. Verifica que tu API Key tenga los permisos necesarios.';
        break;
      case 429:
        errorMessage = 'Límite de requests excedido. Intenta más tarde.';
        break;
      default:
        errorMessage = `Error de autenticación: ${response.status} ${response.statusText}`;
    }

    const error = new Error(errorMessage);
    error.status = response.status;
    error.url = url;
    error.isAuthError = true;
    
    return error;
  }
}

export { XDiagramsAuthManager };
