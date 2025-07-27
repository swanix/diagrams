// Swanix Diagrams - Theme Manager Module
// v0.6.0

// ============================================================================
// THEME MANAGER MODULE
// ============================================================================

// Cache for themes to avoid repeated fetches
let themesCache = null;
let lastThemeFileTimestamp = null;

// Simplified theme system
async function setTheme(themeId, forceReload = false) {
  // Clear previous classes
  document.body.classList.remove('theme-snow', 'theme-onyx', 'theme-vintage', 'theme-pastel', 'theme-neon', 'theme-forest');
  
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
}

// Function to clear theme cache
function clearThemeCache() {
  themesCache = null;
  lastThemeFileTimestamp = null;
  console.log('[Theme System] Cache de temas limpiado');
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
      
      return fallbackThemes[themeId] || fallbackThemes.snow;
    }
  }
  
  return themesCache[themeId] || themesCache.snow;
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
    subtitleColor: computedStyle.getPropertyValue('--text-subtitle-color'),
    imageFilter: computedStyle.getPropertyValue('--image-filter')
  };

  // Apply colors to SVG elements
  d3.selectAll('.link').style('stroke', variables.linkColor);
  d3.selectAll('.node rect').style('fill', variables.nodeFill).style('stroke', variables.labelBorder);
  d3.selectAll('.label-text').style('fill', variables.textColor);
  d3.selectAll('.subtitle-text').style('fill', variables.subtitleColor);
  d3.selectAll('.cluster-rect').style('fill', variables.clusterBg).style('stroke', variables.clusterStroke);
  d3.selectAll('.cluster-title').style('fill', variables.clusterTitleColor);
  
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
  const lightThemes = ['snow', 'vintage', 'pastel'];
  const darkThemes = ['onyx', 'neon', 'forest'];
  
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
  
  // Apply theme
  await setTheme(newTheme);
  
  // Trigger hook
  if (window.triggerHook) {
    window.triggerHook('onThemeChange', { 
      theme: newTheme, 
      timestamp: new Date().toISOString() 
    });
  }
}

// Initialize theme system (SIMPLIFIED - NO INTERFERENCE WITH LOADER)
async function initializeThemeSystem() {
  const config = getThemeConfiguration();
  const storageKey = getStorageKey();
  
  // Ensure themeState is initialized
  if (!window.$xDiagrams.themeState) {
    window.$xDiagrams.themeState = {
      current: 'snow',
      lightTheme: 'snow',
      darkTheme: 'onyx',
      isInitialized: false
    };
  }
  
  // Initialize global state
  window.$xDiagrams.themeState.lightTheme = config.lightTheme;
  window.$xDiagrams.themeState.darkTheme = config.darkTheme;
  
  // Get current theme from localStorage (loader already applied it)
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
  await setTheme(config.lightTheme);
}

// Function to preserve current theme
async function preserveCurrentTheme() {
  const storageKey = getStorageKey();
  const currentTheme = localStorage.getItem(storageKey);
  if (currentTheme) {
    console.log('[Theme System] Preservando tema actual:', currentTheme);
    // Apply current theme without changing localStorage
    const themeVariables = await getThemeVariables(currentTheme);
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
  }
}

// Global function to reload themes (for external use)
window.reloadThemes = async function() {
  console.log('[Theme System] Recargando temas...');
  clearThemeCache();
  
  const storageKey = getStorageKey();
  const currentTheme = localStorage.getItem(storageKey) || 'snow';
  
  // Reapply current theme with fresh data
  await setTheme(currentTheme, true);
  
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
    
    // Create loading overlay if it doesn't exist
    this.createLoadingOverlay();
    
    // Hide main content initially
    this.hideMainContent();
    
    // Start theme initialization
    this.initializeTheme();
    
    // Listen for main app ready signal
    this.listenForAppReady();
  },
  
  // Create loading overlay
  createLoadingOverlay() {
    // Check if loading overlay already exists
    if (document.getElementById('xdiagrams-loading')) {
      this.loadingElement = document.getElementById('xdiagrams-loading');
      return;
    }
    
    // Create loading overlay
    const loadingOverlay = document.createElement('div');
    loadingOverlay.id = 'xdiagrams-loading';
    loadingOverlay.className = 'xdiagrams-loading-overlay';
    loadingOverlay.innerHTML = `
      <div class="xdiagrams-loading-content">
        <div class="xdiagrams-loading-spinner"></div>
        <div class="xdiagrams-loading-text">Cargando diagrama...</div>
      </div>
    `;
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      .xdiagrams-loading-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: var(--canvas-bg, #f6f7f9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        transition: opacity 0.15s ease-out;
        backdrop-filter: blur(1px);
      }
      
      .xdiagrams-loading-content {
        text-align: center;
        color: var(--text-color, #222);
        opacity: 0.8;
      }
      
      .xdiagrams-loading-spinner {
        width: 24px;
        height: 24px;
        border: 2px solid var(--node-stroke, #ccc);
        border-top: 2px solid var(--control-focus, #1976d2);
        border-radius: 50%;
        animation: xdiagrams-spin 0.8s linear infinite;
        margin: 0 auto 12px;
      }
      
      .xdiagrams-loading-text {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        font-weight: 400;
        opacity: 0.7;
      }
      
      @keyframes xdiagrams-spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
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
      
      /* Ocultar elementos de UI durante la carga */
      .xdiagrams-loading-overlay ~ * {
        opacity: 0;
        transition: opacity 0.15s ease-out;
      }
      
      .xdiagrams-loading-overlay ~ .xdiagrams-content-visible {
        opacity: 1;
      }
      
      /* Ocultar específicamente elementos de UI durante carga */
      .xdiagrams-loading-overlay ~ .topbar,
      .xdiagrams-loading-overlay ~ .xdiagrams-topbar,
      .xdiagrams-loading-overlay ~ .xdiagrams-controls,
      .xdiagrams-loading-overlay ~ .theme-toggle,
      .xdiagrams-loading-overlay ~ .diagram-dropdown,
      .xdiagrams-loading-overlay ~ .side-panel,
      .xdiagrams-loading-overlay ~ .keyboard-instructions {
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
    document.body.appendChild(loadingOverlay);
    this.loadingElement = loadingOverlay;
    
    console.log('[Theme Manager] Overlay de carga creado');
  },
  
  // Hide main content initially
  hideMainContent() {
    // Find main content container
    this.mainContent = document.querySelector('.xcanvas') || document.body;
    
    // Add hidden class immediately
    this.mainContent.classList.add('xdiagrams-content-hidden');
    
    // Hide ALL UI elements that might be visible during load
    const uiSelectors = [
      '.topbar', '.side-panel', '.theme-toggle', '.diagram-dropdown',
      '.xdiagrams-topbar', '.xdiagrams-controls', '.xdiagrams-switcher',
      '.keyboard-instructions', '.tooltip', '.cluster-tooltip',
      '.side-panel', '.side-panel-content', '.side-panel-header'
    ];
    
    uiSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        element.style.opacity = '0';
        element.style.visibility = 'hidden';
        element.style.transition = 'opacity 0.15s ease-out, visibility 0.15s ease-out';
      });
    });
    
    // Also hide any elements with specific classes that might be created by xdiagrams
    const xdiagramsElements = document.querySelectorAll('[class*="xdiagrams"], [class*="topbar"], [class*="control"]');
    xdiagramsElements.forEach(element => {
      if (!element.classList.contains('xdiagrams-loading-overlay')) {
        element.style.opacity = '0';
        element.style.visibility = 'hidden';
        element.style.transition = 'opacity 0.15s ease-out, visibility 0.15s ease-out';
      }
    });
    
    console.log('[Theme Manager] Contenido principal y UI ocultos');
  },
  
  // Initialize theme system
  async initializeTheme() {
    try {
      console.log('[Theme Manager] Inicializando tema...');
      
      // Apply essential theme variables immediately
      this.applyEssentialTheme();
      
      // Initialize theme system
      await initializeThemeSystem();
      this.isThemeReady = true;
      console.log('[Theme Manager] Tema inicializado');
      
      this.checkReadyState();
    } catch (error) {
      console.warn('[Theme Manager] Error inicializando tema:', error);
      this.isThemeReady = true; // Continue anyway
      this.checkReadyState();
    }
  },
  
  // Apply essential theme variables immediately
  applyEssentialTheme() {
    const currentTheme = this.getCurrentTheme();
    const essentialVariables = this.getEssentialThemeVariables(currentTheme);
    
    // Apply theme class
    document.body.classList.add('theme-' + currentTheme);
    
    // Apply essential variables
    Object.keys(essentialVariables).forEach(varName => {
      document.documentElement.style.setProperty(varName, essentialVariables[varName]);
      document.body.style.setProperty(varName, essentialVariables[varName]);
    });
    
    // Apply background color to body immediately to prevent flash
    const canvasBg = essentialVariables['--canvas-bg'];
    if (canvasBg) {
      document.body.style.backgroundColor = canvasBg;
      document.body.style.transition = 'background-color 0.15s ease-out';
    }
    
    console.log('[Theme Manager] Variables esenciales aplicadas para:', currentTheme);
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
        currentTheme = 'snow';
      }
    }
    
    return currentTheme || 'snow';
  },
  
  // Get essential theme variables
  getEssentialThemeVariables(themeId) {
    const variables = {
      snow: {
        '--canvas-bg': '#f6f7f9',
        '--text-color': '#222',
        '--node-fill': '#fff',
        '--node-stroke': '#ccc',
        '--control-bg': '#ffffff',
        '--control-text': '#333333',
        '--control-focus': '#1976d2'
      },
      onyx: {
        '--canvas-bg': '#181c24',
        '--text-color': '#f6f7f9',
        '--node-fill': '#23272f',
        '--node-stroke': '#333',
        '--control-bg': '#23272f',
        '--control-text': '#f6f7f9',
        '--control-focus': '#00eaff'
      }
    };
    
    return variables[themeId] || variables.snow;
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
  
  // Show content and hide loading
  showContent() {
    console.log('[Theme Manager] Mostrando contenido...');
    
    // Show main content
    if (this.mainContent) {
      this.mainContent.classList.remove('xdiagrams-content-hidden');
      this.mainContent.classList.add('xdiagrams-content-visible');
    }
    
    // Restore ALL UI elements visibility
    const uiSelectors = [
      '.topbar', '.side-panel', '.theme-toggle', '.diagram-dropdown',
      '.xdiagrams-topbar', '.xdiagrams-controls', '.xdiagrams-switcher',
      '.keyboard-instructions', '.tooltip', '.cluster-tooltip',
      '.side-panel', '.side-panel-content', '.side-panel-header'
    ];
    
    uiSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        element.style.opacity = '1';
        element.style.visibility = 'visible';
        element.style.transition = 'opacity 0.15s ease-out, visibility 0.15s ease-out';
      });
    });
    
    // Restore xdiagrams elements
    const xdiagramsElements = document.querySelectorAll('[class*="xdiagrams"], [class*="topbar"], [class*="control"]');
    xdiagramsElements.forEach(element => {
      if (!element.classList.contains('xdiagrams-loading-overlay')) {
        element.style.opacity = '1';
        element.style.visibility = 'visible';
        element.style.transition = 'opacity 0.15s ease-out, visibility 0.15s ease-out';
      }
    });
    
    // Hide loading overlay quickly
    if (this.loadingElement) {
      this.loadingElement.style.opacity = '0';
      setTimeout(() => {
        if (this.loadingElement && this.loadingElement.parentNode) {
          this.loadingElement.parentNode.removeChild(this.loadingElement);
        }
      }, 150); // Reduced from 300ms to 150ms
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
    current: 'snow',
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