# Configuración de Palabra del Contador

Esta funcionalidad permite personalizar la palabra que se muestra en el contador de nodos según el tipo de diagrama.

## Uso

### Configuración por Diagrama

Puedes especificar una palabra personalizada para cada diagrama agregando la propiedad `counterWord` en la configuración del diagrama:

```javascript
{
  name: "Mi Diagrama",
  url: "data/mi-datos.csv",
  counterWord: "personas" // El contador mostrará "X personas"
}
```

### Configuración Global

También puedes establecer una palabra por defecto en las opciones globales:

```javascript
window.$xDiagrams = {
  // ... otras configuraciones
  options: {
    // ... otras opciones
    counterWord: "nodos" // Palabra por defecto para todos los diagramas
  }
}
```

### Prioridad de Configuración

1. **Diagrama específico**: Si un diagrama tiene `counterWord`, se usa esa palabra
2. **Configuración global**: Si no hay configuración específica, se usa la palabra de las opciones globales
3. **Valor por defecto**: Si no hay configuración, se usa "nodes"

## Ejemplos

### Diagrama de Personas
```javascript
{
  name: "Equipo de Trabajo",
  url: "data/equipo.csv",
  counterWord: "personas"
}
// Resultado: "15 personas"
```

### Diagrama de Empresas
```javascript
{
  name: "Directorio Empresarial",
  url: "data/empresas.csv",
  counterWord: "empresas"
}
// Resultado: "42 empresas"
```

### Diagrama de Productos
```javascript
{
  name: "Catálogo de Productos",
  url: "data/productos.csv",
  counterWord: "productos"
}
// Resultado: "128 productos"
```

### Diagrama de Secciones
```javascript
{
  name: "Mapa del Sitio",
  url: "data/sitemap.csv",
  counterWord: "secciones"
}
// Resultado: "25 secciones"
```

## Casos de Uso Comunes

- **Recursos Humanos**: "personas", "empleados", "colaboradores"
- **Empresarial**: "empresas", "compañías", "organizaciones"
- **Productos**: "productos", "artículos", "items"
- **Contenido**: "páginas", "secciones", "artículos"
- **Técnico**: "elementos", "componentes", "módulos"
- **Educativo**: "cursos", "lecciones", "módulos"

## Exclusión de Nodos

El contador excluye automáticamente los siguientes tipos de nodos:

- **Group**: Nodos que representan grupos o contenedores
- **Link**: Nodos que representan enlaces o conexiones

Esto asegura que el contador muestre solo los elementos relevantes para el usuario, excluyendo elementos estructurales del diagrama.

## Notas

- La palabra se actualiza automáticamente cuando cambias de diagrama
- La animación del contador se mantiene al cambiar la palabra
- Es compatible con todos los tipos de diagramas (árboles, clusters, grid, etc.)
- No afecta el rendimiento del diagrama
- **Exclusión automática**: Los nodos de tipo "Group" y "Link" se excluyen automáticamente del conteo 