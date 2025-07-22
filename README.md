# Swanix Diagrams - Interactive SVG Diagram Library

Una potente librería JavaScript para crear diagramas SVG interactivos y jerárquicos con sistema de temas avanzado, cambio en tiempo real y diseño responsive.

## ✨ Características Principales

### 🎨 **Sistema de Temas Avanzado**
- **6 Temas Integrados**: Snow (claro), Onyx (oscuro), Vintage, Pastel, Neon, Forest
- **Control por Variables CSS**: Personalización visual completa a través de `themes.json`
- **Persistencia de Temas**: Guardado y restauración automática de temas
- **Prevención FOUC**: Transiciones suaves sin parpadeos blancos
- **Cargador de Temas**: Aplicación temprana para evitar problemas visuales

### 🔄 **NUEVA FUNCIÓN: Diagrama Combinado de Múltiples Google Sheets**
- **Carga Paralela**: Múltiples hojas de Google Sheets en un solo diagrama
- **Procesamiento Secuencial**: Mantiene el orden de las fuentes
- **Identificación por Origen**: Cada registro tiene metadatos de fuente
- **Manejo Robusto de Errores**: Continúa aunque una hoja falle
- **Configuración Flexible**: Nombres personalizados y estrategias de combinación

### 🏷️ **Detección Automática de Logo**
- **Detección Automática**: Detecta automáticamente archivos de logo en carpeta `img/`
- **Múltiples Formatos**: Soporta SVG, PNG, JPG, JPEG
- **Sistema de Prioridad**: Configuración manual > atributo data-logo > auto-detección
- **Cero Configuración**: Funciona sin configuración si existe `img/logo.svg`

### 🔄 **Cambio Dinámico de Diagramas**
- **Interfaz Dropdown**: Dropdown limpio en la barra superior para selección
- **Navegación por URL**: Acceso directo a diagramas específicos vía parámetros URL
- **Sistema de Fallback**: URLs de respaldo automáticas para mayor confiabilidad
- **Carga en Tiempo Real**: Cambio de diagramas sin recarga de página

### 📊 **Visualización de Datos Jerárquicos**
- **Estructuras de Árbol**: Soporte para relaciones jerárquicas complejas
- **Agrupación en Clusters**: Agrupación visual de nodos relacionados
- **Columnas Personalizables**: Mapeo flexible de datos para diferentes tipos
- **Múltiples Fuentes**: Archivos CSV, APIs REST (SheetDB, Sheetson, Airtable), datos locales

### 🎯 **Elementos Interactivos**
- **Selección de Nodos**: Click para seleccionar y resaltar nodos
- **Panel Lateral**: Visualización detallada de información de nodos seleccionados
- **Navegación por Teclado**: Navegación completa con modos jerárquico y secuencial
- **Zoom Automático**: Ajuste automático de zoom para visualización óptima

## 🚀 Inicio Rápido

### Configuración Básica

```html
<!DOCTYPE html>
<html>
<head>
  <title>Mi Diagrama</title>
  <script src="xloader.js"></script>
  <link href="xdiagrams.css" rel="stylesheet">
    <script src="https://d3js.org/d3.v7.min.js"></script>
  <script src="https://unpkg.com/papaparse@5.3.0/papaparse.min.js"></script>
</head>
<body>
    <div class="xcanvas" 
         data-themes='{
           "light": "snow",
           "dark": "onyx"
         }'
         data-title="Mi Diagrama"
         data-columns='{
           "id": "ID",
           "name": "Name", 
           "subtitle": "Description",
           "parent": "Parent",
           "img": "Thumbnail",
           "url": "url",
           "type": "Type"
         }'>
    </div>
    
    <script>
      window.$xDiagrams = {
        title: "Mi Diagrama",
        diagrams: [
        {
            name: "Diagrama 1", 
          url: "data/sample-diagram.csv"
          }
        ]
      };
    </script>
    
    <script src="xdiagrams.js"></script>
</body>
</html>
```

## 🔄 NUEVA FUNCIÓN: Diagrama Combinado de Múltiples Google Sheets

### ¿Cómo Opera?

La nueva función permite combinar múltiples hojas de Google Sheets en un solo diagrama, manteniendo la trazabilidad del origen de cada dato.

#### **1. Detección Automática**

El sistema detecta automáticamente cuando se proporcionan múltiples fuentes:

```javascript
// Array de URLs = Múltiples Google Sheets
if (Array.isArray(source)) {
  if (typeof firstItem === 'string') {
    return loadFromMultipleUrls(source, onComplete, retryCount, diagramConfig);
  }
}
```

#### **2. Procesamiento Secuencial**

- **Mantiene el orden**: Procesa las URLs una por una para preservar el orden
- **Cache busting**: Añade parámetros de tiempo para evitar caché
- **Identificación**: Agrega metadatos a cada fila (`_sheetName`, `_sheetIndex`)
- **Manejo de errores**: Continúa con la siguiente hoja si una falla

#### **3. Metadatos Agregados**

Cada registro incluye información de origen:
- `_sheetName`: Nombre de la hoja de origen
- `_sheetIndex`: Índice de la hoja en el array

### Configuración

#### **Configuración Básica**

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

#### **Configuración Avanzada**

```javascript
{
  name: "Diagrama Complejo",
  urls: [
    "https://docs.google.com/spreadsheets/d/e/.../pub?output=csv",
    "https://docs.google.com/spreadsheets/d/e/.../pub?output=csv&gid=123456789",
    "https://docs.google.com/spreadsheets/d/e/.../pub?output=csv&gid=987654321"
  ],
  combineSheets: {
    enabled: true,
    mergeStrategy: "append", // o "merge"
    sheetNames: ["Departamentos", "Empleados", "Proyectos"]
  }
}
```

#### **Ejemplo Completo**

```javascript
window.$xDiagrams = {
  title: "Organigrama Empresa",
  diagrams: [
    {
      name: "Organigrama Completo",
      urls: [
        "https://docs.google.com/spreadsheets/d/e/2PACX-1vT1F3LXPwnGlnF_uOlhoR-5kK1DrWLwlCAKH8Ag6hPrNLzwqWYWU8ofE19xSv4cH1-Cq7ZYm7lPys7V/pub?output=csv",
        "https://docs.google.com/spreadsheets/d/e/2PACX-1vT1F3LXPwnGlnF_uOlhoR-5kK1DrWLwlCAKH8Ag6hPrNLzwqWYWU8ofE19xSv4cH1-Cq7ZYm7lPys7V/pub?output=csv&gid=123456789"
      ],
      combineSheets: {
        enabled: true,
        sheetNames: ["Estructura", "Detalles"],
        mergeStrategy: "append"
      }
    }
  ],
  columns: {
    id: "ID",
    name: "Nombre", 
    parent: "Jefe",
    type: "Departamento",
    url: "LinkedIn",
    subtitle: "Descripción"
  }
};
```

### Casos de Uso

#### **1. Organigrama Multi-Departamento**
```javascript
{
  name: "Organigrama Empresa",
  urls: [
    "https://docs.google.com/spreadsheets/d/e/.../pub?output=csv", // Departamentos
    "https://docs.google.com/spreadsheets/d/e/.../pub?output=csv&gid=123456789", // Empleados
    "https://docs.google.com/spreadsheets/d/e/.../pub?output=csv&gid=987654321" // Proyectos
  ],
  combineSheets: {
    enabled: true,
    sheetNames: ["Departamentos", "Empleados", "Proyectos"]
  }
}
```

#### **2. Mapa de Sitio Complejo**
```javascript
{
  name: "Mapa de Sitio Web",
  urls: [
    "https://docs.google.com/spreadsheets/d/e/.../pub?output=csv", // Páginas principales
    "https://docs.google.com/spreadsheets/d/e/.../pub?output=csv&gid=123456789", // Subpáginas
    "https://docs.google.com/spreadsheets/d/e/.../pub?output=csv&gid=987654321" // Recursos
  ],
  combineSheets: {
    enabled: true,
    sheetNames: ["Principal", "Subpáginas", "Recursos"]
  }
}
```

#### **3. Monitoreo de Sistemas**
```javascript
{
  name: "Arquitectura de Sistemas",
  urls: [
    "https://docs.google.com/spreadsheets/d/e/.../pub?output=csv", // Servicios
    "https://docs.google.com/spreadsheets/d/e/.../pub?output=csv&gid=123456789", // Bases de datos
    "https://docs.google.com/spreadsheets/d/e/.../pub?output=csv&gid=987654321" // APIs
  ],
  combineSheets: {
    enabled: true,
    sheetNames: ["Servicios", "Bases de Datos", "APIs"]
  }
}
```

### Características Técnicas

#### **✅ Ventajas**
- **Procesamiento secuencial**: Mantiene el orden de las hojas
- **Identificación por fuente**: Cada registro tiene metadatos de origen
- **Manejo robusto de errores**: Continúa aunque una hoja falle
- **Cache busting**: Evita problemas de caché
- **Compatibilidad**: Funciona con configuración existente
- **Hooks**: Dispara eventos para integración

#### **🔄 Estrategias de Combinación**
- **"append"**: Añade todos los datos secuencialmente (por defecto)
- **"merge"**: Combina datos basándose en claves comunes

#### **📊 Integración**
- **Sistema de temas**: Preserva el tema actual
- **Panel lateral**: Muestra información de origen
- **Hooks**: Dispara eventos `onLoad` con metadatos
- **Zoom y navegación**: Funciona con todas las características existentes

## 📊 Estructura de Datos

### Columnas Requeridas

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

## 🛠️ Configuración Avanzada

### Configuración Completa

```javascript
window.$xDiagrams = {
  // Configuración básica
  title: "Swanix Diagrams",
  name: "Swanix XDiagrams",
  version: "0.4.5",
  
  // Configuración de temas
  themes: {
    light: "snow",
    dark: "onyx",
    default: "snow"
  },
  
  // Mapeo de columnas
  columns: {
    id: "Node",
    name: "Name", 
    parent: "Parent",
    img: "Type",
    url: "URL",
    type: "Type",
    subtitle: "Description"
  },
  
  // Fuentes de diagramas
  diagrams: [
    {
      name: "Diagrama Único",
      url: "https://docs.google.com/spreadsheets/d/e/.../pub?output=csv",
      edit: "https://docs.google.com/spreadsheets/d/.../edit?gid=0#gid=0"
    },
    {
      name: "Diagrama Combinado",
      urls: [
        "https://docs.google.com/spreadsheets/d/e/.../pub?output=csv",
        "https://docs.google.com/spreadsheets/d/e/.../pub?output=csv&gid=123456789"
      ],
      combineSheets: {
        enabled: true,
        sheetNames: ["Hoja 1", "Hoja 2"],
        mergeStrategy: "append"
      }
    }
  ],
  
  // Opciones avanzadas
  options: {
    autoZoom: true,
    keyboardNavigation: true,
    sidePanel: true,
    tooltips: true,
    responsive: true,
    dragAndDrop: true
  },
  
  // Hooks de eventos
  hooks: {
    onLoad: function(diagram) {
      console.log('Diagrama cargado:', diagram.name);
    },
    onThemeChange: function(theme) {
      console.log('Tema cambiado a:', theme);
    },
    onNodeClick: function(node) {
      console.log('Nodo clickeado:', node.name);
    },
    onFileDrop: function(file) {
      console.log('Archivo soltado:', file.name);
    }
  }
};
```

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

### 4. Organigramas Empresariales
- Estructura organizacional
- Roles y responsabilidades
- Jerarquías departamentales

## 🛠️ Tecnologías

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Visualización**: D3.js v7
- **Parsing**: Papa Parse v5.3.0
- **Iconos**: SVG embebidos
- **Temas**: CSS Variables
- **Plugins**: XDragDrop (drag & drop opcional)

## 📁 Estructura del Proyecto

```
diagrams/
├── src/
│   ├── xdiagrams.js            # Lógica principal
│   ├── xdiagrams.css           # Estilos
│   ├── xloader.js              # Cargador
│   ├── xthemes.json            # Configuración de temas
│   ├── data/                   # Archivos CSV de datos
│   ├── img/                    # Imágenes e iconos
│   └── plugins/                # Plugins
│     └── xdragdrop.js          # Plugin de drag & drop
├── docs/                       # Documentación
├── README.md                   # Este archivo
└── package.json                # Dependencias
```

## 🔄 Actualizaciones Recientes

### v0.4.5 - Múltiples Fuentes de Datos
- ✅ **NUEVA FUNCIÓN**: Carga combinada de múltiples hojas de Google Sheets
- ✅ Carga paralela de múltiples archivos locales CSV/JSON
- ✅ Combinación automática de datos con metadatos de origen
- ✅ Identificación por fuente en cada registro
- ✅ Manejo robusto de errores
- ✅ Compatibilidad con configuración existente
- ✅ Plugin XDragDrop independiente para drag & drop (modular)
- ✅ Plugin XPerformance para optimizaciones de zoom y rendimiento

## ⚠️ Limitaciones

- **CORS**: Google Sheets debe ser público
- **Estructura**: Todas las hojas deben tener columnas similares
- **Tamaño**: Hojas muy grandes pueden afectar rendimiento
- **Orden**: El procesamiento es secuencial para mantener el orden

## 📞 Soporte

Para problemas o preguntas:

1. Revisa la documentación
2. Verifica los logs de consola para debugging
3. Confirma que las URLs de Google Sheets sean accesibles
4. Prueba con datos de ejemplo antes de usar datos reales

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver el archivo LICENSE para más detalles.

---

**Swanix Diagrams v0.4.5** - Librería de diagramas interactivos con soporte para múltiples fuentes de datos
