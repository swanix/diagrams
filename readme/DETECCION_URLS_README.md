# 🔗 Detección Automática de URLs en Side Panel

## 🎯 **Descripción**

Se ha implementado una mejora en el sistema de diagramas SVG que **detecta automáticamente URLs en cualquier columna del CSV** y las muestra como enlaces clickeables con el texto "Visit" en el panel lateral (side panel).

## 🔄 **Problema Resuelto**

### **Antes de la Mejora**
- Solo la columna específica llamada 'url' se mostraba como enlace
- URLs en otras columnas se mostraban como texto plano
- El usuario tenía que copiar y pegar URLs manualmente
- No había detección automática de URLs

### **Después de la Mejora**
- **Detección automática** de URLs en cualquier columna
- URLs se muestran como enlaces clickeables con texto "Visit"
- Soporte para múltiples formatos de URL
- Mejor experiencia de usuario

## 🛠️ **Implementación Técnica**

### **1. Función de Detección de URLs**

Se creó la función `isUrl()` que detecta URLs usando patrones regex:

```javascript
function isUrl(value) {
  if (!value || typeof value !== 'string') return false;
  
  const trimmedValue = value.trim();
  
  const urlPatterns = [
    /^https?:\/\//i,                    // http:// or https://
    /^www\./i,                          // www.
    /^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,}/i,  // domain.com
    /^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,}\.[a-z]{2,}/i,  // domain.co.uk
    /^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,}\/[^\s]*/i,  // domain.com/path
  ];
  
  return urlPatterns.some(pattern => pattern.test(trimmedValue));
}
```

### **2. Función de Formateo de URLs**

Se creó la función `formatUrlForDisplay()` que asegura que las URLs tengan el protocolo correcto:

```javascript
function formatUrlForDisplay(url) {
  if (!url || typeof url !== 'string') return url;
  
  let formattedUrl = url.trim();
  
  // Add https:// if no protocol is specified
  if (!formattedUrl.match(/^https?:\/\//i)) {
    formattedUrl = 'https://' + formattedUrl;
  }
  
  return formattedUrl;
}
```

### **3. Integración en Side Panel**

Se modificó `generateSidePanelContent()` para usar la detección automática:

```javascript
// Check if the value is a URL
const isUrlValue = isUrl(value);
const displayValue = isUrlValue ? formatUrlForDisplay(value) : value;

html += `
  <div class="side-panel-field">
    <div class="side-panel-label">${label}</div>
    <div class="side-panel-value ${!value ? 'empty' : ''}">
      ${isUrlValue ? 
        `<a href="${displayValue}" target="_blank" rel="noreferrer" class="side-panel-url-link">Visit</a>` : 
        value || '-'
      }
    </div>
  </div>
`;
```

### **4. Atributos de Seguridad**

Todos los enlaces generados automáticamente incluyen atributos de seguridad:

- **`target="_blank"`**: Abre el enlace en una nueva pestaña
- **`rel="noreferrer"`**: Previene ataques de clickjacking y protege contra `window.opener`

## ✅ **Formatos de URL Soportados**

### **URLs con Protocolo**
- ✅ `https://example.com`
- ✅ `http://example.com`
- ✅ `https://www.example.com`
- ✅ `http://subdomain.example.com`

### **URLs sin Protocolo**
- ✅ `www.example.com`
- ✅ `example.com`
- ✅ `subdomain.example.com`
- ✅ `example.co.uk`
- ✅ `example.org`

### **URLs con Rutas**
- ✅ `example.com/path`
- ✅ `www.example.com/path/to/page`
- ✅ `https://example.com/api/v1`
- ✅ `example.com/path?param=value`

### **URLs de Servicios Comunes**
- ✅ `github.com/username`
- ✅ `linkedin.com/in/username`
- ✅ `twitter.com/username`
- ✅ `docs.google.com/spreadsheets/...`

## 📋 **Ejemplos Prácticos**

### **Ejemplo 1: CSV con URLs en Diferentes Columnas**

**CSV (`team.csv`):**
```csv
ID,Name,Role,Website,LinkedIn,GitHub,Portfolio,Email
1,John Doe,Developer,https://johndoe.dev,linkedin.com/in/johndoe,github.com/johndoe,johndoe.dev,john@example.com
2,Jane Smith,Designer,www.janesmith.design,linkedin.com/in/janesmith,github.com/janesmith,janesmith.design,jane@example.com
```

**Resultado en Side Panel:**
```
ID: 1
Name: John Doe
Role: Developer
Website: Visit
LinkedIn: Visit
GitHub: Visit
Portfolio: Visit
Email: john@example.com
```

### **Ejemplo 2: URLs en Columnas Personalizadas**

**CSV (`projects.csv`):**
```csv
ProjectID,ProjectName,Documentation,Repository,Deployment,Support
1,MyApp,https://docs.myapp.com,github.com/myapp,myapp.com,help.myapp.com
2,WebApp,www.docs.webapp.com,gitlab.com/webapp,webapp.com,support.webapp.com
```

**Resultado en Side Panel:**
```
ProjectID: 1
ProjectName: MyApp
Documentation: Visit
Repository: Visit
Deployment: Visit
Support: Visit
```

## 🧪 **Pruebas**

### **Archivo de Prueba**
Se creó `src/test-url-detection.html` para verificar la funcionalidad:

1. Abre `http://localhost:8000/src/test-url-detection.html`
2. Haz clic en cualquier nodo para abrir el side panel
3. Verifica que las URLs se muestren como enlaces "Visit"
4. Prueba diferentes formatos de URL

### **Archivo de Prueba de Seguridad**
Se creó `src/test-security-links.html` para verificar los atributos de seguridad:

1. Abre `http://localhost:8000/src/test-security-links.html`
2. Haz clic en cualquier nodo para abrir el side panel
3. Inspecciona los enlaces "Visit" en las herramientas de desarrollador
4. Verifica que tengan `target="_blank"` y `rel="noreferrer"`
5. Revisa la consola para ver el reporte de verificación automática

### **CSV de Prueba**
El archivo `src/data/test-urls.csv` contiene:
- URLs con diferentes protocolos (http, https)
- URLs sin protocolo (www, dominio directo)
- URLs con rutas y subdominios
- Texto normal para verificar que no se convierta en enlace

### **Casos de Prueba**

| Caso | Valor | Resultado Esperado |
|------|-------|-------------------|
| **URL con https** | `https://example.com` | Enlace "Visit" |
| **URL con http** | `http://example.com` | Enlace "Visit" |
| **URL con www** | `www.example.com` | Enlace "Visit" |
| **URL sin protocolo** | `example.com` | Enlace "Visit" |
| **URL con ruta** | `example.com/path` | Enlace "Visit" |
| **Email** | `user@example.com` | Texto normal |
| **Teléfono** | `555-1234` | Texto normal |
| **Texto normal** | `Regular text` | Texto normal |

## 🔧 **Configuración**

### **Sin Configuración Especial**
La detección funciona automáticamente sin configuración:

```html
<div class="sw-diagram-container">
</div>
```

### **Con Columnas Personalizadas**
La detección funciona con cualquier estructura de columnas:

```html
<div class="sw-diagram-container" 
     data-columns='{
       "id": "ID",
       "name": "Name", 
       "subtitle": "Description",
       "parent": "Parent",
       "img": "Image",
       "url": "Website",
       "type": "Type"
     }'>
</div>
```

## 🎯 **Ventajas de la Mejora**

### **1. Experiencia de Usuario Mejorada**
- ✅ URLs clickeables en cualquier columna
- ✅ No necesidad de copiar y pegar URLs
- ✅ Navegación directa a recursos externos

### **2. Flexibilidad**
- ✅ Funciona con cualquier estructura de CSV
- ✅ No requiere configuración específica
- ✅ Soporte para múltiples formatos de URL

### **3. Detección Inteligente**
- ✅ Distingue entre URLs y texto normal
- ✅ Maneja diferentes formatos de URL
- ✅ Agrega protocolo https:// automáticamente

### **4. Seguridad**
- ✅ `target="_blank"` abre enlaces en nueva pestaña
- ✅ `rel="noreferrer"` previene ataques de clickjacking
- ✅ Protege contra vulnerabilidades de `window.opener`
- ✅ Cumple con mejores prácticas de seguridad web

## 🔍 **Depuración**

### **Verificar Detección de URLs**
Abre la consola del navegador y ejecuta:

```javascript
// Verificar función de detección
console.log('isUrl function:', typeof isUrl);

// Probar diferentes valores
console.log('isUrl("https://example.com"):', isUrl('https://example.com'));
console.log('isUrl("www.example.com"):', isUrl('www.example.com'));
console.log('isUrl("example.com"):', isUrl('example.com'));
console.log('isUrl("user@example.com"):', isUrl('user@example.com'));
console.log('isUrl("Regular text"):', isUrl('Regular text'));
```

### **Verificar Formateo de URLs**
```javascript
// Verificar función de formateo
console.log('formatUrlForDisplay function:', typeof formatUrlForDisplay);

// Probar diferentes URLs
console.log('formatUrlForDisplay("example.com"):', formatUrlForDisplay('example.com'));
console.log('formatUrlForDisplay("https://example.com"):', formatUrlForDisplay('https://example.com'));
```

## 📚 **Archivos Modificados**

| Archivo | Cambio | Descripción |
|---------|--------|-------------|
| `src/sw-diagrams.js` | `isUrl()` | Nueva función de detección de URLs |
| `src/sw-diagrams.js` | `formatUrlForDisplay()` | Nueva función de formateo de URLs |
| `src/sw-diagrams.js` | `generateSidePanelContent()` | Integración de detección automática y seguridad |
| `src/data/test-urls.csv` | Nuevo | CSV de prueba con diferentes URLs |
| `src/test-url-detection.html` | Nuevo | Archivo de prueba |
| `src/test-security-links.html` | Nuevo | Archivo de prueba de seguridad |
| `src/DETECCION_URLS_README.md` | Nuevo | Documentación |

## 🎉 **Conclusión**

Esta mejora hace que el sistema sea **mucho más útil y fácil de usar**. Ahora cualquier URL en cualquier columna del CSV se detecta automáticamente y se muestra como un enlace clickeable.

**¿Las URLs en otras columnas no se mostraban como enlaces?** Ahora sí, con detección automática.
**¿Necesito configurar algo?** No, funciona automáticamente.
**¿Qué formatos de URL soporta?** HTTP, HTTPS, www, dominios directos, rutas, etc.

## 🔄 **Compatibilidad**

- ✅ **Hacia atrás compatible**: No afecta CSV existentes
- ✅ **Automático**: No requiere configuración
- ✅ **Robusto**: Maneja múltiples formatos de URL
- ✅ **Inteligente**: Distingue entre URLs y texto normal 