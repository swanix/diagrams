/**
 * XDiagrams Cache Module
 * Maneja el cache de datos y estado de carga para optimizar las cargas
 */

class XDiagramsCache {
  constructor(options = {}) {
    this.config = {
      ttl: 3600000, // 1 hora por defecto
      maxSize: 10, // 10MB
      version: '1.0',
      disabled: options.disableCache || false // Nueva opción para desactivar caché
    };
    
    // Estado de carga
    this.isLoading = false;
    this.currentUrl = null;
  }

  getCacheKey(url) {
    let hash = 0;
    for (let i = 0; i < url.length; i++) {
      const char = url.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return `xdiagrams_cache_${Math.abs(hash)}`;
  }

  shouldCache(url) {
    // Si la caché está desactivada, no cachear nada
    if (this.config.disabled) {
      return false;
    }
    
    try {
      const parsed = new URL(url, window.location.href);
      if (parsed.origin === window.location.origin) return false;
      return url.includes('api.') || url.includes('.json') || url.includes('/api/');
    } catch {
      return false;
    }
  }

  get(url) {
    if (!this.shouldCache(url)) return null;
    
    try {
      const key = this.getCacheKey(url);
      const cached = localStorage.getItem(key);
      if (!cached) return null;

      const data = JSON.parse(cached);
      
      if (data.expires && Date.now() > data.expires) {
        localStorage.removeItem(key);
        return null;
      }

      if (data.version !== this.config.version) {
        localStorage.removeItem(key);
        return null;
      }

      return data.data;
    } catch (error) {
      console.warn('Error reading cache:', error);
      return null;
    }
  }

  set(url, data) {
    if (!this.shouldCache(url)) return;
    
    try {
      const key = this.getCacheKey(url);
      const cacheData = {
        data: data,
        timestamp: Date.now(),
        expires: Date.now() + this.config.ttl,
        version: this.config.version,
        url: url
      };
      
      localStorage.setItem(key, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Error saving to cache:', error);
    }
  }

  clear(url) {
    try {
      const key = this.getCacheKey(url);
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Error clearing cache:', error);
    }
  }

  clearAll() {
    try {
      const keys = Object.keys(localStorage);
      const cacheKeys = keys.filter(key => key.startsWith('xdiagrams_cache_'));
      cacheKeys.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.warn('Error clearing all cache:', error);
    }
  }

  // Métodos de gestión de estado de carga
  
  /**
   * Inicia el estado de carga
   * @param {string} url - URL que se está cargando
   */
  startLoading(url) {
    this.isLoading = true;
    this.currentUrl = typeof url === 'string' ? url : null;
  }

  /**
   * Finaliza el estado de carga
   */
  stopLoading() {
    this.isLoading = false;
  }

  /**
   * Obtiene el estado de carga actual
   * @returns {Object} Estado de carga
   */
  getLoadingState() {
    return {
      isLoading: this.isLoading,
      currentUrl: this.currentUrl
    };
  }
}

export { XDiagramsCache }; 