# Auto Image Feature - Guía de Uso

## 🎯 ¿Qué hace esta funcionalidad?

La funcionalidad de **Auto Image** permite que el Org Chart automáticamente encuentre y use fotos de personas basándose únicamente en sus nombres, sin necesidad de especificar manualmente las rutas de las imágenes.

## 🚀 Cómo usar

### 1. Configuración básica

En tu archivo `index.html`, configura el diagrama con `thumbnailMode: "custom"`:

```javascript
{
  name: "Mi Org Chart",
  url: "data/mi-org-chart.csv",
  options: {
    thumbnailMode: "custom"
  }
}
```

### 2. Preparar el CSV

En tu archivo CSV, **deja la columna `Image` vacía** para que se active la búsqueda automática:

```csv
ID,Name,Parent,Position,Type,Image
1,Alice Thompson,,CEO,Person,
2,Bob Martinez,1,CTO,Person,
3,Carla Wilson,1,CFO,Person,
```

### 3. Preparar las fotos

Coloca las fotos en la carpeta `src/img/photos/` con el formato correcto:

```
src/img/photos/
├── alice-thompson.jpeg
├── bob-martinez.jpeg
├── carla-wilson.jpeg
└── ...
```

## 📝 Reglas de nomenclatura

### Transformación automática del nombre

El sistema transforma automáticamente los nombres siguiendo estas reglas:

| Regla | Ejemplo |
|-------|---------|
| Minúsculas | `Alice Thompson` → `alice thompson` |
| Sin acentos | `José García` → `jose garcia` |
| Sin ñ | `Peña` → `pena` |
| Espacios por guiones | `alice thompson` → `alice-thompson` |
| Solo letras, números y guiones | `Jean-Pierre` → `jean-pierre` |

### Ejemplos completos

| Nombre Original | Nombre Normalizado | Archivo de imagen |
|----------------|-------------------|------------------|
| Alice Thompson | alice-thompson | img/photos/alice-thompson.jpeg |
| Bob Martínez | bob-martinez | img/photos/bob-martinez.jpeg |
| María José | maria-jose | img/photos/maria-jose.jpeg |
| Jean-Pierre | jean-pierre | img/photos/jean-pierre.jpeg |
| François Dubois | francois-dubois | img/photos/francois-dubois.jpeg |

## 🔧 Prioridad de imágenes

El sistema sigue este orden de prioridad:

1. **Columna Image** (si tiene valor) - Prioridad absoluta
2. **Búsqueda automática** por nombre (si Image está vacía)
3. **Thumbnail embebido** basado en el tipo
4. **Thumbnail 'detail'** como fallback
5. **Archivo SVG externo** como último recurso

## 📁 Estructura de archivos

```
diagrams/
├── src/
│   ├── img/
│   │   └── photos/
│   │       ├── alice-thompson.jpeg
│   │       ├── bob-martinez.jpeg
│   │       └── ...
│   ├── data/
│   │   └── org-chart.csv
│   └── index.html
└── scripts/
    └── generate-image-list.js
```

## 🛠️ Mantenimiento

### Agregar nuevas fotos

El sistema es **completamente dinámico**. Para agregar nuevas fotos:

1. **Coloca la foto** en `src/img/photos/` con el formato correcto
2. **Nombra el archivo** siguiendo el patrón: `nombre-apellido.jpeg`
3. **¡Listo!** El sistema automáticamente encontrará la imagen

**No necesitas ejecutar scripts ni modificar código.**

### Extensiones soportadas

El sistema soporta múltiples formatos de imagen en orden de prioridad:

- `.jpeg` (prioridad más alta)
- `.jpg`
- `.png`
- `.webp`
- `.gif`

**Nota**: Si tienes la misma imagen en múltiples formatos, el sistema usará la primera que encuentre en este orden.

## 🧪 Pruebas

### Diagramas de prueba disponibles

1. **Test Auto Images**: Prueba básica con nombres simples
2. **Test Auto Images (Special Characters)**: Prueba con acentos y caracteres especiales
3. **Test Auto Images (Mixed)**: Mezcla de nombres con y sin imágenes
4. **Test Multiple Extensions**: Prueba con diferentes formatos de imagen (.jpeg, .jpg, .png, .webp)

### Cómo probar

1. Inicia el servidor local:
   ```bash
   cd src && python3 -m http.server 8000
   ```

2. Abre `http://localhost:8000` en tu navegador

3. Selecciona uno de los diagramas de prueba

4. Verifica en la consola del navegador los logs de depuración

## 🔍 Logs de depuración

El sistema muestra logs detallados en la consola:

```
[resolveNodeImage] Processing node: Alice Thompson
[resolveNodeImage] Thumbnail mode: custom
[resolveNodeImage] Img value: ""
[resolveNodeImage] Name value: "Alice Thompson"
[resolveNodeImage] Auto image found: img/photos/alice-thompson.jpeg
```

## ❓ Preguntas frecuentes

### ¿Qué pasa si no encuentro una imagen para un nombre?

El sistema usa el comportamiento estándar de fallback: thumbnail embebido → detail → SVG externo.

### ¿Puedo usar URLs externas en la columna Image?

Sí, la columna Image siempre tiene prioridad absoluta. Si especificas una URL, se usará esa URL.

### ¿Cómo agrego nuevas fotos?

1. Coloca la foto en `src/img/photos/` con el formato correcto
2. Nombra el archivo siguiendo el patrón: `nombre-apellido.jpeg`
3. ¡Listo! El sistema automáticamente encontrará la imagen

**No necesitas ejecutar scripts ni modificar código.**

### ¿Funciona con nombres en otros idiomas?

Sí, el sistema normaliza caracteres Unicode, por lo que funciona con nombres en español, francés, etc.

## 📚 Archivos relacionados

- `src/xdiagrams.js` - Implementación principal
- `AUTO-IMAGE-FEATURE.md` - Documentación técnica
- `src/data/test-auto-images.csv` - Archivo de prueba básico
- `src/data/test-auto-images-special.csv` - Archivo de prueba con caracteres especiales
- `src/data/test-auto-images-mixed.csv` - Archivo de prueba con nombres mixtos
- `src/data/test-multiple-extensions.csv` - Archivo de prueba con múltiples extensiones 