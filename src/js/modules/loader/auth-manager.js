/**
 * XDiagrams Authentication Manager
 * Maneja la autenticación para APIs protegidas
 */

import { apiKeysConfig } from './config/api-keys.js';

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
    if (!url) return null;

    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname;
      const apiKey = apiKeysConfig.getApiKey(url);

      if (!apiKey) {
        return null;
      }

      // Determinar el método de autenticación basado en el hostname
      let authMethod = 'default';
      
      for (const [pattern, method] of Object.entries(this.authMethods)) {
        if (hostname.includes(pattern)) {
          authMethod = method;
          break;
        }
      }

      // Crear headers usando el método apropiado
      if (typeof authMethod === 'function') {
        return authMethod.call(this, apiKey);
      } else {
        return this.authMethods.default.call(this, apiKey);
      }

    } catch (error) {
      console.warn('Error creating auth headers:', error);
      return null;
    }
  }

  /**
   * Verifica si una URL requiere autenticación
   * @param {string} url - La URL a verificar
   * @returns {boolean} True si requiere autenticación
   */
  requiresAuthentication(url) {
    return apiKeysConfig.requiresAuthentication(url);
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
    const hasApiKey = apiKeysConfig.getApiKey(url) !== null;
    
    return {
      url,
      requiresAuthentication: requiresAuth,
      hasApiKey,
      configuredPatterns: apiKeysConfig.getConfiguredPatterns(),
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
