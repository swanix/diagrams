/**
 * XDiagrams Filter Logic Module
 * Lógica de filtrado de datos
 */

class XDiagramsFilterLogic {
  constructor(filters) {
    this.filters = filters;
    this.core = filters.core;
  }

  /**
   * Aplica todos los filtros activos a los datos
   * @param {Array} data - Datos originales
   * @param {Object} activeFilters - Filtros activos
   * @returns {Array} Datos filtrados
   */
  applyFilters(data, activeFilters) {
    if (!data || data.length === 0) return data;
    if (!activeFilters || Object.keys(activeFilters).length === 0) return data;

    return data.filter(row => {
      return Object.entries(activeFilters).every(([column, filterValue]) => {
        return this.applySingleFilter(row, column, filterValue);
      });
    });
  }

  /**
   * Aplica un filtro individual a una fila
   * @param {Object} row - Fila de datos
   * @param {string} column - Nombre de la columna
   * @param {*} filterValue - Valor del filtro
   * @returns {boolean} True si la fila pasa el filtro
   */
  applySingleFilter(row, column, filterValue) {
    const cellValue = this.getCellValue(row, column);
    
    // Logging temporal para debug
    console.log(`XDiagrams: DEBUG - applySingleFilter - Columna: '${column}', Valor celda: '${cellValue}', Filtro: '${filterValue}'`);
    
    // Si el filtro es para valores vacíos, permitir valores nulos
    if (filterValue === '__empty__') {
      const result = !cellValue || cellValue === '' || cellValue === null || cellValue === undefined;
      console.log(`XDiagrams: DEBUG - Filtro vacío -> ${result}`);
      return result;
    }
    
    // Para otros filtros, si el valor es nulo, solo rechazar si no es un filtro de "sin valor"
    if (cellValue === null || cellValue === undefined) {
      console.log(`XDiagrams: DEBUG - Valor nulo encontrado para '${column}'`);
      // Si el filtro es específicamente para valores vacíos, permitirlo
      if (filterValue === '__empty__') {
        console.log(`XDiagrams: DEBUG - Permitiendo valor nulo para filtro de valores vacíos`);
        return true;
      }
      // Para otros casos, rechazar valores nulos
      console.log(`XDiagrams: DEBUG - Valor nulo rechazado`);
      return false;
    }

    // Obtener configuración del filtro
    const filterConfig = this.filters.manager.getFilterConfig(column);
    if (!filterConfig) {
      return this.applyDefaultFilter(cellValue, filterValue);
    }

    // Aplicar filtro según tipo
    switch (filterConfig.type) {
      case 'select':
        return this.applySelectFilter(cellValue, filterValue);
      
      case 'search':
        return this.applySearchFilter(cellValue, filterValue);
      
      case 'range':
        return this.applyRangeFilter(cellValue, filterValue);
      
      case 'multi-select':
        return this.applyMultiSelectFilter(cellValue, filterValue);
      
      default:
        return this.applyDefaultFilter(cellValue, filterValue);
    }
  }

  /**
   * Obtiene el valor de una celda, manejando diferentes formatos de columna
   * Usa la misma lógica que hierarchy-builder.js para consistencia
   * @param {Object} row - Fila de datos
   * @param {string} column - Nombre de la columna
   * @returns {*} Valor de la celda
   */
  getCellValue(row, column) {
    // Logging temporal para debug
    if (column === 'Type' || column === 'Position' || column === 'Department' || column === 'Description') {
      console.log(`XDiagrams: DEBUG - getCellValue - Buscando '${column}' en:`, Object.keys(row));
      console.log(`XDiagrams: DEBUG - getCellValue - Datos completos:`, row);
      console.log(`XDiagrams: DEBUG - getCellValue - Todas las claves disponibles:`, Object.keys(row).map(k => `'${k}'`).join(', '));
      
      // Verificar si la columna existe exactamente
      if (row[column] !== undefined) {
        console.log(`XDiagrams: DEBUG - getCellValue - Encontrado exacto '${column}':`, row[column]);
      } else {
        console.log(`XDiagrams: DEBUG - getCellValue - NO encontrado exacto '${column}'`);
      }
    }
    
    if (!row || typeof row !== 'object') {
      console.log(`XDiagrams: DEBUG - getCellValue - row no es un objeto válido:`, row);
      return null;
    }
    
    // Usar la misma lógica que hierarchy-builder.js
    const possibleNames = this.getPossibleColumnNames(column);
    const value = this.getColumnValue(row, possibleNames, null);
    
    if (column === 'Type' || column === 'Position' || column === 'Department' || column === 'Description') {
      console.log(`XDiagrams: DEBUG - getCellValue - Posibles nombres para '${column}':`, possibleNames);
      console.log(`XDiagrams: DEBUG - getCellValue - Valor encontrado:`, value);
    }
    
    return value;
  }

  /**
   * Obtiene los posibles nombres de columna (misma lógica que hierarchy-builder.js)
   * @param {string} column - Nombre de la columna
   * @returns {Array} Array de posibles nombres
   */
  getPossibleColumnNames(column) {
    // Para cada columna, definir las posibles variaciones de nombre
    const columnVariations = {
      'Type': ['Type', 'type', 'Category', 'category'],
      'Position': ['Position', 'position', 'Role', 'role', 'Job', 'job'],
      'Department': ['Department', 'department', 'Dept', 'dept'],
      'Description': ['Description', 'description', 'Desc', 'desc'],
      'Name': ['Name', 'name', 'Title', 'title'],
      'Node': ['Node', 'node', 'ID', 'id'],
      'Parent': ['Parent', 'parent', 'Manager', 'manager', 'Leader', 'leader'],
      'Img': ['Img', 'img', 'Icon', 'icon', 'Image', 'image'],
      'Layout': ['Layout', 'layout'],
      'Technology': ['Technology', 'technology', 'Tech', 'tech'],
      'Country': ['Country', 'country', 'Nation', 'nation'],
      'Responsive': ['Responsive', 'responsive', 'Mobile', 'mobile'],
      'Status': ['Status', 'status', 'State', 'state'],
      'Level': ['Level', 'level', 'Grade', 'grade'],
      'Category': ['Category', 'category', 'Cat', 'cat'],
      'Company': ['Company', 'company', 'Organization', 'organization'],
      'Location': ['Location', 'location', 'Place', 'place'],
      'Date': ['Date', 'date', 'Created', 'created'],
      'Price': ['Price', 'price', 'Cost', 'cost'],
      'Size': ['Size', 'size', 'Dimension', 'dimension'],
      'Color': ['Color', 'color', 'Colour', 'colour'],
      'Brand': ['Brand', 'brand', 'Make', 'make'],
      'Model': ['Model', 'model', 'Version', 'version']
    };

    // Si tenemos variaciones específicas, usarlas
    if (columnVariations[column]) {
      return columnVariations[column];
    }

    // Para columnas no definidas, generar variaciones dinámicamente
    const variations = [column];
    
    // Agregar variaciones comunes
    variations.push(column.toLowerCase());
    variations.push(column.toUpperCase());
    variations.push(column.charAt(0).toUpperCase() + column.slice(1).toLowerCase());
    
    // Agregar variaciones sin espacios ni guiones
    const noSpaces = column.replace(/[\s\-_]/g, '');
    if (noSpaces !== column) {
      variations.push(noSpaces);
      variations.push(noSpaces.toLowerCase());
      variations.push(noSpaces.charAt(0).toUpperCase() + noSpaces.slice(1).toLowerCase());
    }
    
    // Agregar variaciones con guiones bajos
    const withUnderscores = column.replace(/[\s\-]/g, '_');
    if (withUnderscores !== column) {
      variations.push(withUnderscores);
      variations.push(withUnderscores.toLowerCase());
    }
    
    // Agregar variaciones con guiones
    const withHyphens = column.replace(/[\s_]/g, '-');
    if (withHyphens !== column) {
      variations.push(withHyphens);
      variations.push(withHyphens.toLowerCase());
    }
    
    // Remover duplicados y devolver
    return [...new Set(variations)];
  }

  /**
   * Función helper para obtener valor de columna (misma lógica que hierarchy-builder.js)
   * @param {Object} row - Fila de datos
   * @param {Array} possibleNames - Posibles nombres de columna
   * @param {*} defaultValue - Valor por defecto
   * @returns {*} Valor encontrado o valor por defecto
   */
  getColumnValue(row, possibleNames, defaultValue = null) {
    for (const name of possibleNames) {
      if (row[name] !== undefined && row[name] !== null && row[name] !== "") {
        return row[name];
      }
    }
    return defaultValue;
  }

  /**
   * Aplica filtro de selección (select)
   * @param {*} cellValue - Valor de la celda
   * @param {*} filterValue - Valor del filtro
   * @returns {boolean} True si coincide
   */
  applySelectFilter(cellValue, filterValue) {
    // Manejar el caso especial de valores vacíos
    if (filterValue === '__empty__') {
      return !cellValue || cellValue === '' || cellValue === null || cellValue === undefined;
    }
    
    // Normalizar ambos valores: trim, lowercase, y manejar espacios
    const normalizedCellValue = String(cellValue || '').trim().toLowerCase();
    const normalizedFilterValue = String(filterValue || '').trim().toLowerCase();
    
    console.log(`XDiagrams: DEBUG - applySelectFilter - cellValue: '${cellValue}' -> normalized: '${normalizedCellValue}', filterValue: '${filterValue}' -> normalized: '${normalizedFilterValue}'`);
    
    return normalizedCellValue === normalizedFilterValue;
  }

  /**
   * Aplica filtro de búsqueda (search)
   * @param {*} cellValue - Valor de la celda
   * @param {string} filterValue - Texto de búsqueda
   * @returns {boolean} True si contiene el texto
   */
  applySearchFilter(cellValue, filterValue) {
    if (!filterValue || filterValue.length < 2) return true;
    
    const normalizedCellValue = String(cellValue || '').trim().toLowerCase();
    const normalizedFilterValue = String(filterValue || '').trim().toLowerCase();
    
    return normalizedCellValue.includes(normalizedFilterValue);
  }

  /**
   * Aplica filtro de rango (range)
   * @param {*} cellValue - Valor de la celda
   * @param {Object} filterValue - Objeto con min y max
   * @returns {boolean} True si está en el rango
   */
  applyRangeFilter(cellValue, filterValue) {
    const numericValue = parseFloat(cellValue);
    if (isNaN(numericValue)) return false;

    const { min, max } = filterValue;
    
    if (min !== null && min !== undefined && numericValue < min) return false;
    if (max !== null && max !== undefined && numericValue > max) return false;
    
    return true;
  }

  /**
   * Aplica filtro de selección múltiple (multi-select)
   * @param {*} cellValue - Valor de la celda
   * @param {Array} filterValue - Array de valores seleccionados
   * @returns {boolean} True si está en la lista
   */
  applyMultiSelectFilter(cellValue, filterValue) {
    if (!Array.isArray(filterValue) || filterValue.length === 0) return true;
    
    const normalizedCellValue = String(cellValue || '').trim().toLowerCase();
    return filterValue.some(value => {
      const normalizedValue = String(value || '').trim().toLowerCase();
      return normalizedValue === normalizedCellValue;
    });
  }

  /**
   * Aplica filtro por defecto (comparación simple)
   * @param {*} cellValue - Valor de la celda
   * @param {*} filterValue - Valor del filtro
   * @returns {boolean} True si coincide
   */
  applyDefaultFilter(cellValue, filterValue) {
    // Normalizar ambos valores: trim, lowercase, y manejar espacios
    const normalizedCellValue = String(cellValue || '').trim().toLowerCase();
    const normalizedFilterValue = String(filterValue || '').trim().toLowerCase();
    
    console.log(`XDiagrams: DEBUG - applyDefaultFilter - cellValue: '${cellValue}' -> normalized: '${normalizedCellValue}', filterValue: '${filterValue}' -> normalized: '${normalizedFilterValue}'`);
    
    return normalizedCellValue === normalizedFilterValue;
  }

  /**
   * Obtiene estadísticas de filtrado
   * @param {Array} originalData - Datos originales
   * @param {Array} filteredData - Datos filtrados
   * @param {Object} activeFilters - Filtros activos
   * @returns {Object} Estadísticas
   */
  getFilterStats(originalData, filteredData, activeFilters) {
    const totalCount = originalData ? originalData.length : 0;
    const filteredCount = filteredData ? filteredData.length : 0;
    const activeFilterCount = Object.keys(activeFilters).length;
    
    return {
      total: totalCount,
      filtered: filteredCount,
      hidden: totalCount - filteredCount,
      activeFilters: activeFilterCount,
      percentage: totalCount > 0 ? Math.round((filteredCount / totalCount) * 100) : 0
    };
  }

  /**
   * Obtiene valores únicos para una columna en los datos filtrados
   * @param {Array} data - Datos
   * @param {string} column - Nombre de la columna
   * @returns {Array} Valores únicos
   */
  getUniqueValues(data, column) {
    if (!data || data.length === 0) return [];
    
    const values = new Set();
    
    data.forEach(row => {
      const value = this.getCellValue(row, column);
      if (value !== null && value !== undefined && value !== '') {
        values.add(value);
      }
    });
    
    return Array.from(values).sort();
  }

  /**
   * Obtiene conteo de valores para una columna
   * @param {Array} data - Datos
   * @param {string} column - Nombre de la columna
   * @returns {Object} Conteo de valores
   */
  getValueCounts(data, column) {
    if (!data || data.length === 0) return {};
    
    const counts = {};
    
    data.forEach(row => {
      const value = this.getCellValue(row, column);
      if (value !== null && value !== undefined && value !== '') {
        const key = String(value);
        counts[key] = (counts[key] || 0) + 1;
      }
    });
    
    return counts;
  }

  /**
   * Verifica si un nodo específico coincide con los filtros activos
   * @param {Object} nodeData - Datos del nodo
   * @param {Object} activeFilters - Filtros activos
   * @returns {boolean} True si el nodo coincide con los filtros
   */
  checkNodeMatchesFilters(nodeData, activeFilters) {
    if (!activeFilters || Object.keys(activeFilters).length === 0) {
      return true; // Sin filtros activos, todos los nodos coinciden
    }

    // Logging temporal para debug
    console.log('XDiagrams: DEBUG - checkNodeMatchesFilters - nodeData:', nodeData);
    console.log('XDiagrams: DEBUG - checkNodeMatchesFilters - activeFilters:', activeFilters);

    const result = Object.entries(activeFilters).every(([column, filterValue]) => {
      const matches = this.applySingleFilter(nodeData, column, filterValue);
      console.log(`XDiagrams: DEBUG - Filtro '${column}' = '${filterValue}' -> ${matches}`);
      return matches;
    });

    console.log(`XDiagrams: DEBUG - Nodo ${result ? 'COINCIDE' : 'NO COINCIDE'} con todos los filtros`);
    return result;
  }
}

export { XDiagramsFilterLogic };
