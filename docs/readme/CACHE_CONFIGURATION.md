# 🚫 Configuración de Caché - XDiagrams

## 📋 Resumen

XDiagrams incluye un sistema de caché inteligente que mejora el rendimiento al almacenar datos de APIs externas. Por defecto, la caché permanece activa durante **1 hora**, pero puedes desactivarla para diagramas específicos.

## ⚙️ Configuración de Caché

### Comportamiento por Defecto

```javascript
// Por defecto, la caché está ACTIVADA con TTL de 1 hora
window.$xDiagrams = {
  url: "https://api.ejemplo.com/datos",
  title: "Mi Diagrama"
  // disableCache: false (implícito)
};
```

### Desactivar Caché para un Diagrama Específico

```javascript
// Desactivar caché - request cada vez que se recarga el navegador
window.$xDiagrams = {
  url: "https://api.ejemplo.com/datos",
  title: "Mi Diagrama",
  disableCache: true  // 🚫 Desactiva la caché
};
```

## 🎯 Casos de Uso

### ✅ Usar Caché (Recomendado para la mayoría de casos)
- **Datos que cambian poco frecuentemente**
- **APIs con límites de rate**
- **Mejor rendimiento de carga**
- **Reducción de requests innecesarios**

```javascript
window.$xDiagrams = {
  url: "https://api.ejemplo.com/datos-estaticos",
  title: "Datos Estáticos",
  disableCache: false  // Caché activada (por defecto)
};
```

### ❌ Desactivar Caché (Para datos en tiempo real)
- **Datos que cambian constantemente**
- **APIs de tiempo real**
- **Datos críticos que deben ser siempre actuales**
- **Desarrollo y testing**

```javascript
window.$xDiagrams = {
  url: "https://api.ejemplo.com/datos-tiempo-real",
  title: "Datos en Tiempo Real",
  disableCache: true  // 🚫 Caché desactivada
};
```

## 🔧 Configuración Técnica

### Parámetros de Caché

```javascript
// Configuración interna de caché (no modificable desde configuración)
{
  ttl: 3600000,        // 1 hora en milisegundos
  maxSize: 10,         // 10MB máximo
  version: '1.0',      // Versión para invalidación
  disabled: false      // Controlado por disableCache
}
```

### URLs que se Cachean

La caché se aplica automáticamente a URLs que contengan:
- `api.` (APIs)
- `.json` (Archivos JSON)
- `/api/` (Endpoints de API)

### URLs que NO se Cachean

- URLs del mismo origen (mismo dominio)
- URLs locales (archivos locales)

## 📊 Ejemplos Prácticos

### Ejemplo 1: Dashboard con Datos Estáticos
```javascript
window.$xDiagrams = {
  url: "https://api.miempresa.com/empleados",
  title: "Organigrama de Empleados",
  clustersPerRow: "5 4 3",
  disableCache: false  // Mantener caché para mejor rendimiento
};
```

### Ejemplo 2: Monitor de Estado en Tiempo Real
```javascript
window.$xDiagrams = {
  url: "https://api.miempresa.com/estado-servidores",
  title: "Estado de Servidores",
  clustersPerRow: "3 2 1",
  disableCache: true   // Siempre obtener datos frescos
};
```

### Ejemplo 3: Desarrollo y Testing
```javascript
window.$xDiagrams = {
  url: "https://api.ejemplo.com/datos-test",
  title: "Datos de Prueba",
  disableCache: true   // Evitar caché durante desarrollo
};
```

## 🔍 Debugging

### Verificar Estado de Caché

```javascript
// En la consola del navegador
console.log('Estado de caché:', window.xDiagramsLoader.cacheInstance.config.disabled);
console.log('Datos en caché:', Object.keys(localStorage).filter(key => key.startsWith('xdiagrams_cache_')));
```

### Limpiar Caché Manualmente

```javascript
// Limpiar caché específica
window.xDiagramsLoader.clearCache('https://api.ejemplo.com/datos');

// Limpiar toda la caché
window.xDiagramsLoader.cacheInstance.clearAll();
```

## ⚠️ Consideraciones

### Rendimiento
- **Con caché**: Carga más rápida, menos requests
- **Sin caché**: Datos siempre actuales, más requests

### Uso de Ancho de Banda
- **Con caché**: Reduce el uso de ancho de banda
- **Sin caché**: Usa más ancho de banda por requests frecuentes

### APIs con Rate Limits
- **Con caché**: Respeta límites de rate
- **Sin caché**: Puede exceder límites de rate

## 🚀 Migración

### De Versiones Anteriores
Si vienes de una versión anterior, no necesitas cambios. La caché está activada por defecto.

### Actualizar Configuración Existente
```javascript
// Antes (funciona igual)
window.$xDiagrams = {
  url: "https://api.ejemplo.com/datos",
  title: "Mi Diagrama"
};

// Después (explícito)
window.$xDiagrams = {
  url: "https://api.ejemplo.com/datos",
  title: "Mi Diagrama",
  disableCache: false  // Explícito pero opcional
};
```

---

# 🔇 Configuración de Logs de Navegación

## 📋 Resumen

XDiagrams genera logs durante la navegación y zoom que pueden afectar el performance en diagramas complejos. Puedes desactivar estos logs para mejorar el rendimiento.

## ⚙️ Configuración de Logs

### Comportamiento por Defecto

```javascript
// Por defecto, los logs de navegación están DESACTIVADOS (mejor performance)
window.$xDiagrams = {
  url: "https://api.ejemplo.com/datos",
  title: "Mi Diagrama"
  // enableNavigationLogs: false (implícito)
};
```

### Activar Logs de Navegación

```javascript
// Activar logs para debugging y desarrollo
window.$xDiagrams = {
  url: "https://api.ejemplo.com/datos",
  title: "Mi Diagrama",
  enableNavigationLogs: true  // 🔇 Activa logs de navegación
};
```

## 🎯 Casos de Uso

### ✅ Activar Logs (Recomendado para desarrollo)
- **Desarrollo y debugging**
- **Diagramas pequeños**
- **Necesitas información de navegación**
- **Testing de funcionalidades**

```javascript
window.$xDiagrams = {
  url: "https://api.ejemplo.com/datos",
  title: "Diagrama de Desarrollo",
  enableNavigationLogs: true  // Logs activados
};
```

### ❌ Mantener Logs Desactivados (Recomendado para producción)
- **Diagramas complejos con muchos nodos**
- **Navegación frecuente por zoom**
- **Performance crítico**
- **Entorno de producción**

```javascript
window.$xDiagrams = {
  url: "https://api.ejemplo.com/datos",
  title: "Diagrama de Producción",
  enableNavigationLogs: false  // 🔇 Logs desactivados (por defecto)
};
```

## 🔧 Logs que se Controlan

### Logs Críticos (Siempre Activos)
- **Errores de inicialización**: Problemas críticos durante la carga
- **Errores de datos**: Problemas con APIs o parsing de datos
- **Errores de LLM**: Problemas con el generador de datos LLM

### Logs de Debugging (Controlados por enableNavigationLogs)
- **Inicialización**: Estado del DOM y configuración
- **Zoom**: Aplicación de clases CSS basadas en zoom level
- **Navegación**: Transiciones y cambios de estado
- **Floating Title Pill**: Estado de inicialización

### Logs Eliminados (Performance)
- **Source Detector**: Detección de tipos de fuente
- **Cluster Navigation**: Gestión de bloqueadores y selección
- **Info Panel**: Procesamiento de datos y URLs
- **UI Manager**: Inicialización de componentes
- **Diagram Renderer**: Creación de elementos
- **LLM Data Generator**: Estado de generación
- **Parsing CSV**: Errores menores de parsing

## 📊 Ejemplos Prácticos

### Ejemplo 1: Desarrollo Local
```javascript
window.$xDiagrams = {
  url: "data/companies-board.csv",
  title: "Desarrollo Local",
  enableNavigationLogs: true,  // Logs para debugging
  disableCache: true           // Sin caché para desarrollo
};
```

### Ejemplo 2: Producción con Performance (Configuración por Defecto)
```javascript
window.$xDiagrams = {
  url: "https://api.miempresa.com/datos",
  title: "Diagrama de Producción"
  // enableNavigationLogs: false (por defecto)
  // disableCache: false (por defecto)
};
```

### Ejemplo 3: Configuración Completa
```javascript
window.$xDiagrams = {
  url: "https://api.ejemplo.com/datos",
  title: "Configuración Optimizada",
  clustersPerRow: "4 3 2",
  showThemeToggle: true,
  disableCache: false,         // Caché activada (por defecto)
  enableNavigationLogs: false  // Logs desactivados (por defecto)
};
```

## ⚠️ Impacto en Performance

### Con Logs Activados
- **Pros**: Información de debugging disponible
- **Contras**: Puede afectar performance en diagramas complejos
- **Uso de CPU**: Mayor durante navegación intensiva

### Con Logs Desactivados (Por Defecto)
- **Pros**: Mejor performance, menos uso de CPU
- **Contras**: Menos información para debugging
- **Uso de CPU**: Reducido durante navegación

## 🔍 Verificar Configuración

```javascript
// En la consola del navegador
console.log('Logs de navegación:', window.$xDiagrams?.instance?.core?.config?.enableNavigationLogs);
```

## 🚀 Migración

### De Versiones Anteriores
Los logs están desactivados por defecto para mejor performance. Si necesitas logs para debugging, agrega explícitamente `enableNavigationLogs: true`.

### Para Activar Logs (Desarrollo)
```javascript
// Agregar esta línea a tu configuración existente
window.$xDiagrams = {
  // ... tu configuración actual ...
  enableNavigationLogs: true  // 🔇 Activar logs para debugging
};
```
