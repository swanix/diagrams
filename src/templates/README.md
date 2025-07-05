# Sistema de Plantillas para Side Panel

Este sistema permite separar las plantillas HTML de la lógica JavaScript, facilitando la personalización y mantenimiento del side panel.

## 📁 Estructura de Archivos

```
src/templates/
├── side-panel.html          # Plantillas HTML
├── template-engine.js       # Motor de plantillas
├── config.js               # Configuración de campos
└── README.md               # Esta documentación
```

## 🎯 Cómo Funciona

### 1. **Plantillas HTML** (`side-panel.html`)
Contiene las plantillas HTML usando la sintaxis `{{variable}}`:

```html
<template id="field-template">
  <div class="side-panel-field">
    <div class="side-panel-label">{{label}}</div>
    <div class="side-panel-value">{{value}}</div>
  </div>
</template>
```

### 2. **Motor de Plantillas** (`template-engine.js`)
Sistema simple que reemplaza variables en las plantillas:

```javascript
// Renderizar plantilla
const html = templateEngine.render('field-template', {
  label: 'Nombre',
  value: 'Juan Pérez'
});
```

### 3. **Configuración** (`config.js`)
Define campos, tipos y comportamiento:

```javascript
const SIDE_PANEL_CONFIG = {
  fields: [
    { key: 'name', label: 'Nombre', type: 'text' },
    { key: 'email', label: 'Email', type: 'email' }
  ],
  fieldTypes: {
    email: {
      render: (value) => `<a href="mailto:${value}">${value}</a>`
    }
  }
};
```

## 🛠️ Cómo Personalizar

### **Agregar Nuevos Campos**

1. **Editar `config.js`:**
```javascript
fields: [
  // ... campos existentes
  { key: 'phone', label: 'Teléfono', type: 'phone' }
],
fieldTypes: {
  // ... tipos existentes
  phone: {
    render: (value) => `<a href="tel:${value}">${value}</a>`
  }
}
```

2. **Agregar estilos CSS** (opcional):
```css
.phone-field {
  color: #007bff;
}
```

### **Agregar Nuevas Plantillas**

1. **Crear plantilla en `side-panel.html`:**
```html
<template id="custom-section-template">
  <div class="custom-section">
    <h4>{{title}}</h4>
    <p>{{content}}</p>
  </div>
</template>
```

2. **Usar en JavaScript:**
```javascript
html += templateEngine.render('custom-section-template', {
  title: 'Mi Sección',
  content: 'Contenido personalizado'
});
```

### **Modificar Plantillas Existentes**

Simplemente edita el archivo `side-panel.html`:

```html
<!-- Cambiar el título del panel -->
<template id="side-panel-template">
  <div class="side-panel" id="side-panel">
    <div class="side-panel-header">
      <h3 class="side-panel-title">{{title}}</h3>
      <!-- ... resto de la plantilla -->
    </div>
  </div>
</template>
```

## 🎨 Tipos de Campos Disponibles

- **text**: Texto normal
- **url**: Enlaces clickeables
- **image**: Imágenes
- **status**: Estados con colores
- **priority**: Prioridades con colores
- **date**: Fechas formateadas
- **email**: Enlaces de email

## 🔧 Ventajas del Sistema

### ✅ **Separación de Responsabilidades**
- HTML en archivos `.html`
- Lógica en archivos `.js`
- Configuración centralizada

### ✅ **Fácil Personalización**
- Cambiar plantillas sin tocar JavaScript
- Agregar campos desde configuración
- Reutilizar plantillas

### ✅ **Mantenimiento Simplificado**
- Plantillas legibles y organizadas
- Configuración centralizada
- Fácil debugging

### ✅ **Escalabilidad**
- Fácil agregar nuevos tipos de campos
- Plantillas reutilizables
- Sistema modular

## 🚀 Alternativas para Proyectos Más Complejos

### **Vue.js** (Recomendado)
```javascript
// Componente Vue
Vue.component('side-panel', {
  template: `
    <div class="side-panel">
      <h3>{{ title }}</h3>
      <div v-for="field in fields" :key="field.key">
        <label>{{ field.label }}</label>
        <span>{{ field.value }}</span>
      </div>
    </div>
  `,
  props: ['nodeData']
});
```

### **React**
```jsx
// Componente React
const SidePanel = ({ nodeData }) => (
  <div className="side-panel">
    <h3>Detalles del Nodo</h3>
    {fields.map(field => (
      <div key={field.key}>
        <label>{field.label}</label>
        <span>{field.value}</span>
      </div>
    ))}
  </div>
);
```

## 📝 Notas Importantes

- Las plantillas se cargan de forma asíncrona
- Si falla la carga, se usan plantillas por defecto
- Las variables usan sintaxis `{{variable}}`
- El motor es simple pero efectivo para este caso de uso

¡El sistema está listo para usar y personalizar! 🎉 