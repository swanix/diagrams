# 🔍 Sistema de Filtros Dinámicos

El sistema de filtros de XDiagrams permite filtrar nodos de manera dinámica basándose en las columnas de tus datos. Es completamente flexible y se adapta automáticamente a cualquier estructura de datos.

## 🚀 Características Principales

### ✅ **Detección Automática**
- Analiza automáticamente las columnas de tus datos
- Determina el tipo de filtro más apropiado para cada columna
- Crea filtros sin configuración adicional

### ✅ **Tipos de Filtro Inteligentes**
- **Select**: Para columnas con valores únicos limitados (ej: Department, Type)
- **Search**: Para columnas de texto libre (ej: Name, Description)
- **Range**: Para columnas numéricas (ej: Level, Score)
- **Multi-select**: Para columnas con múltiples valores

### ✅ **Configuración Flexible**
- Filtros automáticos + filtros custom por proyecto
- Priorización de filtros
- Exclusión de columnas específicas
- Configuración de UI personalizable

### ✅ **Interfaz Adaptable**
- Barra superior compacta
- Panel lateral expandible
- Responsive para móviles
- Contador de nodos en tiempo real

## 📋 Configuración Básica

### Configuración Mínima
```javascript
window.$xDiagrams = {
  url: "data/companies-board.csv",
  filters: {
    auto: true  // Detección automática
  }
};
```

### Configuración Completa
```javascript
window.$xDiagrams = {
  url: "data/companies-board.csv",
  filters: {
    // Detección automática
    auto: true,
    
    // Filtros custom
    custom: {
      'Department': {
        type: 'select',
        label: 'Departamento',
        priority: 1
      },
      'Name': {
        type: 'search',
        label: 'Buscar Empleado',
        priority: 2,
        placeholder: 'Escribe el nombre...'
      },
      'Level': {
        type: 'range',
        label: 'Nivel',
        priority: 3
      }
    },
    
    // Excluir columnas
    exclude: ['ID', 'Parent', 'Img', 'Icon'],
    
    // Configuración de UI
    ui: {
      position: 'top',        // 'top' o 'side'
      showCount: true,        // Mostrar contador
      showReset: true,        // Mostrar botón reset
      maxFilters: 5,          // Máximo filtros visibles
      showByDefault: true     // Mostrar por defecto
    }
  }
};
```

## 🎯 Tipos de Filtro

### 1. **Select** (Dropdown)
Para columnas con valores únicos limitados:
```javascript
'Department': {
  type: 'select',
  label: 'Departamento',
  priority: 1
}
```

### 2. **Search** (Búsqueda de texto)
Para columnas de texto libre:
```javascript
'Name': {
  type: 'search',
  label: 'Buscar Empleado',
  priority: 2,
  placeholder: 'Escribe el nombre...',
  minLength: 2
}
```

### 3. **Range** (Rango numérico)
Para columnas numéricas:
```javascript
'Level': {
  type: 'range',
  label: 'Nivel',
  priority: 3
}
```

### 4. **Multi-select** (Selección múltiple)
Para columnas con múltiples valores:
```javascript
'Skills': {
  type: 'multi-select',
  label: 'Habilidades',
  priority: 4
}
```

## ⚙️ Configuración de UI

### Posición de Filtros
```javascript
ui: {
  position: 'top'  // Barra superior
  // o
  position: 'side' // Panel lateral
}
```

### Opciones de UI
```javascript
ui: {
  showCount: true,        // Mostrar "X de Y nodos"
  showReset: true,        // Botón "Limpiar filtros"
  maxFilters: 5,          // Máximo filtros visibles inicialmente
  showByDefault: true     // Mostrar filtros al cargar
}
```

## 🔧 Detección Automática

El sistema analiza automáticamente tus datos y determina:

### **Análisis de Columnas**
- **Valores únicos**: Cuenta valores únicos para determinar tipo de filtro
- **Tipo de dato**: Detecta si es texto, número, o categoría
- **Densidad de datos**: Evalúa si vale la pena crear un filtro

### **Reglas de Detección**
- **≤ 10 valores únicos** → Filtro `select`
- **> 10 valores únicos + texto** → Filtro `search`
- **> 10 valores únicos + números** → Filtro `range`
- **Sin datos** → No crear filtro

### **Mapeo de Etiquetas**
```javascript
// Mapeo automático de nombres de columna a etiquetas
'Name' → 'Nombre'
'Department' → 'Departamento'
'Position' → 'Cargo'
'Type' → 'Tipo'
// etc...
```

## 📊 Ejemplos de Uso

### Ejemplo 1: Organigrama Empresarial
```javascript
window.$xDiagrams = {
  url: "data/companies-board.csv",
  filters: {
    auto: true,
    custom: {
      'Department': { type: 'select', label: 'Departamento', priority: 1 },
      'Position': { type: 'select', label: 'Cargo', priority: 2 },
      'Name': { type: 'search', label: 'Buscar', priority: 3 }
    },
    exclude: ['ID', 'Parent', 'Img']
  }
};
```

### Ejemplo 2: Proyecto de Software
```javascript
window.$xDiagrams = {
  url: "data/project-structure.csv",
  filters: {
    auto: true,
    custom: {
      'Status': { type: 'select', label: 'Estado', priority: 1 },
      'Priority': { type: 'range', label: 'Prioridad', priority: 2 },
      'Assignee': { type: 'search', label: 'Asignado', priority: 3 }
    },
    ui: { position: 'side', maxFilters: 3 }
  }
};
```

### Ejemplo 3: Red de Contactos
```javascript
window.$xDiagrams = {
  url: "data/contacts-network.csv",
  filters: {
    auto: true,
    custom: {
      'Company': { type: 'select', label: 'Empresa', priority: 1 },
      'Role': { type: 'multi-select', label: 'Roles', priority: 2 },
      'Location': { type: 'search', label: 'Ubicación', priority: 3 }
    },
    ui: { position: 'top', showByDefault: false }
  }
};
```

## 🎨 Personalización CSS

Los filtros usan variables CSS para fácil personalización:

```css
:root {
  --ui-panel-bg: #ffffff;
  --ui-panel-border: #e0e0e0;
  --ui-panel-text: #333333;
  --ui-panel-text-secondary: #666666;
  --ui-panel-hover-bg: #f0f0f0;
  --ui-panel-focus-border: #007bff;
}
```

### Clases CSS Principales
- `.xdiagrams-filters` - Contenedor principal
- `.xdiagrams-filters--top` - Barra superior
- `.xdiagrams-filters--side` - Panel lateral
- `.xdiagrams-filter` - Filtro individual
- `.xdiagrams-filter--select` - Filtro de selección
- `.xdiagrams-filter--search` - Filtro de búsqueda

## 🔄 API del Sistema

### Métodos Principales
```javascript
// Obtener instancia de filtros
const filters = diagram.filters;

// Aplicar filtro
filters.setFilter('Department', 'Engineering');

// Limpiar todos los filtros
filters.clearAllFilters();

// Obtener datos filtrados
const filteredData = filters.getFilteredData();

// Obtener filtros activos
const activeFilters = filters.getActiveFilters();
```

### Eventos
```javascript
// Callback cuando se aplican filtros
diagram.onFiltersApplied = (filteredData, activeFilters) => {
  console.log('Filtros aplicados:', activeFilters);
  console.log('Datos filtrados:', filteredData.length);
};
```

## 🚀 Rendimiento

### Optimizaciones Implementadas
- **Debounce**: Búsquedas con retraso de 300ms
- **Lazy Loading**: Filtros adicionales se cargan bajo demanda
- **Caching**: Resultados de filtros se cachean
- **Virtual Scrolling**: Para listas largas de opciones

### Límites Recomendados
- **Máximo 10 filtros** por diagrama
- **Máximo 1000 opciones** por filtro select
- **Máximo 10,000 nodos** para mejor rendimiento

## 🐛 Solución de Problemas

### Filtros No Aparecen
1. Verificar que `filters.auto` esté en `true`
2. Comprobar que los datos tengan columnas válidas
3. Revisar que las columnas no estén en `exclude`

### Filtros No Funcionan
1. Verificar nombres de columnas (case-sensitive)
2. Comprobar que los datos tengan valores en esas columnas
3. Revisar la consola para errores

### UI No Se Ve Bien
1. Verificar que `xdiagrams.css` esté cargado
2. Comprobar variables CSS personalizadas
3. Revisar responsive design en móviles

## 📝 Notas de Desarrollo

### Arquitectura
- **Modular**: Cada tipo de filtro es independiente
- **Extensible**: Fácil agregar nuevos tipos de filtro
- **Integrado**: Funciona con la navegación existente

### Compatibilidad
- **Navegadores**: Chrome 60+, Firefox 55+, Safari 12+
- **Dispositivos**: Desktop, tablet, móvil
- **Datos**: CSV, JSON, APIs REST

---

¡El sistema de filtros está listo para usar! 🎉
