# Team Section Feature - Nueva Funcionalidad

## 🎯 Descripción

Esta funcionalidad crea una sección especial "Team" en el sidebar que muestra las personas responsables con un layout organizado: imagen a la izquierda, nombre y rol a la derecha.

## 🚀 Cómo funciona

### 1. Configuración automática

Cuando configuras `autoImageColumns` en tu diagrama, el sistema automáticamente:

1. **Detecta las columnas configuradas** para auto-imágenes
2. **Crea una sección "Team"** separada del resto de campos
3. **Muestra cada persona** con imagen, nombre y rol

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

En lugar de mostrar campos individuales:
```
Developer: Bob Martinez
Designer: Alice Thompson
Writer: Carla Wilson
```

Ahora muestra una sección especial:
```
┌─────────────────────────────────┐
│ Team                            │
├─────────────────────────────────┤
│ [🖼️] Bob Martinez              │
│     Developer                   │
├─────────────────────────────────┤
│ [🖼️] Alice Thompson            │
│     Designer                    │
├─────────────────────────────────┤
│ [🖼️] Carla Wilson              │
│     Writer                      │
└─────────────────────────────────┘
```

## 🔧 Implementación Técnica

### Modificaciones realizadas:

#### 1. Función `generateSidePanelContent`
- **Separación de campos**: Divide campos de auto-imágenes de campos regulares
- **Generación de sección Team**: Crea HTML específico para la sección de equipo
- **Layout organizado**: Imagen a la izquierda, información a la derecha

#### 2. Estilos CSS
- **`.side-panel-team-section`**: Contenedor principal de la sección
- **`.side-panel-team-header`**: Título "Team" con separador
- **`.side-panel-team-member`**: Layout horizontal para cada miembro
- **`.side-panel-team-avatar`**: Imagen circular de 40x40 píxeles

### Código de ejemplo:

```javascript
// Separar campos de auto-imágenes de campos regulares
if (isAutoImageColumn && value && value.trim() !== '') {
  autoImageFields.push({...});
} else {
  regularFields.push({...});
}

// Generar sección Team
if (autoImageFields.length > 0) {
  html += '<div class="side-panel-team-section">';
  html += '<div class="side-panel-team-header">Team</div>';
  html += '<div class="side-panel-team-members">';
  
  autoImageFields.forEach(field => {
    html += `
      <div class="side-panel-team-member">
        <div class="side-panel-team-member-image">
          <img src="${imageUrl}" class="side-panel-team-avatar">
        </div>
        <div class="side-panel-team-member-info">
          <div class="side-panel-team-member-name">${field.displayValue}</div>
          <div class="side-panel-team-member-role">${field.label}</div>
        </div>
      </div>
    `;
  });
  
  html += '</div></div>';
}
```

## 🎨 Estilos CSS

### Estilos aplicados:

```css
.side-panel-team-section {
  margin: 20px 0;
  padding: 15px;
  background-color: var(--ui-panel-bg);
  border: 1px solid var(--ui-panel-border);
  border-radius: 8px;
}

.side-panel-team-header {
  font-size: 16px;
  font-weight: 600;
  color: var(--ui-panel-text);
  margin-bottom: 15px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--ui-panel-border);
}

.side-panel-team-member {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border-radius: 6px;
  transition: background-color 0.2s ease;
}

.side-panel-team-avatar {
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--ui-panel-border);
  width: 40px;
  height: 40px;
}
```

### Características visuales:

- **Sección separada**: Fondo y borde distintivo
- **Título "Team"**: Con separador inferior
- **Layout horizontal**: Imagen a la izquierda, texto a la derecha
- **Imágenes circulares**: 40x40 píxeles con borde
- **Efectos hover**: Cambio de color de fondo y borde
- **Responsive**: Se adapta al ancho del sidebar

## 📝 Casos de uso

### 1. Equipo de desarrollo
```csv
ID,Name,Parent,Position,Type,Developer,Designer,Writer
1,Proyecto Web,,Proyecto,Project,Alice Thompson,Bob Martinez,Carla Wilson
```

**Resultado en sidebar:**
```
┌─────────────────────────────────┐
│ Team                            │
├─────────────────────────────────┤
│ [🖼️] Alice Thompson            │
│     Developer                   │
├─────────────────────────────────┤
│ [🖼️] Bob Martinez              │
│     Designer                    │
├─────────────────────────────────┤
│ [🖼️] Carla Wilson              │
│     Writer                      │
└─────────────────────────────────┘
```

### 2. Organización con múltiples roles
```csv
ID,Name,Parent,Position,Type,CEO,CTO,CFO,HR_Manager
1,Empresa,,Empresa,Company,Alice Thompson,Bob Martinez,Carla Wilson,David White
```

**Resultado en sidebar:**
```
┌─────────────────────────────────┐
│ Team                            │
├─────────────────────────────────┤
│ [🖼️] Alice Thompson            │
│     CEO                         │
├─────────────────────────────────┤
│ [🖼️] Bob Martinez              │
│     CTO                         │
├─────────────────────────────────┤
│ [🖼️] Carla Wilson              │
│     CFO                         │
├─────────────────────────────────┤
│ [🖼️] David White               │
│     HR Manager                  │
└─────────────────────────────────┘
```

## 🧪 Archivos de prueba

### Nuevos archivos creados:
- `src/data/test-side-panel-columns.csv` - Datos de prueba
- `src/test-team-section.html` - Archivo HTML de prueba específico

### Cómo probar:

1. **Abrir archivo de prueba**:
   ```
   src/test-team-section.html
   ```

2. **Verificar en consola**:
   - Buscar logs de `onNodeClick`
   - Verificar que `originalData` contiene las columnas configuradas

3. **Probar el sidebar**:
   - Hacer clic en cualquier nodo
   - Verificar que aparece la sección "Team"
   - Confirmar que las imágenes y roles se muestran correctamente

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
- **Sección no aparece**: Verificar que hay valores en las columnas configuradas
- **Imágenes no aparecen**: Verificar que las fotos están en la carpeta correcta
- **Estilos no aplicados**: Verificar que el CSS está cargado

## 🚀 Beneficios

### Para el usuario:
- **Organización visual**: Sección clara y separada para el equipo
- **Mejor UX**: Layout profesional y fácil de leer
- **Identificación rápida**: Fácil reconocimiento de roles y personas

### Para el desarrollador:
- **Automatización**: No requiere configuración adicional
- **Escalabilidad**: Funciona con cualquier número de columnas
- **Mantenimiento**: Usa el mismo sistema de imágenes existente

## 🎯 Próximos pasos

### Posibles mejoras futuras:
1. **Orden personalizable**: Permitir configurar el orden de los miembros
2. **Roles personalizados**: Permitir mapear nombres de columnas a roles específicos
3. **Información adicional**: Mostrar más detalles como email, teléfono, etc.
4. **Acciones**: Agregar botones para contactar o ver perfil completo 