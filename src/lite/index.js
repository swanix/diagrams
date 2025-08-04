// Variables globales
let globalTrees = [];
let globalContainer = null;
let renderStartTime = 0;

// Lista de íconos válidos de Material Icons
const validMaterialIcons = [
  'person', 'account_balance', 'computer', 'code', 'settings', 'star', 
  'manage_accounts', 'supervisor_account', 'campaign', 'point_of_sale', 
  'school', 'business', 'engineering', 'psychology', 'home', 'work',
  'favorite', 'thumb_up', 'thumb_down', 'check', 'close', 'add', 'remove',
  'edit', 'delete', 'search', 'menu', 'more_vert', 'more_horiz', 'refresh',
  'download', 'upload', 'share', 'link', 'visibility', 'visibility_off',
  'lock', 'unlock', 'security', 'warning', 'error', 'info', 'help',
  'notifications', 'email', 'phone', 'location_on', 'schedule', 'event',
  'calendar_today', 'today', 'access_time', 'timer', 'alarm', 'stopwatch',
  'folder', 'file_copy', 'description', 'article', 'book', 'library_books',
  'cloud', 'wifi', 'bluetooth', 'signal_cellular_4_bar', 'battery_full',
  'brightness_high', 'volume_up', 'mic', 'videocam', 'camera_alt',
  'image', 'photo', 'video_library', 'music_note', 'play_arrow', 'pause',
  'stop', 'fast_forward', 'rewind', 'skip_next', 'skip_previous',
  'shuffle', 'repeat', 'volume_down', 'volume_off', 'equalizer',
  'graphic_eq', 'trending_up', 'trending_down', 'analytics', 'assessment',
  'bar_chart', 'pie_chart', 'insert_chart', 'show_chart', 'multiline_chart',
  'bubble_chart', 'scatter_plot', 'timeline', 'timelapse', 'speed',
  'accessibility', 'accessibility_new', 'hearing', 'visibility',
  'visibility_off', 'voice_over_off', 'record_voice_over', 'translate',
  'language', 'g_translate', 'spellcheck', 'text_fields', 'title',
  'format_size', 'format_color_text', 'format_color_fill', 'format_align_left',
  'format_align_center', 'format_align_right', 'format_align_justify',
  'format_bold', 'format_italic', 'format_underline', 'format_strikethrough',
  'format_list_numbered', 'format_list_bulleted', 'format_indent_increase',
  'format_indent_decrease', 'format_quote', 'format_clear', 'format_paint',
  'format_color_reset', 'format_list_numbered_rtl', 'format_list_bulleted_rtl',
  'format_indent_increase_rtl', 'format_indent_decrease_rtl', 'format_quote_rtl',
  'format_clear_rtl', 'format_paint_rtl', 'format_color_reset_rtl'
];

// Función para validar si un ícono es válido
function isValidMaterialIcon(iconName) {
  return validMaterialIcons.includes(iconName);
}

// Función para construir la jerarquía
function buildHierarchy(data) {
  const nodeMap = new Map();
  const trees = [];
  
  // Primera pasada: crear todos los nodos
  data.forEach(row => {
    if (row.Name && row.Name.trim()) {
      const iconName = row.Img || 'person';
      const validIcon = isValidMaterialIcon(iconName) ? iconName : 'person';
      
      const node = {
        id: row.Node || row.Name,
        name: row.Name,
        parent: row.Parent || null,
        img: validIcon, // Usar ícono válido o 'person' por defecto
        data: row,
        children: []
      };
      nodeMap.set(node.id, node);
    }
  });
  
  // Segunda pasada: establecer relaciones padre-hijo
  nodeMap.forEach(node => {
    if (node.parent && nodeMap.has(node.parent)) {
      const parent = nodeMap.get(node.parent);
      parent.children.push(node);
    } else {
      trees.push(node);
    }
  });
  
  console.log(`Árboles encontrados: ${trees.length}`);
  trees.forEach((tree, i) => {
    console.log(`Árbol ${i + 1}: ${tree.name} (${countNodes(tree)} nodos)`);
  });
  
  return trees;
}

// Función para contar nodos en un árbol
function countNodes(node) {
  let count = 1;
  node.children.forEach(child => {
    count += countNodes(child);
  });
  return count;
}

// Función para calcular ancho de un árbol
function calculateTreeWidth(node) {
  if (node.children.length === 0) {
    return config.nodeWidth;
  }
  
  let totalWidth = 0;
  node.children.forEach(child => {
    totalWidth += calculateTreeWidth(child);
  });
  
  return Math.max(totalWidth, config.nodeWidth);
}

// Función para calcular altura de un árbol
function calculateTreeHeight(node) {
  if (node.children.length === 0) {
    return config.nodeHeight;
  }
  
  let maxChildHeight = 0;
  node.children.forEach(child => {
    maxChildHeight = Math.max(maxChildHeight, calculateTreeHeight(child));
  });
  
  return config.nodeHeight + config.spacing + maxChildHeight;
}

// Función para calcular límites de un cluster
function calculateClusterBounds(tree) {
  const treeWidth = calculateTreeWidth(tree);
  const treeHeight = calculateTreeHeight(tree);
  
  return {
    width: treeWidth + 40,
    height: treeHeight + 60
  };
}

// Función para obtener profundidad de un árbol
function getTreeDepth(node, depth = 0) {
  if (node.children.length === 0) {
    return depth;
  }
  
  let maxDepth = depth;
  node.children.forEach(child => {
    maxDepth = Math.max(maxDepth, getTreeDepth(child, depth + 1));
  });
  
  return maxDepth;
}

// Función principal de inicialización
async function initDiagram() {
  try {
    console.log('Iniciando diagrama...');
    
    // Crear contenedor SVG
    const svg = d3.select('#diagram');
    const container = svg.append('g');
    
    // Configurar zoom
    const zoom = d3.zoom()
      .scaleExtent([0.1, 5])
      .on('zoom', (event) => {
        container.attr('transform', event.transform);
        updateInfoPanel(event.transform);
      });
    
    svg.call(zoom);
    
    // Cargar datos
    const response = await fetch(config.url);
    const csvText = await response.text();
    
    Papa.parse(csvText, {
      header: true,
      complete: function(results) {
        console.log('Datos cargados:', results.data.length, 'filas');
        
        // Construir jerarquía
        const trees = buildHierarchy(results.data);
        
        // Guardar datos globales
        globalTrees = trees;
        globalContainer = container;
        
        // Medir tiempo de renderizado
        renderStartTime = performance.now();
        
        // Renderizar árboles
        renderTrees(trees, container);
      }
    });
    
  } catch (error) {
    console.error('Error cargando diagrama:', error);
  }
}

// Función para renderizar árboles
function renderTrees(trees, container) {
  console.log(`Renderizando ${trees.length} clusters con D3...`);
  
  // Calcular layout de clusters con configuración flexible por fila
  const treeLayouts = [];
  const treeSpacing = config.treeSpacing;
  const clusterGapX = config.clusterGapX; // Gap horizontal entre clusters
  const clusterGapY = config.clusterGapY; // Gap vertical entre filas
  
  // Parsear configuración de clusters por fila
  const clustersPerRowConfig = config.clustersPerRow.split(' ').map(num => parseInt(num));
  const defaultClustersPerRow = 7;
  
              // Primera pasada: calcular dimensiones de todos los clusters
      const clusterDimensions = [];
      trees.forEach((tree, index) => {
        // Calcular el ancho real del árbol usando el mismo algoritmo que renderTreeSimple
        const realTreeWidth = calculateTreeRealWidth(tree);
        const realTreeHeight = calculateTreeRealHeight(tree);
        
        console.log(`Árbol ${tree.name}: ancho real = ${realTreeWidth}, altura real = ${realTreeHeight}`);
        
        // Dimensiones del cluster con padding adecuado
        const clusterWidth = realTreeWidth + 80; // Más padding horizontal para centrar mejor
        const clusterHeight = Math.max(realTreeHeight, config.nodeHeight) + 140; // Más padding vertical (top y bottom)
        
        clusterDimensions.push({
          tree: tree,
          clusterWidth: clusterWidth,
          clusterHeight: clusterHeight,
          realTreeWidth: realTreeWidth,
          index: index
        });
      });
  
  // Calcular el ancho máximo de cada fila usando configuración flexible
  const rowMaxWidths = [];
  let currentIndex = 0;
  let row = 0;
  
  while (currentIndex < trees.length) {
    // Obtener número de clusters para esta fila
    const clustersForThisRow = clustersPerRowConfig[row] || defaultClustersPerRow;
    const endIndex = Math.min(currentIndex + clustersForThisRow, trees.length);
    const rowClusters = clusterDimensions.slice(currentIndex, endIndex);
    
    // Calcular ancho total de la fila actual
    const rowTotalWidth = rowClusters.reduce((sum, cluster) => sum + cluster.clusterWidth, 0) + 
                         (rowClusters.length - 1) * clusterGapX;
    rowMaxWidths.push(rowTotalWidth);
    console.log(`Fila ${row}: ${rowClusters.length} clusters, ancho total: ${rowTotalWidth}`);
    
    currentIndex = endIndex;
    row++;
  }
  
  const totalRows = row;
  
  // Encontrar el ancho máximo entre todas las filas
  const maxRowWidth = Math.max(...rowMaxWidths);
  console.log('Ancho máximo de fila:', maxRowWidth, 'Anchos de filas:', rowMaxWidths);
  
  // Segunda pasada: calcular posiciones con ancho uniforme usando configuración flexible
  let layoutIndex = 0;
  let layoutRow = 0;
  
  while (layoutIndex < clusterDimensions.length) {
    // Obtener número de clusters para esta fila
    const clustersForThisRow = clustersPerRowConfig[layoutRow] || defaultClustersPerRow;
    const endIndex = Math.min(layoutIndex + clustersForThisRow, clusterDimensions.length);
    const rowClusters = clusterDimensions.slice(layoutIndex, endIndex);
    
    // Calcular factor de escala para que esta fila tenga exactamente el ancho máximo
    const rowTotalWidth = rowClusters.reduce((sum, c) => sum + c.clusterWidth, 0) + 
                         (rowClusters.length - 1) * clusterGapX;
    
    console.log(`Fila ${layoutRow}: ${clustersForThisRow} clusters, ancho total: ${rowTotalWidth}, factor escala: ${maxRowWidth / rowTotalWidth}`);
    
    // Calcular factor de escala para ajustar el ancho
    const scaleFactor = maxRowWidth / rowTotalWidth;
    
    // Procesar cada cluster en esta fila
    rowClusters.forEach((cluster, col) => {
      const adjustedClusterWidth = Math.round(cluster.clusterWidth * scaleFactor);
      
      // Calcular posición X centrada
      const startX = (window.innerWidth - maxRowWidth) / 2;
      let x = startX;
      
      // Calcular posición X acumulando los anchos ajustados de los clusters anteriores en la fila
      for (let i = 0; i < col; i++) {
        const prevCluster = rowClusters[i];
        const prevAdjustedWidth = Math.round(prevCluster.clusterWidth * scaleFactor);
        x += prevAdjustedWidth + clusterGapX;
      }
      
      // Calcular posición Y
      const y = 30 + layoutRow * (cluster.clusterHeight + clusterGapY);
      
      treeLayouts.push({
        tree: cluster.tree,
        clusterWidth: adjustedClusterWidth,
        clusterHeight: cluster.clusterHeight,
        realTreeWidth: cluster.realTreeWidth,
        x: x,
        y: y,
        originalWidth: cluster.clusterWidth
      });
    });
    
    layoutIndex = endIndex;
    layoutRow++;
  }

  // Medir tiempo de renderizado si es la primera carga
  if (renderStartTime === 0) {
    renderStartTime = performance.now();
  }
  
  // Renderizar clusters
  treeLayouts.forEach((layout, index) => {
    const { tree, clusterWidth, clusterHeight, realTreeWidth, x, y } = layout;
    
    // Crear grupo del cluster
    const clusterGroup = container.append('g')
      .attr('class', 'cluster')
      .attr('transform', `translate(${x}, ${y})`);
    
    // Crear grupo para el árbol
    const treeGroup = clusterGroup.append('g')
      .attr('class', 'tree-group');
    
    // Fondo del cluster
    treeGroup.append('rect')
      .attr('class', 'cluster-bg')
      .attr('width', clusterWidth)
      .attr('height', clusterHeight)
      .attr('x', 0)
      .attr('y', 0);
    
    // Título del cluster en esquina superior izquierda
    treeGroup.append('text')
      .attr('class', 'cluster-title')
      .attr('x', 15) // Margen izquierdo
      .attr('y', 28) // Margen superior aumentado
      .text(tree.name);
    
    // Crear grupo para el árbol
    const treeContentGroup = treeGroup.append('g')
      .attr('class', 'tree-content');
    
    // Calcular posición del árbol dentro del cluster
    // Centrar el árbol horizontalmente en el cluster
    const treeX = (clusterWidth - realTreeWidth) / 2;
    const treeY = 60; // Margen superior para el título
    
    console.log(`Cluster ${tree.name}: ancho cluster = ${clusterWidth}, ancho árbol = ${realTreeWidth}, posición X = ${treeX}, centrado = ${treeX + realTreeWidth/2}`);
    
    // Renderizar árbol
    renderTreeSimple(tree, treeContentGroup, treeX, treeY);
  });
  
  // Actualizar panel de información
  const totalNodes = countTotalNodes(trees);
  updateInfoPanel({ k: 1, x: 0, y: 0 }, totalNodes, trees.length);
  
  // Medir tiempo de renderizado final
  const renderEndTime = performance.now();
  const renderTime = renderEndTime - renderStartTime;
  
  console.log('Layout completado. Grid: configuración flexible,', totalRows, 'filas');
  console.log('Dimensiones:', Math.round(maxRowWidth), 'px x', Math.round(totalRows * (clusterDimensions[0]?.clusterHeight + clusterGapY)), 'px');
  console.log('Total de nodos:', totalNodes);
  console.log('Nodos renderizados con SVG:', totalNodes);
  console.log('Tiempo de renderizado:', renderTime.toFixed(2) + 'ms');
}

// Función para renderizar árbol simple
function renderTreeSimple(node, container, x = 0, y = 0, level = 0) {
  const nodeWidth = config.nodeWidth;
  const nodeHeight = config.nodeHeight;
  const spacing = config.spacing;
  
  // Crear grupo para el nodo
  const nodeGroup = container.append('g')
    .attr('class', 'node')
    .attr('transform', `translate(${x}, ${y})`);
  
  // Rectángulo del nodo
  nodeGroup.append('rect')
    .attr('width', nodeWidth)
    .attr('height', nodeHeight);
  
  // Ícono del nodo (usando Material Icons)
  const iconName = node.img || 'person'; // Usar columna Img o 'person' por defecto
  nodeGroup.append('text')
    .attr('class', 'material-icons')
    .attr('x', nodeWidth / 2)
    .attr('y', nodeHeight / 2 - 15)
    .style('font-size', '64px')
    .style('fill', '#666')
    .text(iconName);
  
  // Texto principal
  nodeGroup.append('text')
    .attr('class', 'label-text')
    .attr('x', nodeWidth / 2)
    .attr('y', nodeHeight / 2 + 5)
    .text(node.name);
  
  // ID del nodo
  nodeGroup.append('text')
    .attr('class', 'label-id')
    .attr('x', nodeWidth / 2)
    .attr('y', nodeHeight / 2 + 20)
    .text(node.id);
  
  // Renderizar hijos
  if (node.children.length > 0) {
    const childY = y + nodeHeight + spacing;
    const totalChildWidth = node.children.length * (nodeWidth + spacing) - spacing;
    const startX = x - totalChildWidth / 2 + nodeWidth / 2;
    
    node.children.forEach((child, index) => {
      const childX = startX + index * (nodeWidth + spacing);
      
      // Línea de conexión
      const parentCenterX = x + nodeWidth/2;
      const parentBottomY = y + nodeHeight;
      const childCenterX = childX + nodeWidth/2;
      const childTopY = childY;
      const midY = (parentBottomY + childTopY) / 2;
      
      container.append('path')
        .attr('class', 'link')
        .attr('d', `M ${parentCenterX} ${parentBottomY} 
                    L ${parentCenterX} ${midY} 
                    L ${childCenterX} ${midY} 
                    L ${childCenterX} ${childTopY}`);
      
      // Renderizar hijo recursivamente
      renderTreeSimple(child, container, childX, childY, level + 1);
    });
  }
}

// Función para contar nodos totales
function countTotalNodes(trees) {
  let total = 0;
  function countNodesRecursive(node) {
    total++;
    node.children.forEach(child => countNodesRecursive(child));
  }
  trees.forEach(tree => countNodesRecursive(tree));
  return total;
}

// Función para calcular el ancho real de un árbol usando el mismo algoritmo que renderTreeSimple
function calculateTreeRealWidth(node) {
  if (node.children.length === 0) {
    return config.nodeWidth;
  }
  
  // Para árboles con hijos, el ancho real es el ancho total de los hijos más el espaciado
  // Esto es más simple y preciso que el cálculo recursivo complejo
  const totalChildWidth = node.children.length * config.nodeWidth + (node.children.length - 1) * config.spacing;
  
  // El ancho real es el máximo entre el nodo padre y el ancho total de los hijos
  return Math.max(config.nodeWidth, totalChildWidth);
}

// Función para calcular la altura real de un árbol usando el mismo algoritmo que renderTreeSimple
function calculateTreeRealHeight(node) {
  if (node.children.length === 0) {
    return config.nodeHeight;
  }
  
  // Calcular la altura máxima de los hijos
  let maxChildHeight = 0;
  node.children.forEach(child => {
    maxChildHeight = Math.max(maxChildHeight, calculateTreeRealHeight(child));
  });
  
  // La altura total es la altura del nodo actual + espaciado + altura máxima de los hijos
  return config.nodeHeight + config.spacing + maxChildHeight;
}

// Función para calcular los límites de un árbol usando el mismo layout que renderTreeSimple
function calculateTreeBounds(node) {
  let minX = 0, maxX = 0, minY = 0, maxY = 0;
  
  function traverseTree(n, x, y) {
    // Calcular límites del nodo actual
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x + config.nodeWidth);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y + config.nodeHeight);
    
    if (n.children.length > 0) {
      const childY = y + config.nodeHeight + config.spacing;
      const totalChildWidth = n.children.length * (config.nodeWidth + config.spacing) - config.spacing;
      const startX = x - totalChildWidth / 2 + config.nodeWidth / 2;
      
      n.children.forEach((child, index) => {
        const childX = startX + index * (config.nodeWidth + config.spacing);
        traverseTree(child, childX, childY);
      });
    }
  }
  
  traverseTree(node, 0, 0);
  
  // Asegurar que los límites sean al menos del tamaño de un nodo
  if (maxX - minX < config.nodeWidth) {
    maxX = minX + config.nodeWidth;
  }
  if (maxY - minY < config.nodeHeight) {
    maxY = minY + config.nodeHeight;
  }
  
  return { minX, maxX, minY, maxY };
}

// Función para actualizar el panel de información
function updateInfoPanel(transform = { k: 1, x: 0, y: 0 }, totalNodes = 0, totalClusters = 0) {
  const performanceInfo = document.getElementById('performance-info');
  const nodeCount = document.getElementById('node-count');
  const clusterCount = document.getElementById('cluster-count');
  const zoomLevel = document.getElementById('zoom-level');
  const translateX = document.getElementById('translate-x');
  const translateY = document.getElementById('translate-y');
  const renderType = document.getElementById('render-type');
  
  if (nodeCount) nodeCount.textContent = totalNodes;
  if (clusterCount) clusterCount.textContent = totalClusters;
  if (zoomLevel) zoomLevel.textContent = transform.k.toFixed(2) + 'x';
  if (translateX) translateX.textContent = Math.round(transform.x);
  if (translateY) translateY.textContent = Math.round(transform.y);
  if (renderType) renderType.textContent = 'SVG';
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  initDiagram();
}); 