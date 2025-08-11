/**
 * Índice del módulo de temas
 * Exporta todas las funciones y clases del sistema de temas
 */

export { 
  ThemeManager, 
  initThemes, 
  getThemeManager, 
  setTheme, 
  getCurrentTheme, 
  isLightTheme, 
  isDarkTheme,
  clearSavedTheme
} from './themes.js';

// Re-exportar la clase principal como default
export { ThemeManager as default } from './themes.js';
