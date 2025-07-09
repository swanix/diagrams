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
    const container = document.querySelector('.swanix-diagram-container');
    if (container) {
      return {
        lightTheme: container.getAttribute('data-light-theme') || 'snow',
        darkTheme: container.getAttribute('data-dark-theme') || 'onyx'
      };
    }
    return { lightTheme: 'snow', darkTheme: 'onyx' };
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
      '--control-bg': '#1a1a1a',
      '--control-text': '#00ff41',
      '--control-border': '#00ff41'
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