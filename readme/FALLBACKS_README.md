# Sistema de Fallbacks Opcionales

## Descripción

El sistema de fallbacks permite definir URLs alternativas para cada diagrama directamente en la configuración HTML. Cuando la URL principal falla (especialmente por errores CORS), el sistema intenta automáticamente las URLs de fallback definidas.

## Configuración

### Estructura Básica

```javascript
window.swDiagrams.diagrams = [
  {
    name: "Mi Diagrama",
    url: "https://docs.google.com/spreadsheets/d/.../pub?output=csv",
    fallbacks: [
      "data/mi-diagrama-local.csv",
      "https://raw.githubusercontent.com/mi-repo/diagram.csv"
    ]
  }
];
```

### Propiedades

- **`name`**: Nombre del diagrama (requerido)
- **`url`**: URL principal del diagrama (requerido)
- **`fallbacks`**: Array de URLs alternativas (opcional)

## Ejemplos

### Diagrama con Fallbacks

```javascript
{
  name: "Diagrama Complejo",
  url: "https://docs.google.com/spreadsheets/d/.../pub?output=csv",
  fallbacks: [
    "data/diagrama-complejo-backup.csv",
    "https://raw.githubusercontent.com/company/diagrams/main/complejo.csv",
    "https://mi-servidor.com/diagrams/complejo.csv"
  ]
}
```

### Diagrama sin Fallbacks

```javascript
{
  name: "Diagrama Simple",
  url: "data/diagrama-simple.csv"
  // No fallbacks needed for local files
}
```

### Diagrama con un Solo Fallback

```javascript
{
  name: "Diagrama con Backup",
  url: "https://docs.google.com/spreadsheets/d/.../pub?output=csv",
  fallbacks: [
    "data/backup.csv"
  ]
}
```

## Funcionamiento

### Flujo de Carga

1. **Intento Principal**: Se intenta cargar la URL principal
2. **Detección de Error**: Si falla por CORS u otro error
3. **Reintentos**: Hasta 2 reintentos automáticos de la URL principal
4. **Fallbacks**: Si los reintentos fallan, se prueban las URLs de fallback en orden
5. **Error Final**: Si todos fallan, se muestra el mensaje de error

### Logs de Debug

```
[Cache] Loading with cache buster: https://docs.google.com/...
Error al cargar CSV: CORS error
[Retry] CORS error detected, retrying in 2 seconds... (attempt 1)
[Retry] CORS error detected, retrying in 2 seconds... (attempt 2)
[Fallback] Attempting to use fallback URLs...
[Fallback] Trying fallback URL 1: data/diagrama-backup.csv
CSV cargado exitosamente: 25 filas
```

## Tipos de URLs Soportadas

### URLs Locales
```javascript
fallbacks: [
  "data/mi-archivo.csv",
  "./data/otro-archivo.csv",
  "/ruta/absoluta/archivo.csv"
]
```

### URLs Externas
```javascript
fallbacks: [
  "https://raw.githubusercontent.com/user/repo/main/data.csv",
  "https://mi-servidor.com/api/diagrams/data.csv",
  "https://cdn.jsdelivr.net/gh/user/repo@main/data.csv"
]
```

### URLs Relativas
```javascript
fallbacks: [
  "../data/archivo.csv",
  "../../backups/diagrama.csv"
]
```

## Mejores Prácticas

### 1. Orden de Prioridad
```javascript
fallbacks: [
  "data/local-backup.csv",        // Más rápido, más confiable
  "https://raw.githubusercontent.com/...", // Público, estable
  "https://mi-servidor.com/..."   // Control total
]
```

### 2. Nombres Descriptivos
```javascript
{
  name: "Organigrama Empresa",
  url: "https://docs.google.com/spreadsheets/d/...",
  fallbacks: [
    "data/organigrama-empresa-backup.csv",
    "data/organigrama-empresa-snapshot-2024.csv"
  ]
}
```

### 3. Archivos de Respaldo
- Mantén copias locales de tus diagramas importantes
- Usa nombres descriptivos para los archivos de respaldo
- Actualiza los fallbacks cuando cambies la estructura de datos

### 4. URLs Públicas
- GitHub Raw es una excelente opción para fallbacks públicos
- Asegúrate de que las URLs externas sean estables
- Considera usar CDNs para mejor rendimiento

## Configuración Completa de Ejemplo

```javascript
window.swDiagrams.diagrams = [
  {
    name: "Organigrama",
    url: "https://docs.google.com/spreadsheets/d/.../pub?output=csv",
    fallbacks: [
      "data/organigrama-backup.csv",
      "https://raw.githubusercontent.com/company/diagrams/main/org-chart.csv"
    ]
  },
  {
    name: "Flujo de Procesos",
    url: "https://docs.google.com/spreadsheets/d/.../pub?output=csv",
    fallbacks: [
      "data/process-flow-backup.csv"
    ]
  },
  {
    name: "Arquitectura Sistema",
    url: "data/architecture.csv"  // Local, no necesita fallbacks
  },
  {
    name: "Diagrama Temporal",
    url: "https://docs.google.com/spreadsheets/d/.../pub?output=csv",
    fallbacks: [
      "data/temporal-backup.csv",
      "https://raw.githubusercontent.com/company/diagrams/main/temporal.csv",
      "https://cdn.jsdelivr.net/gh/company/diagrams@main/temporal.csv"
    ]
  }
];
```

## Ventajas

1. **Flexibilidad**: Cada diagrama puede tener sus propios fallbacks
2. **Mantenibilidad**: Todo está en un solo lugar (HTML)
3. **Escalabilidad**: Fácil agregar/quitar fallbacks
4. **Robustez**: Múltiples niveles de respaldo
5. **Simplicidad**: No requiere archivos de configuración adicionales

## Compatibilidad

- ✅ Funciona con todos los tipos de URLs soportados
- ✅ Compatible con el sistema de caché existente
- ✅ Integrado con el manejo de errores CORS
- ✅ Mantiene la funcionalidad de reintentos automáticos 