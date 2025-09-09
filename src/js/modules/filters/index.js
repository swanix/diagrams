/**
 * XDiagrams Filters Module - Coordinador Principal
 * Sistema de filtros dinámicos basado en columnas de datos
 */

import { XDiagramsFilterManager } from './filter-manager.js';
import { XDiagramsFilterUI } from './filter-ui.js';
import { XDiagramsFilterLogic } from './filter-logic.js';

class XDiagramsFilters {
  constructor(core) {
    this.core = core;
    this.config = this.initializeConfig();
    
    // Inicializar submódulos
    this.manager = new XDiagramsFilterManager(this);
    this.ui = new XDiagramsFilterUI(this);
    this.logic = new XDiagramsFilterLogic(this);
    
    // Estado de filtros
    this.activeFilters = {};
    this.filteredData = null;
    this.originalData = null;
    this.useFloatingPill = this.config.ui?.useFloatingPill !== false; // Por defecto true
  }

  /**
   * Inicializa la configuración de filtros
   */
  initializeConfig() {
    const defaultConfig = {
      auto: true,
      custom: {},
      include: [], // Por defecto, incluir todas las columnas (detección automática)
      ui: {
        position: 'top',
        showCount: true,
        showReset: true,
        maxFilters: 5
      }
    };

    return {
      ...defaultConfig,
      ...(this.core.config.filters || {})
    };
  }

  /**
   * Inicializa el sistema de filtros con los datos
   * @param {Array} data - Datos del diagrama
   */
  async initialize(data) {
    console.log('XDiagrams: Inicializando sistema de filtros con datos:', data);
    console.log(`XDiagrams: Total de registros recibidos: ${data ? data.length : 0}`);
    
    this.originalData = data;
    
    if (data && data.length > 0) {
      console.log('XDiagrams: Primer registro de datos:', data[0]);
      console.log('XDiagrams: Columnas disponibles:', Object.keys(data[0]));
      console.log('XDiagrams: Todas las columnas del primer registro:', Object.keys(data[0]).map(k => `'${k}'`).join(', '));
    }
    
    // Analizar columnas disponibles
    const availableColumns = this.analyzeColumns(data);
    console.log('XDiagrams: Columnas analizadas:', availableColumns);
    
    // Configurar filtros automáticos
    if (this.config.auto) {
      console.log('XDiagrams: Configurando filtros automáticos');
      this.manager.setupAutoFilters(availableColumns);
    }
    
    // Configurar filtros custom
    if (Object.keys(this.config.custom).length > 0) {
      console.log('XDiagrams: Configurando filtros custom:', this.config.custom);
      this.manager.setupCustomFilters(this.config.custom);
    }
    
    // Crear interfaz de usuario
    if (this.useFloatingPill) {
      // Usar pill flotante
      this.core.uiManager.initFloatingFiltersPill(this);
      this.core.uiManager.initFloatingSectionsCountPill();
      const allFilters = this.manager.getAllFilters();
      this.core.uiManager.updateFloatingFiltersPill(allFilters);
    } else {
      // Usar UI tradicional
      await this.ui.create();
    }
    
    // Aplicar filtros iniciales
    this.applyFilters();
  }

  /**
   * Analiza las columnas disponibles en los datos
   * @param {Array} data - Datos del diagrama
   * @returns {Object} Información de columnas
   */
  analyzeColumns(data) {
    if (!data || data.length === 0) return {};

    const columns = {};
    const sampleSize = Math.min(data.length, 100); // Analizar máximo 100 registros
    
    // Obtener todas las columnas del primer registro
    const firstRow = data[0];
    const columnNames = Object.keys(firstRow);

    columnNames.forEach(columnName => {
      // Si hay columnas específicas incluidas, solo procesar esas
      if (this.config.include && this.config.include.length > 0) {
        if (!this.config.include.includes(columnName)) {
          console.log(`XDiagrams: Excluyendo columna '${columnName}' (no está en include)`);
          return;
        }
        console.log(`XDiagrams: Incluyendo columna '${columnName}' (está en include)`);
      } else {
        // Si no hay include definido, excluir solo columnas estrictamente del sistema
        const systemExcludes = ['ID', 'id', 'Node', 'node', 'Parent', 'parent', 'Img', 'img', 'Icon', 'icon'];
        // Solo excluir si el nombre de la columna coincide exactamente o es una variación exacta
        if (systemExcludes.some(exclude => 
          columnName.toLowerCase() === exclude.toLowerCase() ||
          columnName.toLowerCase().startsWith(exclude.toLowerCase() + '_') ||
          columnName.toLowerCase().endsWith('_' + exclude.toLowerCase())
        )) {
          return;
        }
      }

      const values = [];
      const uniqueValues = new Set();
      
      // Analizar valores de la columna
      for (let i = 0; i < sampleSize; i++) {
        const value = data[i][columnName];
        if (value !== null && value !== undefined && value !== '') {
          values.push(value);
          uniqueValues.add(value);
        }
      }

      // Determinar tipo de filtro
      const filterType = this.determineFilterType(values, uniqueValues.size);
      
      columns[columnName] = {
        name: columnName,
        type: filterType,
        values: values,
        uniqueValues: Array.from(uniqueValues),
        uniqueCount: uniqueValues.size,
        sampleCount: values.length,
        hasData: values.length > 0
      };
    });

    return columns;
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
   * Aplica los filtros activos
   */
  applyFilters() {
    try {
      if (!this.originalData) {
        console.warn('XDiagrams: No hay datos originales para aplicar filtros');
        return;
      }

      // Aplicar filtros para obtener registros que coinciden
      this.filteredData = this.logic.applyFilters(this.originalData, this.activeFilters);
      
      // Contar registros filtrados (no elementos DOM)
      const visibleRecordsCount = this.filteredData ? this.filteredData.length : this.originalData.length;
      
      // Aplicar opacidad a los nodos en lugar de ocultarlos
      this.applyOpacityToNodes();
      
      // Actualizar UI con el conteo de registros
      this.updateNodeCount(visibleRecordsCount, this.originalData.length);
      
      if (!this.useFloatingPill && this.ui && this.ui.updateFilterCount) {
        this.ui.updateFilterCount(visibleRecordsCount, this.originalData.length);
      }
      
      // Actualizar con conteo real después de las transiciones
      setTimeout(() => {
        this.updateNodeCount(visibleRecordsCount, this.originalData.length);
      }, 500);
      
      if (!this.useFloatingPill && this.ui && this.ui.updateFilterCountWithRealCount) {
        this.ui.updateFilterCountWithRealCount(this.originalData.length);
      }
      
      // Actualizar conteos de los dropdowns después de las transiciones
      setTimeout(() => {
        this.updateDropdownCounts();
      }, 500);
    } catch (error) {
      console.error('XDiagrams: Error al aplicar filtros:', error);
    }
  }

  /**
   * Aplica opacidad a los nodos según los filtros activos
   */
  applyOpacityToNodes() {
    try {
      if (!this.core || !this.core.globalContainer) {
        console.warn('XDiagrams: No hay contenedor global disponible para aplicar opacidad');
        return 0;
      }
      
      // Verificar qué selectores de nodos están disponibles
      const nodeSelectors = ['.node', '.xdiagrams-node', '[class*="node"]', 'g.node', 'circle', 'rect'];
      let bestSelector = '.node';
      let maxNodes = 0;
      
      nodeSelectors.forEach(selector => {
        const count = d3.selectAll(selector).size();
        console.log(`XDiagrams: Selector '${selector}' encuentra ${count} elementos`);
        if (count > maxNodes) {
          maxNodes = count;
          bestSelector = selector;
        }
      });
      
      console.log(`XDiagrams: Usando selector '${bestSelector}' con ${maxNodes} elementos`);

      const hasActiveFilters = Object.keys(this.activeFilters).length > 0;
    
    if (!hasActiveFilters) {
      // Sin filtros activos: mostrar todos los nodos con opacidad normal
      const allNodes = d3.selectAll(bestSelector);
      console.log(`XDiagrams: Total de nodos encontrados: ${allNodes.size()}`);
      
      allNodes
        .transition()
        .duration(300)
        .style('opacity', 1)
        .style('pointer-events', 'all');
      
      console.log(`XDiagrams: Sin filtros activos, todos los nodos visibles`);
      return;
    }

    // Con filtros activos: aplicar opacidad según coincidencia
    const self = this; // Capturar referencia al contexto correcto
    const allNodes = d3.selectAll(bestSelector);
    console.log(`XDiagrams: Con filtros activos, procesando ${allNodes.size()} nodos`);
    console.log('XDiagrams: Filtros activos:', self.activeFilters);
    
    allNodes.each(function() {
      const nodeElement = this;
      const nodeData = nodeElement.__data__;
      
      if (!nodeData || !nodeData.data) {
        console.log('XDiagrams: Nodo sin datos válidos, ocultando');
        d3.select(nodeElement)
          .transition()
          .duration(300)
          .style('opacity', 0.2)
          .style('pointer-events', 'none');
        return;
      }

      // Acceder a los datos de la misma manera que el info panel
      const data = nodeData.data || nodeData;
      
      // Verificar si el nodo coincide con los filtros activos
      const matchesFilters = self.logic.checkNodeMatchesFilters(data, self.activeFilters);
      
      if (matchesFilters) {
        // Nodo que coincide: opacidad normal
        d3.select(nodeElement)
          .transition()
          .duration(300)
          .style('opacity', 1)
          .style('pointer-events', 'all');
      } else {
        // Nodo que no coincide: opacidad reducida
        d3.select(nodeElement)
          .transition()
          .duration(300)
          .style('opacity', 0.2)
          .style('pointer-events', 'none');
      }
    });
    
    console.log(`XDiagrams: Opacidad aplicada a todos los nodos según filtros activos`);
    } catch (error) {
      console.error('XDiagrams: Error al aplicar opacidad a los nodos:', error);
    }
  }
  
  /**
   * Cuenta los nodos que están realmente visibles (opacidad 1)
   * @param {string} selector - Selector CSS para los nodos
   * @returns {number} Número de nodos visibles
   */
  countVisibleNodes(selector = '.node') {
    try {
      let visibleCount = 0;
      const allNodes = d3.selectAll(selector);
      console.log(`XDiagrams: Contando nodos visibles de ${allNodes.size()} total usando selector '${selector}'`);
      
      let nodeIndex = 0;
      allNodes.each(function() {
        const opacity = d3.select(this).style('opacity');
        const computedOpacity = window.getComputedStyle(this).opacity;
        
        // Solo log los primeros 10 nodos para no saturar la consola
        if (nodeIndex < 10) {
          console.log(`XDiagrams: Nodo ${nodeIndex} opacity: ${opacity}, computed: ${computedOpacity}`);
        }
        nodeIndex++;
        
        if (opacity === '1' || opacity === '1px' || parseFloat(opacity) >= 0.7 || 
            computedOpacity === '1' || parseFloat(computedOpacity) >= 0.7) {
          visibleCount++;
        }
      });
      
      console.log(`XDiagrams: Nodos visibles encontrados: ${visibleCount}`);
      return visibleCount;
    } catch (error) {
      console.error('XDiagrams: Error al contar nodos visibles:', error);
      return 0;
    }
  }

  /**
   * Actualiza los conteos de los dropdowns basándose en nodos realmente visibles
   */
  updateDropdownCounts() {
    try {
      console.log('XDiagrams: Actualizando conteos de dropdowns');
      
      // Obtener todos los filtros configurados
      const allFilters = this.manager.getAllFilters();
      
      Object.entries(allFilters).forEach(([columnName, filterConfig]) => {
        if (filterConfig.type === 'select' && filterConfig.options) {
          // Actualizar conteos del filtro
          this.manager.updateFilterCounts(columnName, filterConfig);
          
          // Actualizar la UI del dropdown
          this.updateDropdownUI(columnName, filterConfig);
        }
      });
    } catch (error) {
      console.error('XDiagrams: Error al actualizar conteos de dropdowns:', error);
    }
  }
  
  /**
   * Actualiza la UI de un dropdown específico
   * @param {string} columnName - Nombre de la columna
   * @param {Object} filterConfig - Configuración del filtro
   */
  updateDropdownUI(columnName, filterConfig) {
    try {
      const filterElement = this.ui.filterElements.get(columnName);
      if (!filterElement) return;
      
      const select = filterElement.querySelector('.xdiagrams-filter__select');
      if (!select) return;
      
      // Actualizar las opciones del select
      const options = select.querySelectorAll('option');
      options.forEach(option => {
        if (option.value) {
          const matchingOption = filterConfig.options.find(opt => opt.value === option.value);
          if (matchingOption) {
            option.textContent = `${matchingOption.label}`;
          }
        }
      });
      
      console.log(`XDiagrams: UI del dropdown '${columnName}' actualizada`);
    } catch (error) {
      console.error(`XDiagrams: Error al actualizar UI del dropdown '${columnName}':`, error);
    }
  }

  /**
   * Establece un filtro activo
   * @param {string} column - Nombre de la columna
   * @param {*} value - Valor del filtro
   */
  setFilter(column, value) {
    try {
      console.log(`XDiagrams: setFilter llamado para '${column}' con valor:`, value);
      
      if (!column) {
        console.warn('XDiagrams: setFilter llamado sin nombre de columna');
        return;
      }

      if (value === null || value === undefined || value === '') {
        delete this.activeFilters[column];
        console.log(`XDiagrams: Filtro '${column}' eliminado`);
      } else {
        this.activeFilters[column] = value;
        console.log(`XDiagrams: Filtro '${column}' establecido a:`, value);
      }
      
      console.log('XDiagrams: Filtros activos:', this.activeFilters);
      this.applyFilters();
    } catch (error) {
      console.error('XDiagrams: Error al establecer filtro:', error);
    }
  }

  /**
   * Limpia todos los filtros
   */
  clearAllFilters() {
    this.activeFilters = {};
    this.applyFilters();
    this.ui.clearAllFilters();
  }

  /**
   * Obtiene los datos filtrados
   * @returns {Array} Datos filtrados
   */
  getFilteredData() {
    return this.filteredData || this.originalData;
  }

  /**
   * Obtiene los filtros activos
   * @returns {Object} Filtros activos
   */
  getActiveFilters() {
    return { ...this.activeFilters };
  }

  /**
   * Establece un filtro específico (para el pill flotante)
   * @param {string} columnName - Nombre de la columna
   * @param {string} value - Valor del filtro
   */
  setFilter(columnName, value) {
    if (value === '' || value === null || value === undefined) {
      delete this.activeFilters[columnName];
    } else {
      this.activeFilters[columnName] = value;
    }
    
    console.log(`XDiagrams: Filtro establecido - ${columnName}: ${value}`);
    this.applyFilters();
  }

  /**
   * Limpia todos los filtros (para el pill flotante)
   */
  clearAllFilters() {
    this.activeFilters = {};
    console.log('XDiagrams: Todos los filtros limpiados');
    this.applyFilters();
  }

  /**
   * Actualiza el conteo de secciones visibles
   * @param {number} visibleCount - Número de secciones visibles
   * @param {number} totalCount - Número total de secciones
   */
  updateNodeCount(visibleCount, totalCount) {
    if (this.core.uiManager) {
      this.core.uiManager.updateFloatingSectionsCount(visibleCount);
    }
  }

  /**
   * Destruye el sistema de filtros
   */
  destroy() {
    if (this.useFloatingPill && this.core.uiManager) {
      this.core.uiManager.destroyFloatingFiltersPill();
      this.core.uiManager.destroyFloatingSectionsCountPill();
    } else {
      this.ui.destroy();
    }
    this.activeFilters = {};
    this.filteredData = null;
    this.originalData = null;
  }
}

export { XDiagramsFilters };
