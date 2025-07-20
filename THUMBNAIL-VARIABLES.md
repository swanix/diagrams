# Variables CSS para Thumbnails Embebidos

Este documento describe las variables CSS con prefijo `--thumb-*` que controlan el diseño y apariencia de los thumbnails embebidos en XDiagrams.

## Variables Disponibles

### Propiedades Básicas

- `--thumb-opacity`: Controla la opacidad del thumbnail (0.0 a 1.0)

### Propiedades de Color SVG

- `--thumb-fill`: Color de relleno del SVG (ej: "var(--text-color)", "#333", "rgba(0,0,0,0.8)")
- `--thumb-stroke`: Color del trazo/borde del SVG (ej: "transparent", "#ccc", "var(--text-color)")

### Filtros de Imagen

- `--thumb-filter`: Filtro CSS completo para el thumbnail (ej: "none", "brightness(1.2) contrast(1.1) saturate(0.8) drop-shadow(0 2px 4px rgba(0,0,0,0.3))")

**Nota**: Esta variable permite aplicar cualquier combinación de filtros CSS como `brightness()`, `contrast()`, `saturate()`, `hue-rotate()`, `sepia()`, `invert()`, `grayscale()`, `blur()`, `drop-shadow()`, etc.

## Ejemplos por Tema

### Tema Snow (Claro)
```css
--thumb-opacity: 1;
--thumb-filter: none;
--thumb-fill: red;
--thumb-stroke: transparent;
```

### Tema Onyx (Oscuro)
```css
--thumb-opacity: 0.9;
--thumb-scale: 1.0;
--thumb-filter: brightness(1.2) contrast(1.1) saturate(0.8) drop-shadow(0 2px 4px rgba(0,0,0,0.3));
--thumb-border-radius: 2px;
```

### Tema Vintage
```css
--thumb-opacity: 0.85;
--thumb-scale: 1.0;
--thumb-filter: brightness(0.95) contrast(1.05) saturate(0.9) sepia(0.1) drop-shadow(0 1px 3px rgba(139,69,19,0.2));
--thumb-border-radius: 3px;
```

### Tema Pastel
```css
--thumb-opacity: 0.9;
--thumb-scale: 1.0;
--thumb-filter: brightness(1.05) saturate(0.9) drop-shadow(0 2px 6px rgba(168,180,245,0.15));
--thumb-border-radius: 4px;
```

### Tema Neon
```css
--thumb-opacity: 0.95;
--thumb-scale: 1.0;
--thumb-filter: brightness(1.2) contrast(1.1) saturate(1.3) drop-shadow(0 0 8px rgba(0,255,65,0.4));
--thumb-border-radius: 2px;
```

### Tema Forest
```css
--thumb-opacity: 0.9;
--thumb-scale: 1.0;
--thumb-filter: brightness(0.9) contrast(1.1) saturate(1.1) hue-rotate(120deg) drop-shadow(0 2px 4px rgba(76,175,80,0.2));
--thumb-border-radius: 3px;
```

## Efectos Hover

Los thumbnails embebidos incluyen efectos hover automáticos:

- **Escala**: Se incrementa un 5% (`scale(1.05)`)
- **Filtro**: Se mantiene el mismo filtro definido en `--thumb-filter`

## Uso en CSS Personalizado

Para personalizar thumbnails en tu propio CSS:

```css
.embedded-thumbnail {
  --thumb-opacity: 0.9;
  --thumb-filter: brightness(1.2) contrast(1.1) saturate(1.1) drop-shadow(0 4px 8px rgba(0,0,0,0.4));
  --thumb-fill: #333;
  --thumb-stroke: rgba(0,0,0,0.2);
}
```

## Variables de Nodos

También se agregaron las variables de nodos que faltaban:

- `--node-bg-width`: Ancho del fondo del nodo
- `--node-bg-height`: Alto del fondo del nodo
- `--node-bg-x`: Posición X del fondo del nodo
- `--node-bg-y`: Posición Y del fondo del nodo
- `--node-bg-stroke`: Grosor del borde del nodo
- `--image-x`: Posición X de la imagen
- `--image-y`: Posición Y de la imagen
- `--image-width`: Ancho de la imagen
- `--image-height`: Alto de la imagen

Estas variables permiten un control completo sobre el posicionamiento y tamaño de los nodos y sus imágenes.

## Ejemplos de Uso de Colores SVG

### Thumbnail con relleno sólido y sin borde
```css
--thumb-fill: #333;
--thumb-stroke: transparent;
```

### Thumbnail con relleno y borde del mismo color
```css
--thumb-fill: var(--text-color);
--thumb-stroke: var(--text-color);
```

### Thumbnail con relleno transparente y borde visible
```css
--thumb-fill: transparent;
--thumb-stroke: #666;
```

### Thumbnail con relleno semitransparente
```css
--thumb-fill: rgba(0,0,0,0.7);
--thumb-stroke: rgba(0,0,0,0.3);
```

### Thumbnail que se adapta al tema
```css
--thumb-fill: var(--text-color);
--thumb-stroke: var(--node-stroke);
``` 