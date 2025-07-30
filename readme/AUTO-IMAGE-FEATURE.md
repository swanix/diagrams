# Auto Image Feature

## Descripción

Esta funcionalidad permite que el Org Chart automáticamente busque y use imágenes de personas basándose en sus nombres, sin necesidad de especificar manualmente la ruta de la imagen en la columna `img`.

## Cómo funciona

1. **Prioridad de imágenes**: La columna `img` siempre tiene prioridad absoluta. Si tiene un valor, se usa ese valor.
2. **Búsqueda automática**: Si la columna `img` está vacía, el sistema busca automáticamente una imagen basada en el nombre de la persona.
3. **Transformación del nombre**: El nombre se transforma automáticamente:
   - Convertido a minúsculas
   - Acentos removidos (á → a, é → e, etc.)
   - Ñ reemplazada por n
   - Espacios reemplazados por guiones
   - Solo se mantienen letras, números y guiones

## Ejemplos de transformación

| Nombre Original | Nombre Normalizado | Archivo de imagen |
|----------------|-------------------|------------------|
| Alice Thompson | alice-thompson | img/photos/alice-thompson.jpeg |
| Bob Martínez | bob-martinez | img/photos/bob-martinez.jpeg |
| María José | maria-jose | img/photos/maria-jose.jpeg |
| Jean-Pierre | jean-pierre | img/photos/jean-pierre.jpeg |

## Configuración

Para usar esta funcionalidad:

1. **Modo thumbnail**: Debe estar configurado como `"custom"`
2. **Columna img**: Debe estar vacía o no especificada
3. **Archivos de imagen**: Deben estar en la carpeta `img/photos/` con el formato correcto

### Ejemplo de configuración

```javascript
{
  name: "Org Chart - Auto Image",
  url: "data/org-chart.csv",
  options: {
    thumbnailMode: "custom"
  }
}
```

## Estructura de archivos

```
src/
├── img/
│   └── photos/
│       ├── alice-thompson.jpeg
│       ├── bob-martinez.jpeg
│       ├── carla-wilson.jpeg
│       └── ...
└── data/
    └── org-chart.csv
```

## CSV de ejemplo

```csv
ID,Name,Parent,Position,Type,Image
1,Alice Thompson,,CEO,Person,
2,Bob Martinez,1,CTO,Person,
3,Carla Wilson,1,CFO,Person,
```

## Imágenes disponibles

El sistema funciona de manera completamente dinámica. No hay nombres hardcodeados en el código. Simplemente:

1. **Coloca las fotos** en la carpeta `src/img/photos/` con el formato correcto
2. **Nombra los archivos** siguiendo el patrón: `nombre-apellido.jpeg`
3. **El sistema automáticamente** encontrará las imágenes basándose en los nombres del CSV

### Extensiones soportadas:
El sistema soporta múltiples formatos de imagen:
- `.jpeg` (prioridad más alta)
- `.jpg`
- `.png`
- `.webp`
- `.gif`

### Ejemplos de archivos que funcionarían:
- alice-thompson.jpeg
- bob-martinez.png
- carla-wilson.webp
- avatar.jpg
- maria-jose.jpeg
- jean-pierre.png

## Fallback

Si no se encuentra una imagen automática para el nombre, el sistema usa el comportamiento estándar:
1. Busca un thumbnail embebido basado en el tipo
2. Usa el thumbnail 'detail' como fallback
3. Usa un archivo SVG externo como último recurso

## Pruebas

Para probar la funcionalidad:

1. Abre `http://localhost:8000` en el navegador
2. Selecciona el diagrama "Test Auto Images"
3. Verifica que las imágenes se cargan automáticamente basándose en los nombres

## Logs de depuración

El sistema muestra logs detallados en la consola del navegador:

```
[resolveNodeImage] Processing node: Alice Thompson
[resolveNodeImage] Thumbnail mode: custom
[resolveNodeImage] Img value: ""
[resolveNodeImage] Name value: "Alice Thompson"
[resolveNodeImage] Auto image found: img/photos/alice-thompson.jpeg
``` 