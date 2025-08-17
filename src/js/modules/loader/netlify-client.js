/**
 * XDiagrams Netlify Client Module
 * Maneja las peticiones a Netlify Functions para APIs protegidas
 */

import { XDiagramsApiConfig } from './api-config.js';

class XDiagramsNetlifyClient {
  constructor() {
    this.apiConfig = new XDiagramsApiConfig();
  }

  /**
   * Hace una petición a la Netlify Function para obtener datos protegidos
   * @param {string} url - URL de la API protegida
   * @param {Object} options - Opciones de la petición
   * @returns {Promise<Array>} Datos obtenidos
   */
  async fetchProtectedData(url, options = {}) {
    try {
      const functionUrl = this.apiConfig.getFunctionUrl();
      
      console.log(`Haciendo petición a función: ${functionUrl}`);
      console.log(`URL protegida: ${url}`);
      
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: url,
          options: options
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error en función: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      
      if (result.error) {
        throw new Error(`Error en API protegida: ${result.error}`);
      }

      return result.data || result;

    } catch (error) {
      console.error('Error en Netlify Client:', error);
      
      // Mejorar mensajes de error específicos
      if (error.message.includes('Failed to fetch')) {
        throw new Error('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
      }
      
      if (error.message.includes('401') || error.message.includes('403')) {
        throw new Error('Error de autenticación: API key inválida o expirada.');
      }
      
      if (error.message.includes('404')) {
        throw new Error('URL no encontrada. Verifica que la URL de la API sea correcta.');
      }
      
      throw new Error(`Error obteniendo datos protegidos: ${error.message}`);
    }
  }

  /**
   * Verifica si una URL requiere usar el cliente de Netlify
   * @param {string} url - URL a verificar
   * @returns {boolean} True si requiere usar Netlify Client
   */
  shouldUseNetlifyClient(url) {
    return this.apiConfig.requiresAuthentication(url);
  }

  /**
   * Obtiene información de configuración
   * @returns {Object} Configuración actual
   */
  getConfig() {
    return this.apiConfig.getConfig();
  }
}

export { XDiagramsNetlifyClient };
