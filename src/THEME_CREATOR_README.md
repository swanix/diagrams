# 🎨 Theme Creator - Swanix Diagrams

## Descripción

El **Theme Creator** es una herramienta visual para crear y personalizar temas para diagramas jerárquicos. Permite editar en tiempo real todas las variables CSS que afectan la apariencia del diagrama.

## ✨ Características

### 🎯 Funcionalidades Principales
- **Preview en tiempo real**: Los cambios se aplican instantáneamente al diagrama de muestra
- **Diagrama de muestra completo**: Incluye todos los tipos de thumbnails disponibles
- **Interfaz moderna**: Diseño con gradientes y efectos visuales atractivos
- **Controles intuitivos**: Color pickers y campos de texto sincronizados

### 🎨 Variables Editables

#### Colores Base
- **Color de Fondo**: Fondo principal del diagrama
- **Color de Texto**: Color del texto principal

#### Nodos
- **Fondo del Nodo**: Color de relleno de los nodos
- **Borde del Nodo**: Color del borde de los nodos
- **Nodo Seleccionado**: Color de resaltado para nodos seleccionados

#### Enlaces
- **Color de Enlaces**: Color de las líneas que conectan los nodos

#### Botones
- **Fondo del Botón**: Color de fondo de los botones
- **Fondo Hover**: Color de fondo al pasar el mouse
- **Texto del Botón**: Color del texto de los botones
- **Texto Hover**: Color del texto al pasar el mouse

#### Textos Secundarios
- **Texto ID**: Color del identificador del nodo
- **Texto Subtítulo**: Color del texto descriptivo

#### Filtros de Imagen
- **Filtro de Thumbnails**: Filtros CSS aplicados a las imágenes (ej: `grayscale(30%)`, `sepia(50%)`, `hue-rotate(180deg)`)

### 🛠️ Acciones Disponibles

#### 📋 Copiar
Copia el código CSS del tema al portapapeles para usar en otros proyectos.

#### 🔄 Reset
Restaura todos los valores a los predeterminados.

#### ✅ Aplicar
Aplica el tema actual al diagrama de vista previa.

#### 💾 Exportar
Descarga el tema como archivo JSON con toda la configuración.

#### 🔍 Pantalla Completa
Permite ver el diagrama en pantalla completa para mejor visualización.

## 📁 Estructura de Archivos

```
src/
├── theme-creator.html          # Archivo principal del theme creator
├── data/
│   └── sample-diagram.csv      # Datos de muestra con todos los thumbnails
├── img/                        # Thumbnails disponibles
│   ├── detail.svg
│   ├── list.svg
│   ├── settings.svg
│   ├── report.svg
│   ├── form.svg
│   ├── modal.svg
│   ├── document.svg
│   ├── file-pdf.svg
│   ├── file-csv.svg
│   └── file-xls.svg
└── sw-diagrams.js              # Lógica del diagrama
```

## 🚀 Uso

1. **Abrir el theme creator**:
   ```bash
   cd src
   python3 -m http.server 8000
   ```
   Luego abrir `http://localhost:8000/theme-creator.html`

2. **Personalizar el tema**:
   - Editar el nombre del tema
   - Ajustar colores usando los color pickers o campos de texto
   - Modificar filtros de imagen
   - Ver los cambios en tiempo real

3. **Exportar el tema**:
   - Usar "Copiar" para obtener el código CSS
   - Usar "Exportar" para descargar como JSON
   - Usar "Aplicar" para ver el resultado final

## 🎨 Ejemplos de Filtros

### Filtros Básicos
- `grayscale(30%)` - Escala de grises al 30%
- `sepia(50%)` - Efecto sepia al 50%
- `brightness(120%)` - Brillo aumentado al 120%
- `contrast(150%)` - Contraste aumentado al 150%

### Filtros Avanzados
- `hue-rotate(180deg)` - Rotación de tono 180 grados
- `saturate(200%)` - Saturación aumentada al 200%
- `invert(100%)` - Inversión completa de colores
- `blur(2px)` - Desenfoque de 2px

### Combinaciones
- `grayscale(50%) sepia(30%)` - Combinación de efectos
- `brightness(110%) contrast(120%)` - Ajuste de brillo y contraste

## 🔧 Personalización Avanzada

### Agregar Nuevas Variables
Para agregar nuevas variables CSS editables:

1. Agregar el campo en el HTML:
```html
<div class="variable-item">
    <label class="variable-label">Nueva Variable</label>
    <div class="variable-controls">
        <input type="color" class="color-picker" data-var="--nueva-variable" value="#ffffff">
        <input type="text" class="text-input" data-var="--nueva-variable" value="#ffffff">
        <div class="preview-box" style="--preview-color: #ffffff"></div>
    </div>
</div>
```

2. Agregar el valor por defecto en JavaScript:
```javascript
const defaultValues = {
    // ... otras variables
    '--nueva-variable': '#ffffff'
};
```

### Modificar el Diagrama de Muestra
Editar `data/sample-diagram.csv` para cambiar la estructura del diagrama de vista previa.

## 🎯 Mejoras Implementadas

### Diseño y UX
- ✅ Interfaz moderna con gradientes y efectos visuales
- ✅ Sidebar con diseño atractivo y organizado
- ✅ Controles más grandes y fáciles de usar
- ✅ Feedback visual mejorado
- ✅ Responsive design

### Funcionalidad
- ✅ Preview en tiempo real con diagrama completo
- ✅ Todos los thumbnails disponibles en el diagrama de muestra
- ✅ Exportación a JSON
- ✅ Función de pantalla completa
- ✅ Mejor organización de variables por categorías

### Técnico
- ✅ Código más limpio y mantenible
- ✅ Mejor manejo de eventos
- ✅ Estructura de archivos organizada
- ✅ Documentación completa

## 🔮 Próximas Mejoras

- [ ] Importación de temas desde archivos JSON
- [ ] Presets de temas predefinidos
- [ ] Vista previa de múltiples diagramas
- [ ] Exportación a diferentes formatos
- [ ] Historial de cambios
- [ ] Comparación de temas

---

**Desarrollado para Swanix Diagrams** 🚀 