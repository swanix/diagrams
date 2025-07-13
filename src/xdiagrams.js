// Swanix Diagrams - JS
// v0.3.1

// Global zoom behavior - defined at the beginning to avoid scope issues
const zoom = d3.zoom()
  .scaleExtent([0.1, 4])
  .on("zoom", event => {
    d3.select("#main-diagram-svg g").attr("transform", event.transform);
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
    
    // Check if diagram already exists
    const exists = savedDiagrams.find(d => d.name === diagram.name);
    if (!exists) {
      savedDiagrams.push(diagram);
      localStorage.setItem('xdiagrams-saved-files', JSON.stringify(savedDiagrams));
      console.log('Diagram saved to localStorage:', diagram.name);
    }
  } catch (error) {
    console.error('Error saving diagram to localStorage:', error);
  }
}

// Process CSV file
function processCSVFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = function(e) {
      try {
        const csvContent = e.target.result;
        Papa.parse(csvContent, {
          header: true,
          skipEmptyLines: true,
          complete: function(results) {
            // Ignorar errores de tipo 'TooFewFields'
            const fatalErrors = results.errors.filter(err => err.code !== 'TooFewFields');
            if (fatalErrors.length > 0) {
              reject(new Error('Error parsing CSV: ' + fatalErrors[0].message));
              return;
            }
            
            // Create diagram object
            const diagram = {
              name: file.name.replace('.csv', ''),
              url: null, // Local file, no URL
              data: results.data,
              isLocal: true,
              timestamp: new Date().toISOString()
            };
            
            resolve(diagram);
          },
          error: function(error) {
            reject(new Error('Error parsing CSV: ' + error.message));
          }
        });
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = function() {
      reject(new Error('Error reading file'));
    };
    
    reader.readAsText(file);
  });
}

// Process JSON file
function processJSONFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = function(e) {
      try {
        const jsonContent = e.target.result;
        let jsonData;
        try {
          jsonData = JSON.parse(jsonContent);
        } catch (parseErr) {
          return reject(new Error('Error parsing JSON: ' + parseErr.message));
        }

        // Convert JSON to internal array-of-objects format
        const dataArray = convertJsonToCsvFormat(jsonData);

        if (!Array.isArray(dataArray) || dataArray.length === 0) {
          return reject(new Error('JSON vacío o en formato no reconocido'));
        }

        // Create diagram object
        const diagram = {
          name: file.name.replace(/\.json$/i, ''),
          url: null, // Local file, no URL
          data: dataArray,
          isLocal: true,
          timestamp: new Date().toISOString()
        };

        resolve(diagram);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = function() {
      reject(new Error('Error reading file'));
    };

    reader.readAsText(file);
  });
}

// Add diagram to switcher and load it
window.addAndLoadDiagram = function(diagram) {
  // Add to configuration
  window.$xDiagrams.diagrams.push(diagram);
  
  // Save to localStorage
  saveDiagramToStorage(diagram);
  
  // Trigger hook
  if (window.$xDiagrams.hooks && window.$xDiagrams.hooks.onFileDrop) {
    window.$xDiagrams.hooks.onFileDrop(diagram);
  }
  
  // Reload the diagram system to include the new diagram
  if (window.reloadDiagramSystem) {
    window.reloadDiagramSystem();
  } else {
    // Fallback: reload the page
    setTimeout(() => {
      window.location.reload();
    }, 500);
  }
};

// Handle file drop
function handleFileDrop(e) {
  e.preventDefault();
  
  // Hide drag overlay
  const dragOverlay = document.getElementById('dragOverlay');
  const fileDropZone = document.getElementById('fileDropZone');
  const canvas = document.getElementById('sw-diagram');
  
  if (dragOverlay) dragOverlay.classList.remove('active');
  if (fileDropZone) fileDropZone.classList.remove('active');
  if (canvas) canvas.classList.remove('drag-over');
  
  const files = e.dataTransfer.files;
  if (files.length > 0) {
    // Filtrar archivos CSV o JSON compatibles
    const supportedFiles = Array.from(files).filter(file => {
      const name = file.name.toLowerCase();
      const type = file.type;
      return (
        type === 'text/csv' || name.endsWith('.csv') ||
        type === 'application/json' || type === 'text/json' || name.endsWith('.json')
      );
    });

    if (supportedFiles.length === 0) {
      showToast('Por favor, selecciona archivos CSV o JSON válidos.', 'error');
      return;
    }

    const processFile = (file) => {
      const isCsv = file.name.toLowerCase().endsWith('.csv') || file.type === 'text/csv';
      return isCsv ? processCSVFile(file) : processJSONFile(file);
    };

    if (supportedFiles.length === 1) {
      // Single file
      const file = supportedFiles[0];
      console.log('📁 Procesando archivo:', file.name);

      processFile(file)
        .then(diagram => {
          console.log('✅ Archivo procesado exitosamente:', diagram.name);
          window.addAndLoadDiagram(diagram);
        })
        .catch(error => {
          console.error('❌ Error procesando archivo:', error);
          showToast('Error al procesar el archivo: ' + error.message, 'error');
        });
    } else {
      // Multiple files
      console.log(`📁 Procesando ${supportedFiles.length} archivos...`);

      Promise.allSettled(supportedFiles.map(file => processFile(file)))
        .then(results => {
          const successful = results.filter(r => r.status === 'fulfilled').map(r => r.value);
          const failed = results
            .map((r, i) => r.status === 'rejected' ? { name: supportedFiles[i].name, reason: r.reason && r.reason.message ? r.reason.message : r.reason } : null)
            .filter(Boolean);

          // Agregar los diagramas exitosos
          successful.forEach(diagram => {
            window.addAndLoadDiagram(diagram);
          });

          // Feedback
          if (failed.length > 0) {
            let msg = `${successful.length} diagramas agregados exitosamente\n❌ ${failed.length} fallaron:\n`;
            msg += failed.map(f => `- ${f.name}: ${f.reason}`).join('\n');
            showToast(msg, 'mixed');
          } else {
            showToast(`${successful.length} diagramas agregados exitosamente`, 'success');
          }
        });
    }
  }
}

// Drag event handlers
function handleDragEnter(e) {
  e.preventDefault();
  const canvas = document.getElementById('sw-diagram');
  const dragOverlay = document.getElementById('dragOverlay');
  
  if (canvas) canvas.classList.add('drag-over');
  if (dragOverlay) dragOverlay.classList.add('active');
}

function handleDragOver(e) {
  e.preventDefault();
}

function handleDragLeave(e) {
  e.preventDefault();
  const canvas = document.getElementById('sw-diagram');
  const dragOverlay = document.getElementById('dragOverlay');
  
  // Only remove drag state if we're leaving the canvas completely
  if (!canvas.contains(e.relatedTarget)) {
    if (canvas) canvas.classList.remove('drag-over');
    if (dragOverlay) dragOverlay.classList.remove('active');
  }
}

// Initialize drag & drop
function initDragAndDrop() {
  // Utilizar el helper isOptionEnabled para que el valor por defecto sea TRUE
  if (!isOptionEnabled('dragAndDrop')) {
    console.log('[Drag & Drop] Opción dragAndDrop deshabilitada');
    return;
  }
  
  console.log('[Drag & Drop] Inicializando funcionalidad...');
  
  // Load saved diagrams
  loadSavedDiagrams();
  
  // Use the sw-diagram container instead of .xcanvas
  const canvas = document.getElementById('sw-diagram');
  if (!canvas) {
    console.log('[Drag & Drop] Contenedor sw-diagram no encontrado');
    return;
  }
  
  console.log('[Drag & Drop] Agregando event listeners al contenedor:', canvas);
  
  // Add event listeners
  canvas.addEventListener('dragenter', handleDragEnter);
  canvas.addEventListener('dragover', handleDragOver);
  canvas.addEventListener('dragleave', handleDragLeave);
  canvas.addEventListener('drop', handleFileDrop);
  
  // Prevent default drag behaviors on the document
  document.addEventListener('dragenter', function(e) {
    e.preventDefault();
  });
  
  document.addEventListener('dragover', function(e) {
    e.preventDefault();
  });
  
  document.addEventListener('drop', function(e) {
    e.preventDefault();
  });
  
  console.log('[Drag & Drop] Event listeners agregados correctamente');
}

// Initialize drag & drop when DOM is ready
function initDragAndDropDelayed() {
  // Wait for the sw-diagram container to be created
  const swDiagram = document.getElementById('sw-diagram');
  if (swDiagram) {
    console.log('[Drag & Drop] Contenedor sw-diagram encontrado, inicializando...');
    initDragAndDrop();
  } else {
    // Try again in 100ms
    setTimeout(initDragAndDropDelayed, 100);
  }
}

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
function initDiagram(source, onComplete, retryCount = 0) {
          console.log("Iniciando carga del diagrama...", retryCount > 0 ? `(intento ${retryCount + 1})` : '');
  
  // Use the new data source abstraction layer
  detectAndLoadDataSource(source, onComplete, retryCount);
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
function getColumnConfiguration() {
  const config = getXDiagramsConfiguration();
  
  // Try modern configuration first
  if (config.columns) {
    const columns = config.columns;
    const columnConfig = {
      id: [columns.id || 'Node'],
      name: [columns.name || 'Name'],
      subtitle: [columns.subtitle || 'Description'],
      img: [columns.img || 'Type'],
      parent: [columns.parent || 'Parent'],
      url: [columns.url || 'url'],
      type: [columns.type || 'Type']
    };

    // Add fallback names for each field
    columnConfig.id.push('node', 'Node', 'NODE', 'id', 'Id', 'ID');
    columnConfig.name.push('name', 'Name', 'NAME', 'title', 'Title', 'TITLE');
    columnConfig.subtitle.push('subtitle', 'Subtitle', 'SUBTITLE', 'description', 'Description', 'DESCRIPTION', 'desc', 'Desc', 'DESC');
    columnConfig.img.push('thumbnail', 'Thumbnail', 'THUMBNAIL', 'img', 'Img', 'IMG', 'type', 'Type', 'TYPE', 'icon', 'Icon', 'ICON');
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
      img: ['thumbnail', 'Thumbnail', 'THUMBNAIL', 'img', 'Img', 'IMG', 'type', 'Type', 'TYPE', 'icon', 'Icon', 'ICON'],
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
        img: [customConfig.img || 'Thumbnail'],
        parent: [customConfig.parent || 'Parent'],
        url: [customConfig.url || 'url'],
        type: [customConfig.type || 'Type']
      };

      // Add fallback names for each field
      config.id.push('node', 'Node', 'NODE', 'id', 'Id', 'ID');
      config.name.push('name', 'Name', 'NAME', 'title', 'Title', 'TITLE');
      config.subtitle.push('subtitle', 'Subtitle', 'SUBTITLE', 'description', 'Description', 'DESCRIPTION', 'desc', 'Desc', 'DESC');
      config.img.push('thumbnail', 'Thumbnail', 'THUMBNAIL', 'img', 'Img', 'IMG', 'type', 'Type', 'TYPE', 'icon', 'Icon', 'ICON');
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
    img: [container.getAttribute('data-column-img') || 'Thumbnail'],
    parent: [container.getAttribute('data-column-parent') || 'Parent'],
    url: [container.getAttribute('data-column-url') || 'url'],
    type: [container.getAttribute('data-column-type') || 'Type']
  };

  // Add fallback names for each field
  config.id.push('node', 'Node', 'NODE', 'id', 'Id', 'ID');
  config.name.push('name', 'Name', 'NAME', 'title', 'Title', 'TITLE');
  config.subtitle.push('subtitle', 'Subtitle', 'SUBTITLE', 'description', 'Description', 'DESCRIPTION', 'desc', 'Desc', 'DESC');
  config.img.push('thumbnail', 'Thumbnail', 'THUMBNAIL', 'img', 'Img', 'IMG', 'type', 'Type', 'TYPE', 'icon', 'Icon', 'ICON');
  config.parent.push('parent', 'Parent', 'PARENT');
  config.url.push('url', 'Url', 'URL', 'link', 'Link', 'LINK');
  config.type.push('type', 'Type', 'TYPE');

  return config;
}

// Build simplified hierarchies
function buildHierarchies(data) {
  let roots = [];
  let nodeMap = new Map();
  let autoIdCounter = 1;
  
  // Get column configuration
  const columnConfig = getColumnConfiguration();

  data.forEach(d => {
    // Skip completely empty rows
    const isEmptyRow = Object.values(d).every(value => 
      value === undefined || value === null || value === "" || value.toString().trim() === ""
    );
    
    if (isEmptyRow) {
      console.log('[CSV Processing] Skipping empty row:', d);
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
      id = `auto_${autoIdCounter++}`;
      console.log('[CSV Processing] Generated auto ID:', id, 'for node:', name);
    }

    // Skip nodes without essential data (name is the only truly required field)
    if (!name || name.trim() === "") {
      console.log('[CSV Processing] Skipping node without name:', { id, name });
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
      roots.push(node);
    }
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

  // Node image
  nodeGroups.append("image")
    .attr("href", d => {
      const baseUrl = d.img ? `img/${d.img}.svg` : "img/detail.svg";
      const cacheBuster = `?t=${Date.now()}`;
      return baseUrl.includes('?') ? `${baseUrl}&_cb=${Date.now()}` : `${baseUrl}${cacheBuster}`;
    })
    .attr("x", -15)
    .attr("y", -25)
    .attr("class", "image-base image-filter")
    .attr("width", 30)
    .attr("height", 30)
    .on("error", function() {
      const fallbackUrl = `img/detail.svg?t=${Date.now()}`;
      d3.select(this).attr("href", fallbackUrl);
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
  
  console.log('[Grid Layout] Rendered', positionedNodes.length, 'nodes in grid layout');
}

// Draw clusters in grid layout (solución avanzada)
function drawClusterGrid(trees, svg) {
  const g = d3.select(svg).append("g");
  // Paso 1: Renderizar cada cluster en posición temporal (apilados verticalmente)
  const clusterGroups = [];
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
      // Render en posición temporal (x=0, y=index*1000)
      const treeGroup = g.append("g")
        .attr("class", "diagram-group")
        .attr("data-root-id", root.data.id)
        .attr("transform", `translate(0, ${index * 1000})`);
      // Render links
      treeGroup.selectAll(".link")
        .data(root.links())
        .enter().append("path")
        .attr("class", "link")
        .attr("d", d => `M ${d.source.x} ${d.source.y} V ${(d.source.y + d.target.y) / 2} H ${d.target.x} V ${d.target.y}`);
      // Render nodes
      const node = treeGroup.selectAll(".node")
        .data(root.descendants())
        .enter().append("g")
        .attr("class", "node node-clickable")
        .attr("data-id", d => d.data.id)
        .attr("transform", d => `translate(${d.x},${d.y})`)
        .on("click", function(event, d) {
          event.stopPropagation();
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
      node.append("image")
        .attr("href", d => {
          const baseUrl = d.data.img ? `img/${d.data.img}.svg` : "img/detail.svg";
          const cacheBuster = `?t=${Date.now()}`;
          return baseUrl.includes('?') ? `${baseUrl}&_cb=${Date.now()}` : `${baseUrl}${cacheBuster}`;
        })
        .attr("x", parseFloat(themeVars.getPropertyValue('--image-x')))
        .attr("y", parseFloat(themeVars.getPropertyValue('--image-y')))
        .attr("class", "image-base image-filter")
        .attr("width", parseFloat(themeVars.getPropertyValue('--image-width')))
        .attr("height", parseFloat(themeVars.getPropertyValue('--image-height')))
        .on("error", function() {
          const fallbackUrl = `img/detail.svg?t=${Date.now()}`;
          d3.select(this).attr("href", fallbackUrl);
        });
      const textGroup = node.append("g").attr("class", "text-group");
      textGroup.append("text")
        .attr("class", "label-id")
        .attr("x", parseFloat(themeVars.getPropertyValue('--label-id-x')))
        .attr("y", parseFloat(themeVars.getPropertyValue('--label-id-y')))
        .attr("dy", themeVars.getPropertyValue('--label-id-dy'))
        .attr("text-anchor", themeVars.getPropertyValue('--label-id-anchor'))
        .style("font-size", themeVars.getPropertyValue('--label-id-font-size'))
        .style("fill", themeVars.getPropertyValue('--label-id-text-color'))
        .text(d => d.data.id);
      const nameText = textGroup.append("text")
        .attr("class", "label-text")
        .attr("x", parseFloat(themeVars.getPropertyValue('--label-x')))
        .attr("y", parseFloat(themeVars.getPropertyValue('--label-y')))
        .attr("dy", themeVars.getPropertyValue('--label-dy'))
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
      setTimeout(() => {
        const bounds = treeGroup.node().getBBox();
        clusterGroups.push({
          group: treeGroup,
          width: bounds.width + 2 * clusterPaddingX,
          height: bounds.height + 2 * clusterPaddingY,
          innerWidth: bounds.width,
          innerHeight: bounds.height,
          paddingX: clusterPaddingX,
          paddingY: clusterPaddingY,
          id: root.data.id
        });
        if (clusterGroups.length === trees.length) {
          // Paso 2: Calcular cuadrícula óptima
          const marginX = 50, marginY = 50, spacingX = 60, spacingY = 60;
          // ===== Configuración global =====
          // 1. Valor por defecto
          let desiredGridCols = 4;

          // 2. Variable CSS (menor prioridad)
          const themeVarsGlobal = getComputedStyle(document.documentElement);
          const cssCols = parseInt(themeVarsGlobal.getPropertyValue('--cluster-grid-cols'));
          if (!Number.isNaN(cssCols) && cssCols > 0) {
            desiredGridCols = cssCols;
          }

          // 3. Atributo HTML en el contenedor (data-cluster-cols)
          const containerElem = document.querySelector('.xcanvas');
          if (containerElem) {
            const attrCols = parseInt(containerElem.getAttribute('data-cluster-cols'));
            if (!Number.isNaN(attrCols) && attrCols > 0) {
              desiredGridCols = attrCols;
            }
          }

          // 4. Configuración JS (window.$xDiagrams.options.clusterGridCols) – máxima prioridad
          const diagramOptions = getDiagramOptions();
          if (diagramOptions.clusterGridCols) {
            const optCols = parseInt(diagramOptions.clusterGridCols);
            if (!Number.isNaN(optCols) && optCols > 0) {
              desiredGridCols = optCols;
            }
          }

          // 5. Configuración específica del diagrama (propiedad "grid" en el objeto diagrama)
          const diagramsList = getDiagrams();
          if (Array.isArray(diagramsList) && window.$xDiagrams && typeof window.$xDiagrams.currentDiagramIdx === 'number') {
            const currentDiagramObj = diagramsList[window.$xDiagrams.currentDiagramIdx];
            if (currentDiagramObj && currentDiagramObj.grid) {
              const diagCols = parseInt(currentDiagramObj.grid);
              if (!Number.isNaN(diagCols) && diagCols > 0) {
                desiredGridCols = diagCols;
              }
            }
          }

          // ... existing code ...
          const maxCols = Math.floor((window.innerWidth - 2 * marginX) / (Math.max(...clusterGroups.map(c => c.width)) + spacingX));
          // Ya no limitamos por ancho de pantalla
          const cols = Math.max(1, Math.min(desiredGridCols, clusterGroups.length));
          const rows = Math.ceil(clusterGroups.length / cols);
          // Paso 3: Reposicionar clusters y dibujar fondo/título
          clusterGroups.forEach((c, i) => {
            const col = i % cols;
            const row = Math.floor(i / cols);
            let x = marginX + col * (c.width + spacingX) + c.width / 2;
            let y = marginY + row * (c.height + spacingY) + c.height / 2;
            // Si solo hay un cluster, centrarlo en la pantalla
            if (clusterGroups.length === 1) {
              x = window.innerWidth / 2;
              y = window.innerHeight / 2;
            }
            c.group.attr("transform", `translate(${x},${y})`);
            // Medir bounds en la nueva posición
            const bounds = c.group.node().getBBox();
            const paddingX = c.paddingX || 80;
            const paddingY = c.paddingY || 80;
            const minX = bounds.x - paddingX;
            const minY = bounds.y - paddingY - 30;
            const width = bounds.width + 2 * paddingX;
            const height = bounds.height + 2 * paddingY;
            // Fondo del cluster
            c.group.insert("rect", ":first-child")
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
            // Título del cluster
            c.group.append("text")
              .attr("class", "cluster-title")
              .attr("x", minX + 32)
              .attr("y", minY + 40)
              .attr("text-anchor", "start")
              .style("font-size", "1.5em")
              .style("font-weight", "bold")
              .style("fill", "var(--cluster-title-color, #222)")
              .text(c.id);
          });
          console.log('[Cluster Grid Layout] Rendered', clusterGroups.length, 'clusters in dynamic grid layout');
        }
      }, 0);
    } catch (err) {
      console.error(`Error al renderizar cluster ${index + 1}:`, err);
    }
  });
}

// Draw simplified trees
function drawTrees(trees) {
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
  console.log('[Keyboard Navigation] Stored', window.$xDiagrams.currentData.length, 'nodes for navigation');
  
  // Check layout type and choose appropriate rendering method
  if (isFlatList(trees)) {
    console.log('[Layout] Detected flat list, using cluster grid layout');
    drawClusterGrid(trees, svg);
  } else if (shouldUseClusterGrid(trees)) {
    console.log('[Layout] Detected multiple clusters, using cluster grid layout');
    drawClusterGrid(trees, svg);
  } else {
    console.log('[Layout] Detected single hierarchical tree, using traditional tree layout');
  
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
          .attr("d", d => `
            M ${d.source.x} ${d.source.y}
            V ${(d.source.y + d.target.y) / 2}
            H ${d.target.x}
            V ${d.target.y}
          `);

        // Render nodes
        const node = treeGroup.selectAll(".node")
          .data(root.descendants())
          .enter().append("g")
          .attr("class", "node node-clickable")
          .attr("data-id", d => d.data.id)
          .attr("transform", d => `translate(${d.x},${d.y})`)
          .on("click", function(event, d) {
            event.stopPropagation();
            
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

        // Node image
        node.append("image")
          .attr("href", d => {
            const baseUrl = d.data.img ? `img/${d.data.img}.svg` : "img/detail.svg";
            // Add cache buster to image URLs
            const cacheBuster = `?t=${Date.now()}`;
            return baseUrl.includes('?') ? `${baseUrl}&_cb=${Date.now()}` : `${baseUrl}${cacheBuster}`;
          })
          .attr("x", parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--image-x')))
          .attr("y", parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--image-y')))
          .attr("class", "image-base image-filter")
          .attr("width", parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--image-width')))
          .attr("height", parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--image-height')))
          .on("error", function() {
            const fallbackUrl = `img/detail.svg?t=${Date.now()}`;
            d3.select(this).attr("href", fallbackUrl);
          });

        // Node text
        const textGroup = node.append("g").attr("class", "text-group");
        
        // Node ID
        textGroup.append("text")
          .attr("class", "label-id")
          .attr("x", parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--label-id-x')))
          .attr("y", parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--label-id-y')))
          .attr("dy", getComputedStyle(document.documentElement).getPropertyValue('--label-id-dy'))
          .attr("text-anchor", getComputedStyle(document.documentElement).getPropertyValue('--label-id-anchor'))
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
  console.log('[Zoom] Aplicando zoom automático');
  
  const svg = d3.select("#main-diagram-svg");
  const g = svg.select("g");
  
  if (g.empty() || g.node().getBBox().width === 0) {
    console.warn("Contenido no listo para zoom automático");
    return;
  }

  const bounds = g.node().getBBox();
  const svgElement = document.getElementById('main-diagram-svg');
  const svgWidth = svgElement ? svgElement.clientWidth || svgElement.offsetWidth : window.innerWidth;
  const svgHeight = svgElement ? svgElement.clientHeight || svgElement.offsetHeight : window.innerHeight;

  if (!bounds.width || !bounds.height) {
    console.warn("Bounds inválidos para zoom automático");
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
  console.log('[Zoom] ¿Lista plana?', isFlatListDiagram);
  
  console.log('[Zoom] Diagramas:', diagramGroupCount, 'Nodos:', nodeCount, '¿Grupo único?', isSingleGroup);
  
  let scaleX = (svgWidth - 100) / totalBounds.width;
  let scaleY = (svgHeight - 100) / totalBounds.height;
  let scale = Math.min(scaleX, scaleY, 1);
  
  // Apply specific zoom based on diagram type
  if (isSingleGroup) {
    // For single cluster: zoom out to show entire cluster with aura
          scale = Math.min(scale * 0.6, 0.6); // More aggressive zoom out to show aura
    console.log('[Zoom] Aplicando zoom out para cluster único con aura. Scale:', scale);
      } else {
      // For multiple clusters: zoom out with factor 0.6
          scale = Math.min(scale * 0.6, 0.6); // Zoom out for multiple clusters
    console.log('[Zoom] Aplicando zoom out para múltiples clusters. Scale:', scale);
  }
  
  let translateX = svgCenterX - contentCenterX * scale;
  
  // Improve centering based on diagram type
  if (isSingleGroup) {
    // Perfect centering for single groups, without margin adjustments
    translateX = svgCenterX - contentCenterX * scale;
    console.log('[Zoom] Centrado perfecto para grupo único. translateX:', translateX);
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
        const flatLeftMargin = parseFloat(zoomVarsLeft.getPropertyValue('--flatlist-left-margin')) || 20; // px
        translateX = flatLeftMargin - firstClusterLeftEdge * scale;
        console.log('[Zoom] Margen izquierdo para lista plana:', flatLeftMargin, 'translateX:', translateX);
      } else {
        translateX = -150 - firstClusterLeftEdge * scale; // margen fijo para clusters jerárquicos
      }
      console.log('[Zoom] Primer cluster desde la izquierda con margen aplicado. translateX:', translateX);
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
    // Ajuste dinámico para múltiples clusters (evitar hueco arriba, configurable)
    translateY = svgCenterY - contentCenterY * scale;
    const zoomVars = getComputedStyle(document.documentElement);
    const desiredTopMargin = isFlatListDiagram ?
      (parseFloat(zoomVars.getPropertyValue('--flatlist-top-margin')) || 50) :
      (parseFloat(zoomVars.getPropertyValue('--cluster-top-margin')) || 10); // px
    const topEdge = totalBounds.y * scale + translateY; // posición Y del borde superior tras transform
    if (topEdge > desiredTopMargin) {
      translateY -= (topEdge - desiredTopMargin);
    }
  }

  // Apply transformation
  const transform = d3.zoomIdentity
    .translate(translateX, translateY)
    .scale(scale);

  svg.call(zoom.transform, transform);
  console.log('[Zoom] Zoom automático aplicado exitosamente');
  
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
    svg.call(zoom);
    svg.style('pointer-events', 'auto');
    
      // Store reference to current zoom for external access
  window.$xDiagrams.currentZoom = zoom;
  
  console.log('[Zoom] Zoom behavior aplicado');
  }
}

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
  const container = document.querySelector('.xcanvas');
  const targetParent = container || document.body;
  
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
  
  targetParent.appendChild(sidePanel);

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
    // Create thumbnail HTML
    const thumbnailHtml = `<img src="img/${nodeType}.svg" alt="${nodeType}" class="side-panel-title-thumbnail" onerror="this.src='img/detail.svg'">`;

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
    console.log('[Side Panel] Reinicializando tooltips después de generar contenido...');
    initializeCustomTooltips();
  }, 100);
  
  sidePanel.classList.add('open');
  
  // Trigger onNodeClick hook
  triggerHook('onNodeClick', { 
    node: nodeData, 
    timestamp: new Date().toISOString() 
  });
}

// Close side panel
function closeSidePanel() {
  const sidePanel = document.getElementById('side-panel');
  if (sidePanel) {
    d3.selectAll('.node.node-selected').classed('node-selected', false);
    sidePanel.classList.remove('open');
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
  
  // Show all available fields from the original CSV data
  Object.keys(dataToShow).forEach(key => {
    // Skip internal properties and name field (already shown in header)
    if (key === 'children' || key === 'parent' || key === 'originalData' || 
        key.toLowerCase() === 'name') return;
    
    const value = dataToShow[key] || '';
    const label = key; // Use the original column name from CSV
    
    // Check if the value is a URL
    const isUrlValue = isUrl(value);
    const displayValue = isUrlValue ? formatUrlForDisplay(value) : value;
    
    // Add title attribute for tooltip if text is long
    const labelTitle = label.length > 15 ? label : '';
    const valueTitle = (value && value.length > 20) ? value : '';
    
    // Debug: Log tooltip information
    if (labelTitle || valueTitle) {
      console.log(`[Tooltip Debug] Field: ${label}, Label title: ${labelTitle}, Value title: ${valueTitle}`);
    }
    
    // Always log for debugging
    console.log(`[Side Panel] Field: "${label}" (${label.length} chars), Value: "${value}" (${value ? value.length : 0} chars)`);
    
    html += `
      <div class="side-panel-field">
        <div class="side-panel-label" ${labelTitle ? `data-tooltip="${labelTitle}"` : ''}>${label}</div>
        <div class="side-panel-value ${!value ? 'empty' : ''}" ${valueTitle ? `data-tooltip="${valueTitle}"` : ''}>
          ${isUrlValue ? 
            `<a href="${displayValue}" target="_blank" rel="noreferrer" class="side-panel-url-link">Visit</a>` : 
            value || '-'
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
    if (!event.target.closest('.node')) {
      closeSidePanel();
    }
  }
}

// Simplified theme system
async function setTheme(themeId) {
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
  
  // Apply theme CSS variables
  const themeVariables = await getThemeVariables(themeId);
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

// Get theme variables from external JSON file
async function getThemeVariables(themeId) {
  // Return cached themes if available
  if (themesCache) {
    return themesCache[themeId] || themesCache.snow;
  }

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
    
    themesCache = await response.json();
    return themesCache[themeId] || themesCache.snow;
  } catch (error) {
    console.warn('Error loading themes from JSON, using fallback:', error);
    
    // Fallback to basic theme if JSON loading fails
    const fallbackThemes = {
      snow: {
        '--bg-color': '#f6f7f9',
        '--text-color': '#222',
        '--node-fill': '#fff',
        '--control-bg': '#ffffff',
        '--control-text': '#333333',
        '--control-focus': '#1976d2'
      },
      onyx: {
        '--bg-color': '#181c24',
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

// Update SVG colors
function updateSVGColors() {
  const computedStyle = getComputedStyle(document.documentElement);
  
  const variables = {
    textColor: computedStyle.getPropertyValue('--text-color'),
    nodeFill: computedStyle.getPropertyValue('--node-fill'),
    labelBorder: computedStyle.getPropertyValue('--label-border'),
    linkColor: computedStyle.getPropertyValue('--link-color'),
    clusterBg: computedStyle.getPropertyValue('--cluster-bg'),
    clusterStroke: computedStyle.getPropertyValue('--cluster-stroke'),
    clusterTitleColor: computedStyle.getPropertyValue('--cluster-title-color'),
    subtitleColor: computedStyle.getPropertyValue('--text-subtitle-color')
  };

  // Apply colors to SVG elements
  d3.selectAll('.link').style('stroke', variables.linkColor);
  d3.selectAll('.node rect').style('fill', variables.nodeFill).style('stroke', variables.labelBorder);
  d3.selectAll('.label-text').style('fill', variables.textColor);
  d3.selectAll('.subtitle-text').style('fill', variables.subtitleColor);
  d3.selectAll('.cluster-rect').style('fill', variables.clusterBg).style('stroke', variables.clusterStroke);
  d3.selectAll('.cluster-title').style('fill', variables.clusterTitleColor);
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
  console.log('[XTheme] Toggle de tema iniciado');
  
  const state = window.$xDiagrams.themeState;
  const currentTheme = state.current;
  const isCurrentLight = isLightTheme(currentTheme);
  const newTheme = isCurrentLight ? state.darkTheme : state.lightTheme;
  
  console.log('[XTheme] Tema actual:', currentTheme, '(es claro:', isCurrentLight, ')');
  console.log('[XTheme] Cambiando a:', newTheme);
  
  // Update state
  state.current = newTheme;
  
  // Save to localStorage FIRST (before applying theme)
  const storageKey = getStorageKey();
  localStorage.setItem(storageKey, newTheme);
  localStorage.setItem('selectedTheme', newTheme);
  localStorage.setItem('themeMode', isLightTheme(newTheme) ? 'light' : 'dark');
  
  console.log('[XTheme] Tema guardado en localStorage:', storageKey, 'y global');
  
  // Apply theme
  await setTheme(newTheme);
  
  // Verify the theme was saved correctly
  const savedTheme = localStorage.getItem(storageKey);
  console.log('[XTheme] Verificación - Tema guardado:', savedTheme);
  
  // Trigger hook
  triggerHook('onThemeChange', { 
    theme: newTheme, 
    timestamp: new Date().toISOString() 
  });
  
  console.log('[XTheme] Tema cambiado exitosamente a:', newTheme);
}

// Initialize theme system (SIMPLIFIED - NO INTERFERENCE WITH LOADER)
async function initializeThemeSystem() {
  console.log('[XTheme] Iniciando sistema de temas (solo toggle)...');
  
  const config = getThemeConfiguration();
  const storageKey = getStorageKey();
  
  // Initialize global state
  window.$xDiagrams.themeState.lightTheme = config.lightTheme;
  window.$xDiagrams.themeState.darkTheme = config.darkTheme;
  
  // Get current theme from localStorage (loader already applied it)
  const savedTheme = localStorage.getItem(storageKey);
  const currentTheme = savedTheme || config.lightTheme;
  
  console.log('[XTheme] Configuración:', config);
  console.log('[XTheme] Tema actual:', currentTheme);
  
  // Update state
  window.$xDiagrams.themeState.current = currentTheme;
  
  // Don't reapply theme - loader already did it
  console.log('[XTheme] Tema ya aplicado por loader, solo configurando toggle');
  
  // Setup theme toggle
  setupThemeToggle();
  
  window.$xDiagrams.themeState.isInitialized = true;
  console.log('[XTheme] Sistema de temas inicializado correctamente');
}

// Setup theme toggle button
function setupThemeToggle() {
  console.log('[XTheme] Configurando botón de tema...');
  
  const themeToggle = document.getElementById('theme-toggle');
  if (!themeToggle) {
    console.warn('[XTheme] Botón de tema no encontrado');
    return;
  }
  
  console.log('[XTheme] Botón de tema encontrado, configurando...');
  
  // Remove existing listeners by cloning
  const newToggle = themeToggle.cloneNode(true);
  themeToggle.parentNode.replaceChild(newToggle, themeToggle);
  
  // Add new listener
  newToggle.addEventListener('click', async function(e) {
    e.preventDefault();
    e.stopPropagation();
    console.log('[XTheme] Click en botón de tema detectado');
    await toggleTheme();
  });
  
  console.log('[XTheme] Botón de tema configurado correctamente');
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
    console.log('[Keyboard Navigation] System initialized');
  },
  
  // Setup keyboard event listeners
  setupKeyboardListeners: function() {
    document.addEventListener('keydown', (e) => {
      if (!this.isEnabled) return;
      
      switch(e.key) {
        case 'ArrowUp':
          e.preventDefault();
          this.navigateToParent();
          break;
        case 'ArrowDown':
          e.preventDefault();
          this.navigateToFirstChild();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          this.navigateToPreviousSibling();
          break;
        case 'ArrowRight':
          e.preventDefault();
          this.navigateToNextSibling();
          break;
        case 'Tab':
          e.preventDefault();
          if (e.shiftKey) {
            this.navigateToPreviousSequential();
          } else {
            this.navigateToNextSequential();
          }
          break;
        case 'Home':
          e.preventDefault();
          this.navigateToFirst();
          break;
        case 'End':
          e.preventDefault();
          this.navigateToLast();
          break;
        case 'Escape':
          e.preventDefault();
          this.clearSelection();
          break;
        case ' ':
        case 'Enter':
          e.preventDefault();
          this.openCurrentNodeLink();
          break;
      }
    });
  },
  
  // Update the list of all nodes
  updateNodesList: function() {
    this.allNodes = Array.from(document.querySelectorAll('.node'));
    console.log('[Keyboard Navigation] Updated nodes list:', this.allNodes.length, 'nodes');
  },
  
  // Enable keyboard navigation
  enable: function() {
    this.isEnabled = true;
    this.updateNodesList();
    console.log('[Keyboard Navigation] Enabled');
  },
  
  // Disable keyboard navigation
  disable: function() {
    this.isEnabled = false;
    this.currentNodeIndex = -1;
    console.log('[Keyboard Navigation] Disabled');
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
      
      console.log('[Keyboard Navigation] Selected node:', index, nodeData?.name || 'Unknown');
    }
  },
  
  // Clear current selection
  clearSelection: function() {
    document.querySelectorAll('.node-selected').forEach(node => {
      node.classList.remove('node-selected');
    });
    this.currentNodeIndex = -1;
    closeSidePanel();
    console.log('[Keyboard Navigation] Selection cleared');
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
      console.log('[Keyboard Navigation] No node selected to open link');
      return;
    }
    
    const currentNode = this.allNodes[this.currentNodeIndex];
    const nodeData = this.getNodeData(currentNode);
    
    if (!nodeData) {
      console.log('[Keyboard Navigation] No data found for selected node');
      return;
    }
    
    // Get the URL from the node data
    const url = nodeData.url;
    
    if (!url) {
      console.log('[Keyboard Navigation] No URL found for node:', nodeData.name);
      return;
    }
    
    // Validate URL format
    if (!isUrl(url)) {
      console.log('[Keyboard Navigation] Invalid URL format:', url);
      return;
    }
    
    // Open URL in new tab with security attributes
    if (openUrlSecurely(url)) {
      console.log('[Keyboard Navigation] Opened link for node:', nodeData.name, 'URL:', url);
    } else {
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
window.$xDiagrams.updateTopbarTitle = function(diagramIndex) {
    // Title is now fixed and doesn't change based on diagram selection
    // The title is set once during initialization and remains constant
    const titleElement = document.querySelector('.diagram-title');
    if (!titleElement) {
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
        
        // Find the topbar and update its title
        const topbarCenter = document.querySelector('.topbar-center');
        if (topbarCenter) {
            const newTitleElement = document.createElement('h1');
            newTitleElement.className = 'diagram-title';
            newTitleElement.textContent = fixedTitle;
            topbarCenter.innerHTML = '';
            topbarCenter.appendChild(newTitleElement);
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
                window.$xDiagrams.updateTopbarTitle(idx);
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
    if (currentDiagram && currentDiagram.file && currentDiagram.file.includes('docs.google.com/spreadsheets') && currentDiagram.edit) {
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
    
    // Add cache refresh button SOLO para diagramas que se cargan desde una API REST
    if (currentDiagram && (currentDiagram.url || currentDiagram.file) && typeof isRestApiEndpoint === 'function' && isRestApiEndpoint(currentDiagram.url || currentDiagram.file)) {
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
                console.log('🗑️ Cache cleared for:', diagramUrl);
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
    // - Si tiene url, pásale la url
    // - Si tiene file, pásale la file (compatibilidad)
    let toInit = diagramToLoad;
    if (diagramToLoad.data) {
        toInit = diagramToLoad;
        console.log('🔍 Pasando objeto con data a initDiagram');
    } else if (diagramToLoad.url) {
        toInit = diagramToLoad.url;
        console.log('🔍 Pasando URL a initDiagram:', diagramToLoad.url);
    } else if (diagramToLoad.file) {
        toInit = diagramToLoad.file;
        console.log('🔍 Pasando file a initDiagram:', diagramToLoad.file);
    } else {
        console.log('⚠️ No se encontró data, url o file en el diagrama:', diagramToLoad);
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
        });
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
    
    // Get fixed title from $xDiagrams object first, then fallback to HTML
    let fixedTitle = window.$xDiagrams && window.$xDiagrams.title ? window.$xDiagrams.title : null;
    
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
    
    container.innerHTML = `
      <div class="topbar">
        <div class="topbar-left">
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
        <div class="topbar-center">
          <h1 class="diagram-title">${fixedTitle}</h1>
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
          <img src="img/document.svg" alt="Documento" width="48" height="48">
        </span>
        <div class="text">Suelta tu archivo CSV aquí</div>
        <div class="subtext">o arrastra desde tu computadora</div>
      </div>
      <div class="drag-overlay" id="dragOverlay">
        <div class="drag-message">
          <span class="icon">
            <img src="img/document.svg" alt="Documento" width="48" height="48">
          </span>
          <div>Suelta para cargar el archivo</div>
        </div>
      </div>
      ${dragDropElements}
    `;
    document.body.appendChild(container);
  }
  // Initialize theme system after base structure is rendered
  console.log('[Base Render] Inicializando sistema de temas...');
  initializeThemeSystem().then(() => {
    console.log('[Base Render] Sistema de temas inicializado correctamente');
    
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
      window.$xDiagrams.updateTopbarTitle(window.$xDiagrams.currentDiagramIdx);
      window.$xDiagrams.renderDiagramButtons();
      if (diagrams[window.$xDiagrams.currentDiagramIdx]) {
        window.$xDiagrams.loadDiagram(diagrams[window.$xDiagrams.currentDiagramIdx]);
      }
    }
}

// Call base rendering function when library loads
function initializeWhenReady() {
  // Wait for diagrams to be defined
  const diagrams = getDiagrams();
  if (diagrams && Array.isArray(diagrams)) {
    renderSwDiagramBase();
    
    // Initialize theme system after base structure is rendered
    if (window.$xDiagrams.themeState && !window.$xDiagrams.themeState.isInitialized) {
      initializeThemeSystem();
    }
    
    // Initialize drag & drop if enabled
    if (isOptionEnabled('dragAndDrop')) {
      console.log('[Initialize] Inicializando drag & drop...');
      setTimeout(() => {
        initDragAndDropDelayed();
      }, 200);
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
    console.log('🗑️ Cache cleared for:', url);
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
    console.log('🔄 Cache cleared, next load will fetch fresh data for:', url);
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
            window.$xDiagrams.updateTopbarTitle(lastIndex);
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

// Debug function to check theme state
window.debugThemeState = function() {
  console.log('[XTheme Debug] === ESTADO ACTUAL DEL TEMA ===');
  const state = window.$xDiagrams.themeState;
  const storageKey = getStorageKey();
  const storedTheme = localStorage.getItem(storageKey);
  const globalTheme = localStorage.getItem('selectedTheme');
  const themeMode = localStorage.getItem('themeMode');
  const bodyClasses = document.body.className;
  const config = getThemeConfiguration();
  
  console.log('[XTheme Debug] Estado global:', state);
  console.log('[XTheme Debug] Clave de almacenamiento:', storageKey);
  console.log('[XTheme Debug] Tema en localStorage (específico):', storedTheme);
  console.log('[XTheme Debug] Tema en localStorage (global):', globalTheme);
  console.log('[XTheme Debug] Modo de tema:', themeMode);
  console.log('[XTheme Debug] Clases del body:', bodyClasses);
  console.log('[XTheme Debug] Configuración:', config);
  
  // Check if theme is properly applied
  const expectedClass = storedTheme ? `theme-${storedTheme}` : 'theme-snow';
  const isThemeApplied = bodyClasses.includes(expectedClass);
  console.log('[XTheme Debug] Tema aplicado correctamente:', isThemeApplied, '(esperado:', expectedClass, ')');
  
  // Check for inconsistencies
  if (storedTheme && globalTheme && storedTheme !== globalTheme) {
    console.log('[XTheme Debug] ⚠️ INCONSISTENCIA: Tema específico y global son diferentes');
  }
  
  // Check all localStorage items for debugging
  console.log('[XTheme Debug] Todos los items en localStorage:');
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const value = localStorage.getItem(key);
    console.log(`[XTheme Debug] ${key}: ${value}`);
  }
  
  console.log('[XTheme Debug] === FIN DEL ESTADO ===');
};

// Test function to manually trigger theme toggle
window.testXThemeToggle = async function() {
  console.log('[XTheme Test] Probando toggle de tema manualmente...');
  if (window.$xDiagrams.themeState && window.$xDiagrams.themeState.isInitialized) {
    await toggleTheme();
    console.log('[XTheme Test] Toggle completado');
  } else {
    console.warn('[XTheme Test] Sistema de temas no inicializado');
  }
};

// Function to clear theme localStorage and reset
window.clearThemeStorage = function() {
  console.log('[XTheme Clear] Limpiando localStorage de temas...');
  
  // Clear all theme-related keys
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.startsWith('selectedTheme_') || 
                key.startsWith('themeSystemInitialized_') ||
                key === 'selectedTheme' ||
                key === 'theme' ||
                key === 'themeMode')) {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    console.log('[XTheme Clear] Removido:', key);
  });
  
  console.log('[XTheme Clear] localStorage limpiado. Recarga la página para probar.');
};

// Function to clear only global theme preferences
window.clearGlobalThemePreferences = function() {
  console.log('[XTheme Clear] Limpiando solo preferencias globales...');
  
  const globalKeys = ['selectedTheme', 'theme', 'themeMode'];
  globalKeys.forEach(key => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key);
      console.log('[XTheme Clear] Removida preferencia global:', key);
    }
  });
  
  console.log('[XTheme Clear] Preferencias globales limpiadas. Cada archivo mantendrá su tema específico.');
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
    console.log('[XTheme Load Check] ⚠️ PROBLEMA: Debería ser oscuro pero no está aplicado');
    forceDarkTheme();
  } else if (!shouldBeDark && isDarkApplied) {
    console.log('[XTheme Load Check] ⚠️ PROBLEMA: No debería ser oscuro pero está aplicado');
  } else {
    console.log('[XTheme Load Check] ✅ Estado correcto');
  }
  
  console.log('[XTheme Load Check] === FIN DE VERIFICACIÓN ===');
};

// Function to check if theme toggle button exists
window.checkThemeToggleButton = function() {
  console.log('[XTheme Check] Verificando botón de tema...');
  
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    console.log('[XTheme Check] ✅ Botón de tema encontrado:', themeToggle);
    console.log('[XTheme Check] Clases del botón:', themeToggle.className);
    console.log('[XTheme Check] HTML del botón:', themeToggle.outerHTML);
    
    // Check if it has event listeners
    const clone = themeToggle.cloneNode(true);
    console.log('[XTheme Check] Botón clonado para verificar listeners');
    
    return true;
  } else {
    console.log('[XTheme Check] ❌ Botón de tema NO encontrado');
    console.log('[XTheme Check] Elementos con ID theme-toggle:', document.querySelectorAll('#theme-toggle'));
    console.log('[XTheme Check] Elementos con clase theme-toggle:', document.querySelectorAll('.theme-toggle'));
    return false;
  }
};

// Function to check URL parameters
window.checkURLParameters = function() {
  console.log('[URL Debug] === PARÁMETROS DE URL ===');
  console.log('[URL Debug] URL actual:', window.location.href);
  console.log('[URL Debug] Search params:', window.location.search);
  
  const urlParams = new URLSearchParams(window.location.search);
  console.log('[URL Debug] Parámetros encontrados:');
  
  for (const [key, value] of urlParams.entries()) {
    console.log(`[URL Debug] ${key}: ${value}`);
  }
  
  // Check if there are any unexpected parameters
  const expectedParams = ['d'];
  const unexpectedParams = [];
  
  for (const [key, value] of urlParams.entries()) {
    if (!expectedParams.includes(key)) {
      unexpectedParams.push({ key, value });
    }
  }
  
  if (unexpectedParams.length > 0) {
    console.log('[URL Debug] ⚠️ Parámetros inesperados encontrados:', unexpectedParams);
  } else {
    console.log('[URL Debug] ✅ Solo parámetros esperados encontrados');
  }
  
  console.log('[URL Debug] === FIN DE PARÁMETROS ===');
};

// Function to clean unexpected URL parameters
window.cleanURLParameters = function() {
  console.log('[URL Clean] Limpiando parámetros inesperados de la URL...');
  
  const url = new URL(window.location);
  const urlParams = new URLSearchParams(url.search);
  const expectedParams = ['d'];
  let cleaned = false;
  
  // Remove unexpected parameters
  for (const [key, value] of urlParams.entries()) {
    if (!expectedParams.includes(key)) {
      urlParams.delete(key);
      console.log(`[URL Clean] Removido parámetro: ${key}=${value}`);
      cleaned = true;
    }
  }
  
  if (cleaned) {
    // Update URL without the unexpected parameters
    url.search = urlParams.toString();
    window.history.replaceState({}, '', url);
    console.log('[URL Clean] URL limpiada:', window.location.href);
  } else {
    console.log('[URL Clean] No se encontraron parámetros inesperados');
  }
};

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
    <h3>⌨️ Navegación por teclado</h3>
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
  window.initDiagram(fallbackFile, onComplete, 0); // Reset retry count for fallback
  
  return true;
};

// Custom tooltip system
function initializeCustomTooltips() {
  console.log('[Tooltip System] Inicializando sistema de tooltips personalizados...');
  
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
  console.log('[Tooltip System] Elemento tooltip creado y agregado al DOM');
  
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

// Reemplazar alert en carga múltiple de archivos
// Busca y reemplaza en la función de feedback de carga múltiple:
// alert(msg) => showToast(msg, tipo)
// Determina tipo:
// - Si todos exitosos: 'success'
// - Si todos fallaron: 'error'
// - Si mixto: 'mixed'
// ... código posterior ...

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
function detectAndLoadDataSource(source, onComplete, retryCount = 0) {
  console.log("🔍 Detectando tipo de fuente de datos:", source);
  
  // Case 1: Object with data (already processed)
  if (source && typeof source === 'object' && source.data) {
            console.log("Fuente detectada: Datos pre-procesados");
    return loadFromObject(source, onComplete);
  }
  
  // Case 2: String URL - detect type
  if (typeof source === 'string') {
    const url = source.trim();
    
    // Check if it's a REST API endpoint
    if (isRestApiEndpoint(url)) {
      console.log("🌐 Fuente detectada: API REST");
      return loadFromRestApi(url, onComplete, retryCount);
    }
    
    // Check if it's a CSV URL
    if (isCsvUrl(url)) {
      console.log("📄 Fuente detectada: URL CSV");
      return loadFromCsvUrl(url, onComplete, retryCount);
    }
    
    // Default: treat as CSV URL
    console.log("📄 Fuente detectada: URL (tratada como CSV)");
    return loadFromCsvUrl(url, onComplete, retryCount);
  }
  
  // Case 3: Invalid source
  console.log("❌ Fuente de datos inválida");
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
  
  const isRest = restPatterns.some(pattern => pattern.test(url));
  console.log('🔍 [Cache] Checking if URL is REST API:', url, '→', isRest);
  
  // Debug: show which pattern matched
  if (isRest) {
    const matchedPattern = restPatterns.find(pattern => pattern.test(url));
    console.log('🔍 [Cache] Matched pattern:', matchedPattern);
  }
  
  return isRest;
}

// Check if URL is a CSV file
function isCsvUrl(url) {
  return /\.csv$/i.test(url) || 
         /output=csv/i.test(url) || 
         /google\.com\/spreadsheets/i.test(url);
}

// Load data from REST API (now uses intelligent caching)
function loadFromRestApi(apiUrl, onComplete, retryCount = 0) {
  // Use the enhanced version with caching
  loadFromRestApiWithCache(apiUrl, onComplete, retryCount);
}

// Load data from CSV URL (existing functionality)
function loadFromCsvUrl(csvUrl, onComplete, retryCount = 0) {
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
        const trees = buildHierarchies(results.data);
        drawTrees(trees);
        
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
          loadFromCsvUrl(csvUrl, onComplete, retryCount + 1);
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

// Load data from object (existing functionality)
function loadFromObject(diagramObject, onComplete) {
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
    
    const trees = buildHierarchies(diagramObject.data);
    drawTrees(trees);
    
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
  console.log("🔄 Convirtiendo JSON a formato CSV:", jsonData);
  
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
    console.warn("⚠️ Formato JSON no reconocido:", jsonData);
    return [];
  }
  
  console.log("✅ Datos convertidos:", dataArray.length, "registros");
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
    console.log('🔑 [Cache] Generated key for URL:', url, '→', key);
    return key;
  },

  // Get cached data
  get: function(url) {
    try {
      const key = this.getCacheKey(url);
      console.log('🔍 [Cache] Looking for key:', key);
      const cached = localStorage.getItem(key);
      console.log('🔍 [Cache] Raw cached data:', cached ? 'EXISTS' : 'NULL');
      
      if (!cached) {
        console.log('📦 [Cache] No cached data found for:', url);
        return null;
      }

      const data = JSON.parse(cached);
      
      // Check if cache is expired
      if (data.expires && Date.now() > data.expires) {
        console.log('📦 [Cache] Cache expired for:', url);
        localStorage.removeItem(key);
        return null;
      }

      // Check cache version
      const config = getCacheConfig();
      if (data.version !== config.version) {
        console.log('📦 [Cache] Cache version mismatch, clearing:', url);
        localStorage.removeItem(key);
        return null;
      }

      console.log('📦 [Cache] Using cached data for:', url);
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
        console.log('📦 [Cache] Cache size limit reached, cleaning old entries');
        this.cleanup();
      }

      localStorage.setItem(key, JSON.stringify(cacheData));
      console.log('📦 [Cache] Data cached for:', url);
      
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
        console.log('📦 [Cache] Cleaned up', toRemove.length, 'old entries');
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
      console.error('📦 [Cache] Error updating stats:', error);
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
    // Only cache REST API URLs
    const shouldCache = isRestApiEndpoint(url);
    console.log('🔍 [Cache] shouldCache check for:', url, '→', shouldCache);
    return shouldCache;
  }
};

// Debug commands for console
window.cacheDebug = {
  // Show cache status
  status: function() {
    const keys = Object.keys(localStorage);
    const cacheKeys = keys.filter(key => key.startsWith('xdiagrams_cache_'));
            console.log('Cache Status:');
    console.log('- Total entries:', cacheKeys.length);
    console.log('- Cache keys:', cacheKeys);
    
    if (cacheKeys.length > 0) {
      console.log('\n📋 Cache Details:');
      cacheKeys.forEach(key => {
        try {
          const data = JSON.parse(localStorage.getItem(key));
          const age = Math.floor((Date.now() - data.timestamp) / 1000);
          const expires = Math.floor((data.expires - Date.now()) / 1000);
          console.log(`- ${key}: age=${age}s, expires=${expires}s, version=${data.version}`);
        } catch (e) {
          console.log(`- ${key}: ERROR parsing`);
        }
      });
    }
  },
  
  // Test cache for specific URL
  test: function(url) {
    console.log('🧪 Testing cache for URL:', url);
    const key = CacheManager.getCacheKey(url);
    console.log('🔑 Generated key:', key);
    const cached = localStorage.getItem(key);
    console.log('📦 Raw cached data:', cached ? 'EXISTS' : 'NULL');
    
    if (cached) {
      try {
        const data = JSON.parse(cached);
        console.log('📦 Parsed data:', data);
        return data;
      } catch (e) {
        console.log('❌ Error parsing cache data:', e);
        return null;
      }
    }
    return null;
  },
  
  // Clear all cache
  clear: function() {
    const keys = Object.keys(localStorage);
    const cacheKeys = keys.filter(key => key.startsWith('xdiagrams_cache_'));
    cacheKeys.forEach(key => localStorage.removeItem(key));
    console.log('🗑️ All cache cleared');
  },
  
  // Show cache content
  content: function() {
    const keys = Object.keys(localStorage);
    const cacheKeys = keys.filter(key => key.startsWith('xdiagrams_cache_'));
    
    console.log('📦 Cache Content:');
    cacheKeys.forEach(key => {
      try {
        const data = JSON.parse(localStorage.getItem(key));
        console.log(`\n🔑 Key: ${key}`);
        console.log('📄 Data:', data);
      } catch (e) {
        console.log(`\n🔑 Key: ${key}`);
        console.log('❌ Error:', e.message);
      }
    });
  }
};

// Enhanced loadFromRestApi with intelligent caching
function loadFromRestApiWithCache(apiUrl, onComplete, retryCount = 0) {
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
        const trees = buildHierarchies(cachedData);
        drawTrees(trees);
        
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
      const trees = buildHierarchies(csvData);
      drawTrees(trees);
      
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