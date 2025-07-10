# Theme Loader - Sistema de Carga Temprana de Temas

## 🎯 **Propósito**

El `theme-loader.js` es un sistema diseñado para **evitar el FOUC (Flash of Unstyled Content)** aplicando el tema guardado **antes** de que se cargue el CSS principal.

## 🔧 **Problema que Resuelve**

### **FOUC (Flash of Unstyled Content)**
- **Síntoma**: Parpadeo blanco al refrescar en modo oscuro
- **Causa**: CSS se carga antes que JavaScript, aplicando valores fallback claros
- **Elementos afectados**: Diagram switcher, theme toggle, topbar, botones

### **Ejemplo del Problema:**
```css
.diagram-switcher {
    background: var(--switcher-bg, #fff); /* Fallback blanco */
}
.theme-toggle {
    background: var(--theme-toggle-bg, #fff); /* Fallback blanco */
}
```

## 🛠️ **Solución Implementada**

### **1. Carga Temprana de Variables CSS**

```javascript
// theme-loader.js se ejecuta inmediatamente
(function() {
  'use strict';
  
  // Aplicar tema antes de que se cargue el CSS principal
  function applyThemeEarly(themeId) {
    document.body.classList.add('theme-' + themeId);
    
    const variables = themeVariables[themeId] || themeVariables.snow;
    Object.keys(variables).forEach(varName => {
      document.documentElement.style.setProperty(varName, variables[varName]);
      document.body.style.setProperty(varName, variables[varName]);
    });
  }
  
  // Ejecutar inmediatamente
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEarlyTheme);
  } else {
    initEarlyTheme();
  }
})();
```

### **2. Variables CSS Mínimas pero Esenciales**

```javascript
const themeVariables = {
  onyx: {
    '--bg-color': '#181c24',
    '--text-color': '#f6f7f9',
    '--node-fill': '#23272f',
    '--side-panel-bg': '#23272f',
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
    '--topbar-bg': '#23272f',
    '--control-bg': '#23272f',
    '--control-text': '#f6f7f9',
    '--control-border': '#333'
  }
  // ... otros temas
};
```

### **3. Ocultar Elementos hasta Aplicar Tema**

```css
/* Ocultar elementos hasta que se aplique el tema */
.diagram-switcher,
.theme-toggle,
.topbar {
    opacity: 0;
    transition: opacity 0.3s ease;
}

/* Mostrar elementos cuando el tema esté aplicado */
body.theme-onyx .diagram-switcher,
body.theme-onyx .theme-toggle,
body.theme-onyx .topbar {
    opacity: 1;
}
```

## 🔄 **Flujo de Ejecución**

### **Orden de Carga Correcto:**

```html
<script src="theme-loader.js"></script>     <!-- 1. Aplica tema temprano -->
<link rel="stylesheet" href="sw-diagrams.css"> <!-- 2. CSS con elementos ocultos -->
<script src="sw-diagrams.js"></script>      <!-- 3. Funcionalidad completa -->
```

### **Secuencia Temporal:**

1. **theme-loader.js** se ejecuta inmediatamente
2. **Aplica variables CSS básicas** para evitar FOUC
3. **CSS principal se carga** con elementos ocultos
4. **sw-diagrams.js se ejecuta** y aplica tema completo
5. **Elementos se muestran** con tema correcto

## 🔗 **Integración con el Sistema de Temas**

### **Sin Conflicto de Variables**

El sistema está diseñado para **evitar conflictos**:

```javascript
// 1. theme-loader.js (temprano): Variables básicas
'--diagram-btn-bg': '#23272f'  // Solo lo esencial

// 2. sw-diagrams.js (después): Variables completas del JSON
'--diagram-btn-bg': '#23272f',           // Mismo valor
'--diagram-btn-bg-hover': '#2a2f3a',     // Variable adicional
'--diagram-btn-shadow': '0 2px 4px...'   // Variable adicional
```

### **Sobrescritura Completa**

```javascript
// sw-diagrams.js sobrescribe TODAS las variables
Object.keys(themeVariables).forEach(varName => {
  targetElement.style.setProperty(varName, themeVariables[varName]);
  document.body.style.setProperty(varName, themeVariables[varName]);
  document.documentElement.style.setProperty(varName, themeVariables[varName]);
});
```

## 🎛️ **Configuración y Personalización**

### **Configuración desde HTML**

```html
<div class="sw-diagram-container" 
  data-themes='{
    "light": "snow",
    "dark": "onyx"
  }'>
</div>
```

### **Clave de Almacenamiento Única**

```javascript
function getStorageKey() {
  const path = window.location.pathname;
  const filename = path.split('/').pop() || 'index.html';
  return `selectedTheme_${filename}`;
}
```

### **Primera Vez vs. Visitas Posteriores**

```javascript
const isFirstTime = !localStorage.getItem(`themeSystemInitialized_${storageKey}`);

if (isFirstTime) {
  // Primera vez: usar tema claro por defecto
  currentTheme = config.lightTheme;
  localStorage.setItem(`themeSystemInitialized_${storageKey}`, 'true');
} else {
  // Visitas posteriores: usar tema guardado
  currentTheme = localStorage.getItem(storageKey);
}
```

## 📊 **Temas Soportados**

### **Temas Incluidos:**
- **snow**: Tema claro por defecto
- **onyx**: Tema oscuro principal
- **vintage**: Tema cálido y retro
- **pastel**: Tema suave y colorido
- **neon**: Tema cyberpunk
- **forest**: Tema natural y verde

### **Variables por Tema:**
Cada tema incluye variables para:
- Colores de fondo y texto
- Elementos de interfaz (switcher, botones, topbar)
- Estados de botones (normal, activo, hover, disabled)
- Elementos SVG (nodos, enlaces, clusters)

## 🚀 **Ventajas de la Implementación**

### **✅ Beneficios:**
- **Sin FOUC**: Elimina completamente el parpadeo
- **Performance**: Variables mínimas, carga rápida
- **Compatibilidad**: Funciona con todos los temas
- **Mantenibilidad**: Código limpio y bien documentado
- **Escalabilidad**: Fácil agregar nuevos temas

### **✅ Características Técnicas:**
- **Ejecución inmediata**: No espera DOMContentLoaded
- **Fallbacks robustos**: Funciona si falla la carga del JSON
- **Claves únicas**: Cada archivo tiene su propio tema
- **Transiciones suaves**: Fade-in de 0.3s
- **Sobrescritura limpia**: Sin conflictos de variables

## 🔍 **Debugging y Troubleshooting**

### **Verificar Funcionamiento:**

```javascript
// En consola del navegador
console.log('Tema actual:', localStorage.getItem('selectedTheme_index.html'));
console.log('Variables aplicadas:', getComputedStyle(document.documentElement).getPropertyValue('--switcher-bg'));
```

### **Problemas Comunes:**

1. **FOUC persiste**: Verificar orden de carga en HTML
2. **Variables no aplicadas**: Verificar que theme-loader.js se cargue primero
3. **Tema incorrecto**: Verificar localStorage y configuración HTML

### **Logs de Debug:**

```javascript
console.log('[Theme Loader] Tema aplicado tempranamente:', themeId);
console.log('[Theme System] Tema actual:', currentTheme);
console.log('[Theme] Switcher colors are now handled by CSS variables');
```

## 📝 **Notas de Implementación**

### **Consideraciones Importantes:**
- **theme-loader.js debe cargarse ANTES** que el CSS principal
- **Variables mínimas** para evitar impacto en performance
- **Sobrescritura completa** en sw-diagrams.js para evitar conflictos
- **Transiciones CSS** para mejor experiencia de usuario

### **Mantenimiento:**
- Agregar nuevas variables al theme-loader.js cuando sea necesario
- Mantener sincronización entre theme-loader.js y themes.json
- Documentar cambios en variables CSS

## 🔗 **Archivos Relacionados**

- `src/theme-loader.js`: Sistema de carga temprana
- `src/themes.json`: Variables CSS completas
- `src/sw-diagrams.css`: Estilos con elementos ocultos
- `src/sw-diagrams.js`: Sistema de temas completo
- `src/FOUC_FIX_README.md`: Documentación del problema FOUC 