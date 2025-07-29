// Swanix Diagrams - Theme Manager Module
// v0.7.0

// ============================================================================
// THEME MANAGER MODULE
// ============================================================================

// Cache for themes to avoid repeated fetches
let themesCache = null;
let lastThemeFileTimestamp = null;

// Simplified theme system
async function setTheme(themeId, forceReload = false, disableTransitions = true) {
  // Only disable transitions if explicitly requested (for theme toggle)
  const originalTransitions = disableTransitions ? disableAllTransitions() : null;
  
  try {
      // Clear previous classes
  document.body.classList.remove('theme-snow', 'theme-onyx');
    
    // Apply new class
    document.body.classList.add('theme-' + themeId);
    
    // Save theme with unique key per file
    const storageKey = getStorageKey();
    localStorage.setItem(storageKey, themeId);
    
    // Also save to global theme preference for better persistence
    localStorage.setItem('selectedTheme', themeId);
    localStorage.setItem('themeMode', isLightTheme(themeId) ? 'light' : 'dark');
    
    console.log('[Theme System] Tema guardado:', themeId, 'en clave:', storageKey, 'y global');
    
    // Clear cache before applying theme
    if (window.$xDiagrams && window.$xDiagrams.clearCache) {
      window.$xDiagrams.clearCache();
    }
    
    // Apply theme CSS variables (with force reload if requested)
    const themeVariables = await getThemeVariables(themeId, forceReload);
    const targetElement = document.querySelector('.xcanvas') || document.documentElement;
    
    Object.keys(themeVariables).forEach(varName => {
      targetElement.style.setProperty(varName, themeVariables[varName]);
      document.body.style.setProperty(varName, themeVariables[varName]);
      document.documentElement.style.setProperty(varName, themeVariables[varName]);
    });
    
    // Update SVG colors
    updateSVGColors();
    
    // Update switcher colors
    updateSwitcherColors();
    
    // Trigger onThemeChange hook
    if (window.triggerHook) {
      window.triggerHook('onThemeChange', { 
        theme: themeId, 
        timestamp: new Date().toISOString() 
      });
    }
  } finally {
    // Re-enable transitions only if they were disabled
    if (originalTransitions) {
      setTimeout(() => {
        restoreTransitions(originalTransitions);
      }, 50);
    }
  }
}

// Function to clear theme cache
function clearThemeCache() {
  themesCache = null;
  lastThemeFileTimestamp = null;
  console.log('[Theme System] Cache de temas limpiado');
}

// Disable all transitions temporarily for instant theme changes
function disableAllTransitions() {
  const elements = document.querySelectorAll('*');
  const originalTransitions = new Map();
  
  elements.forEach(element => {
    const computedStyle = window.getComputedStyle(element);
    const transition = computedStyle.transition;
    
    if (transition && transition !== 'none' && transition !== 'all 0s ease 0s') {
      originalTransitions.set(element, transition);
      element.style.transition = 'none';
    }
  });
  
  console.log('[Theme System] Transiciones deshabilitadas temporalmente para cambio de tema');
  return originalTransitions;
}

// Restore original transitions
function restoreTransitions(originalTransitions) {
  originalTransitions.forEach((transition, element) => {
    element.style.transition = transition;
  });
  
  console.log('[Theme System] Transiciones restauradas');
}

// Get theme variables from external JSON file
async function getThemeVariables(themeId, forceReload = false) {
  // Check if we need to reload themes (force reload or no cache)
  if (forceReload || !themesCache) {
    try {
      // Load themes from external JSON file (try xthemes.json first, then themes.json as fallback)
      let response = await fetch('xthemes.json');
      if (!response.ok) {
        console.log('[Theme System] xthemes.json no encontrado, intentando themes.json...');
        response = await fetch('themes.json');
        if (!response.ok) {
          throw new Error(`Failed to load themes: ${response.status}`);
        }
      }
      
      // Check if file has changed (using Last-Modified header)
      const lastModified = response.headers.get('Last-Modified');
      if (lastModified && lastThemeFileTimestamp && lastModified !== lastThemeFileTimestamp) {
        console.log('[Theme System] Archivo de temas modificado, recargando...');
        forceReload = true;
      }
      
      if (forceReload || !themesCache) {
        themesCache = await response.json();
        lastThemeFileTimestamp = lastModified;
        console.log('[Theme System] Temas cargados desde archivo:', forceReload ? 'recarga forzada' : 'carga inicial');
      }
    } catch (error) {
      console.warn('Error loading themes from JSON, using fallback:', error);
      
      // Fallback to basic theme if JSON loading fails
      const fallbackThemes = {
        snow: {
          '--canvas-bg': '#f6f7f9',
          '--text-color': '#222',
          '--node-fill': '#fff',
          '--control-bg': '#ffffff',
          '--control-text': '#333333',
          '--control-focus': '#1976d2'
        },
        onyx: {
          '--canvas-bg': '#181c24',
          '--text-color': '#f6f7f9',
          '--node-fill': '#23272f',
          '--control-bg': '#23272f',
          '--control-text': '#f6f7f9',
          '--control-focus': '#00eaff'
        }
      };
      
      let fallbackVariables = fallbackThemes[themeId] || fallbackThemes.snow;
      
      // PRIORIDAD ABSOLUTA: Aplicar color base incluso en fallback
      if (window.$xDiagrams && window.$xDiagrams.colorBase) {
        const customColorBase = window.$xDiagrams.colorBase;
        console.log('[Theme System] PRIORIDAD ABSOLUTA: Aplicando color base en fallback:', customColorBase);
        
        // Crear una copia del objeto para no modificar el original
        fallbackVariables = { ...fallbackVariables };
        
        // Agregar la variable --color-base al fallback
        fallbackVariables['--color-base'] = customColorBase;
      }
      
      return fallbackVariables;
    }
  }
  
  let themeVariables = themesCache[themeId] || themesCache.snow;
  
  // PRIORIDAD ABSOLUTA: Aplicar configuración personalizada de color base
  // Esta configuración SOBRESCRIBE cualquier valor definido en el tema
  if (window.$xDiagrams && window.$xDiagrams.colorBase) {
    const customColorBase = window.$xDiagrams.colorBase;
    console.log('[Theme System] PRIORIDAD ABSOLUTA: Aplicando color base personalizado:', customColorBase, 'sobre tema:', themeId);
    
    // Crear una copia del objeto para no modificar el original
    themeVariables = { ...themeVariables };
    
    // SOBRESCRIBIR la variable --color-base con prioridad absoluta
    themeVariables['--color-base'] = customColorBase;
    
    // También sobrescribir variables relacionadas que podrían usar el color base del tema
    // Esto asegura que no haya conflictos con valores hardcodeados
    if (themeId === 'snow') {
      // Para tema snow, asegurar que todas las variables usen el color base personalizado
      themeVariables['--app-bg'] = `hsl(${customColorBase} 100% / 1)`;
      themeVariables['--canvas-bg'] = `hsl(${customColorBase} 98% / 1)`;
      themeVariables['--node-fill'] = `hsl(${customColorBase} 100% / 1)`;
      themeVariables['--node-stroke'] = `hsl(${customColorBase} 60% / 1)`;
      themeVariables['--node-connector'] = `hsl(${customColorBase} 60% / 1)`;
      themeVariables['--cluster-bg'] = `hsl(${customColorBase} 90% / 1)`;
      themeVariables['--ui-panel-bg'] = `hsl(${customColorBase} 100% / 1)`;
      themeVariables['--ui-panel-border'] = `hsl(${customColorBase} 95% / 1)`;
      themeVariables['--loading-bg'] = `hsl(${customColorBase} 95% / 1)`;
      themeVariables['--loading-color'] = `hsl(${customColorBase} 40% / 1)`;
    } else if (themeId === 'onyx') {
      // Para tema onyx, aplicar el color base personalizado manteniendo la oscuridad
      themeVariables['--app-bg'] = `hsl(${customColorBase} 10% / 1)`;
      themeVariables['--canvas-bg'] = `hsl(${customColorBase} 10% / 1)`;
      themeVariables['--node-fill'] = `hsl(${customColorBase} 17% / 1)`;
      themeVariables['--node-stroke'] = `hsl(${customColorBase} 30% / 1)`;
      themeVariables['--node-connector'] = `hsl(${customColorBase} 35% / 1)`;
      themeVariables['--cluster-bg'] = `hsl(${customColorBase} 35% / 0.1)`;
      themeVariables['--ui-panel-bg'] = `hsl(${customColorBase} 12% / 1)`;
      themeVariables['--ui-panel-border'] = `hsl(${customColorBase} 20% / 1)`;
      themeVariables['--loading-bg'] = `hsl(${customColorBase} 9% / 1)`;
      themeVariables['--loading-color'] = `hsl(${customColorBase} 60% / 1)`;
    }
  }
  
  return themeVariables;
}

// Update SVG colors
function updateSVGColors() {
  const computedStyle = getComputedStyle(document.documentElement);
  
  const variables = {
    textColor: computedStyle.getPropertyValue('--text-color'),
    nodeFill: computedStyle.getPropertyValue('--node-fill'),
    labelBorder: computedStyle.getPropertyValue('--node-stroke'),
    linkColor: computedStyle.getPropertyValue('--node-connector'),
    clusterBg: computedStyle.getPropertyValue('--cluster-bg'),
    clusterStroke: computedStyle.getPropertyValue('--cluster-stroke'),
    clusterTitleColor: computedStyle.getPropertyValue('--cluster-title-color'),
    subtitleColor: computedStyle.getPropertyValue('--node-text-secondary'),
    imageFilter: computedStyle.getPropertyValue('--image-filter')
  };

  // Apply colors to SVG elements
  d3.selectAll('.link').style('stroke', variables.linkColor);
  // Node styles are now handled by CSS variables, no need for inline styles
  d3.selectAll('.label-text').style('fill', variables.textColor);
  // Subtitle text styles are now handled by CSS variables, no need for inline styles
  d3.selectAll('.cluster-rect').style('fill', variables.clusterBg).style('stroke', variables.clusterStroke);
  // Cluster titles are now handled by CSS variables, no need for inline styles
  
  // Update image filters
  updateImageFilters(variables.imageFilter);
}

// Update image filters for all images with image-filter class
function updateImageFilters(filterValue) {
  console.log('[Image Filter] Aplicando filtro:', filterValue);
  
  // Verificar que el filtro no esté vacío
  if (!filterValue || filterValue.trim() === '') {
    console.warn('[Image Filter] Filtro vacío, no se aplicará');
    return;
  }
  
  // En lugar de aplicar estilos inline, usar variables CSS
  // Esto permite que el filtro se actualice automáticamente cuando cambie el tema
  const imagesWithFilter = document.querySelectorAll('.image-filter');
  console.log('[Image Filter] Encontradas', imagesWithFilter.length, 'imágenes con clase image-filter');
  
  // Remover cualquier estilo inline previo y limpiar clases incorrectas
  imagesWithFilter.forEach((img, index) => {
    img.style.removeProperty('filter');
    const imgSrc = img.src || img.href || 'unknown';
    console.log(`[Image Filter] Estilo inline removido de imagen ${index + 1} (${imgSrc})`);
    
    // Verificar si es una imagen externa que no debería tener filtro
    if (imgSrc.match(/^https?:\/\//i)) {
      console.log(`[Image Filter] ⚠️  ADVERTENCIA: Imagen externa con clase image-filter: ${imgSrc}`);
      console.log(`[Image Filter] Removiendo clase image-filter de imagen externa: ${imgSrc}`);
      img.classList.remove('image-filter');
    }
  });
  
  // También remover estilos inline del side panel
  const sidePanelImages = document.querySelectorAll('.side-panel-title-thumbnail');
  sidePanelImages.forEach((img, index) => {
    img.style.removeProperty('filter');
    console.log(`[Image Filter] Estilo inline removido de side panel imagen ${index + 1}`);
  });
  
  // Agregar regla CSS que use la variable --image-filter
  const styleId = 'image-filter-css-rule';
  let existingStyle = document.getElementById(styleId);
  if (existingStyle) {
    existingStyle.remove();
  }
  
  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    .image-filter {
      filter: var(--image-filter) !important;
    }
    .side-panel-title-thumbnail {
      filter: var(--image-filter) !important;
    }
  `;
  document.head.appendChild(style);
  
  console.log('[Image Filter] Regla CSS agregada usando variable --image-filter');
  console.log('[Image Filter] Valor actual de --image-filter:', filterValue);
}

// Update switcher colors
function updateSwitcherColors() {
  // This function is no longer needed as CSS handles all styling
  // The diagram buttons now use CSS variables for consistent theming
  console.log('[Theme] Switcher colors are now handled by CSS variables');
}

// Generate unique key for localStorage based on file URL
function getStorageKey() {
  const path = window.location.pathname;
  const filename = path.split('/').pop() || 'index.html';
  const key = `selectedTheme_${filename}`;
  console.log('[Storage Key] Generada clave:', key, 'para archivo:', filename);
  return key;
}

// Get theme configuration with modern style fallback
function getThemeConfiguration() {
  // Try to get configuration from main module
  if (window.getXDiagramsConfiguration) {
    const config = window.getXDiagramsConfiguration();
    
    // Try modern configuration first
    if (config.themes) {
      return {
        lightTheme: config.themes.light || 'snow',
        darkTheme: config.themes.dark || 'onyx'
      };
    }
  }
  
  // Fallback to legacy configuration
  return getThemeConfigurationLegacy();
}

// Legacy theme configuration (for backward compatibility)
function getThemeConfigurationLegacy() {
  const container = document.querySelector('.xcanvas');
  if (!container) {
    return { lightTheme: 'snow', darkTheme: 'onyx' };
  }

  // Try to get JSON configuration first
  const jsonConfig = container.getAttribute('data-themes');
  if (jsonConfig) {
    try {
      const customConfig = JSON.parse(jsonConfig);
      return {
        lightTheme: customConfig.light || 'snow',
        darkTheme: customConfig.dark || 'onyx'
      };
    } catch (error) {
      console.warn('Error parsing data-themes JSON:', error);
    }
  }

  // Fallback to individual attributes
  return {
    lightTheme: container.getAttribute('data-light-theme') || 'snow',
    darkTheme: container.getAttribute('data-dark-theme') || 'onyx'
  };
}

// Determine if a theme is light or dark
function isLightTheme(themeId) {
  const lightThemes = ['snow'];
  const darkThemes = ['onyx'];
  
  // If explicitly defined as dark, return false
  if (darkThemes.includes(themeId)) {
    return false;
  }
  
  // If explicitly defined as light, return true
  if (lightThemes.includes(themeId)) {
    return true;
  }
  
  // Default: assume light theme
  return true;
}

// Get opposite theme based on configuration
function getOppositeTheme(currentTheme, config) {
  const isLight = isLightTheme(currentTheme);
  return isLight ? config.darkTheme : config.lightTheme;
}

// Simple theme toggle function
async function toggleTheme() {
  const state = window.$xDiagrams.themeState;
  const currentTheme = state.current;
  const isCurrentLight = isLightTheme(currentTheme);
  const newTheme = isCurrentLight ? state.darkTheme : state.lightTheme;
  
  // Update state
  state.current = newTheme;
  
  // Save to localStorage FIRST (before applying theme)
  const storageKey = getStorageKey();
  localStorage.setItem(storageKey, newTheme);
  localStorage.setItem('selectedTheme', newTheme);
  localStorage.setItem('themeMode', isLightTheme(newTheme) ? 'light' : 'dark');
  
  // Apply theme with transitions disabled for instant change
  await setTheme(newTheme, false, true);
  
  // Trigger hook
  if (window.triggerHook) {
    window.triggerHook('onThemeChange', { 
      theme: newTheme, 
      timestamp: new Date().toISOString() 
    });
  }
}

// Initialize theme system
async function initializeThemeSystem() {
  const config = getThemeConfiguration();
  const storageKey = getStorageKey();
  
  // Ensure themeState is initialized
  if (!window.$xDiagrams.themeState) {
    window.$xDiagrams.themeState = {
      current: 'onyx',
      lightTheme: 'snow',
      darkTheme: 'onyx',
      isInitialized: false
    };
  }
  
  // Initialize global state
  window.$xDiagrams.themeState.lightTheme = config.lightTheme;
  window.$xDiagrams.themeState.darkTheme = config.darkTheme;
  
  // Get current theme from localStorage
  const savedTheme = localStorage.getItem(storageKey);
  const currentTheme = savedTheme || config.lightTheme;
  
  // Update state
  window.$xDiagrams.themeState.current = currentTheme;
  
  // Setup theme toggle
  setupThemeToggle();
  
  // Setup theme file watcher for automatic reloading
  setupThemeFileWatcher();
  
  window.$xDiagrams.themeState.isInitialized = true;
}

// Setup theme toggle button
function setupThemeToggle() {
  const themeToggle = document.getElementById('theme-toggle');
  if (!themeToggle) {
    console.warn('[XTheme] Botón de tema no encontrado');
    return;
  }
  
  // Remove existing listeners by cloning
  const newToggle = themeToggle.cloneNode(true);
  themeToggle.parentNode.replaceChild(newToggle, themeToggle);
  
  // Add new listener
  newToggle.addEventListener('click', async function(e) {
    e.preventDefault();
    e.stopPropagation();
    await toggleTheme();
  });
}

// Function to force default light theme
async function forceDefaultLightTheme() {
  const config = getThemeConfiguration();
  const storageKey = getStorageKey();
  localStorage.removeItem(storageKey);
  localStorage.setItem(`themeSystemInitialized_${storageKey}`, 'true');
  console.log('[Theme System] Forzando tema claro por defecto:', config.lightTheme);
  await setTheme(config.lightTheme, false, false);
}

// Function to preserve current theme
async function preserveCurrentTheme() {
  const storageKey = getStorageKey();
  const currentTheme = localStorage.getItem(storageKey);
  if (currentTheme) {
    console.log('[Theme System] Preservando tema actual:', currentTheme);
    // Apply current theme without changing localStorage and without disabling transitions
    await setTheme(currentTheme, false, false);
  }
}

// Global function to reload themes (for external use)
window.reloadThemes = async function() {
  console.log('[Theme System] Recargando temas...');
  clearThemeCache();
  
  const storageKey = getStorageKey();
      const currentTheme = localStorage.getItem(storageKey) || 'onyx';
  
  // Reapply current theme with fresh data, without disabling transitions
  await setTheme(currentTheme, true, false);
  
  console.log('[Theme System] Temas recargados exitosamente');
  return true;
};

// Function to check for theme file changes periodically
function setupThemeFileWatcher() {
  // Check for changes every 5 seconds
  setInterval(async () => {
    try {
      const response = await fetch('xthemes.json', { method: 'HEAD' });
      if (response.ok) {
        const lastModified = response.headers.get('Last-Modified');
        if (lastModified && lastThemeFileTimestamp && lastModified !== lastThemeFileTimestamp) {
          console.log('[Theme System] Cambios detectados en xthemes.json, recargando...');
          await window.reloadThemes();
        }
      }
    } catch (error) {
      // Silently ignore errors in file watching
    }
  }, 5000);
}

// ============================================================================
// LOADING MANAGEMENT (INTEGRATED)
// ============================================================================
// Integrated loading management to prevent FOUC without external dependencies

// Loading state management
const LoadingState = {
  isInitialized: false,
  isThemeReady: false,
  isMainAppReady: false,
  loadingElement: null,
  mainContent: null,
  
  // Initialize loading state
  init() {
    console.log('[Theme Manager] Inicializando sistema de carga...');
    
    // Record start time for minimum display duration
    this.startTime = Date.now();
    
    // NO crear overlay propio, usar solo el spinner inicial del HTML
    this.createLoadingOverlay();
    
    // Hide main content initially (pero preservar spinner inicial)
    this.hideMainContent();
    
    // Start theme initialization
    this.initializeTheme();
    
    // Listen for main app ready signal
    this.listenForAppReady();
  },
  
  // Create loading overlay - MODIFICADO para usar spinner inicial
  createLoadingOverlay() {
    // No crear overlay propio, usar el spinner inicial del HTML
    console.log('[Theme Manager] Usando spinner inicial del HTML');
    
    // Solo agregar estilos para ocultar elementos de UI durante la carga
    const style = document.createElement('style');
    style.textContent = `
      /* Ocultar elementos de UI durante la carga con fondo transparente */
      .xdiagrams-content-hidden {
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.2s ease-in, visibility 0.2s ease-in;
      }
      
      .xdiagrams-content-visible {
        opacity: 1;
        visibility: visible;
        transition: opacity 0.15s ease-out, visibility 0.15s ease-out;
      }
      
      /* Ocultar específicamente elementos de UI durante carga con fondo transparente */
      .xdiagrams-content-hidden .topbar,
      .xdiagrams-content-hidden .xdiagrams-topbar,
      .xdiagrams-content-hidden .xdiagrams-controls,
      .xdiagrams-content-hidden .theme-toggle,
      .xdiagrams-content-hidden .diagram-dropdown,
      .xdiagrams-content-hidden .side-panel,
      .xdiagrams-content-hidden .keyboard-instructions {
        opacity: 0 !important;
        visibility: hidden !important;
        transition: opacity 0.15s ease-out, visibility 0.15s ease-out !important;
      }
      
      /* Asegurar que el body tenga el color de fondo correcto inmediatamente */
      body {
        background: var(--canvas-bg, #f6f7f9) !important;
        transition: background-color 0.15s ease-out !important;
      }
    `;
    
    document.head.appendChild(style);
    
    // No crear elemento de loading, usar el spinner inicial
    this.loadingElement = null;
  },
  
  // Hide main content initially - MODIFICADO para permitir spinner inicial
  hideMainContent() {
    // Find main content container
    this.mainContent = document.querySelector('.xcanvas') || document.body;
    
    // Add hidden class immediately
    this.mainContent.classList.add('xdiagrams-content-hidden');
    
    // Solo ocultar elementos de UI específicos, NO el spinner inicial
    const uiSelectors = [
      '.topbar', '.side-panel', '.theme-toggle', '.diagram-dropdown',
      '.xdiagrams-topbar', '.xdiagrams-controls', '.xdiagrams-switcher',
      '.keyboard-instructions', '.tooltip', '.cluster-tooltip',
      '.side-panel', '.side-panel-content', '.side-panel-header'
    ];
    
    uiSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        // NO ocultar el spinner inicial
        if (!element.id || !element.id.includes('initial-loading')) {
          element.style.opacity = '0';
          element.style.visibility = 'hidden';
          element.style.transition = 'opacity 0.15s ease-out, visibility 0.15s ease-out';
        }
      });
    });
    
    // Solo ocultar elementos xdiagrams específicos, NO el spinner inicial
    const xdiagramsElements = document.querySelectorAll('[class*="xdiagrams"], [class*="topbar"], [class*="control"]');
    xdiagramsElements.forEach(element => {
      // NO ocultar el spinner inicial
      if (!element.id || !element.id.includes('initial-loading')) {
        element.style.opacity = '0';
        element.style.visibility = 'hidden';
        element.style.transition = 'opacity 0.15s ease-out, visibility 0.15s ease-out';
      }
    });
    
    console.log('[Theme Manager] Contenido principal y UI ocultos (spinner inicial preservado)');
  },
  
  // Initialize theme system
  async initializeTheme() {
    try {
      console.log('[Theme Manager] Inicializando tema...');
      
      // Initialize theme system first
      await initializeThemeSystem();
      
      // Apply complete theme styles from xthemes.json immediately (skip essential)
      await this.applyCompleteThemeStyles();
      
      this.isThemeReady = true;
      console.log('[Theme Manager] Tema completamente inicializado');
      
      this.checkReadyState();
    } catch (error) {
      console.warn('[Theme Manager] Error inicializando tema:', error);
      // Fallback to essential theme if complete theme fails
      this.applyEssentialTheme();
      this.isThemeReady = true;
      this.checkReadyState();
    }
  },
  
  // Apply essential theme variables immediately
  applyEssentialTheme() {
    const currentTheme = this.getCurrentTheme();
    
    // Only apply theme class - all variables come from CSS base and xthemes.json
    document.body.classList.add('theme-' + currentTheme);
    
    console.log('[Theme Manager] Clase de tema aplicada:', currentTheme);
  },
  
  // Get current theme from localStorage
  getCurrentTheme() {
    const path = window.location.pathname;
    const filename = path.split('/').pop() || 'index.html';
    const storageKey = `selectedTheme_${filename}`;
    
    let currentTheme = localStorage.getItem(storageKey);
    
    if (!currentTheme) {
      currentTheme = localStorage.getItem('selectedTheme');
    }
    
    if (!currentTheme) {
      const themeMode = localStorage.getItem('themeMode');
      if (themeMode === 'dark') {
        currentTheme = 'onyx';
      } else {
        currentTheme = 'onyx';
      }
    }
    
    return currentTheme || 'onyx';
  },
  
  // Get essential theme variables - now returns empty object since we rely on CSS base
  getEssentialThemeVariables(themeId) {
    // Return empty object - all variables come from CSS base and xthemes.json
    return {};
  },
  
  // Apply complete theme styles from xthemes.json
  async applyCompleteThemeStyles() {
    try {
      const currentTheme = this.getCurrentTheme();
      console.log('[Theme Manager] Aplicando estilos completos para:', currentTheme);
      
      // Apply theme without disabling transitions during initial load
      await setTheme(currentTheme, false, false);
      
      console.log('[Theme Manager] Estilos completos aplicados exitosamente');
    } catch (error) {
      console.warn('[Theme Manager] Error aplicando estilos completos:', error);
    }
  },
  
  // Wait for SVG elements to be fully styled
  async waitForSVGStyles() {
    return new Promise((resolve) => {
      const maxAttempts = 50; // 5 seconds max
      let attempts = 0;
      
      const checkSVGStyles = () => {
        attempts++;
        
        // Check if SVG exists and has content
        const svg = document.getElementById('main-diagram-svg');
        if (!svg || svg.children.length === 0) {
          if (attempts < maxAttempts) {
            setTimeout(checkSVGStyles, 100);
          } else {
            console.log('[Theme Manager] SVG no encontrado, continuando...');
            resolve();
          }
          return;
        }
        
        // Check if cluster elements have been styled
        const clusterRects = svg.querySelectorAll('.cluster-rect');
        const clusterTitles = svg.querySelectorAll('.cluster-title');
        const labelTexts = svg.querySelectorAll('.label-text');
        
        if (clusterRects.length > 0 || clusterTitles.length > 0 || labelTexts.length > 0) {
          // Force a reflow to ensure styles are applied
          svg.offsetHeight;
          
          // Apply SVG colors one more time to ensure they're applied
          updateSVGColors();
          
          // Small delay to ensure all styles are rendered
          setTimeout(() => {
            console.log('[Theme Manager] Estilos SVG aplicados y verificados');
            resolve();
          }, 100);
        } else {
          if (attempts < maxAttempts) {
            setTimeout(checkSVGStyles, 100);
          } else {
            console.log('[Theme Manager] Timeout esperando estilos SVG, continuando...');
            resolve();
          }
        }
      };
      
      checkSVGStyles();
    });
  },
  
  // Wait for diagram to be fully loaded and styled
  async waitForDiagramComplete() {
    return new Promise((resolve) => {
      const maxAttempts = 100; // 10 seconds max
      let attempts = 0;
      
      const checkDiagramComplete = () => {
        attempts++;
        
        // Check if diagram is still loading
        if (window.$xDiagrams && window.$xDiagrams.isLoading) {
          if (attempts < maxAttempts) {
            setTimeout(checkDiagramComplete, 100);
          } else {
            console.log('[Theme Manager] Timeout esperando carga del diagrama, continuando...');
            resolve();
          }
          return;
        }
        
        // Check if SVG is visible and has content
        const svg = document.getElementById('main-diagram-svg');
        if (svg && svg.classList.contains('loaded') && svg.children.length > 0) {
          // Wait a bit more for final styling
          setTimeout(() => {
            console.log('[Theme Manager] Diagrama completamente cargado y estilizado');
            resolve();
          }, 200);
        } else {
          if (attempts < maxAttempts) {
            setTimeout(checkDiagramComplete, 100);
          } else {
            console.log('[Theme Manager] Timeout esperando SVG cargado, continuando...');
            resolve();
          }
        }
      };
      
      checkDiagramComplete();
    });
  },
  
  // Listen for main app ready signal
  listenForAppReady() {
    // Check if main app is already ready
    if (window.$xDiagrams && window.$xDiagrams.isInitialized) {
      this.isMainAppReady = true;
      this.checkReadyState();
      return;
    }
    
    // Listen for diagram ready event
    window.addEventListener('xdiagrams-diagram-ready', (event) => {
      console.log('[Theme Manager] Diagrama listo detectado:', event.detail);
      this.isMainAppReady = true;
      this.checkReadyState();
    });
    
    // Listen for initialization
    const checkAppReady = () => {
      // Check multiple conditions for app readiness
      const hasXDiagrams = window.$xDiagrams;
      const isInitialized = window.$xDiagrams?.isInitialized;
      const hasLoadedDiagrams = window.$xDiagrams?.loadedDiagrams?.size > 0;
      const hasCurrentUrl = window.$xDiagrams?.currentUrl;
      
      if (hasXDiagrams && (isInitialized || hasLoadedDiagrams || hasCurrentUrl)) {
        this.isMainAppReady = true;
        console.log('[Theme Manager] Aplicación principal lista', {
          isInitialized,
          hasLoadedDiagrams,
          hasCurrentUrl
        });
        this.checkReadyState();
      } else {
        // Timeout after 5 seconds to prevent infinite waiting
        if (this.appReadyTimeout) {
          clearTimeout(this.appReadyTimeout);
        }
        this.appReadyTimeout = setTimeout(() => {
          console.log('[Theme Manager] Timeout esperando aplicación principal, continuando...');
          this.isMainAppReady = true;
          this.checkReadyState();
        }, 5000);
        
        setTimeout(checkAppReady, 100);
      }
    };
    
    checkAppReady();
  },
  
  // Check if everything is ready
  checkReadyState() {
    if (this.isThemeReady && this.isMainAppReady && !this.isInitialized) {
      console.log('[Theme Manager] Todo listo, verificando tiempo mínimo de display...');
      
      // Calculate minimum display time (2 seconds from start)
      const elapsed = Date.now() - this.startTime;
      const minDisplayTime = 2000; // 2 seconds
      const remainingTime = Math.max(0, minDisplayTime - elapsed);
      
      if (remainingTime > 0) {
        console.log(`[Theme Manager] Esperando ${remainingTime}ms más para completar 2s mínimo de display`);
        setTimeout(() => this.showContent(), remainingTime);
      } else {
        console.log('[Theme Manager] Tiempo mínimo cumplido, mostrando contenido inmediatamente');
        this.showContent();
      }
    }
  },
  
  // Show content and hide loading - MODIFICADO para manejar spinner inicial
  async showContent() {
    console.log('[Theme Manager] Mostrando contenido...');
    
    // Ensure complete theme styles are applied before showing content
    if (!this.themeStylesApplied) {
      await this.applyCompleteThemeStyles();
      this.themeStylesApplied = true;
    }
    
    // Wait for diagram to be fully loaded and styled
    await this.waitForDiagramComplete();
    
    // Show main content
    if (this.mainContent) {
      this.mainContent.classList.remove('xdiagrams-content-hidden');
      this.mainContent.classList.add('xdiagrams-content-visible');
    }
    
    // Mostrar el topbar cuando se complete la carga
    const topbar = document.querySelector('.topbar');
    if (topbar) {
      topbar.classList.add('loaded');
    }
    
    // Content visibility is now handled by CSS when theme class is applied
    // No need to manually set opacity/visibility
    
    // El spinner inicial se maneja desde xdiagrams.js, no aquí
    // Solo ocultar el overlay propio si existe
    if (this.loadingElement) {
      this.loadingElement.style.opacity = '0';
      setTimeout(() => {
        if (this.loadingElement && this.loadingElement.parentNode) {
          this.loadingElement.parentNode.removeChild(this.loadingElement);
        }
      }, 150);
    }
    
    this.isInitialized = true;
    console.log('[Theme Manager] Carga completada');
    
    // Trigger ready event
    window.dispatchEvent(new CustomEvent('xdiagrams-ready'));
  },
  
  // Force show content (for debugging)
  forceShow() {
    console.log('[Theme Manager] Forzando mostrar contenido');
    this.isThemeReady = true;
    this.isMainAppReady = true;
    this.showContent();
  }
};

// ============================================================================
// MODULE EXPORTS
// ============================================================================

// Export all theme manager functions
window.ThemeManager = {
  setTheme,
  clearThemeCache,
  getThemeVariables,
  updateSVGColors,
  updateImageFilters,
  updateSwitcherColors,
  getStorageKey,
  getThemeConfiguration,
  getThemeConfigurationLegacy,
  isLightTheme,
  getOppositeTheme,
  toggleTheme,
  initializeThemeSystem,
  setupThemeToggle,
  forceDefaultLightTheme,
  preserveCurrentTheme,
  setupThemeFileWatcher,
  reloadThemes: window.reloadThemes,
  // Loading management functions
  forceShow: () => LoadingState.forceShow()
};

// Initialize global theme state if not exists
if (!window.$xDiagrams) {
  window.$xDiagrams = {};
}

if (!window.$xDiagrams.themeState) {
  window.$xDiagrams.themeState = {
    current: 'onyx',
    lightTheme: 'snow',
    darkTheme: 'onyx',
    isInitialized: false
  };
}

// Mark main app as initialized when theme system is ready
window.$xDiagrams.isInitialized = true;

// Auto-initialize loading system when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    LoadingState.init();
  });
} else {
  LoadingState.init();
}

console.log('[Theme Manager] Módulo cargado exitosamente'); 