// Theme Loader - Aplica el tema guardado antes de que se cargue el CSS principal
// Este archivo debe cargarse ANTES que sw-diagrams.css para evitar el parpadeo

(function() {
  'use strict';
  
  // Generar clave única para el localStorage basada en la URL del archivo
  function getStorageKey() {
    const path = window.location.pathname;
    const filename = path.split('/').pop() || 'index.html';
    return `selectedTheme_${filename}`;
  }
  
  // Obtener configuración de temas desde el HTML
  function getThemeConfiguration() {
    const container = document.querySelector('.sw-diagram-container');
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
  
  // Variables CSS de los temas (solo las esenciales para evitar parpadeo)
  const themeVariables = {
    snow: {
      '--bg-color': '#f6f7f9',
      '--text-color': '#222',
      '--node-fill': '#fff',
      '--side-panel-bg': '#fff',
      '--sidepanel-bg': '#fff',
      '--side-panel-border': '#e0e0e0',
      '--sidepanel-border': '#e0e0e0',
      '--topbar-bg': '#ffffff',
      '--switcher-bg': '#ffffff',
      '--switcher-border': '#d1d5db',
      '--theme-toggle-bg': '#ffffff',
      '--theme-toggle-border': '#d1d5db',
      '--theme-toggle-text': '#333333',
      '--switcher-btn-bg': '#ffffff',
      '--switcher-btn-text': '#333333',
      '--switcher-btn-border': '#d1d5db',
      '--switcher-btn-bg-hover': 'rgba(0, 0, 0, 0.1)',
      '--switcher-btn-bg-active': '#1976d2',
      '--switcher-btn-text-active': '#ffffff',
      '--switcher-btn-border-active': '#1976d2',
      '--control-bg': '#ffffff',
      '--control-text': '#333333',
      '--control-border': '#d1d5db'
    },
    onyx: {
      '--bg-color': '#181c24',
      '--text-color': '#f6f7f9',
      '--node-fill': '#23272f',
      '--side-panel-bg': '#23272f',
      '--sidepanel-bg': '#23272f',
      '--side-panel-border': '#333',
      '--sidepanel-border': '#333',
      '--topbar-bg': '#23272f',
      '--switcher-bg': '#23272f',
      '--switcher-border': '#333',
      '--theme-toggle-bg': '#23272f',
      '--theme-toggle-border': '#333',
      '--theme-toggle-text': '#f6f7f9',
      '--switcher-btn-bg': '#23272f',
      '--switcher-btn-text': '#f6f7f9',
      '--switcher-btn-border': '#333',
      '--switcher-btn-bg-hover': 'rgba(255, 255, 255, 0.15)',
      '--switcher-btn-bg-active': '#00eaff',
      '--switcher-btn-text-active': '#181c24',
      '--switcher-btn-border-active': '#00eaff',
      '--control-bg': '#23272f',
      '--control-text': '#f6f7f9',
      '--control-border': '#333'
    },
    vintage: {
      '--bg-color': '#f5f1e8',
      '--text-color': '#2c1810',
      '--node-fill': '#faf6f0',
      '--side-panel-bg': '#faf6f0',
      '--sidepanel-bg': '#faf6f0',
      '--side-panel-border': '#d4c4a8',
      '--sidepanel-border': '#d4c4a8',
      '--topbar-bg': '#f5f1e8',
      '--switcher-bg': '#faf6f0',
      '--switcher-border': '#d4c4a8',
      '--theme-toggle-bg': '#faf6f0',
      '--theme-toggle-border': '#d4c4a8',
      '--theme-toggle-text': '#2c1810',
      '--switcher-btn-bg': '#faf6f0',
      '--switcher-btn-text': '#2c1810',
      '--switcher-btn-border': '#d4c4a8',
      '--switcher-btn-bg-hover': 'rgba(139, 69, 19, 0.15)',
      '--switcher-btn-bg-active': '#8b4513',
      '--switcher-btn-text-active': '#faf6f0',
      '--switcher-btn-border-active': '#8b4513',
      '--control-bg': '#faf6f0',
      '--control-text': '#2c1810',
      '--control-border': '#d4c4a8'
    },
    pastel: {
      '--bg-color': '#f8f9ff',
      '--text-color': '#4a4a6a',
      '--node-fill': '#ffffff',
      '--side-panel-bg': '#ffffff',
      '--sidepanel-bg': '#ffffff',
      '--side-panel-border': '#e1e8f0',
      '--sidepanel-border': '#e1e8f0',
      '--topbar-bg': '#f8f9ff',
      '--switcher-bg': '#ffffff',
      '--switcher-border': '#e1e8f0',
      '--theme-toggle-bg': '#ffffff',
      '--theme-toggle-border': '#e1e8f0',
      '--theme-toggle-text': '#4a4a6a',
      '--switcher-btn-bg': '#ffffff',
      '--switcher-btn-text': '#4a4a6a',
      '--switcher-btn-border': '#e1e8f0',
      '--switcher-btn-bg-hover': 'rgba(168, 180, 245, 0.15)',
      '--switcher-btn-bg-active': '#a8b4f5',
      '--switcher-btn-text-active': '#ffffff',
      '--switcher-btn-border-active': '#a8b4f5',
      '--control-bg': '#ffffff',
      '--control-text': '#4a4a6a',
      '--control-border': '#e1e8f0'
    },
    neon: {
      '--bg-color': '#0a0a0a',
      '--text-color': '#00ff41',
      '--node-fill': '#1a1a1a',
      '--side-panel-bg': '#1a1a1a',
      '--sidepanel-bg': '#1a1a1a',
      '--side-panel-border': '#00ff41',
      '--sidepanel-border': '#00ff41',
      '--topbar-bg': '#0a0a0a',
      '--switcher-bg': '#1a1a1a',
      '--switcher-border': '#00ff41',
      '--theme-toggle-bg': '#1a1a1a',
      '--theme-toggle-border': '#00ff41',
      '--theme-toggle-text': '#00ff41',
      '--switcher-btn-bg': '#1a1a1a',
      '--switcher-btn-text': '#00ff41',
      '--switcher-btn-border': '#00ff41',
      '--switcher-btn-bg-hover': 'rgba(0, 255, 65, 0.15)',
      '--switcher-btn-bg-active': '#00ff88',
      '--switcher-btn-text-active': '#0a0a0a',
      '--switcher-btn-border-active': '#00ff88',
      '--control-bg': '#1a1a1a',
      '--control-text': '#00ff41',
      '--control-border': '#00ff41'
    },
    forest: {
      '--bg-color': '#1a2f1a',
      '--text-color': '#e8f5e8',
      '--node-fill': '#2a3f2a',
      '--side-panel-bg': '#2a3f2a',
      '--sidepanel-bg': '#2a3f2a',
      '--side-panel-border': '#4a5f4a',
      '--sidepanel-border': '#4a5f4a',
      '--topbar-bg': '#1a2f1a',
      '--switcher-bg': '#2a3f2a',
      '--switcher-border': '#4a5f4a',
      '--theme-toggle-bg': '#2a3f2a',
      '--theme-toggle-border': '#4a5f4a',
      '--theme-toggle-text': '#e8f5e8',
      '--switcher-btn-bg': '#2a3f2a',
      '--switcher-btn-text': '#e8f5e8',
      '--switcher-btn-border': '#4a5f4a',
      '--switcher-btn-bg-hover': 'rgba(76, 175, 80, 0.15)',
      '--switcher-btn-bg-active': '#4caf50',
      '--switcher-btn-text-active': '#1a2f1a',
      '--switcher-btn-border-active': '#4caf50',
      '--control-bg': '#2a3f2a',
      '--control-text': '#e8f5e8',
      '--control-border': '#4a5f4a'
    }
  };
  
  // Aplicar tema inmediatamente
  function applyThemeEarly(themeId) {
    // Aplicar clase al body
    document.body.classList.add('theme-' + themeId);
    
    // Aplicar variables CSS esenciales
    const variables = themeVariables[themeId] || themeVariables.snow;
    Object.keys(variables).forEach(varName => {
      document.documentElement.style.setProperty(varName, variables[varName]);
      document.body.style.setProperty(varName, variables[varName]);
    });
    
    console.log('[Theme Loader] Tema aplicado tempranamente:', themeId);
  }
  
  // Función principal
  function initEarlyTheme() {
    const storageKey = getStorageKey();
    const config = getThemeConfiguration();
    
    // Verificar si es la primera vez para este archivo específico
    const isFirstTime = !localStorage.getItem(`themeSystemInitialized_${storageKey}`);
    
    let currentTheme;
    if (isFirstTime) {
      // Primera vez: usar el tema claro por defecto del HTML
      currentTheme = config.lightTheme;
      localStorage.setItem(`themeSystemInitialized_${storageKey}`, 'true');
      localStorage.setItem(storageKey, currentTheme);
      console.log('[Theme Loader] Primera vez, usando tema por defecto:', currentTheme);
    } else {
      // No es la primera vez: usar el tema guardado en localStorage
      currentTheme = localStorage.getItem(storageKey);
      if (!currentTheme) {
        // Si no hay tema guardado, usar el tema claro por defecto
        currentTheme = config.lightTheme;
        localStorage.setItem(storageKey, currentTheme);
      }
      console.log('[Theme Loader] Usando tema guardado:', currentTheme);
    }
    
    // Aplicar el tema inmediatamente
    applyThemeEarly(currentTheme);
  }
  
  // Ejecutar inmediatamente si el DOM está listo, o esperar
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEarlyTheme);
  } else {
    initEarlyTheme();
  }
  
})(); 