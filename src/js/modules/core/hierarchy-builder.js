/**
 * XDiagrams Hierarchy Builder Module
 * Maneja la construcción de jerarquías de datos
 */

class XDiagramsHierarchyBuilder {
  constructor() {}

  buildHierarchy(data) {
    const nodeMap = new Map();
    const rootNodes = [];
    
    // Función helper para obtener valor de columna
    const getColumnValue = (row, possibleNames, defaultValue = "") => {
      for (const name of possibleNames) {
        if (row[name] !== undefined && row[name] !== null && row[name] !== "") {
          return row[name];
        }
      }
      return defaultValue;
    };
    
    // Primera pasada: crear todos los nodos
    data.forEach((row, index) => {
      // Logging temporal para debug - solo los primeros 3 registros
      if (index < 3) {
        console.log(`XDiagrams: DEBUG - hierarchy-builder - Registro ${index}:`, row);
        console.log(`XDiagrams: DEBUG - hierarchy-builder - Claves del registro ${index}:`, Object.keys(row));
        console.log(`XDiagrams: DEBUG - hierarchy-builder - Technology:`, row.Technology);
        console.log(`XDiagrams: DEBUG - hierarchy-builder - Country:`, row.Country);
        console.log(`XDiagrams: DEBUG - hierarchy-builder - Responsive:`, row.Responsive);
      }
      
      const id = getColumnValue(row, ['ID', 'id', 'Node', 'node', 'Id'], null);
      const name = getColumnValue(row, ['Name', 'name', 'Title', 'title'], null);
      const parent = getColumnValue(row, ['Parent', 'parent', 'Manager', 'manager', 'Leader', 'leader'], null);
      const img = getColumnValue(row, ['Img', 'img', 'Icon', 'icon'], null);
      
      if (id && name && name.trim()) {
        const node = {
          id: id,
          name: name.trim(),
          parent: parent,
          img: img,
          layout: getColumnValue(row, ['Layout', 'layout'], null),
          data: row,
          children: []
        };
        
        // Logging temporal para debug - solo los primeros 3 nodos
        if (index < 3) {
          console.log(`XDiagrams: DEBUG - hierarchy-builder - Nodo creado ${index}:`, node);
          console.log(`XDiagrams: DEBUG - hierarchy-builder - Nodo.data ${index}:`, node.data);
        }
        
        nodeMap.set(id, node);
      }
    });
    
    // Segunda pasada: establecer relaciones padre-hijo
    nodeMap.forEach(node => {
      if (node.parent && nodeMap.has(node.parent)) {
        // Padre existe en el mapa
        nodeMap.get(node.parent).children.push(node);
      } else if (node.parent) {
        // Padre no existe, buscar por nombre
        const parentByName = Array.from(nodeMap.values()).find(n => 
          n.name === node.parent || n.id === node.parent
        );
        
        if (parentByName) {
          parentByName.children.push(node);
        } else {
          // Padre no encontrado, agregar como nodo raíz
          rootNodes.push(node);
        }
      } else {
        // Sin padre, es un nodo raíz
        rootNodes.push(node);
      }
    });
    
    return rootNodes;
  }
}

export { XDiagramsHierarchyBuilder }; 