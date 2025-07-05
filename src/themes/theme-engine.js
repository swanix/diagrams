// Motor de temas para Swanix Diagrams
class ThemeEngine {
  constructor() {
    this.currentTheme = 'default';
    this.themes = new Map();
    this.loadThemes();
    this.initThemeSelector();
  }

  // Cargar todos los temas disponibles
  loadThemes() {
    // Tema por defecto
    this.addTheme('default', {
      name: 'Clásico',
      description: 'Tema original con colores neutros',
      colors: {
        '--bg-color': '#4e4e4e',
        '--text-color': '#000',
        '--node-fill': 'rgb(255, 255, 255)',
        '--label-border': '#bdbdbd',
        '--link-color': '#999',
        '--node-stroke-focus': '#000',
        '--side-panel-bg': '#ffffff',
        '--side-panel-border': '#e0e0e0',
        '--side-panel-header-bg': '#f8f9fa',
        '--side-panel-text': '#333333',
        '--side-panel-label': '#666666',
        '--side-panel-value': '#333333',
        // Variables para SVGs
        '--svg-bg-color': '#8592AD',
        '--svg-primary-color': '#ffffff',
        '--svg-secondary-color': '#A3ADC2',
        '--svg-accent-color': '#F6F7F9',
        '--svg-filter': 'none'
      }
    });

    // Tema oscuro
    this.addTheme('dark', {
      name: 'Dark',
      description: 'Tema oscuro para uso nocturno',
      colors: {
        '--bg-color': '#121212',
        '--text-color': '#fff',
        '--node-fill': '#333',
        '--label-border': '#787878',
        '--link-color': '#666',
        '--node-stroke-focus': '#fff',
        '--side-panel-bg': '#2d2d2d',
        '--side-panel-border': '#404040',
        '--side-panel-header-bg': '#404040',
        '--side-panel-text': '#ffffff',
        '--side-panel-label': '#cccccc',
        '--side-panel-value': '#ffffff',
        // Variables para SVGs
        '--svg-bg-color': '#2d3748',
        '--svg-primary-color': '#e2e8f0',
        '--svg-secondary-color': '#718096',
        '--svg-accent-color': '#4a5568',
        '--svg-filter': 'brightness(0.8) contrast(1.2)'
      }
    });

    // Tema azul corporativo
    this.addTheme('corporate-blue', {
      name: 'Corporativo Azul',
      description: 'Tema profesional con tonos azules',
      colors: {
        '--bg-color': '#f5f7fa',
        '--text-color': '#2c3e50',
        '--node-fill': '#ffffff',
        '--label-border': '#3498db',
        '--link-color': '#3498db',
        '--node-stroke-focus': '#2980b9',
        '--side-panel-bg': '#ffffff',
        '--side-panel-border': '#e3f2fd',
        '--side-panel-header-bg': '#1976d2',
        '--side-panel-text': '#2c3e50',
        '--side-panel-label': '#7f8c8d',
        '--side-panel-value': '#2c3e50'
      }
    });

    // Tema verde naturaleza
    this.addTheme('nature-green', {
      name: 'Naturaleza Verde',
      description: 'Tema ecológico con tonos verdes',
      colors: {
        '--bg-color': '#f0f8f0',
        '--text-color': '#2d5016',
        '--node-fill': '#ffffff',
        '--label-border': '#4caf50',
        '--link-color': '#66bb6a',
        '--node-stroke-focus': '#388e3c',
        '--side-panel-bg': '#ffffff',
        '--side-panel-border': '#e8f5e8',
        '--side-panel-header-bg': '#4caf50',
        '--side-panel-text': '#2d5016',
        '--side-panel-label': '#689f38',
        '--side-panel-value': '#2d5016'
      }
    });

    // Tema púrpura moderno
    this.addTheme('modern-purple', {
      name: 'Púrpura Moderno',
      description: 'Tema moderno con tonos púrpuras',
      colors: {
        '--bg-color': '#faf5ff',
        '--text-color': '#4a148c',
        '--node-fill': '#ffffff',
        '--label-border': '#9c27b0',
        '--link-color': '#ba68c8',
        '--node-stroke-focus': '#7b1fa2',
        '--side-panel-bg': '#ffffff',
        '--side-panel-border': '#f3e5f5',
        '--side-panel-header-bg': '#9c27b0',
        '--side-panel-text': '#4a148c',
        '--side-panel-label': '#8e24aa',
        '--side-panel-value': '#4a148c'
      }
    });

    // Tema naranja cálido
    this.addTheme('warm-orange', {
      name: 'Naranja Cálido',
      description: 'Tema cálido con tonos naranjas',
      colors: {
        '--bg-color': '#fff8f0',
        '--text-color': '#bf360c',
        '--node-fill': '#ffffff',
        '--label-border': '#ff9800',
        '--link-color': '#ffb74d',
        '--node-stroke-focus': '#f57c00',
        '--side-panel-bg': '#ffffff',
        '--side-panel-border': '#fff3e0',
        '--side-panel-header-bg': '#ff9800',
        '--side-panel-text': '#bf360c',
        '--side-panel-label': '#e65100',
        '--side-panel-value': '#bf360c'
      }
    });

    // Tema minimalista
    this.addTheme('minimalist', {
      name: 'Minimalista',
      description: 'Tema limpio y minimalista',
      colors: {
        '--bg-color': '#ffffff',
        '--text-color': '#000000',
        '--node-fill': '#fafafa',
        '--label-border': '#e0e0e0',
        '--link-color': '#bdbdbd',
        '--node-stroke-focus': '#000000',
        '--side-panel-bg': '#ffffff',
        '--side-panel-border': '#f5f5f5',
        '--side-panel-header-bg': '#fafafa',
        '--side-panel-text': '#000000',
        '--side-panel-label': '#757575',
        '--side-panel-value': '#000000'
      }
    });
  }

  // Agregar un nuevo tema
  addTheme(id, theme) {
    this.themes.set(id, {
      id: id,
      ...theme
    });
  }

  // Aplicar un tema
  applyTheme(themeId) {
    const theme = this.themes.get(themeId);
    if (!theme) {
      console.warn(`Tema '${themeId}' no encontrado`);
      return;
    }

    this.currentTheme = themeId;
    
    // Aplicar colores CSS
    Object.entries(theme.colors).forEach(([property, value]) => {
      document.documentElement.style.setProperty(property, value);
    });

    // Actualizar selector de temas
    this.updateThemeSelector();
    
    // Guardar preferencia
    localStorage.setItem('swanix-theme', themeId);
    
    // Disparar evento personalizado
    document.dispatchEvent(new CustomEvent('themeChanged', { 
      detail: { theme: theme } 
    }));
  }

  // Obtener tema actual
  getCurrentTheme() {
    return this.themes.get(this.currentTheme);
  }

  // Obtener todos los temas
  getAllThemes() {
    return Array.from(this.themes.values());
  }

  // Crear selector de temas compacto
  initThemeSelector() {
    console.log('🎨 Inicializando selector de temas compacto...');
    
    // Crear contenedor de controles
    const themeControls = document.createElement('div');
    themeControls.className = 'theme-controls';
    
    // Crear dropdown de temas
    const themeSelect = document.createElement('select');
    themeSelect.className = 'theme-select';
    themeSelect.title = 'Seleccionar tema';
    
    // Crear botón de tema aleatorio
    const randomBtn = document.createElement('button');
    randomBtn.className = 'random-theme-btn';
    randomBtn.textContent = '🎲';
    randomBtn.title = 'Tema aleatorio';
    
    // Agregar elementos al contenedor
    themeControls.appendChild(themeSelect);
    themeControls.appendChild(randomBtn);
    
    // Agregar al DOM
    document.body.appendChild(themeControls);
    console.log('✅ Controles de tema creados y agregados al DOM');

    // Evento para cambio de tema
    themeSelect.addEventListener('change', (e) => {
      this.applyTheme(e.target.value);
    });

    // Evento para tema aleatorio
    randomBtn.addEventListener('click', () => {
      const themes = this.getAllThemes();
      const randomTheme = themes[Math.floor(Math.random() * themes.length)];
      this.applyTheme(randomTheme.id);
      themeSelect.value = randomTheme.id;
    });

    // Cargar temas en el dropdown
    this.updateThemeSelector();

    // Cargar tema guardado
    const savedTheme = localStorage.getItem('swanix-theme');
    if (savedTheme && this.themes.has(savedTheme)) {
      this.applyTheme(savedTheme);
    }
  }

  // Actualizar selector de temas
  updateThemeSelector() {
    const themeSelect = document.querySelector('.theme-select');
    if (!themeSelect) {
      console.warn('⚠️ No se encontró el selector de temas');
      return;
    }

    console.log('🔄 Actualizando selector de temas...');
    themeSelect.innerHTML = '';
    
    const allThemes = this.getAllThemes();
    console.log(`📋 Cargando ${allThemes.length} temas en el selector`);
    
    allThemes.forEach(theme => {
      const option = document.createElement('option');
      option.value = theme.id;
      option.textContent = theme.name;
      option.selected = theme.id === this.currentTheme;
      themeSelect.appendChild(option);
    });
  }

  // Crear tema personalizado
  createCustomTheme(name, description, colors) {
    const id = 'custom_' + Date.now();
    this.addTheme(id, {
      name: name,
      description: description,
      colors: colors
    });
    return id;
  }

  // Exportar tema actual
  exportCurrentTheme() {
    const theme = this.getCurrentTheme();
    return {
      name: theme.name,
      description: theme.description,
      colors: { ...theme.colors }
    };
  }

  // Importar tema
  importTheme(themeData) {
    const id = 'imported_' + Date.now();
    this.addTheme(id, themeData);
    return id;
  }
}

// Inicializar el motor de temas cuando el DOM esté listo
function initializeThemeEngine() {
  window.themeEngine = new ThemeEngine();
}

// Asegurar que se inicialice después de que el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeThemeEngine);
} else {
  // Si el DOM ya está cargado, inicializar inmediatamente
  initializeThemeEngine();
} 