# Swanix Diagrams - Módulos JavaScript

Este directorio contiene los módulos JavaScript separados del sistema Swanix Diagrams.

## Estructura de Módulos

### 1. Theme Manager (`themeManager.js`)

**Responsabilidad:** Gestión completa del sistema de temas y estilos visuales.

**Funciones principales:**
- `setTheme(themeId, forceReload)` - Aplicar un tema específico
- `toggleTheme()` - Cambiar entre tema claro y oscuro
- `initializeThemeSystem()` - Inicializar el sistema de temas
- `updateSVGColors()` - Actualizar colores de elementos SVG
- `getThemeVariables(themeId)` - Obtener variables CSS del tema

**Uso:**
```javascript
// Cargar el módulo
<script src="js/themeManager.js"></script>

// Inicializar
await window.ThemeManager.initializeThemeSystem();

// Cambiar tema
await window.ThemeManager.setTheme('onyx');

// Cambiar entre claro/oscuro
await window.ThemeManager.toggleTheme();
```

**Dependencias:**
- D3.js (para manipulación SVG)
- `window.getXDiagramsConfiguration()` (función de configuración)
- `window.triggerHook()` (sistema de hooks)

### 2. Loading Management (Integrado en Theme Manager)

**Responsabilidad:** Prevenir FOUC y gestionar estados de carga de la aplicación (integrado en `themeManager.js`).

**Funciones principales:**
- `LoadingState.init()` - Inicializar el sistema de carga
- `LoadingState.createLoadingOverlay()` - Crear overlay de carga
- `LoadingState.showContent()` - Mostrar contenido cuando todo esté listo
- `LoadingState.applyEssentialTheme()` - Aplicar variables de tema esenciales
- `window.ThemeManager.forceShow()` - Forzar mostrar contenido (debug)

**Uso:**
```javascript
// El sistema se auto-inicializa, pero puedes forzar mostrar contenido:
window.ThemeManager.forceShow();

// Escuchar cuando la aplicación esté lista:
window.addEventListener('xdiagrams-ready', () => {
  console.log('Aplicación lista!');
});
```

**Características:**
- **Integrado en `themeManager.js`** - Sin archivos externos adicionales
- Se auto-inicializa cuando el DOM está listo
- Crea un overlay de carga con spinner animado
- Aplica variables de tema esenciales inmediatamente
- Espera a que la aplicación principal esté lista
- Transiciones suaves entre estados de carga
- **Elimina completamente la dependencia de `xloader.js`**

**Orden de Carga Simplificado:**
1. `themeManager.js` (PRIMERO - incluye loading management)
2. `xdiagrams.css`
3. Dependencias (D3.js, PapaParse)
4. `xdiagrams.js` (ÚLTIMO)

### 2. Próximos Módulos Planificados

#### Data Manager (`dataManager.js`)
- Carga de datos (CSV, JSON, API)
- Procesamiento de datos
- Construcción de jerarquías
- Validación de datos

#### State Manager (`stateManager.js`)
- Gestión de estado global
- Configuración
- Cache y storage

#### Render Manager (`renderManager.js`)
- Renderizado SVG
- Posicionamiento de elementos
- Layouts y disposición

#### Interaction Manager (`interactionManager.js`)
- Eventos de mouse/touch
- Zoom y pan
- Tooltips
- Side panel

## Patrón de Módulos

Cada módulo sigue este patrón:

1. **Encapsulación:** Todas las funciones relacionadas en un archivo
2. **Exportación:** Funciones expuestas a través de `window.ModuleName`
3. **Dependencias:** Verificación de dependencias externas
4. **Inicialización:** Función de inicialización específica
5. **Compatibilidad:** Mantener compatibilidad con el sistema existente

## Integración con xdiagrams.js

Para integrar un módulo con el archivo principal:

1. **Cargar el módulo** antes de xdiagrams.js
2. **Reemplazar llamadas** a funciones por `window.ModuleName.functionName`
3. **Remover funciones** duplicadas del archivo principal
4. **Probar** que todo funciona correctamente

## Testing

Cada módulo incluye un archivo de prueba HTML para verificar su funcionamiento independiente:

- `test-theme-manager.html` - Prueba del theme manager
- `test-data-manager.html` - Prueba del data manager (futuro)
- etc.

## Backup y Rollback

Antes de cada extracción de módulo:
1. Crear backup: `cp src/xdiagrams.js src/xdiagrams.js.backup`
2. Probar el módulo extraído
3. Si hay problemas, restaurar: `cp src/xdiagrams.js.backup src/xdiagrams.js`

## Convenciones

- **Nombres de archivos:** camelCase (ej: `themeManager.js`)
- **Nombres de módulos:** PascalCase (ej: `ThemeManager`)
- **Logs:** Prefijo `[Module Name]` para identificar origen
- **Comentarios:** Documentación clara de funciones y dependencias 