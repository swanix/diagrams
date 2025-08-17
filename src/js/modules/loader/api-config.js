/**
 * XDiagrams API Configuration Module
 * Maneja la configuración de APIs protegidas y variables de entorno
 */

import { environment } from '../../config/environment.js';

class XDiagramsApiConfig {
  constructor() {
    // URLs que requieren autenticación
    this.protectedEndpoints = [
      'https://api.sheetbest.com/sheets/',
      'https://api.sheetbest.com/',
      // Agregar más APIs protegidas aquí según sea necesario
    ];

    // Configuración por entorno
    this.environment = environment.get('ENVIRONMENT', 'development');
    
    // URLs base para las funciones
    this.functionUrls = {
      local: environment.get('LOCAL_URL', 'http://localhost:8888'),
      netlify: environment.get('NETLIFY_URL', '/.netlify/functions')
    };
  }



  /**
   * Verifica si una URL requiere autenticación
   * @param {string} url - La URL a verificar
   * @returns {boolean} True si requiere autenticación
   */
  requiresAuthentication(url) {
    if (!url || typeof url !== 'string') {
      return false;
    }
    
    return this.protectedEndpoints.some(endpoint => 
      url.toLowerCase().includes(endpoint.toLowerCase())
    );
  }

  /**
   * Obtiene la URL de la función para hacer peticiones autenticadas
   * @returns {string} URL de la función
   */
  getFunctionUrl() {
    if (this.environment === 'development') {
      return `${this.functionUrls.local}/fetch-protected-data`;
    }
    
    return `${this.functionUrls.netlify}/fetch-protected-data`;
  }

  /**
   * Obtiene la configuración actual
   * @returns {Object} Configuración actual
   */
  getConfig() {
    return {
      environment: this.environment,
      functionUrl: this.getFunctionUrl(),
      protectedEndpoints: this.protectedEndpoints
    };
  }
}

export { XDiagramsApiConfig };
