# 📊 Sistema de Columnas Personalizadas

## 🎯 **Descripción General**

El sistema de diagramas SVG permite personalizar los nombres de las columnas en tus archivos CSV para adaptarse a diferentes estructuras de datos. El sistema es **completamente flexible** y **hacia atrás compatible**, manteniendo los nombres por defecto como fallbacks.

## 🔄 **Cómo Funciona el Sistema**

### **1. Nombres por Defecto (Automáticos)**
Si no especificas `data-columns`, el sistema usa estos nombres por defecto:

```javascript
{
  id: ['node', 'Node', 'NODE', 'id', 'Id', 'ID'],
  name: ['name', 'Name', 'NAME', 'title', 'Title', 'TITLE'],
  subtitle: ['subtitle', 'Subtitle', 'SUBTITLE', 'description', 'Description', 'DESCRIPTION', 'desc', 'Desc', 'DESC'],
  img: ['thumbnail', 'Thumbnail', 'THUMBNAIL', 'img', 'Img', 'IMG', 'type', 'Type', 'TYPE', 'icon', 'Icon', 'ICON'],
  parent: ['parent', 'Parent', 'PARENT'],
  url: ['url', 'Url', 'URL', 'link', 'Link', 'LINK'],
  type: ['type', 'Type', 'TYPE']
}
```

### **2. Nombres Personalizados**
Si usas `data-columns`, el sistema **agrega** tus nombres personalizados **al inicio** de la lista, manteniendo los nombres por defecto como fallbacks:

```javascript
// Con data-columns='{"id": "MiID", "name": "MiNombre"}'
{
  id: ['MiID', 'node', 'Node', 'NODE', 'id', 'Id', 'ID'],        // Tu nombre primero
  name: ['MiNombre', 'name', 'Name', 'NAME', 'title', 'Title', 'TITLE'], // Tu nombre primero
  subtitle: ['subtitle', 'Subtitle', 'SUBTITLE', 'description', 'Description', 'DESCRIPTION', 'desc', 'Desc', 'DESC'],
  // ... etc
}
```

## 📋 **Ejemplos Prácticos**

### **Ejemplo 1: CSV con Nombres por Defecto**

**CSV (`company-structure.csv`):**
```csv
Node,Name,Description,Parent
1,CEO,Chief Executive Officer,
2,CTO,Chief Technology Officer,1
3,CFO,Chief Financial Officer,1
4,Lead Developer,Senior Software Engineer,2
5,Junior Developer,Software Engineer,2
```

**HTML (sin personalización):**
```html
<div class="sw-diagram-container" 
     data-csv="src/data/company-structure.csv">
</div>
```

**Resultado:** ✅ Funciona perfectamente con los nombres por defecto.

---

### **Ejemplo 2: CSV con Nombres Personalizados**

**CSV (`mi-empresa.csv`):**
```csv
MiID,MiNombre,MiDescripcion,MiPadre
1,CEO,Chief Executive Officer,
2,CTO,Chief Technology Officer,1
3,CFO,Chief Financial Officer,1
4,Lead Developer,Senior Software Engineer,2
5,Junior Developer,Software Engineer,2
```

**HTML (con personalización completa):**
```html
<div class="sw-diagram-container" 
     data-csv="src/data/mi-empresa.csv"
     data-columns='{
       "id": "MiID",
       "name": "MiNombre", 
       "subtitle": "MiDescripcion",
       "parent": "MiPadre"
     }'>
</div>
```

**Resultado:** ✅ El sistema busca primero "MiID", "MiNombre", etc., y si no los encuentra, usa los fallbacks.

---

### **Ejemplo 3: CSV Mixto (Algunos Personalizados, Otros por Defecto)**

**CSV (`empresa-mixta.csv`):**
```csv
Node,Name,Description,Parent
1,CEO,Chief Executive Officer,
2,CTO,Chief Technology Officer,1
3,CFO,Chief Financial Officer,1
4,Lead Developer,Senior Software Engineer,2
5,Junior Developer,Software Engineer,2
```

**HTML (solo personalizar algunos campos):**
```html
<div class="sw-diagram-container" 
     data-csv="src/data/empresa-mixta.csv"
     data-columns='{
       "subtitle": "Description"  <!-- Solo personalizar subtitle -->
     }'>
</div>
```

**Resultado:** ✅ El sistema usa "Description" para subtitle, y los nombres por defecto para los demás campos.

---

### **Ejemplo 4: CSV con Diferentes Casos**

**CSV (`empresa-variada.csv`):**
```csv
ID,NOMBRE,desc,padre
1,CEO,Chief Executive Officer,
2,CTO,Chief Technology Officer,1
3,CFO,Chief Financial Officer,1
4,Lead Developer,Senior Software Engineer,2
5,Junior Developer,Software Engineer,2
```

**HTML (sin personalización):**
```html
<div class="sw-diagram-container" 
     data-csv="src/data/empresa-variada.csv">
</div>
```

**Resultado:** ✅ Funciona porque el sistema es case-insensitive y tiene múltiples fallbacks.

## 🎨 **Campos Disponibles para Personalizar**

| Campo | Descripción | Nombres por Defecto |
|-------|-------------|-------------------|
| `id` | Identificador único del nodo | `node`, `Node`, `NODE`, `id`, `Id`, `ID` |
| `name` | Nombre/título del nodo | `name`, `Name`, `NAME`, `title`, `Title`, `TITLE` |
| `subtitle` | Descripción/subtítulo | `subtitle`, `Subtitle`, `SUBTITLE`, `description`, `Description`, `DESCRIPTION`, `desc`, `Desc`, `DESC` |
| `img` | Imagen/icono del nodo | `thumbnail`, `Thumbnail`, `THUMBNAIL`, `img`, `Img`, `IMG`, `type`, `Type`, `TYPE`, `icon`, `Icon`, `ICON` |
| `parent` | ID del nodo padre | `parent`, `Parent`, `PARENT` |
| `url` | Enlace del nodo | `url`, `Url`, `URL`, `link`, `Link`, `LINK` |
| `type` | Tipo de nodo | `type`, `Type`, `TYPE` |

## ⚙️ **Sintaxis de Configuración**

### **Formato JSON (Recomendado)**
```html
<div class="sw-diagram-container" 
     data-columns='{
       "id": "MiID",
       "name": "MiNombre",
       "subtitle": "MiDescripcion",
       "parent": "MiPadre",
       "img": "MiImagen",
       "url": "MiEnlace",
       "type": "MiTipo"
     }'>
</div>
```

### **Formato Individual (Legacy)**
```html
<div class="sw-diagram-container" 
     data-column-id="MiID"
     data-column-name="MiNombre"
     data-column-subtitle="MiDescripcion"
     data-column-parent="MiPadre"
     data-column-img="MiImagen"
     data-column-url="MiEnlace"
     data-column-type="MiTipo">
</div>
```

## ✅ **Ventajas del Sistema**

1. **🔄 Hacia Atrás Compatible**: CSV antiguos siguen funcionando sin cambios
2. **🎯 Flexible**: Puedes personalizar solo las columnas que necesites
3. **🛡️ Robusto**: Múltiples fallbacks para cada campo
4. **📝 Case-Insensitive**: No importa si usas mayúsculas o minúsculas
5. **⚡ Eficiente**: Búsqueda optimizada con prioridad a nombres personalizados

## 🚀 **Mejores Prácticas**

### **1. Usar Nombres Descriptivos**
```json
// ✅ Bueno
{
  "id": "employee_id",
  "name": "employee_name",
  "subtitle": "job_title"
}

// ❌ Evitar
{
  "id": "a",
  "name": "b",
  "subtitle": "c"
}
```

### **2. Mantener Consistencia**
```json
// ✅ Consistente
{
  "id": "user_id",
  "name": "user_name",
  "subtitle": "user_role"
}

// ❌ Inconsistente
{
  "id": "user_id",
  "name": "nombre",
  "subtitle": "role"
}
```

### **3. Documentar tu Estructura**
```html
<!-- Comentario explicativo -->
<div class="sw-diagram-container" 
     data-csv="src/data/usuarios.csv"
     data-columns='{
       "id": "user_id",        <!-- ID único del usuario -->
       "name": "user_name",    <!-- Nombre completo -->
       "subtitle": "user_role", <!-- Cargo o rol -->
       "parent": "manager_id"  <!-- ID del jefe directo -->
     }'>
</div>
```

## 🔍 **Depuración**

### **Verificar Configuración**
Abre la consola del navegador y ejecuta:
```javascript
// Ver la configuración actual de columnas
const container = document.querySelector('.sw-diagram-container');
const config = getColumnConfiguration();
console.log('Configuración de columnas:', config);
```

### **Errores Comunes**
1. **JSON mal formado**: Asegúrate de que el JSON en `data-columns` sea válido
2. **Nombres inexistentes**: Verifica que los nombres de columnas existan en tu CSV
3. **Comillas incorrectas**: Usa comillas dobles en el JSON

## 📚 **Ejemplos Completos**

### **Organigrama de Empresa**
```html
<div class="sw-diagram-container" 
     data-csv="src/data/org-chart.csv"
     data-columns='{
       "id": "employee_id",
       "name": "full_name",
       "subtitle": "position",
       "parent": "reports_to",
       "img": "avatar_url"
     }'>
</div>
```

### **Sitemap de Sitio Web**
```html
<div class="sw-diagram-container" 
     data-csv="src/data/sitemap.csv"
     data-columns='{
       "id": "page_id",
       "name": "page_title",
       "subtitle": "page_description",
       "parent": "parent_page",
       "url": "page_url"
     }'>
</div>
```

### **Árbol de Categorías**
```html
<div class="sw-diagram-container" 
     data-csv="src/data/categories.csv"
     data-columns='{
       "id": "category_id",
       "name": "category_name",
       "subtitle": "category_description",
       "parent": "parent_category",
       "type": "category_type"
     }'>
</div>
```

---

## 🎯 **Conclusión**

El sistema de columnas personalizadas te permite adaptar cualquier estructura de datos a los diagramas SVG sin necesidad de modificar tus archivos CSV. Es flexible, robusto y mantiene la compatibilidad hacia atrás.

**¿Necesitas personalizar columnas?** Solo agrega `data-columns` con los nombres que necesites.
**¿Tu CSV usa nombres por defecto?** No necesitas hacer nada, funcionará automáticamente. 