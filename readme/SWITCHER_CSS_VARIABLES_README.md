# Diagram Switcher - Variables CSS

## Problema Resuelto

El botón activo del diagram-switcher estaba usando **estilos inline** en lugar de **variables CSS**, lo cual causaba:

- ❌ No respetaba las variables del tema
- ❌ No se actualizaba automáticamente al cambiar de tema
- ❌ Inconsistencia en el sistema de temas

## Solución Implementada

### Antes (JavaScript con estilos inline)
```javascript
// ❌ Estilos inline hardcodeados
if (button.classList.contains('active')) {
  button.style.background = variables.controlFocus;
  button.style.color = '#fff';
  button.style.borderColor = variables.controlFocus;
}
```

### Después (CSS con variables)
```css
/* ✅ Variables CSS del tema */
.diagram-btn.active {
    background: var(--diagram-btn-bg-active, var(--control-focus, #1976d2));
    color: var(--diagram-btn-text-active, #fff);
    border: 2px solid var(--diagram-btn-border-active, var(--control-focus, #1976d2));
    box-shadow: var(--diagram-btn-shadow, none);
}
```

## Variables CSS Utilizadas

### Estado Normal
- `--diagram-btn-bg`: Fondo del botón
- `--diagram-btn-text`: Color del texto
- `--diagram-btn-border`: Color del borde

### Estado Activo
- `--diagram-btn-bg-active`: Fondo del botón activo
- `--diagram-btn-text-active`: Color del texto activo
- `--diagram-btn-border-active`: Color del borde activo

### Estado Disabled
- `--diagram-btn-bg-disabled`: Fondo del botón deshabilitado
- `--diagram-btn-text-disabled`: Color del texto deshabilitado
- `--diagram-btn-border-disabled`: Color del borde deshabilitado

## Beneficios

✅ **Consistencia**: Todos los elementos usan variables CSS
✅ **Temas dinámicos**: Los colores se actualizan automáticamente
✅ **Mantenibilidad**: Colores centralizados en `themes.json`
✅ **Fallbacks**: Valores por defecto si las variables no están definidas

## Archivos Modificados

- `src/sw-diagrams.js`: Eliminada función `updateSwitcherColors()` que aplicaba estilos inline
- `src/sw-diagrams.css`: Ya usaba variables CSS correctamente
- `src/themes.json`: Ya tenía las variables definidas para todos los temas

## Verificación

Para verificar que funciona correctamente:

1. Cambia entre temas usando el botón de tema
2. El botón activo del diagram-switcher debe cambiar de color
3. Los colores deben coincidir con el tema seleccionado
4. No debe haber estilos inline aplicados al botón activo

## Notas Técnicas

- Los estilos inline que permanecen son solo para funcionalidad (no colores):
  - `text-decoration: none` - Quita subrayado del enlace
  - `pointer-events: none` - Deshabilita interacciones durante carga
  - `opacity: 0.5` - Muestra estado de carga
- La función `updateSwitcherColors()` ahora solo hace un log informativo
- Las llamadas a la función se mantienen para no romper la funcionalidad 