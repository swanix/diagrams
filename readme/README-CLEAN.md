# Swanix Diagrams - Versión Limpia

Esta es una versión simplificada y optimizada de la librería `sw-diagrams` que elimina código no usado, bugs y simplifica la estructura.

## Archivos

- `sw-diagrams-clean.js` - Librería principal simplificada
- `index-clean.html` - Ejemplo de uso
- `README-CLEAN.md` - Esta documentación

## Mejoras Implementadas

### 1. **Estructura Simplificada**
- Eliminado código duplicado y funciones no utilizadas
- Consolidado el manejo del zoom behavior en un solo lugar
- Simplificado el flujo de carga de diagramas

### 2. **Corrección de Bugs**
- **Zoom y Drag**: Corregido el problema de zoom behavior que se perdía después de cargar diagramas
- **Doble Carga**: Eliminada la doble ejecución de `applyAutoZoom()`
- **Pointer Events**: Corregido el problema de eventos de clic bloqueados
- **Cierre de Panel**: Restaurada la funcionalidad de cerrar panel al hacer clic fuera

### 3. **Optimizaciones**
- Zoom behavior definido al inicio para evitar problemas de scope
- Flujo de carga más directo y predecible
- Mejor manejo de estados de carga
- Logs de debug más claros y útiles

## Funcionalidades Principales

### Zoom y Navegación
```javascript
// Zoom automático al cargar
applyAutoZoom();

// Zoom behavior manual
ensureZoomBehavior();

// Zoom con límites: 0.1x a 4x
const zoom = d3.zoom().scaleExtent([0.1, 4]);
```

### Panel Lateral
```javascript
// Abrir panel con datos del nodo
openSidePanel(nodeData);

// Cerrar panel
closeSidePanel();

// Configurar cierre automático
setupClosePanelOnSvgClick();
```

### Sistema de Temas
```javascript
// Cambiar tema
setTheme('snow'); // o 'onyx'

// Inicializar sistema completo
initializeThemeSystem();
```

## Uso Básico

```html
<!DOCTYPE html>
<html>
<head>
    <script src="https://d3js.org/d3.v7.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.2/papaparse.min.js"></script>
    <script src="sw-diagrams-clean.js"></script>
    <link href="sw-diagrams.css" rel="stylesheet">
</head>
<body>
    <svg id="main-diagram-svg"></svg>
    
    <script>
        // Cargar diagrama
        initDiagram('data.csv', function() {
            // Callback cuando termine la carga
            applyAutoZoom();
            ensureZoomBehavior();
        });
    </script>
</body>
</html>
```

## Diferencias con la Versión Original

| Aspecto | Original | Limpia |
|---------|----------|--------|
| **Tamaño** | ~800 líneas | ~400 líneas |
| **Zoom Behavior** | Múltiples aplicaciones | Una sola aplicación |
| **Carga** | Doble ejecución | Ejecución única |
| **Bugs** | Varios conocidos | Corregidos |
| **Estructura** | Compleja | Simplificada |
| **Mantenimiento** | Difícil | Fácil |

## Estructura del CSV

```csv
Node,Name,Description,Thumbnail,Parent,url,Type
1,CEO,Chief Executive Officer,detail,,
2,CTO,Chief Technology Officer,detail,1,
3,CFO,Chief Financial Officer,detail,1,
```

## Temas Disponibles

### Snow (Claro)
- Fondo: `#f6f7f9`
- Nodos: `#fff`
- Texto: `#222`

### Onyx (Oscuro)
- Fondo: `#181c24`
- Nodos: `#23272f`
- Texto: `#f6f7f9`

## Funciones Exportadas

```javascript
// Funciones principales
window.initDiagram = initDiagram;
window.applyAutoZoom = applyAutoZoom;
window.ensureZoomBehavior = ensureZoomBehavior;

// Panel lateral
window.openSidePanel = openSidePanel;
window.closeSidePanel = closeSidePanel;
window.setupClosePanelOnSvgClick = setupClosePanelOnSvgClick;

// Temas
window.setTheme = setTheme;
window.initializeThemeSystem = initializeThemeSystem;
```

## Migración desde la Versión Original

1. **Reemplazar el archivo JS**:
   ```html
   <!-- Antes -->
   <script src="sw-diagrams.js"></script>
   
   <!-- Después -->
   <script src="sw-diagrams-clean.js"></script>
   ```

2. **Actualizar llamadas**:
   ```javascript
   // El API es compatible, no se requieren cambios
   initDiagram('data.csv', callback);
   ```

3. **Verificar funcionalidad**:
   - Zoom y drag deberían funcionar correctamente
   - Panel lateral debería abrirse/cerrarse sin problemas
   - No debería haber doble carga

## Ventajas de la Versión Limpia

✅ **Mejor rendimiento** - Menos código, más eficiente  
✅ **Menos bugs** - Problemas conocidos corregidos  
✅ **Más fácil de mantener** - Código más limpio y organizado  
✅ **Mejor experiencia de usuario** - Zoom y navegación funcionan correctamente  
✅ **API compatible** - No requiere cambios en código existente  

## Próximas Mejoras

- [ ] Agregar más temas predefinidos
- [ ] Optimizar renderizado para diagramas grandes
- [ ] Agregar animaciones de transición
- [ ] Mejorar accesibilidad
- [ ] Agregar exportación a PNG/SVG 