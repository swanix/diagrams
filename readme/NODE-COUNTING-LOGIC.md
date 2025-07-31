# Lógica de Conteo de Nodos

## Descripción

El sistema ahora cuenta únicamente los nodos que son considerados "secciones" para mostrar el número total en el contador de la barra superior.

## Lógica de Conteo

### Nodos que SÍ se cuentan:

1. **Nodos con `Type: "Section"`**
   - Nodos explícitamente marcados como secciones
   - Solo estos nodos se cuentan en el contador

### Nodos que NO se cuentan:

- Nodos con `Type` vacío o sin especificar
- Nodos con `Type: "Group"`
- Nodos con `Type: "Link"`
- Nodos con `Type: "Manager"`
- Nodos con `Type: "Developer"`
- Nodos con cualquier otro tipo específico

## Ejemplo

```csv
Name,Type,Parent
Section 1,Section,
Section 2,Section,
Section 3,Section,
Regular Node,,Section 1
Another Node,,Section 1
Group Node,Group,Section 2
Link Node,Link,Section 2
Manager Node,Manager,Section 3
Developer Node,Developer,Section 3
```

**Resultado del conteo**: 3 nodos
- Section 1 (Type: "Section")
- Section 2 (Type: "Section") 
- Section 3 (Type: "Section")

**Nodos excluidos**:
- Regular Node (Type vacío)
- Another Node (Type vacío)
- Group Node (Type: "Group")
- Link Node (Type: "Link")
- Manager Node (Type: "Manager")
- Developer Node (Type: "Developer")

## Implementación

```javascript
// Only count nodes with type 'Section' (sections are the main countable elements)
const filteredNodes = window.$xDiagrams.currentData.filter(node => {
  const nodeType = node.type || '';
  return nodeType === 'Section';
});

const nodeCount = filteredNodes.length;
```

## Casos de Uso

### Organigramas
- Cuenta solo las posiciones/secciones principales
- Excluye enlaces y grupos organizacionales

### Mapas de sitio
- Cuenta solo las páginas/secciones principales
- Excluye enlaces y elementos de navegación

### Diagramas de productos
- Cuenta solo los productos/categorías principales
- Excluye variantes y elementos de soporte

## Configuración de la palabra del contador

Puedes personalizar la palabra que aparece junto al número:

```javascript
{
  name: "Mi Diagrama",
  url: "data/datos.csv",
  counterWord: "secciones"  // Mostrará "X secciones"
}
```

## Notas Técnicas

- El conteo se actualiza automáticamente al cargar el diagrama
- Se aplica formateo de números (separadores de miles)
- La palabra del contador es configurable por diagrama
- Si no se especifica `counterWord`, usa "nodes" por defecto 