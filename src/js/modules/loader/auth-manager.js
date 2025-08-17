/**
 * XDiagrams Authentication Manager Module
 * Coordina la carga de datos entre fuentes públicas y protegidas
 */

import { XDiagramsNetlifyClient } from './netlify-client.js';
import { XDiagramsApiConfig } from './api-config.js';

class XDiagramsAuthManager {
  constructor() {
    this.netlifyClient = new XDiagramsNetlifyClient();
    this.apiConfig = new XDiagramsApiConfig();
  }

  /**
   * Carga datos desde cualquier fuente, manejando autenticación automáticamente
   * @param {string} url - URL de la fuente de datos
   * @param {Object} options - Opciones de carga
   * @returns {Promise<Array>} Datos cargados
   */
  async loadData(url, options = {}) {
    try {
      // Verificar si la URL requiere autenticación
      if (this.apiConfig.requiresAuthentication(url)) {
        console.log('Detectada URL protegida, usando Netlify Client');
        return await this.loadProtectedData(url, options);
      } else {
        console.log('URL pública detectada, usando fetch directo');
        return await this.loadPublicData(url, options);
      }
    } catch (error) {
      console.error('Error en Auth Manager:', error);
      throw error;
    }
  }

  /**
   * Carga datos desde una fuente protegida usando Netlify Functions
   * @param {string} url - URL de la API protegida
   * @param {Object} options - Opciones de carga
   * @returns {Promise<Array>} Datos cargados
   */
  async loadProtectedData(url, options = {}) {
    try {
      const data = await this.netlifyClient.fetchProtectedData(url, options);
      
      // Si los datos vienen como JSON, convertirlos al formato esperado
      if (typeof data === 'string') {
        try {
          return JSON.parse(data);
        } catch (parseError) {
          throw new Error('Error parseando respuesta JSON de la API protegida');
        }
      }
      
      return data;
      
    } catch (error) {
      console.error('Error cargando datos protegidos:', error);
      
      // Mejorar mensajes de error específicos para APIs protegidas
      if (error.message.includes('autenticación')) {
        throw new Error(`Error de autenticación en ${url}: ${error.message}`);
      }
      
      throw new Error(`Error cargando datos protegidos de ${url}: ${error.message}`);
    }
  }

  /**
   * Carga datos desde una fuente pública usando fetch directo
   * @param {string} url - URL de la fuente pública
   * @param {Object} options - Opciones de carga
   * @returns {Promise<Array>} Datos cargados
   */
  async loadPublicData(url, options = {}) {
    try {
      const timeout = options.timeout || 10000;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await fetch(url, {
        signal: controller.signal,
        mode: 'cors',
        ...options
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
      }
      
      // Determinar el tipo de contenido
      const contentType = response.headers.get('content-type') || '';
      
      if (contentType.includes('application/json')) {
        return await response.json();
      } else if (contentType.includes('text/csv') || url.includes('.csv')) {
        const csvText = await response.text();
        return this.parseCsv(csvText, options);
      } else {
        // Intentar como JSON por defecto
        return await response.json();
      }
      
    } catch (error) {
      console.error('Error cargando datos públicos:', error);
      
      if (error.name === 'AbortError') {
        throw new Error(`Timeout: No se pudo cargar la URL después de ${options.timeout || 10000}ms`);
      }
      
      throw new Error(`Error cargando datos públicos de ${url}: ${error.message}`);
    }
  }

  /**
   * Parsea texto CSV a array de objetos (reutilizado del data-loader)
   * @param {string} csvText - Texto CSV
   * @param {Object} options - Opciones de parsing
   * @returns {Promise<Array>} Datos parseados
   */
  parseCsv(csvText, options = {}) {
    return new Promise((resolve, reject) => {
      if (typeof Papa === 'undefined') {
        reject(new Error('Papa Parse no está disponible'));
        return;
      }
      
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        ...options,
        complete: (results) => {
          if (results.errors.length > 0) {
            console.warn('Errores en parsing CSV:', results.errors);
          }
          resolve(results.data);
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  }

  /**
   * Verifica si una URL requiere autenticación
   * @param {string} url - URL a verificar
   * @returns {boolean} True si requiere autenticación
   */
  requiresAuthentication(url) {
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

export { XDiagramsAuthManager };
