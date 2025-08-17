# Configuración de API Keys para XDiagrams

Este documento explica cómo configurar y usar APIs protegidas con XDiagrams, especialmente para servicios como SheetBest.

## 🚀 Características

- ✅ Soporte para SheetBest con header `X-Api-Key`
- ✅ Configuración segura con variables de entorno
- ✅ Detección automática de APIs protegidas
- ✅ Manejo de errores específicos de autenticación
- ✅ Soporte para múltiples servicios de API

## 📋 Servicios Soportados

### SheetBest
- **URLs detectadas**: `sheet.best`, `sheetbest.com`
- **Método de autenticación**: Header `X-Api-Key`
- **Documentación**: [SheetBest Authentication](https://docs.sheetbest.com/#authentication-protect-your-api-with-keys)

### Otras APIs
- **Método por defecto**: Header `Authorization: Bearer {api_key}`
- **Configuración personalizable** por dominio

## 🔧 Configuración

### Opción 1: Variables de Entorno (Recomendado)

#### Desarrollo Local
Crea un archivo `.env` en la raíz del proyecto:

```bash
# .env
SHEETBEST_API_KEY=tu_api_key_real_aqui
EXAMPLE_API_KEY=tu_otra_api_key_aqui
```

#### Producción
Configura las variables de entorno en tu servidor:

```bash
# En tu servidor o plataforma de hosting
SHEETBEST_API_KEY=tu_api_key_real_aqui
EXAMPLE_API_KEY=tu_otra_api_key_aqui
```

### Opción 2: Configuración en JavaScript

Antes de cargar XDiagrams, configura las API Keys:

```javascript
// Configurar antes de cargar XDiagrams
window.__XDIAGRAMS_CONFIG__ = {
  API_KEYS: {
    // SheetBest
    'sheet.best': 'tu_sheetbest_api_key_aqui',
    'sheetbest.com': 'tu_sheetbest_api_key_aqui',
    
    // Otras APIs
    'api.example.com': 'tu_otra_api_key_aqui',
    
    // Configuración por URL específica
    'https://sheet.best/api/sheets/tu-sheet-id': 'api_key_especifica_aqui'
  }
};
```

## 📖 Uso

### Cargar datos desde SheetBest

```javascript
// URL de SheetBest (será detectada automáticamente como API protegida)
const sheetBestUrl = 'https://sheet.best/api/sheets/tu-sheet-id';

// Cargar datos (la autenticación se aplica automáticamente)
xdiagrams.loadData(sheetBestUrl, (data, error) => {
  if (error) {
    console.error('Error:', error.message);
    return;
  }
  console.log('Datos cargados:', data);
});
```

### Verificar configuración

```javascript
// Verificar si una URL requiere autenticación
const requiresAuth = xdiagrams.dataLoaderInstance.sourceDetector.requiresAuthentication(url);

// Obtener información de autenticación
const authInfo = xdiagrams.dataLoaderInstance.sourceDetector.getAuthInfo(url);
console.log('Info de autenticación:', authInfo);
```

## 🛡️ Seguridad

### Archivos Protegidos
Los siguientes archivos están en `.gitignore` y no se subirán al repositorio:

- `.env`
- `src/js/modules/loader/config/api-keys.js`
- `src/js/modules/loader/config/api-keys.local.js`
- `src/js/modules/loader/config/api-keys.production.js`

### Buenas Prácticas

1. **Nunca subas API Keys al repositorio**
2. **Usa variables de entorno en producción**
3. **Rota las API Keys regularmente**
4. **Usa API Keys con permisos mínimos necesarios**

## 🔍 Debugging

### Verificar configuración

```javascript
// Verificar si hay API Keys configuradas
const hasKeys = xdiagrams.dataLoaderInstance.authManager.hasConfiguredKeys();
console.log('API Keys configuradas:', hasKeys);

// Ver patrones configurados (sin mostrar las keys)
const patterns = xdiagrams.dataLoaderInstance.authManager.getConfiguredPatterns();
console.log('Patrones configurados:', patterns);
```

### Información de autenticación

```javascript
// Obtener información detallada de autenticación
const authInfo = xdiagrams.dataLoaderInstance.authManager.getAuthInfo(url);
console.log('Info de autenticación:', authInfo);
```

## ❌ Manejo de Errores

### Errores Comunes

#### API Key no configurada
```
Error: Esta API requiere autenticación. Configura una API Key para continuar.
```

#### API Key inválida
```
Error de autenticación: API Key inválida o expirada. Verifica tu configuración.
```

#### Acceso denegado
```
Error de autenticación: Acceso denegado. Verifica que tu API Key tenga los permisos necesarios.
```

### Solución de Problemas

1. **Verifica que la API Key esté configurada correctamente**
2. **Asegúrate de que la URL sea correcta**
3. **Verifica los permisos de la API Key**
4. **Revisa la documentación de la API específica**

## 🔧 Configuración Avanzada

### Agregar método de autenticación personalizado

```javascript
// Agregar método personalizado para una API específica
xdiagrams.dataLoaderInstance.authManager.addAuthMethod('api.miservicio.com', (apiKey) => {
  return {
    'X-Custom-Header': apiKey,
    'Content-Type': 'application/json'
  };
});
```

### Agregar API Key temporalmente

```javascript
// Agregar API Key temporal (no persiste)
xdiagrams.dataLoaderInstance.authManager.addTemporaryApiKey('api.ejemplo.com', 'mi_api_key');
```

## 📚 Ejemplos

### Ejemplo completo con SheetBest

```html
<!DOCTYPE html>
<html>
<head>
    <title>XDiagrams con SheetBest</title>
    <script>
        // Configurar API Key antes de cargar XDiagrams
        window.__XDIAGRAMS_CONFIG__ = {
            API_KEYS: {
                'sheet.best': 'tu_sheetbest_api_key_aqui'
            }
        };
    </script>
    <script src="xdiagrams.js"></script>
</head>
<body>
    <div id="diagram"></div>
    
    <script>
        const xdiagrams = new XDiagrams('#diagram');
        
        // URL de SheetBest
        const sheetBestUrl = 'https://sheet.best/api/sheets/tu-sheet-id';
        
        // Cargar datos
        xdiagrams.loadData(sheetBestUrl, (data, error) => {
            if (error) {
                console.error('Error:', error.message);
                return;
            }
            
            // Crear diagrama con los datos
            xdiagrams.createDiagram(data);
        });
    </script>
</body>
</html>
```

## 🤝 Contribuir

Si necesitas soporte para una nueva API o método de autenticación, puedes:

1. Crear un issue en el repositorio
2. Implementar el soporte siguiendo el patrón existente
3. Documentar el nuevo servicio

## 📄 Licencia

Este sistema de autenticación está bajo la misma licencia que XDiagrams.
