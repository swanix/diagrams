# Documentación de Parámetros de Layout - Swanix Diagrams

Esta documentación describe todos los parámetros de configuración disponibles para el layout de diagramas en Swanix Diagrams, incluyendo las nuevas funcionalidades de ajuste automático de columnas.

## Índice

1. [Configuración Básica](#configuración-básica)
2. [Ajuste Automático de Columnas](#ajuste-automático-de-columnas)
3. [Niveles de Configuración](#niveles-de-configuración)
4. [Ejemplos de Configuración](#ejemplos-de-configuración)
5. [Casos de Uso](#casos-de-uso)
6. [Troubleshooting](#troubleshooting)

---

## Configuración Básica

### `clustersPerRow`
- **Tipo**: `number` | `string` | `array`
- **Default**: `7`
- **Descripción**: Número de clusters por fila en el layout de cuadrícula. Soporta múltiples valores para definir columnas específicas por fila.
- **Rango recomendado**: Sin límite (cualquier número positivo)

#### Sintaxis

**1. Valor Único (Comportamiento Original)**
```javascript
layout: {
  clustersPerRow: 5
}
```

**2. Múltiples Valores como String (CSS-like)**
```javascript
layout: {
  clustersPerRow: "5 4 3 7 8"
}
```

**3. Múltiples Valores como Array**
```javascript
layout: {
  clustersPerRow: [5, 4, 3, 7, 8]
}
```

#### Comportamiento con Múltiples Valores

Cuando se definen múltiples valores, el sistema los interpreta de la siguiente manera:

- **Filas definidas explícitamente**: Usan los valores especificados con prioridad total
- **Filas adicionales**: Aplican la lógica automática por defecto con todas las validaciones

**Ejemplo**: `clustersPerRow: "5 4 3"`
- **1era fila**: 5 columnas (valor explícito)
- **2da fila**: 4 columnas (valor explícito)  
- **3ra fila**: 3 columnas (valor explícito)
- **4ta fila**: Lógica automática (wideClusterThreshold, fullRowThreshold, etc.)
- **5ta fila**: Lógica automática (wideClusterThreshold, fullRowThreshold, etc.)

### `marginX`
- **Tipo**: `number`
- **Default**: `50`
- **Descripción**: Margen izquierdo en píxeles
- **Unidad**: píxeles

```javascript
layout: {
  marginX: 40
}
```

### `marginY`
- **Tipo**: `number`
- **Default**: `50`
- **Descripción**: Margen superior en píxeles
- **Unidad**: píxeles

```javascript
layout: {
  marginY: 60
}
```

### `spacingX`
- **Tipo**: `number`
- **Default**: `60`
- **Descripción**: Espaciado horizontal entre clusters
- **Unidad**: píxeles

```javascript
layout: {
  spacingX: 50
}
```

### `spacingY`
- **Tipo**: `number`
- **Default**: `60`
- **Descripción**: Espaciado vertical entre filas de clusters
- **Unidad**: píxeles

```javascript
layout: {
  spacingY: 80
}
```

---

## Ajuste Automático de Columnas

### `fullRowThreshold`
- **Tipo**: `number`
- **Default**: `70`
- **Descripción**: Porcentaje para detectar clusters que requieren fila completa. Si un cluster supera este porcentaje del ancho de la fila anterior, este cluster ocupa toda una fila (1 columna) y los clusters siguientes pasan a una nueva fila.
- **Unidad**: porcentaje (0-100)
- **Comportamiento**: 
  - Cuando se detecta un cluster que supera el umbral, este ocupa toda la fila
  - Los clusters restantes se mueven automáticamente a la siguiente fila
  - Tiene prioridad sobre `wideClusterThreshold`
  - Se aplica a todas las filas excepto la primera

```javascript
layout: {
  fullRowThreshold: 70  // Cluster ocupa toda la fila si supera 70% del ancho anterior
}
```

### `wideClusterThreshold`
- **Tipo**: `number`
- **Default**: `50`
- **Descripción**: Porcentaje para detectar clusters anchos. Si un cluster supera este porcentaje del ancho de la fila anterior (pero no supera `fullRowThreshold`), esa fila se ajusta automáticamente a 2 columnas.
- **Unidad**: porcentaje (0-100)
- **Comportamiento**: 
  - Solo se aplica si ningún cluster supera `fullRowThreshold`
  - Cuando se detecta un cluster ancho, la fila se reorganiza para mostrar solo 2 columnas que se expanden
  - Los clusters restantes se mueven a la siguiente fila
  - Se aplica a las filas 2, 3 y 4 del diagrama

```javascript
layout: {
  wideClusterThreshold: 60  // Más estricto: solo ajustar si supera 60%
}
```

### `lastRowThreshold`
- **Tipo**: `number`
- **Default**: `50`
- **Descripción**: Porcentaje para la última fila. Si la última fila suma menos de este porcentaje del ancho de la fila anterior, los clusters mantienen su ancho original sin expandirse.
- **Unidad**: porcentaje (0-100)
- **Comportamiento**:
  - Evita que clusters pequeños se estiren innecesariamente
  - Mejora la legibilidad cuando hay pocos clusters en la última fila

```javascript
layout: {
  lastRowThreshold: 40  // Más permisivo: usar ancho original si es menos de 40%
}
```

### `lastRowAlignment`
- **Tipo**: `string`
- **Default**: `'left'`
- **Opciones**: `'left'` | `'center'`
- **Descripción**: Alineación de la última fila cuando usa ancho original (cuando `lastRowThreshold` se activa)
- **Comportamiento**:
  - `'left'`: Los clusters se alinean al margen izquierdo
  - `'center'`: Los clusters se centran en el ancho disponible

```javascript
layout: {
  lastRowAlignment: 'center'  // Centrar la última fila
}
```

### `shortLastRow`
- **Tipo**: `boolean`
- **Default**: `false`
- **Descripción**: Controla si la última fila debe tener una altura modificada (mitad de la altura normal)
- **Comportamiento**:
  - `false`: La última fila mantiene la misma altura que las demás filas (comportamiento por defecto)
  - `true`: La última fila usa la mitad de la altura normal, creando un efecto visual diferente

```javascript
layout: {
  shortLastRow: true  // Activar modificación de altura en última fila
}
```

---

## Configuración de Múltiples Valores en clustersPerRow

### Descripción General

La funcionalidad de múltiples valores en `clustersPerRow` permite definir manualmente el número de columnas por fila de forma específica, similar a las propiedades combinadas de CSS. Esta funcionalidad proporciona control granular sobre el layout mientras mantiene la flexibilidad de la lógica automática para filas adicionales.

### Prioridades y Comportamiento

#### Valores Explícitos
Cuando se definen valores explícitos en `clustersPerRow`, estos tienen **prioridad total** sobre los otros parámetros de layout como:
- `wideClusterThreshold`
- `fullRowThreshold`
- Lógica automática de ajuste de columnas

#### Lógica Automática
Para filas que no tienen valores explícitos definidos, se aplica la lógica automática completa que incluye:
- **wideClusterThreshold**: Si un cluster supera el 50% del ancho de la fila anterior, limita a 2 columnas
- **fullRowThreshold**: Si un cluster supera el 70% del ancho de la fila anterior, ocupa toda la fila (1 columna)
- **Ajuste dinámico**: Basado en el tamaño real de los clusters
- **lastRowThreshold**: Para la última fila, verifica si debe usar ancho original o expandir

### Casos de Uso Específicos

#### Caso 1: Layout Progresivo
```javascript
layout: {
  clustersPerRow: "3 2 1",  // Disminuye progresivamente
  marginX: 30,
  marginY: 30,
  spacingX: 60,
  spacingY: 60
}
```

#### Caso 2: Layout Variable
```javascript
layout: {
  clustersPerRow: "5 4 3 7 8",  // Patrón variable
  marginX: 30,
  marginY: 30,
  spacingX: 100,
  spacingY: 100
}
```

#### Caso 3: Mixed Explicit + Auto Logic
```javascript
layout: {
  clustersPerRow: "5 4 3",  // Solo 3 filas explícitas
  marginX: 30,
  marginY: 30,
  spacingX: 100,
  spacingY: 100,
  fullRowThreshold: 70,     // Se aplica a filas 4+ (lógica automática)
  wideClusterThreshold: 50  // Se aplica a filas 4+ (lógica automática)
}
```

#### Caso 4: Layout con Valores Grandes
```javascript
layout: {
  clustersPerRow: "10 12 15",  // Sin límite de columnas
  marginX: 30,
  marginY: 30,
  spacingX: 100,
  spacingY: 100
}
```

### Logs y Debugging

El sistema genera logs detallados en la consola del navegador para ayudar con el debugging:

#### Ejemplo con valores explícitos:
```
[Layout] clustersPerRow con múltiples valores detectado: "5 4 3" -> [5, 4, 3]
[Layout] clustersPerRow array: [5, 4, 3]
[Layout] clustersPerRow por defecto: 5
[Layout] Fila 0: Usando valor explícito de 5 columnas
[Layout] Fila 1: Usando valor explícito de 4 columnas
[Layout] Fila 2: Usando valor explícito de 3 columnas
[Layout] Fila 3: Sin valor explícito definido, aplicando lógica automática
[Layout] Fila 4: Sin valor explícito definido, aplicando lógica automática
```

#### Ejemplo con lógica automática:
```
[Layout] Fila 3: Analizando fila 3: 5 clusters, aplicando lógica automática
[Layout] Fila 3: Cluster de fila completa detectado (>70% de fila anterior), ajustando a 1 columna
[Layout] Fila 4: Analizando fila 4: 3 clusters, aplicando lógica automática
[Layout] Fila 4: Cluster ancho detectado (>50% de fila anterior), ajustando a 2 columnas
```

### Compatibilidad

- ✅ **Retrocompatible**: Los valores únicos mantienen el comportamiento original
- ✅ **Sin límite de columnas**: Soporta cualquier número de columnas (no limitado a 7)
- ✅ **Flexibilidad total**: Combina control manual con lógica automática
- ✅ **Consistencia**: Todos los valores se procesan como arrays internamente

---

## Niveles de Configuración

### 1. Configuración Global
Se aplica a todos los diagramas cuando no hay configuración específica.

```javascript
window.$xDiagrams = {
  layout: {
    clustersPerRow: 7,
    marginX: 50,
    marginY: 50,
    spacingX: 60,
    spacingY: 60,
    fullRowThreshold: 70,
    wideClusterThreshold: 50,
    lastRowThreshold: 50,
    lastRowAlignment: 'left'
  }
};
```

### 2. Configuración por Diagrama
Sobrescribe la configuración global para un diagrama específico.

```javascript
const diagramConfig = {
  name: "Mi Diagrama",
  url: "data/mi-diagrama.csv",
  layout: {
    clustersPerRow: 5,
    marginX: 40,
    marginY: 40,
    spacingX: 50,
    spacingY: 50,
    fullRowThreshold: 70,
    wideClusterThreshold: 60,
    lastRowThreshold: 40,
    lastRowAlignment: 'center'
  }
};
```

### 3. Prioridad de Configuración
1. **Configuración específica del diagrama** (máxima prioridad)
2. **Configuración global** (prioridad media)
3. **Valores por defecto** (prioridad mínima)

---

## Ejemplos de Configuración

### Configuración Conservadora
Para diagramas donde quieres menos ajustes automáticos:

```javascript
layout: {
  clustersPerRow: 6,
  marginX: 60,
  marginY: 60,
  spacingX: 70,
  spacingY: 70,
  fullRowThreshold: 80,        // Solo fila completa si supera 80%
  wideClusterThreshold: 70,    // Solo ajustar si supera 70%
  lastRowThreshold: 30,        // Usar ancho original si es menos de 30%
  lastRowAlignment: 'left'     // Siempre alinear a la izquierda
}
```

### Configuración Agresiva
Para diagramas donde quieres más ajustes automáticos:

```javascript
layout: {
  clustersPerRow: 8,
  marginX: 40,
  marginY: 40,
  spacingX: 50,
  spacingY: 50,
  fullRowThreshold: 60,        // Fila completa si supera 60%
  wideClusterThreshold: 40,    // Ajustar si supera 40%
  lastRowThreshold: 60,        // Usar ancho original si es menos de 60%
  lastRowAlignment: 'center'   // Centrar la última fila
}
```

### Configuración para Diagramas con Clusters Variados
Para diagramas con tamaños muy diferentes:

```javascript
layout: {
  clustersPerRow: 5,
  marginX: 50,
  marginY: 50,
  spacingX: 60,
  spacingY: 60,
  fullRowThreshold: 70,        // Fila completa para clusters muy grandes
  wideClusterThreshold: 45,    // Umbral personalizado para clusters anchos
  lastRowThreshold: 35,        // Umbral personalizado
  lastRowAlignment: 'left'     // Alineación consistente
}
```

### Configuración para Diagramas Compactos
Para maximizar el uso del espacio:

```javascript
layout: {
  clustersPerRow: 9,
  marginX: 30,
  marginY: 30,
  spacingX: 40,
  spacingY: 40,
  fullRowThreshold: 75,        // Umbral moderado para fila completa
  wideClusterThreshold: 55,    // Umbral moderado para clusters anchos
  lastRowThreshold: 45,        // Umbral moderado
  lastRowAlignment: 'center'   // Centrar para mejor apariencia
}
```

### Configuración con Múltiples Valores
Para control granular sobre el layout:

```javascript
layout: {
  clustersPerRow: "6 4 2",     // Layout progresivo: 6, 4, 2 columnas
  marginX: 40,
  marginY: 40,
  spacingX: 60,
  spacingY: 60,
  fullRowThreshold: 70,        // Se aplica a filas 4+ (lógica automática)
  wideClusterThreshold: 50,    // Se aplica a filas 4+ (lógica automática)
  lastRowThreshold: 40,
  lastRowAlignment: 'center'
}
```

---

## Casos de Uso

### Caso 1: Diagrama con Clusters de Tamaños Muy Diferentes
**Problema**: Algunos clusters son mucho más anchos que otros, causando desequilibrio visual.

**Solución**:
```javascript
layout: {
  fullRowThreshold: 70,        // Clusters muy grandes ocupan fila completa
  wideClusterThreshold: 45,    // Detectar clusters anchos temprano
  lastRowThreshold: 40,        // Evitar estirar clusters pequeños
  lastRowAlignment: 'left'     // Mantener alineación consistente
}
```

### Caso 2: Diagrama con Muchos Clusters Pequeños
**Problema**: Muchos clusters pequeños que se ven mejor agrupados.

**Solución**:
```javascript
layout: {
  clustersPerRow: 8,           // Más clusters por fila
  fullRowThreshold: 80,        // Umbral alto para evitar filas completas innecesarias
  wideClusterThreshold: 60,    // Umbral más alto para evitar ajustes innecesarios
  lastRowThreshold: 50,        // Umbral estándar
  lastRowAlignment: 'center'   // Centrar para mejor apariencia
}
```

### Caso 3: Diagrama con Clusters Grandes
**Problema**: Clusters grandes que necesitan más espacio.

**Solución**:
```javascript
layout: {
  clustersPerRow: 4,           // Menos clusters por fila
  fullRowThreshold: 65,        // Detectar clusters grandes para fila completa
  wideClusterThreshold: 35,    // Detectar clusters anchos fácilmente
  lastRowThreshold: 60,        // Permitir expansión en última fila
  lastRowAlignment: 'center'   // Centrar para mejor apariencia
}
```

### Caso 4: Diagrama Responsive
**Problema**: Necesitas que el diagrama se adapte a diferentes tamaños de pantalla.

**Solución**:
```javascript
layout: {
  clustersPerRow: 6,           // Número moderado de clusters
  marginX: 40,
  marginY: 40,
  spacingX: 50,
  spacingY: 50,
  fullRowThreshold: 70,        // Umbral estándar para fila completa
  wideClusterThreshold: 50,    // Umbral estándar para clusters anchos
  lastRowThreshold: 50,        // Umbral estándar
  lastRowAlignment: 'left'     // Alineación consistente
}
```

### Caso 5: Diagrama con Layout Mixto
**Problema**: Necesitas control específico sobre las primeras filas pero flexibilidad automática para el resto.

**Solución**:
```javascript
layout: {
  clustersPerRow: "8 6 4",     // Control específico para 3 filas
  marginX: 40,
  marginY: 40,
  spacingX: 60,
  spacingY: 60,
  fullRowThreshold: 65,        // Lógica automática para filas 4+
  wideClusterThreshold: 45,    // Lógica automática para filas 4+
  lastRowThreshold: 50,
  lastRowAlignment: 'center'
}
```

### Caso 6: Diagrama con Altura Modificada en Última Fila
**Problema**: Quieres crear un efecto visual especial donde la última fila tenga una altura diferente.

**Solución**:
```javascript
layout: {
  clustersPerRow: 4,
  marginX: 30,
  marginY: 30,
  spacingX: 60,
  spacingY: 60,
  shortLastRow: true  // Última fila con altura reducida
}
```

---

## Troubleshooting

### Problema: Los clusters no se ajustan automáticamente
**Posibles causas**:
1. `fullRowThreshold` o `wideClusterThreshold` son muy altos
2. Los clusters no superan los umbrales configurados
3. La configuración no se está aplicando correctamente

**Solución**:
```javascript
layout: {
  fullRowThreshold: 60,        // Reducir el umbral de fila completa
  wideClusterThreshold: 40,    // Reducir el umbral de clusters anchos
}
```

### Problema: La última fila se estira innecesariamente
**Posibles causas**:
1. `lastRowThreshold` es muy alto
2. La última fila supera el umbral configurado

**Solución**:
```javascript
layout: {
  lastRowThreshold: 30,        // Reducir el umbral
}
```

### Problema: Los clusters desaparecen
**Posibles causas**:
1. Configuración incorrecta de `clustersPerRow`
2. Problema en la redistribución automática

**Solución**:
- Verificar los logs en la consola del navegador
- Ajustar `clustersPerRow` a un valor más alto
- Revisar que todos los clusters estén siendo procesados

### Problema: Espaciado inconsistente
**Posibles causas**:
1. Valores de `spacingX` o `spacingY` incorrectos
2. Conflictos con `marginX` o `marginY`

**Solución**:
```javascript
layout: {
  spacingX: 60,                // Asegurar espaciado consistente
  spacingY: 60,
  marginX: 50,                 // Márgenes apropiados
  marginY: 50
}
```

---

## Logs y Debugging

El sistema genera logs detallados en la consola del navegador para ayudar con el debugging:

```
[Layout] Iniciando análisis de 3 filas iniciales con 15 clusters totales
[Layout] Analizando fila 0: 7 clusters (índices 0-6)
[Layout] Fila 0: Primera fila, usando 7 columnas
[Layout] Analizando fila 1: 7 clusters (índices 7-13)
[Layout] Fila 1: Ancho de fila anterior = 1200.0px
[Layout] Fila 1: Cluster cluster-8 requiere fila completa (75.2% > 70%)
[Layout] Fila 1: Cluster de fila completa detectado (>70% de fila anterior), ajustando a 1 columna
[Layout] Última fila 2: ancho total 400.0px (33.3% de fila anterior), usando ancho original sin expandir
[Layout] Última fila alineada a la izquierda: ancho total 400.0px, posición X inicial 50.0px
```

---

## Compatibilidad

- ✅ **Retrocompatible**: Los valores por defecto mantienen el comportamiento actual
- ✅ **Configuración jerárquica**: Diagrama específico > Global > Default
- ✅ **Logging mejorado**: Los mensajes muestran los valores configurados
- ✅ **Flexibilidad total**: Puedes ajustar cada parámetro según tus necesidades

---

## Versión

Esta documentación corresponde a la versión **0.4.5** de Swanix Diagrams.

## Nuevas Funcionalidades

### Clusters de Fila Completa (v0.4.3)
- **Nuevo parámetro**: `fullRowThreshold`
- **Comportamiento**: Los clusters que superen el 70% del ancho de la fila anterior ocupan toda una fila
- **Prioridad**: Tiene prioridad sobre `wideClusterThreshold`
- **Compatibilidad**: Totalmente retrocompatible

### Múltiples Valores en clustersPerRow (v0.4.4)
- **Nuevo comportamiento**: `clustersPerRow` ahora soporta múltiples valores
- **Sintaxis**: String con espacios (`"5 4 3"`) o array (`[5, 4, 3]`)
- **Comportamiento**: Valores explícitos para filas definidas, lógica automática para filas adicionales
- **Prioridad**: Los valores explícitos tienen prioridad total sobre lógica automática
- **Compatibilidad**: Totalmente retrocompatible con valores únicos

### Modificación de Altura en Última Fila (v0.4.5)
- **Nuevo parámetro**: `shortLastRow`
- **Comportamiento**: Controla si la última fila debe tener altura modificada (mitad de altura normal)
- **Valor por defecto**: `false` (comportamiento original)
- **Compatibilidad**: Totalmente retrocompatible

---

## Contribuir

Si encuentras problemas o tienes sugerencias para mejorar esta documentación, por favor:

1. Revisa los logs en la consola del navegador
2. Verifica que la configuración se esté aplicando correctamente
3. Prueba con diferentes valores de configuración
4. Documenta el problema y la solución encontrada 