# Auto Image Folder Feature

## 🎯 Descripción

Esta funcionalidad permite configurar la ubicación de las imágenes automáticas, tanto para carpetas locales como para URIs externos (servidores públicos, CDNs, etc.). Por defecto, si no se define, se usa la carpeta `img/photos`, pero esto puede cambiar de proyecto en proyecto.

## 🚀 Cómo usar

### 1. Configuración básica

En tu archivo `index.html`, configura el diagrama con la opción `autoImageFolder`:

```javascript
{
  name: "Mi Proyecto con Imágenes Personalizadas",
  url: "data/mi-proyecto.csv",
  options: {
    thumbnailMode: "custom",
    autoImages: true,
    autoImageFolder: "assets/team-photos"  // Carpeta local personalizada
  }
}
```

### 2. Tipos de configuración soportados

#### Carpeta local
```javascript
options: {
  autoImageFolder: "assets/team-photos"
}
```

#### Servidor remoto
```javascript
options: {
  autoImageFolder: "https://example.com/team-photos"
}
```

#### CDN
```javascript
options: {
  autoImageFolder: "https://cdn.example.com/avatars"
}
```

#### Sin configuración (usa el valor por defecto)
```javascript
options: {
  // No especificar autoImageFolder - usa "img/photos" por defecto
}
```

## 📝 Ejemplos de configuración

### Ejemplo 1: Carpeta local personalizada
```javascript
{
  name: "Equipo de Desarrollo",
  url: "data/equipo.csv",
  options: {
    thumbnailMode: "custom",
    autoImages: true,
    autoImageFolder: "assets/equipo-fotos"
  }
}
```

**Estructura de archivos:**
```
proyecto/
├── assets/
│   └── equipo-fotos/
│       ├── alice-thompson.jpeg
│       ├── bob-martinez.png
│       └── carla-wilson.jpg
├── data/
│   └── equipo.csv
└── index.html
```

### Ejemplo 2: Servidor remoto
```javascript
{
  name: "Equipo Remoto",
  url: "data/equipo.csv",
  options: {
    thumbnailMode: "custom",
    autoImages: true,
    autoImageFolder: "https://miempresa.com/fotos-equipo"
  }
}
```

**URLs generadas:**
- `https://miempresa.com/fotos-equipo/alice-thompson.jpeg`
- `https://miempresa.com/fotos-equipo/bob-martinez.png`
- `https://miempresa.com/fotos-equipo/carla-wilson.jpg`

### Ejemplo 3: CDN
```javascript
{
  name: "Equipo con CDN",
  url: "data/equipo.csv",
  options: {
    thumbnailMode: "custom",
    autoImages: true,
    autoImageFolder: "https://cdn.cloudflare.com/avatars"
  }
}
```

## 🔧 Configuración por diagrama vs global

### Configuración por diagrama (recomendado)
```javascript
{
  name: "Diagrama Específico",
  url: "data/diagrama.csv",
  options: {
    autoImageFolder: "assets/diagrama-fotos"  // Solo para este diagrama
  }
}
```

### Configuración global
```javascript
window.$xDiagrams = {
  title: "Mi Proyecto",
  options: {
    autoImageFolder: "assets/fotos-globales"  // Para todos los diagramas
  },
  diagrams: [
    // ... diagramas
  ]
};
```

## 📁 Estructura de archivos soportada

### Extensiones soportadas
El sistema busca automáticamente imágenes con estas extensiones (en orden de prioridad):
- `.jpeg`
- `.jpg`
- `.png`
- `.webp`
- `.gif`

### Nomenclatura de archivos
Los nombres de archivo deben seguir el formato normalizado:
- `alice-thompson.jpeg`
- `bob-martinez.png`
- `carla-wilson.jpg`

## 🔄 Prioridad de configuración

1. **Configuración por diagrama** (más alta prioridad)
2. **Configuración global**
3. **Valor por defecto** (`img/photos`)

## 🛡️ Consideraciones de seguridad

### Para URIs externos
- Asegúrate de que el servidor tenga CORS configurado correctamente
- Verifica que las URLs sean HTTPS para producción
- Considera usar un CDN para mejor rendimiento

### Para carpetas locales
- Asegúrate de que la carpeta sea accesible desde el servidor web
- Verifica los permisos de archivo
- Considera la estructura de rutas relativas

## 🚀 Beneficios

### Flexibilidad
- ✅ Diferentes carpetas para diferentes proyectos
- ✅ Soporte para servidores remotos y CDNs
- ✅ Configuración por diagrama o global

### Compatibilidad
- ✅ Mantiene compatibilidad con configuraciones existentes
- ✅ Valor por defecto garantiza funcionamiento sin cambios
- ✅ Soporte para todas las extensiones de imagen existentes

### Rendimiento
- ✅ CDNs para mejor velocidad de carga
- ✅ Caché automático de imágenes
- ✅ Verificación de existencia de archivos

## 📋 Ejemplos completos

### Proyecto con múltiples diagramas
```javascript
window.$xDiagrams = {
  title: "Portal de Empresa",
  diagrams: [
    {
      name: "Equipo de Desarrollo",
      url: "data/desarrollo.csv",
      options: {
        thumbnailMode: "custom",
        autoImages: true,
        autoImageFolder: "assets/desarrollo-fotos"
      }
    },
    {
      name: "Equipo de Diseño",
      url: "data/diseno.csv",
      options: {
        thumbnailMode: "custom",
        autoImages: true,
        autoImageFolder: "https://cdn.example.com/diseno-avatars"
      }
    },
    {
      name: "Equipo de Marketing",
      url: "data/marketing.csv",
      options: {
        thumbnailMode: "custom",
        autoImages: true
        // Usa el valor por defecto: img/photos
      }
    }
  ]
};
```

## 🔍 Logs de depuración

El sistema genera logs detallados para ayudar con la depuración:

```
[getAutoImageFolder] Using diagram-specific folder: assets/team-photos
[resolveNodeImage] Checking multiple extensions for name: "Alice Thompson" (normalized: "alice-thompson") in folder: "assets/team-photos"
[resolveNodeImage] Checking: assets/team-photos/alice-thompson.jpeg
[resolveNodeImage] Found image: assets/team-photos/alice-thompson.jpeg
```

## 🎯 Casos de uso comunes

1. **Proyectos con equipos separados**: Diferentes carpetas para diferentes departamentos
2. **CDNs empresariales**: Usar servidores de imágenes corporativos
3. **Proyectos multi-tenant**: Diferentes URIs para diferentes clientes
4. **Desarrollo vs producción**: Carpetas locales para desarrollo, CDNs para producción 