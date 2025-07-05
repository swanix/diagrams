# 🎨 Guía de Temas para SVGs

## 📋 Descripción

Este sistema permite controlar los colores y estilos de los SVGs (thumbnails) desde los temas, sin necesidad de modificar los archivos SVG originales.

## 🎯 Cómo Funciona

### 1. **Variables CSS de Tema**
Cada tema define variables CSS específicas para SVGs:

```css
--svg-bg-color: #8592AD;        /* Color de fondo */
--svg-primary-color: #ffffff;   /* Color primario (elementos principales) */
--svg-secondary-color: #A3ADC2; /* Color secundario (elementos secundarios) */
--svg-accent-color: #F6F7F9;    /* Color de acento */
--svg-filter: none;             /* Filtros CSS adicionales */
```

### 2. **Clase CSS Automática**
Los SVGs se cargan automáticamente con la clase `svg-themeable`, que aplica los estilos del tema.

### 3. **Selectores CSS Específicos**
El sistema usa selectores CSS para reemplazar colores específicos:

```css
.svg-themeable rect[fill="#8592AD"] {
  fill: var(--svg-bg-color) !important;
}

.svg-themeable path[fill="white"] {
  fill: var(--svg-primary-color) !important;
}
```

## 🎨 Temas Disponibles

### **Clásico** (default)
- Colores neutros y profesionales
- Sin filtros especiales

### **Dark**
- Colores oscuros para uso nocturno
- Filtro: `brightness(0.8) contrast(1.2)`

### **Retro Vintage**
- Estética años 70 con tonos cálidos
- Filtro: `sepia(0.3) hue-rotate(30deg)`

### **Pastel Suave**
- Colores suaves y relajantes
- Filtro: `brightness(1.1) saturate(0.8)`

### **Cyberpunk**
- Colores neón vibrantes
- Filtro: `brightness(1.2) contrast(1.5) saturate(1.5)`

### **Neón Brillante**
- Efectos de neón con animación
- Filtro: `brightness(1.5) contrast(1.3) saturate(2) drop-shadow(0 0 5px #00ff88)`
- Animación: `neon-pulse` cada 2 segundos

## 📝 Cómo Agregar Nuevos SVGs

### 1. **Crear el SVG**
Crea tu SVG con colores estándar que coincidan con los selectores CSS:

```svg
<svg width="200" height="180" viewBox="0 0 200 180" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="200" height="180" fill="#8592AD"/>  <!-- Fondo -->
  <path fill="white" d="..."/>                     <!-- Elemento principal -->
  <rect fill="#A3ADC2" d="..."/>                   <!-- Elemento secundario -->
</svg>
```

### 2. **Colores Recomendados**
- **Fondo**: `#8592AD` (se convierte en `--svg-bg-color`)
- **Elementos principales**: `white` (se convierte en `--svg-primary-color`)
- **Elementos secundarios**: `#A3ADC2` (se convierte en `--svg-secondary-color`)
- **Acentos**: `#F6F7F9` (se convierte en `--svg-accent-color`)

### 3. **Agregar a la Librería**
1. Guarda el SVG en `docs/src/shapes/`
2. Agrega la variable CSS en `src/sw-diagrams.css`:

```css
:root {
  --tu-nuevo-svg: https://swanix.org/diagrams/src/shapes/tu-nuevo-svg.svg;
}
```

## 🔧 Cómo Crear un Tema Personalizado

### 1. **Agregar al Archivo de Temas**
En `src/themes/custom-themes.js`:

```javascript
'tu-tema': {
  name: 'Tu Tema',
  description: 'Descripción de tu tema',
  colors: {
    // ... otros colores ...
    '--svg-bg-color': '#tu-color-fondo',
    '--svg-primary-color': '#tu-color-primario',
    '--svg-secondary-color': '#tu-color-secundario',
    '--svg-accent-color': '#tu-color-acento',
    '--svg-filter': 'brightness(1.1) saturate(1.2)'
  }
}
```

### 2. **Agregar Selectores CSS Específicos**
En `src/sw-diagrams.css`:

```css
/* Para colores específicos de tu tema */
.svg-themeable rect[fill="#tu-color-especifico"] {
  fill: var(--svg-bg-color) !important;
}
```

## 🎭 Efectos Especiales

### **Filtros CSS Disponibles**
- `brightness()` - Brillo
- `contrast()` - Contraste
- `saturate()` - Saturación
- `hue-rotate()` - Rotación de tono
- `sepia()` - Efecto sepia
- `drop-shadow()` - Sombra

### **Animaciones**
- `neon-pulse` - Para el tema Neón Brillante
- Puedes crear animaciones personalizadas en CSS

## 🚀 Uso en el Código

### **Aplicación Automática**
Los estilos se aplican automáticamente cuando:
1. Se carga la página
2. Se cambia de tema
3. Se agregan nuevos nodos

### **Función Manual**
```javascript
// Aplicar estilos manualmente
applyThemeToSVGs();

// Escuchar cambios de tema
document.addEventListener('themeChanged', function(event) {
  console.log('Tema cambiado:', event.detail.theme);
});
```

## 🔍 Debugging

### **Verificar Variables CSS**
```javascript
// En la consola del navegador
getComputedStyle(document.documentElement).getPropertyValue('--svg-bg-color');
```

### **Verificar Clases Aplicadas**
```javascript
// Verificar que los SVGs tienen la clase correcta
document.querySelectorAll('.svg-themeable');
```

### **Forzar Aplicación de Tema**
```javascript
// Forzar aplicación de estilos
window.themeEngine?.applyTheme('dark');
```

## 📚 Ejemplos de Uso

### **SVG Simple**
```svg
<svg width="200" height="180" viewBox="0 0 200 180" fill="none">
  <rect width="200" height="180" fill="#8592AD"/>
  <circle cx="100" cy="90" r="30" fill="white"/>
</svg>
```

### **SVG Complejo**
```svg
<svg width="200" height="180" viewBox="0 0 200 180" fill="none">
  <rect width="200" height="180" fill="#8592AD"/>
  <rect x="20" y="20" width="160" height="140" fill="white" stroke="#A3ADC2"/>
  <path d="..." fill="#A3ADC2"/>
</svg>
```

## ⚠️ Consideraciones

1. **Colores Hardcodeados**: Los SVGs deben usar los colores estándar para que funcionen los selectores CSS
2. **Performance**: Los filtros CSS pueden afectar el rendimiento en dispositivos lentos
3. **Compatibilidad**: Algunos filtros CSS no funcionan en navegadores antiguos
4. **Mantenimiento**: Al agregar nuevos colores, actualiza los selectores CSS correspondientes

## 🎯 Mejores Prácticas

1. **Usa colores estándar** en tus SVGs
2. **Mantén consistencia** en la paleta de colores
3. **Prueba en diferentes temas** antes de publicar
4. **Documenta cambios** en los colores
5. **Optimiza SVGs** para mejor rendimiento 