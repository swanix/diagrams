/**
 * XDiagrams Floating Filters Pill Module
 * Maneja el pill flotante que contiene los filtros compactos
 */

class XDiagramsFloatingFiltersPill {
  constructor() {
    this.pillElement = null;
    this.isInitialized = false;
    this.isVisible = false; // Por defecto cerrado
    this.filtersContainer = null;
    this.clearButton = null;
    this.toggleButton = null;
    this.filters = null;
  }

  /**
   * Inicializa el pill flotante de filtros
   * @param {Object} filters - Instancia del sistema de filtros
   */
  init(filters) {
    this.filters = filters;
    this.createPillElement();
    this.setupEventListeners();
  }

  /**
   * Crea el elemento del pill flotante
   */
  createPillElement() {
    // Crear el elemento pill
    this.pillElement = document.createElement('div');
    this.pillElement.id = 'xdiagrams-floating-filters-pill';
    this.pillElement.className = 'floating-filters-pill';
    
    // Crear contenedor de filtros
    this.filtersContainer = document.createElement('div');
    this.filtersContainer.className = 'filters-container';
    
    // Crear botón de limpiar filtros
    this.clearButton = document.createElement('button');
    this.clearButton.className = 'filter-clear-btn';
    this.clearButton.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="15" y1="9" x2="9" y2="15"/>
        <line x1="9" y1="9" x2="15" y2="15"/>
      </svg>
    `;
    this.clearButton.title = 'Limpiar filtros';
    
    // Crear botón de toggle (mostrar/ocultar)
    this.toggleButton = document.createElement('button');
    this.toggleButton.className = 'filter-toggle-btn';
    this.toggleButton.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
      </svg>
    `;
    this.toggleButton.title = 'Mostrar/Ocultar filtros';
    
    // Ensamblar el pill
    this.pillElement.appendChild(this.filtersContainer);
    this.pillElement.appendChild(this.clearButton);
    this.pillElement.appendChild(this.toggleButton);
    
    // Agregar al DOM
    document.body.appendChild(this.pillElement);
  }

  /**
   * Configura los event listeners
   */
  setupEventListeners() {
    // Botón de limpiar filtros
    this.clearButton.addEventListener('click', () => {
      this.clearAllFilters();
    });

    // Botón de toggle
    this.toggleButton.addEventListener('click', () => {
      this.toggleVisibility();
    });
  }

  /**
   * Actualiza los filtros en el pill
   * @param {Object} filterConfigs - Configuraciones de filtros
   */
  updateFilters(filterConfigs) {
    if (!this.filtersContainer) return;

    // Limpiar filtros existentes
    this.filtersContainer.innerHTML = '';

    // Crear filtros
    Object.entries(filterConfigs).forEach(([columnName, config]) => {
      const filterElement = this.createFilterElement(columnName, config);
      this.filtersContainer.appendChild(filterElement);
    });

    // Actualizar visibilidad del pill
    this.updatePillVisibility();
  }

  /**
   * Crea un elemento de filtro individual
   * @param {string} columnName - Nombre de la columna
   * @param {Object} config - Configuración del filtro
   * @returns {HTMLElement} Elemento del filtro
   */
  createFilterElement(columnName, config) {
    const filterWrapper = document.createElement('div');
    filterWrapper.className = 'filter-wrapper';
    filterWrapper.dataset.column = columnName;

    // Crear control según el tipo
    let control;
    switch (config.type) {
      case 'select':
        control = this.createSelectControl(columnName, config);
        break;
      case 'search':
        control = this.createSearchControl(columnName, config);
        break;
      case 'range':
        control = this.createRangeControl(columnName, config);
        break;
      default:
        control = this.createSelectControl(columnName, config);
    }

    filterWrapper.appendChild(control);

    return filterWrapper;
  }

  /**
   * Crea un control de selección
   * @param {string} columnName - Nombre de la columna
   * @param {Object} config - Configuración del filtro
   * @returns {HTMLElement} Elemento select
   */
  createSelectControl(columnName, config) {
    const select = document.createElement('select');
    select.className = 'filter-select';
    select.dataset.column = columnName;

    // Opción por defecto
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = config.label || columnName;
    select.appendChild(defaultOption);

    // Opciones del filtro
    if (config.options) {
      config.options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option.value;
        optionElement.textContent = option.label;
        select.appendChild(optionElement);
      });
    }

    // Event listener
    select.addEventListener('change', (e) => {
      this.handleFilterChange(columnName, e.target.value);
    });

    return select;
  }

  /**
   * Crea un control de búsqueda
   * @param {string} columnName - Nombre de la columna
   * @param {Object} config - Configuración del filtro
   * @returns {HTMLElement} Elemento input
   */
  createSearchControl(columnName, config) {
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'filter-search';
    input.dataset.column = columnName;
    input.placeholder = config.placeholder || `Buscar en ${config.label || columnName}...`;

    // Event listener con debounce
    let timeout;
    input.addEventListener('input', (e) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        this.handleFilterChange(columnName, e.target.value);
      }, 300);
    });

    return input;
  }

  /**
   * Crea un control de rango
   * @param {string} columnName - Nombre de la columna
   * @param {Object} config - Configuración del filtro
   * @returns {HTMLElement} Elemento de rango
   */
  createRangeControl(columnName, config) {
    const rangeContainer = document.createElement('div');
    rangeContainer.className = 'filter-range-container';

    const input = document.createElement('input');
    input.type = 'range';
    input.className = 'filter-range';
    input.dataset.column = columnName;
    input.min = config.min || 0;
    input.max = config.max || 100;
    input.step = config.step || 1;

    const valueDisplay = document.createElement('span');
    valueDisplay.className = 'filter-range-value';
    valueDisplay.textContent = input.value;

    input.addEventListener('input', (e) => {
      valueDisplay.textContent = e.target.value;
      this.handleFilterChange(columnName, e.target.value);
    });

    rangeContainer.appendChild(input);
    rangeContainer.appendChild(valueDisplay);

    return rangeContainer;
  }

  /**
   * Maneja el cambio de filtro
   * @param {string} columnName - Nombre de la columna
   * @param {string} value - Valor del filtro
   */
  handleFilterChange(columnName, value) {
    if (this.filters) {
      this.filters.setFilter(columnName, value);
    }
  }

  /**
   * Limpia todos los filtros
   */
  clearAllFilters() {
    if (this.filters) {
      this.filters.clearAllFilters();
    }
    
    // Limpiar controles
    const controls = this.filtersContainer.querySelectorAll('select, input');
    controls.forEach(control => {
      if (control.type === 'text') {
        control.value = '';
      } else if (control.tagName === 'SELECT') {
        control.selectedIndex = 0;
      } else if (control.type === 'range') {
        control.value = control.min;
        const valueDisplay = control.parentElement.querySelector('.filter-range-value');
        if (valueDisplay) {
          valueDisplay.textContent = control.value;
        }
      }
    });
  }

  /**
   * Alterna la visibilidad del pill
   */
  toggleVisibility() {
    this.isVisible = !this.isVisible;
    this.updatePillVisibility();
    
    // El ícono del embudo no cambia, solo el tooltip
    if (this.isVisible) {
      this.toggleButton.title = 'Ocultar filtros';
    } else {
      this.toggleButton.title = 'Mostrar filtros';
    }
  }

  /**
   * Actualiza la visibilidad del pill
   */
  updatePillVisibility() {
    if (!this.pillElement) return;

    if (this.isVisible) {
      // Expandir el pill primero
      this.pillElement.classList.remove('collapsed');
      
      // Ocultar los filtros durante la expansión
      this.filtersContainer.style.display = 'flex';
      this.filtersContainer.style.opacity = '0';
      this.clearButton.style.display = 'flex';
      this.clearButton.style.opacity = '0';
      
      // Mostrar los filtros con fade después de la expansión
      setTimeout(() => {
        this.filtersContainer.style.transition = 'opacity 0.3s ease-in-out';
        this.filtersContainer.style.opacity = '1';
        this.clearButton.style.transition = 'opacity 0.3s ease-in-out';
        this.clearButton.style.opacity = '1';
      }, 200); // Esperar a que termine la expansión del pill
    } else {
      // Ocultar los filtros primero con fade
      this.filtersContainer.style.transition = 'opacity 0.2s ease-in-out';
      this.filtersContainer.style.opacity = '0';
      this.clearButton.style.transition = 'opacity 0.2s ease-in-out';
      this.clearButton.style.opacity = '0';
      
      // Colapsar el pill después del fade
      setTimeout(() => {
        this.pillElement.classList.add('collapsed');
        this.filtersContainer.style.display = 'none';
        this.clearButton.style.display = 'none';
        // Resetear las transiciones para la próxima vez
        this.filtersContainer.style.transition = '';
        this.clearButton.style.transition = '';
      }, 200);
    }
  }

  /**
   * Muestra el pill flotante
   */
  show() {
    if (this.pillElement) {
      this.pillElement.style.display = 'flex';
    }
  }

  /**
   * Oculta el pill flotante
   */
  hide() {
    if (this.pillElement) {
      this.pillElement.style.display = 'none';
    }
  }

  /**
   * Destruye el pill flotante
   */
  destroy() {
    if (this.pillElement) {
      this.pillElement.remove();
      this.pillElement = null;
      this.filtersContainer = null;
      this.clearButton = null;
      this.toggleButton = null;
      this.isInitialized = false;
    }
  }

}

export { XDiagramsFloatingFiltersPill };
