/**
 * XDiagrams Filter Manager Module
 * Gestiona la configuración y detección automática de filtros
 */

class XDiagramsFilterManager {
  constructor(filters) {
    this.filters = filters;
    this.core = filters.core;
    this.autoFilters = {};
    this.customFilters = {};
  }

  /**
   * Configura filtros automáticos basados en columnas detectadas
   * @param {Object} columns - Columnas analizadas
   */
  setupAutoFilters(columns) {
    this.autoFilters = {};
    
    Object.entries(columns).forEach(([columnName, columnInfo]) => {
      if (!columnInfo.hasData) return;
      
      // Determinar configuración del filtro
      const filterConfig = this.createFilterConfig(columnName, columnInfo);
      
      if (filterConfig) {
        this.autoFilters[columnName] = filterConfig;
      }
    });
    
    // Ordenar filtros por prioridad
    this.autoFilters = this.sortFiltersByPriority(this.autoFilters);
  }

  /**
   * Configura filtros custom definidos por el usuario
   * @param {Object} customConfig - Configuración custom de filtros
   */
  setupCustomFilters(customConfig) {
    console.log('XDiagrams: Configurando filtros custom:', customConfig);
    this.customFilters = {};
    
    Object.entries(customConfig).forEach(([columnName, config]) => {
      console.log(`XDiagrams: Procesando filtro custom '${columnName}':`, config);
      
      // Obtener información de la columna desde los datos
      const columnInfo = this.getColumnInfoFromData(columnName);
      
      if (!columnInfo) {
        console.warn(`XDiagrams: No se encontraron datos para la columna '${columnName}' en filtros custom`);
        return;
      }
      
      // Crear configuración completa del filtro
      const filterConfig = this.createCustomFilterConfig(columnName, config, columnInfo);
      
      if (filterConfig) {
        this.customFilters[columnName] = filterConfig;
        console.log(`XDiagrams: Filtro custom '${columnName}' configurado:`, filterConfig);
      } else {
        console.warn(`XDiagrams: No se pudo crear configuración para filtro '${columnName}'`);
      }
    });
    
    // Ordenar filtros custom por prioridad
    this.customFilters = this.sortFiltersByPriority(this.customFilters);
    console.log('XDiagrams: Filtros custom finales:', this.customFilters);
  }

  /**
   * Crea configuración de filtro basada en información de columna
   * @param {string} columnName - Nombre de la columna
   * @param {Object} columnInfo - Información de la columna
   * @returns {Object|null} Configuración del filtro
   */
  createFilterConfig(columnName, columnInfo) {
    const baseConfig = {
      column: columnName,
      label: this.generateLabel(columnName),
      type: columnInfo.type,
      priority: this.calculatePriority(columnName, columnInfo)
    };

    switch (columnInfo.type) {
      case 'select':
        return {
          ...baseConfig,
          options: columnInfo.uniqueValues.map(value => ({
            value: value,
            label: value,
            count: columnInfo.values.filter(v => v === value).length
          }))
        };

      case 'search':
        return {
          ...baseConfig,
          placeholder: `Buscar en ${baseConfig.label.toLowerCase()}...`,
          minLength: 2
        };

      case 'range':
        const numericValues = columnInfo.values
          .map(v => parseFloat(v))
          .filter(v => !isNaN(v));
        
        if (numericValues.length === 0) return null;
        
        return {
          ...baseConfig,
          min: Math.min(...numericValues),
          max: Math.max(...numericValues),
          step: this.calculateStep(numericValues)
        };

      default:
        return null;
    }
  }

  /**
   * Genera etiqueta legible para el nombre de columna
   * @param {string} columnName - Nombre de la columna
   * @returns {string} Etiqueta legible
   */
  generateLabel(columnName) {
    // Mapeo de nombres comunes
    const labelMap = {
      'Name': 'Nombre',
      'name': 'Nombre',
      'Type': 'Tipo',
      'type': 'Tipo',
      'Department': 'Departamento',
      'department': 'Departamento',
      'Position': 'Cargo',
      'position': 'Cargo',
      'Description': 'Descripción',
      'description': 'Descripción',
      'Level': 'Nivel',
      'level': 'Nivel',
      'Status': 'Estado',
      'status': 'Estado',
      'Category': 'Categoría',
      'category': 'Categoría'
    };

    if (labelMap[columnName]) {
      return labelMap[columnName];
    }

    // Convertir camelCase o snake_case a título
    return columnName
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  /**
   * Calcula prioridad del filtro basada en el nombre y tipo
   * @param {string} columnName - Nombre de la columna
   * @param {Object} columnInfo - Información de la columna
   * @returns {number} Prioridad (menor número = mayor prioridad)
   */
  calculatePriority(columnName, columnInfo) {
    const priorityMap = {
      'Name': 1,
      'name': 1,
      'Type': 2,
      'type': 2,
      'Department': 3,
      'department': 3,
      'Position': 4,
      'position': 4,
      'Status': 5,
      'status': 5,
      'Level': 6,
      'level': 6
    };

    if (priorityMap[columnName]) {
      return priorityMap[columnName];
    }

    // Prioridad basada en tipo
    const typePriority = {
      'select': 10,
      'search': 20,
      'range': 30
    };

    return typePriority[columnInfo.type] || 50;
  }

  /**
   * Calcula el paso para filtros de rango
   * @param {Array} values - Valores numéricos
   * @returns {number} Paso calculado
   */
  calculateStep(values) {
    const range = Math.max(...values) - Math.min(...values);
    
    if (range <= 10) return 1;
    if (range <= 100) return 5;
    if (range <= 1000) return 10;
    return Math.ceil(range / 100);
  }

  /**
   * Ordena filtros por prioridad
   * @param {Object} filters - Filtros a ordenar
   * @returns {Object} Filtros ordenados
   */
  sortFiltersByPriority(filters) {
    const sortedEntries = Object.entries(filters)
      .sort(([, a], [, b]) => (a.priority || 999) - (b.priority || 999));
    
    return Object.fromEntries(sortedEntries);
  }

  /**
   * Obtiene todos los filtros configurados (auto + custom)
   * @returns {Object} Todos los filtros
   */
  getAllFilters() {
    return {
      ...this.autoFilters,
      ...this.customFilters
    };
  }

  /**
   * Obtiene filtros automáticos
   * @returns {Object} Filtros automáticos
   */
  getAutoFilters() {
    return { ...this.autoFilters };
  }

  /**
   * Obtiene filtros custom
   * @returns {Object} Filtros custom
   */
  getCustomFilters() {
    return { ...this.customFilters };
  }

  /**
   * Verifica si una columna tiene filtro configurado
   * @param {string} columnName - Nombre de la columna
   * @returns {boolean} True si tiene filtro
   */
  hasFilter(columnName) {
    return !!(this.autoFilters[columnName] || this.customFilters[columnName]);
  }

  /**
   * Obtiene información de columna desde los datos
   * @param {string} columnName - Nombre de la columna
   * @returns {Object|null} Información de la columna
   */
  getColumnInfoFromData(columnName) {
    if (!this.filters.originalData || this.filters.originalData.length === 0) {
      console.warn(`XDiagrams: No hay datos originales para analizar columna '${columnName}'`);
      return null;
    }
    
    console.log(`XDiagrams: Analizando columna '${columnName}' de ${this.filters.originalData.length} registros`);
    
    const values = [];
    const uniqueValues = new Set();
    
    // Analizar valores de la columna
    this.filters.originalData.forEach((row, index) => {
      const value = row[columnName];
      if (value !== null && value !== undefined && value !== '') {
        values.push(value);
        uniqueValues.add(value);
      }
      
      // Log de los primeros 5 registros para debugging
      if (index < 5) {
        console.log(`XDiagrams: Registro ${index} - ${columnName}: '${value}'`);
      }
    });
    
    console.log(`XDiagrams: Columna '${columnName}' - ${values.length} valores válidos, ${uniqueValues.size} únicos`);
    console.log(`XDiagrams: Valores únicos en '${columnName}':`, Array.from(uniqueValues));
    
    if (values.length === 0) {
      console.warn(`XDiagrams: Columna '${columnName}' no tiene valores válidos`);
      return null;
    }
    
    // Determinar tipo de filtro
    const filterType = this.determineFilterType(values, uniqueValues.size);
    console.log(`XDiagrams: Tipo de filtro determinado para '${columnName}': ${filterType}`);
    
    return {
      name: columnName,
      type: filterType,
      values: values,
      uniqueValues: Array.from(uniqueValues),
      uniqueCount: uniqueValues.size,
      sampleCount: values.length,
      hasData: values.length > 0
    };
  }
  
  /**
   * Determina el tipo de filtro basado en los datos
   * @param {Array} values - Valores de la columna
   * @param {number} uniqueCount - Número de valores únicos
   * @returns {string} Tipo de filtro
   */
  determineFilterType(values, uniqueCount) {
    if (values.length === 0) return 'none';
    
    // Si hay pocos valores únicos, usar select
    if (uniqueCount <= 10) {
      return 'select';
    }
    
    // Si hay muchos valores únicos pero son texto, usar search
    if (uniqueCount > 10) {
      const isNumeric = values.every(value => !isNaN(parseFloat(value)) && isFinite(value));
      return isNumeric ? 'range' : 'search';
    }
    
    return 'search';
  }
  
  /**
   * Crea configuración de filtro custom
   * @param {string} columnName - Nombre de la columna
   * @param {Object} config - Configuración custom
   * @param {Object} columnInfo - Información de la columna
   * @returns {Object|null} Configuración del filtro
   */
  createCustomFilterConfig(columnName, config, columnInfo) {
    const baseConfig = {
      column: columnName,
      label: config.label || this.generateLabel(columnName),
      type: config.type || columnInfo.type,
      priority: config.priority || 999
    };

    switch (baseConfig.type) {
      case 'select':
        const options = columnInfo.uniqueValues.map(value => {
          const count = columnInfo.values.filter(v => v === value).length;
          console.log(`XDiagrams: Opción '${value}' tiene ${count} elementos en datos`);
          return {
            value: value,
            label: value,
            count: count
          };
        });
        
        // Agregar opción para valores vacíos/nulos
        const emptyCount = columnInfo.values.filter(v => !v || v === '' || v === null || v === undefined).length;
        if (emptyCount > 0) {
          options.push({
            value: '__empty__',
            label: 'Sin valor',
            count: emptyCount
          });
          console.log(`XDiagrams: Agregada opción 'Sin valor' con ${emptyCount} elementos`);
        }
        
        console.log(`XDiagrams: Filtro '${columnName}' (${baseConfig.type}) generado con opciones:`, options);
        return {
          ...baseConfig,
          options: options
        };

      case 'search':
        return {
          ...baseConfig,
          placeholder: config.placeholder || `Buscar en ${baseConfig.label.toLowerCase()}...`,
          minLength: config.minLength || 2
        };

      case 'range':
        const numericValues = columnInfo.values
          .map(v => parseFloat(v))
          .filter(v => !isNaN(v));
        
        if (numericValues.length === 0) return null;
        
        return {
          ...baseConfig,
          min: Math.min(...numericValues),
          max: Math.max(...numericValues),
          step: this.calculateStep(numericValues)
        };

      default:
        return baseConfig;
    }
  }

  /**
   * Actualiza los conteos de las opciones de filtro basándose en nodos realmente visibles
   * @param {string} columnName - Nombre de la columna
   * @param {Object} filterConfig - Configuración del filtro
   */
  updateFilterCounts(columnName, filterConfig) {
    if (!filterConfig || !filterConfig.options) return;
    
    console.log(`XDiagrams: Actualizando conteos para filtro '${columnName}'`);
    console.log(`XDiagrams: Configuración del filtro:`, filterConfig);
    console.log(`XDiagrams: Opciones a procesar:`, filterConfig.options);
    
    filterConfig.options.forEach((option, index) => {
      console.log(`XDiagrams: Procesando opción ${index}: '${option.value}'`);
      // Contar nodos realmente visibles que coinciden con este valor
      const visibleCount = this.countVisibleNodesForValue(columnName, option.value);
      option.count = visibleCount;
      console.log(`XDiagrams: Opción '${option.value}' tiene ${visibleCount} nodos visibles`);
    });
  }
  
  /**
   * Cuenta nodos visibles que coinciden con un valor específico
   * @param {string} columnName - Nombre de la columna
   * @param {string} value - Valor a buscar
   * @returns {number} Número de nodos visibles
   */
  countVisibleNodesForValue(columnName, value) {
    try {
      let count = 0;
      
      // Usar el mismo selector que se detectó dinámicamente
      const nodeSelectors = ['.node', '.xdiagrams-node', '[class*="node"]', 'g.node', 'circle', 'rect'];
      let bestSelector = '.node';
      let maxNodes = 0;

      // Encontrar el mejor selector
      nodeSelectors.forEach(selector => {
        const nodes = document.querySelectorAll(selector);
        if (nodes.length > maxNodes) {
          maxNodes = nodes.length;
          bestSelector = selector;
        }
      });

      console.log(`XDiagrams: Contando nodos para '${columnName}' = '${value}' usando selector '${bestSelector}'`);
      
      const nodes = document.querySelectorAll(bestSelector);
      
      nodes.forEach((node, index) => {
        const opacity = window.getComputedStyle(node).opacity;
        const opacityValue = parseFloat(opacity);
        
        if (index < 5) { // Log los primeros 5 nodos para debugging
          console.log(`XDiagrams: Nodo ${index} - opacity: ${opacity} (${opacityValue}), visible: ${opacityValue >= 0.2}`);
        }
        
        if (opacityValue >= 0.2) { // Nodo visible - ajustado para opacidad 0.222265
          const nodeData = node.__data__;
          
          if (index < 3) { // Log detalle de los primeros 3 nodos visibles
            console.log(`XDiagrams: Nodo ${index} visible - nodeData:`, nodeData);
            if (nodeData) {
              console.log(`XDiagrams: Nodo ${index} nodeData completo:`, nodeData);
              if (nodeData.data) {
                console.log(`XDiagrams: Nodo ${index} data:`, nodeData.data);
                console.log(`XDiagrams: Nodo ${index} claves de data:`, Object.keys(nodeData.data));
                console.log(`XDiagrams: Nodo ${index} ${columnName}:`, nodeData.data[columnName], 'vs buscado:', value);
              } else {
                console.log(`XDiagrams: Nodo ${index} - nodeData.data es undefined`);
                // Intentar acceder directamente a las propiedades
                console.log(`XDiagrams: Nodo ${index} claves directas:`, Object.keys(nodeData));
                console.log(`XDiagrams: Nodo ${index} ${columnName} directo:`, nodeData[columnName]);
              }
            }
          }
          
                 // Intentar acceder a los datos de diferentes maneras
                 let nodeValue = null;
                 if (nodeData && nodeData.data) {
                   // Buscar columna exacta primero
                   nodeValue = nodeData.data[columnName];
                   // Si no se encuentra, buscar en minúsculas
                   if (nodeValue === undefined) {
                     nodeValue = nodeData.data[columnName.toLowerCase()];
                   }
                 } else if (nodeData) {
                   // Buscar columna exacta primero
                   nodeValue = nodeData[columnName];
                   // Si no se encuentra, buscar en minúsculas
                   if (nodeValue === undefined) {
                     nodeValue = nodeData[columnName.toLowerCase()];
                   }
                 }
                 
                 // Logging temporal para debug
                 if (columnName === 'Layout' && index < 3) {
                   console.log(`XDiagrams: DEBUG - Nodo ${index} - columnName: '${columnName}', nodeValue: '${nodeValue}', buscado: '${value}'`);
                 }
          
          if (nodeValue === value) {
            count++;
            console.log(`XDiagrams: ¡Nodo ${index} coincide con '${columnName}' = '${value}'!`);
          }
        }
      });
      
      console.log(`XDiagrams: Encontrados ${count} nodos visibles para '${columnName}' = '${value}'`);
      return count;
    } catch (error) {
      console.error('XDiagrams: Error al contar nodos visibles:', error);
      return 0;
    }
  }

  /**
   * Obtiene configuración de filtro para una columna
   * @param {string} columnName - Nombre de la columna
   * @returns {Object|null} Configuración del filtro
   */
  getFilterConfig(columnName) {
    return this.customFilters[columnName] || this.autoFilters[columnName] || null;
  }
}

export { XDiagramsFilterManager };
