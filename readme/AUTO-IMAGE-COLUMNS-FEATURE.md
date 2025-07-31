# Auto Image Columns Feature

## 🎯 Descripción

Esta funcionalidad permite configurar columnas específicas en tu CSV para que usen automáticamente las imágenes de personas basándose en sus nombres, sin necesidad de especificar manualmente las rutas de las imágenes.

## 🚀 Cómo usar

### 1. Configuración básica

En tu archivo `index.html`, configura el diagrama con las opciones necesarias:

```javascript
{
  name: "Mi Proyecto con Responsables",
  url: "data/mi-proyecto.csv",
  cols: {
    id: "ID",
    name: "Name",
    parent: "Parent",
    subtitle: "Position",
    type: "Type"
  },
  options: {
    thumbnailMode: "custom",
    autoImages: true,
    autoImageColumns: ["Responsable_Desarrollo", "Responsable_Diseno", "Responsable_Testing"]
  }
}
```

### 2. Preparar el CSV

En tu archivo CSV, incluye las columnas de responsables con los nombres de las personas:

```csv
ID,Name,Parent,Position,Type,Responsable_Desarrollo,Responsable_Diseno,Responsable_Testing
1,Proyecto Principal,,Proyecto,Project,Alice Thompson,Bob Martinez,Carla Wilson
2,Frontend,1,Subproyecto,Project,Emily Johnson,Frank Brown,Grace Lee
3,Backend,1,Subproyecto,Project,Irene Zhang,Kelly Simmons,Liam Turner
```

### 3. Preparar las fotos

Coloca las fotos en la carpeta `src/img/photos/` con el formato correcto:

```
src/img/photos/
├── alice-thompson.jpeg
├── bob-martinez.jpeg
├── carla-wilson.jpeg
├── emily-johnson.jpeg
├── frank-brown.jpeg
├── grace-lee.jpeg
├── irene-zhang.jpeg
├── kelly-simmons.jpeg
└── liam-turner.jpeg
```

## 📝 Configuración de opciones

### Opciones disponibles

| Opción | Tipo | Descripción | Ejemplo |
|--------|------|-------------|---------|
| `autoImages` | boolean | Habilita la funcionalidad de auto-imágenes | `true` |
| `autoImageColumns` | array | Lista de columnas que deben usar auto-imágenes | `["Responsable_Desarrollo", "Responsable_Diseno"]` |

### Ejemplo completo de configuración

```javascript
{
  name: "Equipo de Desarrollo",
  url: "data/equipo-desarrollo.csv",
  cols: {
    id: "ID",
    name: "Name",
    parent: "Parent",
    subtitle: "Position",
    type: "Type"
  },
  options: {
    thumbnailMode: "custom",
    autoImages: true,
    autoImageColumns: [
      "Responsable_Desarrollo",
      "Responsable_Diseno", 
      "Responsable_Testing",
      "Responsable_DevOps",
      "Product_Owner",
      "Scrum_Master"
    ]
  }
}
```

## 🔧 Funcionamiento

### Orden de prioridad

1. **Columna `img`**: Si existe y tiene valor, se usa esa imagen
2. **Columnas configuradas**: Si `autoImageColumns` está configurado, busca en esas columnas
3. **Nombre del nodo**: Si no hay columnas específicas, usa el nombre del nodo
4. **Fallback**: Usa thumbnails embebidos o archivos SVG

### Transformación de nombres

El sistema transforma automáticamente los nombres siguiendo estas reglas:

| Regla | Ejemplo |
|-------|---------|
| Minúsculas | `Alice Thompson` → `alice thompson` |
| Sin acentos | `José García` → `jose garcia` |
| Sin ñ | `Peña` → `pena` |
| Espacios por guiones | `alice thompson` → `alice-thompson` |
| Solo letras, números y guiones | `Jean-Pierre` → `jean-pierre` |

### Ejemplos de transformación

| Nombre Original | Nombre Normalizado | Archivo de imagen |
|----------------|-------------------|------------------|
| Alice Thompson | alice-thompson | img/photos/alice-thompson.jpeg |
| Bob Martínez | bob-martinez | img/photos/bob-martinez.jpeg |
| María José | maria-jose | img/photos/maria-jose.jpeg |
| Jean-Pierre | jean-pierre | img/photos/jean-pierre.jpeg |

## 📁 Estructura de archivos

```
src/
├── img/
│   └── photos/
│       ├── alice-thompson.jpeg
│       ├── bob-martinez.jpeg
│       ├── carla-wilson.jpeg
│       └── ...
├── data/
│   └── mi-proyecto.csv
└── index.html
```

## 🎨 Casos de uso

### 1. Equipo de desarrollo
```csv
ID,Name,Parent,Position,Type,Responsable_Desarrollo,Responsable_Diseno,Responsable_Testing
1,Proyecto Web,,Proyecto,Project,Alice Thompson,Bob Martinez,Carla Wilson
```

### 2. Organización con múltiples roles
```csv
ID,Name,Parent,Position,Type,CEO,CTO,CFO,HR_Manager
1,Empresa,,Empresa,Company,Alice Thompson,Bob Martinez,Carla Wilson,David White
```

### 3. Proyectos con responsables por área
```csv
ID,Name,Parent,Position,Type,Tech_Lead,UX_Lead,QA_Lead,DevOps_Lead
1,App Móvil,,Proyecto,Project,Emily Johnson,Frank Brown,Grace Lee,Henry Adams
```

## 🔍 Debugging

### Logs de consola

El sistema genera logs detallados para ayudar con el debugging:

```
[getAutoImageColumns] Using diagram-specific columns: Responsable_Desarrollo, Responsable_Diseno, Responsable_Testing
[resolveNodeImage] Auto image columns configured: Responsable_Desarrollo, Responsable_Diseno, Responsable_Testing
[resolveNodeImage] Checking auto image column "Responsable_Desarrollo" with value: "Alice Thompson"
[resolveNodeImage] Auto image found for column "Responsable_Desarrollo" with value "Alice Thompson": img/photos/alice-thompson.jpeg
```

### Verificar configuración

Para verificar que la configuración es correcta:

1. Abre la consola del navegador (F12)
2. Busca los logs que empiecen con `[getAutoImageColumns]`
3. Verifica que las columnas estén configuradas correctamente
4. Revisa los logs de `[resolveNodeImage]` para ver el proceso de búsqueda

## ⚠️ Consideraciones

### Seguridad
- Las auto-imágenes están deshabilitadas por defecto por seguridad
- Solo se habilitan cuando `autoImages: true` está configurado explícitamente

### Rendimiento
- El sistema precarga las imágenes disponibles para mejorar el rendimiento
- Se usa un cache para evitar verificaciones repetidas

### Compatibilidad
- Funciona con todos los modos de thumbnail (`custom`, `default`, `simple`)
- No funciona con `thumbnailMode: "none"`
- Compatible con la funcionalidad existente de auto-imágenes

## 🚀 Ejemplo completo

### Archivo CSV (`data/equipo.csv`)
```csv
ID,Name,Parent,Position,Type,Responsable_Desarrollo,Responsable_Diseno,Responsable_Testing
1,Proyecto Principal,,Proyecto,Project,Alice Thompson,Bob Martinez,Carla Wilson
2,Frontend,1,Subproyecto,Project,Emily Johnson,Frank Brown,Grace Lee
3,Backend,1,Subproyecto,Project,Irene Zhang,Kelly Simmons,Liam Turner
```

### Configuración (`index.html`)
```javascript
{
  name: "Equipo de Desarrollo",
  url: "data/equipo.csv",
  cols: {
    id: "ID",
    name: "Name",
    parent: "Parent",
    subtitle: "Position",
    type: "Type"
  },
  options: {
    thumbnailMode: "custom",
    autoImages: true,
    autoImageColumns: ["Responsable_Desarrollo", "Responsable_Diseno", "Responsable_Testing"]
  }
}
```

### Resultado
- Cada nodo mostrará la imagen de la primera persona encontrada en las columnas configuradas
- Si "Alice Thompson" está en "Responsable_Desarrollo", se mostrará su imagen
- Si no encuentra imagen, usará el fallback normal del sistema 