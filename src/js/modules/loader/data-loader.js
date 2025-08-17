/**
 * XDiagrams Data Loader Module
 * Maneja la carga de datos desde diferentes fuentes
 */

import { XDiagramsSourceDetector } from './source-detector.js';
import { XDiagramsAuthManager } from './auth-manager.js';

class XDiagramsDataLoader {
  constructor() {
    this.sourceDetector = new XDiagramsSourceDetector();
    this.authManager = new XDiagramsAuthManager();
  }

  /**
   * Carga datos desde Google Sheets
   * @param {string} url - URL del Google Sheet
   * @param {Object} options - Opciones de carga
   * @returns {Promise<Array>} Datos cargados
   */
  async loadFromGoogleSheets(url, options = {}) {
    try {
      const csvUrl = this.sourceDetector.convertGoogleSheetsToCsv(url);
      // Attempting to load from Google Sheets
      
      const timeout = options.timeout || 10000;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await fetch(csvUrl, {
        signal: controller.signal,
        mode: 'cors'
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
      }
      
      const csvText = await response.text();
      
      if (!csvText || csvText.trim() === '') {
        throw new Error('El archivo de Google Sheets está vacío o no contiene datos válidos');
      }
      
      // Successfully loaded Google Sheets data
      return this.parseCsv(csvText, options);
      
    } catch (error) {
      console.error('Error loading from Google Sheets:', error);
      
      if (error.name === 'AbortError') {
        throw new Error(`Timeout: No se pudo cargar el archivo de Google Sheets después de ${timeout}ms. Verifica la URL y tu conexión a internet.`);
      }
      
      if (error.message.includes('Failed to fetch') || error.message.includes('ERR_CONNECTION_CLOSED')) {
        throw new Error('Error de conexión: No se pudo conectar con Google Sheets. Verifica tu conexión a internet y que la URL sea correcta.');
      }
      
      if (error.message.includes('CORS')) {
        throw new Error('Error de CORS: El archivo de Google Sheets no permite acceso desde este dominio. Verifica la configuración de permisos.');
      }
      
      throw new Error(`Error cargando Google Sheets: ${error.message}`);
    }
  }

  /**
   * Carga datos desde una API REST
   * @param {string} url - URL de la API
   * @param {Object} options - Opciones de carga
   * @returns {Promise<Array>} Datos cargados
   */
  async loadFromRestApi(url, options = {}) {
    const authHeaders = this.authManager.getAuthHeaders(url);
    const fetchOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      }
    };

    const response = await fetch(url, fetchOptions);
    
    if (!response.ok) {
      // Manejar errores de autenticación específicamente
      if (response.status === 401 || response.status === 403) {
        throw this.authManager.handleAuthError(response, url);
      }
      throw new Error(`Error HTTP: ${response.status}`);
    }
    
    const jsonData = await response.json();
    return this.convertJsonToCsvFormat(jsonData, options);
  }

  /**
   * Carga datos desde una URL CSV
   * @param {string} url - URL del archivo CSV
   * @param {Object} options - Opciones de carga
   * @returns {Promise<Array>} Datos cargados
   */
  async loadFromCsvUrl(url, options = {}) {
    const authHeaders = this.authManager.getAuthHeaders(url);
    const fetchOptions = {
      headers: {
        'Content-Type': 'text/csv',
        ...authHeaders
      }
    };

    const response = await fetch(url, fetchOptions);
    
    if (!response.ok) {
      // Manejar errores de autenticación específicamente
      if (response.status === 401 || response.status === 403) {
        throw this.authManager.handleAuthError(response, url);
      }
      throw new Error(`Error HTTP: ${response.status}`);
    }
    
    const csvText = await response.text();
    return this.parseCsv(csvText, options);
  }

  /**
   * Carga datos desde una URL JSON
   * @param {string} url - URL del archivo JSON
   * @param {Object} options - Opciones de carga
   * @returns {Promise<Array>} Datos cargados
   */
  async loadFromJsonUrl(url, options = {}) {
    const authHeaders = this.authManager.getAuthHeaders(url);
    const fetchOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      }
    };

    const response = await fetch(url, fetchOptions);
    
    if (!response.ok) {
      // Manejar errores de autenticación específicamente
      if (response.status === 401 || response.status === 403) {
        throw this.authManager.handleAuthError(response, url);
      }
      throw new Error(`Error HTTP: ${response.status}`);
    }
    
    const jsonData = await response.json();
    return this.convertJsonToCsvFormat(jsonData, options);
  }

  /**
   * Carga datos desde una API protegida (como SheetBest)
   * @param {string} url - URL de la API protegida
   * @param {Object} options - Opciones de carga
   * @returns {Promise<Array>} Datos cargados
   */
  async loadFromProtectedApi(url, options = {}) {
    try {
      console.log(`🔐 [DataLoader] Cargando desde API protegida via Netlify Function: ${url}`);
      
      // Usar Netlify Function como proxy
      const proxyUrl = `/api/sheetbest-proxy?url=${encodeURIComponent(url)}`;
      console.log(`🌐 [DataLoader] Proxy URL: ${proxyUrl}`);
      
      const response = await fetch(proxyUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`📡 [DataLoader] Response status: ${response.status}`);
      console.log(`📡 [DataLoader] Response headers:`, Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error HTTP: ${response.status}`);
      }

      const data = await response.json();
      console.log(`✅ [DataLoader] Datos cargados exitosamente desde proxy`);
      
      // Convertir a formato CSV si es necesario
      if (Array.isArray(data)) {
        return data;
      } else {
        return this.convertJsonToCsvFormat(data, options);
      }
      
    } catch (error) {
      console.error(`❌ [DataLoader] Error cargando desde API protegida:`, error);
      throw new Error(`Error cargando API protegida: ${error.message}`);
    }
  }

  /**
   * Carga datos desde un objeto
   * @param {Object} dataObject - Objeto con datos
   * @returns {Array} Datos extraídos
   */
  loadFromObject(dataObject) {
    if (Array.isArray(dataObject)) {
      return dataObject;
    }
    
    if (dataObject.data) {
      return Array.isArray(dataObject.data) ? dataObject.data : [dataObject.data];
    }
    
    if (dataObject.records) {
      return Array.isArray(dataObject.records) ? dataObject.records : [dataObject.records];
    }
    
    return [dataObject];
  }

  /**
   * Carga datos desde múltiples URLs
   * @param {Object} config - Configuración con URLs
   * @param {Object} options - Opciones de carga
   * @returns {Promise<Array>} Datos combinados
   */
  async loadFromMultipleUrls(config, options = {}) {
    const urls = Array.isArray(config) ? config : config.urls;
    const combineStrategy = config.combineStrategy || 'append';
    
    let allData = [];
    
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      
      try {
        const data = await this.loadData(url, (data) => data, options);
        
        if (data && Array.isArray(data)) {
          const enrichedData = data.map(item => ({
            ...item,
            _source: url,
            _sourceIndex: i
          }));
          
          if (combineStrategy === 'merge') {
            allData = this.mergeData(allData, enrichedData);
          } else {
            allData = allData.concat(enrichedData);
          }
        }
        
      } catch (error) {
        console.warn(`Error cargando URL ${url}:`, error);
      }
    }
    
    return allData;
  }

  /**
   * Combina datos existentes con nuevos datos
   * @param {Array} existingData - Datos existentes
   * @param {Array} newData - Nuevos datos
   * @returns {Array} Datos combinados
   */
  mergeData(existingData, newData) {
    const merged = [...existingData];
    
    newData.forEach(newItem => {
      const existingIndex = merged.findIndex(existing => 
        existing.id === newItem.id || 
        existing.ID === newItem.ID || 
        existing.node === newItem.node || 
        existing.Node === newItem.Node
      );
      
      if (existingIndex >= 0) {
        merged[existingIndex] = { ...merged[existingIndex], ...newItem };
      } else {
        merged.push(newItem);
      }
    });
    
    return merged;
  }

  /**
   * Parsea texto CSV a array de objetos
   * @param {string} csvText - Texto CSV
   * @param {Object} options - Opciones de parsing
   * @returns {Promise<Array>} Datos parseados
   */
  parseCsv(csvText, options = {}) {
    return new Promise((resolve, reject) => {
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
   * Convierte datos JSON al formato CSV esperado
   * @param {*} jsonData - Datos JSON
   * @param {Object} options - Opciones de conversión
   * @returns {Array} Datos en formato CSV
   */
  convertJsonToCsvFormat(jsonData, options = {}) {
    // Si ya es un array, devolver tal como está
    if (Array.isArray(jsonData)) {
      return jsonData;
    }
    
    // Si tiene propiedad data que es array
    if (jsonData.data && Array.isArray(jsonData.data)) {
      return jsonData.data;
    }
    
    // Si tiene propiedad records que es array
    if (jsonData.records && Array.isArray(jsonData.records)) {
      return jsonData.records;
    }
    
    // Si tiene propiedad items que es array
    if (jsonData.items && Array.isArray(jsonData.items)) {
      return jsonData.items;
    }
    
    // Si es un objeto simple, convertirlo a array
    if (typeof jsonData === 'object' && jsonData !== null) {
      return [jsonData];
    }
    
    // Si es un string, intentar parsearlo como JSON
    if (typeof jsonData === 'string') {
      try {
        const parsed = JSON.parse(jsonData);
        return this.convertJsonToCsvFormat(parsed, options);
      } catch (error) {
        throw new Error('Datos JSON inválidos');
      }
    }
    
    throw new Error('Formato de datos no reconocido');
  }

  /**
   * Carga datos desde cualquier fuente
   * @param {*} source - Fuente de datos
   * @param {Function} onComplete - Callback de completado
   * @param {Object} options - Opciones de carga
   */
  async loadData(source, onComplete, options = {}) {
    let sourceType;
    
    try {
      // Starting data load from source
      
      sourceType = this.sourceDetector.detectSourceType(source);
      // Detected source type
      
      let data;
      
      switch (sourceType) {
        case 'protected-api':
          data = await this.loadFromProtectedApi(source, options);
          break;
        case 'google-sheets':
          data = await this.loadFromGoogleSheets(source, options);
          break;
        case 'rest-api':
          data = await this.loadFromRestApi(source, options);
          break;
        case 'csv-url':
          data = await this.loadFromCsvUrl(source, options);
          break;
        case 'json-url':
          data = await this.loadFromJsonUrl(source, options);
          break;
        case 'object':
          data = this.loadFromObject(source);
          break;
        case 'multiple-urls':
          data = await this.loadFromMultipleUrls(source, options);
          break;
        case 'unknown':
          throw new Error(`No se pudo determinar el tipo de fuente. URL o formato no reconocido: ${source}`);
        default:
          throw new Error(`Tipo de fuente no soportado: ${sourceType}`);
      }
      
      // Data load completed successfully
      onComplete(data);
      
    } catch (error) {
      console.error('Error cargando datos:', error);
      
      let errorMessage = error.message;
      
      if (error.isAuthError) {
        errorMessage = `Error de autenticación: ${error.message}\n\nSugerencias:\n- Verifica que tu API Key esté configurada correctamente\n- Asegúrate de que la API Key tenga los permisos necesarios\n- Verifica que la URL sea correcta\n- Revisa la documentación de la API para más detalles`;
      } else if (sourceType === 'protected-api') {
        errorMessage = `Error cargando API protegida: ${error.message}\n\nSugerencias:\n- Verifica que tu API Key esté configurada\n- Asegúrate de que la URL sea correcta\n- Verifica los permisos de tu API Key\n- Revisa la documentación de la API`;
      } else if (sourceType === 'google-sheets') {
        errorMessage = `Error cargando Google Sheets: ${error.message}\n\nSugerencias:\n- Verifica que la URL sea correcta\n- Asegúrate de que el archivo esté publicado públicamente\n- Verifica tu conexión a internet\n- Intenta usar un archivo CSV local como alternativa`;
      } else if (sourceType === 'csv-url') {
        errorMessage = `Error cargando archivo CSV: ${error.message}\n\nSugerencias:\n- Verifica que la URL sea correcta\n- Asegúrate de que el archivo sea accesible\n- Verifica tu conexión a internet`;
      }
      
      const enhancedError = new Error(errorMessage);
      enhancedError.originalError = error;
      enhancedError.sourceType = sourceType;
      enhancedError.source = source;
      
      onComplete(null, enhancedError);
    }
  }
}

export { XDiagramsDataLoader }; 