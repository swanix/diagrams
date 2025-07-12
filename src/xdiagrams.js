// Swanix Diagrams - JS
// v0.3.0

// Global zoom behavior - defined at the beginning to avoid scope issues
const zoom = d3.zoom()
  .scaleExtent([0.1, 4])
  .on("zoom", event => {
    d3.select("#main-diagram-svg g").attr("transform", event.transform);
  });

// Main function to initialize diagram
function initDiagram(csvUrl, onComplete, retryCount = 0) {
  console.log("Iniciando carga del diagrama...", retryCount > 0 ? `(intento ${retryCount + 1})` : '');
  
  const loadingElement = document.querySelector("#loading");
  const errorElement = document.querySelector("#error-message");
  
  if (loadingElement) loadingElement.style.display = "block";
  if (errorElement) errorElement.style.display = "none";

  // Check if this is a local diagram (with data instead of URL)
  if (csvUrl && typeof csvUrl === 'object' && csvUrl.data) {
    console.log("Cargando diagrama local:", csvUrl.name);
    
    try {
      const trees = buildHierarchies(csvUrl.data);
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
      
      console.log("Diagrama local cargado completamente");
      
      // Trigger onLoad hook
      triggerHook('onLoad', { 
        name: csvUrl.name,
        data: csvUrl.data, 
        trees: trees,
        isLocal: true,
        timestamp: new Date().toISOString()
      });
      
      if (onComplete && typeof onComplete === 'function') {
        onComplete();
      }
    } catch (error) {
      console.error("Error durante la inicialización del diagrama local:", error);
      if (errorElement) errorElement.innerText = `Error: ${error.message}`;
      if (loadingElement) loadingElement.style.display = "none";
      
      if (onComplete && typeof onComplete === 'function') {
        onComplete();
      }
    }
    return;
  }

  // Handle remote URLs (original functionality)
  // Add cache-busting parameter to force fresh data
  const cacheBuster = `?t=${Date.now()}`;
  const urlWithCacheBuster = typeof csvUrl === 'string' && csvUrl.includes('?') ? `${csvUrl}&_cb=${Date.now()}` : `${csvUrl}${cacheBuster}`;
  
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
        
        console.log("Diagrama cargado completamente");
        
        // Trigger onLoad hook
        triggerHook('onLoad', { 
          url: csvUrl, 
          data: results.data, 
          trees: trees,
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
          initDiagram(csvUrl, onComplete, retryCount + 1);
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
    responsive: true          // Responsive design enabled by default
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



    // Skip nodes without essential data (id or name)
    if (!id || !name || id.trim() === "" || name.trim() === "") {
      console.log('[CSV Processing] Skipping node without essential data:', { id, name });
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

// Draw simplified trees
function drawTrees(trees) {
  const svg = document.getElementById("main-diagram-svg");
  if (!svg) {
    console.error("No se encontró el SVG principal");
    return;
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
  
  try {
    const g = d3.select(svg).append("g");
    let xOffset = 150;
    const clusters = [];

    // Get spacing variables from theme (CSS)
    const themeVars = getComputedStyle(document.documentElement);
    const clusterSpacing = parseFloat(themeVars.getPropertyValue('--cluster-spacing')) || 120;

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
      
      // Position first cluster from the left with negative margin
      const firstClusterLeftEdge = firstClusterBounds.x + firstClusterOffsetX;
              translateX = -150 - firstClusterLeftEdge * scale; // -150px margin from the left
      console.log('[Zoom] Primer cluster desde la izquierda con margen negativo. translateX:', translateX);
          } else {
        // Fallback to original logic
      const leftEdge = totalBounds.x * scale + translateX;
      if (leftEdge > 300) {
        translateX -= (leftEdge - 300);
      }
    }
  }
  
  const translateY = svgCenterY - contentCenterY * scale - 50;

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
      // No parent found, wrap around to the root node (level 0)
      this.navigateToRootNode();
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
        // No children found, try to go to first node of next level
        const currentLevel = this.getNodeLevel(nodeData);
        const nextLevelResult = this.navigateToFirstNodeOfNextLevel(currentLevel);
        
        // If no next level found, wrap around to the first node of the diagram
        if (!nextLevelResult) {
          this.navigateToFirst();
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
        dropdownText.textContent = diagrams[window.$xDiagrams.currentDiagramIdx].name;
    }
    
    diagrams.forEach((d, idx) => {
        const link = document.createElement('a');
        link.href = `?d=${idx}`;
        link.className = 'switcher-btn' + (idx === window.$xDiagrams.currentDiagramIdx ? ' active' : '');
        link.textContent = d.name;
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
                
                // Clear cache before switching diagrams (only for remote URLs)
                if (window.$xDiagrams.clearCache && typeof d.url === 'string') {
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

    window.$xDiagrams.isLoading = true;

    // Lógica robusta para soportar string, objeto con url, objeto con data
    let diagramToLoad = input;
    if (typeof input === 'string') {
        // Buscar el objeto diagrama si existe
        diagramToLoad = diagrams.find(d => d.url === input) || { url: input };
        window.$xDiagrams.currentUrl = input;
    } else if (typeof input === 'object' && input !== null) {
        if (input.data) {
            // Es un objeto local (drag & drop)
            diagramToLoad = input;
            window.$xDiagrams.currentUrl = input.url || null;
        } else if (input.url) {
            // Es un objeto con url (local o remota)
            diagramToLoad = input;
            window.$xDiagrams.currentUrl = input.url;
        }
    }

    // Limpia el cache solo si es una URL remota
    if (diagramToLoad.url && typeof diagramToLoad.url === 'string') {
        window.$xDiagrams.clearCache();
    }

    // Decide qué pasar a initDiagram:
    // - Si tiene data, pásalo directo
    // - Si tiene url, pásale la url
    let toInit = diagramToLoad;
    if (diagramToLoad.data) {
        toInit = diagramToLoad;
    } else if (diagramToLoad.url) {
        toInit = diagramToLoad.url;
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
    
    // Clear any stored data in localStorage that might be causing issues
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('diagram') || key.includes('cache') || key.includes('data'))) {
            keysToRemove.push(key);
        }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    console.log('[Cache] Cache cleared and images refreshed');
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

// Function to find diagram by URL and get its fallbacks
window.findDiagramByUrl = function(url) {
  const diagrams = getDiagrams();
  if (!diagrams) {
    return null;
  }
  
  return diagrams.find(diagram => diagram.url === url);
};

// Function to try fallback URLs from diagram definition
window.tryDiagramFallbacks = function(originalUrl, onComplete, retryCount = 0) {
  const diagram = window.findDiagramByUrl(originalUrl);
  
  if (!diagram || !diagram.fallbacks || !Array.isArray(diagram.fallbacks)) {
    console.log('[Fallback] No fallbacks defined for this diagram');
    return false;
  }
  
  if (retryCount >= diagram.fallbacks.length) {
    console.error('[Fallback] No more fallback URLs available');
    return false;
  }
  
  const fallbackUrl = diagram.fallbacks[retryCount];
  console.log(`[Fallback] Trying fallback URL ${retryCount + 1}:`, fallbackUrl);
  
  // Try the fallback URL with error handling
  window.initDiagram(fallbackUrl, onComplete, 0); // Reset retry count for fallback
  
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