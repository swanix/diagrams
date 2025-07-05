// Temas personalizados simplificados
// Solo los temas seleccionados por el usuario

const CUSTOM_THEMES = {
  // Tema retro/vintage
  'retro-vintage': {
    name: 'Retro Vintage',
    description: 'Tema con estética retro de los años 70',
    colors: {
      '--bg-color': '#f4e4bc',
      '--text-color': '#8b4513',
      '--node-fill': '#faf0e6',
      '--label-border': '#d2691e',
      '--link-color': '#cd853f',
      '--node-stroke-focus': '#8b4513',
      '--side-panel-bg': '#faf0e6',
      '--side-panel-border': '#d2691e',
      '--side-panel-header-bg': '#d2691e',
      '--side-panel-text': '#8b4513',
      '--side-panel-label': '#a0522d',
      '--side-panel-value': '#8b4513',
      // Variables para SVGs
      '--svg-bg-color': '#d2691e',
      '--svg-primary-color': '#faf0e6',
      '--svg-secondary-color': '#cd853f',
      '--svg-accent-color': '#f4e4bc',
      '--svg-filter': 'sepia(0.3) hue-rotate(30deg)'
    }
  },

  // Tema cyberpunk
  'cyberpunk': {
    name: 'Cyberpunk',
    description: 'Tema futurista con neón y colores vibrantes',
    colors: {
      '--bg-color': '#0a0a0a',
      '--text-color': '#00ff41',
      '--node-fill': '#1a1a1a',
      '--label-border': '#ff0080',
      '--link-color': '#00ffff',
      '--node-stroke-focus': '#00ff41',
      '--side-panel-bg': '#1a1a1a',
      '--side-panel-border': '#ff0080',
      '--side-panel-header-bg': '#ff0080',
      '--side-panel-text': '#00ff41',
      '--side-panel-label': '#00ffff',
      '--side-panel-value': '#00ff41',
      // Variables para SVGs
      '--svg-bg-color': '#ff0080',
      '--svg-primary-color': '#00ff41',
      '--svg-secondary-color': '#00ffff',
      '--svg-accent-color': '#1a1a1a',
      '--svg-filter': 'brightness(1.2) contrast(1.5) saturate(1.5)'
    }
  },

  // Tema pastel suave
  'soft-pastel': {
    name: 'Pastel Suave',
    description: 'Tema con colores pastel suaves y relajantes',
    colors: {
      '--bg-color': '#f8f9ff',
      '--text-color': '#6b7280',
      '--node-fill': '#ffffff',
      '--label-border': '#e5e7eb',
      '--link-color': '#d1d5db',
      '--node-stroke-focus': '#8b5cf6',
      '--side-panel-bg': '#ffffff',
      '--side-panel-border': '#f3f4f6',
      '--side-panel-header-bg': '#f9fafb',
      '--side-panel-text': '#6b7280',
      '--side-panel-label': '#9ca3af',
      '--side-panel-value': '#6b7280',
      // Variables para SVGs
      '--svg-bg-color': '#8b5cf6',
      '--svg-primary-color': '#ffffff',
      '--svg-secondary-color': '#c4b5fd',
      '--svg-accent-color': '#f3f4f6',
      '--svg-filter': 'brightness(1.1) saturate(0.8)'
    }
  }
};

// Función para cargar temas personalizados
function loadCustomThemes() {
  Object.entries(CUSTOM_THEMES).forEach(([id, theme]) => {
    if (window.themeEngine) {
      window.themeEngine.addTheme(id, theme);
    }
  });
}

// Cargar temas personalizados cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadCustomThemes);
} else {
  loadCustomThemes();
}

// Exportar para uso global
window.CUSTOM_THEMES = CUSTOM_THEMES;
window.loadCustomThemes = loadCustomThemes; 