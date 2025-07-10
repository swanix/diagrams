# 🎨 Sistema de Templates y Alpine.js

## 🎯 **Descripción General**

Este documento describe el sistema de templates actual y las futuras implementaciones usando Alpine.js para crear interfaces más dinámicas y mantenibles en el sistema de diagramas SVG.

## 📋 **Estado Actual**

### **Sistema Actual (HTML Hardcodeado)**
El código actual en `sw-diagrams.js` crea el HTML directamente en JavaScript:

```javascript
// Líneas 661-669 en sw-diagrams.js
sidePanel.innerHTML = `
  <div class="side-panel-header">
    <h3 class="side-panel-title">Detalles del Nodo</h3>
    <button class="side-panel-close" onclick="closeSidePanel()">×</button>
  </div>
  <div class="side-panel-content" id="side-panel-content">
  </div>
`;
```

### **Ventajas del Sistema Actual**
- ✅ **Rápido** - Sin overhead de carga de templates
- ✅ **Simple** - Todo en un archivo
- ✅ **Funcional** - Cumple su propósito

### **Limitaciones del Sistema Actual**
- ❌ **HTML mezclado** con JavaScript
- ❌ **Difícil personalización** - Requiere modificar código core
- ❌ **No reutilizable** - Código duplicado en múltiples lugares
- ❌ **Mantenimiento complejo** - Cambios de UI requieren tocar lógica

## 🚀 **Futura Implementación: Alpine.js + Template Engine**

### **¿Qué es Alpine.js?**
Alpine.js es un framework JavaScript minimalista (~15KB) que permite crear interfaces reactivas directamente en HTML, sin necesidad de escribir mucho JavaScript.

### **¿Por qué Alpine.js?**
- ✅ **Tamaño mínimo** - Solo 15KB vs 35KB+ de otros frameworks
- ✅ **Sin build step** - Funciona directamente en el navegador
- ✅ **Sintaxis declarativa** - Más legible y mantenible
- ✅ **Reactividad automática** - Los cambios se reflejan automáticamente
- ✅ **Compatible** - Funciona perfectamente con D3.js

## 🏗️ **Arquitectura Propuesta**

### **Estructura de Archivos**
```
📁 diagrams/
├── 📁 readme/                    # 📚 Documentación
├── 📁 src/                       # 💻 Código fuente
│   ├── sw-diagrams.js            # 🧠 Lógica principal
│   ├── sw-diagrams.css           # 🎨 Estilos principales
│   ├── js/
│   │   └── template-loader.js    # 🔧 Cargador de templates
│   └── 📁 templates/             # 🎨 Plantillas HTML
│       ├── side-panel.html       # Panel lateral
│       ├── theme-selector.html   # Selector de temas
│       ├── node-details.html     # Detalles de nodos
│       └── modal.html            # Modales
└── 📁 docs/                      # 📖 Demos y ejemplos
```

### **Template Loader Independiente**
```javascript
// js/template-loader.js
class TemplateLoader {
    static templates = new Map();
    static initialized = false;
    
    // Inicializar el sistema
    static async init() {
        if (this.initialized) return;
        
        // Cargar todos los templates automáticamente
        await this.loadAllTemplates();
        this.initialized = true;
    }
    
    // Cargar templates desde archivos
    static async loadAllTemplates() {
        const templateConfig = [
            { name: 'side-panel', url: 'templates/side-panel.html' },
            { name: 'theme-selector', url: 'templates/theme-selector.html' },
            { name: 'node-details', url: 'templates/node-details.html' }
        ];
        
        const promises = templateConfig.map(config => 
            this.loadTemplate(config.name, config.url)
        );
        
        await Promise.all(promises);
    }
    
    // Renderizar template con datos
    static render(name, data = {}) {
        let template = this.templates.get(name);
        
        if (!template) {
            console.error(`Template '${name}' no encontrado`);
            return '';
        }
        
        // Reemplazar variables {{variable}}
        return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
            const value = this.getNestedValue(data, key);
            return value !== undefined ? value : match;
        });
    }
    
    // Renderizar en un elemento específico
    static renderIn(elementId, templateName, data = {}) {
        const element = document.getElementById(elementId);
        if (!element) {
            console.error(`Elemento '${elementId}' no encontrado`);
            return;
        }
        
        element.innerHTML = this.render(templateName, data);
    }
}
```

## 📝 **Ejemplos de Templates**

### **1. Side Panel con Alpine.js**
```html
<!-- templates/side-panel.html -->
<div x-data="sidePanel" 
     x-show="isVisible" 
     x-transition
     class="side-panel">
    
    <div class="side-panel-header">
        <h3 class="side-panel-title" x-text="node.name">Detalles del Nodo</h3>
        <div class="side-panel-actions">
            <button class="side-panel-action-btn" 
                    title="Editar nodo" 
                    @click="editNode()">✏️</button>
            <button class="side-panel-action-btn" 
                    title="Eliminar nodo" 
                    @click="deleteNode()">🗑️</button>
            <button class="side-panel-close" 
                    @click="close()">×</button>
        </div>
    </div>
    
    <div class="side-panel-content">
        <template x-for="field in fields" :key="field.key">
            <div class="side-panel-field">
                <div class="side-panel-label" x-text="field.label"></div>
                <div class="side-panel-value" 
                     :class="{ 'empty': !field.value }"
                     x-text="field.value || 'Sin datos'"></div>
            </div>
        </template>
        
        <!-- Sección de estadísticas -->
        <div class="side-panel-section" x-show="showStats">
            <h4 class="side-panel-section-title">📊 Estadísticas</h4>
            <div class="side-panel-stats">
                <div class="stat-item">
                    <span class="stat-label">Hijos:</span>
                    <span class="stat-value" x-text="stats.childrenCount"></span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Nivel:</span>
                    <span class="stat-value" x-text="stats.level"></span>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
// Datos reactivos para el side panel
window.sidePanel = {
    isVisible: false,
    node: {},
    fields: [],
    stats: {},
    showStats: false,
    
    open(nodeData) {
        this.node = nodeData;
        this.fields = this.getFields(nodeData);
        this.stats = this.getStats(nodeData);
        this.showStats = this.stats.childrenCount > 0;
        this.isVisible = true;
    },
    
    close() {
        this.isVisible = false;
    },
    
    editNode() {
        // Lógica de edición
        console.log('Editando nodo:', this.node);
    },
    
    deleteNode() {
        // Lógica de eliminación
        console.log('Eliminando nodo:', this.node);
    },
    
    getFields(node) {
        return [
            { key: 'name', label: 'Nombre', value: node.name },
            { key: 'subtitle', label: 'Descripción', value: node.subtitle },
            { key: 'type', label: 'Tipo', value: node.type },
            { key: 'url', label: 'Enlace', value: node.url }
        ];
    },
    
    getStats(node) {
        return {
            childrenCount: node.children ? node.children.length : 0,
            level: this.calculateLevel(node)
        };
    },
    
    calculateLevel(node) {
        // Lógica para calcular el nivel del nodo
        return 1; // Placeholder
    }
};
</script>
```

### **2. Selector de Temas con Alpine.js**
```html
<!-- templates/theme-selector.html -->
<div x-data="themeSelector" 
     class="theme-selector">
    
    <div class="theme-selector-header">
        <h3 x-text="title">Temas</h3>
        <button @click="toggle()" 
                class="theme-toggle-btn"
                :class="{ 'active': isOpen }">
            🎨
        </button>
    </div>
    
    <div x-show="isOpen" 
         x-transition
         class="theme-selector-content">
        
        <div class="theme-categories">
            <button @click="setCategory('light')" 
                    :class="{ 'active': category === 'light' }"
                    class="category-btn">
                ☀️ Claros
            </button>
            <button @click="setCategory('dark')" 
                    :class="{ 'active': category === 'dark' }"
                    class="category-btn">
                🌙 Oscuros
            </button>
        </div>
        
        <div class="theme-grid">
            <template x-for="theme in filteredThemes" :key="theme.id">
                <div class="theme-item" 
                     :class="{ 'active': currentTheme === theme.id }"
                     @click="selectTheme(theme.id)">
                    <div class="theme-preview" 
                         :style="getThemePreview(theme)"></div>
                    <div class="theme-info">
                        <h4 x-text="theme.name"></h4>
                        <p x-text="theme.description"></p>
                    </div>
                </div>
            </template>
        </div>
    </div>
</div>

<script>
window.themeSelector = {
    isOpen: false,
    category: 'light',
    currentTheme: 'snow',
    title: 'Seleccionar Tema',
    
    get filteredThemes() {
        return this.themes.filter(theme => theme.category === this.category);
    },
    
    get themes() {
        return [
            { id: 'snow', name: 'Nieve', description: 'Tema claro y limpio', category: 'light' },
            { id: 'onyx', name: 'Ónix', description: 'Tema oscuro elegante', category: 'dark' },
            { id: 'vintage', name: 'Vintage', description: 'Tema retro cálido', category: 'light' },
            { id: 'forest', name: 'Bosque', description: 'Tema verde natural', category: 'dark' }
        ];
    },
    
    toggle() {
        this.isOpen = !this.isOpen;
    },
    
    setCategory(cat) {
        this.category = cat;
    },
    
    selectTheme(themeId) {
        this.currentTheme = themeId;
        // Disparar evento para cambiar tema
        this.$dispatch('theme-changed', { theme: themeId });
    },
    
    getThemePreview(theme) {
        // Retornar estilos CSS para preview
        const previews = {
            snow: 'background: linear-gradient(45deg, #f8f9fa, #e9ecef)',
            onyx: 'background: linear-gradient(45deg, #212529, #343a40)',
            vintage: 'background: linear-gradient(45deg, #f4e4c1, #d4a574)',
            forest: 'background: linear-gradient(45deg, #2d5016, #4a7c59)'
        };
        return previews[theme.id] || '';
    }
};
</script>
```

## 🔧 **Implementación Gradual**

### **Fase 1: Preparación (Actual)**
1. ✅ Documentar el sistema actual
2. ✅ Crear estructura de templates
3. ✅ Implementar Template Loader básico

### **Fase 2: Migración del Side Panel**
```javascript
// En sw-diagrams.js
async function createSidePanel() {
    // Cargar template
    await TemplateLoader.init();
    
    // Renderizar side panel
    TemplateLoader.renderIn('side-panel-container', 'side-panel', {
        node: currentNode
    });
}
```

### **Fase 3: Migración del Theme Selector**
```javascript
// En sw-diagrams.js
async function createThemeSelector() {
    await TemplateLoader.init();
    
    TemplateLoader.renderIn('theme-selector-container', 'theme-selector', {
        currentTheme: getCurrentTheme()
    });
}
```

### **Fase 4: Componentes Adicionales**
- Modales de confirmación
- Formularios de edición
- Filtros de nodos
- Búsqueda avanzada

## 📊 **Comparación de Rendimiento**

| Método | Tamaño | Tiempo de Carga | Reactividad | Mantenibilidad |
|--------|--------|-----------------|-------------|----------------|
| **HTML Hardcodeado** | 0KB | Instantáneo | ❌ Manual | ❌ Baja |
| **Template Engine** | ~5KB | +50ms | ❌ Manual | ✅ Media |
| **Alpine.js** | ~15KB | +100ms | ✅ Automática | ✅ Alta |

## 🎯 **Ventajas de la Implementación Propuesta**

### **✅ Para Desarrolladores**
- **Código más limpio** - Separación de responsabilidades
- **Fácil mantenimiento** - Templates independientes
- **Reutilización** - Componentes modulares
- **Testing** - Componentes aislados

### **✅ Para Usuarios**
- **Interfaces más fluidas** - Transiciones suaves
- **Mejor UX** - Reactividad automática
- **Personalización** - Temas dinámicos
- **Rendimiento** - Carga optimizada

### **✅ Para el Proyecto**
- **Escalabilidad** - Fácil agregar funcionalidades
- **Colaboración** - Frontend y backend independientes
- **Documentación** - Templates autodocumentados
- **Futuro** - Base para funcionalidades avanzadas

## 🚀 **Próximos Pasos**

### **Inmediato (1-2 semanas)**
1. Implementar Template Loader básico
2. Migrar side panel a templates
3. Crear documentación de uso

### **Corto Plazo (1-2 meses)**
1. Migrar theme selector
2. Agregar componentes adicionales
3. Optimizar rendimiento

### **Medio Plazo (3-6 meses)**
1. Implementar Alpine.js completo
2. Agregar funcionalidades avanzadas
3. Crear sistema de plugins

## 📚 **Recursos Adicionales**

### **Documentación Alpine.js**
- [Sitio oficial](https://alpinejs.dev/)
- [Guía de inicio](https://alpinejs.dev/docs/start-here)
- [Ejemplos](https://alpinejs.dev/examples)

### **Ejemplos de Implementación**
- [Template Loader básico](./examples/template-loader-basic.html)
- [Side Panel con Alpine.js](./examples/side-panel-alpine.html)
- [Theme Selector avanzado](./examples/theme-selector-advanced.html)

---

## 🎯 **Conclusión**

La implementación de Alpine.js con un sistema de templates modular transformará el sistema de diagramas SVG en una plataforma más moderna, mantenible y escalable. La migración gradual permitirá mantener la funcionalidad actual mientras se mejora la arquitectura del código.

**¿Listo para empezar?** Comienza con la implementación del Template Loader básico y migra el side panel como primer paso. 