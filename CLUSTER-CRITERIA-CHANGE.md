# Cambio en el Criterio de Creación de Clusters

## Resumen del Cambio

Se ha modificado el criterio para crear clusters en el sistema de diagramas. Anteriormente, cualquier nodo que no tenía padre se convertía automáticamente en un cluster. Ahora, solo los nodos con `Type: "Group"` se consideran como clusters. **Los nodos sin campo `Type` se agrupan automáticamente en un cluster de "almacenaje temporal".**

## Comportamiento Anterior

```javascript
// Criterio anterior: cualquier nodo sin padre era un cluster
if (!parent) {
  roots.push(node); // Todos los nodos sin padre se convertían en clusters
}
```

## Comportamiento Nuevo

```javascript
// Criterio nuevo: solo nodos con Type "Group" son clusters
if (!parent) {
  // Solo agregar a roots si el nodo tiene type "Group"
  if (type === "Group") {
    roots.push(node);
  }
}

// Segunda pasada: crear cluster de almacenaje temporal para nodos sin Type
const orphanedNodesWithoutType = [];
const orphanedNodesWithType = [];

nodeMap.forEach((node, id) => {
  if (!node.parent && !roots.includes(node)) {
    if (!node.type || node.type === "") {
      // Nodos sin Type van al cluster de almacenaje temporal
      orphanedNodesWithoutType.push(node);
    } else {
      // Nodos con Type pero sin padre van como nodos individuales
      orphanedNodesWithType.push(node);
    }
  }
});

// Crear cluster de almacenaje temporal si hay nodos sin Type
if (orphanedNodesWithoutType.length > 0) {
  const storageCluster = {
    id: "storage-cluster",
    name: "Nodos sin Type",
    subtitle: `Cluster de almacenaje temporal (${orphanedNodesWithoutType.length} nodos)`,
    type: "Group",
    children: orphanedNodesWithoutType,
    parent: "",
    originalData: { ID: "storage-cluster", Name: "Nodos sin Type", Type: "Group" }
  };
  roots.push(storageCluster);
}

// Agregar nodos con Type como nodos individuales
orphanedNodesWithType.forEach(node => {
  roots.push(node);
});
```

## Beneficios del Cambio

1. **Control Granular**: Ahora puedes controlar exactamente qué nodos se convierten en clusters usando el campo `Type`.

2. **Diagramas Planos Mejorados**: Los diagramas planos ya no generan automáticamente muchos clusters innecesarios.

3. **Forzar Uso del Campo Type**: Los nodos sin `Type` se agrupan automáticamente, incentivando el uso correcto del campo.

4. **Flexibilidad**: Puedes crear diagramas mixtos con algunos nodos como clusters y otros como nodos individuales.

5. **Organización Automática**: Los nodos sin tipo se organizan automáticamente en un cluster de almacenaje temporal.

## Ejemplo de Uso

### Archivo CSV de Ejemplo

```csv
ID,Parent,Name,Type,Subtitle
GRP1,,Departamento de Ventas,Group,Equipo de ventas
EMP1,GRP1,Juan Pérez,Employee,Vendedor senior
EMP2,GRP1,María García,Employee,Vendedora junior
GRP2,,Departamento de IT,Group,Equipo de tecnología
EMP3,GRP2,Carlos López,Developer,Desarrollador frontend
IND1,,Consultor Externo,Consultant,Consultor independiente
```

### Resultado

- **Clusters**: Solo "Departamento de Ventas" y "Departamento de IT" (tienen `Type: "Group"`)
- **Nodos Individuales**: "Consultor Externo" y "Freelancer" (tienen `Type` pero no padre)
- **Cluster de Almacenaje**: "Nodos sin Type" (contiene todos los nodos sin campo `Type`)
- **Nodos Hijos**: "Juan Pérez", "María García", "Carlos López", "Ana Martínez" (tienen padre)

## Casos de Uso

### 1. Diagrama Jerárquico con Clusters Específicos
```csv
ID,Parent,Name,Type
ROOT,,Organización,Group
DEPT1,ROOT,Ventas,Group
DEPT2,ROOT,IT,Group
EMP1,DEPT1,Empleado 1,Employee
EMP2,DEPT2,Empleado 2,Employee
```

### 2. Diagrama Plano con Algunos Clusters
```csv
ID,Parent,Name,Type
GRP1,,Equipo A,Group
GRP2,,Equipo B,Group
IND1,,Independiente 1,Contractor
IND2,,Independiente 2,Consultant
```

### 3. Diagrama Mixto
```csv
ID,Parent,Name,Type
GRP1,,Departamento,Group
EMP1,GRP1,Empleado,Employee
IND1,,Consultor,Consultant
GRP2,,Otro Depto,Group
EMP2,GRP2,Otro Emp,Employee
```

## Archivos de Prueba

Se han creado archivos de prueba para demostrar el nuevo comportamiento:

- `src/data/test-cluster-criteria.csv` - Demuestra clusters, nodos individuales y nodos sin Type
- `src/data/test-no-type-cluster.csv` - Enfocado en mostrar el cluster de almacenaje temporal

## Compatibilidad

- ❌ **Compatibilidad Rota**: Los diagramas existentes sin campo `Type` ahora se agrupan en un cluster de almacenaje temporal
- ✅ Diagramas con `Type: "Group"` crean clusters
- ✅ Nodos sin padre pero con otros tipos se muestran como nodos individuales
- ✅ Nodos con padre se comportan igual que antes
- ✅ Los nodos sin `Type` se organizan automáticamente en un cluster especial 