/**
 * XDiagrams Source Detector Module
 * Detecta el tipo de fuente de datos
 */

class XDiagramsSourceDetector {
  constructor() {
    // Configuración para detección de fuentes
    this.sourcePatterns = {
      googleSheets: [
        'google.com/spreadsheets',
        'docs.google.com'
      ],
      restApi: [
        'api.',
        '/api/'
      ],
      csvUrl: [
        '.csv',
        'output=csv'
      ],
      jsonUrl: [
        '.json'
      ]
    };
  }

  /**
   * Detecta el tipo de fuente de datos
   * @param {string|Array|Object} source - La fuente de datos
   * @returns {string} El tipo de fuente detectado
   */
  detectSourceType(source) {
    if (typeof source === 'string') {
      return this.detectStringSource(source);
    }
    
    if (Array.isArray(source)) {
      return 'multiple-urls';
    }
    
    if (typeof source === 'object' && source !== null) {
      return this.detectObjectSource(source);
    }
    
    return 'unknown';
  }

  /**
   * Detecta el tipo de fuente cuando es un string (URL)
   * @param {string} source - La URL o string fuente
   * @returns {string} El tipo de fuente detectado
   */
  detectStringSource(source) {
    const url = source.toLowerCase();
    
    // Detectar Google Sheets
    if (this.sourcePatterns.googleSheets.some(pattern => url.includes(pattern))) {
      return 'google-sheets';
    }
    
    // Detectar JSON URL (más específico, debe ir antes que REST API)
    if (url.endsWith('.json') || url.includes('.json?')) {
      return 'json-url';
    }
    
    // Detectar CSV URL
    if (this.sourcePatterns.csvUrl.some(pattern => url.includes(pattern))) {
      return 'csv-url';
    }
    
    // Detectar REST API (más genérico, debe ir después)
    if (this.sourcePatterns.restApi.some(pattern => url.includes(pattern))) {
      return 'rest-api';
    }
    
    return 'unknown';
  }

  /**
   * Detecta el tipo de fuente cuando es un objeto
   * @param {Object} source - El objeto fuente
   * @returns {string} El tipo de fuente detectado
   */
  detectObjectSource(source) {
    // Si tiene URLs múltiples
    if (source.urls && Array.isArray(source.urls)) {
      return 'multiple-urls';
    }
    
    // Si tiene datos o records
    if (source.data || source.records) {
      return 'object';
    }
    
    return 'unknown';
  }

  /**
   * Valida si una URL es válida
   * @param {string} url - La URL a validar
   * @returns {boolean} True si la URL es válida
   */
  isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Normaliza una URL de Google Sheets para CSV
   * @param {string} url - La URL original de Google Sheets
   * @returns {string} La URL convertida para CSV
   */
  convertGoogleSheetsToCsv(url) {
    // Si ya incluye output=csv, devolver tal como está
    if (url.includes('output=csv')) {
      return url;
    }
    
    // Si incluye /edit, reemplazar con /pub?output=csv
    if (url.includes('/edit')) {
      return url.replace('/edit', '/pub?output=csv');
    }
    
    // Si ya incluye /pub, agregar output=csv
    if (url.includes('/pub')) {
      // Si ya tiene parámetros, agregar &output=csv
      if (url.includes('?')) {
        return `${url}&output=csv`;
      }
      // Si no tiene parámetros, agregar ?output=csv
      return `${url}?output=csv`;
    }
    
    // Caso por defecto: agregar ?output=csv
    return `${url}?output=csv`;
  }
}

export { XDiagramsSourceDetector }; 