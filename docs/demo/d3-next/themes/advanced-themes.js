// Temas avanzados simplificados
// Solo el tema Neón Brillante seleccionado por el usuario

const ADVANCED_THEMES = {
  // Tema neón con efectos de brillo
  'neon-glow': {
    name: 'Neón Brillante',
    description: 'Tema con efectos de neón y brillo',
    colors: {
      '--bg-color': '#0a0a0a',
      '--text-color': '#00ff88',
      '--node-fill': '#1a1a1a',
      '--label-border': '#00ff88',
      '--link-color': '#00ffff',
      '--node-stroke-focus': '#00ff88',
      '--side-panel-bg': 'rgba(26, 26, 26, 0.95)',
      '--side-panel-border': '#00ff88',
      '--side-panel-header-bg': '#00ff88',
      '--side-panel-text': '#00ff88',
      '--side-panel-label': '#00ffff',
      '--side-panel-value': '#00ff88',
      // Variables para SVGs
      '--svg-bg-color': '#00ff88',
      '--svg-primary-color': '#ffffff',
      '--svg-secondary-color': '#00ffff',
      '--svg-accent-color': '#1a1a1a',
      '--svg-filter': 'brightness(1.5) contrast(1.3) saturate(2) drop-shadow(0 0 5px #00ff88)'
    },
    effects: {
      '--node-shadow': '0 0 10px #00ff88',
      '--link-glow': '0 0 5px #00ffff',
      '--panel-shadow': '0 0 20px rgba(0, 255, 136, 0.3)'
    }
  }
};

// Función para cargar temas avanzados
function loadAdvancedThemes() {
  Object.entries(ADVANCED_THEMES).forEach(([id, theme]) => {
    if (window.themeEngine) {
      // Combinar colores y efectos
      const fullTheme = {
        ...theme,
        colors: {
          ...theme.colors,
          ...theme.effects
        }
      };
      
      window.themeEngine.addTheme(id, fullTheme);
    }
  });
}

// Función para aplicar efectos CSS adicionales
function applyAdvancedEffects(themeId) {
  const theme = ADVANCED_THEMES[themeId];
  if (!theme || !theme.effects) return;

  // Crear estilos dinámicos para efectos
  let styleElement = document.getElementById('advanced-theme-effects');
  if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.id = 'advanced-theme-effects';
    document.head.appendChild(styleElement);
  }

  // Generar CSS para efectos de neón
  let css = '';
  
  if (theme.effects['--node-shadow']) {
    css += `
      .node rect {
        box-shadow: ${theme.effects['--node-shadow']};
      }
    `;
  }

  if (theme.effects['--link-glow']) {
    css += `
      .link {
        filter: drop-shadow(${theme.effects['--link-glow']});
      }
    `;
  }

  if (theme.effects['--panel-shadow']) {
    css += `
      .side-panel {
        box-shadow: ${theme.effects['--panel-shadow']};
      }
    `;
  }

  styleElement.textContent = css;
}

// Cargar temas avanzados cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadAdvancedThemes);
} else {
  loadAdvancedThemes();
}

// Exportar para uso global
window.ADVANCED_THEMES = ADVANCED_THEMES;
window.loadAdvancedThemes = loadAdvancedThemes;
window.applyAdvancedEffects = applyAdvancedEffects; 