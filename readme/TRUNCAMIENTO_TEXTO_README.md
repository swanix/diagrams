# 📝 Truncamiento de Texto y Tooltips en Side Panel

## 🎯 **Descripción**

Se ha implementado una mejora en el sistema de diagramas SVG que **trunca automáticamente los textos largos** en el panel lateral (side panel) y muestra **tooltips con el texto completo** al hacer hover, mejorando significativamente la presentación visual y la legibilidad.

## 🔄 **Problema Resuelto**

### **Antes de la Mejora**
- Los textos largos generaban saltos de línea no deseados
- El side panel se volvía desordenado y difícil de leer
- No había forma de ver el texto completo sin romper el diseño
- La presentación visual era inconsistente

### **Después de la Mejora**
- Los textos largos se truncan automáticamente con "..."
- Tooltips elegantes muestran el texto completo al hacer hover
- Diseño limpio y consistente
- Mejor experiencia de usuario y legibilidad

## 🛠️ **Implementación Técnica**

### **1. Estilos CSS para Truncamiento**

Se modificaron los estilos de `.side-panel-label` y `.side-panel-value`:

```css
.side-panel-label {
  /* ... otros estilos ... */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  position: relative;
  cursor: help;
}

.side-panel-value {
  /* ... otros estilos ... */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  position: relative;
  cursor: help;
}
```

### **2. Estilos CSS para Tooltips**

Se agregaron estilos para tooltips elegantes:

```css
.side-panel-label[title]:hover::after,
.side-panel-value[title]:hover::after {
  content: attr(title);
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background-color: var(--side-panel-bg);
  color: var(--side-panel-text);
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 13px;
  white-space: pre-wrap;
  max-width: 300px;
  word-wrap: break-word;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 1px solid var(--side-panel-border);
  z-index: 10000;
  pointer-events: none;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s ease, visibility 0.2s ease;
}
```

### **3. Lógica JavaScript para Tooltips**

Se modificó la función `generateSidePanelContent()` para agregar atributos `title`:

```javascript
// Add title attribute for tooltip if text is long
const labelTitle = label.length > 20 ? label : '';
const valueTitle = (value && value.length > 30) ? value : '';

html += `
  <div class="side-panel-field">
    <div class="side-panel-label" ${labelTitle ? `title="${labelTitle}"` : ''}>${label}</div>
    <div class="side-panel-value ${!value ? 'empty' : ''}" ${valueTitle ? `title="${valueTitle}"` : ''}>
      ${isUrlValue ? 
        `<a href="${displayValue}" target="_blank" rel="noreferrer" class="side-panel-url-link">Visit</a>` : 
        value || '-'
      }
    </div>
  </div>
`;
```

## ✅ **Ventajas de la Mejora**

### **1. Presentación Visual Mejorada**
- ✅ Diseño limpio y consistente
- ✅ Sin saltos de línea no deseados
- ✅ Mejor organización visual
- ✅ Interfaz más profesional

### **2. Experiencia de Usuario**
- ✅ Información completa disponible en tooltips
- ✅ Cursor normal (flecha) sin indicadores adicionales
- ✅ Transiciones suaves en tooltips
- ✅ Accesibilidad mejorada
- ✅ Interfaz limpia y discreta

### **3. Flexibilidad**
- ✅ Umbrales configurables (20 chars para labels, 30 para valores)
- ✅ Tooltips adaptados al tema actual
- ✅ Soporte para textos multilínea en tooltips
- ✅ Compatible con todos los tipos de contenido

## 📋 **Umbrales de Truncamiento**

| Tipo de Campo | Umbral | Comportamiento |
|---------------|--------|----------------|
| **Labels** | > 20 caracteres | Se trunca con "..." y muestra tooltip |
| **Values** | > 30 caracteres | Se trunca con "..." y muestra tooltip |
| **URLs** | > 30 caracteres | Se trunca con "..." y muestra tooltip |
| **Descripciones** | > 30 caracteres | Se trunca con "..." y muestra tooltip |

## 🎨 **Características de los Tooltips**

### **Diseño Visual**
- **Fondo**: Adaptado al tema actual del side panel
- **Borde**: Sutil con color del tema
- **Sombra**: Elegante para separación visual
- **Ancho máximo**: 300px para legibilidad
- **Padding**: 8px 12px para espaciado cómodo

### **Comportamiento**
- **Posición**: Aparece arriba del elemento
- **Animación**: Fade in/out suave (0.2s)
- **Multilínea**: Soporte para textos largos con `white-space: pre-wrap`
- **Cursor**: Normal (flecha) sin indicadores adicionales
- **Discreto**: Sin indicadores visuales previos

### **Accesibilidad**
- **Z-index**: 10000 para estar por encima de otros elementos
- **Pointer events**: Deshabilitados para evitar interferencias
- **Transiciones**: Suaves para mejor UX

## 📋 **Ejemplos Prácticos**

### **Ejemplo 1: Texto Largo en Label**

**Antes:**
```
Very Long Department Name That Exceeds Width: Engineering
```

**Después:**
```
Very Long Department...: Engineering
```
*Hover muestra: "Very Long Department Name That Exceeds Width"*

### **Ejemplo 2: Texto Largo en Value**

**Antes:**
```
Description: This is a very long description that breaks the layout and makes the side panel look messy
```

**Después:**
```
Description: This is a very long desc...
```
*Hover muestra: "This is a very long description that breaks the layout and makes the side panel look messy"*

### **Ejemplo 3: URL Larga**

**Antes:**
```
URL: https://example.com/very-long-path-that-breaks-the-layout-and-makes-it-look-messy
```

**Después:**
```
URL: https://example.com/very-long...
```
*Hover muestra: "https://example.com/very-long-path-that-breaks-the-layout-and-makes-it-look-messy"*

## 🧪 **Pruebas**

### **Archivo de Prueba**
Se creó `src/test-text-truncation.html` para verificar la funcionalidad:

1. Abre `http://localhost:8000/src/test-text-truncation.html`
2. Haz clic en cualquier nodo para abrir el side panel
3. Verifica que textos largos se trunquen con "..."
4. Haz hover sobre textos truncados para ver tooltips
5. Prueba con diferentes longitudes de texto

### **CSV de Prueba**
El archivo `src/data/test-long-text.csv` contiene:
- Textos de diferentes longitudes
- URLs largas
- Descripciones extensas
- Casos edge para verificar robustez

### **Casos de Prueba**

| Caso | Longitud | Comportamiento Esperado |
|------|----------|-------------------------|
| **Caso 1** | Label: 15 chars | Sin truncamiento, sin tooltip |
| **Caso 2** | Label: 25 chars | Con truncamiento, con tooltip |
| **Caso 3** | Value: 25 chars | Sin truncamiento, sin tooltip |
| **Caso 4** | Value: 35 chars | Con truncamiento, con tooltip |
| **Caso 5** | URL: 40 chars | Con truncamiento, con tooltip |
| **Caso 6** | Texto multilínea | Tooltip con formato multilínea |

## 🔧 **Configuración**

### **Umbrales Personalizables**
Los umbrales se pueden modificar en la función `generateSidePanelContent()`:

```javascript
const labelTitle = label.length > 20 ? label : '';  // Umbral para labels
const valueTitle = (value && value.length > 30) ? value : '';  // Umbral para valores
```

### **Estilos de Tooltip Personalizables**
Los estilos se pueden modificar en `sw-diagrams.css`:

```css
.side-panel-label[title]:hover::after,
.side-panel-value[title]:hover::after {
  max-width: 300px;  // Ancho máximo del tooltip
  font-size: 13px;   // Tamaño de fuente
  padding: 8px 12px; // Padding interno
}
```

## 🎯 **Flujo de Usuario**

### **Flujo Típico**
1. **Usuario abre side panel** → Se genera contenido con truncamiento
2. **Textos largos se truncan** → Se muestran con "..."
3. **Usuario hace hover** → Aparece tooltip con texto completo
4. **Usuario mueve cursor** → Tooltip desaparece suavemente

### **Flujo de Fallback**
1. **Texto corto** → Sin truncamiento, sin tooltip
2. **Sin atributo title** → Sin tooltip
3. **CSS no soportado** → Comportamiento normal sin truncamiento

## 🔍 **Depuración**

### **Verificar Truncamiento**
Abre la consola del navegador y ejecuta:

```javascript
// Verificar estilos de truncamiento
const labels = document.querySelectorAll('.side-panel-label');
const values = document.querySelectorAll('.side-panel-value');

labels.forEach((label, index) => {
  const styles = window.getComputedStyle(label);
  console.log(`Label ${index + 1}:`, {
    textOverflow: styles.textOverflow,
    overflow: styles.overflow,
    whiteSpace: styles.whiteSpace,
    hasTitle: label.hasAttribute('title')
  });
});
```

### **Verificar Tooltips**
```javascript
// Verificar tooltips
const elementsWithTooltips = document.querySelectorAll('[title]');
console.log('Elementos con tooltips:', elementsWithTooltips.length);

elementsWithTooltips.forEach(el => {
  console.log('Tooltip:', el.getAttribute('title'));
});
```

## 📚 **Archivos Modificados**

| Archivo | Cambio | Descripción |
|---------|--------|-------------|
| `src/sw-diagrams.css` | `.side-panel-label` | Estilos de truncamiento |
| `src/sw-diagrams.css` | `.side-panel-value` | Estilos de truncamiento |
| `src/sw-diagrams.css` | Tooltip styles | Estilos para tooltips |
| `src/sw-diagrams.js` | `generateSidePanelContent()` | Lógica para tooltips |
| `src/test-text-truncation.html` | Nuevo | Archivo de prueba |
| `src/data/test-long-text.csv` | Nuevo | Datos de prueba |
| `src/TRUNCAMIENTO_TEXTO_README.md` | Nuevo | Documentación |

## 🎉 **Conclusión**

Esta mejora hace que el sistema sea **más limpio, profesional y fácil de usar**. El truncamiento automático de textos largos elimina los problemas de diseño, mientras que los tooltips elegantes proporcionan acceso completo a la información sin comprometer la presentación visual.

**¿Los textos largos rompían el diseño?** Ahora se truncan automáticamente con "..."
**¿Cómo ver el texto completo?** Haz hover sobre el texto truncado para ver el tooltip
**¿Se pueden personalizar los umbrales?** Sí, modificando los valores en el código
**¿Los tooltips se adaptan al tema?** Sí, usan las variables CSS del tema actual
**¿Hay indicadores visuales adicionales?** No, cursor normal (flecha) sin indicadores adicionales

## 🔄 **Compatibilidad**

- ✅ **Hacia atrás compatible**: No afecta CSV existentes
- ✅ **Automático**: No requiere configuración
- ✅ **Responsive**: Se adapta a diferentes tamaños
- ✅ **Accesible**: Tooltips informativos con cursor normal 