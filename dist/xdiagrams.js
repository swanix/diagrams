// Swanix Diagrams - JS
// v0.5.0

// Global zoom behavior - defined at the beginning to avoid scope issues
const zoom = d3.zoom()
  .scaleExtent([0.09, 2.5]) // Limit zoom out to 9% of original size (more reasonable)
  .wheelDelta(event => -event.deltaY * 0.002) // Smoother wheel zoom
  .on("zoom", event => {
    const svgGroup = d3.select("#main-diagram-svg g");
    if (!svgGroup.empty()) {
      // Apply transform with better precision
      const transform = event.transform;
      svgGroup.attr("transform", `translate(${transform.x},${transform.y}) scale(${transform.k})`);
      
      // Check if we should activate cluster click mode
      checkAndActivateClusterClickMode(transform.k);
      
      // Force deselect cluster if zooming out significantly (but not during cluster zoom transitions)
      const threshold = window.$xDiagrams.clusterClickMode.threshold || 0.4;
      const deselectionThreshold = window.$xDiagrams.clusterClickMode.deselectionThreshold || 0.45;
      const isZoomingOutSignificantly = transform.k <= deselectionThreshold;
      const hasSelectedCluster = window.$xDiagrams.clusterClickMode.selectedCluster;
      
      // Only deselect if we're zooming out significantly AND we have a selected cluster AND we're not in the middle of a cluster zoom transition
      if (isZoomingOutSignificantly && hasSelectedCluster && !window.$xDiagrams.clusterClickMode.isZoomingToCluster) {
        console.log('[ClusterClickMode] Significant zoom out detected - deselecting cluster', {
          currentScale: transform.k,
          deselectionThreshold: deselectionThreshold,
          threshold: threshold
        });
        forceDeselectOnZoomOut();
      }
      
      // Update tooltip position if one is activ
      updateTooltipPositionDuringZoom();
    }
  });

// Function to format diagram name for display
window.formatDiagramName = function(name) {
  if (!name || typeof name !== 'string') {
    return name;
  }
  
  // Replace hyphens and underscores with spaces
  let formatted = name.replace(/[-_]/g, ' ');
  
  // Capitalize first letter of each word
  formatted = formatted.replace(/\b\w/g, (char) => char.toUpperCase());
  
  // Remove file extensions
  formatted = formatted.replace(/\.(csv|json|xml|txt)$/i, '');
  
  return formatted;
}

// ============================================================================
// DRAG & DROP FUNCTIONALITY
// ============================================================================

// Load saved diagrams from localStorage
function loadSavedDiagrams() {
  try {
    const saved = localStorage.getItem('xdiagrams-saved-files');
    if (saved) {
      const savedDiagrams = JSON.parse(saved);
      // Add saved diagrams to the configuration
      if (savedDiagrams && Array.isArray(savedDiagrams)) {
        savedDiagrams.forEach(diagram => {
          window.$xDiagrams.diagrams.push(diagram);
        });
      }
    }
  } catch (error) {
    console.warn('Error loading saved diagrams:', error);
  }
}

// Save diagram to localStorage
function saveDiagramToStorage(diagram) {
  try {
    const saved = localStorage.getItem('xdiagrams-saved-files');
    let savedDiagrams = saved ? JSON.parse(saved) : [];
    
    const exists = savedDiagrams.find(d => d.name === diagram.name);
    if (!exists) {
      savedDiagrams.push(diagram);
      localStorage.setItem('xdiagrams-saved-files', JSON.stringify(savedDiagrams));
    }
  } catch (error) {
    console.error('Error saving diagram to localStorage:', error);
  }
}

// Drag & Drop functionality moved to XDragDrop plugin
// See docs/xdragdrop.js for file processing functions

// Drag & Drop functionality moved to XDragDrop plugin
// See docs/xdragdrop.js for addAndLoadDiagram implementation

// Drag & Drop functionality moved to XDragDrop plugin
// See docs/xdragdrop.js for complete drag & drop implementation

// Function to show "Diagram not found" message with fade effect
window.showDiagramNotFound = function() {
  const svg = document.getElementById("main-diagram-svg");
  if (!svg) return;
  
  // Clear SVG
  svg.innerHTML = "";
  svg.style.opacity = '0';
  svg.classList.remove('loaded');
  
  // Remove existing overlay if any (immediate removal)
  const existingOverlay = document.getElementById('diagram-not-found-overlay');
  if (existingOverlay) {
    existingOverlay.style.transition = 'none';
    existingOverlay.remove();
  }
  
  // Create HTML overlay
  const overlay = document.createElement('div');
  overlay.id = 'diagram-not-found-overlay';
  overlay.textContent = 'Diagram not found';
  
  // Add overlay to the container
  const container = svg.parentElement;
  if (container) {
    container.style.position = 'relative';
    container.appendChild(overlay);
    
    // Animate the overlay with fade in effect
    setTimeout(() => {
      overlay.classList.add('visible');
    }, 100);
  }
}

// Main function to initialize diagram (now uses data source abstraction)
function initDiagram(source, onComplete, retryCount = 0, diagramConfig = null) {
        detectAndLoadDataSource(source, onComplete, retryCount, diagramConfig);
}

// Helper function to get column value case-insensitively
function getColumnValue(row, possibleNames, defaultValue = "") {
  for (let name of possibleNames) {
    if (row[name] !== undefined && row[name] !== null && row[name] !== "") {
      return row[name].toString().trim();
    }
  }
  return defaultValue;
}

// ============================================================================
// XDIAGRAMS CONFIGURATION SYSTEM
// ============================================================================

// Get configuration from window.$xDiagrams (modern style)
function getXDiagramsConfiguration() {
  return window.$xDiagrams || {};
}

// Get diagram options
function getDiagramOptions() {
  const config = getXDiagramsConfiguration();
  return config.options || {};
}

// Get hooks (callbacks)
function getHooks() {
  const config = getXDiagramsConfiguration();
  return config.hooks || {};
}

// Trigger a hook if it exists
function triggerHook(hookName, data) {
  const hooks = getHooks();
  if (hooks[hookName] && typeof hooks[hookName] === 'function') {
    try {
      hooks[hookName](data);
    } catch (error) {
      console.error(`Error in hook ${hookName}:`, error);
    }
  }
}

// Check if an option is enabled with sensible defaults
function isOptionEnabled(optionName) {
  const options = getDiagramOptions();
  
  // Define default values for each option
  const defaultOptions = {
    autoZoom: true,           // Auto-zoom enabled by default
    sidePanel: true,          // Side panel enabled by default
    keyboardNavigation: true, // Keyboard navigation enabled by default
    tooltips: true,           // Tooltips enabled by default
    responsive: true,         // Responsive design enabled by default
    dragAndDrop: true         // Drag & drop enabled by default
  };
  
  // If the option is explicitly set in the configuration, use that value
  if (options.hasOwnProperty(optionName)) {
    return options[optionName] === true;
  }
  
  // Otherwise, use the default value
  return defaultOptions[optionName] === true;
}

// Get layout configuration with sensible defaults
function getLayoutConfiguration(diagramConfig = null) {
  const options = getDiagramOptions();
  
  // Define default values for layout options
  const defaultLayout = {
    clustersPerRow: 7,        // Default: 7 clusters per row
    clustersTooltip: 'top',   // Default: tooltip position above cluster
    marginX: 50,              // Default: 50px left margin
    marginY: 50,              // Default: 50px top margin
    spacingX: 60,             // Default: 60px horizontal gap
    spacingY: 60,             // Default: 60px vertical gap
    wideClusterThreshold: 50, // Default: 50% threshold for wide cluster detection
    fullRowThreshold: 70,     // Default: 70% threshold for full row cluster detection
    lastRowThreshold: 50,     // Default: 50% threshold for last row width check
    lastRowAlignment: 'left'  // Default: 'left' alignment for last row when using original width
  };
  
  // Helper function to process clustersPerRow with multiple values
  function processClustersPerRow(value) {
    if (typeof value === 'string' && value.includes(' ')) {
      // Multiple values separated by spaces (CSS-like syntax)
      const values = value.trim().split(/\s+/).map(v => parseInt(v, 10)).filter(v => !isNaN(v));
      console.log(`[Layout] clustersPerRow con múltiples valores detectado: "${value}" -> [${values.join(', ')}]`);
      return values;
    } else if (typeof value === 'number') {
      // Single numeric value
      return [value];
    } else if (Array.isArray(value)) {
      // Already an array
      return value.map(v => parseInt(v, 10)).filter(v => !isNaN(v));
    }
    return [defaultLayout.clustersPerRow];
  }
  
  // Try diagram-specific configuration first
  if (diagramConfig && diagramConfig.layout) {
    const rawClustersPerRow = diagramConfig.layout.clustersPerRow || defaultLayout.clustersPerRow;
    const processedClustersPerRow = processClustersPerRow(rawClustersPerRow);
    
    return {
      clustersPerRow: processedClustersPerRow,
      clustersTooltip: diagramConfig.layout.clustersTooltip || defaultLayout.clustersTooltip,
      marginX: diagramConfig.layout.marginX || defaultLayout.marginX,
      marginY: diagramConfig.layout.marginY || defaultLayout.marginY,
      spacingX: diagramConfig.layout.spacingX || defaultLayout.spacingX,
      spacingY: diagramConfig.layout.spacingY || defaultLayout.spacingY,
      wideClusterThreshold: diagramConfig.layout.wideClusterThreshold || defaultLayout.wideClusterThreshold,
      fullRowThreshold: diagramConfig.layout.fullRowThreshold || defaultLayout.fullRowThreshold,
      lastRowThreshold: diagramConfig.layout.lastRowThreshold || defaultLayout.lastRowThreshold,
      lastRowAlignment: diagramConfig.layout.lastRowAlignment || defaultLayout.lastRowAlignment
    };
  }
  
  // Try global configuration second
  if (options.layout) {
    const rawClustersPerRow = options.layout.clustersPerRow || defaultLayout.clustersPerRow;
    const processedClustersPerRow = processClustersPerRow(rawClustersPerRow);
    
    return {
      clustersPerRow: processedClustersPerRow,
      clustersTooltip: options.layout.clustersTooltip || defaultLayout.clustersTooltip,
      marginX: options.layout.marginX || defaultLayout.marginX,
      marginY: options.layout.marginY || defaultLayout.marginY,
      spacingX: options.layout.spacingX || defaultLayout.spacingX,
      spacingY: options.layout.spacingY || defaultLayout.spacingY,
      wideClusterThreshold: options.layout.wideClusterThreshold || defaultLayout.wideClusterThreshold,
      fullRowThreshold: options.layout.fullRowThreshold || defaultLayout.fullRowThreshold,
      lastRowThreshold: options.layout.lastRowThreshold || defaultLayout.lastRowThreshold,
      lastRowAlignment: options.layout.lastRowAlignment || defaultLayout.lastRowAlignment
    };
  }
  
  // Return default layout with processed clustersPerRow
  return {
    clustersPerRow: [defaultLayout.clustersPerRow], // Convert to array for consistency
    clustersTooltip: defaultLayout.clustersTooltip,
    marginX: defaultLayout.marginX,
    marginY: defaultLayout.marginY,
    spacingX: defaultLayout.spacingX,
    spacingY: defaultLayout.spacingY,
    wideClusterThreshold: defaultLayout.wideClusterThreshold,
    fullRowThreshold: defaultLayout.fullRowThreshold,
    lastRowThreshold: defaultLayout.lastRowThreshold,
    lastRowAlignment: defaultLayout.lastRowAlignment
  };
}

// Get diagrams from modern configuration
function getDiagrams() {
  const config = getXDiagramsConfiguration();
  
  // Try modern configuration first
  if (config.diagrams && Array.isArray(config.diagrams)) {
    return config.diagrams;
  }
  
  // Fallback to legacy configuration
  return window.$xDiagrams?.diagrams || [];
}

// Get column configuration with modern style fallback
function getColumnConfiguration(diagramConfig = null) {
  const config = getXDiagramsConfiguration();
  
  // Try diagram-specific configuration first
  if (diagramConfig && diagramConfig.cols) {
    const columns = diagramConfig.cols;
    const columnConfig = {
      id: [columns.id || 'Node'],
      name: [columns.name || 'Name'],
      subtitle: [columns.subtitle || 'Description'],
      img: [columns.img || 'img'],
      parent: [columns.parent || 'Parent'],
      url: [columns.url || 'url'],
      type: [columns.type || 'Type']
    };

    // Add fallback names for each field
    columnConfig.id.push('node', 'Node', 'NODE', 'id', 'Id', 'ID');
    columnConfig.name.push('name', 'Name', 'NAME', 'title', 'Title', 'TITLE', 'section', 'Section', 'SECTION', 'project', 'Project', 'PROJECT', 'product', 'Product', 'PRODUCT');
    columnConfig.subtitle.push('subtitle', 'Subtitle', 'SUBTITLE', 'description', 'Description', 'DESCRIPTION', 'desc', 'Desc', 'DESC');
    columnConfig.img.push('img', 'Img', 'IMG', 'thumbnail', 'Thumbnail', 'THUMBNAIL', 'icon', 'Icon', 'ICON', 'image', 'Image', 'IMAGE', 'picture', 'Picture', 'PICTURE');
    columnConfig.parent.push('parent', 'Parent', 'PARENT');
    columnConfig.url.push('url', 'Url', 'URL', 'link', 'Link', 'LINK');
    columnConfig.type.push('type', 'Type', 'TYPE');

    return columnConfig;
  }
  
  // Try global configuration second
  if (config.columns) {
    const columns = config.columns;
    const columnConfig = {
      id: [columns.id || 'Node'],
      name: [columns.name || 'Name'],
      subtitle: [columns.subtitle || 'Description'],
      img: [columns.img || 'img'],
      parent: [columns.parent || 'Parent'],
      url: [columns.url || 'url'],
      type: [columns.type || 'Type']
    };

    // Add fallback names for each field
    columnConfig.id.push('node', 'Node', 'NODE', 'id', 'Id', 'ID');
    columnConfig.name.push('name', 'Name', 'NAME', 'title', 'Title', 'TITLE', 'section', 'Section', 'SECTION', 'project', 'Project', 'PROJECT', 'product', 'Product', 'PRODUCT');
    columnConfig.subtitle.push('subtitle', 'Subtitle', 'SUBTITLE', 'description', 'Description', 'DESCRIPTION', 'desc', 'Desc', 'DESC');
    columnConfig.img.push('img', 'Img', 'IMG', 'thumbnail', 'Thumbnail', 'THUMBNAIL', 'icon', 'Icon', 'ICON', 'image', 'Image', 'IMAGE', 'picture', 'Picture', 'PICTURE');
    columnConfig.parent.push('parent', 'Parent', 'PARENT');
    columnConfig.url.push('url', 'Url', 'URL', 'link', 'Link', 'LINK');
    columnConfig.type.push('type', 'Type', 'TYPE');

    return columnConfig;
  }
  
  // Fallback to legacy configuration
  return getColumnConfigurationLegacy();
}

// Legacy column configuration (for backward compatibility)
function getColumnConfigurationLegacy() {
  const container = document.querySelector('.xcanvas');
  if (!container) {
    // Fallback to default configuration
    return {
      id: ['node', 'Node', 'NODE', 'id', 'Id', 'ID'],
      name: ['name', 'Name', 'NAME', 'title', 'Title', 'TITLE'],
      subtitle: ['subtitle', 'Subtitle', 'SUBTITLE', 'description', 'Description', 'DESCRIPTION', 'desc', 'Desc', 'DESC'],
      img: ['img', 'Img', 'IMG', 'thumbnail', 'Thumbnail', 'THUMBNAIL', 'icon', 'Icon', 'ICON'],
      parent: ['parent', 'Parent', 'PARENT'],
      url: ['url', 'Url', 'URL', 'link', 'Link', 'LINK'],
      type: ['type', 'Type', 'TYPE']
    };
  }

  // Try to get JSON configuration first
  const jsonConfig = container.getAttribute('data-columns');
  if (jsonConfig) {
    try {
      const customConfig = JSON.parse(jsonConfig);
      const config = {
        id: [customConfig.id || 'Node'],
        name: [customConfig.name || 'Name'],
        subtitle: [customConfig.subtitle || 'Description'],
        img: [customConfig.img || 'img'],
        parent: [customConfig.parent || 'Parent'],
        url: [customConfig.url || 'url'],
        type: [customConfig.type || 'Type']
      };

      // Add fallback names for each field
      config.id.push('node', 'Node', 'NODE', 'id', 'Id', 'ID');
      config.name.push('name', 'Name', 'NAME', 'title', 'Title', 'TITLE', 'section', 'Section', 'SECTION', 'project', 'Project', 'PROJECT', 'product', 'Product', 'PRODUCT');
      config.subtitle.push('subtitle', 'Subtitle', 'SUBTITLE', 'description', 'Description', 'DESCRIPTION', 'desc', 'Desc', 'DESC');
      config.img.push('img', 'Img', 'IMG', 'thumbnail', 'Thumbnail', 'THUMBNAIL', 'icon', 'Icon', 'ICON', 'image', 'Image', 'IMAGE', 'picture', 'Picture', 'PICTURE');
      config.parent.push('parent', 'Parent', 'PARENT');
      config.url.push('url', 'Url', 'URL', 'link', 'Link', 'LINK');
      config.type.push('type', 'Type', 'TYPE');

      return config;
    } catch (error) {
      console.warn('Error parsing data-columns JSON:', error);
    }
  }

  // Fallback to individual attributes
  const config = {
    id: [container.getAttribute('data-column-id') || 'Node'],
    name: [container.getAttribute('data-column-name') || 'Name'],
    subtitle: [container.getAttribute('data-column-subtitle') || 'Description'],
    img: [container.getAttribute('data-column-img') || 'img'],
    parent: [container.getAttribute('data-column-parent') || 'Parent'],
    url: [container.getAttribute('data-column-url') || 'url'],
    type: [container.getAttribute('data-column-type') || 'Type']
  };

  // Add fallback names for each field
  config.id.push('node', 'Node', 'NODE', 'id', 'Id', 'ID');
  config.name.push('name', 'Name', 'NAME', 'title', 'Title', 'TITLE', 'section', 'Section', 'SECTION', 'project', 'Project', 'PROJECT', 'product', 'Product', 'PRODUCT');
  config.subtitle.push('subtitle', 'Subtitle', 'SUBTITLE', 'description', 'Description', 'DESCRIPTION', 'desc', 'Desc', 'DESC');
  config.img.push('img', 'Img', 'IMG', 'thumbnail', 'Thumbnail', 'THUMBNAIL', 'icon', 'Icon', 'ICON', 'image', 'Image', 'IMAGE', 'picture', 'Picture', 'PICTURE');
  config.parent.push('parent', 'Parent', 'PARENT');
  config.url.push('url', 'Url', 'URL', 'link', 'Link', 'LINK');
  config.type.push('type', 'Type', 'TYPE');

  return config;
}

// Build simplified hierarchies
function buildHierarchies(data, diagramConfig = null) {
  let roots = [];
  let nodeMap = new Map();
  let autoIdCounter = 1;
  
  // Get column configuration (with diagram-specific config if available)
  const columnConfig = getColumnConfiguration(diagramConfig);

  data.forEach(d => {
    // Skip completely empty rows
    const isEmptyRow = Object.values(d).every(value => 
      value === undefined || value === null || value === "" || value.toString().trim() === ""
    );
    
    if (isEmptyRow) {
      return; // Skip this row
    }
    
    // Use custom column configuration with fallbacks
    let id = getColumnValue(d, columnConfig.id, "");
    let name = getColumnValue(d, columnConfig.name, "Nodo sin nombre");
    // Reemplazar secuencias \n o \r\n por saltos de línea reales
    name = name.replace(/\\n|\r\n/g, "\n");
    let subtitle = getColumnValue(d, columnConfig.subtitle, "");
    let img = getColumnValue(d, columnConfig.img, "");
    let parent = getColumnValue(d, columnConfig.parent, "");
    let url = getColumnValue(d, columnConfig.url, "");
    let type = getColumnValue(d, columnConfig.type, "");



    // Generate auto ID if not provided or empty
    if (!id || id.trim() === "") {
      id = `id-${autoIdCounter.toString().padStart(2, '0')}`;
      autoIdCounter++;
    }

    // Skip nodes without essential data (name is the only truly required field)
    if (!name || name.trim() === "") {
      return; // Skip this row
    }

    let node = { 
      id, 
      name, 
      subtitle, 
      img, 
      url, 
      type, 
      children: [], 
      parent: parent,
      originalData: d // Preserve original CSV data
    };
    nodeMap.set(id, node);

    if (parent && nodeMap.has(parent)) {
      nodeMap.get(parent).children.push(node);
    } else if (!parent) {
      // Solo agregar a roots si el nodo tiene type "Group"
      if (type === "Group") {
        roots.push(node);
      }
    }
  });

  // Segunda pasada: crear cluster de almacenaje temporal para nodos sin Type
  const orphanedNodesWithoutType = [];
  const orphanedNodesWithType = [];
  
  nodeMap.forEach((node, id) => {
    // Verificar si el nodo no tiene padre y no está ya en roots
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

  return roots;
}

// Detect if data is a flat list (no hierarchy)
function isFlatList(trees) {
  // If there's only one root and it has no children, it's a flat list
  if (trees.length === 1 && (!trees[0].children || trees[0].children.length === 0)) {
    return true;
  }
  
  // If there are multiple roots and none have children, it's also a flat list
  if (trees.length > 1 && trees.every(tree => !tree.children || tree.children.length === 0)) {
    return true;
  }
  
  return false;
}

// Detect if data has multiple clusters that should be arranged in grid
function shouldUseClusterGrid(trees) {
  // If there are multiple root clusters, arrange them in grid
  if (trees.length > 1) {
    return true;
  }
  
  return false;
}

// Draw grid layout for flat lists
function drawGridLayout(nodes, svg) {
  const g = d3.select(svg).append("g");
  
  // Get viewport dimensions
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
  // Grid configuration
  const nodeWidth = 120;  // Width of each node
  const nodeHeight = 80;  // Height of each node
  const nodeSpacingX = 40; // Horizontal spacing between nodes
  const nodeSpacingY = 40; // Vertical spacing between nodes
  const marginX = 50;     // Left/right margin
  const marginY = 50;     // Top/bottom margin
  
  // Calculate how many nodes fit per row
  const availableWidth = viewportWidth - (2 * marginX);
  const nodesPerRow = Math.floor(availableWidth / (nodeWidth + nodeSpacingX));
  
  // Calculate positions for each node
  const positionedNodes = nodes.map((node, index) => {
    const row = Math.floor(index / nodesPerRow);
    const col = index % nodesPerRow;
    
    const x = marginX + (col * (nodeWidth + nodeSpacingX)) + (nodeWidth / 2);
    const y = marginY + (row * (nodeHeight + nodeSpacingY)) + (nodeHeight / 2);
    
    return {
      ...node,
      x: x,
      y: y,
      row: row,
      col: col
    };
  });
  
  // Render nodes in grid
  const nodeGroups = g.selectAll(".node")
    .data(positionedNodes)
    .enter().append("g")
    .attr("class", "node node-clickable")
    .attr("data-id", d => d.id)
    .attr("transform", d => `translate(${d.x},${d.y})`)
    .on("click", function(event, d) {
      event.stopPropagation();
      
      // Prevent zoom behavior interference
      event.preventDefault();
      
      // Check if zoom level allows node selection (prevent selection when zoom <= 0.35)
      const currentZoom = window.$xDiagrams.currentZoom ? window.$xDiagrams.currentZoom.k : 1;
      if (currentZoom <= 0.35) {
        console.log('[NodeClick] Node selection blocked - zoom level too low:', currentZoom);
        return; // Exit early without processing the click
      }
      
      // Check if cluster click mode is active and auto-select cluster if needed
      if (window.$xDiagrams.clusterClickMode.active) {
        const nodeElement = this;
        const clusterInfo = findClusterForNode(nodeElement);
        if (clusterInfo) {
          const currentSelectedCluster = window.$xDiagrams.clusterClickMode.selectedCluster;
          const isCurrentlySelected = currentSelectedCluster && currentSelectedCluster.id === clusterInfo.id;
          
          // Check if we're in a zoomed-in state (zoom > 0.25) and the node belongs to the currently selected cluster
          const svg = document.getElementById("main-diagram-svg");
          const currentTransform = svg ? d3.zoomTransform(svg) : null;
          const isZoomedIn = currentTransform && currentTransform.k > 0.25;
          
          if (!isCurrentlySelected) {
            console.log('[ClusterClickMode] Auto-selecting cluster for node click:', clusterInfo.id);
            
            // Deselect current cluster if any
            if (currentSelectedCluster) {
              deselectCurrentCluster('node-click-selection');
            }
            
            // Select the new cluster
            window.$xDiagrams.clusterClickMode.selectedCluster = clusterInfo;
            
            // Apply visual selection styles
            const rect = clusterInfo.rect;
            if (rect && rect.node()) {
              rect
                .attr("data-selected", "true")
                .style("fill", "var(--cluster-selected-bg, rgba(255, 152, 0, 0.25))")
                .style("stroke", "var(--cluster-selected-stroke, #ff9800)")
                .style("stroke-width", "4")
                .style("stroke-dasharray", "none")
                .style("box-shadow", "0 0 8px rgba(255, 152, 0, 0.3)");
              
              // Disable hover on selected cluster
              rect.on("mouseenter", null).on("mouseleave", null);
            }
            
            // Zoom to the cluster
            zoomToCluster(clusterInfo);
          } else if (isZoomedIn) {
            // If we're zoomed in and clicking on a node of the already selected cluster,
            // keep the cluster selected and don't deselect it
            console.log('[ClusterClickMode] Keeping cluster selected during zoomed interaction:', clusterInfo.id);
          }
        }
      }
      
      // Enable keyboard navigation when a node is clicked (only if enabled)
      if (isOptionEnabled('keyboardNavigation') && window.$xDiagrams.keyboardNavigation) {
        window.$xDiagrams.keyboardNavigation.enable();
        
        // Find the index of this node in the global data
        const nodeIndex = window.$xDiagrams.currentData.findIndex(item => item.id === d.id);
        if (nodeIndex !== -1) {
          window.$xDiagrams.keyboardNavigation.currentNodeIndex = nodeIndex;
          window.$xDiagrams.keyboardNavigation.selectNode(nodeIndex);
        }
      }
      
      // Open side panel only if enabled
      if (isOptionEnabled('sidePanel') !== false && window.openSidePanel) {
        window.openSidePanel(d);
      }
    });

  // Node rectangle
  nodeGroups.append("rect")
    .style("stroke-width", "var(--node-bg-stroke, 2)")
    .attr("x", -nodeWidth/2)
    .attr("y", -nodeHeight/2)
    .attr("width", nodeWidth)
    .attr("height", nodeHeight);

  // Node image with enhanced loading
  nodeGroups.each(function(d) {
    const nodeGroup = d3.select(this);
    const imageUrl = resolveNodeImage(d);
    
    // Usar la función apropiada según el tipo de imagen
    if (isEmbeddedThumbnailUrl(imageUrl)) {
      // Para thumbnails embebidos, crear SVG directo
      const svgString = getEmbeddedThumbnailSvgString(imageUrl);
      if (svgString) {
        const svgElement = createEmbeddedSVGElement(svgString, "image-base", {
          x: -15,
          y: -25,
          width: 30,
          height: 30
        });
        if (svgElement) {
          nodeGroup.node().appendChild(svgElement);
        }
      }
    } else {
      // Para imágenes no embebidas, usar elemento image tradicional
      const imageElement = nodeGroup.append("image")
        .attr("href", "img/transparent.svg")
        .attr("data-src", imageUrl)
        .attr("x", -15)
        .attr("y", -25)
        .attr("class", "image-base")
        .attr("width", 30)
        .attr("height", 30)
        .attr("crossorigin", "anonymous") // Intentar resolver problemas de CORS
        .on("load", function() {
          const element = d3.select(this);
          const dataSrc = element.attr("data-src");
          
          if (dataSrc && element.attr("href") === "img/transparent.svg") {
            // Cambiar a la imagen real
            element.attr("href", dataSrc);
          } else {
            // Image loaded successfully
            element.classed("loaded", true);
          }
          // Solo aplicar el filtro si es necesario
          console.log(`[Image Load] Checking if should apply filter to: ${dataSrc}`);
          const shouldApply = shouldApplyFilter(dataSrc);
          console.log(`[Image Load] Should apply filter: ${shouldApply}`);
          if (shouldApply) {
            element.classed("image-filter", true);
            console.log(`[Image Load] Applied image-filter class to: ${dataSrc}`);
          } else {
            console.log(`[Image Load] NOT applying image-filter class to external image: ${dataSrc}`);
          }
        })
        .on("error", function() {
          const element = d3.select(this);
          const currentSrc = element.attr("href");
          const dataSrc = element.attr("data-src");
          
          console.log(`[Image Load] Error detected - currentSrc: ${currentSrc}, dataSrc: ${dataSrc}`);
          
          // Si tenemos una URL real en data-src y es diferente de la actual, intentar usarla
          if (dataSrc && dataSrc !== currentSrc && !dataSrc.includes('data:image/svg+xml')) {
            console.log(`[Image Load] Retrying with real URL from data-src: ${dataSrc}`);
            element.attr("href", dataSrc);
            return; // Intentar cargar la URL real
          }
          
          // Si ya intentamos cargar la URL real y falló, crear fallback embebido
          console.log(`[Image Load] Creating embedded fallback for failed image`);
          createEmbeddedFallback(d, nodeGroup, element);
        });
    }
  });

  // Node text
  const textGroup = nodeGroups.append("g").attr("class", "text-group");
  
  // Node name (centered)
  const nameText = textGroup.append("text")
    .attr("class", "label-text")
    .attr("x", 0)
    .attr("y", 15)
    .attr("text-anchor", "middle")
    .style("font-size", "12px")
    .text(d => d.name);

  // Apply text wrapping for grid layout
  wrap(nameText, nodeWidth - 10);
  
    }

  // Draw clusters in masonry-like grid layout
  function drawClusterGrid(trees, svg, diagramConfig = null) {
  const g = d3.select(svg).append("g");
  const clusterGroups = [];
  
  // Calcular la profundidad máxima de cada árbol ANTES de renderizar
  const isFlat = isFlatList(trees);
  let treeDepths = null;
  let maxDepth = 0;
  
  if (!isFlat) {
    treeDepths = trees.map(tree => getMaxTreeDepth(tree));
    maxDepth = Math.max(...treeDepths);
    

    
    // Encontrar el árbol con más niveles para usar como referencia
    const treeWithMaxDepth = trees.find((tree, index) => {
      return treeDepths[index] === maxDepth;
    });
    
  }
  
  // Paso 1: Renderizar cada cluster en posición temporal para medir su tamaño real
  trees.forEach((tree, index) => {
    try {
      const themeVars = getComputedStyle(document.documentElement);
      const treeVertical = parseFloat(themeVars.getPropertyValue('--tree-vertical-spacing')) || 100;
      const treeHorizontal = parseFloat(themeVars.getPropertyValue('--tree-horizontal-spacing')) || 180;
      const clusterPaddingX = parseFloat(themeVars.getPropertyValue('--cluster-padding-x')) || 220;
      const clusterPaddingY = parseFloat(themeVars.getPropertyValue('--cluster-padding-y')) || 220;
      
      const root = d3.hierarchy(tree);
      const treeLayout = d3.tree().nodeSize([treeVertical, treeHorizontal]);
      treeLayout(root);
      
      // Render en posición temporal (x=0, y=index*1000) - será movido a posición final después
      const treeGroup = g.append("g")
        .attr("class", "diagram-group")
        .attr("data-root-id", root.data.id)
        .attr("transform", `translate(0, ${index * 1000})`)
        .style("opacity", 0); // Inicialmente invisible para fade in
      
      const contentGroup = treeGroup.append("g").attr("class", "cluster-content");

      // Render links
      contentGroup.selectAll(".link")
        .data(root.links())
        .enter().append("path")
        .attr("class", "link")
        .attr("d", d => {
          // Ajustar coordenadas para que los links se conecten al centro del rectángulo del nodo
          const nodeOffsetX = parseFloat(themeVars.getPropertyValue('--node-bg-x')) || -42;
          const nodeWidth = parseFloat(themeVars.getPropertyValue('--node-bg-width')) || 60;
          const nodeCenterX = nodeOffsetX + (nodeWidth / 2);
          
          const sourceX = d.source.x + nodeCenterX;
          const targetX = d.target.x + nodeCenterX;
          
          return `M ${sourceX} ${d.source.y} V ${(d.source.y + d.target.y) / 2} H ${targetX} V ${d.target.y}`;
        });
      
      // Render nodes
      const node = contentGroup.selectAll(".node")
        .data(root.descendants())
        .enter().append("g")
        .attr("class", "node node-clickable")
        .attr("data-id", d => d.data.id)
        .attr("transform", d => `translate(${d.x},${d.y})`)
        .on("click", function(event, d) {
          event.stopPropagation();
          
          // Prevent zoom behavior interference
          event.preventDefault();
          
          // Check if zoom level allows node selection (prevent selection when zoom <= 0.35)
          const currentZoom = window.$xDiagrams.currentZoom ? window.$xDiagrams.currentZoom.k : 1;
          if (currentZoom <= 0.35) {
            console.log('[NodeClick] Node selection blocked - zoom level too low:', currentZoom);
            return; // Exit early without processing the click
          }
          
          // Check if cluster click mode is active and auto-select cluster if needed
          if (window.$xDiagrams.clusterClickMode.active) {
            const nodeElement = this;
            const clusterInfo = findClusterForNode(nodeElement);
            if (clusterInfo) {
              const currentSelectedCluster = window.$xDiagrams.clusterClickMode.selectedCluster;
              const isCurrentlySelected = currentSelectedCluster && currentSelectedCluster.id === clusterInfo.id;
              
              if (!isCurrentlySelected) {
                console.log('[ClusterClickMode] Auto-selecting cluster for node click:', clusterInfo.id);
                
                // Deselect current cluster if any
                if (currentSelectedCluster) {
                  deselectCurrentCluster('node-click-selection');
                }
                
                // Select the new cluster
                window.$xDiagrams.clusterClickMode.selectedCluster = clusterInfo;
                
                // Apply visual selection styles
                const rect = clusterInfo.rect;
                if (rect && rect.node()) {
                  rect
                    .attr("data-selected", "true")
                    .style("fill", "var(--cluster-selected-bg, rgba(255, 152, 0, 0.25))")
                    .style("stroke", "var(--cluster-selected-stroke, #ff9800)")
                    .style("stroke-width", "4")
                    .style("stroke-dasharray", "none")
                    .style("box-shadow", "0 0 8px rgba(255, 152, 0, 0.3)");
                  
                  // Disable hover on selected cluster
                  rect.on("mouseenter", null).on("mouseleave", null);
                }
                
                // Zoom to the cluster
                zoomToCluster(clusterInfo);
              }
            }
          }
          
          if (isOptionEnabled('keyboardNavigation') && window.$xDiagrams.keyboardNavigation) {
            window.$xDiagrams.keyboardNavigation.enable();
            const nodeIndex = window.$xDiagrams.currentData.findIndex(item => item.id === d.data.id);
            if (nodeIndex !== -1) {
              window.$xDiagrams.keyboardNavigation.currentNodeIndex = nodeIndex;
              window.$xDiagrams.keyboardNavigation.selectNode(nodeIndex);
            }
          }
          if (isOptionEnabled('sidePanel') !== false && window.openSidePanel) {
            window.openSidePanel(d.data);
          }
        });
      
      node.append("rect")
        .style("stroke-width", "var(--node-bg-stroke, 2)")
        .attr("x", parseFloat(themeVars.getPropertyValue('--node-bg-x')) || -30)
        .attr("y", parseFloat(themeVars.getPropertyValue('--node-bg-y')) || -20)
        .attr("width", parseFloat(themeVars.getPropertyValue('--node-bg-width')) || 60)
        .attr("height", parseFloat(themeVars.getPropertyValue('--node-bg-height')) || 40);
      
      // Node image with enhanced loading
      node.each(function(d) {
        const nodeSel = d3.select(this);
        const imageUrl = resolveNodeImage(d);
        
        // Usar la función apropiada según el tipo de imagen
        if (isEmbeddedThumbnailUrl(imageUrl)) {
          // Para thumbnails embebidos, crear SVG directo
          const svgString = getEmbeddedThumbnailSvgString(imageUrl);
          if (svgString) {
            const svgElement = createEmbeddedSVGElement(svgString, "image-base", {
              x: parseFloat(themeVars.getPropertyValue('--image-x')),
              y: parseFloat(themeVars.getPropertyValue('--image-y')),
              width: parseFloat(themeVars.getPropertyValue('--image-width')),
              height: parseFloat(themeVars.getPropertyValue('--image-height'))
            });
            if (svgElement) {
              nodeSel.node().appendChild(svgElement);
            }
          }
        } else {
          // Para imágenes no embebidas, usar elemento image tradicional
          const imageElement = nodeSel.append("image")
            .attr("href", "img/transparent.svg")
            .attr("data-src", imageUrl)
            .attr("x", parseFloat(themeVars.getPropertyValue('--image-x')))
            .attr("y", parseFloat(themeVars.getPropertyValue('--image-y')))
            .attr("class", "image-base")
            .attr("width", parseFloat(themeVars.getPropertyValue('--image-width')))
            .attr("height", parseFloat(themeVars.getPropertyValue('--image-height')))
            .on("load", function() {
              const element = d3.select(this);
              const dataSrc = element.attr("data-src");
              
              if (dataSrc && element.attr("href") === "img/transparent.svg") {
                // Cambiar a la imagen real
                element.attr("href", dataSrc);
              }
              // Marcar cargada
              element.classed("loaded", true);
              // Solo aplicar el filtro si es necesario
              console.log(`[Image Load] Checking if should apply filter to: ${dataSrc}`);
              const shouldApply = shouldApplyFilter(dataSrc);
              console.log(`[Image Load] Should apply filter: ${shouldApply}`);
              if (shouldApply) {
                element.classed("image-filter", true);
                console.log(`[Image Load] Applied image-filter class to: ${dataSrc}`);
              } else {
                console.log(`[Image Load] NOT applying image-filter class to external image: ${dataSrc}`);
              }
            })
            .on("error", function() {
              const element = d3.select(this);
              const currentSrc = element.attr("href");
              const dataSrc = element.attr("data-src");
              
              console.log(`[Image Load] Error detected - currentSrc: ${currentSrc}, dataSrc: ${dataSrc}`);
              
              // Si tenemos una URL real en data-src y es diferente de la actual, intentar usarla
              if (dataSrc && dataSrc !== currentSrc && !dataSrc.includes('data:image/svg+xml')) {
                console.log(`[Image Load] Retrying with real URL from data-src: ${dataSrc}`);
                element.attr("href", dataSrc);
                return; // Intentar cargar la URL real
              }
              
              // Si ya intentamos cargar la URL real y falló, crear fallback embebido
              console.log(`[Image Load] Creating embedded fallback for failed image`);
              createEmbeddedFallback(d, nodeSel, element);
            });
        }
      });
      
      const textGroup = node.append("g").attr("class", "text-group");
      textGroup.append("text")
        .attr("class", "label-id")
        .attr("x", d => {
          const baseX = parseFloat(themeVars.getPropertyValue('--label-id-x'));
          // Si el nodo no tiene padre, centrarlo horizontalmente con el nodo
          if (!d.parent) {
            const nodeOffsetX = parseFloat(themeVars.getPropertyValue('--node-bg-x')) || -42;
            const nodeWidth = parseFloat(themeVars.getPropertyValue('--node-bg-width')) || 60;
            return nodeOffsetX + (nodeWidth / 2);
          }
          return baseX;
        })
        .attr("y", parseFloat(themeVars.getPropertyValue('--label-id-y')))
        .attr("dy", themeVars.getPropertyValue('--label-id-dy'))
        .attr("text-anchor", d => {
          const baseAnchor = themeVars.getPropertyValue('--label-id-anchor');
          // Si el nodo no tiene padre, usar centrado automático
          return d.parent ? baseAnchor : "middle";
        })
        .style("font-size", themeVars.getPropertyValue('--label-id-font-size'))
        .style("fill", themeVars.getPropertyValue('--label-id-text-color'))
        .text(d => d.data.id);
      
      const nameText = textGroup.append("text")
        .attr("class", "label-text")
        .attr("x", parseFloat(themeVars.getPropertyValue('--label-x')))
        .attr("y", parseFloat(themeVars.getPropertyValue('--label-y')))
        .attr("dy", parseFloat(themeVars.getPropertyValue('--label-dy')))
        .style("font-size", themeVars.getPropertyValue('--label-font-size'))
        .text(d => d.data.name);
      
      const maxWidth = parseFloat(themeVars.getPropertyValue('--label-max-width')) || 68;
      wrap(nameText, maxWidth);
      
      textGroup.append("text")
        .attr("class", "subtitle-text")
        .attr("transform", "rotate(270)")
        .attr("x", parseFloat(themeVars.getPropertyValue('--subtitle-x')))
        .attr("y", parseFloat(themeVars.getPropertyValue('--subtitle-y')))
        .attr("text-anchor", themeVars.getPropertyValue('--subtitle-anchor'))
        .style("font-size", themeVars.getPropertyValue('--subtitle-font-size'))
        .style("fill", themeVars.getPropertyValue('--text-subtitle-color'))
        .text(d => {
          const subtitleText = d.data.subtitle || "";
          const maxSubtitleChars = 35;
          if (subtitleText.length > maxSubtitleChars) {
            return subtitleText.substring(0, maxSubtitleChars) + "...";
          }
          return subtitleText;
        });
      
      // Medir el tamaño real del cluster después de renderizarlo
      setTimeout(() => {
        const bounds = treeGroup.node().getBBox();
        const clusterHeight = bounds.height + 2 * clusterPaddingY;
        
        clusterGroups.push({
          group: treeGroup,
          width: bounds.width + 2 * clusterPaddingX,
          height: clusterHeight,
          innerWidth: bounds.width,
          innerHeight: bounds.height,
          paddingX: clusterPaddingX,
          paddingY: clusterPaddingY,
          id: root.data.id,
          name: root.data.name,
          index: index,
          treeDepth: treeDepths ? treeDepths[index] : null
        });
        
        if (clusterGroups.length === trees.length) {
          // Paso 2: Calcular altura uniforme basada en el cluster con más niveles
          let uniformHeight = null;
          
          if (!isFlat && treeDepths) {
            // Comprobar si hay variación en la profundidad (niveles)
            const minDepth = Math.min(...treeDepths);
            const depthVariation = maxDepth !== minDepth;
            
            if (depthVariation) {
              // Tomar como referencia cualquier cluster cuyo árbol tenga la profundidad máxima
              const clusterWithMaxDepth = clusterGroups.find((cluster, idx) => treeDepths[idx] === maxDepth);
              if (clusterWithMaxDepth) {
                uniformHeight = clusterWithMaxDepth.height;
              }
            }
          }
          
          // Paso 3: Implementar layout tipo Masonry
          applyMasonryLayout(clusterGroups, g, trees, uniformHeight, diagramConfig);
        }
      }, 0);
      
    } catch (err) {
      console.error(`Error al renderizar cluster ${index + 1}:`, err);
    }
  });
}

// Función para calcular la profundidad máxima de un árbol
function getMaxTreeDepth(node) {
  if (!node.children || node.children.length === 0) {
    return 1; // Nodo hoja
  }
  
  let maxDepth = 1;
  for (const child of node.children) {
    const childDepth = getMaxTreeDepth(child);
    maxDepth = Math.max(maxDepth, childDepth + 1);
  }
  
  return maxDepth;
}



// Función simplificada para aplicar layout de clusters
function applyMasonryLayout(clusterGroups, container, originalTrees, preCalculatedUniformHeight = null, diagramConfig = null) {
  // Obtener configuración de layout desde las opciones
  const layoutConfig = getLayoutConfiguration(diagramConfig);
  const marginX = layoutConfig.marginX;
  const marginY = layoutConfig.marginY;
  const spacingX = layoutConfig.spacingX;
  const spacingY = layoutConfig.spacingY;
  const clustersPerRowArray = layoutConfig.clustersPerRow;
  
  // Helper function to get clusters per row for a specific row
  function getClustersPerRowForRow(rowIndex) {
    if (Array.isArray(clustersPerRowArray) && clustersPerRowArray.length > 0) {
      // If we have explicit values defined and this row is within the defined range
      if (rowIndex < clustersPerRowArray.length) {
        console.log(`[Layout] Fila ${rowIndex}: Usando valor explícito de ${clustersPerRowArray[rowIndex]} columnas`);
        return clustersPerRowArray[rowIndex];
      } else {
        // For rows beyond the defined values, return null to trigger automatic logic
        console.log(`[Layout] Fila ${rowIndex}: Sin valor explícito definido, aplicando lógica automática`);
        return null;
      }
    }
    // No explicit values defined, return null to trigger automatic logic
    console.log(`[Layout] Fila ${rowIndex}: Sin valores explícitos, aplicando lógica automática`);
    return null;
  }
  
  // Get the default clusters per row for initial calculations
  const defaultClustersPerRow = getClustersPerRowForRow(0);
  
  console.log(`[Layout] Configuración de layout:`, layoutConfig);
  console.log(`[Layout] clustersPerRow array:`, clustersPerRowArray);
  console.log(`[Layout] clustersPerRow por defecto:`, defaultClustersPerRow);
  
  // Si solo hay un cluster, centrarlo
  if (clusterGroups.length === 1) {
    const cluster = clusterGroups[0];
    const x = window.innerWidth / 2;
    const y = window.innerHeight / 2;
    cluster.group.attr("transform", `translate(${x},${y})`);
    const isFlat = isFlatList(originalTrees);
    addClusterBackground(cluster, isFlat);
    return;
  }
  
  // Detectar si es un diagrama plano
  const isFlat = isFlatList(originalTrees);
  
  // Ajustar lógica de altura uniforme
  let uniformHeight = null;
  if (!isFlat && preCalculatedUniformHeight !== null) {
    uniformHeight = preCalculatedUniformHeight;
  }
  
  // PASO 1: Aplicar fondos a todos los clusters primero para medir el área real
  clusterGroups.forEach((cluster, index) => {
    if (isFlat) {
      addClusterBackground(cluster, isFlat);
    } else {
      if (uniformHeight !== null) {
        addClusterBackgroundWithUniformHeight(cluster, uniformHeight, isFlat);
      } else {
        addClusterBackground(cluster, isFlat);
      }
    }
  });
  
  // PASO 2: Esperar a que todos los clusters se carguen completamente antes de calcular posiciones
  const waitForAllClustersToLoad = () => {
    // Verificar si todas las imágenes están cargadas
    const allImages = document.querySelectorAll('.image-base');
    const loadedImages = Array.from(allImages).filter(img => img.classList.contains('loaded'));
    
    console.log(`[Layout] Imágenes cargadas: ${loadedImages.length}/${allImages.length}`);
    
    if (loadedImages.length === allImages.length && allImages.length > 0) {
      // Todas las imágenes están cargadas, proceder con el layout
      applyFinalLayout();
    } else if (allImages.length === 0) {
      // No hay imágenes, proceder inmediatamente
      applyFinalLayout();
    } else {
      // Esperar más tiempo para que se carguen las imágenes restantes
      setTimeout(waitForAllClustersToLoad, 100);
    }
  };
  
  const applyFinalLayout = () => {
    console.log(`[Layout] Aplicando layout final después de carga completa`);
    
    // PASO 3: Medir el área real de cada cluster después de la carga completa
    const clusterRealSizes = clusterGroups.map(cluster => {
      const diagramGroup = cluster.group.node();
      const originalTransform = diagramGroup.getAttribute("transform");
      diagramGroup.removeAttribute("transform");
      
      const clusterRect = diagramGroup.querySelector('.cluster-rect');
      let realWidth, realHeight, rectBounds;
      
      if (clusterRect) {
        rectBounds = clusterRect.getBBox();
        realWidth = rectBounds.width;
        realHeight = rectBounds.height;
        console.log(`[Layout] Diagram-group ${cluster.id}: usando cluster-rect, w=${realWidth.toFixed(1)}, h=${realHeight.toFixed(1)}`);
      } else {
        rectBounds = diagramGroup.getBBox();
        realWidth = rectBounds.width;
        realHeight = rectBounds.height;
        console.log(`[Layout] Diagram-group ${cluster.id}: usando diagram-group, w=${realWidth.toFixed(1)}, h=${realHeight.toFixed(1)}`);
      }
      
      if (originalTransform) {
        diagramGroup.setAttribute("transform", originalTransform);
      }
      
      return {
        cluster: cluster,
        realWidth: realWidth,
        realHeight: realHeight,
        realX: 0,
        realY: 0,
        diagramGroup: diagramGroup,
        clusterRect: clusterRect,
        rectBounds: rectBounds 
      };
    });
    
    // PASO 4: Aplicar lógica de ajuste automático de columnas basado en el ancho de clusters
    const initialTotalRows = Math.ceil(clusterGroups.length / defaultClustersPerRow);
    const adjustedClustersPerRow = [];
    
    console.log(`[Layout] Iniciando análisis de ${initialTotalRows} filas iniciales con ${clusterGroups.length} clusters totales`);
    
    // Calcular el número de columnas por fila con la nueva lógica
    for (let row = 0; row < initialTotalRows; row++) {
      const clustersPerRowForThisRow = getClustersPerRowForRow(row);
      
      // Si tenemos un valor explícito definido para esta fila, usarlo con prioridad total
      if (clustersPerRowForThisRow !== null) {
        const startIndex = row * clustersPerRowForThisRow;
        const endIndex = Math.min(startIndex + clustersPerRowForThisRow, clusterGroups.length);
        const clustersInRow = clusterRealSizes.slice(startIndex, endIndex);
        
        console.log(`[Layout] Analizando fila ${row}: ${clustersInRow.length} clusters (índices ${startIndex}-${endIndex-1}), usando valor explícito de ${clustersPerRowForThisRow} columnas`);
        
        adjustedClustersPerRow[row] = clustersPerRowForThisRow;
        console.log(`[Layout] Fila ${row}: Usando valor explícito de ${clustersPerRowForThisRow} columnas (prioridad total)`);
        continue;
      }
      
      // Si no hay valor explícito para esta fila, aplicar lógica automática
      // Usar el valor por defecto para calcular los índices iniciales
      const defaultClustersForThisRow = defaultClustersPerRow;
      const startIndex = row * defaultClustersForThisRow;
      const endIndex = Math.min(startIndex + defaultClustersForThisRow, clusterGroups.length);
      const clustersInRow = clusterRealSizes.slice(startIndex, endIndex);
      
      console.log(`[Layout] Analizando fila ${row}: ${clustersInRow.length} clusters (índices ${startIndex}-${endIndex-1}), aplicando lógica automática`);
      
      // Si es la primera fila, usar el número de columnas configurado
      if (row === 0) {
        adjustedClustersPerRow[row] = clustersInRow.length;
        console.log(`[Layout] Fila ${row}: Primera fila, usando ${clustersInRow.length} columnas`);
        continue;
      }
      
      // Para filas 2, 3 y 4, verificar si algún cluster supera el 50% del ancho de la fila anterior
      const previousRowClustersPerRow = getClustersPerRowForRow(row - 1);
      const previousRowStartIndex = Math.max(0, (row - 1) * previousRowClustersPerRow);
      const previousRowEndIndex = Math.min(previousRowStartIndex + previousRowClustersPerRow, clusterGroups.length);
      const previousRowClusters = clusterRealSizes.slice(previousRowStartIndex, previousRowEndIndex);
      
      // Calcular el ancho total de la fila anterior
      const previousRowWidth = previousRowClusters.reduce((sum, c) => sum + c.realWidth, 0) + 
                              (previousRowClusters.length > 1 ? (previousRowClusters.length - 1) * spacingX : 0);
      
      console.log(`[Layout] Fila ${row}: Ancho de fila anterior = ${previousRowWidth.toFixed(1)}px`);
      
      // Verificar si algún cluster de la fila actual supera el umbral del 70% del ancho de la fila anterior
      const fullRowClusters = clustersInRow.filter(cluster => {
        const clusterWidthPercentage = (cluster.realWidth / previousRowWidth) * 100;
        const isFullRow = clusterWidthPercentage > layoutConfig.fullRowThreshold;
        if (isFullRow) {
          console.log(`[Layout] Fila ${row}: Cluster ${cluster.cluster.id} requiere fila completa (${clusterWidthPercentage.toFixed(1)}% > ${layoutConfig.fullRowThreshold}%)`);
        }
        return isFullRow;
      });
      
      const hasFullRowCluster = fullRowClusters.length > 0;
      
      if (hasFullRowCluster) {
        // Si hay un cluster que supera el 70%, este ocupa toda la fila (1 columna)
        adjustedClustersPerRow[row] = 1;
        console.log(`[Layout] Fila ${row}: Cluster de fila completa detectado (>${layoutConfig.fullRowThreshold}% de fila anterior), ajustando a 1 columna`);
      } else {
        // Verificar si algún cluster supera el umbral de cluster ancho (50% por defecto)
        const wideClusters = clustersInRow.filter(cluster => {
          const clusterWidthPercentage = (cluster.realWidth / previousRowWidth) * 100;
          const isWide = clusterWidthPercentage > layoutConfig.wideClusterThreshold;
          if (isWide) {
            console.log(`[Layout] Fila ${row}: Cluster ${cluster.cluster.id} es ancho (${clusterWidthPercentage.toFixed(1)}% > ${layoutConfig.wideClusterThreshold}%)`);
          }
          return isWide;
        });
        
        const hasWideCluster = wideClusters.length > 0;
        
        if (hasWideCluster && clustersInRow.length > 2) {
          // Si hay un cluster ancho y hay más de 2 clusters, limitar a 2 columnas
          adjustedClustersPerRow[row] = 2;
          console.log(`[Layout] Fila ${row}: Cluster ancho detectado (>${layoutConfig.wideClusterThreshold}% de fila anterior), ajustando a 2 columnas`);
        } else {
          // Usar el número normal de columnas
          adjustedClustersPerRow[row] = clustersInRow.length;
          console.log(`[Layout] Fila ${row}: Sin clusters anchos, usando ${clustersInRow.length} columnas`);
        }
      }
    }
    
    // PASO 5: Recalcular las filas con el nuevo número de columnas ajustado
    const recalculatedRows = [];
    let currentIndex = 0;
    
    // Primero, crear una lista plana de todos los clusters que necesitamos distribuir
    const allClusters = [...clusterRealSizes];
    
    console.log(`[Layout] Iniciando redistribución de ${allClusters.length} clusters`);
    console.log(`[Layout] Configuración de columnas por fila:`, adjustedClustersPerRow);
    
    for (let row = 0; row < initialTotalRows; row++) {
      const maxClustersInThisRow = adjustedClustersPerRow[row];
      const clustersInThisRow = [];
      
      console.log(`[Layout] Procesando fila ${row}: asignando ${maxClustersInThisRow} clusters (índice actual: ${currentIndex})`);
      
      // Tomar los clusters necesarios para esta fila
      for (let i = 0; i < maxClustersInThisRow && currentIndex < allClusters.length; i++) {
        clustersInThisRow.push(allClusters[currentIndex]);
        console.log(`[Layout] Fila ${row}: agregando cluster ${allClusters[currentIndex].cluster.id} (índice ${currentIndex})`);
        currentIndex++;
      }
      
      recalculatedRows.push(clustersInThisRow);
      console.log(`[Layout] Fila ${row} completada: ${clustersInThisRow.length} clusters`);
    }
    
    // Si quedan clusters sin asignar, crear filas adicionales
    let additionalRowCount = 0;
    while (currentIndex < allClusters.length) {
      const remainingClusters = allClusters.slice(currentIndex);
      const additionalRowIndex = recalculatedRows.length;
      const clustersPerRowForAdditionalRow = getClustersPerRowForRow(additionalRowIndex);
      
      // Si no hay valor explícito para esta fila adicional, usar el valor por defecto
      const clustersToUse = clustersPerRowForAdditionalRow !== null ? clustersPerRowForAdditionalRow : defaultClustersPerRow;
      const clustersForNewRow = remainingClusters.slice(0, clustersToUse);
      
      console.log(`[Layout] Creando fila adicional ${additionalRowCount}: ${clustersForNewRow.length} clusters restantes (índice ${currentIndex}), usando ${clustersToUse} columnas ${clustersPerRowForAdditionalRow !== null ? '(valor explícito)' : '(lógica automática)'}`);
      
      recalculatedRows.push(clustersForNewRow);
      currentIndex += clustersForNewRow.length;
      additionalRowCount++;
    }
    
    console.log(`[Layout] Distribución final: ${recalculatedRows.length} filas, ${allClusters.length} clusters totales`);
    recalculatedRows.forEach((row, index) => {
      const clusterIds = row.map(c => c.cluster.id).join(', ');
      console.log(`[Layout] Fila ${index}: ${row.length} clusters [${clusterIds}]`);
    });
    
    // PASO 6: Calcular altura uniforme por fila basándose en el cluster más alto
    const rowHeights = [];
    
    for (let row = 0; row < recalculatedRows.length; row++) {
      const clustersInRow = recalculatedRows[row];
      if (clustersInRow.length > 0) {
        const maxHeightInRow = Math.max(...clustersInRow.map(c => c.realHeight));
        rowHeights[row] = maxHeightInRow;
        console.log(`[Layout] Fila ${row}: ${clustersInRow.length} clusters, altura máxima: ${maxHeightInRow}`);
      }
    }
    
    // PASO 7: Calcular y aplicar posiciones finales con el nuevo layout
    const rowWidths = [];
    for (let row = 0; row < recalculatedRows.length; row++) {
      const clustersInRow = recalculatedRows[row];
      if (clustersInRow.length > 0) {
        const totalWidth = clustersInRow.reduce((sum, c) => sum + c.realWidth, 0) + 
                          (clustersInRow.length > 1 ? (clustersInRow.length - 1) * spacingX : 0);
        rowWidths[row] = totalWidth;
      }
    }
    const maxWidth = Math.max(...rowWidths);

    for (let row = 0; row < recalculatedRows.length; row++) {
      const clustersInRow = recalculatedRows[row];
      if (clustersInRow.length === 0) continue;
      
      const currentWidth = rowWidths[row];
      const widthDifference = maxWidth - currentWidth;
      
      // Verificar si es la última fila y si sus clusters suman menos del umbral configurado de la fila anterior
      let shouldUseOriginalWidth = false;
      if (row > 0 && row === recalculatedRows.length - 1) {
        const previousRow = recalculatedRows[row - 1];
        if (previousRow.length > 0) {
          const previousRowWidth = previousRow.reduce((sum, c) => sum + c.realWidth, 0) + 
                                  (previousRow.length > 1 ? (previousRow.length - 1) * spacingX : 0);
          const currentRowPercentage = (currentWidth / previousRowWidth) * 100;
          
          if (currentRowPercentage < layoutConfig.lastRowThreshold) {
            shouldUseOriginalWidth = true;
            console.log(`[Layout] Última fila ${row}: ancho total ${currentWidth.toFixed(1)}px (${currentRowPercentage.toFixed(1)}% de fila anterior), usando ancho original sin expandir`);
          } else {
            console.log(`[Layout] Última fila ${row}: ancho total ${currentWidth.toFixed(1)}px (${currentRowPercentage.toFixed(1)}% de fila anterior), expandiendo para llenar ancho disponible`);
          }
        }
      }
      
      let extraWidthPerCluster = 0;
      if (widthDifference > 0 && clustersInRow.length > 0 && !shouldUseOriginalWidth) {
        extraWidthPerCluster = widthDifference / clustersInRow.length;
      }

      let currentX = marginX;
      
      // Si es la última fila y debe usar ancho original, aplicar alineación configurada
      if (shouldUseOriginalWidth) {
        const totalRowWidth = clustersInRow.reduce((sum, c) => sum + c.realWidth, 0) + 
                             (clustersInRow.length > 1 ? (clustersInRow.length - 1) * spacingX : 0);
        
        if (layoutConfig.lastRowAlignment === 'center') {
          // Centrar la fila
          currentX = marginX + (maxWidth - totalRowWidth) / 2;
          console.log(`[Layout] Última fila centrada: ancho total ${totalRowWidth.toFixed(1)}px, posición X inicial ${currentX.toFixed(1)}px`);
        } else {
          // Alinear a la izquierda (currentX ya está en marginX)
          console.log(`[Layout] Última fila alineada a la izquierda: ancho total ${totalRowWidth.toFixed(1)}px, posición X inicial ${currentX.toFixed(1)}px`);
        }
      }
      
      clustersInRow.forEach((clusterData, colIndex) => {
        const { realWidth, realHeight, rectBounds, clusterRect } = clusterData;

        const newWidth = realWidth + extraWidthPerCluster;
        if (clusterRect) {
          clusterRect.setAttribute('width', newWidth);
        }

        const contentGroup = clusterData.cluster.group.select('.cluster-content');
        if (contentGroup && extraWidthPerCluster > 0) {
          contentGroup.attr('transform', `translate(${extraWidthPerCluster / 2}, 0)`);
        }

        const tx = currentX - rectBounds.x;
        
        let rowTopY = marginY;
        for (let r = 0; r < row; r++) {
          rowTopY += rowHeights[r] + spacingY;
        }
        const rowCenterY = rowTopY + rowHeights[row] / 2;
        const rectCenterY_relative = rectBounds.y + realHeight / 2;
        const ty = rowCenterY - rectCenterY_relative;

        // Aplicar fade in elegante con ligero movimiento hacia arriba
        const finalTransform = `translate(${tx},${ty})`;
        const initialTransform = `translate(${tx},${ty + 20})`; // 20px hacia arriba
        
        // Aplicar posición inicial ligeramente desplazada
        clusterData.cluster.group.attr("transform", initialTransform);
        
        // Animar a posición final con fade in y delay escalonado
        const delay = (row * 200) + (colIndex * 100); // 200ms entre filas, 100ms entre clusters
        clusterData.cluster.group.transition()
          .delay(delay)
          .duration(800)
          .ease(d3.easeCubicOut)
          .attr("transform", finalTransform)
          .style("opacity", 1);

        // Almacenar las posiciones absolutas finales para verificación
        clusterData.realX = tx + rectBounds.x; // Debería ser igual a currentX
        clusterData.realY = ty + rectBounds.y;
        
        currentX += newWidth + spacingX;
      });
    }
    
    console.log(`[Layout] Aplicado layout final con altura uniforme por fila: ${clusterGroups.length} clusters, ${recalculatedRows.length} filas (ajuste automático de columnas aplicado)`);
    
    // Verificación final de gaps horizontal y vertical
    console.log(`[Layout] === VERIFICACIÓN FINAL DE GAPS HORIZONTAL Y VERTICAL ===`);
    
    // Verificar gaps horizontales
    for (let row = 0; row < recalculatedRows.length; row++) {
      const clustersInRow = recalculatedRows[row];
      
      console.log(`[Layout] --- Fila ${row} (${clustersInRow.length} clusters) ---`);
      
      for (let i = 0; i < clustersInRow.length - 1; i++) {
        const current = clustersInRow[i];
        const next = clustersInRow[i + 1];
        
        // El borde derecho es la posición X de inicio + ancho
        const currentRightEdge = current.realX + current.realWidth;
        const nextLeftEdge = next.realX;
        
        const actualGap = nextLeftEdge - currentRightEdge;
        const expectedGap = spacingX;
        const gapDiff = Math.abs(actualGap - expectedGap);
        const status = gapDiff < 5 ? '✅' : '❌';
        
        console.log(`${status} Gap horizontal ${i}→${i+1}: ${actualGap.toFixed(1)}px (esperado: ${expectedGap}px, diff: ${gapDiff.toFixed(1)}px)`);
        console.log(`  Cluster ${i}: ancho=${current.realWidth.toFixed(1)}px, fin=${currentRightEdge.toFixed(1)}px`);
        console.log(`  Cluster ${i+1}: ancho=${next.realWidth.toFixed(1)}px, inicio=${nextLeftEdge.toFixed(1)}px`);
      }
    }
    
    // Verificar gaps verticales entre filas
    console.log(`[Layout] --- GAPS VERTICALES ENTRE FILAS ---`);
    for (let row = 0; row < recalculatedRows.length - 1; row++) {
      const clustersInCurrentRow = recalculatedRows[row];
      const clustersInNextRow = recalculatedRows[row + 1];

      if (clustersInCurrentRow.length > 0 && clustersInNextRow.length > 0) {
        // Encontrar el borde inferior más bajo de la fila actual
        const maxBottomEdge = Math.max(...clustersInCurrentRow.map(c => c.realY + c.realHeight));
        // Encontrar el borde superior más alto de la fila siguiente
        const minTopEdge = Math.min(...clustersInNextRow.map(c => c.realY));
        
        const actualVerticalGap = minTopEdge - maxBottomEdge;
        const expectedVerticalGap = spacingY;
        const verticalGapDiff = Math.abs(actualVerticalGap - expectedVerticalGap);
        const verticalStatus = verticalGapDiff < 5 ? '✅' : '❌';
        
        console.log(`${verticalStatus} Gap vertical fila ${row}→${row+1}: ${actualVerticalGap.toFixed(1)}px (esperado: ${expectedVerticalGap}px, diff: ${verticalGapDiff.toFixed(1)}px)`);
        console.log(`  Fila ${row}: borde_inferior=${maxBottomEdge.toFixed(1)}px`);
        console.log(`  Fila ${row+1}: borde_superior=${minTopEdge.toFixed(1)}px`);
      }
    }
    
    // Disparar hook de layout completado
    if (window.$xDiagrams && window.$xDiagrams.hooks && window.$xDiagrams.hooks.onLayoutComplete) {
      window.$xDiagrams.hooks.onLayoutComplete();
    }
  };
  
  // Iniciar el proceso de espera
  waitForAllClustersToLoad();
}

// Función auxiliar para agregar fondo y título al cluster
function addClusterBackground(cluster, isFlat = false) {
  const bounds = cluster.group.node().getBBox();
  const paddingX = cluster.paddingX || 80;
  const paddingY = cluster.paddingY || 80;
  const minX = bounds.x - paddingX;
  const minY = bounds.y - paddingY - 30;
  const width = bounds.width + 2 * paddingX;
  const height = bounds.height + 2 * paddingY;
  
  // Fondo del cluster
  cluster.group.insert("rect", ":first-child")
    .attr("class", "cluster-rect")
    .attr("x", minX)
    .attr("y", minY)
    .attr("width", width)
    .attr("height", height)
    .attr("rx", 18)
    .attr("ry", 18)
    .style("fill", "var(--cluster-bg, rgba(0,0,0,0.02))")
    .style("stroke", "var(--cluster-stroke, #222)")
    .style("stroke-width", 2)
    .style("stroke-dasharray", "6,4");
  
  // Crear título del cluster con contenedor
  createClusterTitle(cluster, minX, minY, isFlat);
    
  // Add data-root-id attribute to cluster group for cluster click mode
  if (cluster.id) {
    cluster.group.attr("data-root-id", cluster.id);
  }
}

// Función auxiliar para crear el título del cluster con contenedor
function createClusterTitle(cluster, minX, minY, isFlat = false) {
  const clusterTitle = isFlat ? (cluster.name || cluster.id) : cluster.id;
  
  // Crear contenedor para el título con fondo
  const titleGroup = cluster.group.append("g")
    .attr("class", "cluster-title-container");
  
  // Agregar rectángulo de fondo con estilo por defecto
  titleGroup.append("rect")
    .attr("class", "cluster-title-bg")
    .attr("rx", 12)
    .attr("ry", 12);
  
  // Agregar texto del título
  titleGroup.append("text")
    .attr("class", "cluster-title")
    .attr("x", minX + 45)
    .attr("y", minY + 70)
    .attr("text-anchor", "start")
    .style("font-size", "2.25em")
    .style("font-weight", "bold")
    .style("fill", "var(--cluster-title-color, #222)")
    .text(clusterTitle);
    
  // Ajustar el fondo al tamaño del texto
  const textElement = titleGroup.select('.cluster-title');
  const textBounds = textElement.node().getBBox();
  const paddingVertical = 12;
  const paddingHorizontal = 20;
  
  titleGroup.select('.cluster-title-bg')
    .attr("x", textBounds.x - paddingHorizontal)
    .attr("y", textBounds.y - paddingVertical)
    .attr("width", textBounds.width + (paddingHorizontal * 2))
    .attr("height", textBounds.height + (paddingVertical * 2));
    
  return titleGroup;
}

// Función auxiliar para agregar fondo con altura uniforme
function addClusterBackgroundWithUniformHeight(cluster, uniformHeight, isFlat = false) {
  const bounds = cluster.group.node().getBBox();
  const paddingX = cluster.paddingX || 80;
  const paddingY = cluster.paddingY || 80;
  const minX = bounds.x - paddingX;
  const minY = bounds.y - paddingY - 30;
  const width = bounds.width + 2 * paddingX;
  
  // Usar la altura uniforme tal cual (sin reducción adicional)
  const height = uniformHeight;
  
  // Fondo del cluster con altura uniforme reducida
  cluster.group.insert("rect", ":first-child")
    .attr("class", "cluster-rect")
    .attr("x", minX)
    .attr("y", minY)
    .attr("width", width)
    .attr("height", height)
    .attr("rx", 18)
    .attr("ry", 18)
    .style("fill", "var(--cluster-bg, rgba(0,0,0,0.02))")
    .style("stroke", "var(--cluster-stroke, #222)")
    .style("stroke-width", 2)
    .style("stroke-dasharray", "6,4");
  
  // Crear título del cluster con contenedor
  createClusterTitle(cluster, minX, minY, isFlat);
    
  // Add data-root-id attribute to cluster group for cluster click mode
  if (cluster.id) {
    cluster.group.attr("data-root-id", cluster.id);
  }
}

// Draw simplified trees
function drawTrees(trees, diagramConfig = null) {
  const svg = document.getElementById("main-diagram-svg");
  if (!svg) {
    console.error("No se encontró el SVG principal");
    return;
  }
  
  // Remove diagram not found overlay if present
  const overlay = document.getElementById('diagram-not-found-overlay');
  if (overlay) {
    overlay.remove();
  }
  
  // Clear SVG and hide it during rendering
  svg.innerHTML = "";
  svg.style.opacity = '0';
  svg.classList.remove('loaded');
  
  // Store all node data globally for keyboard navigation
  window.$xDiagrams.currentData = [];
  trees.forEach(tree => {
    const collectNodes = (node) => {
      window.$xDiagrams.currentData.push(node);
      if (node.children) {
        node.children.forEach(collectNodes);
      }
    };
    collectNodes(tree);
  });
    
  // Check layout type and choose appropriate rendering method
  if (isFlatList(trees)) {
    drawClusterGrid(trees, svg, diagramConfig);
  } else if (shouldUseClusterGrid(trees)) {
    drawClusterGrid(trees, svg, diagramConfig);
  } else {
  
  try {
    const g = d3.select(svg).append("g");
    let xOffset = 150;
    const clusters = [];

    // Get spacing variables from theme (CSS)
    const themeVars = getComputedStyle(document.documentElement);
    // Si --cluster-spacing no está definido, usamos --cluster-padding-x como valor base para evitar solapamientos
    const clusterPaddingXBase = parseFloat(themeVars.getPropertyValue('--cluster-padding-x')) || 220;
    const clusterSpacing = parseFloat(themeVars.getPropertyValue('--cluster-spacing')) || clusterPaddingXBase;

    trees.forEach((data, index) => {
      try {
        // Tree spacing variables
        const treeSimpleVertical = parseFloat(themeVars.getPropertyValue('--tree-simple-vertical-spacing')) || 60;
        const treeSimpleHorizontal = parseFloat(themeVars.getPropertyValue('--tree-simple-horizontal-spacing')) || 140;
        const treeVertical = parseFloat(themeVars.getPropertyValue('--tree-vertical-spacing')) || 100;
        const treeHorizontal = parseFloat(themeVars.getPropertyValue('--tree-horizontal-spacing')) || 180;
        const clusterPaddingX = parseFloat(themeVars.getPropertyValue('--cluster-padding-x')) || 220;
        const clusterPaddingY = parseFloat(themeVars.getPropertyValue('--cluster-padding-y')) || 220;

        const root = d3.hierarchy(data);
        
        // Detect if tree is 'site map' type (root with multiple children, and each child only has one child, and so on)
        function isLinearSiteMap(root) {
          if (!root.children || root.children.length < 2) return false;
          return root.children.every(child => {
            let current = child;
            while (current.children && current.children.length === 1) {
              current = current.children[0];
            }
            // If at any point there is more than one child, it's not linear
            return !current.children || current.children.length === 0;
          });
        }

        let treeLayout;
        if (isLinearSiteMap(root)) {
          treeLayout = d3.tree().nodeSize([treeSimpleVertical, treeSimpleHorizontal]);
        } else {
          treeLayout = d3.tree().nodeSize([treeVertical, treeHorizontal]);
        }
        treeLayout(root);

        // If it's tree-simple, increase vertical separation only for direct children of root and all their descendants
        if (isLinearSiteMap(root)) {
          const extraY = treeSimpleVertical;
          if (root.children) {
            root.children.forEach(child => {
              function shiftSubtreeY(node, deltaY) {
                node.y += deltaY;
                if (node.children) {
                  node.children.forEach(c => shiftSubtreeY(c, deltaY));
                }
              }
              shiftSubtreeY(child, extraY);
            });
          }
        }

        const treeGroup = g.append("g")
          .attr("class", "diagram-group")
          .attr("data-root-id", root.data.id)
          .attr("transform", `translate(${xOffset}, 100)`);

        clusters.push({
          treeGroup: treeGroup,
          root: root,
          initialX: xOffset,
          index: index
        });

        // Render links
        treeGroup.selectAll(".link")
          .data(root.links())
          .enter().append("path")
          .attr("class", "link")
          .attr("d", d => {
            // Ajustar coordenadas para que los links se conecten al centro del rectángulo del nodo
            const nodeOffsetX = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--node-bg-x')) || -42;
            const nodeWidth = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--node-bg-width')) || 60;
            const nodeCenterX = nodeOffsetX + (nodeWidth / 2);
            
            const sourceX = d.source.x + nodeCenterX;
            const targetX = d.target.x + nodeCenterX;
            
            return `
              M ${sourceX} ${d.source.y}
              V ${(d.source.y + d.target.y) / 2}
              H ${targetX}
              V ${d.target.y}
            `;
          });

        // Render nodes
        const node = treeGroup.selectAll(".node")
          .data(root.descendants())
          .enter().append("g")
          .attr("class", "node node-clickable")
          .attr("data-id", d => d.data.id)
          .attr("transform", d => `translate(${d.x},${d.y})`)
          .on("click", function(event, d) {
            event.stopPropagation();
            
            // Prevent zoom behavior interference
            event.preventDefault();
            
            // Check if zoom level allows node selection (prevent selection when zoom <= 0.35)
            const currentZoom = window.$xDiagrams.currentZoom ? window.$xDiagrams.currentZoom.k : 1;
            if (currentZoom <= 0.35) {
              console.log('[NodeClick] Node selection blocked - zoom level too low:', currentZoom);
              return; // Exit early without processing the click
            }
            
            // Check if cluster click mode is active and auto-select cluster if needed
            if (window.$xDiagrams.clusterClickMode.active) {
              const nodeElement = this;
              const clusterInfo = findClusterForNode(nodeElement);
              if (clusterInfo) {
                const currentSelectedCluster = window.$xDiagrams.clusterClickMode.selectedCluster;
                const isCurrentlySelected = currentSelectedCluster && currentSelectedCluster.id === clusterInfo.id;
                
                if (!isCurrentlySelected) {
                  console.log('[ClusterClickMode] Auto-selecting cluster for node click:', clusterInfo.id);
                  
                  // Deselect current cluster if any
                  if (currentSelectedCluster) {
                    deselectCurrentCluster('node-click-selection');
                  }
                  
                  // Select the new cluster
                  window.$xDiagrams.clusterClickMode.selectedCluster = clusterInfo;
                  
                  // Apply visual selection styles
                  const rect = clusterInfo.rect;
                  if (rect && rect.node()) {
                    rect
                      .attr("data-selected", "true")
                      .style("fill", "var(--cluster-selected-bg, rgba(255, 152, 0, 0.25))")
                      .style("stroke", "var(--cluster-selected-stroke, #ff9800)")
                      .style("stroke-width", "4")
                      .style("stroke-dasharray", "none")
                      .style("box-shadow", "0 0 8px rgba(255, 152, 0, 0.3)");
                    
                    // Disable hover on selected cluster
                    rect.on("mouseenter", null).on("mouseleave", null);
                  }
                  
                  // Zoom to the cluster
                  zoomToCluster(clusterInfo);
                }
              }
            }
            
            // Enable keyboard navigation when a node is clicked (only if enabled)
            if (isOptionEnabled('keyboardNavigation') && window.$xDiagrams.keyboardNavigation) {
              window.$xDiagrams.keyboardNavigation.enable();
              
              // Find the index of this node in the global data
              const nodeIndex = window.$xDiagrams.currentData.findIndex(item => item.id === d.data.id);
              if (nodeIndex !== -1) {
                window.$xDiagrams.keyboardNavigation.currentNodeIndex = nodeIndex;
                window.$xDiagrams.keyboardNavigation.selectNode(nodeIndex);
              }
            }
            
            // Open side panel only if enabled
            if (isOptionEnabled('sidePanel') !== false && window.openSidePanel) {
              window.openSidePanel(d.data);
            }
          });

        // Node rectangle
        node.append("rect")
          .style("stroke-width", "var(--node-bg-stroke, 2)")
          .attr("x", parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--node-bg-x')) || -30)
          .attr("y", parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--node-bg-y')) || -20)
          .attr("width", parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--node-bg-width')) || 60)
          .attr("height", parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--node-bg-height')) || 40);

        // Node image with enhanced loading
        node.each(function(d) {
          const nodeSel = d3.select(this);
          const imageUrl = resolveNodeImage(d);
          
          // Usar la función apropiada según el tipo de imagen
          if (isEmbeddedThumbnailUrl(imageUrl)) {
            // Para thumbnails embebidos, crear SVG directo
            const svgString = getEmbeddedThumbnailSvgString(imageUrl);
            if (svgString) {
              const svgElement = createEmbeddedSVGElement(svgString, "image-base", {
                x: parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--image-x')),
                y: parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--image-y')),
                width: parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--image-width')),
                height: parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--image-height'))
              });
              if (svgElement) {
                nodeSel.node().appendChild(svgElement);
              }
            }
          } else {
            // Para imágenes no embebidas, usar elemento image tradicional
            const imageElement = nodeSel.append("image")
              .attr("href", getEmbeddedThumbnail('transparent') || "img/transparent.svg") // Usar thumbnail transparent embebido
              .attr("data-src", imageUrl)
              .attr("x", parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--image-x')))
              .attr("y", parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--image-y')))
              .attr("class", "image-base")
              .attr("width", parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--image-width')))
              .attr("height", parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--image-height')))
              .attr("crossorigin", "anonymous") // Intentar resolver problemas de CORS
              .on("load", function() {
                const element = d3.select(this);
                const dataSrc = element.attr("data-src");
                const currentHref = element.attr("href");
                
                // Verificar si estamos cargando el placeholder transparent y tenemos una imagen real en data-src
                if (dataSrc && (currentHref === "img/transparent.svg" || currentHref.includes('transparent'))) {
                  console.log(`[Image Load] Loading real image: ${dataSrc}`);
                  // Cambiar a la imagen real
                  element.attr("href", dataSrc)
                        .classed("loaded", true);
                  // Solo aplicar el filtro si es necesario
                  if (shouldApplyFilter(dataSrc)) {
                    element.classed("image-filter", true);
                  }
                }
              })
              .on("error", function() {
                const element = d3.select(this);
                const currentSrc = element.attr("href");
                const dataSrc = element.attr("data-src");
                
                console.log(`[Image Load] Error detected - currentSrc: ${currentSrc}, dataSrc: ${dataSrc}`);
                console.log(`[Image Load] Element classes: ${element.attr("class")}`);
                console.log(`[Image Load] Element display: ${element.style("display")}`);
                
                // Si tenemos una URL real en data-src y es diferente de la actual, intentar usarla
                if (dataSrc && dataSrc !== currentSrc && !dataSrc.includes('data:image/svg+xml')) {
                  console.log(`[Image Load] Retrying with real URL from data-src: ${dataSrc}`);
                  element.attr("href", dataSrc);
                  return; // Intentar cargar la URL real
                }
                
                // Si la imagen actual es el placeholder transparent o una imagen externa que falló, usar thumbnail embebido del type
                if (currentSrc.includes('transparent') || (dataSrc && dataSrc !== currentSrc)) {
                  console.log(`[Image Load] Error loading image from Img column, using embedded thumbnail from Type column`);
                  
                  // Crear fallback embebido sin hacer peticiones adicionales
                  createEmbeddedFallback(d, nodeSel, element);
                } else {
                  // Si ya es un thumbnail embebido (no transparent) y falla, ocultar la imagen
                  console.log(`[Image Load] Error loading embedded thumbnail, hiding element`);
                  element.style("display", "none");
                }
              });
          }
        });

        // Node text
        const textGroup = node.append("g").attr("class", "text-group");
        
        // Node ID
        textGroup.append("text")
          .attr("class", "label-id")
          .attr("x", d => {
            const baseX = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--label-id-x'));
            // Si el nodo no tiene padre, centrarlo horizontalmente con el nodo
            if (!d.parent) {
              const nodeOffsetX = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--node-bg-x')) || -42;
              const nodeWidth = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--node-bg-width')) || 60;
              return nodeOffsetX + (nodeWidth / 2);
            }
            return baseX;
          })
          .attr("y", parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--label-id-y')))
          .attr("dy", getComputedStyle(document.documentElement).getPropertyValue('--label-id-dy'))
          .attr("text-anchor", d => {
            const baseAnchor = getComputedStyle(document.documentElement).getPropertyValue('--label-id-anchor');
            // Si el nodo no tiene padre, usar centrado automático
            return d.parent ? baseAnchor : "middle";
          })
          .style("font-size", getComputedStyle(document.documentElement).getPropertyValue('--label-id-font-size'))
          .style("fill", getComputedStyle(document.documentElement).getPropertyValue('--label-id-text-color'))
          .text(d => d.data.id);

        // Node name
        const nameText = textGroup.append("text")
          .attr("class", "label-text")
          .attr("x", parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--label-x')))
          .attr("y", parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--label-y')))
          .attr("dy", getComputedStyle(document.documentElement).getPropertyValue('--label-dy'))
          .style("font-size", getComputedStyle(document.documentElement).getPropertyValue('--label-font-size'))
          .text(d => d.data.name);

        // Apply text wrapping
        const maxWidth = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--label-max-width')) || 68;
        wrap(nameText, maxWidth);

        // Node subtitle with truncation for vertical text - individual per node
        textGroup.append("text")
          .attr("class", "subtitle-text")
          .attr("transform", "rotate(270)") // Rotate text 90 degrees for vertical position
          .attr("x", parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--subtitle-x')))
          .attr("y", parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--subtitle-y')))
          .attr("text-anchor", getComputedStyle(document.documentElement).getPropertyValue('--subtitle-anchor'))
          .style("font-size", getComputedStyle(document.documentElement).getPropertyValue('--subtitle-font-size'))
          .style("fill", getComputedStyle(document.documentElement).getPropertyValue('--text-subtitle-color'))
          .text(d => {
            const subtitleText = d.data.subtitle || "";
            const maxSubtitleChars = 35; // Maximum characters for subtitle
            
            // Check if subtitle needs truncation
            if (subtitleText.length > maxSubtitleChars) {
              const displayText = subtitleText.substring(0, maxSubtitleChars) + "...";
              console.log(`[SVG Subtitle] Truncado: "${subtitleText}" -> "${displayText}"`);
              return displayText;
            }
            
            return subtitleText;
          });

        // Create cluster always (even for single nodes)
        if (root.descendants().length >= 1) {
          setTimeout(() => {
            const bounds = treeGroup.node().getBBox();
            if (bounds.width > 0 && bounds.height > 0) {
              const paddingX = clusterPaddingX;
              const paddingY = clusterPaddingY;
              const minX = bounds.x - paddingX;
              const minY = bounds.y - paddingY - 30;
              const maxX = bounds.x + bounds.width + paddingX;
              const maxY = bounds.y + bounds.height + paddingY;
              const width = maxX - minX;
              const height = maxY - minY;
              
              treeGroup.insert("rect", ":first-child")
                .attr("class", "cluster-rect")
                .attr("x", minX)
                .attr("y", minY)
                .attr("width", width)
                .attr("height", height)
                .attr("rx", 18)
                .attr("ry", 18)
                .style("fill", "var(--cluster-bg, rgba(0,0,0,0.2))")
                .style("stroke", "var(--cluster-stroke, #222)")
                .style("stroke-width", 3)
                .style("stroke-dasharray", "6,4");
              
              // Truncar el título del cluster por ancho
              function truncateClusterTitle(text, maxWidth, fontSize, fontWeight, fontFamily) {
                // Crear un elemento temporal SVG para medir el ancho
                const svg = document.getElementById('main-diagram-svg');
                const tempText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                tempText.setAttribute('font-size', fontSize || '1.5em');
                tempText.setAttribute('font-weight', fontWeight || 'bold');
                tempText.setAttribute('font-family', fontFamily || 'inherit');
                tempText.style.visibility = 'hidden';
                svg.appendChild(tempText);
                let truncated = text;
                tempText.textContent = truncated;
                if (tempText.getComputedTextLength() <= maxWidth) {
                  svg.removeChild(tempText);
                  return truncated;
                }
                const words = text.split(' ');
                truncated = '';
                for (let i = 0; i < words.length; i++) {
                  let test = truncated ? truncated + ' ' + words[i] : words[i];
                  tempText.textContent = test + '...';
                  if (tempText.getComputedTextLength() > maxWidth) {
                    tempText.textContent = truncated + '...';
                    svg.removeChild(tempText);
                    return truncated + '...';
                  }
                  truncated = test;
                }
                svg.removeChild(tempText);
                return truncated;
              }

              // Obtener estilos para el título
              const clusterFontSize = getComputedStyle(document.documentElement).getPropertyValue('--cluster-title-font-size') || '1.5em';
              const clusterFontWeight = 'bold';
              const clusterFontFamily = 'inherit';
              // Truncar el texto si es necesario
              const clusterTitleText = truncateClusterTitle(root.data.name, width - 40, clusterFontSize, clusterFontWeight, clusterFontFamily);

              treeGroup.append("text")
                .attr("class", "cluster-title")
                .attr("x", minX + 32)
                .attr("y", minY + 40)
                .attr("text-anchor", "start")
                .style("font-size", clusterFontSize)
                .style("font-weight", clusterFontWeight)
                .style("fill", "var(--cluster-title-color, #fff)")
                .text(clusterTitleText);
            }
          }, 0);
        }

      } catch (err) {
        console.error(`Error al renderizar árbol ${index + 1}:`, err);
      }
    });

    // Recalculate spacing with retries
    let attempts = 0;
    const maxAttempts = 5;

    const retrySpacing = () => {
      recalculateClusterSpacing(clusters, clusterSpacing);
      attempts++;
      if (attempts < maxAttempts) {
        setTimeout(retrySpacing, 120);
      }
    };
    setTimeout(retrySpacing, 120);

  } catch (err) {
    console.error('Error general en drawTrees:', err);
  }
  } // End of else block for tree layout
}

// Function to recalculate spacing between clusters
function recalculateClusterSpacing(clusters, clusterSpacing) {
  if (clusters.length <= 1) return;

  const uniformSpacing = Math.abs(clusterSpacing); // Fixed spacing
  let currentX = 150; // Initial left margin

  clusters.forEach((cluster, index) => {
    const treeGroup = cluster.treeGroup;
    const bbox = treeGroup.node().getBBox();

    // Place cluster at currentX
    const newX = currentX - bbox.x;
    treeGroup.attr("transform", `translate(${newX}, 100)`);
    console.log(`[ClusterSpacing] Cluster ${index}: newX=${newX}, width=${bbox.width}, spacing=${uniformSpacing}`);

    // Next cluster starts right after the right edge of current one + uniform spacing
    currentX = newX + bbox.x + bbox.width + uniformSpacing;
  });
}

// Apply simplified auto zoom
function applyAutoZoom() {
  const svg = d3.select("#main-diagram-svg");
  const g = svg.select("g");
  
  if (g.empty() || g.node().getBBox().width === 0) {
    return;
  }

  const bounds = g.node().getBBox();
  const svgElement = document.getElementById('main-diagram-svg');
  const svgWidth = svgElement ? svgElement.clientWidth || svgElement.offsetWidth : window.innerWidth;
  const svgHeight = svgElement ? svgElement.clientHeight || svgElement.offsetHeight : window.innerHeight;

  if (!bounds.width || !bounds.height) {
    return;
  }

  // Calculate total bounds
  let totalBounds = bounds;
  const diagramGroups = g.selectAll(".diagram-group");
  
  if (!diagramGroups.empty()) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    diagramGroups.each(function() {
      const groupBounds = this.getBBox();
      const transform = this.getAttribute("transform");
      let groupOffsetX = 0;
      if (transform) {
        const match = /translate\(([-\d.]+), ?([-\d.]+)\)/.exec(transform);
        if (match) {
          groupOffsetX = parseFloat(match[1]) || 0;
        }
      }
      const absX = groupBounds.x + groupOffsetX;
      minX = Math.min(minX, absX);
      minY = Math.min(minY, groupBounds.y);
      maxX = Math.max(maxX, absX + groupBounds.width);
      maxY = Math.max(maxY, groupBounds.y + groupBounds.height);
    });
    
    if (minX < Infinity && minY < Infinity && maxX > -Infinity && maxY > -Infinity) {
      totalBounds = {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY
      };
    }
  }

  // Calculate transformation
  const contentCenterX = totalBounds.x + totalBounds.width / 2;
  const contentCenterY = totalBounds.y + totalBounds.height / 2;
  const svgCenterX = svgWidth / 2;
  const svgCenterY = svgHeight / 2;
  
  const nodeCount = g.selectAll(".node").size();
  const diagramGroupCount = diagramGroups.size();
  const isSmallDiagram = nodeCount <= 4;
  const isSingleGroup = diagramGroupCount === 1;
  const isFlatListDiagram = !isSingleGroup && nodeCount === diagramGroupCount; // todos los clusters son nodos raíz sin hijos
  let scaleX = (svgWidth - 100) / totalBounds.width;
  let scaleY = (svgHeight - 100) / totalBounds.height;
  let scale = Math.min(scaleX, scaleY, 1);
  
  // Apply specific zoom based on diagram type
  if (isSingleGroup) {
    // For single cluster: zoom out to show entire cluster with aura
    scale = Math.min(scale * 0.6, 0.6); // More aggressive zoom out to show aura
  } else {
    // For multiple clusters: use more aggressive zoom out for better overview
    // Calculate zoom based on diagram size and complexity
    const totalArea = totalBounds.width * totalBounds.height;
    const nodeDensity = nodeCount / Math.max(1, diagramGroupCount);
    
    // More balanced zoom out for multiple clusters
    let maxZoomOut = 0.18; // Increased base zoom out for better visibility
    
    // Calculate diagram area and complexity
    const diagramArea = totalBounds.width * totalBounds.height;
    
    // Adjust based on diagram complexity and size - more conservative values
    if (nodeCount > 50) {
      maxZoomOut = 0.10; // More reasonable zoom out for extremely large diagrams
    } else if (nodeCount > 30) {
      maxZoomOut = 0.12; // More reasonable zoom out for very large diagrams
    } else if (nodeCount > 20) {
      maxZoomOut = 0.15; // More reasonable zoom out for large diagrams
    } else if (nodeCount > 10) {
      maxZoomOut = 0.18; // More reasonable zoom out for medium-large diagrams
    } else if (diagramGroupCount > 10) {
      maxZoomOut = 0.12; // More reasonable zoom out for many clusters
    } else if (diagramGroupCount > 5) {
      maxZoomOut = 0.15; // More reasonable zoom out for many clusters
    }
    
    // Additional adjustment based on diagram area - more conservative
    if (diagramArea > 1000000) { // Very large area
      maxZoomOut = Math.min(maxZoomOut, 0.10);
    } else if (diagramArea > 500000) { // Large area
      maxZoomOut = Math.min(maxZoomOut, 0.12);
    } else if (diagramArea > 200000) { // Medium-large area
      maxZoomOut = Math.min(maxZoomOut, 0.15);
    }
    
    scale = Math.min(scale * 0.7, maxZoomOut); // Less aggressive zoom out for multiple clusters
  }
  
  let translateX = svgCenterX - contentCenterX * scale;
  
  // Improve centering based on diagram type
  if (isSingleGroup) {
    // Perfect centering for single groups, without margin adjustments
    translateX = svgCenterX - contentCenterX * scale;
        } else {
      // For multiple clusters: start from the left
    const firstCluster = diagramGroups.nodes()[0];
    if (firstCluster) {
      const firstClusterBounds = firstCluster.getBBox();
      const firstClusterTransform = firstCluster.getAttribute("transform");
      let firstClusterOffsetX = 0;
      
      if (firstClusterTransform) {
        const match = /translate\(([-\d.]+), ?([-\d.]+)\)/.exec(firstClusterTransform);
        if (match) {
          firstClusterOffsetX = parseFloat(match[1]) || 0;
        }
      }
      
      // Position first cluster from the left with margin configurable
      const firstClusterLeftEdge = firstClusterBounds.x + firstClusterOffsetX;
      const zoomVarsLeft = getComputedStyle(document.documentElement);
      if (isFlatListDiagram) {
        const flatLeftMargin = parseFloat(zoomVarsLeft.getPropertyValue('--flatlist-left-margin')) || 40; // Reduced from 60 to 40
        translateX = flatLeftMargin - firstClusterLeftEdge * scale;
      } else {
        // Usar el mismo marginX que se usa en el layout para consistencia
        const clusterLeftMargin = parseFloat(zoomVarsLeft.getPropertyValue('--cluster-left-margin')) || 50; // Reduced from 80 to 50
        translateX = clusterLeftMargin - firstClusterLeftEdge * scale; // margen consistente con el layout
      }
          } else {
        // Fallback to original logic
      const leftEdge = totalBounds.x * scale + translateX;
      if (leftEdge > 300) {
        translateX -= (leftEdge - 300);
      }
    }
  }
  
  let translateY;
  if (isSingleGroup) {
    // Comportamiento original para un solo cluster
    translateY = svgCenterY - contentCenterY * scale - 50;
  } else {
    // Cálculo dinámico del translate para múltiples clusters basado en el tamaño total
    const diagramWidth = totalBounds.width;
    const diagramHeight = totalBounds.height;
    
    // Calcular translateX dinámicamente basado en el ancho del diagrama
    // Para diagramas pequeños: más margen izquierdo, para grandes: menos margen
    const baseLeftMargin = 30; // Reduced margin for better balance
    const dynamicLeftMargin = Math.max(20, baseLeftMargin - (diagramWidth * scale * 0.03));
    translateX = dynamicLeftMargin - totalBounds.x * scale;
    
    // Calcular translateY dinámicamente basado en la altura del diagrama
    // Para diagramas pequeños: más margen superior, para grandes: menos margen
    const baseTopMargin = 60; // Reduced top margin for better balance
    const dynamicTopMargin = Math.max(30, baseTopMargin - (diagramHeight * scale * 0.02));
    translateY = dynamicTopMargin - totalBounds.y * scale;
  }

  // Apply transformation immediately without transition
  const transform = d3.zoomIdentity
    .translate(translateX, translateY)
    .scale(scale);

  // Apply immediately to prevent any movement
  svg.call(zoom.transform, transform);
  
  // Store zoom info for debugging
  window.$xDiagrams.lastAutoZoom = {
    scale: scale,
    translateX: translateX,
    translateY: translateY,
    nodeCount: nodeCount,
    diagramGroupCount: diagramGroupCount,
    isSingleGroup: isSingleGroup,
    isFlatListDiagram: isFlatListDiagram,
    totalBounds: totalBounds
  };
  
  console.log('[AutoZoom] Applied zoom:', {
    scale: scale.toFixed(3),
    translateX: translateX.toFixed(0),
    translateY: translateY.toFixed(0),
    nodeCount: nodeCount,
    diagramGroupCount: diagramGroupCount,
    diagramType: isSingleGroup ? 'single' : (isFlatListDiagram ? 'flat' : 'multi'),
    diagramArea: (totalBounds.width * totalBounds.height).toFixed(0)
  });
  
  // Auto-apply extreme zoom for very large diagrams - disabled to prevent jumps
  // if (!isSingleGroup && (nodeCount > 100 || diagramGroupCount > 20 || (totalBounds.width * totalBounds.height) > 2000000)) {
  //   setTimeout(() => {
  //     console.log('[AutoZoom] Detected very large diagram, applying extreme zoom out...');
  //     applyExtremeZoomOut();
  //   }, 500);
  // }
  
  // Preserve current theme after zoom
  setTimeout(async () => {
    if (window.preserveCurrentTheme) {
      await window.preserveCurrentTheme();
    }
  }, 100);
}

// Apply zoom behavior
function ensureZoomBehavior() {
  const svg = d3.select("#main-diagram-svg");
  if (!svg.empty()) {
    // Remove existing zoom behavior to prevent conflicts
    svg.on('.zoom', null);
    
    // Apply new zoom behavior with constraints
    svg.call(zoom);
    svg.style('pointer-events', 'auto');
    
    // Disable double-click zoom by preventing the default behavior
    svg.on("dblclick.zoom", null);
    svg.on("dblclick", function(event) {
      event.preventDefault();
      event.stopPropagation();
      return false;
    });
    
    // Store reference to current zoom for external access
    window.$xDiagrams.currentZoom = zoom;
    
    // Ensure SVG maintains proper dimensions
    svg.style('width', '100%');
    svg.style('height', 'calc(100vh - 60px)');
    
    // Ensure body overflow is properly set for zoom behavior
    const body = document.body;
    if (!body.style.overflow || body.style.overflow === '') {
      body.style.overflow = 'hidden';
    }
    
    // Add touch-action to prevent conflicts on mobile
    svg.style('touch-action', 'none');
  }
}

// Function to reset zoom to default state
function resetZoom() {
  const svg = d3.select("#main-diagram-svg");
  if (!svg.empty() && window.$xDiagrams.currentZoom) {
    svg.transition().duration(300).call(
      window.$xDiagrams.currentZoom.transform,
      d3.zoomIdentity
    );
  }
}

// Function to check if zoom is in a problematic state
function isZoomProblematic() {
  const svgGroup = d3.select("#main-diagram-svg g");
  if (!svgGroup.empty()) {
    const transform = svgGroup.attr("transform");
    if (transform) {
      const scaleMatch = transform.match(/scale\(([^)]+)\)/);
      if (scaleMatch) {
        const scale = parseFloat(scaleMatch[1]);
        return scale > 2.5 || scale < 0.01 || isNaN(scale); // Updated to allow zoom out to 0.01
      }
    }
  }
  return false;
}

// Make functions globally available for debugging
window.resetZoom = resetZoom;
window.isZoomProblematic = isZoomProblematic;

// Function to handle zoom reset button click


// Function to apply custom zoom for multiclusters
window.applyCustomZoom = function(scaleFactor = 0.5) {
  const svg = d3.select("#main-diagram-svg");
  if (!svg.empty() && window.$xDiagrams.lastAutoZoom) {
    const lastZoom = window.$xDiagrams.lastAutoZoom;
    const newScale = Math.max(0.01, lastZoom.scale * scaleFactor); // Ensure minimum zoom of 0.01
    
    const transform = d3.zoomIdentity
      .translate(lastZoom.translateX, lastZoom.translateY)
      .scale(newScale);
    
    svg.call(zoom.transform, transform);
    console.log('[CustomZoom] Applied custom zoom with factor:', scaleFactor, 'new scale:', newScale.toFixed(3));
  } else {
    console.warn('[CustomZoom] No previous zoom info available');
  }
};

// Function to apply extreme zoom out for very large diagrams
window.applyExtremeZoomOut = function() {
  const svg = d3.select("#main-diagram-svg");
  if (!svg.empty() && window.$xDiagrams.lastAutoZoom) {
    const lastZoom = window.$xDiagrams.lastAutoZoom;
    const newScale = 0.01; // Extreme zoom out (1% of original size)
    
    const transform = d3.zoomIdentity
      .translate(lastZoom.translateX, lastZoom.translateY)
      .scale(newScale);
    
    svg.call(zoom.transform, transform);
    console.log('[ExtremeZoom] Applied extreme zoom out, scale:', newScale.toFixed(3));
  } else {
    console.warn('[ExtremeZoom] No previous zoom info available');
  }
};

// Function to get current zoom info
window.getZoomInfo = function() {
  const svg = d3.select("#main-diagram-svg");
  if (!svg.empty()) {
    const transform = d3.zoomTransform(svg.node());
    return {
      scale: transform.k,
      translateX: transform.x,
      translateY: transform.y
    };
  }
  return null;
};

// Function to wrap text
function wrap(text, width) {
  const lineHeight = 1.5;
  text.each(function() {
    const textElement = d3.select(this);
    let originalText = textElement.text();



    // Si hay saltos de línea, solo se consideran los dos primeros segmentos
    let lines = originalText.split('\n');
    let firstLine = lines[0];
    let secondLine = lines[1] || '';

    textElement.text(null);

    // --- Word wrap para la primera línea ---
    const words = firstLine.split(/\s+/);
    let currentLine = '';
    let tspan1 = textElement.append('tspan')
      .attr('x', getComputedStyle(document.documentElement).getPropertyValue('--label-x'))
      .attr('y', getComputedStyle(document.documentElement).getPropertyValue('--label-y'))
      .attr('dy', (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--label-dy')) || 0) + 'em')
      .attr('text-anchor', 'middle')
      .style('font-size', getComputedStyle(document.documentElement).getPropertyValue('--label-font-size'))
      .text('');
    let usedWords = 0;
    
    for (let i = 0; i < words.length; i++) {
      let testLine = currentLine ? currentLine + ' ' + words[i] : words[i];
      tspan1.text(testLine);
      if (tspan1.node().getComputedTextLength() > width) {
        // Si ya hay texto, no cabe la siguiente palabra, así que paramos aquí
        break;
      } else {
        currentLine = testLine;
        tspan1.text(currentLine);
        usedWords = i + 1;
      }
    }

    // Asignamos el texto final que sí cabe a la primera línea.
    tspan1.text(currentLine);

    // --- Segunda línea: puede venir de salto de línea o del wrap automático ---
    let secondLineText = '';
    if (secondLine) {
      // Si hay salto de línea explícito, usar ese texto
      secondLineText = secondLine;
    } else if (usedWords < words.length) {
      // Si quedaron palabras sin usar, forman la segunda línea
      secondLineText = words.slice(usedWords).join(' ');
    }


    if (secondLineText) {
      let tspan2 = textElement.append('tspan')
        .attr('x', getComputedStyle(document.documentElement).getPropertyValue('--label-x'))
        .attr('y', getComputedStyle(document.documentElement).getPropertyValue('--label-y'))
        .attr('dy', lineHeight + 'em')
        .attr('text-anchor', 'middle')
        .style('font-size', getComputedStyle(document.documentElement).getPropertyValue('--label-font-size'))
        .text('');
      const words2 = secondLineText.split(/\s+/);
      let currentLine2 = '';
      
      for (let i = 0; i < words2.length; i++) {
        let testLine2 = currentLine2 ? currentLine2 + ' ' + words2[i] : words2[i];
        tspan2.text(testLine2 + '...');
        if (tspan2.node().getComputedTextLength() > width) {
          tspan2.text(currentLine2 + '...');
          return;
        } else {
          currentLine2 = testLine2;
          tspan2.text(currentLine2);
        }
      }
    }
  });
}

// Simplified side panel
function createSidePanel() {
  // Check if side panel already exists
  const existingPanel = document.getElementById('side-panel');
  if (existingPanel) {
    console.log('[Side Panel] Panel already exists, skipping creation');
    return;
  }
  
  // Create side panel outside the container (fixed position)
  const sidePanel = document.createElement('div');
  sidePanel.className = 'side-panel';
  sidePanel.id = 'side-panel';
  
  sidePanel.innerHTML = `
    <div class="side-panel-header">
      <h3 class="side-panel-title" id="side-panel-title">Detalles del Nodo</h3>
      <button class="side-panel-close" onclick="closeSidePanel()">×</button>
    </div>
    <div class="side-panel-content" id="side-panel-content">
    </div>
  `;
  
  document.body.appendChild(sidePanel);
  console.log('[Side Panel] Created new panel');

  // Event for Escape key
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
      closeSidePanel();
    }
  });
}

// Open side panel
function openSidePanel(nodeData) {
  const sidePanel = document.getElementById('side-panel');
  const content = document.getElementById('side-panel-content');
  const titleElement = document.getElementById('side-panel-title');
  
  // Stabilize viewport to prevent layout shifts
  const body = document.body;
  const html = document.documentElement;
  
  // Store original overflow state but don't change it immediately
  // This prevents conflicts with D3 zoom behavior
  const originalOverflow = body.style.overflow;
  
  // Ensure topbar stays in place
  const topbar = document.querySelector('.topbar');
  if (topbar) {
    topbar.style.position = 'fixed';
    topbar.style.top = '0';
    topbar.style.left = '0';
    topbar.style.width = '100%';
  }

  if (!sidePanel || !content) {
    console.error("No se encontró el panel lateral");
    return;
  }

  // Remove previous selection
  d3.selectAll('.node.node-selected').classed('node-selected', false);
  
  if (nodeData && nodeData.id) {
    // Buscar el nodo por ID, pero también considerar nodos huérfanos
    const selectedNode = d3.selectAll('.node').filter(d => {
      // Si el nodo tiene ID, comparar por ID
      if (d.data.id && nodeData.id) {
        return d.data.id == nodeData.id;
      }
      // Si no hay ID, comparar por nombre y otros campos
      return d.data.name === nodeData.name && 
             d.data.subtitle === nodeData.subtitle &&
             d.data.type === nodeData.type;
    });
    
    if (!selectedNode.empty()) {
      selectedNode.classed('node-selected', true);
    } else {
      // Fallback: buscar por cualquier campo que coincida
      const fallbackNode = d3.selectAll('.node').filter(d => 
        d.data.name === nodeData.name || 
        d.data.id === nodeData.id ||
        (d.data.originalData && nodeData.originalData && 
         JSON.stringify(d.data.originalData) === JSON.stringify(nodeData.originalData))
      );
      fallbackNode.classed('node-selected', true);
    }
  }

  // Update title with node name and thumbnail
  if (titleElement && nodeData) {
    // Use original CSV data if available, otherwise fall back to processed data
    const dataToShow = nodeData.originalData || nodeData;
    // Get the name value from the data
    const nodeName = dataToShow.name || dataToShow.Name || dataToShow.NAME || nodeData.name || 'Nodo sin nombre';
    // Get the type for thumbnail
    const nodeType = dataToShow.type || dataToShow.Type || dataToShow.TYPE || nodeData.type || 'detail';
    
    // Create embedded thumbnail HTML instead of external image
    const thumbnailHtml = createSidePanelThumbnailHtml(nodeType);

    // Truncar el texto del título por ancho disponible antes del botón de cerrar
    function truncateSidePanelTitle(text, maxWidth, fontSize, fontWeight, fontFamily) {
      // Crear un elemento temporal para medir el ancho
      const temp = document.createElement('span');
      temp.style.position = 'absolute';
      temp.style.visibility = 'hidden';
      temp.style.fontSize = fontSize || '1.2em';
      temp.style.fontWeight = fontWeight || 'bold';
      temp.style.fontFamily = fontFamily || 'inherit';
      temp.style.whiteSpace = 'nowrap';
      temp.textContent = text;
      document.body.appendChild(temp);
      if (temp.offsetWidth <= maxWidth) {
        document.body.removeChild(temp);
        return text;
      }
      const words = text.split(' ');
      let truncated = '';
      for (let i = 0; i < words.length; i++) {
        let test = truncated ? truncated + ' ' + words[i] : words[i];
        temp.textContent = test + '...';
        if (temp.offsetWidth > maxWidth) {
          temp.textContent = truncated + '...';
          document.body.removeChild(temp);
          return truncated + '...';
        }
        truncated = test;
      }
      document.body.removeChild(temp);
      return truncated;
    }
    // Medir el ancho disponible en el header
    const header = titleElement.closest('.side-panel-header');
    const closeBtn = header ? header.querySelector('.side-panel-close') : null;
    const headerRect = header ? header.getBoundingClientRect() : { width: 320 };
    const closeRect = closeBtn ? closeBtn.getBoundingClientRect() : { width: 40 };
    // Margen entre texto y botón
    const margin = 24;
    const availableWidth = headerRect.width - closeRect.width - margin - 48; // 48px para thumbnail y paddings
    // Obtener estilos
    const fontSize = getComputedStyle(titleElement).fontSize || '1.2em';
    const fontWeight = getComputedStyle(titleElement).fontWeight || 'bold';
    const fontFamily = getComputedStyle(titleElement).fontFamily || 'inherit';
    // Truncar el texto si es necesario
    const truncatedTitle = truncateSidePanelTitle(nodeName, availableWidth, fontSize, fontWeight, fontFamily);
    
    // Agregar tooltip si el texto está truncado
    const titleTooltip = truncatedTitle !== nodeName ? `title="${nodeName}"` : '';
    
    // Update title with thumbnail and name
    titleElement.innerHTML = `${thumbnailHtml}<span class="side-panel-title-text" ${titleTooltip}>${truncatedTitle}</span>`;
  }

  // Generate content
  content.innerHTML = generateSidePanelContent(nodeData);
  
  // Re-initialize tooltips after content is generated
  setTimeout(() => {
      initializeCustomTooltips();
}, 100);

sidePanel.classList.add('open');
  
  // Only restore body overflow if it was explicitly set before
  // This prevents conflicts with D3 zoom behavior
  if (originalOverflow) {
    setTimeout(() => {
      body.style.overflow = originalOverflow;
    }, 300); // Wait for panel animation to complete
  }
  
  // Trigger onNodeClick hook
  triggerHook('onNodeClick', { 
    node: nodeData, 
    timestamp: new Date().toISOString() 
  });
  
  // Check if zoom is in a problematic state and reset if necessary
  setTimeout(() => {
    if (isZoomProblematic()) {
      console.log('[Zoom] Detected problematic zoom state after opening panel, resetting...');
      resetZoom();
    }
  }, 200);
}

// Close side panel
function closeSidePanel() {
  const sidePanel = document.getElementById('side-panel');
  if (sidePanel) {
    d3.selectAll('.node.node-selected').classed('node-selected', false);
    sidePanel.classList.remove('open');
    
    // Ensure zoom behavior is maintained after panel closes
    // Use a shorter delay to prevent conflicts
    setTimeout(() => {
      if (window.ensureZoomBehavior) {
        window.ensureZoomBehavior();
      }
      
      // Check if zoom is in a problematic state and reset if necessary
      if (isZoomProblematic()) {
        console.log('[Zoom] Detected problematic zoom state, resetting...');
        resetZoom();
      }
    }, 100);
  }
}

// Helper function to detect if a value is a URL
function isUrl(value) {
  if (!value || typeof value !== 'string') return false;
  
  // Remove whitespace
  const trimmedValue = value.trim();
  
  // Check for common URL patterns
  const urlPatterns = [
    /^https?:\/\//i,                    // http:// or https://
    /^www\./i,                          // www.
    /^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,}/i,  // domain.com
    /^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,}\.[a-z]{2,}/i,  // domain.co.uk
    /^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,}\/[^\s]*/i,  // domain.com/path
  ];
  
  return urlPatterns.some(pattern => pattern.test(trimmedValue));
}

// Helper function to format URL for display
function formatUrlForDisplay(url) {
  if (!url || typeof url !== 'string') return url;
  
  let formattedUrl = url.trim();
  
  // Add https:// if no protocol is specified
  if (!formattedUrl.match(/^https?:\/\//i)) {
    formattedUrl = 'https://' + formattedUrl;
  }
  
  return formattedUrl;
}

// Helper function to open URL securely with security attributes
function openUrlSecurely(url) {
  try {
    // Create a temporary link element with security attributes
    const tempLink = document.createElement('a');
    tempLink.href = url;
    tempLink.target = '_blank';
    tempLink.rel = 'noreferrer noopener'; // Security attributes
    tempLink.style.display = 'none';
    
    // Add to DOM temporarily
    document.body.appendChild(tempLink);
    
    // Programmatically click the link
    tempLink.click();
    
    // Remove from DOM
    document.body.removeChild(tempLink);
    
    return true;
  } catch (error) {
    console.error('[Security] Error opening URL securely:', error);
    return false;
  }
}

// Generate panel content
function generateSidePanelContent(nodeData) {
  if (!nodeData) return '<p>No hay datos disponibles</p>';

  let html = '<div class="side-panel-fields-table">';
  
  // Use original CSV data if available, otherwise fall back to processed data
  const dataToShow = nodeData.originalData || nodeData;
  
  // Always show ID first (either from original data or generated automatically)
  const nodeId = nodeData.id || dataToShow.id || '';
  if (nodeId) {
    html += `
      <div class="side-panel-field">
        <div class="side-panel-label">ID</div>
        <div class="side-panel-value">${nodeId}</div>
      </div>
    `;
  }
  
  // Show all available fields from the original CSV data
  Object.keys(dataToShow).forEach(key => {
    // Skip internal properties, name field (already shown in header), and id field (already shown above)
    if (key === 'children' || key === 'parent' || key === 'originalData' || 
        key.toLowerCase() === 'name' || key.toLowerCase() === 'id') return;
    
    const value = dataToShow[key] || '';
    // Convert label to title case for professional appearance, with special handling for ID and URL
    let label;
    if (key.toLowerCase() === 'url') {
      label = 'URL';
    } else {
      label = key
        .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space between lowercase and uppercase (camelCase)
        .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2') // Add space between acronym and word (e.g., "URLPath" -> "URL Path")
        .replace(/[_-]/g, ' ') // Replace underscores and hyphens with spaces
        .trim() // Remove leading/trailing spaces
        .toLowerCase() // Convert to lowercase first
        .replace(/\b\w/g, l => l.toUpperCase()); // Capitalize first letter of each word
    }
    const originalLabel = key; // Keep original for tooltip
    
    // Check if the value is a URL
    const isUrlValue = isUrl(value);
    
    // Add title attribute for tooltip if text is long (use original label for tooltip)
    const labelTitle = originalLabel.length > 15 ? originalLabel : '';
    
    // For URLs, show the full URL as clickable text, with tooltip if long
    // For other values, use existing logic
    let displayValue, valueTitle;
    if (isUrlValue) {
      displayValue = value; // Show full URL as text
      valueTitle = value.length > 40 ? value : ''; // Tooltip if URL is long
    } else {
      displayValue = value;
      valueTitle = (value && value.length > 20) ? value : '';
    }
    

    
    html += `
      <div class="side-panel-field">
        <div class="side-panel-label" ${labelTitle ? `data-tooltip="${labelTitle}"` : ''}>${label}</div>
        <div class="side-panel-value ${!value ? 'empty' : ''}" ${valueTitle ? `data-tooltip="${valueTitle}"` : ''}>
          ${isUrlValue ? 
            `<a href="${value}" target="_blank" rel="noreferrer" class="side-panel-url-link">${displayValue}</a>` : 
            displayValue || '-'
          }
        </div>
      </div>
    `;
  });

  html += '</div>';
  return html;
}

// Configure panel close on outside click
function setupClosePanelOnSvgClick() {
  const svg = document.querySelector('#main-diagram-svg');
  if (!svg) return;
  
  svg.removeEventListener('click', handleSvgClick);
  svg.addEventListener('click', handleSvgClick);
  
  function handleSvgClick(event) {
    // Only close panel if clicking on empty space, not on nodes or other interactive elements
    if (!event.target.closest('.node') && 
        !event.target.closest('.cluster') && 
        !event.target.closest('.link')) {
      closeSidePanel();
      
      // Also deselect cluster if cluster click mode is active and there's a selected cluster
      if (window.$xDiagrams.clusterClickMode.active && window.$xDiagrams.clusterClickMode.selectedCluster) {
        console.log('[ClusterClickMode] Deselecting cluster due to canvas click');
        deselectCurrentCluster('canvas-click');
      } else {
        console.log('[ClusterClickMode] No cluster to deselect - mode active:', window.$xDiagrams.clusterClickMode.active, 'selected cluster:', !!window.$xDiagrams.clusterClickMode.selectedCluster);
      }
    }
  }
}

// Simplified theme system
async function setTheme(themeId, forceReload = false) {
  // Clear previous classes
  document.body.classList.remove('theme-snow', 'theme-onyx', 'theme-vintage', 'theme-pastel', 'theme-neon', 'theme-forest');
  
  // Apply new class
  document.body.classList.add('theme-' + themeId);
  
  // Save theme with unique key per file
  const storageKey = getStorageKey();
  localStorage.setItem(storageKey, themeId);
  
  // Also save to global theme preference for better persistence
  localStorage.setItem('selectedTheme', themeId);
  localStorage.setItem('themeMode', isLightTheme(themeId) ? 'light' : 'dark');
  
  console.log('[Theme System] Tema guardado:', themeId, 'en clave:', storageKey, 'y global');
  
  // Clear cache before applying theme
  if (window.$xDiagrams && window.$xDiagrams.clearCache) {
    window.$xDiagrams.clearCache();
  }
  
  // Apply theme CSS variables (with force reload if requested)
  const themeVariables = await getThemeVariables(themeId, forceReload);
  const targetElement = document.querySelector('.xcanvas') || document.documentElement;
  
  Object.keys(themeVariables).forEach(varName => {
    targetElement.style.setProperty(varName, themeVariables[varName]);
    document.body.style.setProperty(varName, themeVariables[varName]);
    document.documentElement.style.setProperty(varName, themeVariables[varName]);
  });
  
  // Update SVG colors
  updateSVGColors();
  
  // Update switcher colors
  updateSwitcherColors();
  
  // Trigger onThemeChange hook
  triggerHook('onThemeChange', { 
    theme: themeId, 
    timestamp: new Date().toISOString() 
  });
}

// Cache for themes to avoid repeated fetches
let themesCache = null;
let lastThemeFileTimestamp = null;

// Function to clear theme cache
function clearThemeCache() {
  themesCache = null;
  lastThemeFileTimestamp = null;
  console.log('[Theme System] Cache de temas limpiado');
}

// Get theme variables from external JSON file
async function getThemeVariables(themeId, forceReload = false) {
  // Check if we need to reload themes (force reload or no cache)
  if (forceReload || !themesCache) {
    try {
      // Load themes from external JSON file (try xthemes.json first, then themes.json as fallback)
      let response = await fetch('xthemes.json');
      if (!response.ok) {
        console.log('[Theme System] xthemes.json no encontrado, intentando themes.json...');
        response = await fetch('themes.json');
        if (!response.ok) {
          throw new Error(`Failed to load themes: ${response.status}`);
        }
      }
      
      // Check if file has changed (using Last-Modified header)
      const lastModified = response.headers.get('Last-Modified');
      if (lastModified && lastThemeFileTimestamp && lastModified !== lastThemeFileTimestamp) {
        console.log('[Theme System] Archivo de temas modificado, recargando...');
        forceReload = true;
      }
      
      if (forceReload || !themesCache) {
        themesCache = await response.json();
        lastThemeFileTimestamp = lastModified;
        console.log('[Theme System] Temas cargados desde archivo:', forceReload ? 'recarga forzada' : 'carga inicial');
      }
    } catch (error) {
      console.warn('Error loading themes from JSON, using fallback:', error);
      
      // Fallback to basic theme if JSON loading fails
      const fallbackThemes = {
        snow: {
          '--canvas-bg': '#f6f7f9',
          '--text-color': '#222',
          '--node-fill': '#fff',
          '--control-bg': '#ffffff',
          '--control-text': '#333333',
          '--control-focus': '#1976d2'
        },
        onyx: {
          '--canvas-bg': '#181c24',
          '--text-color': '#f6f7f9',
          '--node-fill': '#23272f',
          '--control-bg': '#23272f',
          '--control-text': '#f6f7f9',
          '--control-focus': '#00eaff'
        }
      };
      
      return fallbackThemes[themeId] || fallbackThemes.snow;
    }
  }
  
  return themesCache[themeId] || themesCache.snow;
}

// Update SVG colors
function updateSVGColors() {
  const computedStyle = getComputedStyle(document.documentElement);
  
  const variables = {
    textColor: computedStyle.getPropertyValue('--text-color'),
    nodeFill: computedStyle.getPropertyValue('--node-fill'),
                    labelBorder: computedStyle.getPropertyValue('--node-stroke'),
        linkColor: computedStyle.getPropertyValue('--node-connector'),
    clusterBg: computedStyle.getPropertyValue('--cluster-bg'),
    clusterStroke: computedStyle.getPropertyValue('--cluster-stroke'),
    clusterTitleColor: computedStyle.getPropertyValue('--cluster-title-color'),
    subtitleColor: computedStyle.getPropertyValue('--text-subtitle-color'),
    imageFilter: computedStyle.getPropertyValue('--image-filter')
  };

  // Apply colors to SVG elements
  d3.selectAll('.link').style('stroke', variables.linkColor);
  d3.selectAll('.node rect').style('fill', variables.nodeFill).style('stroke', variables.labelBorder);
  d3.selectAll('.label-text').style('fill', variables.textColor);
  d3.selectAll('.subtitle-text').style('fill', variables.subtitleColor);
  d3.selectAll('.cluster-rect').style('fill', variables.clusterBg).style('stroke', variables.clusterStroke);
  d3.selectAll('.cluster-title').style('fill', variables.clusterTitleColor);
  
  // Update image filters
  updateImageFilters(variables.imageFilter);
}

// Update image filters for all images with image-filter class
function updateImageFilters(filterValue) {
  console.log('[Image Filter] Aplicando filtro:', filterValue);
  
  // Verificar que el filtro no esté vacío
  if (!filterValue || filterValue.trim() === '') {
    console.warn('[Image Filter] Filtro vacío, no se aplicará');
    return;
  }
  
  // En lugar de aplicar estilos inline, usar variables CSS
  // Esto permite que el filtro se actualice automáticamente cuando cambie el tema
  const imagesWithFilter = document.querySelectorAll('.image-filter');
  console.log('[Image Filter] Encontradas', imagesWithFilter.length, 'imágenes con clase image-filter');
  
  // Remover cualquier estilo inline previo y limpiar clases incorrectas
  imagesWithFilter.forEach((img, index) => {
    img.style.removeProperty('filter');
    const imgSrc = img.src || img.href || 'unknown';
    console.log(`[Image Filter] Estilo inline removido de imagen ${index + 1} (${imgSrc})`);
    
    // Verificar si es una imagen externa que no debería tener filtro
    if (imgSrc.match(/^https?:\/\//i)) {
      console.log(`[Image Filter] ⚠️  ADVERTENCIA: Imagen externa con clase image-filter: ${imgSrc}`);
      console.log(`[Image Filter] Removiendo clase image-filter de imagen externa: ${imgSrc}`);
      img.classList.remove('image-filter');
    }
  });
  
  // También remover estilos inline del side panel
  const sidePanelImages = document.querySelectorAll('.side-panel-title-thumbnail');
  sidePanelImages.forEach((img, index) => {
    img.style.removeProperty('filter');
    console.log(`[Image Filter] Estilo inline removido de side panel imagen ${index + 1}`);
  });
  
  // Agregar regla CSS que use la variable --image-filter
  const styleId = 'image-filter-css-rule';
  let existingStyle = document.getElementById(styleId);
  if (existingStyle) {
    existingStyle.remove();
  }
  
  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    .image-filter {
      filter: var(--image-filter) !important;
    }
    .side-panel-title-thumbnail {
      filter: var(--image-filter) !important;
    }
  `;
  document.head.appendChild(style);
  
  console.log('[Image Filter] Regla CSS agregada usando variable --image-filter');
  console.log('[Image Filter] Valor actual de --image-filter:', filterValue);
}

// Update switcher colors
function updateSwitcherColors() {
  // This function is no longer needed as CSS handles all styling
  // The diagram buttons now use CSS variables for consistent theming
  console.log('[Theme] Switcher colors are now handled by CSS variables');
}

// Generate unique key for localStorage based on file URL
function getStorageKey() {
  const path = window.location.pathname;
  const filename = path.split('/').pop() || 'index.html';
  const key = `selectedTheme_${filename}`;
  console.log('[Storage Key] Generada clave:', key, 'para archivo:', filename);
  return key;
}

// Get theme configuration with modern style fallback
function getThemeConfiguration() {
  const config = getXDiagramsConfiguration();
  
  // Try modern configuration first
  if (config.themes) {
    return {
      lightTheme: config.themes.light || 'snow',
      darkTheme: config.themes.dark || 'onyx'
    };
  }
  
  // Fallback to legacy configuration
  return getThemeConfigurationLegacy();
}

// Legacy theme configuration (for backward compatibility)
function getThemeConfigurationLegacy() {
  const container = document.querySelector('.xcanvas');
  if (!container) {
    return { lightTheme: 'snow', darkTheme: 'onyx' };
  }

  // Try to get JSON configuration first
  const jsonConfig = container.getAttribute('data-themes');
  if (jsonConfig) {
    try {
      const customConfig = JSON.parse(jsonConfig);
      return {
        lightTheme: customConfig.light || 'snow',
        darkTheme: customConfig.dark || 'onyx'
      };
    } catch (error) {
      console.warn('Error parsing data-themes JSON:', error);
    }
  }

  // Fallback to individual attributes
  return {
    lightTheme: container.getAttribute('data-light-theme') || 'snow',
    darkTheme: container.getAttribute('data-dark-theme') || 'onyx'
  };
}

// Determine if a theme is light or dark
function isLightTheme(themeId) {
  const lightThemes = ['snow', 'vintage', 'pastel'];
  const darkThemes = ['onyx', 'neon', 'forest'];
  
  // If explicitly defined as dark, return false
  if (darkThemes.includes(themeId)) {
    return false;
  }
  
  // If explicitly defined as light, return true
  if (lightThemes.includes(themeId)) {
    return true;
  }
  
  // Default: assume light theme
  return true;
}

// Get opposite theme based on configuration
function getOppositeTheme(currentTheme, config) {
  const isLight = isLightTheme(currentTheme);
  return isLight ? config.darkTheme : config.lightTheme;
}

// ============================================================================
// NUEVO SISTEMA DE TEMAS SIMPLIFICADO PARA XDIAGRAMS
// ============================================================================

// Global theme state
window.$xDiagrams.themeState = {
  current: 'snow',
  lightTheme: 'snow',
  darkTheme: 'onyx',
  isInitialized: false
};

// Simple theme toggle function
async function toggleTheme() {
  const state = window.$xDiagrams.themeState;
  const currentTheme = state.current;
  const isCurrentLight = isLightTheme(currentTheme);
  const newTheme = isCurrentLight ? state.darkTheme : state.lightTheme;
  
  // Update state
  state.current = newTheme;
  
  // Save to localStorage FIRST (before applying theme)
  const storageKey = getStorageKey();
  localStorage.setItem(storageKey, newTheme);
  localStorage.setItem('selectedTheme', newTheme);
  localStorage.setItem('themeMode', isLightTheme(newTheme) ? 'light' : 'dark');
  
  // Apply theme
  await setTheme(newTheme);
  
  // Trigger hook
  triggerHook('onThemeChange', { 
    theme: newTheme, 
    timestamp: new Date().toISOString() 
  });
}

// Initialize theme system (SIMPLIFIED - NO INTERFERENCE WITH LOADER)
async function initializeThemeSystem() {
  const config = getThemeConfiguration();
  const storageKey = getStorageKey();
  
  // Initialize global state
  window.$xDiagrams.themeState.lightTheme = config.lightTheme;
  window.$xDiagrams.themeState.darkTheme = config.darkTheme;
  
  // Get current theme from localStorage (loader already applied it)
  const savedTheme = localStorage.getItem(storageKey);
  const currentTheme = savedTheme || config.lightTheme;
  
  // Update state
  window.$xDiagrams.themeState.current = currentTheme;
  
  // Setup theme toggle
  setupThemeToggle();
  
  // Setup theme file watcher for automatic reloading
  setupThemeFileWatcher();
  
  window.$xDiagrams.themeState.isInitialized = true;
}

// Setup theme toggle button
function setupThemeToggle() {
  const themeToggle = document.getElementById('theme-toggle');
  if (!themeToggle) {
    console.warn('[XTheme] Botón de tema no encontrado');
    return;
  }
  
  // Remove existing listeners by cloning
  const newToggle = themeToggle.cloneNode(true);
  themeToggle.parentNode.replaceChild(newToggle, themeToggle);
  
  // Add new listener
  newToggle.addEventListener('click', async function(e) {
    e.preventDefault();
    e.stopPropagation();
    await toggleTheme();
  });
}

// Function to force default light theme
async function forceDefaultLightTheme() {
  const config = getThemeConfiguration();
  const storageKey = getStorageKey();
  localStorage.removeItem(storageKey);
  localStorage.setItem(`themeSystemInitialized_${storageKey}`, 'true');
  console.log('[Theme System] Forzando tema claro por defecto:', config.lightTheme);
  await setTheme(config.lightTheme);
}

// Function to preserve current theme
async function preserveCurrentTheme() {
  const storageKey = getStorageKey();
  const currentTheme = localStorage.getItem(storageKey);
  if (currentTheme) {
    console.log('[Theme System] Preservando tema actual:', currentTheme);
    // Apply current theme without changing localStorage
    const themeVariables = await getThemeVariables(currentTheme);
    const targetElement = document.querySelector('.xcanvas') || document.documentElement;
    
    Object.keys(themeVariables).forEach(varName => {
      targetElement.style.setProperty(varName, themeVariables[varName]);
      document.body.style.setProperty(varName, themeVariables[varName]);
      document.documentElement.style.setProperty(varName, themeVariables[varName]);
    });
    
    // Update SVG colors
    updateSVGColors();
    
    // Update switcher colors
    updateSwitcherColors();
  }
}

// Global function to reload themes (for external use)
window.reloadThemes = async function() {
  console.log('[Theme System] Recargando temas...');
  clearThemeCache();
  
  const storageKey = getStorageKey();
  const currentTheme = localStorage.getItem(storageKey) || 'snow';
  
  // Reapply current theme with fresh data
  await setTheme(currentTheme, true);
  
  console.log('[Theme System] Temas recargados exitosamente');
  return true;
};

// Function to check for theme file changes periodically
function setupThemeFileWatcher() {
  // Check for changes every 5 seconds
  setInterval(async () => {
    try {
      const response = await fetch('xthemes.json', { method: 'HEAD' });
      if (response.ok) {
        const lastModified = response.headers.get('Last-Modified');
        if (lastModified && lastThemeFileTimestamp && lastModified !== lastThemeFileTimestamp) {
          console.log('[Theme System] Cambios detectados en xthemes.json, recargando...');
          await window.reloadThemes();
        }
      }
    } catch (error) {
      // Silently ignore errors in file watching
    }
  }, 5000);
}

// --- Diagram management and switcher (no default diagrams) ---
window.$xDiagrams = window.$xDiagrams || {};
window.$xDiagrams.currentDiagramIdx = 0;
window.$xDiagrams.isLoading = false;
window.$xDiagrams.loadedDiagrams = new Map();
window.$xDiagrams.currentUrl = null;

// Keyboard navigation system
window.$xDiagrams.keyboardNavigation = {
  currentNodeIndex: -1,
  allNodes: [],
  isEnabled: false,
  
  // Initialize keyboard navigation
  init: function() {
    this.setupKeyboardListeners();
    },
  
  // Setup keyboard event listeners
  setupKeyboardListeners: function() {
    document.addEventListener('keydown', (e) => {
      if (!this.isEnabled) return;
      
      // Check if cluster click mode is active for cluster navigation
      const isClusterModeActive = window.$xDiagrams.clusterClickMode.active;
      const hasClusters = window.$xDiagrams.clusterClickMode.clusters && window.$xDiagrams.clusterClickMode.clusters.length > 0;
      
      // Cluster navigation commands (when cluster mode is active)
      if (isClusterModeActive && hasClusters) {
        if (e.ctrlKey || e.metaKey) {
          switch(e.key) {
            case 'ArrowLeft':
              e.preventDefault();
              this.navigateToPreviousCluster();
              return;
            case 'ArrowRight':
              e.preventDefault();
              this.navigateToNextCluster();
              return;
            case 'ArrowUp':
              e.preventDefault();
              this.navigateToFirstCluster();
              return;
            case 'ArrowDown':
              e.preventDefault();
              this.navigateToLastCluster();
              return;
            case 'Home':
              e.preventDefault();
              this.navigateToFirstCluster();
              return;
            case 'End':
              e.preventDefault();
              this.navigateToLastCluster();
              return;
          }
        }
      }
      
      // Regular node navigation commands
      // Node navigation commands - DISABLED (only cluster navigation works)
      // Regular node navigation commands are now disabled to focus on cluster navigation only
      switch(e.key) {
        case 'Escape':
          e.preventDefault();
          this.clearSelection();
          break;
        case ' ':
        case 'Enter':
          e.preventDefault();
          this.openCurrentNodeLink();
          break;
        case '0':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            resetZoom();
            console.log('[Keyboard] Zoom reset to default');
          }
          break;
        case '9':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            applyCustomZoom(0.3); // Very zoomed out
            console.log('[Keyboard] Applied very zoomed out view');
          }
          break;
        case '8':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            applyCustomZoom(0.5); // More zoomed out
            console.log('[Keyboard] Applied more zoomed out view');
          }
          break;
        case '7':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            applyCustomZoom(0.4); // More reasonable zoom out
            console.log('[Keyboard] Applied reasonable zoom out view');
          }
          break;
        case '6':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            applyCustomZoom(0.2); // Very zoomed out but not extreme
            console.log('[Keyboard] Applied very zoomed out view');
          }
          break;
      }
    });
  },
  
  // Update the list of all nodes
  updateNodesList: function() {
    this.allNodes = Array.from(document.querySelectorAll('.node'));
  },
  
  // Enable keyboard navigation
  enable: function() {
    this.isEnabled = true;
    this.updateNodesList();
  },
  
  // Disable keyboard navigation
  disable: function() {
    this.isEnabled = false;
    this.currentNodeIndex = -1;
  },
  
  // Navigate to parent node
  navigateToParent: function() {
    if (this.currentNodeIndex === -1 || this.allNodes.length === 0) return;
    
    const currentNode = this.allNodes[this.currentNodeIndex];
    const nodeData = this.getNodeData(currentNode);
    
    if (nodeData && nodeData.parent) {
      // Find parent node
      const parentIndex = this.allNodes.findIndex(node => {
        const data = this.getNodeData(node);
        return data && data.id === nodeData.parent;
      });
      
      if (parentIndex !== -1) {
        this.selectNode(parentIndex);
      }
    } else {
      // No parent found. Si todos los nodos son raíz (lista plana), usamos navegación vertical por columnas (grid)
      const isFlat = this.allNodes.every(n => {
        const d = this.getNodeData(n);
        return d && !d.parent;
      });

      if (isFlat) {
        this.navigateToNodeAbove();
      } else {
        // Caso estándar: ir al primer nodo raíz
        this.navigateToRootNode();
      }
    }
  },
  
  // Navigate to first child node
  navigateToFirstChild: function() {
    if (this.currentNodeIndex === -1 || this.allNodes.length === 0) return;
    
    const currentNode = this.allNodes[this.currentNodeIndex];
    const nodeData = this.getNodeData(currentNode);
    
    if (nodeData && nodeData.id) {
      // Find first child
      const childIndex = this.allNodes.findIndex(node => {
        const data = this.getNodeData(node);
        return data && data.parent === nodeData.id;
      });
      
      if (childIndex !== -1) {
        this.selectNode(childIndex);
      } else {
        // No children. Si es lista plana navegamos verticalmente hacia abajo (grid)
        const isFlat = this.allNodes.every(n => {
          const d = this.getNodeData(n);
          return d && !d.parent;
        });

        if (isFlat) {
          this.navigateToNodeBelow();
        } else {
          // Comportamiento original
          const currentLevel = this.getNodeLevel(nodeData);
          const nextLevelResult = this.navigateToFirstNodeOfNextLevel(currentLevel);
          if (!nextLevelResult) {
            this.navigateToFirst();
          }
        }
      }
    }
  },
  
  // Navigate to previous cousin (same level)
  navigateToPreviousSibling: function() {
    if (this.currentNodeIndex === -1 || this.allNodes.length === 0) return;
    
    const currentNode = this.allNodes[this.currentNodeIndex];
    const nodeData = this.getNodeData(currentNode);
    
    if (!nodeData) return;
    
    // Get the level of current node
    const currentLevel = this.getNodeLevel(nodeData);
    
    // Find all nodes at the same level
    const sameLevelNodes = this.allNodes.filter((node, index) => {
      const data = this.getNodeData(node);
      if (!data) return false;
      
      const nodeLevel = this.getNodeLevel(data);
      return nodeLevel === currentLevel;
    });
    
    // Sort nodes by their position in the array (left to right)
    sameLevelNodes.sort((a, b) => {
      const indexA = this.allNodes.indexOf(a);
      const indexB = this.allNodes.indexOf(b);
      return indexA - indexB;
    });
    
    // Find current node position among same-level nodes
    const currentIndex = sameLevelNodes.findIndex(node => {
      const data = this.getNodeData(node);
      return data && data.id === nodeData.id;
    });
    
    if (currentIndex > 0) {
      // Go to previous node at same level
      const previousNode = sameLevelNodes[currentIndex - 1];
      const previousNodeIndex = this.allNodes.indexOf(previousNode);
      this.selectNode(previousNodeIndex);
    } else {
      // We're at the first node of this level, wrap around to the last node
      const lastNode = sameLevelNodes[sameLevelNodes.length - 1];
      const lastNodeIndex = this.allNodes.indexOf(lastNode);
      this.selectNode(lastNodeIndex);
    }
  },
  
  // Navigate to next cousin (same level)
  navigateToNextSibling: function() {
    if (this.currentNodeIndex === -1 || this.allNodes.length === 0) return;
    
    const currentNode = this.allNodes[this.currentNodeIndex];
    const nodeData = this.getNodeData(currentNode);
    
    if (!nodeData) return;
    
    // Get the level of current node
    const currentLevel = this.getNodeLevel(nodeData);
    
    // Find all nodes at the same level
    const sameLevelNodes = this.allNodes.filter((node, index) => {
      const data = this.getNodeData(node);
      if (!data) return false;
      
      const nodeLevel = this.getNodeLevel(data);
      return nodeLevel === currentLevel;
    });
    
    // Sort nodes by their position in the array (left to right)
    sameLevelNodes.sort((a, b) => {
      const indexA = this.allNodes.indexOf(a);
      const indexB = this.allNodes.indexOf(b);
      return indexA - indexB;
    });
    
    // Find current node position among same-level nodes
    const currentIndex = sameLevelNodes.findIndex(node => {
      const data = this.getNodeData(node);
      return data && data.id === nodeData.id;
    });
    
    if (currentIndex < sameLevelNodes.length - 1) {
      // Go to next node at same level
      const nextNode = sameLevelNodes[currentIndex + 1];
      const nextNodeIndex = this.allNodes.indexOf(nextNode);
      this.selectNode(nextNodeIndex);
    } else {
      // We're at the last node of this level, wrap around to the first node
      const firstNode = sameLevelNodes[0];
      const firstNodeIndex = this.allNodes.indexOf(firstNode);
      this.selectNode(firstNodeIndex);
    }
  },
  
  // Navigate to next node in sequential order (like Tab in forms)
  navigateToNextSequential: function() {
    if (this.currentNodeIndex === -1 || this.allNodes.length === 0) return;
    
    const currentNode = this.allNodes[this.currentNodeIndex];
    const nodeData = this.getNodeData(currentNode);
    
    if (!nodeData) return;
    
    // Get the level of current node
    const currentLevel = this.getNodeLevel(nodeData);
    
    // Find all nodes at the same level
    const sameLevelNodes = this.allNodes.filter((node, index) => {
      const data = this.getNodeData(node);
      if (!data) return false;
      
      const nodeLevel = this.getNodeLevel(data);
      return nodeLevel === currentLevel;
    });
    
    // Sort nodes by their position in the array (left to right)
    sameLevelNodes.sort((a, b) => {
      const indexA = this.allNodes.indexOf(a);
      const indexB = this.allNodes.indexOf(b);
      return indexA - indexB;
    });
    
    // Find current node position among same-level nodes
    const currentIndex = sameLevelNodes.findIndex(node => {
      const data = this.getNodeData(node);
      return data && data.id === nodeData.id;
    });
    
    if (currentIndex < sameLevelNodes.length - 1) {
      // Go to next node at same level
      const nextNode = sameLevelNodes[currentIndex + 1];
      const nextNodeIndex = this.allNodes.indexOf(nextNode);
      this.selectNode(nextNodeIndex);
    } else {
      // We're at the last node of this level, try to go to first node of next level
      const nextLevelResult = this.navigateToFirstNodeOfNextLevel(currentLevel);
      
      // If no next level found, wrap around to the first node of the first level
      if (!nextLevelResult) {
        this.navigateToFirst();
      }
    }
  },
  
  // Navigate to previous node in sequential order (like Shift+Tab in forms)
  navigateToPreviousSequential: function() {
    if (this.currentNodeIndex === -1 || this.allNodes.length === 0) return;
    
    const currentNode = this.allNodes[this.currentNodeIndex];
    const nodeData = this.getNodeData(currentNode);
    
    if (!nodeData) return;
    
    // Get the level of current node
    const currentLevel = this.getNodeLevel(nodeData);
    
    // Find all nodes at the same level
    const sameLevelNodes = this.allNodes.filter((node, index) => {
      const data = this.getNodeData(node);
      if (!data) return false;
      
      const nodeLevel = this.getNodeLevel(data);
      return nodeLevel === currentLevel;
    });
    
    // Sort nodes by their position in the array (left to right)
    sameLevelNodes.sort((a, b) => {
      const indexA = this.allNodes.indexOf(a);
      const indexB = this.allNodes.indexOf(b);
      return indexA - indexB;
    });
    
    // Find current node position among same-level nodes
    const currentIndex = sameLevelNodes.findIndex(node => {
      const data = this.getNodeData(node);
      return data && data.id === nodeData.id;
    });
    
    if (currentIndex > 0) {
      // Go to previous node at same level
      const previousNode = sameLevelNodes[currentIndex - 1];
      const previousNodeIndex = this.allNodes.indexOf(previousNode);
      this.selectNode(previousNodeIndex);
    } else {
      // We're at the first node of this level, try to go to last node of previous level
      const previousLevelResult = this.navigateToLastNodeOfPreviousLevel(currentLevel);
      
      // If no previous level found, wrap around to the last node of the last level
      if (!previousLevelResult) {
        this.navigateToLast();
      }
    }
  },
  
  // Navigate to first node of next level
  navigateToFirstNodeOfNextLevel: function(currentLevel) {
    const nextLevel = currentLevel + 1;
    
    // Find all nodes at the next level
    const nextLevelNodes = this.allNodes.filter((node, index) => {
      const data = this.getNodeData(node);
      if (!data) return false;
      
      const nodeLevel = this.getNodeLevel(data);
      return nodeLevel === nextLevel;
    });
    
    if (nextLevelNodes.length > 0) {
      // Sort by position and select the first one
      nextLevelNodes.sort((a, b) => {
        const indexA = this.allNodes.indexOf(a);
        const indexB = this.allNodes.indexOf(b);
        return indexA - indexB;
      });
      
      const firstNodeOfNextLevel = nextLevelNodes[0];
      const firstNodeIndex = this.allNodes.indexOf(firstNodeOfNextLevel);
      this.selectNode(firstNodeIndex);
      return true; // Successfully found and selected a node
    }
    
    return false; // No nodes found at next level
  },
  
  // Navigate to last node of previous level
  navigateToLastNodeOfPreviousLevel: function(currentLevel) {
    const previousLevel = currentLevel - 1;
    
    if (previousLevel < 0) return false; // Can't go below level 0
    
    // Find all nodes at the previous level
    const previousLevelNodes = this.allNodes.filter((node, index) => {
      const data = this.getNodeData(node);
      if (!data) return false;
      
      const nodeLevel = this.getNodeLevel(data);
      return nodeLevel === previousLevel;
    });
    
    if (previousLevelNodes.length > 0) {
      // Sort by position and select the last one
      previousLevelNodes.sort((a, b) => {
        const indexA = this.allNodes.indexOf(a);
        const indexB = this.allNodes.indexOf(b);
        return indexA - indexB;
      });
      
      const lastNodeOfPreviousLevel = previousLevelNodes[previousLevelNodes.length - 1];
      const lastNodeIndex = this.allNodes.indexOf(lastNodeOfPreviousLevel);
      this.selectNode(lastNodeIndex);
      return true; // Successfully found and selected a node
    }
    
    return false; // No nodes found at previous level
  },
  
  // Navigate to first node
  navigateToFirst: function() {
    if (this.allNodes.length === 0) return;
    this.currentNodeIndex = 0;
    this.selectNode(this.currentNodeIndex);
  },
  
  // Navigate to last node
  navigateToLast: function() {
    if (this.allNodes.length === 0) return;
    this.currentNodeIndex = this.allNodes.length - 1;
    this.selectNode(this.currentNodeIndex);
  },
  
  // Navigate to root node (level 0)
  navigateToRootNode: function() {
    if (this.allNodes.length === 0) return;
    
    // Find all nodes at level 0 (root level)
    const rootNodes = this.allNodes.filter((node, index) => {
      const data = this.getNodeData(node);
      if (!data) return false;
      
      const nodeLevel = this.getNodeLevel(data);
      return nodeLevel === 0;
    });
    
    if (rootNodes.length > 0) {
      // Sort by position and select the first root node
      rootNodes.sort((a, b) => {
        const indexA = this.allNodes.indexOf(a);
        const indexB = this.allNodes.indexOf(b);
        return indexA - indexB;
      });
      
      const firstRootNode = rootNodes[0];
      const rootNodeIndex = this.allNodes.indexOf(firstRootNode);
      this.selectNode(rootNodeIndex);
    } else {
      // Fallback to first node if no root nodes found
      this.navigateToFirst();
    }
  },
  
  // Select a specific node by index
  selectNode: function(index) {
    if (index < 0 || index >= this.allNodes.length) return;
    
    // Clear previous selection
    this.clearSelection();
    
    // Select new node
    const node = this.allNodes[index];
    if (node) {
      node.classList.add('node-selected');
      this.currentNodeIndex = index;
      
      // Get node data and open side panel
      const nodeData = this.getNodeData(node);
      if (nodeData) {
        openSidePanel(nodeData);
      }
      
      // Scroll node into view
      this.scrollNodeIntoView(node);
      
    }
  },
  
  // Clear current selection
  clearSelection: function() {
    document.querySelectorAll('.node-selected').forEach(node => {
      node.classList.remove('node-selected');
    });
    this.currentNodeIndex = -1;
    closeSidePanel();
  },
  
  // Get node data from DOM element
  getNodeData: function(nodeElement) {
    // Try to get data from the node element
    const nodeId = nodeElement.getAttribute('data-id') || 
                   nodeElement.querySelector('[data-id]')?.getAttribute('data-id');
    
    if (!nodeId) return null;
    
    // Find the corresponding data in the global data structure
    // This assumes the data is stored globally when the diagram is loaded
    if (window.$xDiagrams.currentData) {
      return window.$xDiagrams.currentData.find(item => item.id === nodeId);
    }
    
    return null;
  },
  
  // Calculate the hierarchical level of a node
  getNodeLevel: function(nodeData) {
    if (!nodeData) return 0;
    
    let level = 0;
    let current = nodeData;
    
    // Count how many levels up we need to go to reach the root
    while (current.parent) {
      level++;
      current = window.$xDiagrams.currentData.find(item => item.id === current.parent);
      if (!current) break;
    }
    
    return level;
  },
  
  // Scroll node into view
  scrollNodeIntoView: function(node) {
    const svg = document.getElementById('main-diagram-svg');
    if (!svg) return;
    
    const nodeRect = node.getBoundingClientRect();
    const svgRect = svg.getBoundingClientRect();
    
    // Calculate if node is outside viewport
    const isOutsideTop = nodeRect.top < svgRect.top;
    const isOutsideBottom = nodeRect.bottom > svgRect.bottom;
    const isOutsideLeft = nodeRect.left < svgRect.left;
    const isOutsideRight = nodeRect.right > svgRect.right;
    
    if (isOutsideTop || isOutsideBottom || isOutsideLeft || isOutsideRight) {
      // Use smooth scrolling if available
      node.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center'
      });
    }
  },
  
  // Open the link of the currently selected node in a new tab
  openCurrentNodeLink: function() {
    if (this.currentNodeIndex === -1 || this.allNodes.length === 0) {
      return;
    }
    
    const currentNode = this.allNodes[this.currentNodeIndex];
    const nodeData = this.getNodeData(currentNode);
    
    if (!nodeData) {
      return;
    }
    
    // Get the URL from the node data
    const url = nodeData.url;
    
    if (!url) {
      return;
    }
    
    // Validate URL format
    if (!isUrl(url)) {
      return;
    }
    
    // Open URL in new tab with security attributes
    if (!openUrlSecurely(url)) {
      console.error('[Keyboard Navigation] Failed to open link for node:', nodeData.name);
    }
  },
  
  // Navegar al nodo inmediatamente arriba en una lista plana mostrada en grid
  navigateToNodeAbove: function() {
    if (this.currentNodeIndex === -1 || this.allNodes.length === 0) return;

    const currentNode = this.allNodes[this.currentNodeIndex];
    const currentRect = currentNode.getBoundingClientRect();
    const currentCenterX = currentRect.left + currentRect.width / 2;
    const currentCenterY = currentRect.top + currentRect.height / 2;

    let bestIndex = -1;
    let bestDY = Infinity;
    let bestDX = Infinity;

    this.allNodes.forEach((node, idx) => {
      if (idx === this.currentNodeIndex) return;
      const rect = node.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaY = centerY - currentCenterY; // negativo si está arriba
      if (deltaY >= -2) return; // sólo considerar nodos con Y menor (arriba)

      const dy = Math.abs(deltaY);
      const dx = Math.abs(centerX - currentCenterX);

      if (dy < bestDY || (dy === bestDY && dx < bestDX)) {
        bestDY = dy;
        bestDX = dx;
        bestIndex = idx;
      }
    });

    if (bestIndex !== -1) {
      this.selectNode(bestIndex);
    }
  },

  // Navegar al nodo inmediatamente abajo en una lista plana mostrada en grid
  navigateToNodeBelow: function() {
    if (this.currentNodeIndex === -1 || this.allNodes.length === 0) return;

    const currentNode = this.allNodes[this.currentNodeIndex];
    const currentRect = currentNode.getBoundingClientRect();
    const currentCenterX = currentRect.left + currentRect.width / 2;
    const currentCenterY = currentRect.top + currentRect.height / 2;

    let bestIndex = -1;
    let bestDY = Infinity;
    let bestDX = Infinity;

    this.allNodes.forEach((node, idx) => {
      if (idx === this.currentNodeIndex) return;
      const rect = node.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaY = centerY - currentCenterY; // positivo si está abajo
      if (deltaY <= 2) return; // sólo considerar nodos con Y mayor (abajo)

      const dy = deltaY; // ya positivo
      const dx = Math.abs(centerX - currentCenterX);

      if (dy < bestDY || (dy === bestDY && dx < bestDX)) {
        bestDY = dy;
        bestDX = dx;
        bestIndex = idx;
      }
    });

    if (bestIndex !== -1) {
      this.selectNode(bestIndex);
    }
  },
  
  // Cluster navigation functions
  navigateToPreviousCluster: function() {
    if (!window.$xDiagrams.clusterClickMode.clusters || window.$xDiagrams.clusterClickMode.clusters.length === 0) {
      console.log('[Keyboard] No clusters available for navigation');
      return;
    }
    
    const clusters = window.$xDiagrams.clusterClickMode.clusters;
    const currentCluster = window.$xDiagrams.clusterClickMode.selectedCluster;
    
    if (!currentCluster) {
      // If no cluster is selected, select the first one
      console.log('[Keyboard] No cluster selected, selecting first cluster');
      this.selectCluster(clusters[0]);
      return;
    }
    
    // Find current cluster index
    const currentIndex = clusters.findIndex(cluster => cluster.id === currentCluster.id);
    if (currentIndex === -1) {
      console.log('[Keyboard] Current cluster not found in list, selecting first cluster');
      this.selectCluster(clusters[0]);
      return;
    }
    
    // Navigate to previous cluster (with wrap-around)
    const previousIndex = currentIndex === 0 ? clusters.length - 1 : currentIndex - 1;
    console.log('[Keyboard] Navigating to previous cluster:', clusters[previousIndex].id);
    this.selectCluster(clusters[previousIndex]);
  },
  
  navigateToNextCluster: function() {
    if (!window.$xDiagrams.clusterClickMode.clusters || window.$xDiagrams.clusterClickMode.clusters.length === 0) {
      console.log('[Keyboard] No clusters available for navigation');
      return;
    }
    
    const clusters = window.$xDiagrams.clusterClickMode.clusters;
    const currentCluster = window.$xDiagrams.clusterClickMode.selectedCluster;
    
    if (!currentCluster) {
      // If no cluster is selected, select the first one
      console.log('[Keyboard] No cluster selected, selecting first cluster');
      this.selectCluster(clusters[0]);
      return;
    }
    
    // Find current cluster index
    const currentIndex = clusters.findIndex(cluster => cluster.id === currentCluster.id);
    if (currentIndex === -1) {
      console.log('[Keyboard] Current cluster not found in list, selecting first cluster');
      this.selectCluster(clusters[0]);
      return;
    }
    
    // Navigate to next cluster (with wrap-around)
    const nextIndex = currentIndex === clusters.length - 1 ? 0 : currentIndex + 1;
    console.log('[Keyboard] Navigating to next cluster:', clusters[nextIndex].id);
    this.selectCluster(clusters[nextIndex]);
  },
  
  navigateToFirstCluster: function() {
    if (!window.$xDiagrams.clusterClickMode.clusters || window.$xDiagrams.clusterClickMode.clusters.length === 0) {
      console.log('[Keyboard] No clusters available for navigation');
      return;
    }
    
    const clusters = window.$xDiagrams.clusterClickMode.clusters;
    console.log('[Keyboard] Navigating to first cluster:', clusters[0].id);
    this.selectCluster(clusters[0]);
  },
  
  navigateToLastCluster: function() {
    if (!window.$xDiagrams.clusterClickMode.clusters || window.$xDiagrams.clusterClickMode.clusters.length === 0) {
      console.log('[Keyboard] No clusters available for navigation');
      return;
    }
    
    const clusters = window.$xDiagrams.clusterClickMode.clusters;
    const lastCluster = clusters[clusters.length - 1];
    console.log('[Keyboard] Navigating to last cluster:', lastCluster.id);
    this.selectCluster(lastCluster);
  },
  
  // Helper function to select a cluster
  selectCluster: function(clusterInfo) {
    if (!clusterInfo) {
      console.warn('[Keyboard] No cluster info provided for selection');
      return;
    }
    
    // Deselect current cluster if any
    const currentCluster = window.$xDiagrams.clusterClickMode.selectedCluster;
    if (currentCluster && currentCluster.id !== clusterInfo.id) {
      deselectCurrentCluster('keyboard-navigation');
    }
    
    // Select the new cluster
    window.$xDiagrams.clusterClickMode.selectedCluster = clusterInfo;
    
    // Apply visual selection styles
    const rect = clusterInfo.rect;
    if (rect && rect.node()) {
      rect
        .attr("data-selected", "true")
        .style("fill", "var(--cluster-selected-bg, rgba(255, 152, 0, 0.25))")
        .style("stroke", "var(--cluster-selected-stroke, #ff9800)")
        .style("stroke-width", "4")
        .style("stroke-dasharray", "none")
        .style("box-shadow", "0 0 8px rgba(255, 152, 0, 0.3)");
      
      // Disable hover on selected cluster
      rect.on("mouseenter", null).on("mouseleave", null);
    }
    
    // Zoom to the cluster
    zoomToCluster(clusterInfo);
  }
};
// DO NOT define default diagrams here
window.$xDiagrams.getDiagramIndexFromURL = function() {
    const urlParams = new URLSearchParams(window.location.search);
    const diagramId = urlParams.get('d');
    const diagrams = getDiagrams();
    if (diagramId !== null && Array.isArray(diagrams)) {
        const index = parseInt(diagramId);
        if (!isNaN(index) && index >= 0 && index < diagrams.length) {
            return index;
        }
    }
    return 0;
};
window.$xDiagrams.updateTopbarTitle = async function(diagramIndex, useTransition = false) {
    // Check if logo is defined (has priority over title)
    let logoUrl = window.$xDiagrams && window.$xDiagrams.logo ? window.$xDiagrams.logo : null;
    
    // If no logo in $xDiagrams, try data-logo attribute
    if (!logoUrl) {
        const originalContainer = document.querySelector('.xcanvas');
        logoUrl = originalContainer ? originalContainer.getAttribute('data-logo') : null;
    }
    
    // If still no logo, try auto-detection
    if (!logoUrl) {
        try {
            await detectAutoLogo();
            // Check again after auto-detection
            logoUrl = window.$xDiagrams && window.$xDiagrams.logo ? window.$xDiagrams.logo : null;
        } catch (error) {
            console.log('[Auto Logo] Error durante detección automática:', error);
        }
    }
    
    // Get title from $xDiagrams object first, then fallback to HTML
    let fixedTitle = window.$xDiagrams && window.$xDiagrams.title ? window.$xDiagrams.title : null;
    
    // If no title in $xDiagrams, try data-title attribute
    if (!fixedTitle) {
        const originalContainer = document.querySelector('.xcanvas');
        fixedTitle = originalContainer ? originalContainer.getAttribute('data-title') : null;
    }
    
    // If no data-title is defined, use the HTML <title> element
    if (!fixedTitle) {
        const pageTitle = document.querySelector('title');
        fixedTitle = pageTitle ? pageTitle.textContent : 'Swanix Diagrams';
    }
    
    console.log('[Debug] fixedTitle value:', fixedTitle);
    console.log('[Debug] logoUrl value:', logoUrl);
    
    // Find the title-dropdown-container
    const titleDropdownContainer = document.querySelector('.title-dropdown-container');
    console.log('[Debug] titleDropdownContainer found:', !!titleDropdownContainer);
    if (titleDropdownContainer) {
        // Store dropdown for later re-addition
        const dropdown = titleDropdownContainer.querySelector('.diagram-dropdown');
        
        // Only apply transition if explicitly requested (for initial load)
        if (useTransition) {
            // Fade out current content
            titleDropdownContainer.style.opacity = '0';
            
            // Wait for fade out, then update content
            setTimeout(() => {
                updateTitleContent();
            }, 100);
        } else {
            // Direct update without transition
            updateTitleContent();
        }
        
        function updateTitleContent() {
            // Clear existing content except the dropdown
            titleDropdownContainer.innerHTML = '';
            
            // Manage no-logo class for fixed spacing
            if (logoUrl) {
                titleDropdownContainer.classList.remove('no-logo');
            } else {
                titleDropdownContainer.classList.add('no-logo');
            }
        
        // Add logo first if available
        if (logoUrl) {
            const newLogoElement = document.createElement('img');
            newLogoElement.className = 'diagram-logo';
            newLogoElement.src = logoUrl;
            newLogoElement.alt = 'Logo';
            newLogoElement.style.maxHeight = '48px';
            newLogoElement.style.maxWidth = '180px';
            newLogoElement.style.objectFit = 'contain';
            newLogoElement.style.padding = '8px 0';
            newLogoElement.style.marginRight = '-4px';
            titleDropdownContainer.appendChild(newLogoElement);
            console.log('[Logo] Logo aplicado:', logoUrl);
        }
        
        // Always show title after logo
        if (fixedTitle) {
            const newTitleElement = document.createElement('h1');
            newTitleElement.className = 'diagram-title';
            newTitleElement.textContent = fixedTitle;
            newTitleElement.style.margin = '0 8px 0 0';
            newTitleElement.style.fontSize = '1em';
            newTitleElement.style.fontWeight = '600';
            newTitleElement.style.color = 'var(--topbar-text, #333)';
            titleDropdownContainer.appendChild(newTitleElement);
            console.log('[Title] Título aplicado:', fixedTitle);
        }
        
        // Re-add the dropdown if it existed
        if (dropdown) {
            titleDropdownContainer.appendChild(dropdown);
        }
        
        // Fade in the updated content only if transition was used
        if (useTransition) {
            titleDropdownContainer.style.opacity = '1';
        }
        }
    }
};
window.$xDiagrams.renderDiagramButtons = function() {
    const dropdown = document.getElementById('diagram-dropdown');
    const dropdownContent = document.getElementById('diagram-dropdown-content');
    const dropdownBtn = document.getElementById('diagram-dropdown-btn');
    const dropdownText = dropdownBtn ? dropdownBtn.querySelector('.dropdown-text') : null;
    
    if (!dropdown || !dropdownContent) return;
    
    dropdownContent.innerHTML = '';
    
    const diagrams = getDiagrams();
    if (!Array.isArray(diagrams) || diagrams.length === 0) {
        // Show centered message
        const msg = document.createElement('div');
        msg.style.textAlign = 'center';
        msg.style.padding = '20px';
        msg.style.color = 'var(--text-color, #333)';
        msg.style.fontSize = '0.9em';
        msg.textContent = 'Sin datos';
        dropdownContent.appendChild(msg);
        if (dropdownText) dropdownText.textContent = 'Sin diagramas';
        return;
    }
    
    // Update dropdown button text with current selection
    if (dropdownText && diagrams[window.$xDiagrams.currentDiagramIdx]) {
        dropdownText.textContent = formatDiagramName(diagrams[window.$xDiagrams.currentDiagramIdx].name);
    }
    
    diagrams.forEach((d, idx) => {
        const link = document.createElement('a');
        link.href = `?d=${idx}`;
        link.className = 'switcher-btn' + (idx === window.$xDiagrams.currentDiagramIdx ? ' active' : '');
        link.textContent = formatDiagramName(d.name);
        link.style.textDecoration = 'none';
        
        if (window.$xDiagrams.isLoading) {
            link.style.pointerEvents = 'none';
            link.style.opacity = '0.5';
        }
        
        link.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (window.$xDiagrams.currentDiagramIdx !== idx && !window.$xDiagrams.isLoading) {
                // Close side panel if open
                if (window.closeSidePanel) {
                    window.closeSidePanel();
                }
                
                // Clear cache before switching diagrams (only for remote files)
                if (window.$xDiagrams.clearCache && typeof d.file === 'string') {
                    window.$xDiagrams.clearCache();
                }
                
                const url = new URL(window.location);
                url.searchParams.set('d', idx.toString());
                window.history.pushState({}, '', url);
                window.$xDiagrams.currentDiagramIdx = idx;
                window.$xDiagrams.updateTopbarTitle(idx).catch(error => {
                    console.error('[Topbar] Error updating title:', error);
                });
                window.$xDiagrams.renderDiagramButtons();
                window.$xDiagrams.loadDiagram(d);
                
                // Close dropdown after selection
                dropdown.classList.remove('open');
            }
        });
        
        dropdownContent.appendChild(link);
    });
    
    // Remove any existing Google Sheets button and cache refresh button
    const existingSheetsBtn = dropdown.querySelector('.sheets-btn');
    const existingCacheBtn = dropdown.querySelector('.cache-refresh-btn');
    if (existingSheetsBtn) {
        existingSheetsBtn.remove();
    }
    if (existingCacheBtn) {
        existingCacheBtn.remove();
    }
    
    // Add Google Sheets button if current diagram is from Google Sheets AND has edit URL
    let sheetsButton = null;
    const currentDiagram = diagrams[window.$xDiagrams.currentDiagramIdx];
    const diagramUrl = currentDiagram?.url || currentDiagram?.file;
    if (currentDiagram && diagramUrl && diagramUrl.includes('docs.google.com/spreadsheets') && currentDiagram.edit) {
        // Create Google Sheets button
        sheetsButton = document.createElement('button');
        sheetsButton.className = 'sheets-btn';
        sheetsButton.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
            </svg>
        `;
        sheetsButton.title = 'Abrir archivo';
        
        sheetsButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Open edit URL in new tab with security attributes
            if (!openUrlSecurely(currentDiagram.edit)) {
                console.error('[Google Sheets] Failed to open edit link');
            }
            
            // Close dropdown
            dropdown.classList.remove('open');
        });
        
        // Insert button after the dropdown content
        dropdown.appendChild(sheetsButton);
    }
    
    // Add cache refresh button SOLO para diagramas que se cargan desde una API REST REMOTA (no local)
    if (currentDiagram && (currentDiagram.url || currentDiagram.file) && typeof isRestApiEndpoint === 'function') {
        const diagramUrl = currentDiagram.url || currentDiagram.file;
        // Detectar si la URL pertenece al mismo origen (local) o es relativa → tratar como local
        let isLocalResource = false;
        try {
            const parsed = new URL(diagramUrl, window.location.href);
            isLocalResource = parsed.origin === window.location.origin;
        } catch (e) {
            // URL relativa → local
            isLocalResource = true;
        }

        // Sólo mostrar el botón si ES endpoint REST y NO es recurso local
        if (isRestApiEndpoint(diagramUrl) && !isLocalResource) {
            const cacheButton = document.createElement('button');
            cacheButton.className = 'cache-refresh-btn';
            cacheButton.innerHTML = `
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z"/>
                </svg>
            `;
            cacheButton.title = 'Refrescar caché y recargar';
            
            // Si NO hay botón de Sheets, agrego clase 'solo' para ajustar posición
            if (!sheetsButton) {
                cacheButton.classList.add('solo');
            }
            
            cacheButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // Add loading animation
                cacheButton.classList.add('loading');
                
                // Get the URL to clear cache for
                const diagramUrl = currentDiagram.url || currentDiagram.file;
                
                // Clear cache for this specific URL
                if (window.xDiagramsCache && window.xDiagramsCache.clear) {
                    window.xDiagramsCache.clear(diagramUrl);
                    console.log('Cache cleared for:', diagramUrl);
                }
                
                // Also clear legacy cache
                if (window.$xDiagrams.clearCache) {
                    window.$xDiagrams.clearCache();
                }
                
                // Reload the current diagram after a short delay
                setTimeout(() => {
                    window.$xDiagrams.loadDiagram(currentDiagram);
                    
                    // Remove loading animation after a bit more delay
                    setTimeout(() => {
                        cacheButton.classList.remove('loading');
                    }, 1000);
                }, 100);
                
                // Close dropdown
                dropdown.classList.remove('open');
            });
            
            // Insert button after the dropdown content (before sheets button if it exists)
            dropdown.appendChild(cacheButton);
        }
    }
    
    // Apply current theme colors to the switcher buttons
    updateSwitcherColors();
};
window.$xDiagrams.loadDiagram = function(input) {
    const diagrams = getDiagrams();
    if (!Array.isArray(diagrams) || diagrams.length === 0) {
        return;
    }
    if (window.$xDiagrams.isLoading) return;

    // Cierra el panel lateral si está abierto
    if (window.closeSidePanel) {
        window.closeSidePanel();
    }

    // Remove diagram not found overlay immediately without fade
    const overlay = document.getElementById('diagram-not-found-overlay');
    if (overlay) {
        overlay.remove();
    }

    window.$xDiagrams.isLoading = true;

    // Lógica robusta para soportar string, objeto con url/file, objeto con data
    let diagramToLoad = input;
    if (typeof input === 'string') {
        // Buscar el objeto diagrama si existe (por url o file)
        diagramToLoad = diagrams.find(d => d.url === input || d.file === input) || { url: input };
        window.$xDiagrams.currentUrl = input;
    } else if (typeof input === 'object' && input !== null) {
        if (input.data) {
            // Es un objeto local (drag & drop)
            diagramToLoad = input;
            window.$xDiagrams.currentUrl = input.url || input.file || null;
        } else if (input.url) {
            // Es un objeto con url (local o remota)
            diagramToLoad = input;
            window.$xDiagrams.currentUrl = input.url;
        } else if (input.file) {
            // Es un objeto con file (compatibilidad)
            diagramToLoad = input;
            window.$xDiagrams.currentUrl = input.file;
        }
    }

    // Limpia el cache solo si es una URL remota
    if ((diagramToLoad.url && typeof diagramToLoad.url === 'string') || 
        (diagramToLoad.file && typeof diagramToLoad.file === 'string')) {
        window.$xDiagrams.clearCache();
    }

    // Decide qué pasar a initDiagram:
    // - Si tiene data, pásalo directo
    // - Si tiene urls (array), pásale el array de URLs
    // - Si tiene url (string), pásale la URL
    // - Si tiene file, pásale la file (compatibilidad)
    let toInit = diagramToLoad;
    if (diagramToLoad.data) {
        toInit = diagramToLoad;
        console.log('Pasando objeto con data a initDiagram');
    } else if (diagramToLoad.urls && Array.isArray(diagramToLoad.urls)) {
        toInit = diagramToLoad.urls;
        console.log('Pasando array de URLs a initDiagram:', diagramToLoad.urls.length, 'URLs');
    } else if (diagramToLoad.url) {
        toInit = diagramToLoad.url;
        console.log('Pasando URL a initDiagram:', diagramToLoad.url);
    } else if (diagramToLoad.file) {
        toInit = diagramToLoad.file;
        console.log('Pasando file a initDiagram:', diagramToLoad.file);
    } else {
        console.log('No se encontró data, urls, url o file en el diagrama:', diagramToLoad);
    }

    // Limpieza visual
    const svgD3 = d3.select("#main-diagram-svg");
    if (!svgD3.empty()) svgD3.interrupt();
    const loading = document.getElementById('loading');
    if (loading) loading.style.display = 'block';
    const svg = document.getElementById('main-diagram-svg');
    if (svg) {
        svg.style.transition = 'none';
        svg.style.opacity = '0';
        svg.classList.remove('loaded');
        svg.style.pointerEvents = 'none';
        svg.innerHTML = '';
    }
    const error = document.getElementById('error-message');
    if (error) error.textContent = '';

    if (window.initDiagram) {
        window.initDiagram(toInit, function() {
            if (isOptionEnabled('autoZoom') !== false && window.applyAutoZoom) {
                window.applyAutoZoom();
            }
            

            
            setTimeout(() => {
                if (loading) loading.style.display = 'none';
                if (svg) {
                    svg.style.transition = '';
                    svg.style.opacity = '1';
                    svg.classList.add('loaded');
                    svg.style.pointerEvents = 'auto';
                    if (window.ensureZoomBehavior) window.ensureZoomBehavior();
                    if (window.setupClosePanelOnSvgClick) window.setupClosePanelOnSvgClick();
                }
                window.$xDiagrams.isLoading = false;
            }, 100);
        }, 0, diagramToLoad);
        setTimeout(() => {
            if (window.$xDiagrams.isLoading) {
                if (loading) loading.style.display = 'none';
                if (svg) svg.classList.add('loaded');
                window.$xDiagrams.isLoading = false;
                window.$xDiagrams.currentUrl = null;
            }
        }, 10000);
    } else {
        window.$xDiagrams.isLoading = false;
    }
};
window.$xDiagrams.clearCache = function() {
    window.$xDiagrams.loadedDiagrams.clear();
    window.$xDiagrams.currentUrl = null;
    
    // Clear browser cache for CSV and SVG files
    if ('caches' in window) {
        caches.keys().then(function(names) {
            for (let name of names) {
                caches.delete(name);
            }
        });
    }
    
    // Force reload of images by clearing their cache
    const images = document.querySelectorAll('image');
    images.forEach(img => {
        const currentSrc = img.getAttribute('href');
        if (currentSrc) {
            const cacheBuster = `?t=${Date.now()}`;
            const newSrc = currentSrc.includes('?') ? 
                `${currentSrc}&_cb=${Date.now()}` : 
                `${currentSrc}${cacheBuster}`;
            img.setAttribute('href', newSrc);
        }
    });
    
    // Limpia solo claves de caché obsoletas o no utilizadas, pero
    // preserva las claves del nuevo sistema de caché (xdiagrams_cache_*)
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        // Mantener la nueva caché inteligente y sus estadísticas
        if (key && (key.startsWith('xdiagrams_cache_') || key === 'xdiagrams_cache_stats')) {
            continue; // no eliminar
        }
        // Eliminar entradas antiguas o irrelevantes
        if (key && (key.includes('diagram') || key.includes('cache') || key.includes('data'))) {
            keysToRemove.push(key);
        }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    console.log('[Cache] Cache cleared (legacy only) and images refreshed');
};

// --- End diagram management ---

// --- Automatic rendering of base structure if it doesn't exist ---
function renderSwDiagramBase() {
  if (!document.getElementById('sw-diagram')) {
    const container = document.createElement('div');
    container.id = 'sw-diagram';
    container.className = 'xcanvas';
    
    // Preserve drag & drop elements from the original container
    const originalCanvas = document.querySelector('.xcanvas:not(#sw-diagram)');
    let dragDropElements = '';
    if (originalCanvas) {
      const fileDropZone = originalCanvas.querySelector('#fileDropZone');
      const dragOverlay = document.querySelector('#dragOverlay');
      
      if (fileDropZone) {
        dragDropElements += fileDropZone.outerHTML;
      }
      if (dragOverlay) {
        dragDropElements += dragOverlay.outerHTML;
      }
    }
    
    // Get theme configuration from original container
    const originalContainer = document.querySelector('.xcanvas');
    if (originalContainer) {
      const jsonThemes = originalContainer.getAttribute('data-themes');
      if (jsonThemes) {
        try {
          const themes = JSON.parse(jsonThemes);
          container.setAttribute('data-themes', jsonThemes);
        } catch (error) {
          console.warn('Error parsing themes JSON:', error);
          container.setAttribute('data-light-theme', 'snow');
          container.setAttribute('data-dark-theme', 'onyx');
        }
      } else {
        // Fallback to individual attributes
        const lightTheme = originalContainer.getAttribute('data-light-theme') || 'snow';
        const darkTheme = originalContainer.getAttribute('data-dark-theme') || 'onyx';
        container.setAttribute('data-light-theme', lightTheme);
        container.setAttribute('data-dark-theme', darkTheme);
      }
    } else {
      // Default fallback
      container.setAttribute('data-light-theme', 'snow');
      container.setAttribute('data-dark-theme', 'onyx');
    }
    
    // Check if logo is defined (has priority over title)
    let logoUrl = window.$xDiagrams && window.$xDiagrams.logo ? window.$xDiagrams.logo : null;
    
    // If no logo in $xDiagrams, try data-logo attribute
    if (!logoUrl) {
        const logoContainer = document.querySelector('.xcanvas');
        logoUrl = logoContainer ? logoContainer.getAttribute('data-logo') : null;
    }
    
    // If still no logo, try auto-detection
    if (!logoUrl) {
        detectAutoLogo().catch(error => {
            console.log('[Auto Logo] Error durante detección automática:', error);
        });
        // Check again after auto-detection
        logoUrl = window.$xDiagrams && window.$xDiagrams.logo ? window.$xDiagrams.logo : null;
    }
    
    // Get fixed title from $xDiagrams object first, then fallback to HTML (only if no logo)
    let fixedTitle = null;
    if (!logoUrl) {
        fixedTitle = window.$xDiagrams && window.$xDiagrams.title ? window.$xDiagrams.title : null;
        
        // If no title in $xDiagrams, try data-title attribute
        if (!fixedTitle) {
            const titleContainer = document.querySelector('.xcanvas');
            fixedTitle = titleContainer ? titleContainer.getAttribute('data-title') : null;
        }
        
        // If no data-title is defined, use the HTML <title> element
        if (!fixedTitle) {
            const pageTitle = document.querySelector('title');
            fixedTitle = pageTitle ? pageTitle.textContent : 'SW Diagrams';
        }
    }
    
    container.innerHTML = `
      <div class="topbar">
        <div class="topbar-left">
          <div class="title-dropdown-container">
            ${logoUrl ? `<img class="diagram-logo" src="${logoUrl}" alt="Logo" style="max-height: 48px; max-width: 180px; object-fit: contain; padding: 8px 0; margin-right: -4px;">` : ''}
            <h1 class="diagram-title">${fixedTitle}</h1>
            <div class="diagram-dropdown" id="diagram-dropdown">
              <button class="diagram-dropdown-btn" id="diagram-dropdown-btn">
                <span class="dropdown-text">Seleccionar diagrama</span>
                <svg class="dropdown-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M7 10l5 5 5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
              <div class="diagram-dropdown-content" id="diagram-dropdown-content">
              </div>
            </div>
          </div>
        </div>
        <div class="topbar-center">
          <!-- Área central vacía -->
        </div>
        <div class="topbar-right">
          <div class="theme-controls">
            <button id="theme-toggle" class="theme-toggle" title="Cambiar tema">
              <svg class="theme-icon sun-icon" width="18" height="18" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="4" fill="currentColor"></circle>
                <g stroke="currentColor" stroke-width="2" stroke-linecap="round">
                  <line x1="12" y1="1" x2="12" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="23"></line>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                  <line x1="1" y1="12" x2="3" y2="12"></line>
                  <line x1="21" y1="12" x2="23" y2="12"></line>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </g>
              </svg>
              <svg class="theme-icon moon-icon" width="18" height="18" viewBox="0 0 24 24">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="currentColor"></path>
              </svg>
            </button>
            <!-- Botón data-refresh oculto temporalmente
            <button id="data-refresh" class="theme-toggle data-refresh-btn" title="Refrescar datos">
              <svg class="theme-icon refresh-icon" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z"></path>
              </svg>
            </button>
            -->
          </div>
        </div>
      </div>
      <div class="diagram-switcher" id="diagram-switcher">
        <div class="switcher-header">
        </div>
      </div>
      <svg id="main-diagram-svg"></svg>
      <div id="loading" class="loading"><div class="spinner"></div></div>
      <small id="error-message" class="error-message"></small>
      <div class="file-drop-zone" id="fileDropZone">
        <span class="icon">
          ${getEmbeddedDragDropIcon('document')}
        </span>
        <div class="text">Suelta tu archivo CSV aquí</div>
        <div class="subtext">o arrastra desde tu computadora</div>
      </div>
      <div class="drag-overlay" id="dragOverlay">
        <div class="drag-message">
          <span class="icon">
            ${getEmbeddedDragDropIcon('document')}
          </span>
          <div>Suelta para cargar el archivo</div>
        </div>
      </div>
      ${dragDropElements}
    `;
    document.body.appendChild(container);
    // Configuro el botón de refresco global
    if (typeof setupDataRefreshButton === 'function') {
      setupDataRefreshButton();
    }
  }
  // Initialize theme system after base structure is rendered
  initializeThemeSystem().then(() => {
    // Check theme state after initialization
    setTimeout(() => {
      checkThemeOnLoad();
    }, 500);
  }).catch(error => {
    console.error('[Base Render] Error inicializando sistema de temas:', error);
  });
      // Automatic initialization of dropdown and diagram when page loads
    if (document.getElementById('diagram-dropdown')) {
      const diagrams = getDiagrams();
      window.$xDiagrams.currentDiagramIdx = window.$xDiagrams.getDiagramIndexFromURL();
      window.$xDiagrams.updateTopbarTitle(window.$xDiagrams.currentDiagramIdx, isFirstVisit()).catch(error => {
        console.error('[Topbar] Error updating title:', error);
      }); // Use transition only for first visit
      window.$xDiagrams.renderDiagramButtons();
      if (diagrams[window.$xDiagrams.currentDiagramIdx]) {
        window.$xDiagrams.loadDiagram(diagrams[window.$xDiagrams.currentDiagramIdx]);
      }
    }
}

// Function to detect if this is the first visit or a refresh
function isFirstVisit() {
  // Check if we have a session storage flag
  const hasVisited = sessionStorage.getItem('xdiagrams_visited');
  if (!hasVisited) {
    // First visit - set the flag
    sessionStorage.setItem('xdiagrams_visited', 'true');
    return true;
  }
  return false;
}

// Call base rendering function when library loads
function initializeWhenReady() {
  // Preload common images to prevent Chrome's default image flash
  preloadCommonImages();
  
  // Try auto-detection of logo early
  detectAutoLogo().catch(error => {
    console.log('[Auto Logo] Error durante detección automática:', error);
  });
  
  // Wait for diagrams to be defined
  const diagrams = getDiagrams();
  if (diagrams && Array.isArray(diagrams)) {
    renderSwDiagramBase();
    
    // Initialize theme system after base structure is rendered
    if (window.$xDiagrams.themeState && !window.$xDiagrams.themeState.isInitialized) {
      initializeThemeSystem();
    }
    
    // Drag & Drop functionality moved to XDragDrop plugin
    // Initialize XDragDrop if available
    if (window.XDragDrop && typeof window.XDragDrop.init === 'function') {
        window.XDragDrop.init();
    }
    

  } else {
    // Check again in 100ms
    setTimeout(initializeWhenReady, 100);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeWhenReady);
} else {
  initializeWhenReady();
}
// --- End automatic base structure rendering ---

// Export functions globally
window.initDiagram = initDiagram;
window.applyAutoZoom = applyAutoZoom;
window.ensureZoomBehavior = ensureZoomBehavior;
window.openSidePanel = openSidePanel;
window.closeSidePanel = closeSidePanel;
window.setupClosePanelOnSvgClick = setupClosePanelOnSvgClick;
window.setTheme = setTheme;
window.initializeThemeSystem = initializeThemeSystem;
window.forceDefaultLightTheme = forceDefaultLightTheme;
window.preserveCurrentTheme = preserveCurrentTheme;
window.getThemeConfiguration = getThemeConfiguration;
window.getStorageKey = getStorageKey;
window.getOppositeTheme = getOppositeTheme;
window.isLightTheme = isLightTheme;


// Cache management functions (for console access)
window.xDiagramsCache = {
  // Get cache statistics
  stats: function() {
    const stats = CacheManager.getStats();
            console.log('Cache Statistics:', stats);
    return stats;
  },
  
  // Clear specific cache entry
  clear: function(url) {
    CacheManager.clear(url);
    console.log('Cache cleared for:', url);
  },
  
  // Clear all cache
  clearAll: function() {
    CacheManager.clearAll();
    console.log('🗑️ All cache cleared');
  },
  
  // Get cache size
  size: function() {
    const size = CacheManager.getCacheSize();
    console.log('📏 Cache size:', size.toFixed(2), 'MB');
    return size;
  },
  
  // List all cached URLs
  list: function() {
    const keys = Object.keys(localStorage);
    const cacheKeys = keys.filter(key => key.startsWith('xdiagrams_cache_'));
    
    console.log('📋 Cached URLs:');
    cacheKeys.forEach(key => {
      try {
        const data = JSON.parse(localStorage.getItem(key));
        const age = Math.floor((Date.now() - data.timestamp) / (1000 * 60)); // minutes
        console.log(`  - ${data.url} (${age} min ago)`);
      } catch (e) {
        console.log(`  - ${key} (invalid data)`);
      }
    });
  },
  
  // Force refresh (clear cache and reload)
  refresh: function(url) {
    CacheManager.clear(url);
    console.log('Cache cleared, next load will fetch fresh data for:', url);
  }
};

// Function to reload the diagram system (for drag & drop functionality)
window.reloadDiagramSystem = function() {
    console.log('[Reload] Recargando sistema de diagramas...');
    
    // Load the last added diagram
    const diagrams = getDiagrams();
    if (diagrams && diagrams.length > 0) {
        const lastDiagram = diagrams[diagrams.length - 1];
        const lastIndex = diagrams.length - 1;
        
        // Update current diagram index FIRST
        window.$xDiagrams.currentDiagramIdx = lastIndex;
        
        // Update URL
        const url = new URL(window.location);
        url.searchParams.set('d', lastIndex.toString());
        window.history.pushState({}, '', url);
        
        // Update topbar title
        if (window.$xDiagrams.updateTopbarTitle) {
            window.$xDiagrams.updateTopbarTitle(lastIndex).catch(error => {
                console.error('[Topbar] Error updating title:', error);
            });
        }
        
        // Re-render diagram buttons AFTER updating the index
        if (window.$xDiagrams.renderDiagramButtons) {
            window.$xDiagrams.renderDiagramButtons();
        }
        
        // Load the diagram with a small delay to ensure UI updates
        if (window.$xDiagrams.loadDiagram) {
            setTimeout(() => {
                window.$xDiagrams.loadDiagram(lastDiagram);
            }, 50);
        }
    }
};









// Function to set current file theme preference
window.setCurrentFileTheme = function(theme) {
  console.log('[XTheme Set] Estableciendo tema para archivo actual:', theme);
  
  const storageKey = getStorageKey();
  localStorage.setItem(storageKey, theme);
  
  // Also save to global theme preference
  localStorage.setItem('selectedTheme', theme);
  localStorage.setItem('themeMode', isLightTheme(theme) ? 'light' : 'dark');
  
  // Update global state
  if (window.$xDiagrams.themeState) {
    window.$xDiagrams.themeState.current = theme;
  }
  
  console.log('[XTheme Set] Tema establecido:', theme, 'en clave:', storageKey, 'y global');
};

// Function to force theme synchronization
window.syncThemeState = function() {
  console.log('[XTheme Sync] Sincronizando estado del tema...');
  
  const storageKey = getStorageKey();
  const specificTheme = localStorage.getItem(storageKey);
  const globalTheme = localStorage.getItem('selectedTheme');
  
  if (specificTheme && globalTheme && specificTheme !== globalTheme) {
    console.log('[XTheme Sync] Inconsistencia detectada, sincronizando...');
    localStorage.setItem('selectedTheme', specificTheme);
    localStorage.setItem('themeMode', isLightTheme(specificTheme) ? 'light' : 'dark');
    console.log('[XTheme Sync] Tema sincronizado:', specificTheme);
  } else if (globalTheme && !specificTheme) {
    console.log('[XTheme Sync] Usando tema global como específico:', globalTheme);
    localStorage.setItem(storageKey, globalTheme);
  } else if (specificTheme && !globalTheme) {
    console.log('[XTheme Sync] Usando tema específico como global:', specificTheme);
    localStorage.setItem('selectedTheme', specificTheme);
    localStorage.setItem('themeMode', isLightTheme(specificTheme) ? 'light' : 'dark');
  }
  
  console.log('[XTheme Sync] Sincronización completada');
};

// Function to force dark theme
window.forceDarkTheme = function() {
  console.log('[XTheme Force] Forzando tema oscuro...');
  
  const storageKey = getStorageKey();
  localStorage.setItem(storageKey, 'onyx');
  localStorage.setItem('selectedTheme', 'onyx');
  localStorage.setItem('themeMode', 'dark');
  
  // Update state
  if (window.$xDiagrams.themeState) {
    window.$xDiagrams.themeState.current = 'onyx';
  }
  
  // Apply theme
  setTheme('onyx');
  
  console.log('[XTheme Force] Tema oscuro forzado');
};

// Function to check theme on page load
window.checkThemeOnLoad = function() {
  console.log('[XTheme Load Check] === VERIFICACIÓN DE CARGA ===');
  
  const storageKey = getStorageKey();
  const specificTheme = localStorage.getItem(storageKey);
  const globalTheme = localStorage.getItem('selectedTheme');
  const themeMode = localStorage.getItem('themeMode');
  const bodyClasses = document.body.className;
  
  console.log('[XTheme Load Check] Clave específica:', storageKey);
  console.log('[XTheme Load Check] Tema específico:', specificTheme);
  console.log('[XTheme Load Check] Tema global:', globalTheme);
  console.log('[XTheme Load Check] Modo de tema:', themeMode);
  console.log('[XTheme Load Check] Clases del body:', bodyClasses);
  
  // Check if dark theme should be applied
  const shouldBeDark = specificTheme === 'onyx' || globalTheme === 'onyx' || themeMode === 'dark';
  const isDarkApplied = bodyClasses.includes('theme-onyx');
  
  console.log('[XTheme Load Check] Debería ser oscuro:', shouldBeDark);
  console.log('[XTheme Load Check] Es oscuro aplicado:', isDarkApplied);
  
  if (shouldBeDark && !isDarkApplied) {
    console.log('[XTheme Load Check] PROBLEMA: Debería ser oscuro pero no está aplicado');
    forceDarkTheme();
  } else if (!shouldBeDark && isDarkApplied) {
    console.log('[XTheme Load Check] PROBLEMA: No debería ser oscuro pero está aplicado');
  } else {
    console.log('[XTheme Load Check] Estado correcto');
  }
  
  console.log('[XTheme Load Check] === FIN DE VERIFICACIÓN ===');
};

// Function to check if theme toggle button exists






// Create keyboard navigation instructions panel
function createKeyboardInstructionsPanel() {
  // Remove existing panel if it exists
  const existingPanel = document.querySelector('.keyboard-instructions');
  if (existingPanel) {
    existingPanel.remove();
  }
  
  const instructionsPanel = document.createElement('div');
  instructionsPanel.className = 'keyboard-instructions';
  instructionsPanel.innerHTML = `
    <h3>Navegación por teclado</h3>
    <div class="instructions-grid">
      <span class="key">↑</span>
      <span class="description">Nodo padre (circular)</span>
      <span class="key">↓</span>
      <span class="description">Primer hijo (circular)</span>
      <span class="key">←</span>
      <span class="description">Nodo anterior del mismo nivel (circular)</span>
      <span class="key">→</span>
      <span class="description">Nodo siguiente del mismo nivel (circular)</span>
      <span class="key">Tab</span>
      <span class="description">Navegación secuencial (circular)</span>
      <span class="key">Home</span>
      <span class="description">Primer nodo</span>
      <span class="key">End</span>
      <span class="description">Último nodo</span>
      <span class="key">Esc</span>
      <span class="description">Deseleccionar</span>
      <span class="key">Ctrl+0</span>
      <span class="description">Resetear zoom</span>
      <span class="key">Ctrl+6</span>
      <span class="description">Zoom muy alejado</span>
      <span class="key">Ctrl+7</span>
      <span class="description">Zoom alejado</span>
      <span class="key">Ctrl+8</span>
      <span class="description">Zoom más alejado</span>
      <span class="key">Ctrl+9</span>
      <span class="description">Zoom alejado</span>
    </div>
    <div class="cluster-navigation-section" style="margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--control-border, #d1d5db);">
      <h4 style="margin: 0 0 8px 0; font-size: 0.85em; font-weight: 600; color: var(--side-panel-label, #666);">Navegación entre clusters (modo cluster activo)</h4>
      <div class="instructions-grid">
        <span class="key">Ctrl+←</span>
        <span class="description">Cluster anterior (circular)</span>
        <span class="key">Ctrl+→</span>
        <span class="description">Cluster siguiente (circular)</span>
        <span class="key">Ctrl+↑</span>
        <span class="description">Primer cluster</span>
        <span class="key">Ctrl+↓</span>
        <span class="description">Último cluster</span>
        <span class="key">Ctrl+Home</span>
        <span class="description">Primer cluster</span>
        <span class="key">Ctrl+End</span>
        <span class="description">Último cluster</span>
      </div>
    </div>
  `;
  
  document.body.appendChild(instructionsPanel);
  
  // Show/hide panel based on keyboard navigation state
  window.$xDiagrams.keyboardNavigation.showInstructions = function() {
    instructionsPanel.style.display = 'block';
  };
  
  window.$xDiagrams.keyboardNavigation.hideInstructions = function() {
    instructionsPanel.style.display = 'none';
  };
  
  // Initially hide the panel (temporarily)
  instructionsPanel.style.display = 'none';
}



// Helper function to check if URL is accessible
window.checkUrlAccessibility = function(url) {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.timeout = 5000; // 5 second timeout
    xhr.open('HEAD', url, true);
    xhr.onload = () => resolve(true);
    xhr.onerror = () => resolve(false);
    xhr.ontimeout = () => resolve(false);
    xhr.send();
  });
};

// Function to find diagram by file and get its fallbacks
window.findDiagramByFile = function(file) {
  const diagrams = getDiagrams();
  if (!diagrams) {
    return null;
  }
  
  return diagrams.find(diagram => diagram.file === file);
};

// Function to try fallback files from diagram definition
window.tryDiagramFallbacks = function(originalFile, onComplete, retryCount = 0) {
  const diagram = window.findDiagramByFile(originalFile);
  
  if (!diagram || !diagram.fallbacks || !Array.isArray(diagram.fallbacks)) {
    console.log('[Fallback] No fallbacks defined for this diagram');
    return false;
  }
  
  if (retryCount >= diagram.fallbacks.length) {
    console.error('[Fallback] No more fallback files available');
    return false;
  }
  
  const fallbackFile = diagram.fallbacks[retryCount];
  console.log(`[Fallback] Trying fallback file ${retryCount + 1}:`, fallbackFile);
  
  // Try the fallback file with error handling
  window.initDiagram(fallbackFile, onComplete, 0, diagram); // Reset retry count for fallback
  
  return true;
};

// Custom tooltip system
function initializeCustomTooltips() {
  // Remove existing tooltip if any
  const existingTooltip = document.getElementById('custom-tooltip');
  if (existingTooltip) {
    existingTooltip.remove();
  }
  
  // Create tooltip element
  const tooltip = document.createElement('div');
  tooltip.id = 'custom-tooltip';
  tooltip.style.cssText = `
    position: fixed;
    background-color: #333;
    color: white;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 13px;
    white-space: pre-wrap;
    max-width: 300px;
    word-wrap: break-word;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    z-index: 99999;
    pointer-events: none;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.2s ease;
  `;
  document.body.appendChild(tooltip);
  
  // Add event listeners for tooltip elements
  document.addEventListener('mouseover', function(e) {
    const target = e.target;
    if (target.hasAttribute('data-tooltip')) {
      const tooltipText = target.getAttribute('data-tooltip');
      console.log('[Tooltip System] Hover detectado en elemento con data-tooltip:', tooltipText);
      if (tooltipText) {
        tooltip.textContent = tooltipText;
        tooltip.style.opacity = '1';
        tooltip.style.visibility = 'visible';
        
        // Position tooltip below the text
        const rect = target.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        
        let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
        let top = rect.bottom + 10; // Position below the text
        
        // Adjust if tooltip goes off screen
        if (left < 10) left = 10;
        if (left + tooltipRect.width > window.innerWidth - 10) {
          left = window.innerWidth - tooltipRect.width - 10;
        }
        // If tooltip goes below the viewport, position it above the text
        if (top + tooltipRect.height > window.innerHeight - 10) {
          top = rect.top - tooltipRect.height - 10;
          // Change arrow to point down when tooltip is above
          tooltip.style.setProperty('--arrow-direction', 'down');
        } else {
          // Arrow points up when tooltip is below
          tooltip.style.setProperty('--arrow-direction', 'up');
        }
        
        tooltip.style.left = left + 'px';
        tooltip.style.top = top + 'px';
      }
    }
  });
  
  document.addEventListener('mouseout', function(e) {
    const target = e.target;
    if (target.hasAttribute('data-tooltip')) {
      tooltip.style.opacity = '0';
      tooltip.style.visibility = 'hidden';
    }
  });
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  setupClosePanelOnSvgClick();
  
  // Create keyboard instructions panel
  createKeyboardInstructionsPanel();
  
  // Initialize keyboard navigation system only if enabled
  if (isOptionEnabled('keyboardNavigation') && window.$xDiagrams.keyboardNavigation) {
    window.$xDiagrams.keyboardNavigation.init();
  }
  
  // Initialize custom tooltips only if enabled
  if (isOptionEnabled('tooltips') !== false) {
    initializeCustomTooltips();
  }
  
  // Theme system is now handled by the new XTheme system
  console.log('[DOM Ready] Sistema de temas XTheme ya inicializado automáticamente');
  
  // Setup dropdown functionality
  const dropdownBtn = document.getElementById('diagram-dropdown-btn');
  const dropdown = document.getElementById('diagram-dropdown');
  
  if (dropdownBtn && dropdown) {
    dropdownBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropdown.classList.toggle('open');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!dropdown.contains(e.target)) {
        dropdown.classList.remove('open');
      }
    });
    
    // Close dropdown on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        dropdown.classList.remove('open');
      }
    });
  }
  
  // Clear cache on page refresh
  window.addEventListener('beforeunload', () => {
    if (window.$xDiagrams && window.$xDiagrams.clearCache) {
      window.$xDiagrams.clearCache();
    }
  });
}); 

// Toast flotante global
window.showToast = function(message, type = 'success', duration = 4200) {
  // type: 'success', 'error', 'mixed'
  // Elimina cualquier toast anterior
  const prev = document.querySelector('.x-toast');
  if (prev) prev.remove();

  const toast = document.createElement('div');
  toast.className = `x-toast x-toast-${type}`;
  toast.innerHTML = `<span>${message.replace(/\n/g, '<br>')}</span><button class='x-toast-close' title='Cerrar'>&times;</button>`;

  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('x-toast-show'), 10);

  // Cerrar manual
  toast.querySelector('.x-toast-close').onclick = () => {
    toast.classList.remove('x-toast-show');
    setTimeout(() => toast.remove(), 350);
  };

  // Cerrar automático
  setTimeout(() => {
    toast.classList.remove('x-toast-show');
    setTimeout(() => toast.remove(), 350);
  }, duration);
};



// Función para verificar si un diagrama ya está cargado
window.isDiagramDuplicate = function(diagram) {
  const diagrams = window.$xDiagrams && window.$xDiagrams.diagrams ? window.$xDiagrams.diagrams : [];
  if (diagram.file) {
    // Duplicado por file (remoto o local por ruta)
    return diagrams.some(d => d.file === diagram.file);
  } else if (diagram.name && diagram.hash) {
    // Duplicado por nombre+hash (local drag & drop)
    return diagrams.some(d => d.name === diagram.name && d.hash === diagram.hash);
  }
  return false;
};

// Modifica addAndLoadDiagram para evitar duplicados y renombrar si es necesario
window.addAndLoadDiagram = function(diagram) {
  const diagrams = window.$xDiagrams && window.$xDiagrams.diagrams ? window.$xDiagrams.diagrams : [];
  if (window.isDiagramDuplicate(diagram)) {
    showToast(`El archivo '${diagram.name || diagram.file}' ya se encuentra subido.`, 'mixed');
    return;
  }
  // Si es local y el nombre ya existe pero el hash es diferente, renombrar
  if (!diagram.file && diagram.name) {
    let baseName = diagram.name.replace(/ \(\d+\)$/, '');
    let count = 1;
    let newName = diagram.name;
    while (diagrams.some(d => d.name === newName && d.hash !== diagram.hash)) {
      count++;
      newName = `${baseName} (${count})`;
    }
    diagram.name = newName;
  }
  // Add to configuration
  window.$xDiagrams.diagrams.push(diagram);
  // Save to localStorage
  if (typeof saveDiagramToStorage === 'function') saveDiagramToStorage(diagram);
  // Trigger hook
  if (window.$xDiagrams.hooks && window.$xDiagrams.hooks.onFileDrop) {
    window.$xDiagrams.hooks.onFileDrop(diagram);
  }
  // Reload the diagram system to include the new diagram
  if (window.reloadDiagramSystem) {
    window.reloadDiagramSystem();
  } else {
    setTimeout(() => { window.location.reload(); }, 500);
  }
};

// Hash simple para string (djb2)
window.simpleHash = function(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
  }
  return hash >>> 0;
};

// ============================================================================
// DATA SOURCE ABSTRACTION LAYER
// ============================================================================

// Detect data source type and load accordingly
function detectAndLoadDataSource(source, onComplete, retryCount = 0, diagramConfig = null) {
  // Case 1: Object with data (already processed)
  if (source && typeof source === 'object' && source.data) {
    return loadFromObject(source, onComplete, diagramConfig);
  }
  
  // Case 2: Array of sources - load multiple files/URLs
  if (Array.isArray(source)) {
    // Check if it's an array of URLs or files
    const firstItem = source[0];
    if (typeof firstItem === 'string') {
      // Array of URLs
      return loadFromMultipleUrls(source, onComplete, retryCount, diagramConfig);
    } else if (firstItem instanceof File) {
      // Array of files
      return loadFromMultipleFiles(source, onComplete, retryCount, diagramConfig);
    } else {
      console.error('Array contains unsupported items:', firstItem);
      showDiagramNotFound();
      if (onComplete && typeof onComplete === 'function') {
        onComplete();
      }
      return;
    }
  }
  
  // Case 3: String URL - detect type
  if (typeof source === 'string') {
    const url = source.trim();
    
    // Check if it's a REST API endpoint
    if (isRestApiEndpoint(url)) {
      return loadFromRestApi(url, onComplete, retryCount, diagramConfig);
    }
    
    // Check if it's a CSV URL
    if (isCsvUrl(url)) {
      return loadFromCsvUrl(url, onComplete, retryCount, diagramConfig);
    }
    
    // Default: treat as CSV URL
    return loadFromCsvUrl(url, onComplete, retryCount, diagramConfig);
  }
  showDiagramNotFound();
  if (onComplete && typeof onComplete === 'function') {
    onComplete();
  }
}

// Check if URL is a REST API endpoint
function isRestApiEndpoint(url) {
  // Common REST API patterns
  const restPatterns = [
    /api\./i,
    /\.json$/i,
    /\/api\//i,
    /sheetdb\.io/i,
    /sheetson\.com/i,
    /sheetbest\.com/i,
    /airtable\.com/i,
    /notion\.so/i
  ];
  
  return restPatterns.some(pattern => pattern.test(url));
}

// Check if URL is a CSV file
function isCsvUrl(url) {
  return /\.csv$/i.test(url) || 
         /output=csv/i.test(url) || 
         /google\.com\/spreadsheets/i.test(url);
}

// Load data from REST API (now uses intelligent caching)
function loadFromRestApi(apiUrl, onComplete, retryCount = 0, diagramConfig = null) {
  // Use the enhanced version with caching
  loadFromRestApiWithCache(apiUrl, onComplete, retryCount, diagramConfig);
}

// Load data from CSV URL (existing functionality)
function loadFromCsvUrl(csvUrl, onComplete, retryCount = 0, diagramConfig = null) {
  console.log("📄 Cargando desde URL CSV:", csvUrl);
  
  const loadingElement = document.querySelector("#loading");
  const errorElement = document.querySelector("#error-message");
  
  if (loadingElement) loadingElement.style.display = "block";
  if (errorElement) errorElement.style.display = "none";

  // Add cache-busting parameter to force fresh data
  const cacheBuster = `?t=${Date.now()}`;
  const urlWithCacheBuster = csvUrl.includes('?') ? `${csvUrl}&_cb=${Date.now()}` : `${csvUrl}${cacheBuster}`;
  
  console.log('[Cache] Loading with cache buster:', urlWithCacheBuster);

  Papa.parse(urlWithCacheBuster, {
    download: true,
    header: true,
    complete: function(results) {
      console.log("CSV cargado exitosamente:", results.data.length, "filas");
      
      try {
        const trees = buildHierarchies(results.data, diagramConfig);
        drawTrees(trees, diagramConfig);
        
        // Create side panel only if enabled
        if (isOptionEnabled('sidePanel') !== false) {
          createSidePanel();
        }
        
        // Preserve current theme after loading diagram
        setTimeout(async () => {
          if (window.preserveCurrentTheme) {
            await window.preserveCurrentTheme();
          }
        }, 100);
        
        console.log("Diagrama cargado desde: CSV URL | URL: " + csvUrl + " | Registros: " + results.data.length);
        
        // Trigger onLoad hook
        triggerHook('onLoad', { 
          url: csvUrl, 
          data: results.data, 
          trees: trees,
          sourceType: 'csv-url',
          timestamp: new Date().toISOString()
        });
        
        if (onComplete && typeof onComplete === 'function') {
          onComplete();
        }
      } catch (error) {
        console.error("Error durante la inicialización:", error);
        if (errorElement) errorElement.innerText = `Error: ${error.message}`;
        if (loadingElement) loadingElement.style.display = "none";
        
        if (onComplete && typeof onComplete === 'function') {
          onComplete();
        }
      }
    },
    error: function(err) {
      console.error("Error al cargar CSV:", err);
      
      // Handle CORS errors specifically
      let errorMessage = err.message || 'Error desconocido';
      let isCorsError = errorMessage.includes('CORS') || 
                       errorMessage.includes('cross-origin') ||
                       errorMessage.includes('mismo origen') ||
                       errorMessage.includes('origin');
      
      // Auto-retry for CORS errors (up to 2 retries)
      if (isCorsError && retryCount < 2) {
        console.log(`[Retry] CORS error detected, retrying in 2 seconds... (attempt ${retryCount + 1})`);
        setTimeout(() => {
          loadFromCsvUrl(csvUrl, onComplete, retryCount + 1, diagramConfig);
        }, 2000);
        return;
      }
      
      // Try fallback URLs if available
      if (isCorsError) {
        console.log('[Fallback] Attempting to use fallback URLs...');
        if (window.tryDiagramFallbacks && window.tryDiagramFallbacks(csvUrl, onComplete)) {
          return;
        }
      }
      
      // Check if it's a file not found error (404, network error, etc.)
      let isFileNotFound = errorMessage.includes('404') || 
                          errorMessage.includes('Not Found') ||
                          errorMessage.includes('Failed to fetch') ||
                          errorMessage.includes('NetworkError') ||
                          errorMessage.includes('ERR_NAME_NOT_RESOLVED') ||
                          errorMessage.includes('ERR_CONNECTION_REFUSED');
      
      if (isFileNotFound) {
        console.log('[File Not Found] Showing "Diagram not found" message');
        showDiagramNotFound();
        if (loadingElement) loadingElement.style.display = "none";
        if (onComplete && typeof onComplete === 'function') {
          onComplete();
        }
        return;
      }
      
      if (isCorsError) {
        errorMessage = 'Error de CORS: No se puede acceder al archivo desde este dominio. Intenta refrescar la página o usar un archivo local.';
      }
      
      if (errorElement) {
        errorElement.innerText = errorMessage;
        errorElement.style.display = "block";
      }
      if (loadingElement) loadingElement.style.display = "none";
      
      if (onComplete && typeof onComplete === 'function') {
        onComplete();
      }
    }
  });
}

// Load data from multiple URLs (multiple Google Sheets)
function loadFromMultipleUrls(urls, onComplete, retryCount = 0, diagramConfig = null) {
  console.log("📄 Cargando múltiples URLs:", urls.length, "hojas");
  
  const loadingElement = document.querySelector("#loading");
  const errorElement = document.querySelector("#error-message");
  
  if (loadingElement) loadingElement.style.display = "block";
  if (errorElement) errorElement.style.display = "none";

  let allData = [];
  let errors = [];
  
  // Get combine configuration from diagram config
  const combineConfig = diagramConfig?.combineSheets || { enabled: true, mergeStrategy: "append" };
  const sheetNames = diagramConfig?.combineSheets?.sheetNames || urls.map((_, index) => `Hoja ${index + 1}`);
  
  // Process URLs sequentially to maintain order
  async function processUrlsSequentially() {
    for (let index = 0; index < urls.length; index++) {
      const url = urls[index];
      const sheetName = sheetNames[index] || `Hoja ${index + 1}`;
      console.log(`📄 Cargando hoja ${index + 1}/${urls.length}: ${sheetName}`);
      
      try {
        // Add cache-busting parameter
        const cacheBuster = `?t=${Date.now()}`;
        const urlWithCacheBuster = url.includes('?') ? `${url}&_cb=${Date.now()}` : `${url}${cacheBuster}`;
        
        // Parse CSV from URL
        const results = await new Promise((resolve, reject) => {
          Papa.parse(urlWithCacheBuster, {
            download: true,
            header: true,
            complete: function(results) {
              resolve(results);
            },
            error: function(err) {
              reject(err);
            }
          });
        });
        
        console.log(`✅ Hoja ${sheetName} cargada:`, results.data.length, "filas");
        
        // Add sheet name to each row for identification
        const dataWithSheet = results.data.map(row => ({
          ...row,
          _sheetName: sheetName,
          _sheetIndex: index
        }));
        
        // Add data in order (sequential processing ensures order)
        allData.push(...dataWithSheet);
        
      } catch (error) {
        console.error(`❌ Error al cargar hoja ${sheetName}:`, error);
        errors.push({ sheetName, error });
        // Continue with next sheet even if one fails
      }
    }
    
    // All URLs processed, now complete
    handleMultipleUrlsComplete();
  }
  
  function handleMultipleUrlsComplete() {
    if (allData.length === 0) {
      console.error("❌ No se pudo cargar ninguna hoja");
      showDiagramNotFound();
      if (loadingElement) loadingElement.style.display = "none";
      
      if (onComplete && typeof onComplete === 'function') {
        onComplete();
      }
      return;
    }
    
    console.log("🎉 Todas las hojas cargadas. Total de registros:", allData.length);
    
    try {
      const trees = buildHierarchies(allData, diagramConfig);
      drawTrees(trees, diagramConfig);
      
      // Create side panel only if enabled
      if (isOptionEnabled('sidePanel') !== false) {
        createSidePanel();
      }
      
      // Preserve current theme after loading diagram
      setTimeout(async () => {
        if (window.preserveCurrentTheme) {
          await window.preserveCurrentTheme();
        }
      }, 100);
      
      console.log("Diagrama cargado desde: MÚLTIPLES URLs | Hojas: " + urls.length + " | Registros totales: " + allData.length);
      
      // Trigger onLoad hook
      triggerHook('onLoad', { 
        name: diagramConfig?.name || 'Múltiples Hojas',
        data: allData, 
        trees: trees,
        sourceType: 'multiple-urls',
        urls: urls,
        sheetNames: sheetNames,
        errors: errors,
        isLocal: false,
        timestamp: new Date().toISOString()
      });
      
      if (onComplete && typeof onComplete === 'function') {
        onComplete();
      }
    } catch (error) {
      console.error("Error durante la inicialización del diagrama desde múltiples URLs:", error);
      showDiagramNotFound();
      if (loadingElement) loadingElement.style.display = "none";
      
      if (onComplete && typeof onComplete === 'function') {
        onComplete();
      }
    }
  }
  
  // Start sequential processing
  processUrlsSequentially();
}

// Load data from multiple local files (CSV/JSON)
function loadFromMultipleFiles(files, onComplete, retryCount = 0, diagramConfig = null) {
  console.log("📁 Cargando múltiples archivos:", files.length, "archivos");
  
  const loadingElement = document.querySelector("#loading");
  const errorElement = document.querySelector("#error-message");
  
  if (loadingElement) loadingElement.style.display = "block";
  if (errorElement) errorElement.style.display = "none";

  let allData = [];
  let errors = [];
  
  // Get combine configuration from diagram config
  const combineConfig = diagramConfig?.combineFiles || { enabled: true, mergeStrategy: "append" };
  const fileNames = diagramConfig?.combineFiles?.fileNames || files.map(file => file.name.replace(/\.[^/.]+$/, ""));
  
  // Process files sequentially to maintain order
  async function processFilesSequentially() {
    for (let index = 0; index < files.length; index++) {
      const file = files[index];
      const fileName = fileNames[index] || file.name.replace(/\.[^/.]+$/, "");
      console.log(`📁 Procesando archivo ${index + 1}/${files.length}: ${fileName} (${file.name})`);
      
      try {
        // Determine file type and process accordingly
        let diagram;
        if (file.name.toLowerCase().endsWith('.csv')) {
          // Use XDragDrop plugin if available, otherwise show error
          if (window.XDragDrop && typeof window.XDragDrop.processCSVFile === 'function') {
            diagram = await window.XDragDrop.processCSVFile(file);
          } else {
            throw new Error('XDragDrop plugin no disponible para procesar CSV');
          }
        } else if (file.name.toLowerCase().endsWith('.json')) {
          // Use XDragDrop plugin if available, otherwise show error
          if (window.XDragDrop && typeof window.XDragDrop.processJSONFile === 'function') {
            diagram = await window.XDragDrop.processJSONFile(file);
          } else {
            throw new Error('XDragDrop plugin no disponible para procesar JSON');
          }
        } else {
          throw new Error(`Tipo de archivo no soportado: ${file.name}`);
        }
        
        console.log(`✅ Archivo ${fileName} procesado:`, diagram.data.length, "filas");
        
        // Add file identification to each row
        const dataWithFile = diagram.data.map(row => ({
          ...row,
          _fileName: fileName,
          _fileIndex: index,
          _originalFileName: file.name
        }));
        
        // Add data in order (sequential processing ensures order)
        allData.push(...dataWithFile);
        
      } catch (error) {
        console.error(`❌ Error procesando archivo ${fileName}:`, error);
        errors.push({ fileName, error });
        // Continue with next file even if one fails
      }
    }
    
    // All files processed, now complete
    handleMultipleFilesComplete();
  }
  
  // Start sequential processing
  processFilesSequentially();
  
  function handleMultipleFilesComplete() {
    if (allData.length === 0) {
      console.error("❌ No se pudo procesar ningún archivo");
      showDiagramNotFound();
      if (loadingElement) loadingElement.style.display = "none";
      if (onComplete && typeof onComplete === 'function') {
        onComplete();
      }
      return;
    }
    
    console.log("🎉 Todos los archivos procesados. Total de registros:", allData.length);
    
    try {
      const trees = buildHierarchies(allData, diagramConfig);
      drawTrees(trees, diagramConfig);
      
      // Create side panel only if enabled
      if (isOptionEnabled('sidePanel') !== false) {
        createSidePanel();
      }
      
      // Preserve current theme after loading diagram
      setTimeout(async () => {
        if (window.preserveCurrentTheme) {
          await window.preserveCurrentTheme();
        }
      }, 100);
      
      const successCount = files.length - errors.length;
      console.log(`Diagrama cargado desde: MÚLTIPLES ARCHIVOS | Archivos exitosos: ${successCount} | Registros totales: ${allData.length}`);
      
      // Trigger onLoad hook
      triggerHook('onLoad', { 
        name: diagramConfig?.name || 'Múltiples Archivos',
        data: allData, 
        trees: trees,
        sourceType: 'multiple-files',
        files: files.map(f => f.name),
        fileNames: fileNames,
        errors: errors,
        isLocal: true,
        timestamp: new Date().toISOString()
      });
      
      if (onComplete && typeof onComplete === 'function') {
        onComplete();
      }
    } catch (error) {
      console.error("Error durante la inicialización del diagrama desde múltiples archivos:", error);
      showDiagramNotFound();
      if (loadingElement) loadingElement.style.display = "none";
      
      if (onComplete && typeof onComplete === 'function') {
        onComplete();
      }
    }
  }
}

// Load data from object (existing functionality)
function loadFromObject(diagramObject, onComplete, diagramConfig = null) {
          console.log("Cargando desde objeto:", diagramObject.name);
  
  const loadingElement = document.querySelector("#loading");
  const errorElement = document.querySelector("#error-message");
  
  if (loadingElement) loadingElement.style.display = "block";
  if (errorElement) errorElement.style.display = "none";

  try {
    // Check if data is valid
    if (!diagramObject.data || !Array.isArray(diagramObject.data) || diagramObject.data.length === 0) {
      console.log('[Object] Empty or invalid data, showing "Diagram not found"');
      showDiagramNotFound();
      if (loadingElement) loadingElement.style.display = "none";
      if (onComplete && typeof onComplete === 'function') {
        onComplete();
      }
      return;
    }
    
    const trees = buildHierarchies(diagramObject.data, diagramConfig);
    drawTrees(trees, diagramConfig);
    
    // Create side panel only if enabled
    if (isOptionEnabled('sidePanel') !== false) {
      createSidePanel();
    }
    
    // Preserve current theme after loading diagram
    setTimeout(async () => {
      if (window.preserveCurrentTheme) {
        await window.preserveCurrentTheme();
      }
    }, 100);
    
    console.log("Diagrama cargado desde: OBJETO | Nombre: " + (diagramObject.name || 'Sin nombre') + " | Registros: " + diagramObject.data.length);
    
    // Trigger onLoad hook
    triggerHook('onLoad', { 
      name: diagramObject.name,
      data: diagramObject.data, 
      trees: trees,
      sourceType: 'object',
      isLocal: true,
      timestamp: new Date().toISOString()
    });
    
    if (onComplete && typeof onComplete === 'function') {
      onComplete();
    }
  } catch (error) {
    console.error("Error durante la inicialización del diagrama desde objeto:", error);
    console.log('[Object] Error processing data, showing "Diagram not found"');
    showDiagramNotFound();
    if (loadingElement) loadingElement.style.display = "none";
    
    if (onComplete && typeof onComplete === 'function') {
      onComplete();
    }
  }
}

// Convert JSON response to CSV-like format
function convertJsonToCsvFormat(jsonData) {
  console.log("Convirtiendo JSON a formato CSV:", jsonData);
  
  // Handle different JSON response formats
  let dataArray = [];
  
  // Case 1: Array of objects (most common)
  if (Array.isArray(jsonData)) {
    dataArray = jsonData;
  }
  // Case 2: Object with data property
  else if (jsonData && typeof jsonData === 'object' && jsonData.data && Array.isArray(jsonData.data)) {
    dataArray = jsonData.data;
  }
  // Case 3: Object with records property (Airtable-like)
  else if (jsonData && typeof jsonData === 'object' && jsonData.records && Array.isArray(jsonData.records)) {
    dataArray = jsonData.records.map(record => record.fields || record);
  }
  // Case 4: Single object (convert to array)
  else if (jsonData && typeof jsonData === 'object' && !Array.isArray(jsonData)) {
    dataArray = [jsonData];
  }
  else {
    console.warn("Formato JSON no reconocido:", jsonData);
    return [];
  }
  
  console.log("Datos convertidos:", dataArray.length, "registros");
  return dataArray;
}

// ============================================================================
// INTELLIGENT CACHE SYSTEM
// ============================================================================

// Cache TTL constants for easy configuration
const CACHE_TTL = {
  // Short durations (development/testing)
  ONE_MINUTE: 1 * 60 * 1000,
  FIVE_MINUTES: 5 * 60 * 1000,
  FIFTEEN_MINUTES: 15 * 60 * 1000,
  THIRTY_MINUTES: 30 * 60 * 1000,
  
  // Medium durations (production)
  ONE_HOUR: 60 * 60 * 1000,
  TWO_HOURS: 2 * 60 * 60 * 1000,
  FOUR_HOURS: 4 * 60 * 60 * 1000,
  SIX_HOURS: 6 * 60 * 60 * 1000,
  
  // Long durations (stable data)
  TWELVE_HOURS: 12 * 60 * 60 * 1000,
  ONE_DAY: 24 * 60 * 60 * 1000,
  THREE_DAYS: 3 * 24 * 60 * 60 * 1000,
  ONE_WEEK: 7 * 24 * 60 * 60 * 1000,
  
  // Special values
  NO_CACHE: 0,
  INFINITE: -1
};

// Cache configuration
const CACHE_CONFIG = {
  // Cache duration in milliseconds (default: 1 hour)
  DEFAULT_TTL: CACHE_TTL.ONE_HOUR,
  // Maximum cache size in MB
  MAX_SIZE: 10,
  // Cache version for invalidation
  VERSION: '1.0'
};

// Get cache configuration from user settings or use defaults
function getCacheConfig() {
  const userConfig = window.$xDiagrams?.cache || {};
  return {
    ttl: userConfig.ttl || CACHE_CONFIG.DEFAULT_TTL,
    maxSize: userConfig.maxSize || CACHE_CONFIG.MAX_SIZE,
    version: CACHE_CONFIG.VERSION
  };
}

// Cache management functions
const CacheManager = {
  // Generate cache key for URL
  getCacheKey: function(url) {
    // Use a simple hash function to avoid issues with btoa and special characters
    let hash = 0;
    for (let i = 0; i < url.length; i++) {
      const char = url.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    const key = `xdiagrams_cache_${Math.abs(hash)}`;
    return key;
  },

  // Get cached data
  get: function(url) {
    try {
      const key = this.getCacheKey(url);
      const cached = localStorage.getItem(key);
      
      if (!cached) {
        return null;
      }

      const data = JSON.parse(cached);
      
      // Check if cache is expired
      if (data.expires && Date.now() > data.expires) {
        localStorage.removeItem(key);
        return null;
      }

      // Check cache version
      const config = getCacheConfig();
      if (data.version !== config.version) {
        localStorage.removeItem(key);
        return null;
      }

      return data.data;
    } catch (error) {
      console.error('📦 [Cache] Error reading cache:', error);
      return null;
    }
  },

  // Set cached data
  set: function(url, data) {
    try {
      const key = this.getCacheKey(url);
      const config = getCacheConfig();
      const cacheData = {
        data: data,
        timestamp: Date.now(),
        expires: Date.now() + config.ttl,
        version: config.version,
        url: url
      };

      // Check cache size before storing
      if (this.getCacheSize() > config.maxSize) {
        this.cleanup();
      }

      localStorage.setItem(key, JSON.stringify(cacheData));
      
      // Update cache statistics
      this.updateStats();
    } catch (error) {
      console.error('📦 [Cache] Error writing cache:', error);
    }
  },

  // Clear specific cache entry
  clear: function(url) {
    try {
      const key = this.getCacheKey(url);
      localStorage.removeItem(key);
      console.log('📦 [Cache] Cleared cache for:', url);
    } catch (error) {
      console.error('📦 [Cache] Error clearing cache:', error);
    }
  },

  // Clear all cache
  clearAll: function() {
    try {
      const keys = Object.keys(localStorage);
      const cacheKeys = keys.filter(key => key.startsWith('xdiagrams_cache_'));
      
      cacheKeys.forEach(key => localStorage.removeItem(key));
      console.log('📦 [Cache] All cache cleared');
    } catch (error) {
      console.error('📦 [Cache] Error clearing all cache:', error);
    }
  },

  // Get cache size in MB
  getCacheSize: function() {
    try {
      const keys = Object.keys(localStorage);
      const cacheKeys = keys.filter(key => key.startsWith('xdiagrams_cache_'));
      
      let totalSize = 0;
      cacheKeys.forEach(key => {
        totalSize += localStorage.getItem(key).length;
      });
      
      return totalSize / (1024 * 1024); // Convert to MB
    } catch (error) {
      console.error('📦 [Cache] Error calculating cache size:', error);
      return 0;
    }
  },

  // Cleanup old cache entries
  cleanup: function() {
    try {
      const keys = Object.keys(localStorage);
      const cacheKeys = keys.filter(key => key.startsWith('xdiagrams_cache_'));
      
      const cacheEntries = cacheKeys.map(key => {
        try {
          const data = JSON.parse(localStorage.getItem(key));
          return { key, timestamp: data.timestamp, expires: data.expires };
        } catch {
          return { key, timestamp: 0, expires: 0 };
        }
      });

      // Sort by timestamp (oldest first)
      cacheEntries.sort((a, b) => a.timestamp - b.timestamp);

      // Remove oldest entries until we're under the limit
      const config = getCacheConfig();
      const maxEntries = Math.floor(config.maxSize * 2); // Rough estimate
      if (cacheEntries.length > maxEntries) {
              const toRemove = cacheEntries.slice(0, cacheEntries.length - maxEntries);
      toRemove.forEach(entry => {
        localStorage.removeItem(entry.key);
      });
    }
  } catch (error) {
    console.error('📦 [Cache] Error during cleanup:', error);
  }
},

// Update cache statistics
updateStats: function() {
  try {
    const keys = Object.keys(localStorage);
    const cacheKeys = keys.filter(key => key.startsWith('xdiagrams_cache_'));
    
    const stats = {
      entries: cacheKeys.length,
      size: this.getCacheSize(),
      timestamp: Date.now()
    };

    localStorage.setItem('xdiagrams_cache_stats', JSON.stringify(stats));
  } catch (error) {
    console.error('Error updating cache stats:', error);
    }
  },

  // Get cache statistics
  getStats: function() {
    try {
      const stats = localStorage.getItem('xdiagrams_cache_stats');
      return stats ? JSON.parse(stats) : { entries: 0, size: 0, timestamp: 0 };
    } catch (error) {
      console.error('📦 [Cache] Error reading stats:', error);
      return { entries: 0, size: 0, timestamp: 0 };
    }
  },

  // Check if URL should be cached
  shouldCache: function(url) {
    // 1) Evitar caché para archivos locales (mismo origen o rutas relativas)
    try {
      const parsed = new URL(url, window.location.href);
      if (parsed.origin === window.location.origin) {
        return false;
      }
    } catch (e) {
      // Si falla el parseo asumimos que es una ruta relativa → local
      return false;
    }

    // 2) Para URLs remotas, aplicar la caché solo si son endpoints REST
    return isRestApiEndpoint(url);
  }
};



// Enhanced loadFromRestApi with intelligent caching
function loadFromRestApiWithCache(apiUrl, onComplete, retryCount = 0, diagramConfig = null) {
  console.log("🌐 Cargando desde API REST:", apiUrl);
  console.log("🔍 [Cache] Function called with URL:", apiUrl);
  
  // Debug: Check all cache entries before processing
  const allKeys = Object.keys(localStorage);
  const cacheKeys = allKeys.filter(key => key.startsWith('xdiagrams_cache_'));
  console.log("🔍 [Cache] All cache keys before processing:", cacheKeys);
  if (cacheKeys.length > 0) {
    cacheKeys.forEach(key => {
      try {
        const data = JSON.parse(localStorage.getItem(key));
        console.log("🔍 [Cache] Found cache entry:", key, "for URL:", data.url);
      } catch (e) {
        console.log("🔍 [Cache] Invalid cache entry:", key);
      }
    });
  }
  
  const loadingElement = document.querySelector("#loading");
  const errorElement = document.querySelector("#error-message");
  
  if (loadingElement) loadingElement.style.display = "block";
  if (errorElement) errorElement.style.display = "none";

  // Check cache first
  console.log("🔍 [Cache] Checking if should cache:", apiUrl);
  const shouldCache = CacheManager.shouldCache(apiUrl);
  console.log("🔍 [Cache] Should cache result:", shouldCache);
  
  if (shouldCache) {
    console.log("✅ [Cache] URL is cacheable, checking cache...");
    const cachedData = CacheManager.get(apiUrl);
    console.log("🔍 [Cache] Cache result:", cachedData ? "FOUND" : "NOT FOUND");
    if (cachedData) {
      console.log("📦 [Cache] Using cached data, skipping API call");
      
      try {
        const trees = buildHierarchies(cachedData, diagramConfig);
        drawTrees(trees, diagramConfig);
        
        // Create side panel only if enabled
        if (isOptionEnabled('sidePanel') !== false) {
          createSidePanel();
        }
        
        // Preserve current theme after loading diagram
        setTimeout(async () => {
          if (window.preserveCurrentTheme) {
            await window.preserveCurrentTheme();
          }
        }, 100);
        
        console.log("Diagrama cargado desde: CACHE | URL: " + apiUrl + " | Registros: " + cachedData.length);
        
        // Trigger onLoad hook
        triggerHook('onLoad', { 
          url: apiUrl, 
          data: cachedData, 
          trees: trees,
          sourceType: 'rest-api-cached',
          timestamp: new Date().toISOString()
        });
        
        if (onComplete && typeof onComplete === 'function') {
          onComplete();
        }
        return;
      } catch (error) {
        console.error("❌ Error procesando datos del cache:", error);
        // Fall back to API call
        console.log("🔄 Fallback: cargando desde API...");
      }
    }
  }

  // Add cache-busting parameter (only if not using cache)
  const cacheBuster = `?t=${Date.now()}`;
  const urlWithCacheBuster = apiUrl.includes('?') ? `${apiUrl}&_cb=${Date.now()}` : `${apiUrl}${cacheBuster}`;
  
  fetch(urlWithCacheBuster)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json();
    })
    .then(jsonData => {
      console.log("✅ JSON cargado exitosamente:", jsonData);
      
      // Convert JSON to CSV-like format
      const csvData = convertJsonToCsvFormat(jsonData);
      
      if (!csvData || csvData.length === 0) {
        throw new Error('No se encontraron datos válidos en la respuesta JSON');
      }

      // Cache the data if appropriate
      console.log("🔍 [Cache] Checking if should cache after fetch:", apiUrl);
      if (CacheManager.shouldCache(apiUrl)) {
        console.log("✅ [Cache] Caching data for:", apiUrl);
        CacheManager.set(apiUrl, csvData);
      } else {
        console.log("❌ [Cache] Not caching data for:", apiUrl);
      }
      
      // Process the data
      const trees = buildHierarchies(csvData, diagramConfig);
      drawTrees(trees, diagramConfig);
      
      // Create side panel only if enabled
      if (isOptionEnabled('sidePanel') !== false) {
        createSidePanel();
      }
      
      // Preserve current theme after loading diagram
      setTimeout(async () => {
        if (window.preserveCurrentTheme) {
          await window.preserveCurrentTheme();
        }
      }, 100);
      
      console.log("Diagrama cargado desde: API REST | URL: " + apiUrl + " | Registros: " + csvData.length);
      
      // Trigger onLoad hook
      triggerHook('onLoad', { 
        url: apiUrl, 
        data: csvData, 
        trees: trees,
        sourceType: 'rest-api',
        timestamp: new Date().toISOString()
      });
      
      if (onComplete && typeof onComplete === 'function') {
        onComplete();
      }
    })
    .catch(error => {
      console.error("❌ Error cargando desde API REST:", error);
      
      // Handle retry logic for network errors
      if (retryCount < 2 && (error.message.includes('Failed to fetch') || error.message.includes('NetworkError'))) {
        console.log(`[Retry] Network error detected, retrying in 2 seconds... (attempt ${retryCount + 1})`);
        setTimeout(() => {
          loadFromRestApiWithCache(apiUrl, onComplete, retryCount + 1);
        }, 2000);
        return;
      }
      
      // Show error
      if (errorElement) {
        errorElement.innerText = `Error cargando API: ${error.message}`;
        errorElement.style.display = "block";
      }
      if (loadingElement) loadingElement.style.display = "none";
      
      if (onComplete && typeof onComplete === 'function') {
        onComplete();
      }
    });
}

// Nueva función: configurar botón de refresco global
function setupDataRefreshButton() {
  const refreshBtn = document.getElementById('data-refresh');
  if (!refreshBtn) {
    console.warn('[Refresh] Botón de refresh no encontrado');
    return;
  }

  // Eliminar posibles listeners previos clonando el nodo
  const newBtn = refreshBtn.cloneNode(true);
  refreshBtn.parentNode.replaceChild(newBtn, refreshBtn);

  newBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('[Refresh] Click en botón de refresh');

    // Animación de carga
    newBtn.classList.add('loading');

    // Limpiar caché inteligente
    if (window.xDiagramsCache && window.xDiagramsCache.clearAll) {
      window.xDiagramsCache.clearAll();
    }
    // Limpiar caché heredada
    if (window.$xDiagrams && window.$xDiagrams.clearCache) {
      window.$xDiagrams.clearCache();
    }

    // Vaciar diagramas cargados en memoria
    if (window.$xDiagrams && window.$xDiagrams.loadedDiagrams) {
      window.$xDiagrams.loadedDiagrams.clear();
    }

    // Recargar diagrama actual
    const diagrams = typeof getDiagrams === 'function' ? getDiagrams() : [];
    const idx = window.$xDiagrams && typeof window.$xDiagrams.currentDiagramIdx === 'number' ? window.$xDiagrams.currentDiagramIdx : 0;
    const currentDiagram = diagrams && diagrams[idx] ? diagrams[idx] : null;

    if (currentDiagram && window.$xDiagrams && typeof window.$xDiagrams.loadDiagram === 'function') {
      setTimeout(() => {
        window.$xDiagrams.loadDiagram(currentDiagram);
        // Quitar animación tras recarga
        setTimeout(() => newBtn.classList.remove('loading'), 1000);
      }, 120);
    } else {
      // Fallback: recargar página
      setTimeout(() => window.location.reload(), 300);
    }
  });
}

// Preload common thumbnail images using embedded thumbnails to prevent Chrome's default image flash
function preloadCommonImages() {
  const commonImages = [
    'detail', 'document', 'settings', 'form', 'list', 'modal', 
    'grid', 'report', 'file-csv', 'file-pdf', 'file-xls', 'file-xml',
    'home', 'transparent'
  ].map(name => name.toLowerCase().replace(/\s+/g, '-'));
  
  let loadedCount = 0;
  const totalImages = commonImages.length;
  
  commonImages.forEach(imageName => {
    // Verificar si existe como thumbnail embebido
    const embeddedThumbnail = getEmbeddedThumbnail(imageName);
    if (embeddedThumbnail) {
      // Usar thumbnail embebido
      const img = new Image();
      img.onload = function() {
        loadedCount++;
        if (loadedCount === totalImages) {
          console.log('🖼️ [Preload] All common embedded thumbnails preloaded successfully');
        }
      };
      img.onerror = function() {
        console.warn(`[Preload] Failed to load embedded thumbnail: ${imageName}`);
        loadedCount++;
        if (loadedCount === totalImages) {
          console.log('🖼️ [Preload] Common embedded thumbnails preload completed with some errors');
        }
      };
      img.src = embeddedThumbnail;
    } else {
      // Si no existe como embebido, intentar cargar como archivo externo
      const img = new Image();
      img.onload = function() {
        loadedCount++;
        if (loadedCount === totalImages) {
          console.log('🖼️ [Preload] All common images preloaded successfully');
        }
      };
      img.onerror = function() {
        console.warn(`[Preload] Failed to load image: ${imageName}.svg`);
        loadedCount++;
        if (loadedCount === totalImages) {
          console.log('🖼️ [Preload] Common images preload completed with some errors');
        }
      };
      img.src = `img/${imageName}.svg?t=${Date.now()}`;
    }
  });
}

// Enhanced image loading with embedded thumbnail fallback
function createImageElement(baseUrl, fallbackUrl, className = "image-base") {
  const img = new Image();
  const cacheBuster = `?t=${Date.now()}`;
  const finalUrl = baseUrl.includes('?') ? `${baseUrl}&_cb=${Date.now()}` : `${baseUrl}${cacheBuster}`;
  
  img.onload = function() {
    // Image loaded successfully
    this.classList.add('loaded');
    // Solo aplicar el filtro si es necesario
    if (shouldApplyFilter(baseUrl)) {
      this.classList.add('image-filter');
    }
  };
  
  img.onerror = function() {
    // Try fallback URL first
    if (fallbackUrl && this.src !== fallbackUrl) {
      this.src = fallbackUrl;
      // Verificar si el fallback necesita filtro
      if (shouldApplyFilter(fallbackUrl)) {
        this.classList.add('image-filter');
      } else {
        this.classList.remove('image-filter');
      }
    } else {
      // If no fallback URL or fallback also fails, use detail embedded thumbnail
      console.log(`[Image Load] Error loading ${baseUrl}, using detail embedded thumbnail`);
      
      // Para esta función, usar detail como fallback por defecto
      // (ya que no tenemos acceso al contexto del nodo aquí)
      const detailThumbnail = getEmbeddedThumbnail('detail');
      if (detailThumbnail) {
        // Crear elemento SVG embebido
        const svgString = getEmbeddedThumbnailSvgString(detailThumbnail);
        if (svgString) {
          const svgElement = createEmbeddedSVGElement(svgString, className, {});
          if (svgElement) {
            // Reemplazar el elemento image fallido con el SVG embebido
            if (this.parentNode) {
              this.parentNode.replaceChild(svgElement, this);
              return;
            }
          }
        }
      }
      
      // Si no se pudo crear el SVG embebido, ocultar la imagen
      console.log(`[Image Load] Could not create embedded thumbnail, hiding element`);
      this.style.display = 'none';
    }
  };
  
  img.src = finalUrl;
  img.className = className;
  
  return img;
}

// Helper function to resolve node image URL - COLUMNA IMG TIENE PRIORIDAD ABSOLUTA
function resolveNodeImage(node) {
  // Obtener valor de la columna img directamente del nodo
  const imgVal = node.img || (node.data && node.data.img) || "";
  const typeVal = node.type || (node.data && node.data.type) || "";

  console.log(`[resolveNodeImage] Processing node: ${node.name || node.data?.name || 'unknown'}`);
  console.log(`[resolveNodeImage] Img value: "${imgVal}"`);
  console.log(`[resolveNodeImage] Type value: "${typeVal}"`);

  // COLUMNA IMG TIENE PRIORIDAD ABSOLUTA - SIEMPRE usar img si tiene valor
  if (imgVal && imgVal.trim() !== "") {
    // Si es una URL absoluta, data URI o ruta con barra, úsala directamente
    if (/^(https?:\/\/|data:|\/)/i.test(imgVal) || imgVal.includes('/')) {
      console.log(`[resolveNodeImage] Img "${imgVal}" -> imagen externa/local (prioridad absoluta)`);
      return imgVal;
    }
    
    // Si es un nombre simple sin ruta, verificar si existe como thumbnail embebido
    let fileName = imgVal.toLowerCase().replace(/\s+/g, '-');
    if (!fileName.match(/\.[a-z0-9]+$/i)) {
      fileName += '.svg';
    }
    
    // Verificar si existe como thumbnail embebido
    const embeddedThumbnail = getEmbeddedThumbnail(fileName.replace('.svg', ''));
    if (embeddedThumbnail) {
      console.log(`[resolveNodeImage] Img "${fileName}" -> thumbnail embebido encontrado`);
      return embeddedThumbnail;
    }
    
    // Si no es embebido, usar como archivo externo (el sistema de error handling se encargará del fallback)
    console.log(`[resolveNodeImage] Img "${fileName}" -> archivo externo (prioridad absoluta)`);
    return `img/${fileName}`;
  }

  // SOLO si img está completamente vacío, usar type como fallback
  const typeName = (typeVal || 'detail').toLowerCase().replace(/\s+/g, '-');
  
  // Verificar si el type existe como thumbnail embebido
  const embeddedThumbnail = getEmbeddedThumbnail(typeName);
  if (embeddedThumbnail) {
    console.log(`[resolveNodeImage] Type "${typeName}" -> thumbnail embebido encontrado`);
    return embeddedThumbnail;
  }
  
  // Si no existe el thumbnail embebido, usar detail como fallback final
  const detailThumbnail = getEmbeddedThumbnail('detail');
  if (detailThumbnail) {
    console.log(`[resolveNodeImage] Type "${typeName}" no encontrado, usando detail embebido`);
    return detailThumbnail;
  }
  
  // Último recurso: archivo externo (el sistema de error handling se encargará del fallback)
  return `img/${typeName}.svg`;
}

// Helper: determine if CSS filter should be applied (para archivos SVG)
function shouldApplyFilter(url) {
  // Si es una URL de datos (data URI), no aplicar filtro
  if (url.startsWith('data:')) return false;
  
  // Si es una URL externa (http/https), no aplicar filtro
  if (url.match(/^https?:\/\//i)) return false;
  
  // Extraer el nombre del archivo sin parámetros
  const baseUrl = url.split('?')[0].toLowerCase();
  
  // Si no es un archivo SVG, no aplicar filtro
  if (!baseUrl.endsWith('.svg')) return false;
  
  // Aplicar filtro a todas las imágenes locales SVG
  return true;
}

// ============================================================================
// AUTO LOGO DETECTION
// ============================================================================

// Function to get embedded SVG for drag and drop icons
function getEmbeddedDragDropIcon(iconName) {
  if (EMBEDDED_THUMBNAILS[iconName]) {
    const svgString = EMBEDDED_THUMBNAILS[iconName].trim();
    // Replace the original dimensions with 48x48 for drag and drop icons
    return svgString
      .replace(/width="200"/, 'width="48"')
      .replace(/height="180"/, 'height="48"')
      .replace(/viewBox="0 0 200 180"/, 'viewBox="0 0 200 180"');
  }
  return null;
}

// Function to detect logo files automatically in img folder
async function detectAutoLogo() {
  // If logo is already set, don't try to detect again
  if (window.$xDiagrams && window.$xDiagrams.logo) {
    return;
  }
  
  const logoExtensions = ['svg', 'png', 'jpg', 'jpeg'];
  const imgPath = 'img/';
  
  // Check if any logo file exists using fetch (more efficient than Image objects)
  for (const ext of logoExtensions) {
    const logoUrl = `${imgPath}logo.${ext}`;
    
    try {
      const response = await fetch(logoUrl, { method: 'HEAD' });
      if (response.ok) {
        // If file exists, set it as auto logo
        if (!window.$xDiagrams.logo) {
          window.$xDiagrams.logo = logoUrl;
          console.log('[Auto Logo] Logo detectado automáticamente:', logoUrl);
          
          // Update the topbar if it already exists
          if (window.$xDiagrams.updateTopbarTitle) {
            window.$xDiagrams.updateTopbarTitle(window.$xDiagrams.currentDiagramIdx || 0).catch(error => {
              console.error('[Topbar] Error updating title:', error);
            });
          }
        }
        return; // Exit early if logo found
      }
    } catch (error) {
      // Silently continue to next extension
      continue;
    }
  }
  
  // If no logo found, log once
  console.log('[Auto Logo] No se encontró ningún archivo de logo en img/');
}

// ============================================================================
// THUMBNAILS EMBEBIDOS - SISTEMA DE GESTIÓN INTERNA
// ============================================================================

/**
 * Biblioteca de thumbnails embebidos para evitar peticiones externas
 * Los thumbnails se almacenan como strings SVG y se convierten a data URIs
 * cuando se necesitan. Esto mejora el rendimiento y reduce las peticiones HTTP.
 */
const EMBEDDED_THUMBNAILS = {
// Thumbnails básicos del sistema
'detail': `
<svg width="200" height="180" viewBox="0 0 200 180" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="84" width="160" height="82" fill="black" fill-opacity="0.1"/>
  <rect x="20" y="23" width="160" height="43" fill="black" fill-opacity="0.1"/>
</svg>
` ,
  
'document': `
<svg width="200" height="180" viewBox="0 0 200 180" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M29 21H144L174 51V171H29V21Z" fill="black" fill-opacity="0.05"/>
  <path d="M144 21L174 51L144 51L144 21Z" fill="black" fill-opacity="0.1"/>
  <rect x="55" y="124" width="94" height="16" fill="black" fill-opacity="0.1"/>
  <rect x="55" y="92" width="94" height="16" fill="black" fill-opacity="0.1"/>
  <rect x="55" y="58" width="40" height="16" fill="black" fill-opacity="0.1"/>
</svg>
`,
  
'form': `
<svg width="200" height="180" viewBox="0 0 200 180" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="133" width="83" height="27" fill="black" fill-opacity="0.2"/>
  <rect x="119" y="133" width="61" height="27" fill="black" fill-opacity="0.5"/>
  <rect x="20" y="75" width="160" height="32" fill="black" fill-opacity="0.1"/>
  <rect x="20" y="25" width="160" height="32" fill="black" fill-opacity="0.1"/>
</svg>
`,
  
'list': `
<svg width="200" height="180" viewBox="0 0 200 180" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="61" width="160" height="24" fill="black" fill-opacity="0.1"/>
  <rect x="20" y="101" width="160" height="24" fill="black" fill-opacity="0.1"/>
  <rect x="20" y="141" width="160" height="24" fill="black" fill-opacity="0.1"/>
  <rect x="20" y="21" width="160" height="24" fill="black" fill-opacity="0.1"/>
</svg>
`,
  
'grid': `
<svg width="200" height="180" viewBox="0 0 200 180" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="26" y="103" width="64" height="64" fill="black" fill-opacity="0.1"/>
  <rect x="110" y="103" width="64" height="64" fill="black" fill-opacity="0.1"/>
  <rect x="26" y="19" width="64" height="64" fill="black" fill-opacity="0.1"/>
  <rect x="110" y="19" width="64" height="64" fill="black" fill-opacity="0.1"/>
</svg>
`,
  
'report': `
<svg width="200" height="180" viewBox="0 0 200 180" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect x="20" y="136" width="160" height="30" fill="black" fill-opacity="0.1"/>
<path d="M154 53C166.976 53 173.997 63.2091 180 71.4629V118H22.7783C28.3323 111.031 34.7425 103.057 41.6133 96.4492C49.8404 88.5368 57.323 84 63.5 84C66.5083 84 69.6098 85.0108 73.168 86.833C76.9895 88.7902 80.1119 90.9665 84.4668 93.499C88.4181 95.7968 93.0546 98.1512 98.1924 98.9121C103.615 99.7151 109.196 98.6937 114.795 95.0146C125.945 87.6878 132.947 75.5616 138.594 66.9316C141.591 62.3512 144.157 58.7661 146.82 56.3037C149.345 53.9688 151.571 53 154 53ZM180 52.4072C173.912 46.4123 165.48 41 154 41C147.679 41 142.679 43.7882 138.673 47.4932C134.804 51.071 131.531 55.8097 128.553 60.3613C122.249 69.9954 116.751 79.3693 108.205 84.9854C105.054 87.056 102.442 87.4098 99.9512 87.041C97.1758 86.63 94.1783 85.2656 90.499 83.126C87.2234 81.2211 82.7179 78.241 78.6377 76.1514C74.2939 73.9268 69.219 72 63.5 72C52.2223 72 41.7041 79.7132 33.2949 87.8008C28.572 92.3431 24.0716 97.4546 20 102.356V19H180V52.4072Z" fill="black" fill-opacity="0.1"/>
</svg>
`,
  
'settings': `
<svg width="200" height="180" viewBox="0 0 200 180" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M152.5 91.0449C152.5 93.574 151.005 95.864 148.689 96.8814L143.246 99.2732C142.532 101.628 141.623 103.882 140.52 106.061L143.808 114.457C144.731 116.815 144.171 119.495 142.382 121.287L135.88 127.796C134.091 129.587 131.411 130.15 129.052 129.229L120.416 125.858C118.543 126.762 116.577 127.536 114.565 128.172L112.135 133.71C111.119 136.027 108.828 137.523 106.298 137.523H97.0919C94.5569 137.523 92.2627 136.021 91.2489 133.698L88.8984 128.311C86.6822 127.638 84.5448 126.813 82.4955 125.821L73.4091 129.372C71.051 130.293 68.3711 129.732 66.5809 127.942L60.0809 121.442C58.291 119.652 57.7296 116.972 58.6507 114.614L62.2022 105.523C61.2378 103.511 60.4172 101.42 59.7542 99.2732L54.3106 96.8814C51.9951 95.864 50.5 93.574 50.5 91.0449V81.8336C50.5 79.3026 51.9973 77.0113 54.3154 75.9951L59.7959 73.5924C60.6073 70.9867 61.6644 68.4692 62.9208 66.1L60.3471 59.5052C59.4264 57.1461 59.9894 54.4657 61.7814 52.6763L68.293 46.1745C70.0828 44.3874 72.7598 43.8274 75.1158 44.7471L82.0458 47.4525C84.2249 46.3676 86.5199 45.4404 88.903 44.7264L91.2546 39.3287C92.2677 37.0035 94.5627 35.5 97.099 35.5H106.302C108.833 35.5 111.123 36.9965 112.14 39.3136L114.57 44.8515C116.911 45.598 119.183 46.5345 121.33 47.6334L128.382 44.8817C130.74 43.962 133.418 44.5236 135.207 46.3129L141.708 52.8134C143.498 54.604 144.059 57.2847 143.137 59.6431L140.385 66.6795C141.498 68.8957 142.462 71.1954 143.204 73.5924L148.685 75.9951C151.003 77.0113 152.5 79.3026 152.5 81.8336V91.0449ZM127 86.5C127 100.583 115.583 112 101.5 112C87.4167 112 76 100.583 76 86.5C76 72.4167 87.4167 61 101.5 61C115.583 61 127 72.4167 127 86.5Z" fill="black" fill-opacity="0.12"/>
</svg>
`,
  
'modal': `
<svg width="200" height="180" viewBox="0 0 200 180" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g clip-path="url(#clip0_6524_904)">
  <path d="M200 180H0V0H200V180ZM35 23V153H165V23H35Z" fill="black" fill-opacity="0.03"/>
  <rect x="53" y="113.45" width="48.7625" height="15.8625" fill="black" fill-opacity="0.3"/>
  <rect x="111.162" y="113.45" width="35.8375" height="15.8625" fill="black" fill-opacity="0.6"/>
  <rect x="53" y="79.375" width="94" height="18.8" fill="black" fill-opacity="0.1"/>
  <rect x="53" y="50" width="94" height="18.8" fill="black" fill-opacity="0.1"/>
  </g>
  <defs>
  <clipPath id="clip0_6524_904">
  <rect width="200" height="180" fill="white"/>
  </clipPath>
  </defs>
</svg>
`,
  
// Thumbnails de archivos
'file-csv': `
<svg width="200" height="180" viewBox="0 0 200 180" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M29 21H144L174 51V171H29V21Z" fill="black" fill-opacity="0.05"/>
<path d="M144 21L174 51L144 51L144 21Z" fill="black" fill-opacity="0.1"/>
<path d="M117.377 92.6365L121.931 107.551H122.1L126.654 92.6365H132.162L125.291 113H118.739L111.868 92.6365H117.377Z" fill="black" fill-opacity="0.4"/>
<path d="M104.156 98.7414C104.089 98.0123 103.794 97.4455 103.271 97.0411C102.754 96.6302 102.015 96.4247 101.053 96.4247C100.417 96.4247 99.8868 96.5075 99.4626 96.6733C99.0383 96.839 98.7202 97.0677 98.508 97.3593C98.2959 97.6444 98.1865 97.9725 98.1799 98.3437C98.1667 98.6486 98.2263 98.9171 98.3589 99.1491C98.4981 99.3811 98.697 99.5866 98.9555 99.7656C99.2206 99.9379 99.5388 100.09 99.91 100.223C100.281 100.356 100.699 100.472 101.163 100.571L102.913 100.969C103.92 101.187 104.809 101.479 105.578 101.844C106.353 102.208 107.003 102.642 107.526 103.146C108.057 103.65 108.458 104.23 108.73 104.886C109.001 105.543 109.141 106.278 109.147 107.094C109.141 108.38 108.816 109.483 108.173 110.405C107.53 111.326 106.605 112.032 105.399 112.523C104.199 113.013 102.75 113.258 101.053 113.258C99.3499 113.258 97.865 113.003 96.5989 112.493C95.3328 111.982 94.3485 111.207 93.6458 110.166C92.9432 109.125 92.5819 107.81 92.562 106.219H97.2751C97.3149 106.875 97.4905 107.422 97.8021 107.859C98.1136 108.297 98.5412 108.628 99.0847 108.854C99.6349 109.079 100.271 109.192 100.994 109.192C101.657 109.192 102.22 109.102 102.684 108.923C103.155 108.744 103.516 108.496 103.768 108.178C104.02 107.859 104.149 107.495 104.156 107.084C104.149 106.699 104.03 106.371 103.798 106.099C103.566 105.821 103.208 105.582 102.724 105.383C102.247 105.178 101.637 104.989 100.894 104.817L98.7666 104.32C97.0033 103.915 95.6146 103.262 94.6004 102.361C93.5862 101.453 93.0824 100.226 93.089 98.6818C93.0824 97.4223 93.4204 96.3186 94.1032 95.3707C94.786 94.4228 95.7306 93.6837 96.937 93.1534C98.1435 92.6231 99.5189 92.3579 101.063 92.3579C102.641 92.3579 104.01 92.6264 105.17 93.1633C106.337 93.6936 107.241 94.4393 107.884 95.4005C108.527 96.3617 108.856 97.4753 108.869 98.7414H104.156Z" fill="black" fill-opacity="0.4"/>
<path d="M89.2122 100.014H84.2406C84.1743 99.5037 84.0384 99.043 83.8329 98.6321C83.6274 98.2211 83.3556 97.8697 83.0176 97.5781C82.6795 97.2864 82.2784 97.0644 81.8144 96.9119C81.357 96.7528 80.8499 96.6733 80.2931 96.6733C79.3054 96.6733 78.4536 96.9152 77.7377 97.3991C77.0284 97.883 76.4816 98.5823 76.0971 99.4971C75.7193 100.412 75.5303 101.519 75.5303 102.818C75.5303 104.17 75.7226 105.304 76.107 106.219C76.4981 107.127 77.045 107.813 77.7477 108.277C78.457 108.734 79.2955 108.963 80.2633 108.963C80.8069 108.963 81.3007 108.893 81.7448 108.754C82.1956 108.615 82.59 108.413 82.9281 108.148C83.2728 107.876 83.5545 107.548 83.7732 107.163C83.9986 106.772 84.1544 106.331 84.2406 105.841L89.2122 105.871C89.126 106.772 88.8641 107.66 88.4266 108.535C87.9958 109.41 87.4025 110.209 86.6468 110.932C85.8911 111.648 84.9697 112.218 83.8826 112.642C82.8021 113.066 81.5625 113.278 80.1639 113.278C78.3211 113.278 76.6705 112.874 75.2122 112.065C73.7605 111.25 72.6137 110.063 71.7718 108.506C70.93 106.948 70.509 105.052 70.509 102.818C70.509 100.578 70.9366 98.6785 71.7917 97.1207C72.6468 95.5629 73.8035 94.3797 75.2619 93.571C76.7202 92.7623 78.3542 92.3579 80.1639 92.3579C81.3968 92.3579 82.537 92.5303 83.5843 92.875C84.6317 93.213 85.5531 93.7102 86.3485 94.3664C87.144 95.0161 87.7903 95.8148 88.2874 96.7627C88.7846 97.7107 89.0928 98.7945 89.2122 100.014Z" fill="black" fill-opacity="0.4"/>
</svg>
`,
  
'file-pdf': `
<svg width="200" height="180" viewBox="0 0 200 180" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M29 21H144L174 51V171H29V21Z" fill="black" fill-opacity="0.05"/>
<path d="M144 21L174 51L144 51L144 21Z" fill="black" fill-opacity="0.1"/>
<path d="M114.831 113V92.6365H128.732V96.6336H119.753V100.81H127.847V104.817H119.753V113H114.831Z" fill="black" fill-opacity="0.4"/>
<path d="M100.785 113H93.2581V92.6365H100.775C102.85 92.6365 104.636 93.0441 106.134 93.8595C107.639 94.6682 108.799 95.8349 109.615 97.3595C110.43 98.8775 110.838 100.694 110.838 102.808C110.838 104.93 110.43 106.752 109.615 108.277C108.806 109.802 107.649 110.972 106.144 111.787C104.64 112.596 102.853 113 100.785 113ZM98.1799 108.804H100.596C101.736 108.804 102.701 108.612 103.49 108.227C104.285 107.836 104.885 107.203 105.289 106.328C105.7 105.447 105.906 104.273 105.906 102.808C105.906 101.343 105.7 100.177 105.289 99.3083C104.878 98.4333 104.272 97.8036 103.47 97.4191C102.674 97.028 101.693 96.8325 100.527 96.8325H98.1799V108.804Z" fill="black" fill-opacity="0.4"/>
<path d="M73.8723 113V92.6365H82.2842C83.8089 92.6365 85.1247 92.9348 86.2317 93.5314C87.3453 94.1213 88.2038 94.9466 88.807 96.0072C89.4102 97.0612 89.7118 98.2875 89.7118 99.6862C89.7118 101.091 89.4036 102.321 88.7871 103.375C88.1772 104.422 87.3056 105.234 86.172 105.811C85.0385 106.388 83.6929 106.676 82.1351 106.676H76.9448V102.798H81.2203C81.9628 102.798 82.5825 102.669 83.0797 102.411C83.5835 102.152 83.9646 101.791 84.2232 101.327C84.4817 100.856 84.611 100.309 84.611 99.6862C84.611 99.0565 84.4817 98.5129 84.2232 98.0555C83.9646 97.5915 83.5835 97.2335 83.0797 96.9816C82.5759 96.7298 81.9561 96.6038 81.2203 96.6038H78.7942V113H73.8723Z" fill="black" fill-opacity="0.4"/>
</svg>
`,
  
'file-xls': `
<svg width="200" height="180" viewBox="0 0 200 180" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M29 21H144L174 51V171H29V21Z" fill="black" fill-opacity="0.05"/>
<path d="M144 21L174 51L144 51L144 21Z" fill="black" fill-opacity="0.1"/>
<path d="M123.733 98.7414C123.666 98.0123 123.371 97.4455 122.848 97.0411C122.331 96.6302 121.592 96.4247 120.63 96.4247C119.994 96.4247 119.464 96.5075 119.039 96.6733C118.615 96.839 118.297 97.0677 118.085 97.3593C117.873 97.6444 117.763 97.9725 117.757 98.3437C117.744 98.6486 117.803 98.9171 117.936 99.1491C118.075 99.3811 118.274 99.5866 118.532 99.7656C118.798 99.9379 119.116 100.09 119.487 100.223C119.858 100.356 120.276 100.472 120.74 100.571L122.49 100.969C123.497 101.187 124.386 101.479 125.155 101.844C125.93 102.208 126.58 102.642 127.103 103.146C127.634 103.65 128.035 104.23 128.307 104.886C128.578 105.543 128.718 106.278 128.724 107.094C128.718 108.38 128.393 109.483 127.75 110.405C127.107 111.326 126.182 112.032 124.976 112.523C123.776 113.013 122.327 113.258 120.63 113.258C118.927 113.258 117.442 113.003 116.176 112.493C114.91 111.982 113.925 111.207 113.223 110.166C112.52 109.125 112.159 107.81 112.139 106.219H116.852C116.892 106.875 117.067 107.422 117.379 107.859C117.691 108.297 118.118 108.628 118.662 108.854C119.212 109.079 119.848 109.192 120.571 109.192C121.234 109.192 121.797 109.102 122.261 108.923C122.732 108.744 123.093 108.496 123.345 108.178C123.597 107.859 123.726 107.495 123.733 107.084C123.726 106.699 123.607 106.371 123.375 106.099C123.143 105.821 122.785 105.582 122.301 105.383C121.824 105.178 121.214 104.989 120.471 104.817L118.343 104.32C116.58 103.915 115.191 103.262 114.177 102.361C113.163 101.453 112.659 100.226 112.666 98.6818C112.659 97.4223 112.997 96.3186 113.68 95.3707C114.363 94.4228 115.307 93.6837 116.514 93.1534C117.72 92.6231 119.096 92.3579 120.64 92.3579C122.218 92.3579 123.587 92.6264 124.747 93.1633C125.914 93.6936 126.818 94.4393 127.461 95.4005C128.104 96.3617 128.432 97.4753 128.446 98.7414H123.733Z" fill="black" fill-opacity="0.4"/>
<path d="M95.6643 113V92.6365H100.586V109.003H109.058V113H95.6643Z" fill="black" fill-opacity="0.4"/>
<path d="M78.8539 92.6365L82.5726 99.0697H82.7317L86.4902 92.6365H91.9988L85.8539 102.818L92.1976 113H86.5499L82.7317 106.497H82.5726L78.7544 113H73.1465L79.4604 102.818L73.3056 92.6365H78.8539Z" fill="black" fill-opacity="0.4"/>
</svg>
`,
  
'file-xml': `
<svg width="200" height="180" viewBox="0 0 200 180" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M29 21H144L174 51V171H29V21Z" fill="black" fill-opacity="0.05"/>
<path d="M144 21L174 51L144 51L144 21Z" fill="black" fill-opacity="0.1"/>
<path d="M119.446 113V92.6365H124.368V109.003H132.84V113H119.446Z" fill="black" fill-opacity="0.4"/>
<path d="M92.4866 92.6365H98.5817L103.752 105.244H103.991L109.161 92.6365H115.256V113H110.464V100.492H110.295L105.403 112.871H102.34L97.4482 100.422H97.2792V113H92.4866V92.6365Z" fill="black" fill-opacity="0.4"/>
<path d="M75.6761 92.6365L79.3949 99.0697H79.554L83.3125 92.6365H88.821L82.6761 102.818L89.0199 113H83.3722L79.554 106.497H79.3949L75.5767 113H69.9688L76.2827 102.818L70.1278 92.6365H75.6761Z" fill="black" fill-opacity="0.4"/>
</svg>
`,
  
'file-html': `
<svg width="200" height="180" viewBox="0 0 200 180" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M29 21H144L174 51V171H29V21Z" fill="black" fill-opacity="0.05"/>
<path d="M144 21L174 51L144 51L144 21Z" fill="black" fill-opacity="0.1"/>
<path d="M129.118 113V92.6362H134.04V109.003H142.511V113H129.118Z" fill="black" fill-opacity="0.4"/>
<path d="M102.158 92.6362H108.253L113.423 105.244H113.662L118.832 92.6362H124.928V113H120.135V100.491H119.966L115.074 112.871H112.011L107.119 100.422H106.95V113H102.158V92.6362Z" fill="black" fill-opacity="0.4"/>
<path d="M81.4224 96.6334V92.6362H98.634V96.6334H92.4593V113H87.607V96.6334H81.4224Z" fill="black" fill-opacity="0.4"/>
<path d="M60.0232 113V92.6362H64.9451V100.81H72.9692V92.6362H77.8811V113H72.9692V104.817H64.9451V113H60.0232Z" fill="black" fill-opacity="0.4"/>
</svg>
`,
  
'file-js': `
<svg width="200" height="180" viewBox="0 0 200 180" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M29 21H144L174 51V171H29V21Z" fill="black" fill-opacity="0.05"/>
<path d="M144 21L174 51L144 51L144 21Z" fill="black" fill-opacity="0.1"/>
<path d="M112.974 98.7414C112.907 98.0123 112.612 97.4455 112.089 97.0411C111.572 96.6302 110.833 96.4247 109.871 96.4247C109.235 96.4247 108.705 96.5075 108.28 96.6733C107.856 96.839 107.538 97.0677 107.326 97.3593C107.114 97.6444 107.004 97.9725 106.998 98.3437C106.985 98.6486 107.044 98.9171 107.177 99.1491C107.316 99.3811 107.515 99.5866 107.773 99.7656C108.038 99.9379 108.357 100.09 108.728 100.223C109.099 100.356 109.517 100.472 109.981 100.571L111.731 100.969C112.738 101.187 113.627 101.479 114.396 101.844C115.171 102.208 115.821 102.642 116.344 103.146C116.875 103.65 117.276 104.23 117.547 104.886C117.819 105.543 117.958 106.278 117.965 107.094C117.958 108.38 117.634 109.483 116.991 110.405C116.348 111.326 115.423 112.032 114.217 112.523C113.017 113.013 111.568 113.258 109.871 113.258C108.168 113.258 106.683 113.003 105.417 112.493C104.151 111.982 103.166 111.207 102.464 110.166C101.761 109.125 101.4 107.81 101.38 106.219H106.093C106.133 106.875 106.308 107.422 106.62 107.859C106.931 108.297 107.359 108.628 107.903 108.854C108.453 109.079 109.089 109.192 109.812 109.192C110.475 109.192 111.038 109.102 111.502 108.923C111.973 108.744 112.334 108.496 112.586 108.178C112.838 107.859 112.967 107.495 112.974 107.084C112.967 106.699 112.848 106.371 112.616 106.099C112.384 105.821 112.026 105.582 111.542 105.383C111.065 105.178 110.455 104.989 109.712 104.817L107.584 104.32C105.821 103.915 104.432 103.262 103.418 102.361C102.404 101.453 101.9 100.226 101.907 98.6818C101.9 97.4223 102.238 96.3186 102.921 95.3707C103.604 94.4228 104.548 93.6837 105.755 93.1534C106.961 92.6231 108.337 92.3579 109.881 92.3579C111.459 92.3579 112.828 92.6264 113.988 93.1633C115.155 93.6936 116.059 94.4393 116.702 95.4005C117.345 96.3617 117.673 97.4753 117.687 98.7414H112.974Z" fill="black" fill-opacity="0.4"/>
<path d="M92.9042 92.6362H97.7565V106.716C97.7498 108.035 97.435 109.188 96.8119 110.176C96.1888 111.157 95.327 111.919 94.2266 112.463C93.1329 113.006 91.8668 113.278 90.4284 113.278C89.1556 113.278 87.9989 113.056 86.9582 112.612C85.9241 112.168 85.0988 111.479 84.4823 110.544C83.8725 109.609 83.5709 108.413 83.5775 106.954H88.4795C88.4994 107.478 88.5988 107.926 88.7778 108.297C88.9634 108.661 89.2186 108.936 89.5434 109.122C89.8682 109.308 90.256 109.4 90.7068 109.4C91.1774 109.4 91.5751 109.301 91.8999 109.102C92.2248 108.897 92.47 108.595 92.6357 108.197C92.8081 107.8 92.8976 107.306 92.9042 106.716V92.6362Z" fill="black" fill-opacity="0.4"/>
</svg>
`,
  
'file-css': `
<svg width="200" height="180" viewBox="0 0 200 180" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M29 21H144L174 51V171H29V21Z" fill="black" fill-opacity="0.05"/>
<path d="M144 21L174 51L144 51L144 21Z" fill="black" fill-opacity="0.1"/>
<path d="M125.819 98.7414C125.752 98.0123 125.457 97.4455 124.934 97.0411C124.417 96.6302 123.678 96.4247 122.716 96.4247C122.08 96.4247 121.55 96.5075 121.125 96.6733C120.701 96.839 120.383 97.0677 120.171 97.3593C119.959 97.6444 119.849 97.9725 119.843 98.3437C119.829 98.6486 119.889 98.9171 120.022 99.1491C120.161 99.3811 120.36 99.5866 120.618 99.7656C120.883 99.9379 121.202 100.09 121.573 100.223C121.944 100.356 122.362 100.472 122.826 100.571L124.576 100.969C125.583 101.187 126.472 101.479 127.24 101.844C128.016 102.208 128.666 102.642 129.189 103.146C129.72 103.65 130.121 104.23 130.392 104.886C130.664 105.543 130.803 106.278 130.81 107.094C130.803 108.38 130.479 109.483 129.836 110.405C129.193 111.326 128.268 112.032 127.062 112.523C125.862 113.013 124.413 113.258 122.716 113.258C121.013 113.258 119.528 113.003 118.262 112.493C116.996 111.982 116.011 111.207 115.309 110.166C114.606 109.125 114.245 107.81 114.225 106.219H118.938C118.978 106.875 119.153 107.422 119.465 107.859C119.776 108.297 120.204 108.628 120.748 108.854C121.298 109.079 121.934 109.192 122.657 109.192C123.32 109.192 123.883 109.102 124.347 108.923C124.818 108.744 125.179 108.496 125.431 108.178C125.683 107.859 125.812 107.495 125.819 107.084C125.812 106.699 125.693 106.371 125.461 106.099C125.229 105.821 124.871 105.582 124.387 105.383C123.91 105.178 123.3 104.989 122.557 104.817L120.429 104.32C118.666 103.915 117.277 103.262 116.263 102.361C115.249 101.453 114.745 100.226 114.752 98.6818C114.745 97.4223 115.083 96.3186 115.766 95.3707C116.449 94.4228 117.393 93.6837 118.6 93.1534C119.806 92.6231 121.182 92.3579 122.726 92.3579C124.304 92.3579 125.673 92.6264 126.833 93.1633C127.999 93.6936 128.904 94.4393 129.547 95.4005C130.19 96.3617 130.518 97.4753 130.532 98.7414H125.819Z" fill="black" fill-opacity="0.4"/>
<path d="M106.214 98.7414C106.148 98.0123 105.853 97.4455 105.329 97.0411C104.812 96.6302 104.073 96.4247 103.112 96.4247C102.476 96.4247 101.945 96.5075 101.521 96.6733C101.097 96.839 100.779 97.0677 100.567 97.3593C100.355 97.6444 100.245 97.9725 100.239 98.3437C100.225 98.6486 100.285 98.9171 100.417 99.1491C100.557 99.3811 100.756 99.5866 101.014 99.7656C101.279 99.9379 101.597 100.09 101.969 100.223C102.34 100.356 102.757 100.472 103.221 100.571L104.971 100.969C105.979 101.187 106.867 101.479 107.636 101.844C108.412 102.208 109.061 102.642 109.585 103.146C110.115 103.65 110.516 104.23 110.788 104.886C111.06 105.543 111.199 106.278 111.206 107.094C111.199 108.38 110.874 109.483 110.231 110.405C109.588 111.326 108.664 112.032 107.457 112.523C106.257 113.013 104.809 113.258 103.112 113.258C101.408 113.258 99.9236 113.003 98.6575 112.493C97.3914 111.982 96.4071 111.207 95.7044 110.166C95.0018 109.125 94.6405 107.81 94.6206 106.219H99.3337C99.3734 106.875 99.5491 107.422 99.8607 107.859C100.172 108.297 100.6 108.628 101.143 108.854C101.694 109.079 102.33 109.192 103.052 109.192C103.715 109.192 104.279 109.102 104.743 108.923C105.213 108.744 105.575 108.496 105.827 108.178C106.078 107.859 106.208 107.495 106.214 107.084C106.208 106.699 106.088 106.371 105.856 106.099C105.624 105.821 105.266 105.582 104.783 105.383C104.305 105.178 103.695 104.989 102.953 104.817L100.825 104.32C99.0619 103.915 97.6732 103.262 96.659 102.361C95.6448 101.453 95.141 100.226 95.1476 98.6818C95.141 97.4223 95.479 96.3186 96.1618 95.3707C96.8446 94.4228 97.7892 93.6837 98.9956 93.1534C100.202 92.6231 101.578 92.3579 103.122 92.3579C104.7 92.3579 106.069 92.6264 107.229 93.1633C108.395 93.6936 109.3 94.4393 109.943 95.4005C110.586 96.3617 110.914 97.4753 110.927 98.7414H106.214Z" fill="black" fill-opacity="0.4"/>
<path d="M91.2708 100.014H86.2992C86.2329 99.5037 86.097 99.043 85.8915 98.6321C85.686 98.2211 85.4142 97.8697 85.0762 97.5781C84.7381 97.2864 84.337 97.0644 83.873 96.9119C83.4156 96.7528 82.9085 96.6733 82.3517 96.6733C81.364 96.6733 80.5122 96.9152 79.7963 97.3991C79.087 97.883 78.5402 98.5823 78.1557 99.4971C77.7779 100.412 77.5889 101.519 77.5889 102.818C77.5889 104.17 77.7812 105.304 78.1656 106.219C78.5567 107.127 79.1036 107.813 79.8063 108.277C80.5155 108.734 81.3541 108.963 82.3219 108.963C82.8654 108.963 83.3593 108.893 83.8034 108.754C84.2542 108.615 84.6486 108.413 84.9867 108.148C85.3314 107.876 85.6131 107.548 85.8318 107.163C86.0572 106.772 86.213 106.331 86.2992 105.841L91.2708 105.871C91.1846 106.772 90.9227 107.66 90.4852 108.535C90.0544 109.41 89.4611 110.209 88.7054 110.932C87.9497 111.648 87.0283 112.218 85.9412 112.642C84.8607 113.066 83.6211 113.278 82.2225 113.278C80.3797 113.278 78.7291 112.874 77.2708 112.065C75.819 111.25 74.6723 110.063 73.8304 108.506C72.9886 106.948 72.5676 105.052 72.5676 102.818C72.5676 100.578 72.9952 98.6785 73.8503 97.1207C74.7054 95.5629 75.8621 94.3797 77.3205 93.571C78.7788 92.7623 80.4128 92.3579 82.2225 92.3579C83.4554 92.3579 84.5956 92.5303 85.6429 92.875C86.6903 93.213 87.6117 93.7102 88.4071 94.3664C89.2026 95.0161 89.8489 95.8148 90.346 96.7627C90.8432 97.7107 91.1514 98.7945 91.2708 100.014Z" fill="black" fill-opacity="0.4"/>
</svg>
`,
  
'file-txt': `
<svg width="200" height="180" viewBox="0 0 200 180" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M29 21H144L174 51V171H29V21Z" fill="black" fill-opacity="0.05"/>
<path d="M144 21L174 51L144 51L144 21Z" fill="black" fill-opacity="0.1"/>
<path d="M113.831 96.6334V92.6362H131.043V96.6334H124.868V113H120.016V96.6334H113.831Z" fill="black" fill-opacity="0.4"/>
<path d="M97.6869 92.6362L101.406 99.0695H101.565L105.323 92.6362H110.832L104.687 102.818L111.031 113H105.383L101.565 106.497H101.406L97.5874 113H91.9795L98.2934 102.818L92.1386 92.6362H97.6869Z" fill="black" fill-opacity="0.4"/>
<path d="M71.9697 96.6334V92.6362H89.1814V96.6334H83.0067V113H78.1544V96.6334H71.9697Z" fill="black" fill-opacity="0.4"/>
</svg>
`,
  
'file-docx': `
<svg width="200" height="180" viewBox="0 0 200 180" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M29 21H144L174 51V171H29V21Z" fill="black" fill-opacity="0.05"/>
<path d="M144 21L174 51L144 51L144 21Z" fill="black" fill-opacity="0.1"/>
<path d="M130.517 92.6362L134.236 99.0695H134.395L138.154 92.6362H143.662L137.517 102.818L143.861 113H138.213L134.395 106.497H134.236L130.418 113H124.81L131.124 102.818L124.969 92.6362H130.517Z" fill="black" fill-opacity="0.4"/>
<path d="M122.146 100.014H117.174C117.108 99.5037 116.972 99.043 116.767 98.6321C116.561 98.2211 116.289 97.8697 115.951 97.5781C115.613 97.2864 115.212 97.0644 114.748 96.9119C114.291 96.7528 113.784 96.6733 113.227 96.6733C112.239 96.6733 111.387 96.9152 110.672 97.3991C109.962 97.883 109.415 98.5823 109.031 99.4971C108.653 100.412 108.464 101.519 108.464 102.818C108.464 104.17 108.656 105.304 109.041 106.219C109.432 107.127 109.979 107.813 110.682 108.277C111.391 108.734 112.229 108.963 113.197 108.963C113.741 108.963 114.235 108.893 114.679 108.754C115.129 108.615 115.524 108.413 115.862 108.148C116.207 107.876 116.488 107.548 116.707 107.163C116.932 106.772 117.088 106.331 117.174 105.841L122.146 105.871C122.06 106.772 121.798 107.66 121.36 108.535C120.93 109.41 120.336 110.209 119.581 110.932C118.825 111.648 117.904 112.218 116.816 112.642C115.736 113.066 114.496 113.278 113.098 113.278C111.255 113.278 109.604 112.874 108.146 112.065C106.694 111.25 105.548 110.063 104.706 108.506C103.864 106.948 103.443 105.052 103.443 102.818C103.443 100.578 103.87 98.6785 104.726 97.1207C105.581 95.5629 106.737 94.3797 108.196 93.571C109.654 92.7623 111.288 92.3579 113.098 92.3579C114.331 92.3579 115.471 92.5303 116.518 92.875C117.566 93.213 118.487 93.7102 119.282 94.3664C120.078 95.0161 120.724 95.8148 121.221 96.7627C121.718 97.7107 122.027 98.7945 122.146 100.014Z" fill="black" fill-opacity="0.4"/>
<path d="M99.6682 102.818C99.6682 105.059 99.2373 106.958 98.3756 108.516C97.5138 110.073 96.3471 111.257 94.8756 112.065C93.4106 112.874 91.7667 113.278 89.9437 113.278C88.1142 113.278 86.4669 112.871 85.002 112.055C83.537 111.24 82.3737 110.057 81.5119 108.506C80.6568 106.948 80.2292 105.052 80.2292 102.818C80.2292 100.578 80.6568 98.6785 81.5119 97.1207C82.3737 95.5629 83.537 94.3797 85.002 93.571C86.4669 92.7623 88.1142 92.3579 89.9437 92.3579C91.7667 92.3579 93.4106 92.7623 94.8756 93.571C96.3471 94.3797 97.5138 95.5629 98.3756 97.1207C99.2373 98.6785 99.6682 100.578 99.6682 102.818ZM94.6369 102.818C94.6369 101.492 94.448 100.372 94.0702 99.4573C93.6989 98.5426 93.162 97.8499 92.4594 97.3792C91.7633 96.9086 90.9248 96.6733 89.9437 96.6733C88.9693 96.6733 88.1308 96.9086 87.4281 97.3792C86.7255 97.8499 86.1852 98.5426 85.8074 99.4573C85.4362 100.372 85.2506 101.492 85.2506 102.818C85.2506 104.144 85.4362 105.264 85.8074 106.179C86.1852 107.094 86.7255 107.786 87.4281 108.257C88.1308 108.728 88.9693 108.963 89.9437 108.963C90.9248 108.963 91.7633 108.728 92.4594 108.257C93.162 107.786 93.6989 107.094 94.0702 106.179C94.448 105.264 94.6369 104.144 94.6369 102.818Z" fill="black" fill-opacity="0.4"/>
<path d="M66.4017 113H58.8748V92.6362H66.3918C68.4666 92.6362 70.2531 93.0439 71.7512 93.8592C73.2559 94.668 74.4159 95.8346 75.2313 97.3592C76.0466 98.8772 76.4543 100.694 76.4543 102.808C76.4543 104.929 76.0466 106.752 75.2313 108.277C74.4226 109.801 73.2659 110.971 71.7611 111.787C70.2564 112.596 68.4699 113 66.4017 113ZM63.7966 108.804H66.2128C67.353 108.804 68.3175 108.612 69.1063 108.227C69.9017 107.836 70.5016 107.203 70.906 106.328C71.317 105.446 71.5225 104.273 71.5225 102.808C71.5225 101.343 71.317 100.176 70.906 99.3081C70.495 98.4331 69.8885 97.8034 69.0864 97.4189C68.2909 97.0278 67.3099 96.8323 66.1432 96.8323H63.7966V108.804Z" fill="black" fill-opacity="0.4"/>
</svg>
`,
  
// Thumbnails especiales
'home': `
<svg width="200" height="180" viewBox="0 0 200 180" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="200" height="173" fill="black" fill-opacity="0.03"/>
<path d="M95.8977 64.8359C98.3398 62.7173 101.969 62.7176 104.41 64.8369L119.632 78.0527L136.872 93.0117C138.294 94.2451 139.11 96.0351 139.11 97.917V128.506C139.11 132.092 136.202 135 132.615 135H114.648V102.559C114.648 98.9724 111.74 96.0654 108.154 96.0654H92.1418C88.5556 96.0654 85.6479 98.9724 85.6477 102.559V135H67.679C64.0927 135 61.1858 132.092 61.1858 128.506V97.917C61.1858 96.0351 62.0017 94.2451 63.4231 93.0117L80.6624 78.0527L95.8977 64.8359ZM94.9573 38.7451C97.395 36.64 101.008 36.6392 103.446 38.7441L157.966 85.8213L155.07 88.3213C152.632 90.4257 149.021 90.4257 146.583 88.3213L99.2014 47.417L53.095 87.2314C50.6587 89.3353 47.0486 89.337 44.6106 87.2354L41.7043 84.7295L94.9573 38.7451Z" fill="black" fill-opacity="0.15"/>
</svg>
`,
  
'profile': `
<svg width="200" height="180" viewBox="0 0 200 180" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M144.341 109.787C157.22 119.76 150.167 140.386 133.879 140.386H66.1211C49.8327 140.386 42.7805 119.76 55.6592 109.787L80.0351 90.9121C84.3165 97.3841 91.6591 101.654 100 101.654C108.341 101.654 115.682 97.3839 119.964 90.9121L144.341 109.787Z" fill="black" fill-opacity="0.12"/>
<circle cx="100" cy="62.9224" r="23.9224" fill="black" fill-opacity="0.12"/>
</svg>
`,
  
'logo': `
<svg width="200" height="180" viewBox="0 0 200 180" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect x="20" y="20" width="160" height="140" fill="black" fill-opacity="0.05"/>
<circle cx="100" cy="90" r="40" fill="black" fill-opacity="0.1"/>
<text x="100" y="100" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="black" fill-opacity="0.3">LOGO</text>
</svg>`
,
  
// Thumbnails para tipos problemáticos que causaban loop infinito
'custom': `
<svg width="200" height="180" viewBox="0 0 200 180" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect x="20" y="20" width="160" height="140" fill="black" fill-opacity="0.05"/>
<circle cx="100" cy="90" r="30" fill="black" fill-opacity="0.1"/>
<text x="100" y="100" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="black" fill-opacity="0.3">CUSTOM</text>
</svg>
`,
  
'external': `
<svg width="200" height="180" viewBox="0 0 200 180" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect x="20" y="20" width="160" height="140" fill="black" fill-opacity="0.05"/>
<path d="M40 40L160 140M160 40L40 140" stroke="black" stroke-opacity="0.2" stroke-width="2"/>
<text x="100" y="100" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="black" fill-opacity="0.3">EXTERNAL</text>
</svg>
`,

'transparent': `
<svg width="200" height="180" viewBox="0 0 200 180" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Thumbnail transparente para placeholders -->
</svg>
`
};

/**
 * Convierte un SVG string a data URI
 * @param {string} svgString - String SVG a convertir
 * @returns {string} Data URI del SVG
 */
function svgToDataUri(svgString) {
  const encoded = encodeURIComponent(svgString);
  return `data:image/svg+xml;charset=utf-8,${encoded}`;
}

/**
 * Obtiene un thumbnail embebido por nombre
 * @param {string} thumbnailName - Nombre del thumbnail (sin extensión)
 * @returns {string|null} Data URI del thumbnail o null si no existe
 */
function getEmbeddedThumbnail(thumbnailName) {
  const normalizedName = thumbnailName.toLowerCase().replace(/\s+/g, '-');
  const svgString = EMBEDDED_THUMBNAILS[normalizedName];
  
  if (svgString) {
    return svgToDataUri(svgString);
  }
  
  return null;
}

/**
 * Verifica si un thumbnail está disponible como embebido
 * @param {string} thumbnailName - Nombre del thumbnail
 * @returns {boolean} True si está disponible como embebido
 */
function isEmbeddedThumbnailAvailable(thumbnailName) {
  const normalizedName = thumbnailName.toLowerCase().replace(/\s+/g, '-');
  return EMBEDDED_THUMBNAILS.hasOwnProperty(normalizedName);
}

/**
 * Determina si una URL es un thumbnail embebido
 * @param {string} url - URL a verificar
 * @returns {boolean} True si es un thumbnail embebido
 */
function isEmbeddedThumbnailUrl(url) {
  return url && url.startsWith('data:image/svg+xml;');
}

/**
 * Extrae el string SVG de un data URI de thumbnail embebido
 * @param {string} dataUri - Data URI del thumbnail embebido
 * @returns {string|null} String SVG o null si no es válido
 */
function getEmbeddedThumbnailSvgString(dataUri) {
  if (!isEmbeddedThumbnailUrl(dataUri)) {
    return null;
  }
  
  try {
    // Extraer la parte después de la coma en el data URI
    const svgPart = dataUri.split(',')[1];
    if (svgPart) {
      const decodedSvg = decodeURIComponent(svgPart);
      
      // Verificar si el SVG decodificado es válido
      if (decodedSvg.includes('<svg')) {
        return decodedSvg;
      }
    }
  } catch (error) {
    console.error('[Embedded SVG] Error al decodificar data URI:', error);
  }
  
  return null;
}

/**
 * Crea un elemento SVG con código SVG directo para thumbnails embebidos
 * @param {string} svgString - String SVG del thumbnail embebido
 * @param {string} className - Clase CSS para el elemento
 * @param {Object} attributes - Atributos adicionales (x, y, width, height)
 * @returns {SVGElement} Elemento SVG creado
 */
function createEmbeddedSVGElement(svgString, className = "image-base", attributes = {}) {
  // Crear un contenedor temporal para parsear el SVG
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = svgString.trim();
  
  // Obtener el elemento SVG
  const svgElement = tempDiv.querySelector('svg');
  if (!svgElement) {
    console.error('[Embedded SVG] Error al parsear SVG string');
    return null;
  }
  
  // Limpiar solo el atributo fill de todos los elementos internos del SVG
  // para permitir que las variables CSS controlen el color pero mantener las transparencias originales
  const allElements = svgElement.querySelectorAll('*');
  allElements.forEach(element => {
    if (element.hasAttribute('fill')) {
      element.removeAttribute('fill');
    }
    if (element.hasAttribute('stroke')) {
      element.removeAttribute('stroke');
    }
  });
  
  // Aplicar atributos personalizados
  if (attributes.x !== undefined) svgElement.setAttribute('x', attributes.x);
  if (attributes.y !== undefined) svgElement.setAttribute('y', attributes.y);
  if (attributes.width !== undefined) svgElement.setAttribute('width', attributes.width);
  if (attributes.height !== undefined) svgElement.setAttribute('height', attributes.height);
  
  // Aplicar clase CSS específica para thumbnails embebidos
  const embeddedClasses = 'embedded-thumbnail loaded';
  const finalClasses = className ? `${className} ${embeddedClasses}` : embeddedClasses;
  svgElement.setAttribute('class', finalClasses);
  
  // Aplicar fade-in usando clases CSS
  svgElement.classList.add('fade-in');
  
  // Completar fade-in después de un pequeño delay
  setTimeout(() => {
    svgElement.classList.add('loaded');
    console.log(`[Embedded SVG] ✅ Fade-in completado para thumbnail embebido`);
  }, 200);
  
  return svgElement;
}

/**
 * Obtiene el thumbnail embebido apropiado para un nodo
 * @param {Object} node - Objeto del nodo
 * @returns {string|null} Data URI del thumbnail embebido apropiado
 */
function getAppropriateEmbeddedThumbnail(node) {
  const typeVal = node.type || (node.data && node.data.type) || 'detail';
  const typeName = typeVal.toLowerCase().replace(/\s+/g, '-');
  
  // Intentar usar el thumbnail embebido correspondiente al type
  let thumbnail = getEmbeddedThumbnail(typeName);
  
  // Si no existe el thumbnail del type, usar detail como fallback
  if (!thumbnail) {
    console.log(`[getAppropriateEmbeddedThumbnail] Type "${typeName}" not found, using detail thumbnail`);
    thumbnail = getEmbeddedThumbnail('detail');
  } else {
    console.log(`[getAppropriateEmbeddedThumbnail] Using embedded thumbnail for type "${typeName}"`);
  }
  
  return thumbnail;
}

/**
 * Crea un elemento SVG embebido como fallback cuando falla una imagen de la columna Img
 * @param {Object} node - Objeto del nodo
 * @param {Object} nodeSel - Selección D3 del nodo
 * @param {Object} element - Elemento image que falló
 * @returns {boolean} True si se pudo crear el fallback
 */
function createEmbeddedFallback(node, nodeSel, element) {
  console.log(`[Embedded Fallback] Creating fallback for failed Img column image`);
  console.log(`[Embedded Fallback] Node type: ${node.type || (node.data && node.data.type) || 'detail'}`);
  
  // Obtener el thumbnail embebido correspondiente al type del nodo
  const fallbackThumbnail = getAppropriateEmbeddedThumbnail(node);
  console.log(`[Embedded Fallback] Fallback thumbnail found: ${fallbackThumbnail ? 'YES' : 'NO'}`);
  
  if (fallbackThumbnail) {
    // Crear elemento SVG embebido
    const svgString = getEmbeddedThumbnailSvgString(fallbackThumbnail);
    console.log(`[Embedded Fallback] SVG string extracted: ${svgString ? 'YES' : 'NO'}`);
    
    if (svgString) {
      const svgElement = createEmbeddedSVGElement(svgString, "image-base", {
        x: parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--image-x')),
        y: parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--image-y')),
        width: parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--image-width')),
        height: parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--image-height'))
      });
      console.log(`[Embedded Fallback] SVG element created: ${svgElement ? 'YES' : 'NO'}`);
      
      if (svgElement) {
        // Reemplazar el elemento image fallido con el SVG embebido
        element.remove();
        nodeSel.node().appendChild(svgElement);
        console.log(`[Embedded Fallback] Successfully replaced failed image with embedded thumbnail`);
        return true;
      }
    }
  }
  
  // Si no se pudo crear el SVG embebido, ocultar la imagen
  console.log(`[Embedded Fallback] Could not create embedded thumbnail, hiding element`);
  element.style("display", "none");
  return false;
}

/**
 * Verifica si una imagen existe antes de intentar cargarla
 * @param {string} url - URL de la imagen
 * @returns {Promise<boolean>} True si la imagen existe
 */
function checkImageExists(url) {
  return new Promise((resolve) => {
    // Si es un thumbnail embebido, siempre existe
    if (isEmbeddedThumbnailUrl(url)) {
      resolve(true);
      return;
    }
    
    // Si es una URL externa, verificar si es accesible
    if (url.match(/^https?:\/\//i)) {
      console.log(`[checkImageExists] Checking external URL: ${url}`);
      const img = new Image();
      img.crossOrigin = "anonymous"; // Intentar con CORS
      img.onload = function() {
        console.log(`[checkImageExists] External image loaded successfully: ${url}`);
        resolve(true);
      };
      img.onerror = function() {
        console.log(`[checkImageExists] External image failed to load: ${url}`);
        resolve(false);
      };
      img.src = url;
      return;
    }
    
    // Para archivos locales, verificar si existe
    const img = new Image();
    img.onload = function() {
      resolve(true);
    };
    img.onerror = function() {
      resolve(false);
    };
    img.src = url;
  });
}

/**
 * Determina si se debe aplicar filtro CSS a una imagen
 * @param {string} url - URL de la imagen
 * @returns {boolean} True si se debe aplicar filtro
 */
function shouldApplyFilter(url) {
  // Si es una URL de datos (data URI), no aplicar filtro
  if (url.startsWith('data:')) return false;
  
  // Si es un thumbnail embebido, no aplicar filtro
  if (isEmbeddedThumbnailUrl(url)) return false;
  
  // Si es una URL externa (http/https), no aplicar filtro
  if (url.match(/^https?:\/\//i)) return false;
  
  // Extraer el nombre del archivo sin parámetros
  const baseUrl = url.split('?')[0].toLowerCase();
  
  // Solo aplicar filtro a imágenes SVG del sistema para consistencia visual
  return baseUrl.endsWith('.svg');
}

/**
 * Crea un elemento de imagen apropiado según el tipo de URL
 * @param {Object} d3Selection - Selección D3 donde agregar el elemento
 * @param {string} imageUrl - URL de la imagen
 * @param {Object} attributes - Atributos del elemento (x, y, width, height)
 * @param {string} className - Clase CSS
 * @param {Object} node - Objeto del nodo
 * @returns {Object} Selección D3 con el elemento creado
 */
function appendAppropriateImageElement(d3Selection, imageUrl, attributes = {}, className = "image-base", node = null) {
  // Si es un thumbnail embebido, crear elemento SVG directo
  if (isEmbeddedThumbnailUrl(imageUrl)) {
    console.log(`[Append Image] Creando SVG embebido para: ${imageUrl.substring(0, 50)}...`);
    const svgString = getEmbeddedThumbnailSvgString(imageUrl);
    if (svgString) {
      const svgElement = createEmbeddedSVGElement(svgString, className, attributes);
      if (svgElement) {
        return d3Selection.each(function() {
          this.appendChild(svgElement);
        });
      }
    }
  }
  
  // Para imágenes no embebidas, usar elemento image tradicional
  console.log(`[Append Image] Usando elemento image tradicional para: ${imageUrl}`);
  return d3Selection.append("image")
    .attr("href", imageUrl)
    .attr("x", attributes.x || 0)
    .attr("y", attributes.y || 0)
    .attr("width", attributes.width || 30)
    .attr("height", attributes.height || 30)
    .attr("class", className);
}

/**
 * Crea el HTML del thumbnail embebido para el side panel
 * @param {string} nodeType - Tipo del nodo para determinar el thumbnail
 * @returns {string} HTML del thumbnail embebido
 */
function createSidePanelThumbnailHtml(nodeType) {
  // Normalizar el nombre del tipo
  const normalizedType = nodeType.toLowerCase().replace(/\s+/g, '-');
  
  // Obtener el thumbnail embebido
  const embeddedThumbnail = getEmbeddedThumbnail(normalizedType);
  
  if (embeddedThumbnail) {
    // Si existe como thumbnail embebido, crear elemento SVG directo
    const svgString = getEmbeddedThumbnailSvgString(embeddedThumbnail);
    if (svgString) {
      // Crear un contenedor temporal para parsear el SVG
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = svgString.trim();
      
      // Obtener el elemento SVG
      const svgElement = tempDiv.querySelector('svg');
      if (svgElement) {
        // Aplicar estilos específicos para el side panel
        svgElement.setAttribute('class', 'side-panel-title-thumbnail embedded-thumbnail loaded');
        svgElement.setAttribute('width', '24');
        svgElement.setAttribute('height', '24');
        svgElement.style.opacity = '1';
        svgElement.style.transition = 'opacity 0.2s ease-in-out';
        
        // Limpiar atributos fill y stroke para permitir control CSS
        const allElements = svgElement.querySelectorAll('*');
        allElements.forEach(element => {
          if (element.hasAttribute('fill')) {
            element.removeAttribute('fill');
          }
          if (element.hasAttribute('stroke')) {
            element.removeAttribute('stroke');
          }
        });
        
        return svgElement.outerHTML;
      }
    }
  }
  
  // Fallback: usar thumbnail 'detail' embebido
  const detailThumbnail = getEmbeddedThumbnail('detail');
  if (detailThumbnail) {
    const svgString = getEmbeddedThumbnailSvgString(detailThumbnail);
    if (svgString) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = svgString.trim();
      
      const svgElement = tempDiv.querySelector('svg');
      if (svgElement) {
        svgElement.setAttribute('class', 'side-panel-title-thumbnail embedded-thumbnail loaded');
        svgElement.setAttribute('width', '24');
        svgElement.setAttribute('height', '24');
        svgElement.style.opacity = '1';
        svgElement.style.transition = 'opacity 0.2s ease-in-out';
        
        const allElements = svgElement.querySelectorAll('*');
        allElements.forEach(element => {
          if (element.hasAttribute('fill')) {
            element.removeAttribute('fill');
          }
          if (element.hasAttribute('stroke')) {
            element.removeAttribute('stroke');
          }
        });
        
        return svgElement.outerHTML;
      }
    }
  }
  
  // Fallback final: elemento img vacío (muy improbable que llegue aquí)
  return `<div class="side-panel-title-thumbnail" style="width: 24px; height: 24px; background: transparent;"></div>`;
}

// ============================================================================
// CLUSTER CLICK MODE FUNCTIONALITY
// ============================================================================

// Global state for cluster click mode
window.$xDiagrams.clusterClickMode = {
  active: false,
  threshold: 0.4, // Zoom level threshold to activate cluster click mode (higher value for earlier activation)
  deselectionThreshold: 0.45, // Zoom level threshold to deselect cluster (lower value for later deselection)
  clusters: [],
  originalNodeClickHandlers: new Map(),
  isMultiCluster: false, // Track if current diagram has multiple clusters
  selectedCluster: null, // Track the currently selected cluster
  isZoomingToCluster: false // Flag to prevent deselection during cluster zoom transitions
};

// Function to detect if current diagram has multiple clusters
function detectMultiClusterDiagram() {
  const clusterRects = d3.selectAll(".cluster-rect");
  const clusterCount = clusterRects.size();
  
  // Consider it multi-cluster if there are more than 1 cluster rectangles
  const isMultiCluster = clusterCount > 1;
  
  console.log('[ClusterClickMode] Detected cluster count:', clusterCount, 'isMultiCluster:', isMultiCluster);
  
  window.$xDiagrams.clusterClickMode.isMultiCluster = isMultiCluster;
  return isMultiCluster;
}

// Function to check if zoom level should activate cluster click mode
function checkAndActivateClusterClickMode(scale) {
  // First, detect if this is a multi-cluster diagram
  const isMultiCluster = detectMultiClusterDiagram();
  
  // Check if we have a selected cluster
  const hasSelectedCluster = window.$xDiagrams.clusterClickMode.selectedCluster;
  
  // Determine if we should activate cluster click mode
  // - Always activate for multi-cluster diagrams when zoomed out (scale <= threshold)
  // - Keep active if there's a selected cluster (regardless of zoom level)
  const shouldActivate = isMultiCluster && (scale <= window.$xDiagrams.clusterClickMode.threshold || hasSelectedCluster);
  
  if (shouldActivate && !window.$xDiagrams.clusterClickMode.active) {
    console.log('[ClusterClickMode] Activating cluster click mode - scale:', scale, 'threshold:', window.$xDiagrams.clusterClickMode.threshold, 'hasSelectedCluster:', hasSelectedCluster);
    activateClusterClickMode();
  } else if (!shouldActivate && window.$xDiagrams.clusterClickMode.active) {
    console.log('[ClusterClickMode] Deactivating cluster click mode - scale:', scale, 'threshold:', window.$xDiagrams.clusterClickMode.threshold, 'hasSelectedCluster:', hasSelectedCluster);
    
    // Only deselect cluster if we're actually zooming out significantly
    const deselectionThreshold = window.$xDiagrams.clusterClickMode.deselectionThreshold || 0.45;
    const isZoomingOutSignificantly = scale <= deselectionThreshold;
    
    if (isZoomingOutSignificantly && hasSelectedCluster) {
      console.log('[ClusterClickMode] Deselecting cluster due to significant zoom out - cluster:', hasSelectedCluster.id, 'scale:', scale, 'deselectionThreshold:', deselectionThreshold);
      deselectCurrentCluster('zoom-out');
      
      // Verify deselection was successful
      if (window.$xDiagrams.clusterClickMode.selectedCluster) {
        console.warn('[ClusterClickMode] Warning: Cluster was not properly deselected');
      } else {
        console.log('[ClusterClickMode] Cluster deselection successful');
      }
    } else if (hasSelectedCluster) {
      console.log('[ClusterClickMode] Keeping cluster selected during zoom in - cluster:', hasSelectedCluster.id, 'scale:', scale, 'deselectionThreshold:', deselectionThreshold);
    } else {
      console.log('[ClusterClickMode] No cluster to deselect');
    }
    
    deactivateClusterClickMode();
  }
  
  // Also check if we need to deselect cluster when zooming out significantly (even if cluster click mode is not active)
  const deselectionThreshold = window.$xDiagrams.clusterClickMode.deselectionThreshold || 0.45;
  if (scale <= deselectionThreshold && hasSelectedCluster && !window.$xDiagrams.clusterClickMode.isZoomingToCluster) {
    console.log('[ClusterClickMode] Significant zoom out detected with selected cluster - deselecting', 'scale:', scale, 'deselectionThreshold:', deselectionThreshold);
    deselectCurrentCluster('zoom-out');
  }
  
  // Always setup tooltips for multi-cluster diagrams regardless of zoom level
  if (isMultiCluster && !window.$xDiagrams.clusterTooltip.initialized) {
    // Only initialize tooltips if not already initialized
    setupClusterTooltips();
  }
}

// Function to activate cluster click mode
function activateClusterClickMode() {
  console.log('[ClusterClickMode] Activating cluster click mode');
  
  // Preserve selected cluster if it exists (don't reset on reactivation)
  const currentSelectedCluster = window.$xDiagrams.clusterClickMode.selectedCluster;
  if (currentSelectedCluster) {
    console.log('[ClusterClickMode] Preserving selected cluster during reactivation:', currentSelectedCluster.id);
  } else {
    console.log('[ClusterClickMode] No selected cluster to preserve');
  }
  
  window.$xDiagrams.clusterClickMode.active = true;
  
  // Find all cluster rectangles and make them clickable
  const clusterRects = d3.selectAll(".cluster-rect");
  const clusterTitles = d3.selectAll(".cluster-title");
  
  if (!clusterRects.empty()) {
    // Store original clusters data
    window.$xDiagrams.clusterClickMode.clusters = [];
    
    clusterRects.each(function(d, i) {
      const rect = d3.select(this);
      const clusterGroup = rect.node().parentNode;
      const clusterId = clusterGroup.getAttribute('data-root-id') || 
                       clusterGroup.querySelector('.cluster-title')?.textContent || 
                       `cluster-${i}`;
      
      // Store cluster information
      const clusterInfo = {
        id: clusterId,
        rect: rect,
        group: d3.select(clusterGroup),
        bounds: null // We'll get bounds dynamically when needed
      };
      window.$xDiagrams.clusterClickMode.clusters.push(clusterInfo);
      
      // Keep node interactions enabled by default
      const nodes = clusterGroup.querySelectorAll('.node-clickable');
      console.log(`[ClusterClickMode] Keeping ${nodes.length} nodes interactive in cluster:`, clusterInfo.id);
      nodes.forEach(node => {
        const nodeId = node.getAttribute('data-id');
        if (nodeId && !window.$xDiagrams.clusterClickMode.originalNodeClickHandlers.has(nodeId)) {
          // Store original click handler
          const originalClick = node.onclick;
          window.$xDiagrams.clusterClickMode.originalNodeClickHandlers.set(nodeId, originalClick);
          // Keep interactions enabled
          node.style.pointerEvents = 'auto';
        }
      });
      
      // Make cluster rect clickable (respect existing selection state)
      const isSelected = currentSelectedCluster && currentSelectedCluster.id === clusterInfo.id;
      
      // Aplicar estilos iniciales basados en el estado de selección
      if (isSelected) {
        rect
          .attr("data-selected", "true")
          .style("fill", "var(--cluster-selected-bg, rgba(255, 152, 0, 0.25))")
          .style("stroke", "var(--cluster-selected-stroke, #ff9800)")
          .style("stroke-width", "4")
          .style("stroke-dasharray", "none")
          .style("box-shadow", "0 0 8px rgba(255, 152, 0, 0.3)");
      } else {
        rect
          .attr("data-selected", "false")
          .style("fill", null)
          .style("stroke", null)
          .style("stroke-width", null)
          .style("stroke-dasharray", null)
          .style("filter", null)
          .style("box-shadow", null);
      }
      
      rect
        .style("cursor", "pointer")
        .style("pointer-events", "all")
        .on("click", function(event) {
          event.stopPropagation();
          const currentlySelectedCluster = window.$xDiagrams.clusterClickMode.selectedCluster;
          const isCurrentlySelected = currentlySelectedCluster && currentlySelectedCluster.id === clusterInfo.id;
      
          if (isCurrentlySelected) {
              return; // Ya está seleccionado, no hacer nada.
          }
      
          // Si hay otro clúster seleccionado, deselecciónalo.
          if (currentlySelectedCluster) {
              deselectCurrentCluster('new_selection');
          }
      
          // Establece el nuevo clúster como seleccionado y haz zoom.
          window.$xDiagrams.clusterClickMode.selectedCluster = clusterInfo;
          
          // Aplicar estilos de selección inmediatamente para feedback visual instantáneo
          rect
            .attr("data-selected", "true")
            .style("fill", "var(--cluster-selected-bg, rgba(255, 152, 0, 0.25))")
            .style("stroke", "var(--cluster-selected-stroke, #ff9800)")
            .style("stroke-width", "4")
            .style("stroke-dasharray", "none")
            .style("box-shadow", "0 0 8px rgba(255, 152, 0, 0.3)");
          
          // Deshabilitar hover en el cluster seleccionado
          rect.on("mouseenter", null).on("mouseleave", null);
          
          // Habilitar interacciones de nodos en el cluster seleccionado
          const selectedClusterGroup = clusterInfo.group.node();
          if (selectedClusterGroup) {
            const nodes = selectedClusterGroup.querySelectorAll('.node-clickable');
            console.log(`[ClusterClickMode] Enabling ${nodes.length} nodes in selected cluster:`, clusterInfo.id);
            nodes.forEach(node => {
              const nodeId = node.getAttribute('data-id');
              if (nodeId) {
                node.style.pointerEvents = 'auto';
                
                // Restore original click handler if available
                if (window.$xDiagrams.clusterClickMode.originalNodeClickHandlers.has(nodeId)) {
                  const originalClick = window.$xDiagrams.clusterClickMode.originalNodeClickHandlers.get(nodeId);
                  if (originalClick) {
                    node.onclick = originalClick;
                  }
                }
              }
            });
          }
          
          zoomToCluster(clusterInfo);
      })
      .on("mouseenter", isSelected ? null : function() {
          // Add hover effect
          rect
              .style("fill", "var(--cluster-hover-bg, rgba(25, 118, 210, 0.15))")
              .style("stroke", "var(--cluster-hover-stroke, #1976d2)")
              .style("stroke-width", "3")
              .style("stroke-dasharray", "none");
          
          // Show cluster hover tooltip (only if not selected)
          if (!window.$xDiagrams.clusterClickMode.selectedCluster || 
              window.$xDiagrams.clusterClickMode.selectedCluster.id !== clusterInfo.id) {
              showClusterTooltip(clusterInfo);
          }
      })
      .on("mouseleave", function() {
          // **AQUÍ ESTÁ LA CORRECCIÓN IMPORTANTE**
          // Solo elimina los estilos si este clúster NO está seleccionado.
          const selectedCluster = window.$xDiagrams.clusterClickMode.selectedCluster;
          if (selectedCluster && selectedCluster.id === clusterInfo.id) {
              return; // Es el seleccionado, no quitar el resaltado.
          }
      
          // Quitar el efecto hover para clústeres no seleccionados.
          rect
              .style("fill", null)
              .style("stroke", null)
              .style("stroke-width", null)
              .style("stroke-dasharray", null);
          
          // Ocultar el tooltip del hover.
          hideClusterTooltip();
      });
    });
    
    // Add CSS class to body for styling
    document.body.classList.add('cluster-click-mode-active');
    
    if (currentSelectedCluster) {
      console.log('[ClusterClickMode] Cluster click mode activated with selected cluster:', currentSelectedCluster.id);
    } else {
      console.log('[ClusterClickMode] All clusters are now in normal state, ready for clicks');
    }
  }
}

// Function to deactivate cluster click mode
function deactivateClusterClickMode() {
  console.log('[ClusterClickMode] Deactivating cluster click mode');
  window.$xDiagrams.clusterClickMode.active = false;
  
  // Restore original node click handlers
  window.$xDiagrams.clusterClickMode.originalNodeClickHandlers.forEach((handler, nodeId) => {
    const node = document.querySelector(`[data-id="${nodeId}"]`);
    if (node) {
      node.style.pointerEvents = 'auto';
      if (handler) {
        node.onclick = handler;
      }
    }
  });
  window.$xDiagrams.clusterClickMode.originalNodeClickHandlers.clear();
  
  // Note: Selected cluster state is now handled by deselectCurrentCluster() before this function is called
  console.log('[ClusterClickMode] Deactivating cluster click mode - selected cluster already deselected');
  
  // Reset all cluster rectangles to default state (but preserve selected cluster styling)
  const clusterRects = d3.selectAll(".cluster-rect");
  const selectedCluster = window.$xDiagrams.clusterClickMode.selectedCluster;
  
  console.log('[ClusterClickMode] Resetting', clusterRects.size(), 'cluster rectangles to default state');
  
  clusterRects.each(function() {
    const rect = d3.select(this);
    const clusterGroup = rect.node().parentNode;
    const clusterId = clusterGroup.getAttribute('data-root-id') || 
                     clusterGroup.querySelector('.cluster-title')?.textContent || 
                     'unknown';
    
    // Check if this is the selected cluster that should be preserved
    const isSelectedCluster = selectedCluster && selectedCluster.id === clusterId;
    
    if (isSelectedCluster) {
      console.log('[ClusterClickMode] Preserving visual state for selected cluster:', clusterId);
      // Keep the selected styling for the selected cluster
      rect
        .attr("data-selected", "true")
        .style("cursor", "default")
        .style("pointer-events", "auto")
        .on("click", null);
      // Don't reset the visual styles (fill, stroke, etc.) for selected cluster
    } else {
      // Reset to default state for non-selected clusters
      rect
        .attr("data-selected", "false")
        .style("cursor", "default")
        .style("pointer-events", "auto")
        .on("click", null)
        .style("fill", null)
        .style("stroke", null)
        .style("stroke-width", null)
        .style("stroke-dasharray", null)
        .style("filter", null)
        .style("box-shadow", null);
    }
  });
  
  // Re-setup tooltips after deactivating cluster click mode
  window.$xDiagrams.clusterTooltip.initialized = false;
  setupClusterTooltips();
  
  // Hide any visible hover title
  hideClusterHoverTitle();
  
  // Remove CSS class
  document.body.classList.remove('cluster-click-mode-active');
  
  // Clear clusters data but preserve selected cluster state if it should be preserved
  window.$xDiagrams.clusterClickMode.clusters = [];
  
  // Only reset selected cluster if it was already deselected by deselectCurrentCluster()
  // This prevents interference with cluster preservation during zoom in
  if (!window.$xDiagrams.clusterClickMode.selectedCluster) {
    console.log('[ClusterClickMode] All clusters reset to normal state');
  } else {
    console.log('[ClusterClickMode] Preserving selected cluster during deactivation:', window.$xDiagrams.clusterClickMode.selectedCluster.id);
  }
  
  // Force a small delay to ensure CSS is applied, but preserve selected cluster
  setTimeout(() => {
    const remainingSelected = d3.selectAll(".cluster-rect[data-selected='true']");
    if (!remainingSelected.empty()) {
      const selectedCluster = window.$xDiagrams.clusterClickMode.selectedCluster;
      
      remainingSelected.each(function() {
        const rect = d3.select(this);
        const clusterGroup = rect.node().parentNode;
        const clusterId = clusterGroup.getAttribute('data-root-id') || 
                         clusterGroup.querySelector('.cluster-title')?.textContent || 
                         'unknown';
        
        // Only reset if this is not the selected cluster that should be preserved
        const isSelectedCluster = selectedCluster && selectedCluster.id === clusterId;
        
        if (!isSelectedCluster) {
          console.warn('[ClusterClickMode] Found unexpected selected cluster, forcing reset:', clusterId);
          rect
            .attr("data-selected", "false")
            .style("fill", null)
            .style("stroke", null)
            .style("stroke-width", null)
            .style("stroke-dasharray", null)
            .style("filter", null)
            .style("box-shadow", null);
        } else {
          console.log('[ClusterClickMode] Preserving expected selected cluster:', clusterId);
        }
      });
    }
  }, 100);
}

// Function to zoom to a specific cluster
function zoomToCluster(clusterInfo) {
  console.log('[ClusterClickMode] Zooming to cluster:', clusterInfo.id);
  
  // Set flag to prevent deselection during zoom transition
  window.$xDiagrams.clusterClickMode.isZoomingToCluster = true;
  
  // Hide any visible cluster tooltip
  hideClusterTooltip();
  
  // Close side panel if it's open to avoid interference with cluster view
  const sidePanel = document.getElementById('side-panel');
  if (sidePanel && sidePanel.classList.contains('open')) {
    console.log('[ClusterClickMode] Closing side panel before zooming to cluster');
    closeSidePanel();
  }
  
  // Apply selected cluster styles immediately for instant visual feedback
  disableHoverOnSelectedCluster(clusterInfo);
  
  // Apply highlight immediately to ensure visual feedback
  highlightSelectedCluster(clusterInfo);
  
  const svg = d3.select("#main-diagram-svg");
  if (svg.empty()) return;
  
  // Get the cluster group element to understand its transform
  const clusterGroup = clusterInfo.group.node();
  if (!clusterGroup) {
    console.error('[ClusterClickMode] Cluster group not found');
    return;
  }
  
  // Get the cluster rectangle element
  const clusterRect = clusterInfo.rect.node();
  if (!clusterRect) {
    console.error('[ClusterClickMode] Cluster rect not found');
    return;
  }
  
  // Get the bounds of the cluster rectangle relative to its group
  const relativeBounds = clusterRect.getBBox();
  console.log('[ClusterClickMode] Relative cluster bounds:', relativeBounds);
  
  // Get the transform of the cluster group
  const groupTransform = clusterGroup.getAttribute('transform');
  console.log('[ClusterClickMode] Group transform:', groupTransform);
  
  // Parse the group transform to get the translation
  let groupTranslateX = 0;
  let groupTranslateY = 0;
  if (groupTransform) {
    const match = /translate\(([-\d.]+), ?([-\d.]+)\)/.exec(groupTransform);
    if (match) {
      groupTranslateX = parseFloat(match[1]) || 0;
      groupTranslateY = parseFloat(match[2]) || 0;
    }
  }
  
  console.log('[ClusterClickMode] Group translation:', groupTranslateX, groupTranslateY);
  
  // Calculate absolute position of the cluster
  const absoluteClusterX = groupTranslateX + relativeBounds.x;
  const absoluteClusterY = groupTranslateY + relativeBounds.y;
  const absoluteClusterWidth = relativeBounds.width;
  const absoluteClusterHeight = relativeBounds.height;
  
  console.log('[ClusterClickMode] Absolute cluster position:', {
    x: absoluteClusterX,
    y: absoluteClusterY,
    width: absoluteClusterWidth,
    height: absoluteClusterHeight
  });
  
  const svgElement = document.getElementById('main-diagram-svg');
  const svgWidth = svgElement ? svgElement.clientWidth || svgElement.offsetWidth : window.innerWidth;
  const svgHeight = svgElement ? svgElement.clientHeight || svgElement.offsetHeight : window.innerHeight;
  
  // Get current transform to understand the current zoom state
  const currentTransform = d3.zoomTransform(svg.node());
  console.log('[ClusterClickMode] Current transform:', currentTransform);
  
  // Calculate zoom to fit cluster with some padding
  const padding = 150; // Increased padding for better visibility
  const scaleX = (svgWidth - padding * 2) / absoluteClusterWidth;
  const scaleY = (svgHeight - padding * 2) / absoluteClusterHeight;
  const scale = Math.min(scaleX, scaleY, 1.5); // Increased max zoom to 150%
  
  console.log('[ClusterClickMode] Calculated scale:', scale, 'scaleX:', scaleX, 'scaleY:', scaleY);
  
  // Calculate center of cluster in absolute coordinates
  const clusterCenterX = absoluteClusterX + absoluteClusterWidth / 2;
  const clusterCenterY = absoluteClusterY + absoluteClusterHeight / 2;
  
  console.log('[ClusterClickMode] Cluster center:', clusterCenterX, clusterCenterY);
  
  // Calculate translation to center cluster in viewport
  const translateX = svgWidth / 2 - clusterCenterX * scale;
  const translateY = svgHeight / 2 - clusterCenterY * scale;
  
  console.log('[ClusterClickMode] Final transform:', { translateX, translateY, scale });
  
  // Apply smooth transition
  svg.transition()
    .duration(1000) // Increased duration for smoother animation
    .ease(d3.easeCubicOut)
    .call(zoom.transform, d3.zoomIdentity
      .translate(translateX, translateY)
      .scale(scale)
    )
    .on("end", function() {
      // Zoom completed - cluster is already styled as selected
      console.log('[ClusterClickMode] Zoom completed for cluster:', clusterInfo.id);
      
      // Add a delay before resetting the zooming flag to prevent immediate deselection
      setTimeout(() => {
        window.$xDiagrams.clusterClickMode.isZoomingToCluster = false;
        console.log('[ClusterClickMode] Zooming flag reset after delay');
      }, 500); // 500ms delay to prevent immediate deselection
    });
  
  // Trigger hook
  triggerHook('onClusterZoom', {
    clusterId: clusterInfo.id,
    clusterName: clusterInfo.id,
    scale: scale
  });
}



// Function to highlight the selected cluster with a temporary effect
function highlightSelectedCluster(clusterInfo) {
  console.log('[ClusterClickMode] Highlighting selected cluster:', clusterInfo.id);
  
  const rect = clusterInfo.rect;
  if (!rect || !rect.node()) {
    console.error('[ClusterClickMode] Cluster rect not found for highlighting');
    return;
  }
  
  // Apply selected cluster highlight effect using CSS classes only
  rect
    .classed("cluster-selected", true)
    .attr("data-selected", "true");
  
  // Mark this cluster as having persistent highlight
  clusterInfo.hasPersistentHighlight = true;
}

// Function to remove highlight from cluster
function removeClusterHighlight(clusterInfo) {
  console.log('[ClusterClickMode] Removing highlight from cluster:', clusterInfo.id);
  
  const rect = clusterInfo.rect;
  if (!rect || !rect.node()) {
    console.error('[ClusterClickMode] Cluster rect not found for removing highlight');
    return;
  }
  
  // Remove selected cluster highlight using CSS classes only
  rect
    .classed("cluster-selected", false)
    .attr("data-selected", "false");
  
  clusterInfo.hasPersistentHighlight = false;
}

// Function to disable hover on selected cluster and enable it on others
function disableHoverOnSelectedCluster(selectedClusterInfo) {
  console.log('[ClusterClickMode] Disabling hover on selected cluster:', selectedClusterInfo.id);
  console.log('[ClusterClickMode] Selected state will persist until zoom out');
  
  // If there was a previously selected cluster, restore it to default state
  const previousSelectedCluster = window.$xDiagrams.clusterClickMode.selectedCluster;
  if (previousSelectedCluster && previousSelectedCluster.id !== selectedClusterInfo.id) {
    console.log('[ClusterClickMode] Restoring previous cluster to default state:', previousSelectedCluster.id);
    const previousRect = previousSelectedCluster.rect;
    if (previousRect && previousRect.node()) {
      previousRect
        .attr("data-selected", "false")
        .classed("cluster-selected", false);
      
      // Re-enable hover and click functionality on the previous cluster
      previousRect
        .on("click", function(event) {
          event.stopPropagation();
          zoomToCluster(previousSelectedCluster);
        })
        .on("mouseenter", function() {
          // Add hover effect using CSS classes only
          previousRect.classed("cluster-hover", true);
          
          // Show large hover title above the cluster
          showClusterHoverTitle(previousSelectedCluster);
        })
        .on("mouseleave", function() {
          // Remove hover effect using CSS classes only
          previousRect.classed("cluster-hover", false);
          
          // Hide hover title
          hideClusterHoverTitle();
        });
    }
    
    // Keep node interactions enabled in the previous cluster
    const previousClusterGroup = previousSelectedCluster.group.node();
    if (previousClusterGroup) {
      const nodes = previousClusterGroup.querySelectorAll('.node-clickable');
      console.log(`[ClusterClickMode] Keeping ${nodes.length} nodes interactive in previous cluster:`, previousSelectedCluster.id);
      nodes.forEach(node => {
        const nodeId = node.getAttribute('data-id');
        if (nodeId) {
          node.style.pointerEvents = 'auto';
          // Restore original click handler if available
          if (window.$xDiagrams.clusterClickMode.originalNodeClickHandlers.has(nodeId)) {
            const originalClick = window.$xDiagrams.clusterClickMode.originalNodeClickHandlers.get(nodeId);
            if (originalClick) {
              node.onclick = originalClick;
            }
          }
        }
      });
    }
  }
  
  // Note: We don't remove highlight here anymore - it persists until zoom out
  // removeClusterHighlight(selectedClusterInfo);
  
  // Apply selected cluster styles but keep click functionality
  const selectedRect = selectedClusterInfo.rect;
  if (selectedRect && selectedRect.node()) {
    selectedRect
      .attr("data-selected", "true")
      .style("cursor", "pointer")
      .style("pointer-events", "all")
      .style("transition", "all 0.1s ease")
      .on("click", function(event) {
        event.stopPropagation();
        // Check if this cluster is already selected at the time of click
        const currentlySelectedCluster = window.$xDiagrams.clusterClickMode.selectedCluster;
        const isCurrentlySelected = currentlySelectedCluster && currentlySelectedCluster.id === selectedClusterInfo.id;
        
        if (isCurrentlySelected) {
          console.log('[ClusterClickMode] Cluster already selected, keeping selection:', selectedClusterInfo.id);
          return;
        }
        // Otherwise, select this cluster
        zoomToCluster(selectedClusterInfo);
      })
      .on("mouseenter", null)
      .on("mouseleave", null);
  }
  
  // Re-enable node interactions in the selected cluster
  const selectedClusterGroup = selectedClusterInfo.group.node();
  if (selectedClusterGroup) {
    const nodes = selectedClusterGroup.querySelectorAll('.node-clickable');
    console.log(`[ClusterClickMode] Enabling ${nodes.length} nodes in selected cluster:`, selectedClusterInfo.id);
    nodes.forEach(node => {
      const nodeId = node.getAttribute('data-id');
      if (nodeId) {
        // Always enable pointer events for nodes in selected cluster
        node.style.pointerEvents = 'auto';
        
        // Restore original click handler if available
        if (window.$xDiagrams.clusterClickMode.originalNodeClickHandlers.has(nodeId)) {
          const originalClick = window.$xDiagrams.clusterClickMode.originalNodeClickHandlers.get(nodeId);
          if (originalClick) {
            node.onclick = originalClick;
          }
        } else {
          // If no original handler was stored, create a default one that opens side panel
          const nodeData = node.getAttribute('data-node-data');
          if (nodeData) {
            try {
              const parsedData = JSON.parse(nodeData);
              node.onclick = function(event) {
                event.stopPropagation();
                openSidePanel(parsedData);
              };
            } catch (e) {
              console.warn('Could not parse node data for side panel:', e);
            }
          }
        }
      }
    });
  }
  
  // Enable hover and click on all other clusters
  window.$xDiagrams.clusterClickMode.clusters.forEach(clusterInfo => {
    if (clusterInfo.id !== selectedClusterInfo.id) {
      const rect = clusterInfo.rect;
      if (rect && rect.node()) {
        // Re-enable hover and click functionality
        rect
          .style("cursor", "pointer")
          .style("pointer-events", "all")
          .on("click", function(event) {
            event.stopPropagation();
            zoomToCluster(clusterInfo);
          })
          .on("mouseenter", function() {
            // Add hover effect using CSS classes only
            rect.classed("cluster-hover", true);
            
            // Show large hover title above the cluster
            showClusterHoverTitle(clusterInfo);
          })
          .on("mouseleave", function() {
            // Remove hover effect using CSS classes only
            rect.classed("cluster-hover", false);
            
            // Hide hover title
            hideClusterHoverTitle();
          });
      }
    }
  });
  
  // Store the selected cluster info for reference
  window.$xDiagrams.clusterClickMode.selectedCluster = selectedClusterInfo;
}

// Function to deselect the currently selected cluster
function deselectCurrentCluster(reason = 'manual') {
  console.log('[ClusterClickMode] Deselecting current cluster - reason:', reason);
  
  // Remove any floating hover label
  const floatingLabel = d3.select('#floating-cluster-label');
  if (!floatingLabel.empty()) {
    floatingLabel.remove();
  }
  
  if (window.$xDiagrams.clusterClickMode.selectedCluster) {
    // Store reference before clearing
    const clusterToDeselect = window.$xDiagrams.clusterClickMode.selectedCluster;
    const selectedRect = clusterToDeselect.rect;
    
    console.log('[ClusterClickMode] Processing deselection for cluster:', clusterToDeselect.id, 'rect exists:', !!selectedRect);
    
    if (selectedRect && selectedRect.node()) {
      // Reset visual state using CSS classes only
      selectedRect
        .attr("data-selected", "false")
        .classed("cluster-selected", false);
      
      // Re-enable hover and click functionality
      selectedRect
        .on("click", function(event) {
          event.stopPropagation();
          zoomToCluster(clusterToDeselect);
        })
        .on("mouseenter", function() {
          // Add hover effect using CSS classes only
          selectedRect.classed("cluster-hover", true);
          
          // Create floating hover label positioned over the cluster
          const titleContainer = clusterToDeselect.group.select('.cluster-title-container');
          
          if (titleContainer.node()) {
            // Get current zoom level for dynamic scaling
            const svg = d3.select("#main-diagram-svg");
            const currentTransform = d3.zoomTransform(svg.node());
            const zoomFactor = Math.max(0.1, Math.min(2.0, 1 / currentTransform.k));
            
            // Get cluster bounds and transform in real-time
            const clusterGroup = clusterToDeselect.group.node();
            const clusterBounds = clusterGroup.getBBox();
            
            // Get the current transform of the cluster group
            const groupTransform = clusterGroup.getAttribute('transform');
            let groupTranslateX = 0;
            let groupTranslateY = 0;
            
            if (groupTransform) {
              const match = /translate\(([-\d.]+), ?([-\d.]+)\)/.exec(groupTransform);
              if (match) {
                groupTranslateX = parseFloat(match[1]) || 0;
                groupTranslateY = parseFloat(match[2]) || 0;
              }
            }
            
            // Calculate absolute position of cluster center
            const absoluteClusterX = groupTranslateX + clusterBounds.x;
            const absoluteClusterY = groupTranslateY + clusterBounds.y;
            const clusterCenterX = absoluteClusterX + clusterBounds.width / 2;
            const clusterCenterY = absoluteClusterY + clusterBounds.height / 2;
            
            // Calculate scale factor based on zoom
            const scaleFactor = Math.max(1.5, Math.min(3.0, 2.0 * zoomFactor));
            
            // Create or update floating label
            let floatingLabel = d3.select('#floating-cluster-label');
            if (floatingLabel.empty()) {
              floatingLabel = d3.select('#main-diagram-svg')
                .append('g')
                .attr('id', 'floating-cluster-label')
                .style('pointer-events', 'none')
                .style('z-index', '1000');
            }
            
            // Clear previous content
            floatingLabel.selectAll('*').remove();
            
            // Create background rectangle
            const labelBg = floatingLabel.append('rect')
              .attr('class', 'floating-label-bg')
              .style('rx', '8')
              .style('ry', '8');
            
            // Create text element
            const labelText = floatingLabel.append('text')
              .attr('class', 'floating-label-text')
              .text(clusterToDeselect.id)
              .style('font-size', `${14 * scaleFactor}px`)
              .style('font-weight', 'bold')
              .style('fill', 'var(--cluster-hover-stroke, #1976d2)')
              .style('text-anchor', 'middle')
              .style('dominant-baseline', 'middle');
            
            // Get text bounds and position elements
            const textBounds = labelText.node().getBBox();
            const padding = 12 * scaleFactor;
            
            // Position background
            labelBg
              .attr('x', clusterCenterX - textBounds.width / 2 - padding)
              .attr('y', clusterCenterY - textBounds.height / 2 - padding)
              .attr('width', textBounds.width + padding * 2)
              .attr('height', textBounds.height + padding * 2);
            
            // Position text
            labelText
              .attr('x', clusterCenterX)
              .attr('y', clusterCenterY);
            
            // Add transition
            floatingLabel
              .style('opacity', '0')
              .transition()
              .duration(200)
              .style('opacity', '1');
          }
        })
        .on("mouseleave", function() {
          // Remove hover effect
          selectedRect
            .style("fill", null)
            .style("stroke", null)
            .style("stroke-width", null)
            .style("stroke-dasharray", null);
          
          // Hide cluster hover tooltip
          hideClusterTooltip();
        });
      
      // Keep node interactions enabled in the deselected cluster
      const selectedClusterGroup = clusterToDeselect.group.node();
      if (selectedClusterGroup) {
        const nodes = selectedClusterGroup.querySelectorAll('.node-clickable');
        console.log(`[ClusterClickMode] Keeping ${nodes.length} nodes interactive in deselected cluster:`, clusterToDeselect.id);
        nodes.forEach(node => {
          const nodeId = node.getAttribute('data-id');
          if (nodeId) {
            node.style.pointerEvents = 'auto';
            // Restore original click handler if available
            if (window.$xDiagrams.clusterClickMode.originalNodeClickHandlers.has(nodeId)) {
              const originalClick = window.$xDiagrams.clusterClickMode.originalNodeClickHandlers.get(nodeId);
              if (originalClick) {
                node.onclick = originalClick;
              }
            }
          }
        });
      }
      
      console.log('[ClusterClickMode] Deselected cluster:', clusterToDeselect.id);
    } else {
      console.warn('[ClusterClickMode] Warning: Selected rect or node not found for cluster:', clusterToDeselect.id);
    }
  } else {
    console.log('[ClusterClickMode] No cluster to deselect');
  }
  
  // Clear the selected cluster reference
  window.$xDiagrams.clusterClickMode.selectedCluster = null;
  console.log('[ClusterClickMode] Deselection process completed');
  
  // Re-initialize tooltips to ensure they work after deselection
  if (detectMultiClusterDiagram()) {
    console.log('[ClusterClickMode] Re-initializing tooltips after deselection');
    forceReinitializeTooltips();
    
    // Check if tooltips should be active now that cluster is deselected
    if (shouldShowTooltips()) {
      console.log('[ClusterClickMode] Tooltips are now active after deselection');
    } else {
      console.log('[ClusterClickMode] Tooltips remain inactive due to zoom level');
    }
  }
}

// Function to reset selected cluster state (only called when completely resetting)
function resetSelectedClusterState() {
  console.log('[ClusterClickMode] Completely resetting selected cluster state');
  
  if (window.$xDiagrams.clusterClickMode.selectedCluster) {
    const selectedRect = window.$xDiagrams.clusterClickMode.selectedCluster.rect;
    if (selectedRect && selectedRect.node()) {
      selectedRect
        .attr("data-selected", "false")
        .style("fill", null) // Remove inline styles to let CSS take over
        .style("stroke", null)
        .style("stroke-width", null)
        .style("stroke-dasharray", null)
        .style("transition", "all 0.1s ease");
      
      console.log('[ClusterClickMode] Reset cluster:', window.$xDiagrams.clusterClickMode.selectedCluster.id);
    }
  }
  
  // Clear the selected cluster reference
  window.$xDiagrams.clusterClickMode.selectedCluster = null;
  
  // Re-initialize tooltips to ensure they work after reset
  if (detectMultiClusterDiagram()) {
    console.log('[ClusterClickMode] Re-initializing tooltips after reset');
    forceReinitializeTooltips();
  }
}

// CLUSTER TOOLTIP SYSTEM
// ============================================================================

// Global tooltip state
window.$xDiagrams.clusterTooltip = {
  active: false,
  currentCluster: null,
  element: null,
  initialized: false,
  position: 'top', // Default position
  lastVisibilityState: null // Track last visibility state to avoid spam logging
};

// Tooltip position configuration
window.$xDiagrams.tooltipPositions = {
  // Centered positions
  'top': { x: 'center', y: 'above', offset: { x: 0, y: -10 } },
  'bottom': { x: 'center', y: 'below', offset: { x: 0, y: 10 } },
  'left': { x: 'left', y: 'center', offset: { x: -10, y: 0 } },
  'right': { x: 'right', y: 'center', offset: { x: 10, y: 0 } },
  
  // Corner positions
  'top-corner-left': { x: 'left', y: 'above', offset: { x: -10, y: -10 } },
  'top-corner-right': { x: 'right', y: 'above', offset: { x: 10, y: -10 } },
  'bottom-corner-left': { x: 'left', y: 'below', offset: { x: -10, y: 10 } },
  'bottom-corner-right': { x: 'right', y: 'below', offset: { x: 10, y: 10 } }
};

// Function to check if tooltips should be active based on zoom level and cluster state
function shouldShowTooltips() {
  // Get current zoom level
  const svg = d3.select("#main-diagram-svg");
  if (svg.empty()) return false;
  
  const currentTransform = d3.zoomTransform(svg.node());
  const currentScale = currentTransform.k;
  
  // Get cluster click mode threshold and deselection threshold
  const threshold = window.$xDiagrams.clusterClickMode.threshold || 0.4;
  const deselectionThreshold = window.$xDiagrams.clusterClickMode.deselectionThreshold || 0.45;
  
  // Tooltips should only be active when:
  // 1. We're in zoom out (scale <= deselectionThreshold) - seeing multiple clusters clearly
  // 2. No cluster is currently selected
  const isZoomedOut = currentScale <= deselectionThreshold;
  const noClusterSelected = !window.$xDiagrams.clusterClickMode.selectedCluster;
  
  const shouldShow = isZoomedOut && noClusterSelected;
  
  // Only log when there's a change in state to avoid spam
  if (window.$xDiagrams.clusterTooltip.lastVisibilityState !== shouldShow) {
    console.log('[ClusterTooltip] Tooltip visibility changed:', {
      currentScale,
      threshold,
      deselectionThreshold,
      isZoomedOut,
      noClusterSelected,
      shouldShow,
      reason: !isZoomedOut ? 'zoom-in' : (noClusterSelected ? 'no-cluster-selected' : 'cluster-selected')
    });
    window.$xDiagrams.clusterTooltip.lastVisibilityState = shouldShow;
  }
  
  return shouldShow;
}

// Function to get tooltip position configuration from layout
function getTooltipPositionConfig() {
  // Get layout configuration
  const layoutConfig = getLayoutConfiguration();
  const position = layoutConfig.clustersTooltip || 'top';
  
  // Validate position
  if (window.$xDiagrams.tooltipPositions[position]) {
    return position;
  }
  
  console.warn('[ClusterTooltip] Invalid tooltip position:', position, 'using default: top');
  return 'top';
}

// Function to calculate tooltip position based on configuration
function calculateTooltipPosition(clusterRect, tooltipWidth, tooltipHeight, positionConfig) {
  const rectBounds = clusterRect.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
  let left, top;
  
  // Calculate base position based on configuration
  switch (positionConfig.x) {
    case 'center':
      left = rectBounds.left + (rectBounds.width / 2) - (tooltipWidth / 2);
      break;
    case 'left':
      left = rectBounds.left;
      break;
    case 'right':
      left = rectBounds.right - tooltipWidth;
      break;
    default:
      left = rectBounds.left + (rectBounds.width / 2) - (tooltipWidth / 2);
  }
  
  switch (positionConfig.y) {
    case 'above':
      top = rectBounds.top - tooltipHeight;
      break;
    case 'below':
      top = rectBounds.bottom;
      break;
    case 'center':
      top = rectBounds.top + (rectBounds.height / 2) - (tooltipHeight / 2);
      break;
    default:
      top = rectBounds.top - tooltipHeight;
  }
  
  // Apply offset
  left += positionConfig.offset.x;
  top += positionConfig.offset.y;
  
  // Ensure tooltip stays within viewport
  if (left < 10) left = 10;
  if (left + tooltipWidth > viewportWidth - 10) left = viewportWidth - tooltipWidth - 10;
  if (top < 10) top = 10;
  if (top + tooltipHeight > viewportHeight - 10) top = viewportHeight - tooltipHeight - 10;
  
  return { left, top };
}

// Function to setup cluster tooltips (works independently of cluster click mode)
function setupClusterTooltips() {
  console.log('[ClusterTooltip] Setting up cluster tooltips');
  
  // Find all cluster rectangles
  const clusterRects = d3.selectAll(".cluster-rect");
  
  if (!clusterRects.empty()) {
    clusterRects.each(function(d, i) {
      const rect = d3.select(this);
      const clusterGroup = rect.node().parentNode;
      const clusterId = clusterGroup.getAttribute('data-root-id') || 
                       clusterGroup.querySelector('.cluster-title')?.textContent || 
                       `cluster-${i}`;
      
      // Create cluster info object
      const clusterInfo = {
        id: clusterId,
        rect: rect,
        group: d3.select(clusterGroup)
      };
      
      // Remove any existing event handlers to prevent duplicates
      rect.on("mouseenter", null).on("mouseleave", null);
      
      // Add tooltip functionality to cluster rect
      rect
        .on("mouseenter", function() {
          console.log('[ClusterTooltip] Mouse enter on cluster:', clusterInfo.id);
          
          // Check if tooltips should be shown based on zoom level and cluster state
          if (shouldShowTooltips()) {
            showClusterTooltip(clusterInfo);
          } else {
            console.log('[ClusterTooltip] Tooltips disabled - zoom level or cluster state not suitable');
          }
        })
        .on("mouseleave", function() {
          console.log('[ClusterTooltip] Mouse leave on cluster:', clusterInfo.id);
          hideClusterTooltip();
        });
    });
    
    window.$xDiagrams.clusterTooltip.initialized = true;
    console.log('[ClusterTooltip] Cluster tooltips initialized for', clusterRects.size(), 'clusters');
  } else {
    console.warn('[ClusterTooltip] No cluster rectangles found');
  }
}

// Function to show cluster tooltip
function showClusterTooltip(clusterInfo) {
  try {
    console.log('[ClusterTooltip] Showing tooltip for cluster:', clusterInfo.id);
    
    // Check zoom level - don't show tooltip if zoom is greater than 0.25 (too close)
    const svg = document.getElementById("main-diagram-svg");
    if (svg) {
      const currentTransform = d3.zoomTransform(svg);
      if (currentTransform.k > 0.25) {
        console.log('[ClusterTooltip] Zoom level too high (> 0.25), hiding tooltip');
        return;
      }
    }
    
    // Get cluster bounds
    const clusterRect = clusterInfo.rect.node();
    if (!clusterRect) {
      console.warn('[ClusterTooltip] Cluster rect not found');
      return;
    }
    
    const rectBounds = clusterRect.getBoundingClientRect();
    if (!rectBounds || rectBounds.width === 0 || rectBounds.height === 0) {
      console.warn('[ClusterTooltip] Invalid cluster bounds');
      return;
    }
    
    // Get or create tooltip element
    let tooltip = d3.select('#cluster-tooltip');
    if (tooltip.empty()) {
      tooltip = d3.select('body')
        .append('div')
        .attr('id', 'cluster-tooltip')
        .style('position', 'fixed')
        .style('z-index', '10000')
        .style('pointer-events', 'none')
        .style('background', 'rgba(0, 0, 0, 0.8)')
        .style('color', 'white')
        .style('padding', '8px 12px')
        .style('border-radius', '6px')
        .style('font-size', '14px')
        .style('font-weight', 'bold')
        .style('white-space', 'nowrap')
        .style('box-shadow', '0 2px 8px rgba(0, 0, 0, 0.3)')
        .style('opacity', '0')
        .style('transition', 'opacity 0.2s ease');
      
      window.$xDiagrams.clusterTooltip.element = tooltip;
    }
    
    // Update tooltip content
    tooltip.text(clusterInfo.id);
    
    // Get tooltip dimensions
    const tooltipWidth = tooltip.node().offsetWidth || 100;
    const tooltipHeight = tooltip.node().offsetHeight || 30;
    
    // Get position configuration
    const positionName = getTooltipPositionConfig();
    const positionConfig = window.$xDiagrams.tooltipPositions[positionName];
    
    // Calculate position based on configuration
    const position = calculateTooltipPosition(clusterRect, tooltipWidth, tooltipHeight, positionConfig);
    
    // Position tooltip
    tooltip
      .style('left', position.left + 'px')
      .style('top', position.top + 'px')
      .style('opacity', '1');
    
    // Store current position configuration
    window.$xDiagrams.clusterTooltip.position = positionName;
    
    // Update state
    window.$xDiagrams.clusterTooltip.active = true;
    window.$xDiagrams.clusterTooltip.currentCluster = clusterInfo;
    
    console.log('[ClusterTooltip] Tooltip positioned at:', { left: position.left, top: position.top, clusterId: clusterInfo.id });
    
  } catch (error) {
    console.error('[ClusterTooltip] Error showing tooltip:', error);
  }
}

// Function to hide cluster tooltip
function hideClusterTooltip() {
  try {
    // Clear any pending tooltip position updates
    if (tooltipUpdateTimeout) {
      clearTimeout(tooltipUpdateTimeout);
      tooltipUpdateTimeout = null;
    }
    
    const tooltip = d3.select('#cluster-tooltip');
    if (!tooltip.empty()) {
      tooltip
        .style('opacity', '0')
        .on('transitionend', function() {
          if (tooltip.style('opacity') === '0') {
            tooltip.remove();
            // Clear tooltip state
            window.$xDiagrams.clusterTooltip.active = false;
            window.$xDiagrams.clusterTooltip.currentCluster = null;
          }
        });
    }
    
    // Clear tooltip state immediately
    window.$xDiagrams.clusterTooltip.active = false;
    window.$xDiagrams.clusterTooltip.currentCluster = null;
    
    console.log('[ClusterTooltip] Tooltip hidden');
    
  } catch (error) {
    console.error('[ClusterTooltip] Error hiding tooltip:', error);
    // Force removal if transition fails
    d3.select('#cluster-tooltip').remove();
  }
}

// Make functions globally available
window.activateClusterClickMode = activateClusterClickMode;
window.deactivateClusterClickMode = deactivateClusterClickMode;
window.zoomToCluster = zoomToCluster;
window.detectMultiClusterDiagram = detectMultiClusterDiagram;
window.disableHoverOnSelectedCluster = disableHoverOnSelectedCluster;
window.deselectCurrentCluster = deselectCurrentCluster;
window.resetSelectedClusterState = resetSelectedClusterState;
window.showClusterTooltip = showClusterTooltip;
window.hideClusterTooltip = hideClusterTooltip;
window.setupClusterTooltips = setupClusterTooltips;

// Function to force re-initialization of tooltips
function forceReinitializeTooltips() {
  console.log('[ClusterTooltip] Force re-initializing tooltips');
  window.$xDiagrams.clusterTooltip.initialized = false;
  setupClusterTooltips();
}

window.forceReinitializeTooltips = forceReinitializeTooltips;

// Debug function to check tooltip status
function debugTooltipStatus() {
  console.log('=== TOOLTIP DEBUG INFO ===');
  console.log('Tooltip initialized:', window.$xDiagrams.clusterTooltip.initialized);
  console.log('Tooltip active:', window.$xDiagrams.clusterTooltip.active);
  console.log('Current cluster:', window.$xDiagrams.clusterTooltip.currentCluster);
  console.log('Tooltip element exists:', !!window.$xDiagrams.clusterTooltip.element);
  console.log('Current position:', window.$xDiagrams.clusterTooltip.position);
  console.log('Available positions:', getAvailableTooltipPositions());
  
  // Show layout configuration
  const layoutConfig = getLayoutConfiguration();
  console.log('Layout clustersTooltip config:', layoutConfig.clustersTooltip);
  console.log('Full layout config:', layoutConfig);
  
  // Show tooltip visibility status
  console.log('Tooltip visibility check:', shouldShowTooltips());
  
  // Show zoom and cluster state
  const svg = d3.select("#main-diagram-svg");
  if (!svg.empty()) {
    const currentTransform = d3.zoomTransform(svg.node());
    const threshold = window.$xDiagrams.clusterClickMode.threshold || 0.4;
    const deselectionThreshold = window.$xDiagrams.clusterClickMode.deselectionThreshold || 0.45;
    console.log('Zoom state:', {
      currentScale: currentTransform.k,
      threshold: threshold,
      deselectionThreshold: deselectionThreshold,
      isZoomedOut: currentTransform.k <= deselectionThreshold,
      noClusterSelected: !window.$xDiagrams.clusterClickMode.selectedCluster,
      shouldDeselect: currentTransform.k <= deselectionThreshold && !!window.$xDiagrams.clusterClickMode.selectedCluster
    });
  }
  
  const clusterRects = d3.selectAll(".cluster-rect");
  console.log('Total cluster rectangles found:', clusterRects.size());
  
  clusterRects.each(function(d, i) {
    const rect = d3.select(this);
    const hasMouseEnter = rect.on("mouseenter") !== null;
    const hasMouseLeave = rect.on("mouseleave") !== null;
    console.log(`Cluster ${i}: mouseenter=${hasMouseEnter}, mouseleave=${hasMouseLeave}`);
  });
  
  console.log('Cluster click mode active:', window.$xDiagrams.clusterClickMode.active);
  console.log('Selected cluster:', window.$xDiagrams.clusterClickMode.selectedCluster?.id || 'none');
  console.log('========================');
}

window.debugTooltipStatus = debugTooltipStatus;

// Throttled tooltip position update during zoom
let tooltipUpdateTimeout = null;

// Function to update tooltip position during zoom
function updateTooltipPositionDuringZoom() {
  // Check if tooltips should still be active
  if (!shouldShowTooltips()) {
    // Hide tooltip if conditions are no longer met
    if (window.$xDiagrams.clusterTooltip.active) {
      console.log('[ClusterTooltip] Hiding tooltip due to zoom level or cluster state change');
      hideClusterTooltip();
    }
    return;
  }
  
  // Only update if there's an active tooltip
  if (!window.$xDiagrams.clusterTooltip.active || !window.$xDiagrams.clusterTooltip.currentCluster) {
    return;
  }
  
  // Throttle updates to avoid excessive calculations during zoom
  if (tooltipUpdateTimeout) {
    clearTimeout(tooltipUpdateTimeout);
  }
  
  tooltipUpdateTimeout = setTimeout(() => {
    const clusterInfo = window.$xDiagrams.clusterTooltip.currentCluster;
    const tooltip = d3.select('#cluster-tooltip');
    
    if (tooltip.empty()) {
      return;
    }
    
    try {
      // Get current cluster bounds (recalculated after zoom)
      const clusterRect = clusterInfo.rect.node();
      if (!clusterRect) {
        return;
      }
      
      const rectBounds = clusterRect.getBoundingClientRect();
      if (!rectBounds || rectBounds.width === 0 || rectBounds.height === 0) {
        return;
      }
      
      // Get tooltip dimensions
      const tooltipWidth = tooltip.node().offsetWidth || 100;
      const tooltipHeight = tooltip.node().offsetHeight || 30;
      
      // Get current position configuration
      const positionName = window.$xDiagrams.clusterTooltip.position || getTooltipPositionConfig();
      const positionConfig = window.$xDiagrams.tooltipPositions[positionName];
      
      // Calculate new position based on configuration
      const position = calculateTooltipPosition(clusterRect, tooltipWidth, tooltipHeight, positionConfig);
      
      // Update tooltip position smoothly
      tooltip
        .style('left', position.left + 'px')
        .style('top', position.top + 'px');
      
      console.log('[ClusterTooltip] Updated tooltip position during zoom:', { left: position.left, top: position.top, clusterId: clusterInfo.id });
      
    } catch (error) {
      console.error('[ClusterTooltip] Error updating tooltip position during zoom:', error);
    }
  }, 16); // ~60fps throttling
}

window.updateTooltipPositionDuringZoom = updateTooltipPositionDuringZoom;

// Function to set tooltip position dynamically
function setTooltipPosition(position) {
  if (window.$xDiagrams.tooltipPositions[position]) {
    window.$xDiagrams.clusterTooltip.position = position;
    console.log('[ClusterTooltip] Tooltip position set to:', position);
    
    // Update current tooltip if active
    if (window.$xDiagrams.clusterTooltip.active && window.$xDiagrams.clusterTooltip.currentCluster) {
      updateTooltipPositionDuringZoom();
    }
  } else {
    console.warn('[ClusterTooltip] Invalid tooltip position:', position);
    console.log('[ClusterTooltip] Available positions:', Object.keys(window.$xDiagrams.tooltipPositions));
  }
}

// Function to get available tooltip positions
function getAvailableTooltipPositions() {
  return Object.keys(window.$xDiagrams.tooltipPositions);
}

// Function to get current tooltip position
function getCurrentTooltipPosition() {
  return window.$xDiagrams.clusterTooltip.position;
}

window.setTooltipPosition = setTooltipPosition;
window.getAvailableTooltipPositions = getAvailableTooltipPositions;
window.getCurrentTooltipPosition = getCurrentTooltipPosition;
window.shouldShowTooltips = shouldShowTooltips;

// Function to find which cluster a node belongs to
function findClusterForNode(nodeElement) {
  if (!nodeElement || !window.$xDiagrams.clusterClickMode.clusters) {
    return null;
  }
  
  // Find the cluster group that contains this node
  let clusterGroup = nodeElement.closest('.diagram-group');
  if (!clusterGroup) {
    // Try to find the cluster group by traversing up the DOM
    let parent = nodeElement.parentElement;
    while (parent && !parent.classList.contains('diagram-group')) {
      parent = parent.parentElement;
    }
    clusterGroup = parent;
  }
  
  if (!clusterGroup) {
    console.warn('[ClusterClickMode] Could not find cluster group for node');
    return null;
  }
  
  // Find the cluster info that matches this group
  const clusterId = clusterGroup.getAttribute('data-root-id') || 
                   clusterGroup.querySelector('.cluster-title')?.textContent;
  
  if (!clusterId) {
    console.warn('[ClusterClickMode] Could not find cluster ID for node');
    return null;
  }
  
  // Find the matching cluster info
  const clusterInfo = window.$xDiagrams.clusterClickMode.clusters.find(cluster => cluster.id === clusterId);
  
  if (!clusterInfo) {
    console.warn('[ClusterClickMode] Could not find cluster info for cluster ID:', clusterId);
    return null;
  }
  
  return clusterInfo;
}

// Function to force deselect cluster on zoom out
function forceDeselectOnZoomOut() {
  if (window.$xDiagrams.clusterClickMode.selectedCluster) {
    console.log('[ClusterClickMode] Force deselecting cluster on zoom out');
    deselectCurrentCluster('zoom-out');
    
    // Re-initialize tooltips to ensure they work
    if (detectMultiClusterDiagram()) {
      forceReinitializeTooltips();
    }
  }
}

window.forceDeselectOnZoomOut = forceDeselectOnZoomOut;
