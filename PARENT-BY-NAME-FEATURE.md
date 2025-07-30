# Funcionalidad: Referencia Padre por Nombre, Alias de Columnas y Type Opcional

Esta funcionalidad permite que la columna `Parent` pueda contener tanto **IDs** como **nombres** para establecer la jerarquía en organigramas y diagramas. Además, soporta múltiples alias de columnas y hace que la columna `Type` sea opcional con un valor por defecto.

## Descripción

Anteriormente, la columna `Parent` solo aceptaba IDs para establecer las relaciones padre-hijo. Ahora, el sistema puede resolver referencias tanto por ID como por nombre, lo que facilita la creación de organigramas donde se define el líder de una persona.

### Alias de Columnas Soportados

El sistema soporta múltiples nombres de columnas para establecer la jerarquía:

- `parent`, `Parent`, `PARENT`
- `leader`, `Leader`, `LEADER` 
- `manager`, `Manager`, `MANAGER`

### Columna Type Opcional

La columna `Type` es ahora opcional:

- **Valor por defecto**: Si no se especifica, se asigna `"default"`
- **Nodos raíz**: Los nodos sin padre se consideran automáticamente como nodos raíz del cluster
- **Sin cluster de almacenaje**: Ya no se crea un cluster temporal para nodos sin Type

### Título de Cluster Único

Cuando hay un solo cluster en el diagrama:

- **Título automático**: El título del cluster será el nombre del diagrama definido en la configuración
- **Mejor UX**: Proporciona contexto claro sobre qué diagrama se está visualizando
- **Consistencia**: Mantiene la coherencia visual en diagramas de un solo cluster

## Funcionamiento

### Proceso de Resolución

1. **Primera pasada**: Se crean todos los nodos y se construye un mapa de nombres a IDs
2. **Segunda pasada**: Para cada nodo con un padre definido:
   - Primero intenta encontrar el padre por ID
   - Si no lo encuentra, busca el padre por nombre
   - Si encuentra el padre, establece la relación padre-hijo

### Ejemplos de Uso

#### Ejemplo 1: Solo Nombres
```csv
ID,Name,Parent,Position
CEO001,Alan Roberts,,CEO
CTO001,Tim Watson,Alan Roberts,CTO
DEV001,Carl Reynolds,Tim Watson,Developer
```

#### Ejemplo 2: Solo IDs
```csv
ID,Name,Parent,Position
CEO001,Alan Roberts,,CEO
CTO001,Tim Watson,CEO001,CTO
DEV001,Carl Reynolds,CTO001,Developer
```

#### Ejemplo 3: Mixto (IDs y Nombres)
```csv
ID,Name,Parent,Position
CEO001,Alan Roberts,,CEO
CTO001,Tim Watson,CEO001,CTO
DEV001,Carl Reynolds,Tim Watson,Developer
DEV002,Kelsie Weeks,CTO001,Developer
```

#### Ejemplo 4: Usando Columna Leader
```csv
ID,Name,Leader,Position
CEO001,Alan Roberts,,CEO
CTO001,Tim Watson,Alan Roberts,CTO
DEV001,Carl Reynolds,Tim Watson,Developer
```

#### Ejemplo 5: Usando Columna Manager
```csv
ID,Name,Manager,Position
CEO001,Alan Roberts,,CEO
CTO001,Tim Watson,Alan Roberts,CTO
DEV001,Carl Reynolds,Tim Watson,Developer
```

#### Ejemplo 6: Sin Columna Type (Type Opcional)
```csv
ID,Name,Parent,Position
CEO001,Alan Roberts,,CEO
CTO001,Tim Watson,Alan Roberts,CTO
DEV001,Carl Reynolds,Tim Watson,Developer
```

#### Ejemplo 7: Mezclando con y sin Type
```csv
ID,Name,Parent,Position,Type
CEO001,Alan Roberts,,CEO,Group
CTO001,Tim Watson,Alan Roberts,CTO,
DEV001,Carl Reynolds,Tim Watson,Developer,Employee
```

#### Ejemplo 8: Diagrama de Un Solo Cluster
```csv
ID,Name,Parent,Position,Department
CEO001,Alan Roberts,,CEO,Executive
CTO001,Tim Watson,Alan Roberts,CTO,Technology
DEV001,Carl Reynolds,Tim Watson,Developer,Technology
```

**Configuración**:
```javascript
{
  name: "Mi Organigrama",  // Este será el título del cluster
  url: "data/organigrama.csv",
  cols: {
    id: "ID",
    name: "Name",
    parent: "Parent",
    subtitle: "Position"
  }
}
```

## Configuración

La funcionalidad funciona automáticamente sin configuración adicional. Solo asegúrate de que:

1. La columna `Parent` esté correctamente configurada en tu diagrama
2. Los nombres en la columna `Parent` coincidan exactamente con los nombres en la columna `Name`

### Configuración de Columnas

```javascript
{
  name: "Mi Organigrama",
  url: "data/organigrama.csv",
  cols: {
    id: "ID",
    name: "Name",
    parent: "Parent",  // Puede contener IDs o nombres
    subtitle: "Position",
    type: "Department"
  }
}
```

#### Configuración con Columna Leader

```javascript
{
  name: "Organigrama con Leader",
  url: "data/organigrama.csv",
  cols: {
    id: "ID",
    name: "Name",
    parent: "Leader",  // Usa la columna Leader
    subtitle: "Position",
    type: "Department"
  }
}
```

#### Configuración con Columna Manager

```javascript
{
  name: "Organigrama con Manager",
  url: "data/organigrama.csv",
  cols: {
    id: "ID",
    name: "Name",
    parent: "Manager",  // Usa la columna Manager
    subtitle: "Position",
    type: "Department"
  }
}
```

#### Configuración sin Columna Type

```javascript
{
  name: "Organigrama sin Type",
  url: "data/organigrama.csv",
  cols: {
    id: "ID",
    name: "Name",
    parent: "Parent",
    subtitle: "Position"
    // No se especifica type, se usará "default"
  }
}
```

## Casos de Uso

### Organigramas Empresariales
- Definir jefes por nombre en lugar de IDs
- Facilitar la creación de organigramas desde hojas de cálculo
- Permitir referencias más intuitivas

### Mapas de Sitio Web
- Referenciar páginas padre por título
- Crear jerarquías más legibles

### Diagramas de Proyectos
- Establecer dependencias por nombre de proyecto
- Crear estructuras más comprensibles

## Ventajas

1. **Flexibilidad**: Permite usar tanto IDs como nombres
2. **Legibilidad**: Los nombres son más fáciles de entender que los IDs
3. **Compatibilidad**: Mantiene compatibilidad con el sistema anterior
4. **Facilidad de uso**: Simplifica la creación de organigramas
5. **Múltiples alias**: Soporta diferentes nombres de columnas (Parent, Leader, Manager)
6. **Adaptabilidad**: Se adapta a diferentes convenciones de nomenclatura
7. **Type opcional**: No es necesario especificar la columna Type
8. **Nodos raíz automáticos**: Los nodos sin padre se consideran automáticamente como raíz
9. **Sin clusters temporales**: Elimina la complejidad de clusters de almacenaje temporal
10. **Título de cluster único**: Los diagramas de un solo cluster usan el nombre del diagrama como título

## Consideraciones

- Los nombres deben coincidir exactamente (incluyendo espacios y mayúsculas/minúsculas)
- Si hay nombres duplicados, se usará el primero encontrado
- Se recomienda usar IDs únicos para evitar ambigüedades en datasets grandes
- Si no se especifica Type, se usará el valor por defecto `"default"`
- Los nodos sin padre se consideran automáticamente como nodos raíz del cluster
- Ya no se crean clusters temporales para nodos sin Type
- En diagramas de un solo cluster, el título será el nombre del diagrama en lugar del nombre del nodo raíz

## Logs de Depuración

El sistema muestra advertencias en la consola cuando no puede encontrar un padre:

```
[buildHierarchies] Parent not found for node "Nombre del Nodo": "Nombre del Padre"
```

Esto ayuda a identificar problemas en la configuración de datos. 