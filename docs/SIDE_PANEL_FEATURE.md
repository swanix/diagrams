# Panel Lateral - Swanix Diagrams

## Descripción

Se ha añadido una nueva funcionalidad que permite abrir un panel lateral al hacer clic en cualquier nodo del diagrama. Este panel muestra información detallada de todas las columnas disponibles en el archivo CSV.

## Características

### Funcionalidades Principales

1. **Panel Lateral Deslizable**: Se abre desde el lado derecho de la pantalla con una animación suave
2. **Información Completa**: Muestra todas las columnas del CSV con etiquetas descriptivas
3. **Tipos de Datos Especiales**:
   - **URLs**: Se muestran como enlaces clickeables
   - **Imágenes**: Se muestran como miniaturas
   - **Estados**: Con colores diferenciados (Activo/Inactivo)
   - **Prioridades**: Con colores según el nivel (Crítica, Alta, Media, Baja)
   - **Fechas**: Formateadas en español
4. **Modo Oscuro**: Soporte completo para temas oscuros
5. **Responsive**: Se adapta a diferentes tamaños de pantalla

### Interacción

- **Abrir Panel**: Haz clic en cualquier nodo del diagrama
- **Cerrar Panel**: 
  - Botón "×" en la esquina superior derecha
  - Clic fuera del panel (overlay)
  - Tecla Escape (próximamente)

### Estructura de Datos Soportada

El panel lateral reconoce automáticamente las siguientes columnas:

#### Columnas Básicas
- `id`: Identificador único del nodo
- `name`: Nombre del nodo
- `subtitle`: Subtítulo descriptivo
- `type`: Tipo de nodo
- `url`: Enlace asociado
- `img`: URL de imagen
- `parent`: ID del nodo padre

#### Columnas Extendidas
- `description`: Descripción detallada
- `status`: Estado (Activo/Inactivo)
- `priority`: Prioridad (Crítica/Alta/Media/Baja)
- `created_date`: Fecha de creación
- `owner`: Propietario del nodo
- `department`: Departamento responsable

#### Columnas Personalizadas
Cualquier columna adicional en el CSV se mostrará automáticamente en la sección "Información Adicional".

## Implementación Técnica

### Archivos Modificados

1. **`src/sw-diagrams.css`**:
   - Estilos para el panel lateral
   - Variables CSS para temas
   - Estilos para estados y prioridades
   - Soporte para modo oscuro

2. **`src/sw-diagrams.js`**:
   - Función `createSidePanel()`: Crea la estructura del panel
   - Función `openSidePanel(nodeData)`: Abre el panel con datos
   - Función `closeSidePanel()`: Cierra el panel
   - Función `generateSidePanelContent(nodeData)`: Genera el contenido
   - Eventos de clic en nodos

### Funciones Principales

```javascript
// Crear el panel lateral
createSidePanel()

// Abrir panel con datos del nodo
openSidePanel(nodeData)

// Cerrar panel
closeSidePanel()

// Generar contenido del panel
generateSidePanelContent(nodeData)
```

## Uso

### Básico
El panel se activa automáticamente al cargar el diagrama. Solo haz clic en cualquier nodo para ver la información detallada.

### Personalización
Para añadir nuevas columnas, simplemente agrégalas al archivo CSV. El panel las detectará automáticamente.

### Estilos Personalizados
Puedes personalizar los colores y estilos modificando las variables CSS en `sw-diagrams.css`:

```css
:root {
  --side-panel-width: 350px;
  --side-panel-bg: #ffffff;
  --side-panel-text: #333333;
  /* ... más variables */
}
```

## Ejemplo de Datos

```csv
id,parent,name,subtitle,type,url,img,description,status,priority,created_date,owner,department
1,,Sistema Principal,Sistema de gestión central,home,https://swanix.org,https://example.com/img.svg,Sistema principal de gestión,Activo,Alta,2024-01-15,Admin,IT
```

## Compatibilidad

- ✅ Navegadores modernos (Chrome, Firefox, Safari, Edge)
- ✅ Modo oscuro/claro automático
- ✅ Dispositivos móviles (responsive)
- ✅ D3.js v7
- ✅ PapaParse para CSV

## Próximas Mejoras

- [ ] Soporte para tecla Escape para cerrar
- [ ] Animaciones más suaves
- [ ] Búsqueda dentro del panel
- [ ] Exportar información del nodo
- [ ] Edición inline de datos
- [ ] Historial de nodos visitados 