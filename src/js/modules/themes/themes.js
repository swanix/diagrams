/**
 * Módulo de Temas para XDiagrams
 * Maneja el cambio entre temas light y dark
 */

export class ThemeManager {
  constructor(options = {}) {
    this.currentTheme = 'dark';
    this.storageKey = 'xdiagrams-theme';
    this.showThemeToggle = options.showThemeToggle !== false; // Por defecto mostrar el toggle
    this.init();
  }

  init() {
    // Cargar tema guardado o usar light por defecto
    this.loadSavedTheme();
    
    // Aplicar el tema actual inmediatamente
    this.applyTheme(this.currentTheme);
    
    // Crear el botón toggle después de que el DOM esté listo
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.createThemeToggle();
      });
    } else {
      this.createThemeToggle();
    }
    
    // También intentar crear el botón después de un delay para asegurar compatibilidad
    setTimeout(() => {
      if (!document.getElementById('theme-toggle')) {
        this.createThemeToggle();
      }
    }, 500);

    // Integrar con el sistema de XDiagrams
    this.integrateWithXDiagrams();
  }

  loadSavedTheme() {
    try {
      const savedTheme = localStorage.getItem(this.storageKey);
      if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
        this.currentTheme = savedTheme;
      } else {
        // Verificar preferencia del sistema
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
          this.currentTheme = 'dark';
        }
        // Si no hay preferencia del sistema, ya está configurado como 'dark' por defecto
      }
    } catch (error) {
      console.warn('No se pudo cargar el tema guardado:', error);
    }
  }

  // Función para limpiar el tema guardado y usar el tema por defecto
  clearSavedTheme() {
    try {
      localStorage.removeItem(this.storageKey);
      this.currentTheme = 'dark';
      this.applyTheme('dark');
      console.log('🎨 Tema guardado limpiado, aplicando tema dark por defecto');
    } catch (error) {
      console.warn('No se pudo limpiar el tema guardado:', error);
    }
  }

  createThemeToggle() {
    // Verificar si debe mostrar el toggle
    if (!this.showThemeToggle) {
      return;
    }
    
    // Verificar si ya existe el botón
    if (document.getElementById('theme-toggle')) {
      return;
    }

    // Crear contenedor de controles de tema
    let themeControls = document.querySelector('.theme-controls');
    if (!themeControls) {
      themeControls = document.createElement('div');
      themeControls.className = 'theme-controls';
      
      // Posicionar en la esquina superior derecha
      themeControls.style.position = 'fixed';
      themeControls.style.top = '20px';
      themeControls.style.right = '20px';
      themeControls.style.zIndex = '1000';
      
      // Agregar al body
      document.body.appendChild(themeControls);
    }

    // Verificar si ya existe un botón toggle en el contenedor
    if (themeControls.querySelector('#theme-toggle')) {
      return;
    }

    // Crear el botón toggle
    const toggleButton = document.createElement('button');
    toggleButton.id = 'theme-toggle';
    toggleButton.className = 'theme-toggle';
    toggleButton.title = 'Cambiar tema';
    toggleButton.innerHTML = `
      <svg class="theme-icon sun-icon" width="18" height="18" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="4" fill="currentColor"></circle>
        <g stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </g>
      </svg>
      <svg class="theme-icon moon-icon" width="18" height="18" viewBox="0 0 24 24">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="currentColor"></path>
      </svg>
    `;

    // Agregar evento click
    toggleButton.addEventListener('click', () => {
      this.toggleTheme();
    });

    // Agregar evento de teclado para accesibilidad
    toggleButton.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.toggleTheme();
      }
    });

    // Insertar el botón en el contenedor
    themeControls.appendChild(toggleButton);
  }

  toggleTheme() {
    const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  setTheme(theme) {
    if (theme !== 'light' && theme !== 'dark') {
      console.warn('Tema no válido:', theme);
      return;
    }

    this.currentTheme = theme;
    
    // Guardar en localStorage
    try {
      localStorage.setItem(this.storageKey, theme);
    } catch (error) {
      console.warn('No se pudo guardar el tema:', error);
    }

    // Aplicar el tema
    this.applyTheme(theme);
  }

  applyTheme(theme) {
    // Remover clases de tema anteriores
    document.body.classList.remove('theme-light', 'theme-dark');
    
    // Agregar la clase del tema actual
    document.body.classList.add(`theme-${theme}`);
    
    // Actualizar el botón toggle
    this.updateToggleButton(theme);
    
    // Disparar evento personalizado
    this.dispatchThemeChangeEvent(theme);
  }

  updateToggleButton(theme) {
    const toggleButton = document.getElementById('theme-toggle');
    if (toggleButton) {
      if (theme === 'dark') {
        toggleButton.classList.add('dark-mode');
      } else {
        toggleButton.classList.remove('dark-mode');
      }
    }
  }

  // Método para mostrar/ocultar el toggle dinámicamente
  setThemeToggleVisibility(show) {
    this.showThemeToggle = show;
    const toggleButton = document.getElementById('theme-toggle');
    const themeControls = document.querySelector('.theme-controls');
    
    if (show) {
      // Mostrar el toggle si no existe
      if (!toggleButton) {
        this.createThemeToggle();
      }
      if (themeControls) {
        themeControls.style.display = 'flex';
      }
    } else {
      // Ocultar el toggle
      if (toggleButton) {
        toggleButton.remove();
      }
      if (themeControls) {
        themeControls.style.display = 'none';
      }
    }
  }

  dispatchThemeChangeEvent(theme) {
    const event = new CustomEvent('themechange', {
      detail: { theme: theme }
    });
    document.dispatchEvent(event);
  }

  getCurrentTheme() {
    return this.currentTheme;
  }

  isLightTheme() {
    return this.currentTheme === 'light';
  }

  isDarkTheme() {
    return this.currentTheme === 'dark';
  }

  // Método para integrar con el sistema de XDiagrams
  integrateWithXDiagrams() {
    // Escuchar eventos del diagrama
    document.addEventListener('diagram-ready', () => {
      this.ensureToggleVisibility();
    });

    // También escuchar cuando el DOM esté completamente cargado
    if (document.readyState === 'complete') {
      this.ensureToggleVisibility();
    } else {
      window.addEventListener('load', () => {
        this.ensureToggleVisibility();
      });
    }
  }

  ensureToggleVisibility() {
    const toggleButton = document.getElementById('theme-toggle');
    if (toggleButton) {
      toggleButton.style.display = 'flex';
      toggleButton.style.visibility = 'visible';
      toggleButton.style.opacity = '1';
    }
  }
}

// Función para inicializar el sistema de temas
export function initThemes(options = {}) {
  const themeManager = new ThemeManager(options);
  
  // Hacer disponible globalmente para compatibilidad
  window.ThemeManager = themeManager;
  
  return themeManager;
}

// Función para obtener la instancia del tema manager
export function getThemeManager() {
  return window.ThemeManager;
}

// Función para cambiar tema directamente
export function setTheme(theme) {
  if (window.ThemeManager) {
    window.ThemeManager.setTheme(theme);
  }
}

// Función para obtener el tema actual
export function getCurrentTheme() {
  if (window.ThemeManager) {
    return window.ThemeManager.getCurrentTheme();
  }
  return 'dark';
}

// Función para verificar si es tema claro
export function isLightTheme() {
  if (window.ThemeManager) {
    return window.ThemeManager.isLightTheme();
  }
  return false;
}

// Función para verificar si es tema oscuro
export function isDarkTheme() {
  if (window.ThemeManager) {
    return window.ThemeManager.isDarkTheme();
  }
  return true;
}

// Función para limpiar el tema guardado
export function clearSavedTheme() {
  if (window.ThemeManager) {
    window.ThemeManager.clearSavedTheme();
  }
}

// Inicializar automáticamente si se importa directamente
if (typeof window !== 'undefined') {
  // Solo inicializar si no existe ya
  if (!window.ThemeManager) {
    // Obtener configuración de XDiagrams si está disponible
    const config = window.$xDiagrams || {};
    const themeOptions = {
      showThemeToggle: config.showThemeToggle !== false
    };
    initThemes(themeOptions);
  }
}
