# 📊 Configuración de SheetBest en XDiagrams

## 📋 Resumen

XDiagrams soporta URLs de SheetBest tanto públicas como protegidas. Puedes indicar si tu URL es privada usando el parámetro `privateApi`.

## ⚙️ Configuración

### URLs Públicas (Sin API Key)

```javascript
window.$xDiagrams = {
  url: "https://api.sheetbest.com/sheets/28f15681-b2ab-47a0-bbcb-205d142d9ef7",
  title: "Mi Diagrama Público",
  privateApi: false  // URL pública - no requiere API Key
};
```

### URLs Protegidas (Con API Key)

```javascript
window.$xDiagrams = {
  url: "https://api.sheetbest.com/sheets/tu-sheet-id-protegido",
  title: "Mi Diagrama Protegido",
  privateApi: true  // URL protegida - requiere API Key
};
```

## 🔧 Parámetros

### `privateApi` (Boolean)

- **`false`** (por defecto): La URL es pública y se carga directamente
- **`true`**: La URL es protegida y requiere API Key (usa proxy de Netlify Function)

## 🎯 Casos de Uso

### ✅ URL Pública (Recomendado para desarrollo)

```javascript
window.$xDiagrams = {
  url: "https://api.sheetbest.com/sheets/28f15681-b2ab-47a0-bbcb-205d142d9ef7",
  title: "Diagrama de Desarrollo",
  privateApi: false,  // Carga directa
  clustersPerRow: "4 3 2",
  showThemeToggle: true
};
```

### 🔐 URL Protegida (Recomendado para producción)

```javascript
window.$xDiagrams = {
  url: "https://api.sheetbest.com/sheets/tu-sheet-id-protegido",
  title: "Diagrama de Producción",
  privateApi: true,  // Usa proxy con API Key
  clustersPerRow: "4 3 2",
  showThemeToggle: true
};
```

## 🚀 Configuración de API Key

### Para URLs Protegidas

1. **Configurar API Key** en tu servidor Netlify Function
2. **Establecer `privateApi: true`** en la configuración
3. **La librería usará automáticamente** el proxy de Netlify Function

### Para URLs Públicas

1. **No se requiere configuración** adicional
2. **Establecer `privateApi: false`** (o omitir el parámetro)
3. **La librería carga directamente** desde SheetBest

## 📊 Ejemplos Completos

### Ejemplo 1: Desarrollo Local

```javascript
window.$xDiagrams = {
  url: "https://api.sheetbest.com/sheets/28f15681-b2ab-47a0-bbcb-205d142d9ef7",
  title: "Desarrollo Local",
  privateApi: false,  // URL pública
  clustersPerRow: "4 3 2",
  showThemeToggle: true,
  spacing: 80,
  verticalSpacing: 170,
  nodeWidth: 100,
  nodeHeight: 125
};
```

### Ejemplo 2: Producción con API Key

```javascript
window.$xDiagrams = {
  url: "https://api.sheetbest.com/sheets/tu-sheet-id-protegido",
  title: "Producción",
  privateApi: true,  // URL protegida
  clustersPerRow: "4 3 2",
  showThemeToggle: true,
  spacing: 80,
  verticalSpacing: 170,
  nodeWidth: 100,
  nodeHeight: 125
};
```

## ⚠️ Consideraciones

### Performance

- **URLs públicas**: Carga más rápida (directa)
- **URLs protegidas**: Carga más lenta (proxy)

### Seguridad

- **URLs públicas**: Datos visibles públicamente
- **URLs protegidas**: Datos protegidos con API Key

### Configuración

- **URLs públicas**: No requiere configuración adicional
- **URLs protegidas**: Requiere configuración de Netlify Function

## 🔍 Verificar Configuración

```javascript
// En la consola del navegador
console.log('Configuración:', window.$xDiagrams);
console.log('API Privada:', window.$xDiagrams?.privateApi);
```

## 🚀 Migración

### De URLs Públicas a Protegidas

```javascript
// Antes (público)
window.$xDiagrams = {
  url: "https://api.sheetbest.com/sheets/tu-sheet-id",
  title: "Mi Diagrama"
  // privateApi: false (implícito)
};

// Después (protegido)
window.$xDiagrams = {
  url: "https://api.sheetbest.com/sheets/tu-sheet-id",
  title: "Mi Diagrama",
  privateApi: true  // Agregar esta línea
};
```

### De URLs Protegidas a Públicas

```javascript
// Antes (protegido)
window.$xDiagrams = {
  url: "https://api.sheetbest.com/sheets/tu-sheet-id",
  title: "Mi Diagrama",
  privateApi: true
};

// Después (público)
window.$xDiagrams = {
  url: "https://api.sheetbest.com/sheets/tu-sheet-id",
  title: "Mi Diagrama"
  // Remover privateApi o establecer en false
};
```
