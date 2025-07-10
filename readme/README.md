# 📚 Documentación del Sistema de Diagramas SVG

## 🎯 **Descripción General**

Este directorio contiene toda la documentación técnica del sistema de diagramas SVG generados con D3.js. El sistema incluye funcionalidades avanzadas como temas personalizables, columnas configurables, fallbacks automáticos y más.

## 📋 **Índice de Documentación**

### 🔧 **Configuración y Uso**

| Documento | Descripción | Enlace |
|-----------|-------------|--------|
| **README-CLEAN.md** | Guía completa de uso del HTML base como plantilla | [📖 Ver Documentación](./README-CLEAN.md) |
| **CUSTOM_COLUMNS_README.md** | Sistema de columnas personalizadas para CSV | [📖 Ver Documentación](./CUSTOM_COLUMNS_README.md) |

### 🎨 **Sistema de Temas**

| Documento | Descripción | Enlace |
|-----------|-------------|--------|
| **THEMES_JSON_README.md** | Temas centralizados en archivo JSON | [📖 Ver Documentación](./THEMES_JSON_README.md) |
| **THEME_CREATOR_README.md** | Creador de temas personalizados | [📖 Ver Documentación](./THEME_CREATOR_README.md) |
| **DIAGRAM_SWITCHER_THEMES.md** | Variables de tema para el diagram-switcher | [📖 Ver Documentación](./DIAGRAM_SWITCHER_THEMES.md) |

### 🛡️ **Robustez y Fallbacks**

| Documento | Descripción | Enlace |
|-----------|-------------|--------|
| **FALLBACKS_README.md** | Sistema de URLs de fallback para diagramas | [📖 Ver Documentación](./FALLBACKS_README.md) |

### 🎨 **Sistema de Templates**

| Documento | Descripción | Enlace |
|-----------|-------------|--------|
| **TEMPLATE_ENGINE_README.md** | Sistema de templates con Alpine.js y futuras implementaciones | [📖 Ver Documentación](./TEMPLATE_ENGINE_README.md) |

## 🚀 **Inicio Rápido**

### **1. Para Nuevos Usuarios**
Comienza con la [Guía de Uso Base](./README-CLEAN.md) que te explica cómo usar el HTML como plantilla.

### **2. Para Personalizar Columnas**
Si necesitas adaptar tus archivos CSV, consulta el [Sistema de Columnas Personalizadas](./CUSTOM_COLUMNS_README.md).

### **3. Para Crear Temas**
Para personalizar la apariencia visual, revisa el [Sistema de Temas JSON](./THEMES_JSON_README.md) y el [Creador de Temas](./THEME_CREATOR_README.md).

### **4. Para Configurar Fallbacks**
Para hacer tu sistema más robusto, implementa [URLs de Fallback](./FALLBACKS_README.md).

## 🏗️ **Arquitectura del Sistema**

```
📁 diagrams/
├── 📁 readme/                    # 📚 Documentación técnica
│   ├── README.md                 # 🎯 Este archivo (índice)
│   ├── README-CLEAN.md           # 🔧 Guía de uso base
│   ├── CUSTOM_COLUMNS_README.md  # 📊 Columnas personalizadas
│   ├── THEMES_JSON_README.md     # 🎨 Temas centralizados
│   ├── THEME_CREATOR_README.md   # 🎨 Creador de temas
│   ├── DIAGRAM_SWITCHER_THEMES.md # 🎨 Variables del diagram-switcher
│   └── FALLBACKS_README.md       # 🛡️ Sistema de fallbacks
├── 📁 src/                       # 💻 Código fuente
│   ├── sw-diagrams.js            # 🧠 Lógica principal
│   ├── sw-diagrams.css           # 🎨 Estilos principales
│   ├── themes.json               # 🎨 Configuración de temas
│   └── 📁 data/                  # 📊 Archivos CSV de ejemplo
└── 📁 docs/                      # 📖 Documentación de demos
```

## 🎯 **Casos de Uso Comunes**

### **📊 Organigrama de Empresa**
1. Usa [Columnas Personalizadas](./CUSTOM_COLUMNS_README.md) para adaptar tu estructura de datos
2. Aplica [Temas Personalizados](./THEMES_JSON_README.md) para el branding corporativo
3. Configura [Fallbacks](./FALLBACKS_README.md) para robustez

### **🌐 Sitemap de Sitio Web**
1. Sigue la [Guía de Uso Base](./README-CLEAN.md)
2. Personaliza columnas según tu estructura de datos
3. Usa temas apropiados para el diseño web

### **📁 Árbol de Categorías**
1. Adapta tu CSV con [Columnas Personalizadas](./CUSTOM_COLUMNS_README.md)
2. Crea un tema específico con el [Creador de Temas](./THEME_CREATOR_README.md)
3. Implementa fallbacks para datos dinámicos

## 🔧 **Herramientas y Utilidades**

### **🎨 Theme Creator**
- Interfaz visual para crear temas
- Vista previa en tiempo real
- Exportación a JSON
- [Ver Documentación](./THEME_CREATOR_README.md)

### **📊 Columnas Personalizadas**
- Soporte para múltiples nombres de columnas
- Fallbacks automáticos
- Case-insensitive
- [Ver Documentación](./CUSTOM_COLUMNS_README.md)

### **🛡️ Sistema de Fallbacks**
- URLs de respaldo automáticas
- Reintentos automáticos
- Manejo de errores CORS
- [Ver Documentación](./FALLBACKS_README.md)

### **🎨 Sistema de Templates**
- Templates fragmentados y reutilizables
- Carga dinámica en tiempo de ejecución
- Compatibilidad con Alpine.js
- [Ver Documentación](./TEMPLATE_ENGINE_README.md)

## 📈 **Características Avanzadas**

### **🎯 Flexibilidad**
- ✅ Compatibilidad hacia atrás
- ✅ Configuración opcional
- ✅ Fallbacks automáticos
- ✅ Case-insensitive

### **🎨 Personalización**
- ✅ Temas centralizados en JSON
- ✅ Columnas configurables
- ✅ Creador visual de temas
- ✅ Persistencia en localStorage

### **🛡️ Robustez**
- ✅ URLs de fallback
- ✅ Manejo de errores CORS
- ✅ Reintentos automáticos
- ✅ Mensajes de error claros

## 🔍 **Solución de Problemas**

### **Problemas Comunes**

1. **Diagrama no se carga**
   - Verifica [Fallbacks](./FALLBACKS_README.md)
   - Revisa errores CORS
   - Comprueba formato CSV

2. **Columnas no se reconocen**
   - Consulta [Columnas Personalizadas](./CUSTOM_COLUMNS_README.md)
   - Verifica nombres de columnas
   - Revisa formato JSON

3. **Temas no se aplican**
   - Revisa [Sistema de Temas](./THEMES_JSON_README.md)
   - Verifica archivo `themes.json`
   - Comprueba localStorage

### **Depuración**
```javascript
// Ver configuración de columnas
const config = getColumnConfiguration();
console.log('Columnas:', config);

// Ver tema actual
console.log('Tema:', localStorage.getItem('sw-theme'));

// Ver errores de carga
// Revisa la consola del navegador
```

## 📞 **Soporte**

### **Orden de Lectura Recomendado**
1. [Guía de Uso Base](./README-CLEAN.md) - Conceptos fundamentales
2. [Columnas Personalizadas](./CUSTOM_COLUMNS_README.md) - Adaptar datos
3. [Sistema de Temas](./THEMES_JSON_README.md) - Personalizar apariencia
4. [Creador de Temas](./THEME_CREATOR_README.md) - Crear temas visualmente
5. [Fallbacks](./FALLBACKS_README.md) - Hacer el sistema robusto
6. [Sistema de Templates](./TEMPLATE_ENGINE_README.md) - Futuras mejoras de arquitectura

### **Recursos Adicionales**
- 📁 `src/` - Código fuente y ejemplos
- 📁 `docs/` - Demos y ejemplos avanzados
- 📁 `src/data/` - Archivos CSV de ejemplo

---

## 🎯 **Conclusión**

Esta documentación te proporciona todo lo necesario para implementar, personalizar y mantener el sistema de diagramas SVG. Cada documento está diseñado para ser independiente pero complementario a los demás.

**¿Eres nuevo?** Comienza con la [Guía de Uso Base](./README-CLEAN.md).
**¿Necesitas personalizar?** Consulta los documentos específicos según tu necesidad.
**¿Tienes problemas?** Revisa la sección de solución de problemas en cada documento. 