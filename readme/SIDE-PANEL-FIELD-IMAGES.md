# Imágenes en Campos del Sidebar - Nueva Funcionalidad

## 🎯 Descripción

Esta funcionalidad permite mostrar imágenes de personas junto al texto en los campos del sidebar (side panel) para las columnas configuradas en `autoImageColumns`.

## 🚀 Cómo funciona

### 1. Configuración automática

Cuando configuras `autoImageColumns` en tu diagrama, el sistema automáticamente:

1. **Detecta las columnas configuradas** en el sidebar
2. **Genera imágenes** para cada valor en esas columnas
3. **Muestra las imágenes** junto al texto en el sidebar

### 2. Ejemplo de configuración

```javascript
{
  name: "Mi Proyecto",
  url: "data/mi-proyecto.csv",
  options: {
    thumbnailMode: "custom",
    autoImages: true,
    autoImageColumns: ["Developer", "Designer", "Writer"]
  }
}
```

### 3. Resultado en el sidebar

En lugar de mostrar solo:
```
Developer: Bob Martinez
Designer: Alice Thompson
Writer: Carla Wilson
```

Ahora muestra:
```
Developer: [🖼️] Bob Martinez
Designer: [🖼️] Alice Thompson
Writer: [🖼️] Carla Wilson
```

## 🔧 Implementación Técnica

### Modificaciones realizadas:

#### 1. Función `generateSidePanelContent`
- **Detección de columnas**: Verifica si cada campo está en `autoImageColumns`
- **Generación de imágenes**: Crea HTML de imágenes para columnas configuradas
- **Integración**: Combina imágenes con texto en el mismo campo

#### 2. Estilos CSS
- **`.side-panel-value`**: Cambiado a `display: flex` para alinear imágenes y texto
- **`.side-panel-field-image`**: Nuevos estilos para imágenes en campos
- **Responsive**: Las imágenes se adaptan al tamaño del campo

### Código de ejemplo:

```javascript
// Verificar si es una columna de auto-imagen
const isAutoImageColumn = autoImageColumns && autoImageColumns.includes(key);

// Generar HTML de imagen si es necesario
let imageHtml = '';
if (isAutoImageColumn && value && value.trim() !== '') {
  const imageUrl = `img/photos/${normalizedName}.jpeg`;
  imageHtml = `<img src="${imageUrl}" class="side-panel-field-image" width="24" height="24" style="border-radius: 50%; object-fit: cover; margin-right: 8px;" onerror="this.style.display='none'">`;
}

// Combinar imagen y texto
html += `
  <div class="side-panel-field">
    <div class="side-panel-label">${label}</div>
    <div class="side-panel-value">
      ${imageHtml}
      ${displayValue}
    </div>
  </div>
`;
```

## 🎨 Estilos CSS

### Estilos aplicados:

```css
.side-panel-value {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.side-panel-field-image {
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid var(--ui-panel-border);
  vertical-align: middle;
  margin-right: 8px;
  flex-shrink: 0;
  width: 24px;
  height: 24px;
}
```

### Características visuales:

- **Máscara redonda**: Las imágenes tienen forma circular
- **Tamaño fijo**: 24x24 píxeles para consistencia
- **Borde sutil**: Borde del color del tema
- **Alineación**: Centradas verticalmente con el texto
- **Espaciado**: 8px de margen derecho para separación

## 📝 Casos de uso

### 1. Equipo de desarrollo
```csv
ID,Name,Parent,Position,Type,Developer,Designer,Writer
1,Proyecto Web,,Proyecto,Project,Alice Thompson,Bob Martinez,Carla Wilson
```

**Resultado en sidebar:**
- Developer: [🖼️] Alice Thompson
- Designer: [🖼️] Bob Martinez  
- Writer: [🖼️] Carla Wilson

### 2. Organización con múltiples roles
```csv
ID,Name,Parent,Position,Type,CEO,CTO,CFO,HR_Manager
1,Empresa,,Empresa,Company,Alice Thompson,Bob Martinez,Carla Wilson,David White
```

**Resultado en sidebar:**
- CEO: [🖼️] Alice Thompson
- CTO: [🖼️] Bob Martinez
- CFO: [🖼️] Carla Wilson
- HR Manager: [🖼️] David White

## 🧪 Archivos de prueba

### Nuevos archivos creados:
- `src/data/test-side-panel-columns.csv` - Datos de prueba
- `src/test-side-panel-images.html` - Archivo HTML de prueba específico

### Cómo probar:

1. **Abrir archivo de prueba**:
   ```
   src/test-side-panel-images.html
   ```

2. **Verificar en consola**:
   - Buscar logs de `onNodeClick`
   - Verificar que `originalData` contiene las columnas configuradas

3. **Probar el sidebar**:
   - Hacer clic en cualquier nodo
   - Verificar que las imágenes aparecen junto al texto
   - Confirmar que las imágenes tienen máscara redonda

## ⚠️ Consideraciones

### Compatibilidad:
- ✅ Compatible con funcionalidad existente
- ✅ No afecta campos que no están en `autoImageColumns`
- ✅ Mantiene la funcionalidad de URLs y tooltips

### Rendimiento:
- ✅ Generación eficiente de HTML
- ✅ Fallback automático si la imagen no existe
- ✅ No bloquea la carga del sidebar

### Accesibilidad:
- ✅ Las imágenes tienen `onerror` para fallback
- ✅ El texto sigue siendo legible sin imágenes
- ✅ Mantiene la estructura semántica

## 🔍 Debugging

### Logs útiles:
```javascript
// En la consola del navegador
console.log('Node data:', node);
console.log('Original data:', node.originalData);
console.log('Auto image columns:', autoImageColumns);
```

### Verificar configuración:
1. Confirmar que `autoImageColumns` está configurado
2. Verificar que las columnas existen en el CSV
3. Comprobar que las imágenes están en `src/img/photos/`

### Problemas comunes:
- **Imágenes no aparecen**: Verificar que las fotos están en la carpeta correcta
- **Nombres no coinciden**: Verificar la normalización de nombres
- **Estilos no aplicados**: Verificar que el CSS está cargado

## 🚀 Beneficios

### Para el usuario:
- **Identificación visual**: Fácil reconocimiento de personas
- **Mejor UX**: Sidebar más atractivo y profesional
- **Consistencia**: Mismo estilo que las imágenes principales

### Para el desarrollador:
- **Automatización**: No requiere configuración adicional
- **Escalabilidad**: Funciona con cualquier número de columnas
- **Mantenimiento**: Usa el mismo sistema de imágenes existente 