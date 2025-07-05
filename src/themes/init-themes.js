// Inicialización del sistema de temas
// Carga todos los temas disponibles y configura el selector

console.log('🎨 Iniciando sistema de temas...');

// Función para inicializar el sistema completo
function initializeThemeSystem() {
  console.log('🔄 Inicializando sistema de temas...');
  
  // Esperar a que el motor de temas esté disponible
  if (window.themeEngine) {
    console.log('✅ Motor de temas detectado, cargando temas adicionales...');
    
    // Los temas personalizados y avanzados se cargan automáticamente
    // desde sus respectivos archivos cuando se importan
    
    // Cargar tema guardado
    const savedTheme = localStorage.getItem('swanix-theme');
    if (savedTheme) {
      console.log(`🎯 Aplicando tema guardado: ${savedTheme}`);
      window.themeEngine.applyTheme(savedTheme);
    } else {
      console.log('🎯 Aplicando tema por defecto');
      window.themeEngine.applyTheme('default');
    }
    
    console.log('✅ Sistema de temas inicializado correctamente');
    console.log('📋 Temas disponibles:', window.themeEngine.getAllThemes().map(t => t.name));
    
  } else {
    console.log('⏳ Motor de temas no disponible, reintentando en 100ms...');
    setTimeout(initializeThemeSystem, 100);
  }
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeThemeSystem);
} else {
  // Si el DOM ya está cargado, esperar un poco para que se carguen los scripts
  setTimeout(initializeThemeSystem, 50);
}

// Función para forzar la inicialización (útil para debugging)
window.forceThemeInit = function() {
  console.log('🔧 Forzando inicialización del sistema de temas...');
  initializeThemeSystem();
};

// Función para listar temas disponibles
window.listAvailableThemes = function() {
  if (window.themeEngine) {
    const themes = window.themeEngine.getAllThemes();
    console.log('📋 Temas disponibles:');
    themes.forEach(theme => {
      console.log(`  - ${theme.name} (${theme.id}): ${theme.description}`);
    });
    return themes;
  } else {
    console.log('❌ Motor de temas no disponible');
    return [];
  }
};

console.log('🎨 Script de inicialización de temas cargado'); 