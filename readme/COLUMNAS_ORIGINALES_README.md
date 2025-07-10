# 📊 Nombres Originales de Columnas en Side Panel

## 🎯 **Descripción**

Se ha implementado una mejora importante en el sistema de diagramas SVG que permite que el **panel lateral (side panel)** muestre los **nombres originales de las columnas del CSV**, en lugar de los nombres procesados internamente.

## 🔄 **Problema Resuelto**

### **Antes de la Mejora**
- El side panel mostraba nombres de propiedades internas (`id`, `name`, `subtitle`, etc.)
- No se preservaban los nombres originales de las columnas del CSV
- Cada diagrama mostraba los mismos nombres de columnas, independientemente del archivo CSV

### **Después de la Mejora**
- El side panel muestra los **nombres exactos de las columnas del CSV**
- Se preservan todos los datos originales del archivo
- Cada diagrama muestra los nombres específicos de sus columnas

## 🛠️ **Implementación Técnica**

### **1. Preservación de Datos Originales**

Se modificó la función `buildHierarchies()` para preservar los datos originales del CSV:

```javascript
let node = { 
  id, 
  name, 
  subtitle, 
  img, 
  url, 
  type, 
  children: [], 
  parent: parent,
  originalData: d // ✅ Preserve original CSV data
};
```

### **2. Uso de Datos Originales en Side Panel**

Se modificó la función `generateSidePanelContent()` para usar los datos originales:

```javascript
// Use original CSV data if available, otherwise fall back to processed data
const dataToShow = nodeData.originalData || nodeData;

// Show all available fields from the original CSV data
Object.keys(dataToShow).forEach(key => {
  // Skip internal properties
  if (key === 'children' || key === 'parent' || key === 'originalData') return;
  
  const value = dataToShow[key] || '';
  const label = key; // ✅ Use the original column name from CSV
  // ...
});
```

## 📋 **Ejemplos Prácticos**

### **Ejemplo 1: CSV con Nombres Personalizados**

**CSV (`mi-empresa.csv`):**
```csv
MiID,MiNombre,MiDescripcion,MiImagen,MiPadre,MiEnlace,MiTipo,Departamento,Salario
1,CEO,Chief Executive Officer,detail,,https://example.com/ceo,ejecutivo,Directiva,150000
2,CTO,Chief Technology Officer,detail,1,https://example.com/cto,ejecutivo,Tecnologia,120000
```

**HTML:**
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

**Resultado en Side Panel:**
```
MiID: 1
MiNombre: CEO
MiDescripcion: Chief Executive Officer
MiImagen: detail
MiPadre: -
MiEnlace: Visit
MiTipo: ejecutivo
Departamento: Directiva
Salario: 150000
```

### **Ejemplo 2: CSV con Nombres por Defecto**

**CSV (`organigrama.csv`):**
```csv
Node,Name,Description,Thumbnail,Parent,url,Type,Department,Salary
1,CEO,Chief Executive Officer,detail,,https://example.com/ceo,executive,Executive,150000
2,CTO,Chief Technology Officer,detail,1,https://example.com/cto,executive,Technology,120000
```

**HTML (sin personalización):**
```html
<div class="sw-diagram-container">
</div>
```

**Resultado en Side Panel:**
```
Node: 1
Name: CEO
Description: Chief Executive Officer
Thumbnail: detail
Parent: -
url: Visit
Type: executive
Department: Executive
Salary: 150000
```

## ✅ **Ventajas de la Mejora**

### **1. Flexibilidad Total**
- ✅ Cada diagrama muestra sus propios nombres de columnas
- ✅ No hay limitaciones en los nombres de columnas
- ✅ Soporte para cualquier estructura de datos

### **2. Claridad para el Usuario**
- ✅ Los usuarios ven exactamente los nombres de sus columnas
- ✅ No hay confusión con nombres internos del sistema
- ✅ Mejor comprensión de los datos

### **3. Compatibilidad**
- ✅ Funciona con cualquier CSV existente
- ✅ No requiere cambios en archivos CSV actuales
- ✅ Mantiene toda la funcionalidad anterior

## 🔧 **Configuración**

### **Sin Configuración Especial**
Si tu CSV usa nombres por defecto, no necesitas hacer nada:

```html
<div class="sw-diagram-container">
</div>
```

### **Con Nombres Personalizados**
Si tu CSV usa nombres personalizados, configura el mapeo:

```html
<div class="sw-diagram-container" 
     data-columns='{
       "id": "MiID",
       "name": "MiNombre", 
       "subtitle": "MiDescripcion"
     }'>
</div>
```

## 🧪 **Pruebas**

### **Archivo de Prueba**
Se creó `src/test-original-columns.html` para verificar la funcionalidad:

1. Abre `http://localhost:8000/src/test-original-columns.html`
2. Haz clic en cualquier nodo
3. Verifica que el side panel muestra los nombres originales del CSV

### **CSV de Prueba**
El archivo `src/data/test-custom-columns.csv` contiene:
- Nombres de columnas personalizados
- Datos adicionales (Departamento, Salario, FechaContratacion)
- URLs para probar enlaces

## 🎯 **Casos de Uso**

### **1. Organigramas de Empresa**
```csv
EmployeeID,FullName,Position,ManagerID,Department,StartDate,Salary
1,John Doe,CEO,,Executive,2020-01-15,150000
2,Jane Smith,CTO,1,Technology,2020-02-01,120000
```

### **2. Sitemaps de Sitio Web**
```csv
PageID,PageTitle,PageDescription,ParentPage,URL,Category,LastUpdated
1,Home,Welcome to our site,,/home,main,2024-01-15
2,About,About our company,1,/about,main,2024-01-20
```

### **3. Árboles de Categorías**
```csv
CategoryID,CategoryName,CategoryDescription,ParentCategory,Icon,SortOrder,IsActive
1,Electronics,Electronic devices,,electronics,1,true
2,Computers,Computer equipment,1,computer,1,true
```

## 🔍 **Depuración**

### **Verificar Datos Originales**
Abre la consola del navegador y ejecuta:

```javascript
// Ver los datos originales de un nodo
const node = window.swDiagrams.currentData[0];
console.log('Datos originales:', node.originalData);
console.log('Nombres de columnas:', Object.keys(node.originalData));
```

### **Verificar Configuración de Columnas**
```javascript
// Ver la configuración actual de columnas
const config = getColumnConfiguration();
console.log('Configuración de columnas:', config);
```

## 📚 **Archivos Modificados**

| Archivo | Cambio | Descripción |
|---------|--------|-------------|
| `src/sw-diagrams.js` | `buildHierarchies()` | Preservar datos originales del CSV |
| `src/sw-diagrams.js` | `generateSidePanelContent()` | Usar datos originales para labels |
| `src/test-original-columns.html` | Nuevo | Archivo de prueba |
| `src/data/test-custom-columns.csv` | Nuevo | CSV de prueba |

## 🎉 **Conclusión**

Esta mejora hace que el sistema sea **mucho más flexible y claro** para los usuarios. Ahora cada diagrama puede tener sus propios nombres de columnas y el side panel los mostrará exactamente como están en el archivo CSV original.

**¿Necesitas personalizar nombres de columnas?** Solo agrega `data-columns` con el mapeo que necesites.
**¿Tu CSV usa nombres por defecto?** No necesitas hacer nada, funcionará automáticamente. 