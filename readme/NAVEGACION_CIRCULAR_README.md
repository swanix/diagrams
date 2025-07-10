# 🔄 Navegación Circular por Teclado

## Descripción

La navegación circular permite navegar continuamente por los nodos del diagrama sin llegar a un "final". Cuando llegas al último nodo y sigues navegando, automáticamente vuelves al primero, y viceversa.

## Funcionalidades Implementadas

### 1. Navegación Circular entre Hermanos (Flechas ← →)

- **Flecha Derecha (→)**: Navega al siguiente nodo del mismo nivel
- **Flecha Izquierda (←)**: Navega al nodo anterior del mismo nivel
- **Comportamiento Circular**: Al llegar al último nodo del nivel y seguir navegando, vuelve al primero

### 2. Navegación Circular Jerárquica (Flechas ↑ ↓)

- **Flecha Arriba (↑)**: Navega al nodo padre
- **Flecha Abajo (↓)**: Navega al primer hijo
- **Comportamiento Circular**: 
  - Si no hay padre, va al nodo raíz (nivel 0)
  - Si no hay hijos, va al primer nodo del siguiente nivel o al primer nodo del diagrama

### 3. Navegación Secuencial Circular (Tab)

- **Tab**: Navega al siguiente nodo en orden secuencial
- **Shift + Tab**: Navega al nodo anterior en orden secuencial
- **Comportamiento Circular**: Al llegar al último nodo del diagrama, vuelve al primero

### 4. Navegación Directa

- **Home**: Va al primer nodo del diagrama
- **End**: Va al último nodo del diagrama

## Implementación Técnica

### Modificaciones en `sw-diagrams.js`

#### 1. Función `navigateToNextSibling()`
```javascript
// Antes: Se detenía al llegar al último nodo del nivel
if (currentIndex < sameLevelNodes.length - 1) {
  // Navegar al siguiente
} else {
  // No hacer nada
}

// Después: Navegación circular
if (currentIndex < sameLevelNodes.length - 1) {
  // Navegar al siguiente
} else {
  // Volver al primer nodo del nivel
  const firstNode = sameLevelNodes[0];
  this.selectNode(this.allNodes.indexOf(firstNode));
}
```

#### 2. Función `navigateToPreviousSibling()`
```javascript
// Antes: Se detenía al llegar al primer nodo del nivel
if (currentIndex > 0) {
  // Navegar al anterior
} else {
  // No hacer nada
}

// Después: Navegación circular
if (currentIndex > 0) {
  // Navegar al anterior
} else {
  // Ir al último nodo del nivel
  const lastNode = sameLevelNodes[sameLevelNodes.length - 1];
  this.selectNode(this.allNodes.indexOf(lastNode));
}
```

#### 3. Función `navigateToNextSequential()`
```javascript
// Antes: Se detenía al llegar al último nodo
if (currentIndex < sameLevelNodes.length - 1) {
  // Navegar al siguiente
} else {
  // Intentar ir al siguiente nivel
  this.navigateToFirstNodeOfNextLevel(currentLevel);
}

// Después: Navegación circular
if (currentIndex < sameLevelNodes.length - 1) {
  // Navegar al siguiente
} else {
  // Intentar ir al siguiente nivel
  const nextLevelResult = this.navigateToFirstNodeOfNextLevel(currentLevel);
  
  // Si no hay siguiente nivel, volver al primer nodo
  if (!nextLevelResult) {
    this.navigateToFirst();
  }
}
```

#### 4. Función `navigateToPreviousSequential()`
```javascript
// Antes: Se detenía al llegar al primer nodo
if (currentIndex > 0) {
  // Navegar al anterior
} else {
  // Intentar ir al nivel anterior
  this.navigateToLastNodeOfPreviousLevel(currentLevel);
}

// Después: Navegación circular
if (currentIndex > 0) {
  // Navegar al anterior
} else {
  // Intentar ir al nivel anterior
  const previousLevelResult = this.navigateToLastNodeOfPreviousLevel(currentLevel);
  
  // Si no hay nivel anterior, ir al último nodo
  if (!previousLevelResult) {
    this.navigateToLast();
  }
}
```

#### 5. Función `navigateToParent()` (Nueva navegación circular)
```javascript
// Antes: Se detenía si no había padre
if (nodeData && nodeData.parent) {
  // Buscar y navegar al padre
} else {
  // No hacer nada
}

// Después: Navegación circular
if (nodeData && nodeData.parent) {
  // Buscar y navegar al padre
} else {
  // Si no hay padre, ir al nodo raíz (nivel 0)
  this.navigateToRootNode();
}
```

#### 6. Función `navigateToFirstChild()` (Nueva navegación circular)
```javascript
// Antes: Se detenía si no había hijos
if (childIndex !== -1) {
  // Navegar al primer hijo
} else {
  // No hacer nada
}

// Después: Navegación circular
if (childIndex !== -1) {
  // Navegar al primer hijo
} else {
  // Si no hay hijos, intentar ir al primer nodo del siguiente nivel
  const currentLevel = this.getNodeLevel(nodeData);
  const nextLevelResult = this.navigateToFirstNodeOfNextLevel(currentLevel);
  
  // Si no hay siguiente nivel, ir al primer nodo del diagrama
  if (!nextLevelResult) {
    this.navigateToFirst();
  }
}
```

#### 7. Nueva función `navigateToRootNode()`
```javascript
// Navega al nodo raíz (nivel 0)
navigateToRootNode: function() {
  // Buscar todos los nodos en el nivel 0
  const rootNodes = this.allNodes.filter((node, index) => {
    const data = this.getNodeData(node);
    if (!data) return false;
    
    const nodeLevel = this.getNodeLevel(data);
    return nodeLevel === 0;
  });
  
  if (rootNodes.length > 0) {
    // Ordenar y seleccionar el primer nodo raíz
    rootNodes.sort((a, b) => {
      const indexA = this.allNodes.indexOf(a);
      const indexB = this.allNodes.indexOf(b);
      return indexA - indexB;
    });
    
    const firstRootNode = rootNodes[0];
    const rootNodeIndex = this.allNodes.indexOf(firstRootNode);
    this.selectNode(rootNodeIndex);
  } else {
    // Fallback al primer nodo si no se encuentran nodos raíz
    this.navigateToFirst();
  }
}
```

### Valores de Retorno

Las funciones `navigateToFirstNodeOfNextLevel()` y `navigateToLastNodeOfPreviousLevel()` ahora retornan valores booleanos:

- `true`: Se encontró y seleccionó un nodo
- `false`: No se encontró ningún nodo en el nivel solicitado

## Casos de Uso

### 1. Navegación Continua
El usuario puede navegar indefinidamente sin llegar a un "final" del diagrama, lo que mejora la experiencia de exploración.

### 2. Accesibilidad
Los usuarios con discapacidades motoras pueden navegar más fácilmente sin tener que cambiar de dirección.

### 3. Exploración Completa
Garantiza que todos los nodos sean accesibles desde cualquier punto del diagrama.

### 4. Navegación Jerárquica Fluida
- **Flecha Arriba**: Siempre encuentra un nodo padre o va al nodo raíz
- **Flecha Abajo**: Siempre encuentra un hijo o continúa al siguiente nivel
- **Sin Puntos Muertos**: No hay situaciones donde la navegación se detenga

### 5. Exploración de Estructuras Complejas
- Permite explorar diagramas con múltiples niveles de jerarquía
- Facilita la navegación en estructuras donde algunos nodos no tienen hijos
- Mantiene la coherencia en la navegación independientemente de la estructura

## Pruebas

### Archivo de Prueba: `test-circular-navigation.html`

Este archivo incluye:

1. **Panel de Debug**: Muestra información en tiempo real sobre el nodo actual
2. **Instrucciones Detalladas**: Guía paso a paso para probar la funcionalidad
3. **Múltiples Diagramas**: Permite probar en diferentes estructuras de datos
4. **Feedback Visual**: Indicadores claros del estado de navegación

### Cómo Probar

1. Abrir `test-circular-navigation.html`
2. Hacer clic en cualquier nodo para activar la navegación
3. Usar las flechas ← → para navegar entre hermanos
4. Verificar que al llegar al último nodo, vuelva al primero
5. Usar Tab para navegación secuencial circular
6. Cambiar entre diagramas para probar diferentes estructuras

## Compatibilidad

- ✅ Navegadores modernos (Chrome, Firefox, Safari, Edge)
- ✅ Diferentes estructuras de diagramas
- ✅ Navegación jerárquica y secuencial
- ✅ Integración con el sistema de temas existente

## Beneficios

1. **Mejor UX**: Navegación más fluida y predecible
2. **Accesibilidad**: Facilita el uso para usuarios con discapacidades
3. **Exploración Completa**: Garantiza acceso a todos los nodos
4. **Consistencia**: Comportamiento uniforme en todos los tipos de navegación

## Próximas Mejoras

- [ ] Indicador visual de navegación circular
- [ ] Sonidos de feedback para navegación
- [ ] Configuración para desactivar navegación circular
- [ ] Estadísticas de navegación
- [ ] Historial de nodos visitados 