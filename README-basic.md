# Swanix Diagrams

Sistema de monitoreo y visualización de diagramas, con soporte para múltiples fuentes de datos incluyendo Google Sheets.

## 🚀 Características Principales

- 📊 **Visualización de diagramas** con clusters y jerarquías
- 📈 **Múltiples fuentes de datos**: Google Sheets, CSV, JSON, APIs
- 🔄 **Carga de múltiples hojas** de Google Sheets en un solo diagrama
- 📁 **Carga de múltiples archivos** locales CSV/JSON en un solo diagrama
- 🎨 **Temas personalizables** (claro/oscuro)
- 📱 **Diseño responsive** y navegación por teclado
- 🖱️ **Drag & drop** para archivos locales
- 🔍 **Panel lateral** con información detallada
- ⚡ **Optimizaciones de performance** para diagramas grandes y zoom fluido

## 📚 Documentación

### Guías Principales
- [**Carga de Múltiples Hojas**](docs/README-MULTIPLE-SHEETS.md) - Documentación completa para cargar múltiples hojas de Google Sheets
- [**Plugin XDragDrop**](docs/README-XDRAGDROP.md) - Plugin independiente para drag & drop de archivos
- [**Configuración Básica**](#configuración) - Configuración inicial del sistema

## ⚡ Inicio Rápido

### 1. Diagrama único (configuración Básica)

```javascript
window.$xDiagrams = {
  title: "Diagramas",
  diagrams: [
    {
      name: "Mi Diagrama",
      url: "https://docs.google.com/spreadsheets/d/e/.../pub?output=csv"
    }
  ]
};
```

### 2. Diagrama único combinado (varias hojas de Google Sheets combinadas)

```javascript
{
  name: "Mi Diagrama combinado",
  urls: [
    "https://docs.google.com/spreadsheets/d/e/.../pub?output=csv",
    "https://docs.google.com/spreadsheets/d/e/.../pub?output=csv&gid=123456789"
  ],
  combineSheets: {
    enabled: true,
    sheetNames: ["Sheet 1", "Sheet 2"]
  }
}
```

### 3. Múltiples diagramas

```javascript
window.$xDiagrams = {
  title: "Diagramas",
  diagrams: [
    {
      name: "Mi Diagrama 1",
      url: "https://docs.google.com/spreadsheets/d/e/.../pub?output=csv"
    },
    {
      name: "Mi Diagrama 2",
      url: "https://docs.google.com/spreadsheets/d/e/.../pub?output=csv"
    },
    {
      name: "Mi Diagrama 3 - Combinado",
      urls: [
        "https://docs.google.com/spreadsheets/d/e/.../pub?output=csv",
        "https://docs.google.com/spreadsheets/d/e/.../pub?output=csv&gid=123456789"
      ],
      combineSheets: {
        enabled: true,
        sheetNames: ["Sheet 1", "Sheet 2"]
      }
    }
  ]
};
```


## 🔧 Configuración

### Estructura de Datos Requerida

Tu Google Sheets debe tener columnas con estos nombres (o similares):

| Columna | Descripción | Ejemplos de nombres |
|---------|-------------|-------------------|
| **Node** | Identificador único | `Node`, `node`, `id`, `ID` |
| **Name** | Nombre del elemento | `Name`, `name`, `title`, `Title` |
| **Description** | Descripción | `Description`, `description`, `desc` |
| **Parent** | Elemento padre | `Parent`, `parent` |
| **Type** | Tipo de elemento | `Type`, `type` |
| **URL** | Enlace | `URL`, `url`, `link` |
| **Image** | Imagen/icono | `Image`, `image`, `img`, `icon` |

### Ejemplo de Google Sheets

| Node | Name | Description | Parent | Type | URL | Image |
|------|------|-------------|--------|------|-----|-------|
| home | Inicio | Página principal | | page | https://... | home.svg |
| about | Acerca de | Información de la empresa | home | page | https://... | about.svg |
| contact | Contacto | Formulario de contacto | home | form | https://... | contact.svg |

## 🎯 Casos de Uso

### 1. Monitoreo de Sistemas
- Visualizar arquitectura de aplicaciones
- Monitorear estado de servicios
- Mapear dependencias entre componentes

### 2. Organización de Proyectos
- Estructurar secciones de sitios web
- Organizar módulos de software
- Mapear flujos de trabajo

### 3. Documentación Técnica
- Crear mapas de sitio
- Documentar APIs
- Visualizar bases de datos

## 🛠️ Tecnologías

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Visualización**: D3.js v7
- **Parsing**: Papa Parse v5.3.0
- **Iconos**: SVG embebidos
- **Temas**: CSS Variables
- **Plugins**: XDragDrop (drag & drop opcional)

## 📁 Estructura del Proyecto

```
project/
├── diagrams/
│   ├── index.html              # Página principal
│   ├── xdiagrams.js            # Lógica principal
│   ├── xdiagrams.css           # Estilos
│   ├── xloader.js              # Cargador
│   ├── xthemes.json            # Cargador
│   └── img/    
│   └── plugins/                # Plugins  
│     └── xdragdrop.js          # Plugin de drag & drop (opcional)  
└── README.md                   # Este archivo
```

## 🔄 Actualizaciones Recientes

### v2.0 - Múltiples Fuentes de Datos
- ✅ Carga paralela de múltiples hojas de Google Sheets
- ✅ Carga paralela de múltiples archivos locales CSV/JSON
- ✅ Combinación automática de datos
- ✅ Identificación por fuente en cada registro
- ✅ Manejo robusto de errores
- ✅ Compatibilidad con configuración existente
- ✅ **Plugin XDragDrop independiente** para drag & drop (modular)
- ✅ **Plugin XPerformance** para optimizaciones de zoom y rendimiento

## Limitaciones

- **CORS**: Google Sheets debe ser público
- **Estructura**: Todas las hojas deben tener columnas similares
- **Tamaño**: Hojas muy grandes pueden afectar rendimiento

## 📞 Soporte

Para problemas o preguntas:

1. Revisa la documentación
4. Verifica los logs de consola para debugging
5. Confirma que las URLs de Google Sheets sean accesibles
6. Prueba con datos de ejemplo antes de usar datos reales

---
