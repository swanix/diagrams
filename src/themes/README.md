# Sistema de Temas para Swanix Diagrams

Un sistema completo para personalizar la apariencia de los diagramas con múltiples temas predefinidos y la capacidad de crear temas personalizados.

## 🎨 Temas Disponibles

### **Temas Básicos**
- **Clásico**: Tema original con colores neutros
- **Oscuro**: Tema oscuro para uso nocturno
- **Corporativo Azul**: Tema profesional con tonos azules
- **Naturaleza Verde**: Tema ecológico con tonos verdes
- **Púrpura Moderno**: Tema moderno con tonos púrpuras
- **Naranja Cálido**: Tema cálido con tonos naranjas
- **Minimalista**: Tema limpio y minimalista

### **Temas Personalizados**
- **Retro Vintage**: Estética retro de los años 70
- **Cyberpunk**: Futurista con neón y colores vibrantes
- **Pastel Suave**: Colores pastel suaves y relajantes
- **Otoño**: Inspirado en los colores del otoño
- **Océano**: Inspirado en las profundidades del mar
- **Fuego**: Cálido inspirado en las llamas
- **Hielo**: Frío y cristalino

## 🚀 Cómo Usar

### **Selector de Temas**
1. Haz clic en el botón **🎨** en la esquina superior derecha
2. Selecciona el tema que desees
3. El tema se aplicará automáticamente y se guardará

### **Cambio Rápido**
```javascript
// Cambiar tema programáticamente
themeEngine.applyTheme('dark');
themeEngine.applyTheme('corporate-blue');
```

## 🛠️ Crear Temas Personalizados

### **Método 1: Agregar al archivo `custom-themes.js`**

```javascript
const CUSTOM_THEMES = {
  'mi-tema': {
    name: 'Mi Tema Personalizado',
    description: 'Descripción de mi tema',
    colors: {
      '--bg-color': '#f0f0f0',
      '--text-color': '#333333',
      '--node-fill': '#ffffff',
      '--label-border': '#cccccc',
      '--link-color': '#999999',
      '--node-stroke-focus': '#000000',
      '--side-panel-bg': '#ffffff',
      '--side-panel-border': '#e0e0e0',
      '--side-panel-header-bg': '#f8f9fa',
      '--side-panel-text': '#333333',
      '--side-panel-label': '#666666',
      '--side-panel-value': '#333333'
    }
  }
};
```

### **Método 2: Crear dinámicamente**

```javascript
// Crear tema personalizado
const themeId = themeEngine.createCustomTheme(
  'Mi Tema',
  'Descripción del tema',
  {
    '--bg-color': '#f0f0f0',
    '--text-color': '#333333',
    // ... más colores
  }
);

// Aplicar el tema
themeEngine.applyTheme(themeId);
```

## 🎯 Variables CSS Disponibles

### **Colores Principales**
- `--bg-color`: Color de fondo del canvas
- `--text-color`: Color del texto principal
- `--node-fill`: Color de relleno de los nodos
- `--label-border`: Color del borde de los nodos
- `--link-color`: Color de las conexiones entre nodos
- `--node-stroke-focus`: Color del borde cuando el nodo está seleccionado

### **Colores del Side Panel**
- `--side-panel-bg`: Fondo del panel lateral
- `--side-panel-border`: Borde del panel lateral
- `--side-panel-header-bg`: Fondo del header del panel
- `--side-panel-text`: Color del texto principal del panel
- `--side-panel-label`: Color de las etiquetas del panel
- `--side-panel-value`: Color de los valores del panel

## 🔧 API del Motor de Temas

### **Métodos Principales**

```javascript
// Aplicar tema
themeEngine.applyTheme('theme-id');

// Obtener tema actual
const currentTheme = themeEngine.getCurrentTheme();

// Obtener todos los temas
const allThemes = themeEngine.getAllThemes();

// Crear tema personalizado
const newThemeId = themeEngine.createCustomTheme(name, description, colors);

// Exportar tema actual
const exportedTheme = themeEngine.exportCurrentTheme();

// Importar tema
const importedThemeId = themeEngine.importTheme(themeData);
```

### **Eventos**

```javascript
// Escuchar cambios de tema
document.addEventListener('themeChanged', (event) => {
  console.log('Tema cambiado a:', event.detail.theme);
});
```

## 🎨 Paletas de Colores Sugeridas

### **Paleta Corporativa**
```javascript
{
  '--bg-color': '#f5f7fa',
  '--text-color': '#2c3e50',
  '--node-fill': '#ffffff',
  '--label-border': '#3498db',
  '--link-color': '#3498db',
  '--node-stroke-focus': '#2980b9'
}
```

### **Paleta Oscura**
```javascript
{
  '--bg-color': '#121212',
  '--text-color': '#ffffff',
  '--node-fill': '#333333',
  '--label-border': '#787878',
  '--link-color': '#666666',
  '--node-stroke-focus': '#ffffff'
}
```

### **Paleta Pastel**
```javascript
{
  '--bg-color': '#f8f9ff',
  '--text-color': '#6b7280',
  '--node-fill': '#ffffff',
  '--label-border': '#e5e7eb',
  '--link-color': '#d1d5db',
  '--node-stroke-focus': '#8b5cf6'
}
```

## 📱 Responsive Design

El selector de temas se adapta automáticamente a dispositivos móviles:
- En pantallas pequeñas, se centra en la pantalla
- Mantiene la funcionalidad completa
- Interfaz optimizada para touch

## 💾 Persistencia

Los temas se guardan automáticamente en el localStorage:
- La preferencia se mantiene entre sesiones
- Se carga automáticamente al abrir la página
- Se puede resetear eliminando el localStorage

## 🔄 Integración con el Sistema de Plantillas

Los temas funcionan perfectamente con el sistema de plantillas:
- Las plantillas usan variables CSS
- Los temas cambian automáticamente todas las plantillas
- No requiere modificación de plantillas

## 🎯 Mejores Prácticas

### **Contraste**
- Asegúrate de que el texto sea legible sobre el fondo
- Usa herramientas de contraste para verificar accesibilidad

### **Consistencia**
- Mantén una paleta de colores coherente
- Usa variaciones del mismo color para diferentes elementos

### **Accesibilidad**
- Considera usuarios con daltonismo
- Mantén suficiente contraste (mínimo 4.5:1)

### **Rendimiento**
- Los temas se aplican instantáneamente
- No afectan el rendimiento del diagrama
- Se cargan de forma asíncrona

## 🚀 Ejemplos Avanzados

### **Tema con Gradientes**
```javascript
{
  '--bg-color': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  '--node-fill': 'rgba(255, 255, 255, 0.9)',
  '--text-color': '#ffffff'
}
```

### **Tema con Transparencias**
```javascript
{
  '--side-panel-bg': 'rgba(255, 255, 255, 0.95)',
  '--node-fill': 'rgba(255, 255, 255, 0.8)',
  '--bg-color': '#f0f0f0'
}
```

¡El sistema de temas está listo para personalizar completamente la apariencia de tus diagramas! 🎉 