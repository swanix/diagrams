/**
 * XDiagrams Filter UI Module
 * Interfaz de usuario para filtros dinámicos
 */

class XDiagramsFilterUI {
  constructor(filters) {
    this.filters = filters;
    this.core = filters.core;
    this.container = null;
    this.filterElements = new Map();
    this.isVisible = false;
  }

  /**
   * Crea la interfaz de usuario de filtros
   */
  async create() {
    if (this.container) {
      this.destroy();
    }

    const allFilters = this.filters.manager.getAllFilters();
    if (Object.keys(allFilters).length === 0) {
      return; // No hay filtros para mostrar
    }

    this.container = this.createFilterContainer();
    this.createFilterControls(allFilters);
    this.attachEventListeners();
    
    // Ajustar el contenedor principal
    this.adjustMainContainer(true);
    
    // Mostrar/ocultar según configuración
    this.toggleVisibility(this.core.config.filters?.ui?.showByDefault !== false);
  }

  /**
   * Crea el contenedor principal de filtros
   * @returns {HTMLElement} Contenedor de filtros
   */
  createFilterContainer() {
    const position = this.filters.config.ui.position || 'top';
    
    const container = document.createElement('div');
    container.className = `xdiagrams-filters xdiagrams-filters--${position}`;
    container.innerHTML = `
      <div class="xdiagrams-filters__content">
        <div class="xdiagrams-filters__list">
          <div class="xdiagrams-filters__stats">
            <span class="xdiagrams-filters__count">0 de 0 nodos</span>
          </div>
        </div>
      </div>
    `;

    // Crear controles flotantes
    this.createFloatingControls();

    // Insertar en el DOM
    const targetElement = this.getTargetElement(position);
    targetElement.appendChild(container);

    return container;
  }

  /**
   * Crea los controles flotantes en la esquina superior derecha
   */
  createFloatingControls() {
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'xdiagrams-filters__floating-controls';
    controlsContainer.innerHTML = `
      <button class="xdiagrams-filters__toggle" title="Mostrar/Ocultar filtros">
        <span class="xdiagrams-filters__toggle-icon">🔍</span>
      </button>
      <button class="xdiagrams-filters__reset" title="Limpiar todos los filtros">
        <span class="xdiagrams-filters__reset-icon">✕</span>
      </button>
    `;

    // Insertar en el body para que esté flotante
    document.body.appendChild(controlsContainer);
    this.floatingControls = controlsContainer;
  }

  /**
   * Obtiene el elemento objetivo donde insertar los filtros
   * @param {string} position - Posición de los filtros
   * @returns {HTMLElement} Elemento objetivo
   */
  getTargetElement(position) {
    if (position === 'side') {
      // Crear sidebar si no existe
      let sidebar = document.querySelector('.xdiagrams-sidebar');
      if (!sidebar) {
        sidebar = document.createElement('div');
        sidebar.className = 'xdiagrams-sidebar';
        document.body.appendChild(sidebar);
      }
      return sidebar;
    } else {
      // Insertar en el contenedor principal del diagrama
      const diagramContainer = document.querySelector('.xdiagrams-container') || 
                              document.querySelector('#xdiagrams') || 
                              document.body;
      return diagramContainer;
    }
  }

  /**
   * Crea los controles de filtros
   * @param {Object} allFilters - Todos los filtros configurados
   */
  createFilterControls(allFilters) {
    const listContainer = this.container.querySelector('.xdiagrams-filters__list');
    const maxFilters = this.filters.config.ui.maxFilters || 5;
    
    console.log('XDiagrams: Creando controles de filtros:', allFilters);
    
    // Limitar número de filtros mostrados
    const filtersToShow = Object.entries(allFilters).slice(0, maxFilters);
    
    console.log('XDiagrams: Filtros a mostrar:', filtersToShow);
    
    filtersToShow.forEach(([columnName, filterConfig]) => {
      console.log(`XDiagrams: Creando filtro para '${columnName}':`, filterConfig);
      const filterElement = this.createFilterElement(columnName, filterConfig);
      listContainer.appendChild(filterElement);
      this.filterElements.set(columnName, filterElement);
    });

    // Si hay más filtros, mostrar botón "Más"
    if (Object.keys(allFilters).length > maxFilters) {
      this.createMoreFiltersButton(listContainer, allFilters, maxFilters);
    }
  }

  /**
   * Crea un elemento de filtro individual
   * @param {string} columnName - Nombre de la columna
   * @param {Object} filterConfig - Configuración del filtro
   * @returns {HTMLElement} Elemento del filtro
   */
  createFilterElement(columnName, filterConfig) {
    const element = document.createElement('div');
    element.className = `xdiagrams-filter xdiagrams-filter--${filterConfig.type}`;
    element.dataset.column = columnName;

    switch (filterConfig.type) {
      case 'select':
        element.innerHTML = this.createSelectFilterHTML(columnName, filterConfig);
        break;
      case 'search':
        element.innerHTML = this.createSearchFilterHTML(columnName, filterConfig);
        break;
      case 'range':
        element.innerHTML = this.createRangeFilterHTML(columnName, filterConfig);
        break;
      case 'multi-select':
        element.innerHTML = this.createMultiSelectFilterHTML(columnName, filterConfig);
        break;
      default:
        element.innerHTML = this.createDefaultFilterHTML(columnName, filterConfig);
    }

    return element;
  }

  /**
   * Crea HTML para filtro de selección
   * @param {string} columnName - Nombre de la columna
   * @param {Object} filterConfig - Configuración del filtro
   * @returns {string} HTML del filtro
   */
  createSelectFilterHTML(columnName, filterConfig) {
    const options = filterConfig.options || [];
    
    return `
      <select class="xdiagrams-filter__select" data-column="${columnName}">
        <option value="">${filterConfig.label}</option>
        ${options.map(option => `
          <option value="${option.value}">${option.label}</option>
        `).join('')}
      </select>
    `;
  }

  /**
   * Crea HTML para filtro de búsqueda
   * @param {string} columnName - Nombre de la columna
   * @param {Object} filterConfig - Configuración del filtro
   * @returns {string} HTML del filtro
   */
  createSearchFilterHTML(columnName, filterConfig) {
    return `
      <input type="text" 
             class="xdiagrams-filter__input" 
             data-column="${columnName}"
             placeholder="${filterConfig.placeholder || filterConfig.label}"
             minlength="${filterConfig.minLength || 2}">
    `;
  }

  /**
   * Crea HTML para filtro de rango
   * @param {string} columnName - Nombre de la columna
   * @param {Object} filterConfig - Configuración del filtro
   * @returns {string} HTML del filtro
   */
  createRangeFilterHTML(columnName, filterConfig) {
    return `
      <div class="xdiagrams-filter__range">
        <input type="number" 
               class="xdiagrams-filter__range-input" 
               data-column="${columnName}"
               data-type="min"
               placeholder="Min ${filterConfig.label}"
               min="${filterConfig.min}"
               max="${filterConfig.max}"
               step="${filterConfig.step}">
        <span class="xdiagrams-filter__range-separator">-</span>
        <input type="number" 
               class="xdiagrams-filter__range-input" 
               data-column="${columnName}"
               data-type="max"
               placeholder="Max ${filterConfig.label}"
               min="${filterConfig.min}"
               max="${filterConfig.max}"
               step="${filterConfig.step}">
      </div>
    `;
  }

  /**
   * Crea HTML para filtro de selección múltiple
   * @param {string} columnName - Nombre de la columna
   * @param {Object} filterConfig - Configuración del filtro
   * @returns {string} HTML del filtro
   */
  createMultiSelectFilterHTML(columnName, filterConfig) {
    const options = filterConfig.options || [];
    
    return `
      <div class="xdiagrams-filter__multiselect" data-column="${columnName}" title="${filterConfig.label}">
        <div class="xdiagrams-filter__multiselect-header">${filterConfig.label}</div>
        ${options.map(option => `
          <label class="xdiagrams-filter__checkbox">
            <input type="checkbox" value="${option.value}">
            <span class="xdiagrams-filter__checkbox-label">${option.label}</span>
          </label>
        `).join('')}
      </div>
    `;
  }

  /**
   * Crea HTML para filtro por defecto
   * @param {string} columnName - Nombre de la columna
   * @param {Object} filterConfig - Configuración del filtro
   * @returns {string} HTML del filtro
   */
  createDefaultFilterHTML(columnName, filterConfig) {
    return `
      <input type="text" 
             class="xdiagrams-filter__input" 
             data-column="${columnName}"
             placeholder="${filterConfig.label}">
    `;
  }

  /**
   * Crea botón "Más filtros"
   * @param {HTMLElement} container - Contenedor
   * @param {Object} allFilters - Todos los filtros
   * @param {number} maxFilters - Máximo de filtros mostrados
   */
  createMoreFiltersButton(container, allFilters, maxFilters) {
    const moreButton = document.createElement('button');
    moreButton.className = 'xdiagrams-filters__more';
    moreButton.textContent = `+${Object.keys(allFilters).length - maxFilters} más`;
    moreButton.addEventListener('click', () => {
      this.showAllFilters(allFilters);
      moreButton.remove();
    });
    container.appendChild(moreButton);
  }

  /**
   * Muestra todos los filtros
   * @param {Object} allFilters - Todos los filtros
   */
  showAllFilters(allFilters) {
    const listContainer = this.container.querySelector('.xdiagrams-filters__list');
    
    Object.entries(allFilters).forEach(([columnName, filterConfig]) => {
      if (!this.filterElements.has(columnName)) {
        const filterElement = this.createFilterElement(columnName, filterConfig);
        listContainer.appendChild(filterElement);
        this.filterElements.set(columnName, filterElement);
      }
    });
  }

  /**
   * Adjunta event listeners
   */
  attachEventListeners() {
    // Toggle de visibilidad (desde controles flotantes)
    const toggleButton = this.floatingControls.querySelector('.xdiagrams-filters__toggle');
    toggleButton.addEventListener('click', () => {
      this.toggleVisibility();
    });

    // Reset de filtros (desde controles flotantes)
    const resetButton = this.floatingControls.querySelector('.xdiagrams-filters__reset');
    resetButton.addEventListener('click', () => {
      this.filters.clearAllFilters();
    });

    // Event listeners para cada filtro
    this.filterElements.forEach((element, columnName) => {
      this.attachFilterEventListeners(element, columnName);
    });
  }

  /**
   * Adjunta event listeners para un filtro específico
   * @param {HTMLElement} element - Elemento del filtro
   * @param {string} columnName - Nombre de la columna
   */
  attachFilterEventListeners(element, columnName) {
    console.log(`XDiagrams: Adjuntando event listeners para filtro '${columnName}'`);
    const filterConfig = this.filters.manager.getFilterConfig(columnName);
    
    if (!filterConfig) {
      console.warn(`XDiagrams: No se encontró configuración para el filtro '${columnName}'`);
      return;
    }
    
    console.log(`XDiagrams: Configuración del filtro '${columnName}':`, filterConfig);
    
    switch (filterConfig.type) {
      case 'select':
        const select = element.querySelector('.xdiagrams-filter__select');
        if (select) {
          select.addEventListener('change', (e) => {
            this.filters.setFilter(columnName, e.target.value || null);
          });
        } else {
          console.warn(`XDiagrams: No se encontró el elemento select para el filtro '${columnName}'`);
        }
        break;

      case 'search':
        const input = element.querySelector('.xdiagrams-filter__input');
        if (input) {
          let searchTimeout;
          input.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
              this.filters.setFilter(columnName, e.target.value || null);
            }, 300); // Debounce de 300ms
          });
        } else {
          console.warn(`XDiagrams: No se encontró el elemento input para el filtro '${columnName}'`);
        }
        break;

      case 'range':
        const rangeInputs = element.querySelectorAll('.xdiagrams-filter__range-input');
        rangeInputs.forEach(input => {
          input.addEventListener('input', () => {
            const minInput = element.querySelector('[data-type="min"]');
            const maxInput = element.querySelector('[data-type="max"]');
            
            const min = minInput.value ? parseFloat(minInput.value) : null;
            const max = maxInput.value ? parseFloat(maxInput.value) : null;
            
            if (min !== null || max !== null) {
              this.filters.setFilter(columnName, { min, max });
            } else {
              this.filters.setFilter(columnName, null);
            }
          });
        });
        break;

      case 'multi-select':
        const checkboxes = element.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
          checkbox.addEventListener('change', () => {
            const checkedValues = Array.from(checkboxes)
              .filter(cb => cb.checked)
              .map(cb => cb.value);
            
            this.filters.setFilter(columnName, checkedValues.length > 0 ? checkedValues : null);
          });
        });
        break;

      default:
        const defaultInput = element.querySelector('.xdiagrams-filter__input');
        if (defaultInput) {
          let defaultTimeout;
          defaultInput.addEventListener('input', (e) => {
            clearTimeout(defaultTimeout);
            defaultTimeout = setTimeout(() => {
              this.filters.setFilter(columnName, e.target.value || null);
            }, 300);
          });
        }
    }
  }

  /**
   * Alterna la visibilidad de los filtros
   * @param {boolean} force - Forzar estado específico
   */
  toggleVisibility(force) {
    if (force !== undefined) {
      this.isVisible = force;
    } else {
      this.isVisible = !this.isVisible;
    }

    const content = this.container.querySelector('.xdiagrams-filters__content');
    const toggleIcon = this.floatingControls.querySelector('.xdiagrams-filters__toggle-icon');
    
    if (this.isVisible) {
      content.style.display = 'block';
      toggleIcon.textContent = '✕';
      this.container.classList.add('xdiagrams-filters--expanded');
    } else {
      content.style.display = 'none';
      toggleIcon.textContent = '🔍';
      this.container.classList.remove('xdiagrams-filters--expanded');
    }
    
    // Ajustar el contenedor principal según la visibilidad
    this.adjustMainContainer(this.isVisible);
  }

  /**
   * Actualiza el contador de filtros
   * @param {number} filteredCount - Número de elementos filtrados
   * @param {number} totalCount - Número total de elementos
   */
  updateFilterCount(filteredCount, totalCount) {
    const countElement = this.container?.querySelector('.xdiagrams-filters__count');
    if (countElement) {
      countElement.textContent = `${filteredCount} de ${totalCount} nodos`;
      console.log(`XDiagrams: Contador actualizado - ${filteredCount} de ${totalCount} nodos`);
    }
  }
  
  /**
   * Actualiza el contador con conteo real de nodos visibles
   * @param {number} totalCount - Número total de elementos
   */
  updateFilterCountWithRealCount(totalCount) {
    // Esperar a que las transiciones se completen
    setTimeout(() => {
      const visibleCount = this.countVisibleNodesInDOM();
      console.log(`XDiagrams: Actualizando contador final - ${visibleCount} visibles de ${totalCount} total`);
      this.updateFilterCount(visibleCount, totalCount);
    }, 400);
  }
  
  /**
   * Cuenta los nodos visibles en el DOM
   * @returns {number} Número de nodos visibles
   */
  countVisibleNodesInDOM() {
    try {
      let visibleCount = 0;
      const nodes = document.querySelectorAll('.node');
      console.log(`XDiagrams: Contando nodos en DOM: ${nodes.length} nodos encontrados`);
      
      nodes.forEach((node, index) => {
        const opacity = window.getComputedStyle(node).opacity;
        const opacityValue = parseFloat(opacity);
        
        if (index < 5) { // Solo log los primeros 5 para no saturar la consola
          console.log(`XDiagrams: Nodo ${index} opacity: ${opacity} (${opacityValue})`);
        }
        
        if (opacityValue >= 0.7) { // Ajustar umbral para incluir nodos con opacidad 0.712949
          visibleCount++;
        }
      });
      
      console.log(`XDiagrams: Nodos visibles en DOM: ${visibleCount} de ${nodes.length}`);
      return visibleCount;
    } catch (error) {
      console.error('XDiagrams: Error al contar nodos visibles en DOM:', error);
      return 0;
    }
  }

  /**
   * Limpia todos los filtros en la UI
   */
  clearAllFilters() {
    this.filterElements.forEach((element, columnName) => {
      const filterConfig = this.filters.manager.getFilterConfig(columnName);
      
      switch (filterConfig.type) {
        case 'select':
          const select = element.querySelector('.xdiagrams-filter__select');
          if (select) select.value = '';
          break;
        case 'search':
          const input = element.querySelector('.xdiagrams-filter__input');
          if (input) input.value = '';
          break;
        case 'range':
          const rangeInputs = element.querySelectorAll('.xdiagrams-filter__range-input');
          rangeInputs.forEach(input => input.value = '');
          break;
        case 'multi-select':
          const checkboxes = element.querySelectorAll('input[type="checkbox"]');
          checkboxes.forEach(cb => cb.checked = false);
          break;
        default:
          const defaultInput = element.querySelector('.xdiagrams-filter__input');
          if (defaultInput) defaultInput.value = '';
      }
    });
  }

  /**
   * Ajusta el contenedor principal para acomodar los filtros
   * @param {boolean} hasFilters - Si hay filtros activos
   */
  adjustMainContainer(hasFilters) {
    const position = this.filters.config.ui.position || 'top';
    
    if (position === 'top') {
      // Buscar el contenedor principal del diagrama
      const mainContainer = document.querySelector('#app') || 
                           document.querySelector('.xdiagrams-container') ||
                           document.querySelector('body');
      
      if (mainContainer) {
        if (hasFilters) {
          // Margen más pequeño ya que no hay header
          mainContainer.style.marginTop = '40px';
          mainContainer.style.transition = 'margin-top 0.3s ease';
        } else {
          mainContainer.style.marginTop = '0';
        }
      }
    }
  }

  /**
   * Destruye la interfaz de usuario
   */
  destroy() {
    if (this.container) {
      this.container.remove();
      this.container = null;
    }
    
    if (this.floatingControls) {
      this.floatingControls.remove();
      this.floatingControls = null;
    }
    
    // Restaurar el contenedor principal
    this.adjustMainContainer(false);
    
    this.filterElements.clear();
    this.isVisible = false;
  }
}

export { XDiagramsFilterUI };
