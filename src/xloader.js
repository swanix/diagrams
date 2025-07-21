// Swanix Diagrams - THEME LOADER JS
// v0.4.5

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
  // Updated to match xthemes.json colors
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
      '--side-panel-bg': 'hsl(var(--color-base) 100% / 1)',
      '--side-panel-border': 'hsl(var(--color-base) 95% / 1)',
      '--topbar-bg': 'hsl(var(--color-base) 100% / 1)',
      '--switcher-bg': 'hsl(var(--color-base) 100% / 1)',
      '--switcher-border': 'hsl(var(--color-base) 90% / 1)',
      '--switcher-text': '#333333',
      '--switcher-btn-bg': 'hsl(var(--color-base) 100% / 1)',
      '--switcher-btn-text': 'hsl(var(--color-base) 30% / 1)',
      '--switcher-btn-border': 'hsl(var(--color-base) 90% / 1)',
      '--switcher-btn-bg-active': '#424242',
      '--switcher-btn-text-active': '#ffffff',
      '--switcher-btn-border-active': '#424242',
      '--theme-toggle-bg': 'hsl(var(--color-base) 100% / 1)',
      '--theme-toggle-border': 'hsl(var(--color-base) 90% / 1)',
      '--theme-toggle-text': '#333333',
      '--control-bg': '#ffffff',
      '--control-text': '#333333',
      '--control-border': '#d1d5db'
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
      '--side-panel-bg': 'hsl(var(--color-base) 15% / 1)',
      '--side-panel-border': '#333',
      '--topbar-bg': 'hsl(var(--color-base) 15% / 1)',
      '--switcher-bg': 'hsl(var(--color-base) 15% / 1)',
      '--switcher-border': '#333',
      '--switcher-text': '#f6f7f9',
      '--switcher-btn-bg': 'hsl(var(--color-base) 15% / 1)',
      '--switcher-btn-text': '#f6f7f9',
      '--switcher-btn-border': '#333',
      '--switcher-btn-bg-active': 'rgba(255, 255, 255, 0.15)',
      '--switcher-btn-text-active': '#f6f7f9',
      '--switcher-btn-border-active': '#cccccc',
      '--theme-toggle-bg': 'hsl(var(--color-base) 15% / 1)',
      '--theme-toggle-border': '#333',
      '--theme-toggle-text': '#f6f7f9',
      '--control-bg': 'hsl(var(--color-base) 15% / 1)',
      '--control-text': '#f6f7f9',
      '--control-border': '#333'
    },
    vintage: {
      '--app-bg': '#f5f1e8',
      '--canvas-bg': '#f5f1e8',
      '--text-color': '#2c1810',
      '--node-fill': '#faf6f0',
      '--node-stroke': '#d4c4a8',
      '--side-panel-bg': '#faf6f0',
      '--side-panel-border': '#d4c4a8',
      '--topbar-bg': '#f5f1e8',
      '--switcher-bg': '#faf6f0',
      '--switcher-border': '#d4c4a8',
      '--switcher-text': '#2c1810',
      '--switcher-btn-bg': '#faf6f0',
      '--switcher-btn-text': '#2c1810',
      '--switcher-btn-border': '#d4c4a8',
      '--switcher-btn-bg-active': '#8b4513',
      '--switcher-btn-text-active': '#faf6f0',
      '--switcher-btn-border-active': '#8b4513',
      '--theme-toggle-bg': '#faf6f0',
      '--theme-toggle-border': '#d4c4a8',
      '--theme-toggle-text': '#2c1810',
      '--control-bg': '#faf6f0',
      '--control-text': '#2c1810',
      '--control-border': '#d4c4a8'
    },
    pastel: {
      '--app-bg': '#f8f9ff',
      '--canvas-bg': '#f8f9ff',
      '--text-color': '#4a4a6a',
      '--node-fill': '#ffffff',
      '--node-stroke': '#e1e8f0',
      '--side-panel-bg': '#ffffff',
      '--side-panel-border': '#e1e8f0',
      '--topbar-bg': '#f8f9ff',
      '--switcher-bg': '#ffffff',
      '--switcher-border': '#e1e8f0',
      '--switcher-text': '#4a4a6a',
      '--switcher-btn-bg': '#ffffff',
      '--switcher-btn-text': '#4a4a6a',
      '--switcher-btn-border': '#e1e8f0',
      '--switcher-btn-bg-active': '#a8b4f5',
      '--switcher-btn-text-active': '#ffffff',
      '--switcher-btn-border-active': '#a8b4f5',
      '--theme-toggle-bg': '#ffffff',
      '--theme-toggle-border': '#e1e8f0',
      '--theme-toggle-text': '#4a4a6a',
      '--control-bg': '#ffffff',
      '--control-text': '#4a4a6a',
      '--control-border': '#e1e8f0'
    },
    neon: {
      '--app-bg': '#0a0a0a',
      '--canvas-bg': '#0a0a0a',
      '--text-color': '#00ff41',
      '--node-fill': '#1a1a1a',
      '--node-stroke': '#00ff41',
      '--side-panel-bg': '#1a1a1a',
      '--side-panel-border': '#00ff41',
      '--topbar-bg': '#0a0a0a',
      '--switcher-bg': '#1a1a1a',
      '--switcher-border': '#00ff41',
      '--switcher-text': '#00ff41',
      '--switcher-btn-bg': '#1a1a1a',
      '--switcher-btn-text': '#00ff41',
      '--switcher-btn-border': '#00ff41',
      '--switcher-btn-bg-active': '#00ff88',
      '--switcher-btn-text-active': '#0a0a0a',
      '--switcher-btn-border-active': '#00ff88',
      '--theme-toggle-bg': '#1a1a1a',
      '--theme-toggle-border': '#00ff41',
      '--theme-toggle-text': '#00ff41',
      '--control-bg': '#1a1a1a',
      '--control-text': '#00ff41',
      '--control-border': '#00ff41'
    },
    forest: {
      '--app-bg': '#1a2f1a',
      '--canvas-bg': '#1a2f1a',
      '--text-color': '#e8f5e8',
      '--node-fill': '#2a3f2a',
      '--node-stroke': '#4a5f4a',
      '--side-panel-bg': '#2a3f2a',
      '--side-panel-border': '#4a5f4a',
      '--topbar-bg': '#1a2f1a',
      '--switcher-bg': '#2a3f2a',
      '--switcher-border': '#4a5f4a',
      '--switcher-text': '#e8f5e8',
      '--switcher-btn-bg': '#2a3f2a',
      '--switcher-btn-text': '#e8f5e8',
      '--switcher-btn-border': '#4a5f4a',
      '--switcher-btn-bg-active': '#4caf50',
      '--switcher-btn-text-active': '#1a2f1a',
      '--switcher-btn-border-active': '#4caf50',
      '--theme-toggle-bg': '#2a3f2a',
      '--theme-toggle-border': '#4a5f4a',
      '--theme-toggle-text': '#e8f5e8',
      '--control-bg': '#2a3f2a',
      '--control-text': '#e8f5e8',
      '--control-border': '#4a5f4a'
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
    const lightThemes = ['snow', 'vintage', 'pastel'];
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