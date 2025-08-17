/**
 * XDiagrams Loader Module - Coordinador Principal
 * Coordina la carga de datos desde múltiples fuentes
 */

import { XDiagramsDataLoader } from './data-loader.js';
import { XDiagramsCache } from './cache.js';
import { XDiagramsAuthManager } from './auth-manager.js';

class XDiagramsLoader {
  constructor() {
    this.dataLoader = new XDiagramsDataLoader();
    this.cache = new XDiagramsCache();
    this.authManager = new XDiagramsAuthManager();
  }

  /**
   * Carga datos desde cualquier fuente
   * @param {*} source - Fuente de datos
   * @param {Function} onComplete - Callback de completado
   * @param {Object} options - Opciones de carga
   */
  async loadData(source, onComplete, options = {}) {
    this.cache.startLoading(source);
    
    try {
      // Verificar cache para URLs
      const cachedData = this.cache.get(source);
      if (cachedData) {
        this.cache.stopLoading();
        onComplete(cachedData);
        return;
      }
      
      // Cargar datos usando el data loader
      await this.dataLoader.loadData(source, (data, error) => {
        this.cache.stopLoading();
        
        if (error) {
          onComplete(null, error);
          return;
        }
        
        // Guardar en cache si es una URL
        this.cache.set(source, data);
        onComplete(data);
      }, options);
      
    } catch (error) {
      this.cache.stopLoading();
      onComplete(null, error);
    }
  }

  /**
   * Limpia el cache
   * @param {string} url - URL específica a limpiar (opcional)
   */
  clearCache(url) {
    this.cache.clear(url);
  }

  /**
   * Obtiene el estado de carga actual
   * @returns {Object} Estado de carga
   */
  getLoadingState() {
    return this.cache.getLoadingState();
  }

  // Acceso directo a los submódulos para casos específicos
  get dataLoaderInstance() {
    return this.dataLoader;
  }

  get cacheInstance() {
    return this.cache;
  }

  get authManagerInstance() {
    return this.authManager;
  }
}

export { XDiagramsLoader }; 