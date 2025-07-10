# Sistema de Temas Centralizado en JSON

## Descripción

El sistema de temas ahora utiliza un archivo JSON externo (`themes.json`) para centralizar toda la configuración de colores y variables CSS. Esto facilita el mantenimiento y la modificación de temas sin necesidad de editar código JavaScript.

## Archivo `themes.json`

### Estructura

El archivo contiene un objeto JSON con cada tema como clave:

```json
{
  "snow": {
    "--bg-color": "#f6f7f9",
    "--text-color": "#222",
    "--node-fill": "#fff",
    // ... más variables CSS
  },
  "onyx": {
    "--bg-color": "#181c24",
    "--text-color": "#f6f7f9",
    // ... más variables CSS
  }
}
```

### Variables CSS Disponibles

#### Colores Base
- `--bg-color`: Color de fondo principal
- `--text-color`: Color del texto principal
- `--node-fill`: Color de relleno de los nodos

#### Controles y UI
- `--control-bg`: Fondo de controles (botones, inputs)
- `--control-text`: Texto de controles
- `--control-border`: Borde de controles
- `--control-border-hover`: Borde de controles en hover
- `--control-border-focus`: Borde de controles en focus
- `--control-focus`: Color de focus principal
- `--control-placeholder`: Color de placeholder en inputs
- `--control-shadow`: Sombra de controles
- `--control-shadow-focus`: Sombra de controles en focus

#### Panel Lateral
- `--sidepanel-bg`: Fondo del panel lateral
- `--sidepanel-text`: Texto del panel lateral
- `--sidepanel-border`: Borde del panel lateral
- `--side-panel-bg`: Fondo del panel de detalles
- `--side-panel-text`: Texto del panel de detalles
- `--side-panel-header-bg`: Fondo del header del panel
- `--side-panel-header-border`: Borde del header del panel
- `--side-panel-border`: Borde del panel de detalles
- `--side-panel-label`: Color de etiquetas en el panel
- `--side-panel-value`: Color de valores en el panel

#### Topbar
- `--topbar-bg`: Fondo del topbar
- `--topbar-text`: Texto del topbar

#### Nodos y Selección
- `--node-stroke-focus`: Borde de nodo en focus
- `--node-selection-border`: Borde de selección de nodos
- `--node-selection-focus`: Color de focus en selección
- `--node-selection-hover`: Color de hover en selección
- `--node-selection-selected`: Color de nodo seleccionado

#### Enlaces y Labels
- `--link-color`: Color de los enlaces entre nodos
- `--label-border`: Borde de las etiquetas

#### Clusters
- `--cluster-bg`: Fondo de los clusters
- `--cluster-stroke`: Borde de los clusters
- `--cluster-title-color`: Color del título de cluster

#### Efectos Visuales
- `--image-filter`: Filtro CSS para imágenes
- `--bg-image`: Imagen de fondo (URL o 'none')
- `--bg-opacity`: Opacidad del fondo

#### Estados de Carga
- `--loading-color`: Color del indicador de carga
- `--loading-bg`: Fondo del indicador de carga

#### Espaciado
- `--tree-simple-vertical-spacing`: Espaciado vertical para árboles simples
- `--tree-simple-horizontal-spacing`: Espaciado horizontal para árboles simples
- `--tree-vertical-spacing`: Espaciado vertical para árboles
- `--tree-horizontal-spacing`: Espaciado horizontal para árboles
- `--cluster-padding-x`: Padding horizontal de clusters
- `--cluster-padding-y`: Padding vertical de clusters
- `--cluster-spacing`: Espaciado entre clusters

## Funcionamiento

### Carga de Temas

1. **Cache**: Los temas se cargan una sola vez y se almacenan en caché para evitar múltiples peticiones HTTP.

2. **Fallback**: Si la carga del JSON falla, se utiliza un tema básico de respaldo.

3. **Asíncrono**: La carga es asíncrona para no bloquear la interfaz.

### Aplicación de Temas

```javascript
// Aplicar un tema
await setTheme('snow');

// Inicializar el sistema de temas
await initializeThemeSystem();
```

## Ventajas

1. **Centralización**: Todos los colores están en un solo lugar
2. **Mantenibilidad**: Fácil modificación sin tocar código
3. **Escalabilidad**: Fácil agregar nuevos temas
4. **Separación de Responsabilidades**: Configuración separada de lógica
5. **Cache**: Rendimiento optimizado con caché de temas

## Agregar Nuevos Temas

Para agregar un nuevo tema:

1. Agregar la configuración en `themes.json`:
```json
{
  "mi-nuevo-tema": {
    "--bg-color": "#ffffff",
    "--text-color": "#000000",
    // ... resto de variables
  }
}
```

2. El tema estará disponible automáticamente en el sistema

## Modificar Temas Existentes

Simplemente editar las variables en `themes.json` y refrescar la página. Los cambios se aplicarán inmediatamente.

## Compatibilidad

- El sistema mantiene compatibilidad con el theme-loader.js existente
- Funciona con todos los diagramas existentes
- Mantiene la persistencia en localStorage 