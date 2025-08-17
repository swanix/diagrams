/**
 * XDiagrams Entry Point - ES6 Version
 * Punto de entrada principal para todos los módulos
 */

// Importar dependencias externas
import './vendor/d3.js';
import './vendor/papaparse.js';

// Importar módulos ES6
import { XDiagramsLoader } from './modules/loader/index.js';
import { XDiagramsCache } from './modules/loader/cache.js';
import { XDiagramsThumbs } from './modules/thumbs/index.js';
import { XDiagramsTextHandler } from './modules/core/text-handler.js';
import { XDiagramsNavigation } from './modules/navigation/index.js';
import { XDiagramsUIManager } from './modules/ui/index.js';
import { XDiagrams } from './modules/core/index.js';
import { initThemes } from './modules/themes/index.js';

// Compatibilidad global para el sistema actual
if (typeof window !== 'undefined') {
  
  window.XDiagramsLoader = XDiagramsLoader;
  window.XDiagramsCache = XDiagramsCache;
  window.XDiagramsThumbs = XDiagramsThumbs;
  window.XDiagramsTextHandler = XDiagramsTextHandler;
  window.XDiagramsNavigation = XDiagramsNavigation;
  window.XDiagramsUIManager = XDiagramsUIManager;
  window.XDiagrams = XDiagrams;
  
  // Crear instancia global para compatibilidad
  window.xDiagramsLoader = new XDiagramsLoader();

  // Inicializar el sistema de temas
  const config = window.$xDiagrams || {};
  const themeOptions = {
    showThemeToggle: config.showThemeToggle !== false
  };
  const themeManager = initThemes(themeOptions);
  window.ThemeManager = themeManager;

    // Función para inicializar el diagrama
  function initializeDiagram() {
    console.log('🚀 [XDiagrams] initializeDiagram llamado');
    const config = window.$xDiagrams || {};
    console.log('📋 [XDiagrams] Configuración encontrada:', config);
    console.log('📋 [XDiagrams] Configuración tiene keys:', Object.keys(config));
    
    if (Object.keys(config).length > 0) {
      console.log('✅ [XDiagrams] Configuración válida, creando diagrama...');
      try {
        const diagram = new XDiagrams(config);
        console.log('✅ [XDiagrams] Diagrama creado, inicializando...');
        diagram.initDiagram();
        
        // Asignar la instancia del diagrama al objeto global para acceso desde otros módulos
        window.$xDiagrams = {
          ...config,
          instance: diagram,
          navigation: diagram.navigation,
          core: diagram,
          uiManager: diagram.uiManager,
          themeManager: themeManager,
          // Métodos para acceso a datos LLM
          getLLMData: () => diagram.core.llmDataGenerator.getStoredData(),
          exportLLMFile: () => diagram.core.llmDataGenerator.exportLLMFile(),
          clearLLMData: () => diagram.core.llmDataGenerator.clearStoredData()
        };
        
        // Configurar listener de resize con debounce
        diagram.navigation.setupResizeHandler();
      } catch (error) {
        console.error('❌ [XDiagrams] Error al inicializar diagrama:', error);
      }
    }
  }

  // Inicializar diagrama cuando el DOM esté listo
  console.log('📋 [XDiagrams] Estado del DOM:', document.readyState);
  
  if (document.readyState === 'loading') {
    // El DOM aún no está cargado, esperar el evento
    console.log('⏳ [XDiagrams] DOM cargando, esperando DOMContentLoaded...');
    document.addEventListener('DOMContentLoaded', initializeDiagram);
  } else {
    // El DOM ya está cargado, inicializar inmediatamente
    console.log('✅ [XDiagrams] DOM ya cargado, inicializando inmediatamente...');
    initializeDiagram();
  }
}

// Exportar módulos para uso ES6
export {
  XDiagramsLoader,
  XDiagramsCache,
  XDiagramsThumbs,
  XDiagramsTextHandler,
  XDiagramsNavigation,
  XDiagramsUIManager,
  XDiagrams
};

// Re-exportar el módulo de temas para uso directo
export { initThemes, ThemeManager } from './modules/themes/index.js';