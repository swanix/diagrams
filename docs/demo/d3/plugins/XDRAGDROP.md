# 🖱️ XDragDrop Plugin

Plugin independiente para funcionalidad de drag & drop en XDiagrams. Permite cargar archivos CSV y JSON arrastrándolos directamente al diagrama, con soporte para múltiples archivos y combinación automática.

## 🚀 Características

- ✅ **Plugin independiente** - No requiere modificar el código principal
- ✅ **Drag & drop** para archivos CSV y JSON
- ✅ **Múltiples archivos** con opción de combinación
- ✅ **Configuración flexible** con opciones personalizables
- ✅ **Callbacks** para eventos personalizados
- ✅ **Compatibilidad** con sistema de toast existente
- ✅ **Auto-inicialización** opcional

## 📦 Instalación

### 1. Incluir el archivo

```html
<!-- Después de xdiagrams.js -->
<script src="xdiagrams.js"></script>
<script src="xdragdrop.js"></script>
```

### 2. Inicializar el plugin

```javascript
// Inicialización básica
XDragDrop.init();

// O con configuración personalizada
XDragDrop.init({
  autoCombine: false,
  supportedTypes: ['csv', 'json', 'txt'],
  onFileProcessed: function(diagram) {
    console.log('Archivo procesado:', diagram.name);
  }
});
```

## ⚙️ Configuración

### Opciones Disponibles

```javascript
XDragDrop.init({
  enabled: true,                    // Habilitar/deshabilitar plugin
  autoCombine: true,                // Preguntar automáticamente si combinar múltiples archivos
  supportedTypes: ['csv', 'json'],  // Tipos de archivo soportados
  dropZoneSelector: '#sw-diagram',  // Selector de la zona de drop
  dragOverlaySelector: '#dragOverlay', // Selector del overlay de drag
  fileDropZoneSelector: '#fileDropZone', // Selector de zona de drop de archivos
  showToast: true,                  // Usar sistema de toast integrado
  onFileProcessed: null,            // Callback cuando se procesa un archivo
  onFilesCombined: null,            // Callback cuando se combinan archivos
  onError: null                     // Callback para errores
});
```

### Configuración por Defecto

```javascript
{
  enabled: true,
  autoCombine: true,
  supportedTypes: ['csv', 'json'],
  dropZoneSelector: '#sw-diagram',
  dragOverlaySelector: '#dragOverlay',
  fileDropZoneSelector: '#fileDropZone',
  showToast: true,
  onFileProcessed: null,
  onFilesCombined: null,
  onError: null
}
```

## 🎯 Uso Básico

### Inicialización Simple

```javascript
// Inicializar con configuración por defecto
XDragDrop.init();
```

### Inicialización con Callbacks

```javascript
XDragDrop.init({
  onFileProcessed: function(diagram) {
    console.log('Archivo procesado:', diagram.name);
    // Hacer algo cuando se procesa un archivo
  },
  
  onFilesCombined: function(files, config) {
    console.log('Archivos combinados:', files.length);
    // Hacer algo cuando se combinan archivos
  },
  
  onError: function(error) {
    console.error('Error en drag & drop:', error);
    // Manejar errores personalizados
  }
});
```

### Configuración Avanzada

```javascript
XDragDrop.init({
  autoCombine: false,  // No preguntar automáticamente
  supportedTypes: ['csv', 'json', 'txt'],
  showToast: false,    // No usar sistema de toast
  dropZoneSelector: '.my-custom-drop-zone',
  
  onFileProcessed: function(diagram) {
    // Procesamiento personalizado
    if (diagram.data.length > 100) {
      console.warn('Archivo muy grande:', diagram.name);
    }
  }
});
```

## 🔧 API del Plugin

### Métodos Principales

#### `XDragDrop.init(options)`
Inicializa el plugin con configuración opcional.

```javascript
XDragDrop.init({
  autoCombine: true,
  onFileProcessed: function(diagram) {
    console.log('Procesado:', diagram.name);
  }
});
```

#### `XDragDrop.enable()`
Habilita el plugin si estaba deshabilitado.

```javascript
XDragDrop.enable();
```

#### `XDragDrop.disable()`
Deshabilita el plugin.

```javascript
XDragDrop.disable();
```

#### `XDragDrop.updateConfig(newConfig)`
Actualiza la configuración en tiempo de ejecución.

```javascript
XDragDrop.updateConfig({
  autoCombine: false,
  supportedTypes: ['csv']
});
```

#### `XDragDrop.getConfig()`
Obtiene la configuración actual.

```javascript
const config = XDragDrop.getConfig();
console.log('Configuración actual:', config);
```

#### `XDragDrop.isActive()`
Verifica si el plugin está activo.

```javascript
if (XDragDrop.isActive()) {
  console.log('Plugin activo');
}
```

#### `XDragDrop.destroy()`
Destruye el plugin y limpia recursos.

```javascript
XDragDrop.destroy();
```

### Callbacks Disponibles

#### `onFileProcessed(diagram)`
Se ejecuta cuando se procesa exitosamente un archivo.

```javascript
onFileProcessed: function(diagram) {
  console.log('Archivo procesado:', diagram.name);
  console.log('Registros:', diagram.data.length);
  console.log('Es local:', diagram.isLocal);
  console.log('Timestamp:', diagram.timestamp);
}
```

#### `onFilesCombined(files, config)`
Se ejecuta cuando se combinan múltiples archivos.

```javascript
onFilesCombined: function(files, config) {
  console.log('Archivos combinados:', files.length);
  console.log('Configuración:', config);
  console.log('Nombres de archivos:', config.combineFiles.fileNames);
}
```

#### `onError(error)`
Se ejecuta cuando ocurre un error.

```javascript
onError: function(error) {
  console.error('Error en drag & drop:', error.message);
  // Enviar error a sistema de monitoreo
  analytics.track('dragdrop_error', { error: error.message });
}
```

## 🎨 Personalización

### Selectores Personalizados

```javascript
XDragDrop.init({
  dropZoneSelector: '.my-drop-area',
  dragOverlaySelector: '.my-drag-overlay',
  fileDropZoneSelector: '.my-file-zone'
});
```

### Tipos de Archivo Personalizados

```javascript
XDragDrop.init({
  supportedTypes: ['csv', 'json', 'txt', 'xml']
});
```

### Deshabilitar Auto-combinación

```javascript
XDragDrop.init({
  autoCombine: false  // Siempre crear diagramas separados
});
```

### Sistema de Toast Personalizado

```javascript
XDragDrop.init({
  showToast: false,  // No usar sistema de toast integrado
  onFileProcessed: function(diagram) {
    // Mostrar notificación personalizada
    showCustomNotification(`Archivo ${diagram.name} cargado`);
  }
});
```

## 🔍 Logging y Debugging

### Console Logs

El plugin incluye logging detallado:

```
XDragDrop Plugin cargado
XDragDrop: Event listeners configurados
XDragDrop inicializado correctamente
XDragDrop: Procesando archivo único: data.csv
XDragDrop: Archivo procesado exitosamente: data
XDragDrop: Diagrama cargado exitosamente
```

### Verificar Estado

```javascript
// Verificar si está inicializado
console.log('Inicializado:', XDragDrop.state.isInitialized);

// Verificar si está activo
console.log('Activo:', XDragDrop.isActive());

// Verificar configuración
console.log('Config:', XDragDrop.getConfig());
```

## 🚨 Manejo de Errores

### Errores Comunes

1. **"No se encontró la zona de drop"**
   - Verificar que el selector `dropZoneSelector` sea correcto
   - Asegurar que el elemento existe en el DOM

2. **"Papa Parse no está disponible"**
   - Incluir Papa Parse antes del plugin
   - Verificar que la librería esté cargada

3. **"Error parsing CSV/JSON"**
   - Verificar formato del archivo
   - Revisar que el archivo no esté corrupto

### Manejo Personalizado de Errores

```javascript
XDragDrop.init({
  onError: function(error) {
    // Log personalizado
    console.error('Error en drag & drop:', error);
    
    // Mostrar notificación personalizada
    showErrorNotification(error.message);
    
    // Enviar a sistema de monitoreo
    if (window.analytics) {
      analytics.track('dragdrop_error', {
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
});
```

## 🔄 Integración con XDiagrams

### Compatibilidad Automática

El plugin se integra automáticamente con XDiagrams:

- ✅ **Detecta funciones** de XDiagrams automáticamente
- ✅ **Usa sistema de toast** integrado si está disponible
- ✅ **Guarda diagramas** en localStorage si está disponible
- ✅ **Ejecuta hooks** de XDiagrams si están configurados

### Hooks de XDiagrams

```javascript
// Configurar hooks en XDiagrams
window.$xDiagrams = {
  // ... configuración existente
  hooks: {
    onFileDrop: function(diagram) {
      console.log('Hook ejecutado:', diagram.name);
      // Lógica personalizada cuando se agrega un diagrama
    }
  }
};
```

## 📱 Responsive y Accesibilidad

### Estados Visuales

El plugin maneja automáticamente los estados visuales:

- **Drag over**: Añade clase `drag-over` al elemento
- **Drag enter**: Añade clase `active` al overlay
- **Drag leave**: Remueve clases cuando sale del área

### CSS Personalizado

```css
/* Estilos para estado de drag */
.drag-over {
  border: 2px dashed #007bff;
  background-color: rgba(0, 123, 255, 0.1);
}

/* Estilos para overlay activo */
#dragOverlay.active {
  display: block;
  background-color: rgba(0, 0, 0, 0.5);
}
```

## 🧪 Testing

### Verificar Funcionalidad

```javascript
// Verificar que el plugin está cargado
console.log('XDragDrop disponible:', typeof XDragDrop !== 'undefined');

// Verificar inicialización
XDragDrop.init();
console.log('Estado:', XDragDrop.isActive());

// Simular procesamiento de archivo
const mockFile = new File(['Node,Name\n1,Test'], 'test.csv', { type: 'text/csv' });
XDragDrop.processFile(mockFile).then(diagram => {
  console.log('Archivo simulado procesado:', diagram);
});
```

### Testing de Configuración

```javascript
// Probar diferentes configuraciones
const configs = [
  { autoCombine: true },
  { autoCombine: false },
  { supportedTypes: ['csv'] },
  { showToast: false }
];

configs.forEach(config => {
  XDragDrop.updateConfig(config);
  console.log('Configuración probada:', XDragDrop.getConfig());
});
```

## 🔮 Futuras Mejoras

### Funcionalidades Planificadas

- **Más tipos de archivo**: Excel (.xlsx), XML, etc.
- **Validación de esquemas**: Verificar estructura de datos
- **Previsualización**: Mostrar vista previa antes de cargar
- **Progreso**: Barra de progreso para archivos grandes
- **Compresión**: Soporte para archivos comprimidos (.zip, .gz)

### Configuración Avanzada

```javascript
// Configuración futura
XDragDrop.init({
  validation: {
    enabled: true,
    schema: { required: ['Node', 'Name'] }
  },
  preview: {
    enabled: true,
    maxRows: 10
  },
  compression: {
    enabled: true,
    formats: ['zip', 'gz']
  }
});
```

---

## 📞 Soporte

Para problemas o preguntas con el plugin:

1. Verificar que Papa Parse esté incluido
2. Revisar los logs de consola para debugging
3. Confirmar que los selectores sean correctos
4. Verificar que los archivos CSV/JSON sean válidos

---

*Documentación del Plugin XDragDrop - Enero 2025* 