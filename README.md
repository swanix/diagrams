# 🎯 XDiagrams - Librería de Diagramas Interactivos

[![Netlify Status](https://api.netlify.com/api/v1/badges/your-site-id/deploy-status)](https://app.netlify.com/sites/your-site/deploys)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**XDiagrams** es una librería JavaScript moderna para crear diagramas interactivos y visualizaciones de datos desde múltiples fuentes, incluyendo **APIs protegidas** con seguridad de nivel empresarial.

## ✨ Características Principales

### 🎨 Visualización
- **Diagramas interactivos** con navegación por clusters
- **Temas personalizables** (claro/oscuro)
- **Responsive design** para todos los dispositivos
- **Animaciones suaves** y transiciones fluidas

### 📊 Fuentes de Datos
- **CSV/JSON** - Datos locales y remotos
- **APIs públicas** - Cualquier endpoint público
- **🔐 APIs protegidas** - SheetBest, Google Sheets, y más (NUEVO)
- **Datos dinámicos** - Carga en tiempo real

### 🛡️ Seguridad Avanzada (NUEVO)
- **Cero exposición de credenciales** en el frontend
- **Netlify Functions** como proxy seguro
- **Variables de entorno** solo en el servidor
- **Arquitectura serverless** escalable

## 🚀 Instalación

### CDN (Recomendado)
```html
<link href="https://cdn.jsdelivr.net/npm/xdiagrams@2.0.0/dist/xdiagrams.min.css" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/xdiagrams@2.0.0/dist/xdiagrams.min.js"></script>
```

### NPM
```bash
npm install xdiagrams
```

## 📝 Uso Básico

### HTML Simple
```html
<!DOCTYPE html>
<html>
<head>
  <link href="xdiagrams.min.css" rel="stylesheet">
</head>
<body>
  <div id="app"></div>
  
  <script>
    window.$xDiagrams = {
      url: "datos.csv",
      title: "Mi Diagrama",
      clustersPerRow: "6 3 7 6 3"
    };
  </script>
  
  <script src="xdiagrams.min.js"></script>
</body>
</html>
```

## 🔐 APIs Protegidas (NUEVO)

### Configuración Rápida
```html
<script>
  window.$xDiagrams = {
    url: "https://api.sheetbest.com/sheets/tu-sheet-id/tabs/TuTab",
    title: "Diagrama desde SheetBest",
    clustersPerRow: "6 3 7 6 3"
  };
</script>
```

### Configuración de Seguridad
1. **Crear Netlify Function** (automático)
2. **Configurar variable de entorno** en Netlify
3. **¡Listo!** - La librería maneja todo automáticamente

```bash
# En Netlify Dashboard > Environment Variables
SHEETBEST_API_KEY = tu_api_key_real_aqui
```

## ⚙️ Configuración Avanzada

### Opciones Completas
```javascript
window.$xDiagrams = {
  // Fuente de datos
  url: "https://api.sheetbest.com/sheets/...",
  
  // Configuración visual
  title: "Diagrama Interactivo",
  clustersPerRow: "6 3 7 6 3",
  spacing: 80,
  verticalSpacing: 170,
  nodeWidth: 100,
  nodeHeight: 125,
  
  // Funcionalidades
  showThemeToggle: true,
  enableZoom: true,
  enablePan: true,
  
  // Personalización
  theme: "light", // "light" | "dark" | "auto"
  customStyles: {
    nodeBackground: "#ffffff",
    nodeBorder: "#e0e0e0"
  }
};
```

### Configuración por URL
```javascript
// Detección automática del tipo de fuente
window.$xDiagrams = {
  url: "companies-board.csv",        // CSV local
  // url: "https://api.example.com/data", // API pública
  // url: "https://api.sheetbest.com/...", // API protegida (automático)
};
```

## 🏗️ Arquitectura de Seguridad

### Flujo Seguro de Datos
```
Frontend → Netlify Function → API Externa → Netlify Function → Frontend
```

### Principios de Seguridad
- ✅ **Cero credenciales** en el frontend
- ✅ **Variables de entorno** solo en servidor
- ✅ **Proxy serverless** para APIs protegidas
- ✅ **CORS automático** manejado por Netlify
- ✅ **Escalabilidad** automática

## 📚 Documentación

### Guías Principales
- **[APIs Protegidas](docs/readme/PROTECTED_APIS.md)** - Configuración segura
- **[Configuración de Netlify](NETLIFY_SETUP.md)** - Setup completo
- **[API Keys Setup](docs/readme/API_KEYS_SETUP.md)** - Variables de entorno
- **[Troubleshooting](docs/readme/TROUBLESHOOTING.md)** - Solución de problemas

### Ejemplos
- **[Demo de Producción](docs/demo/sheetbest.html)** - APIs protegidas
- **[Test Local](docs/demo/test-local.html)** - Datos locales
- **[Configuración Básica](src/sheetbest.html)** - Desarrollo

## 🧪 Testing

### Desarrollo Local
```bash
# Instalar dependencias
npm install

# Servidor de desarrollo
npm run dev

# Testing con Netlify Functions
netlify dev
```

### Producción
```bash
# Build de producción
npm run build

# Servir demo de producción
npm run serve:demo
```

## 🔧 Desarrollo

### Estructura del Proyecto
```
src/
  js/
    modules/
      core/           # Funcionalidad principal
      loader/         # Carga de datos
      navigation/     # Navegación y zoom
      themes/         # Sistema de temas
      thumbs/         # Miniaturas
      ui/             # Componentes UI
      utils/          # Utilidades
netlify/
  functions/          # APIs protegidas (serverless)
docs/
  demo/              # Demos de producción
  readme/            # Documentación
```

### Scripts Disponibles
```bash
npm run dev          # Desarrollo local
npm run build        # Build de producción
npm run serve:demo   # Servir demo
npm run preview      # Preview del build
```

## 🚨 Breaking Changes v2.0.0

### Cambios de Seguridad
- ❌ **Eliminado**: Archivos `api-keys.js` del frontend
- ❌ **Eliminado**: Inyección de variables de entorno en bundle
- ✅ **Nuevo**: Netlify Functions para APIs protegidas
- ✅ **Nuevo**: Proxy seguro automático

### Migración
1. **Configurar** Netlify Functions
2. **Migrar** variables de entorno a Netlify
3. **Actualizar** código para usar proxy
4. **Probar** en entorno de desarrollo

## 🤝 Contribuir

### Reportar Issues
- 🐛 **Bugs**: [Issues](https://github.com/tu-repo/xdiagrams/issues)
- 💡 **Feature Requests**: [Discussions](https://github.com/tu-repo/xdiagrams/discussions)
- 🔒 **Security**: [Security Policy](SECURITY.md)

### Desarrollo
1. **Fork** el repositorio
2. **Crear** rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. **Commit** cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. **Push** a la rama (`git push origin feature/nueva-funcionalidad`)
5. **Crear** Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

## 🆘 Soporte

### Recursos
- 📖 **[Documentación Completa](docs/readme/)**
- 🎯 **[Demos Interactivos](docs/demo/)**
- 🔧 **[Troubleshooting](docs/readme/TROUBLESHOOTING.md)**
- 💬 **[Discussions](https://github.com/tu-repo/xdiagrams/discussions)**

### Comunidad
- 🌐 **Website**: [xdiagrams.com](https://xdiagrams.com)
- 📧 **Email**: support@xdiagrams.com
- 🐦 **Twitter**: [@xdiagrams](https://twitter.com/xdiagrams)

---

**XDiagrams v2.0.0** - Seguridad de nivel empresarial para tus diagramas interactivos 🚀