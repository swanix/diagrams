# Solución FOUC (Flash of Unstyled Content)

## Problema Identificado

Al refrescar la página en modo oscuro, se observaba un **parpadeo blanco** en:
- Diagram switcher (panel lateral)
- Botones del diagram switcher
- Theme toggle (botón de cambio de tema)
- Topbar (barra superior)

## Causa del Problema

El problema ocurría porque:

1. **El CSS se carga antes que el JavaScript**
2. **Los valores fallback del CSS son claros** (blancos)
3. **El JavaScript aplica el tema después** de que se muestran los elementos
4. **Resultado**: Parpadeo blanco antes de aplicar el tema oscuro

### Ejemplo del problema:
```css
.diagram-switcher {
    background: var(--switcher-bg, #fff); /* Fallback blanco */
}
.theme-toggle {
    background: var(--theme-toggle-bg, var(--control-bg, #fff)); /* Fallback blanco */
}
```

## Solución Implementada

### 1. **Ocultar elementos hasta que se aplique el tema**

```css
/* Ocultar elementos hasta que se aplique el tema para evitar FOUC */
.diagram-switcher,
.theme-toggle,
.topbar {
    opacity: 0;
    transition: opacity 0.3s ease;
}

/* Mostrar elementos cuando el tema esté aplicado */
body.theme-snow .diagram-switcher,
body.theme-snow .theme-toggle,
body.theme-snow .topbar,
body.theme-onyx .diagram-switcher,
body.theme-onyx .theme-toggle,
body.theme-onyx .topbar,
/* ... otros temas ... */ {
    opacity: 1;
}
```

### 2. **Mejorar el theme-loader.js**

Agregué las variables CSS faltantes para el switcher y theme-toggle en todos los temas:

```javascript
// Variables agregadas para cada tema
'--switcher-bg': '#23272f',
'--switcher-border': '#333',
'--theme-toggle-bg': '#23272f',
'--theme-toggle-border': '#333',
'--theme-toggle-text': '#f6f7f9',
'--diagram-btn-bg': '#23272f',
'--diagram-btn-text': '#f6f7f9',
'--diagram-btn-border': '#333',
'--diagram-btn-bg-active': '#00eaff',
'--diagram-btn-text-active': '#181c24',
'--diagram-btn-border-active': '#00eaff',
```

## Archivos Modificados

- `src/sw-diagrams.css`: Agregadas reglas para ocultar/mostrar elementos
- `src/theme-loader.js`: Agregadas variables CSS faltantes para todos los temas

## Orden de Carga Correcto

```html
<script src="theme-loader.js"></script>     <!-- 1. Aplica tema temprano -->
<link rel="stylesheet" href="sw-diagrams.css"> <!-- 2. CSS con elementos ocultos -->
<script src="sw-diagrams.js"></script>      <!-- 3. Funcionalidad completa -->
```

## Resultado

✅ **Sin parpadeo**: Los elementos permanecen ocultos hasta que se aplica el tema
✅ **Transición suave**: Los elementos aparecen con fade-in de 0.3s
✅ **Consistencia**: Todos los temas funcionan correctamente
✅ **Performance**: No afecta el rendimiento de carga

## Verificación

Para verificar que funciona:

1. Refrescar la página en modo oscuro
2. No debe haber parpadeo blanco
3. Los elementos deben aparecer con el tema correcto
4. La transición debe ser suave

## Notas Técnicas

- **theme-loader.js** se ejecuta inmediatamente al cargar
- **Variables CSS** se aplican antes que el CSS principal
- **Clases de tema** se agregan al body para mostrar elementos
- **Transiciones** son suaves para mejor UX 