// Swanix Diagrams - THEME LOADER JS
// v0.6.0

// Theme Loader - Applies the saved theme before the main CSS loads
// This file must be loaded BEFORE xdiagrams.css to avoid FOUC (flash of unstyled content)

(function() {
  'use strict';
  
  // Generate a unique localStorage key based on the file URL
  function getStorageKey() {
    const path = window.location.pathname;
    const filename = path.split('/').pop() || 'index.html';
    return `xdiagrams-theme-${filename}`;
  }
  
  // Get theme configuration from HTML
  function getThemeConfiguration() {
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
  
  // Essential CSS variables for immediate application (prevents flash)
  // Updated to match xthemes.json colors including semi-transparent elements
  const essentialThemeVariables = {
    snow: {
      '--color-base-h': '0',
      '--color-base-s': '0%',
      '--color-base-l': '0%',
      '--color-base': 'var(--color-base-h) var(--color-base-s)',
      '--app-bg': 'hsl(var(--color-base) 100% / 1)',
      '--canvas-bg': 'hsl(var(--color-base) 98% / 1)',
      '--text-color': '#222',
      '--node-fill': 'hsl(var(--color-base) 100% / 1)',
      '--node-stroke': 'hsl(var(--color-base) 60% / 1)',
      '--node-connector': 'hsl(var(--color-base) 60% / 1)',
      '--cluster-bg': 'hsl(var(--color-base) 90% / 1)',
      '--cluster-stroke': 'rgba(0,0,0,0.1)',
      '--cluster-title-color': '#222',
      '--cluster-title-bg': 'rgba(255, 255, 255, 0.9)',
      '--cluster-hover-bg': 'rgba(25, 118, 210, 0.15)',
      '--cluster-hover-stroke': '#1976d2',
      '--cluster-hover-title-color': '#1976d2',
      '--cluster-selected-bg': 'hsl(var(--color-base) 85% / 1)',
      '--cluster-selected-stroke': 'var(--cluster-stroke)',
      '--cluster-selected-title-color': '#222',
      '--ui-panel-bg': 'hsl(var(--color-base) 100% / 1)',
      '--ui-panel-border': 'hsl(var(--color-base) 95% / 1)',
      '--ui-panel-text': '#222',
      '--ui-panel-text-muted': '#666',
      '--ui-control-padding': '15px',
      '--ui-control-border-radius': '12px',
      '--ui-control-gap': '10px',
      '--ui-control-header-margin': '10px',
      '--ui-control-btn-padding': '10px 20px',
      '--ui-control-btn-min-width': '200px',
      '--ui-control-btn-border-radius': '8px',
      '--ui-control-btn-opacity-disabled': '0.5',
      '--theme-toggle-bg': 'hsl(var(--color-base) 100% / 1)',
      '--theme-toggle-border': 'hsl(var(--color-base) 90% / 1)',
      '--theme-toggle-text': '#333333',
      '--ui-control-bg': '#ffffff',
      '--ui-control-text': '#333333',
      '--ui-control-icon': '#666666',
      '--ui-control-border': '#d1d5db',
      '--ui-control-shadow': 'rgba(0, 0, 0, 0.1)',
      '--ui-control-shadow-focus': 'rgba(66, 66, 66, 0.2)'
    },
    onyx: {
      '--color-base-h': '0',
      '--color-base-s': '0%',
      '--color-base-l': '0%',
      '--color-base': 'var(--color-base-h) var(--color-base-s)',
      '--app-bg': 'hsl(var(--color-base) 0% / 1)',
      '--canvas-bg': 'hsl(var(--color-base) 10% / 1)',
      '--text-color': 'hsl(var(--color-base) 80% / 1)',
      '--node-fill': 'hsl(var(--color-base) 17% / 1)',
      '--node-stroke': 'hsl(var(--color-base) 30% / 1)',
      '--node-connector': 'hsl(var(--color-base) 30% / 1)',
      '--cluster-bg': 'hsl(0 100% 50% / 1)',
      '--cluster-stroke': 'rgba(255,255,255,0.1)',
      '--cluster-title-color': '#CCCCCC',
      '--cluster-title-bg': 'rgba(30, 30, 30, 0.95)',
      '--cluster-hover-bg': 'rgba(0, 234, 255, 0.15)',
      '--cluster-hover-stroke': '#00eaff',
      '--cluster-hover-title-color': '#00eaff',
      '--cluster-selected-bg': 'hsl(var(--color-base) 20% / 0.8)',
      '--cluster-selected-stroke': 'hsl(var(--color-base) 50% / 0.8)',
      '--cluster-selected-title-color': 'hsl(var(--color-base) 100% / 0.8)',
      '--ui-panel-bg': 'hsl(var(--color-base) 15% / 1)',
      '--ui-panel-border': '#333',
      '--ui-panel-text': '#f6f7f9',
      '--ui-panel-text-muted': '#cccccc',
      '--ui-control-padding': '15px',
      '--ui-control-border-radius': '12px',
      '--ui-control-gap': '10px',
      '--ui-control-header-margin': '10px',
      '--ui-control-btn-padding': '10px 20px',
      '--ui-control-btn-min-width': '200px',
      '--ui-control-btn-border-radius': '8px',
      '--ui-control-btn-opacity-disabled': '0.5',
      '--switcher-btn-text-active': '#f6f7f9',
      '--switcher-btn-border-active': '#cccccc',
      '--switcher-btn-bg-hover': 'rgba(255, 255, 255, 0.05)',
      '--switcher-btn-border-hover': '#555',
      '--theme-toggle-bg': 'hsl(var(--color-base) 15% / 1)',
      '--theme-toggle-border': '#333',
      '--theme-toggle-text': '#f6f7f9',
      '--ui-control-bg': 'hsl(var(--color-base) 15% / 1)',
      '--ui-control-text': '#f6f7f9',
      '--ui-control-icon': '#a0aec0',
      '--ui-control-border': '#333',
      '--ui-control-shadow': 'rgba(0, 0, 0, 0.3)',
      '--ui-control-shadow-focus': 'rgba(204, 204, 204, 0.2)'
    }
  };
  
  // Load theme variables from xthemes.json (for complete variables)
  let completeThemeVariables = {};
  
  async function loadCompleteThemeVariables() {
    try {
      // Try multiple possible paths for xthemes.json
      const possiblePaths = ['xthemes.json', 'src/xthemes.json', '../xthemes.json'];
      let themes = null;
      let loadedPath = null;
      
      for (const path of possiblePaths) {
        try {
          const response = await fetch(path);
          if (response.ok) {
            themes = await response.json();
            loadedPath = path;
            break;
          }
        } catch (e) {
          // Continue to next path
        }
      }
      
      if (!themes) {
        throw new Error('No se pudo cargar xthemes.json desde ninguna ubicación');
      }
      
      completeThemeVariables = themes;
      console.log('[Theme Loader] Variables completas cargadas desde:', loadedPath);
      
      // Re-apply current theme with complete variables
      const currentTheme = getCurrentTheme();
      if (currentTheme && completeThemeVariables[currentTheme]) {
        applyThemeVariables(completeThemeVariables[currentTheme]);
        console.log('[Theme Loader] Tema actualizado con variables completas:', currentTheme);
      }
    } catch (error) {
      console.warn('[Theme Loader] Error cargando xthemes.json, usando variables esenciales:', error);
    }
  }
  
  // Apply theme variables to document
  function applyThemeVariables(variables) {
    if (variables) {
      Object.keys(variables).forEach(varName => {
        const value = variables[varName];
        if (value && value !== 'undefined' && value !== 'null') {
          // Apply to document root for global access
          document.documentElement.style.setProperty(varName, value);
          
          // Also apply to body for backward compatibility
          document.body.style.setProperty(varName, value);
          
          // Apply to .xcanvas if it exists
          const xcanvas = document.querySelector('.xcanvas');
          if (xcanvas) {
            xcanvas.style.setProperty(varName, value);
          }
        }
      });
    }
  }
  
  // Apply theme immediately (with essential variables first)
  function applyThemeEarly(themeId) {
    // Apply class to body
    document.body.classList.add('theme-' + themeId);
    
    // Apply essential CSS variables immediately (prevents flash)
    const essentialVariables = essentialThemeVariables[themeId] || essentialThemeVariables.snow;
    applyThemeVariables(essentialVariables);
    
    console.log('[Theme Loader] Theme applied early with essential variables:', themeId);
  }
  
  // Get current theme from localStorage
  function getCurrentTheme() {
    const storageKey = getStorageKey();
    let currentTheme = localStorage.getItem(storageKey);
    
    if (!currentTheme) {
      // Try global theme preference
      currentTheme = localStorage.getItem('selectedTheme');
    }
    
    if (!currentTheme) {
      // Try theme mode
      const themeMode = localStorage.getItem('themeMode');
      if (themeMode === 'dark') {
        currentTheme = 'onyx';
      } else if (themeMode === 'light') {
        currentTheme = 'snow';
      }
    }
    
    if (!currentTheme) {
      // Use default light theme
      const config = getThemeConfiguration();
      currentTheme = config.lightTheme;
    }
    
    return currentTheme;
  }
  
  // Main function
  function initEarlyTheme() {
    const currentTheme = getCurrentTheme();
    console.log('[Theme Loader] Using theme:', currentTheme);
    
    // Save the theme to both locations for consistency
    const storageKey = getStorageKey();
    localStorage.setItem(storageKey, currentTheme);
    localStorage.setItem('selectedTheme', currentTheme);
    localStorage.setItem('themeMode', isLightTheme(currentTheme) ? 'light' : 'dark');
    
    // Apply the theme immediately with essential variables (prevents flash)
    applyThemeEarly(currentTheme);
    
    // Load complete variables in background (non-blocking)
    setTimeout(() => {
      loadCompleteThemeVariables();
    }, 100); // Small delay to ensure DOM is ready
    
    // Add a fallback to reload variables if they don't load properly
    setTimeout(() => {
      const computedStyle = getComputedStyle(document.documentElement);
      const canvasBg = computedStyle.getPropertyValue('--canvas-bg');
      if (!canvasBg || canvasBg === '') {
        console.log('[Theme Loader] Variables no detectadas, recargando...');
        loadCompleteThemeVariables();
      }
    }, 1000);
  }
  
  // Helper function to check if theme is light
  function isLightTheme(themeId) {
    const lightThemes = ['snow'];
    return lightThemes.includes(themeId);
  }
  
  // Debug function to check loader state
  window.debugLoaderState = function() {
    console.log('[Loader Debug] === ESTADO DEL LOADER ===');
    const storageKey = getStorageKey();
    const config = getThemeConfiguration();
    const savedTheme = localStorage.getItem(storageKey);
    const bodyClasses = document.body.className;
    
    console.log('[Loader Debug] Clave de almacenamiento:', storageKey);
    console.log('[Loader Debug] Configuración:', config);
    console.log('[Loader Debug] Tema guardado:', savedTheme);
    console.log('[Loader Debug] Clases del body:', bodyClasses);
    console.log('[Loader Debug] Variables esenciales cargadas:', Object.keys(essentialThemeVariables));
    console.log('[Loader Debug] Variables completas cargadas:', Object.keys(completeThemeVariables));
    
    // Check if key variables are applied
    const currentTheme = getCurrentTheme();
    const computedStyle = getComputedStyle(document.documentElement);
    console.log('[Loader Debug] Tema actual:', currentTheme);
    console.log('[Loader Debug] --canvas-bg aplicado:', computedStyle.getPropertyValue('--canvas-bg'));
    console.log('[Loader Debug] --text-color aplicado:', computedStyle.getPropertyValue('--text-color'));
    console.log('[Loader Debug] --node-fill aplicado:', computedStyle.getPropertyValue('--node-fill'));
    console.log('[Loader Debug] === FIN DEL ESTADO ===');
  };
  
  // Function to force reload theme variables
  window.reloadThemeVariables = function() {
    console.log('[Theme Loader] Recargando variables de tema...');
    loadCompleteThemeVariables();
  };
  
  // Run immediately if DOM is ready, or wait
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEarlyTheme);
  } else {
    initEarlyTheme();
  }
  
})(); 