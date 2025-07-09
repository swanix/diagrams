// SW Diagrams - Clean and Simplified Version

// Global zoom behavior - defined at the beginning to avoid scope issues
const zoom = d3.zoom()
  .scaleExtent([0.1, 4])
  .on("zoom", event => {
    d3.select("#main-diagram-svg g").attr("transform", event.transform);
  });

// Main function to initialize diagram
function initDiagram(csvUrl, onComplete) {
  console.log("Iniciando carga del diagrama...");
  
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
        createSidePanel();
        
        // Preserve current theme after loading diagram
        setTimeout(() => {
          if (window.preserveCurrentTheme) {
            window.preserveCurrentTheme();
          }
        }, 100);
        
        console.log("Diagrama cargado completamente");
        
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
      if (errorElement) errorElement.innerText = `Error CSV: ${err.message}`;
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

// Get column configuration from HTML attributes
function getColumnConfiguration() {
  const container = document.querySelector('.sw-diagram-container');
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
    // Use custom column configuration with fallbacks
    let id = getColumnValue(d, columnConfig.id, "");
    let name = getColumnValue(d, columnConfig.name, "Nodo sin nombre");
    let subtitle = getColumnValue(d, columnConfig.subtitle, "");
    let img = getColumnValue(d, columnConfig.img, "");
    let parent = getColumnValue(d, columnConfig.parent, "");
    let url = getColumnValue(d, columnConfig.url, "");
    let type = getColumnValue(d, columnConfig.type, "");

    let node = { id, name, subtitle, img, url, type, children: [], parent: parent };
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
            if (window.openSidePanel) {
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
        wrap(nameText, 80);

        // Node subtitle
        if (data.subtitle) {
          textGroup.append("text")
            .attr("class", "subtitle-text")
            .attr("transform", "rotate(270)") // Rotate text 90 degrees for vertical position
            .attr("x", parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--subtitle-x')))
            .attr("y", parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--subtitle-y')))
            .attr("text-anchor", getComputedStyle(document.documentElement).getPropertyValue('--subtitle-anchor'))
            .style("font-size", getComputedStyle(document.documentElement).getPropertyValue('--subtitle-font-size'))
            .style("fill", getComputedStyle(document.documentElement).getPropertyValue('--text-subtitle-color'))
            .text(d => d.data.subtitle);
        }

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
              
              treeGroup.append("text")
                .attr("class", "cluster-title")
                .attr("x", minX + 32)
                .attr("y", minY + 40)
                .attr("text-anchor", "start")
                .style("font-size", "1.5em")
                .style("font-weight", "bold")
                .style("fill", "var(--cluster-title-color, #fff)")
                .text(root.data.name);
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
  setTimeout(() => {
    if (window.preserveCurrentTheme) {
      window.preserveCurrentTheme();
    }
  }, 100);
}

// Apply zoom behavior
function ensureZoomBehavior() {
  const svg = d3.select("#main-diagram-svg");
  if (!svg.empty()) {
    svg.call(zoom);
    svg.style('pointer-events', 'auto');
    console.log('[Zoom] Zoom behavior aplicado');
  }
}

// Function to wrap text
function wrap(text, width) {
  const lineHeight = 1.5;

  text.each(function() {
    const textElement = d3.select(this);
    const words = textElement.text().split(/\s+/).reverse();
    let word;
    let line = [];
    let lineNumber = 0;
    const dy = parseFloat(textElement.attr("dy")) || 0;
    let tspan = textElement.text(null).append("tspan")
        .attr("x", getComputedStyle(document.documentElement).getPropertyValue('--label-x'))
        .attr("y", getComputedStyle(document.documentElement).getPropertyValue('--label-y'))
        .attr("dy", dy + "em")
        .attr("text-anchor", "middle");

    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = textElement.append("tspan")
          .attr("x", getComputedStyle(document.documentElement).getPropertyValue('--label-x'))
          .attr("dy", `${lineHeight}em`)
          .attr("text-anchor", "middle")
          .text(word);
        lineNumber++;
      }
    }

    if (lineNumber === 0) {
      tspan.attr("dy", getComputedStyle(document.documentElement).getPropertyValue('--label-dy-single'));
    }
  });
}

// Simplified side panel
function createSidePanel() {
  const container = document.querySelector('.sw-diagram-container');
  const targetParent = container || document.body;
  
  const sidePanel = document.createElement('div');
  sidePanel.className = 'side-panel';
  sidePanel.id = 'side-panel';
  
  sidePanel.innerHTML = `
    <div class="side-panel-header">
      <h3 class="side-panel-title">Detalles del Nodo</h3>
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

  if (!sidePanel || !content) {
    console.error("No se encontró el panel lateral");
    return;
  }

  // Remove previous selection
  d3.selectAll('.node.node-selected').classed('node-selected', false);
  
  if (nodeData && nodeData.id) {
    d3.selectAll('.node').filter(d => d.data.id == nodeData.id).classed('node-selected', true);
  }

  // Generate content
  content.innerHTML = generateSidePanelContent(nodeData);
  sidePanel.classList.add('open');
}

// Close side panel
function closeSidePanel() {
  const sidePanel = document.getElementById('side-panel');
  if (sidePanel) {
    d3.selectAll('.node.node-selected').classed('node-selected', false);
    sidePanel.classList.remove('open');
  }
}

// Generate panel content
function generateSidePanelContent(nodeData) {
  if (!nodeData) return '<p>No hay datos disponibles</p>';

  const fields = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Nombre' },
    { key: 'subtitle', label: 'Descripción' },
    { key: 'type', label: 'Tipo' },
    { key: 'url', label: 'URL' }
  ];

  let html = '<div class="side-panel-fields-table">';
  
  fields.forEach(field => {
    const value = nodeData[field.key] || '';
    html += `
      <div class="side-panel-field">
        <div class="side-panel-label">${field.label}</div>
        <div class="side-panel-value ${!value ? 'empty' : ''}">
          ${field.key === 'url' && value ? `<a href="${value}" target="_blank" class="side-panel-url">${value}</a>` : value || 'Sin datos'}
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
function setTheme(themeId) {
  const sidePanel = document.getElementById('side-panel');
  if (sidePanel && sidePanel.classList.contains('open')) {
    sidePanel.classList.remove('open');
  }
  
  // Clear previous classes
  document.body.classList.remove('theme-snow', 'theme-onyx', 'theme-vintage', 'theme-pastel', 'theme-neon');
  
  // Apply new class
  document.body.classList.add('theme-' + themeId);
  
  // Save theme with unique key per file
  const storageKey = getStorageKey();
  localStorage.setItem(storageKey, themeId);
  console.log('[Theme System] Tema guardado:', themeId, 'en clave:', storageKey);
  
  // Apply theme CSS variables
  const themeVariables = getThemeVariables(themeId);
  const targetElement = document.querySelector('.sw-diagram-container') || document.documentElement;
  
  Object.keys(themeVariables).forEach(varName => {
    targetElement.style.setProperty(varName, themeVariables[varName]);
    document.body.style.setProperty(varName, themeVariables[varName]);
    document.documentElement.style.setProperty(varName, themeVariables[varName]);
  });
  
  // Update SVG colors
  updateSVGColors();
}

// Get theme variables
function getThemeVariables(themeId) {
  const themes = {
    snow: {
      '--bg-color': '#f6f7f9',
      '--text-color': '#222',
      '--node-fill': '#fff',
      '--node-stroke-focus': '#1976d2',
      '--link-color': '#999',
      '--label-border': '#bdbdbd',
      '--side-panel-bg': '#fff',
      '--side-panel-text': '#222',
      '--side-panel-header-bg': '#f8f9fa',
      '--side-panel-header-border': '#e0e0e0',
      '--side-panel-border': '#e0e0e0',
      '--side-panel-label': '#1976d2',
      '--side-panel-value': '#222',
      '--sidepanel-bg': '#fff',
      '--sidepanel-text': '#222',
      '--sidepanel-border': '#e0e0e0',
      '--node-selection-border': '#bdbdbd',
      '--node-selection-focus': '#1976d2',
      '--node-selection-hover': '#1565c0',
      '--node-selection-selected': '#1976d2',
      '--control-bg': '#ffffff',
      '--control-text': '#333333',
      '--control-border': '#d1d5db',
      '--control-border-hover': '#9ca3af',
      '--control-border-focus': '#1976d2',
      '--control-focus': '#1976d2',
      '--control-placeholder': '#9ca3af',
      '--control-shadow': 'rgba(0, 0, 0, 0.1)',
      '--control-shadow-focus': 'rgba(25, 118, 210, 0.2)',
      '--topbar-bg': '#ffffff',
      '--topbar-text': '#333333',
      '--cluster-bg': 'rgba(0,0,0,0.02)',
      '--cluster-stroke': 'rgba(0,0,0,0.1)',
      '--cluster-title-color': '#222',
      '--image-filter': 'grayscale(30%)',
      '--bg-image': 'none',
      '--bg-opacity': '1',
      '--loading-color': '#666',
      '--loading-bg': '#ffffff',
      '--tree-simple-vertical-spacing': '60',
      '--tree-simple-horizontal-spacing': '140',
      '--tree-vertical-spacing': '100',
      '--tree-horizontal-spacing': '180',
      '--cluster-padding-x': '220',
      '--cluster-padding-y': '220',
      '--cluster-spacing': '120'
    },
    onyx: {
      '--bg-color': '#181c24',
      '--text-color': '#f6f7f9',
      '--node-fill': '#23272f',
      '--node-stroke-focus': '#1976d2',
      '--link-color': '#666',
      '--label-border': '#444',
      '--side-panel-bg': '#23272f',
      '--side-panel-text': '#f6f7f9',
      '--side-panel-header-bg': '#23272f',
      '--side-panel-header-border': '#333',
      '--side-panel-border': '#333',
      '--side-panel-label': '#00eaff',
      '--side-panel-value': '#f6f7f9',
      '--sidepanel-bg': '#23272f',
      '--sidepanel-text': '#f6f7f9',
      '--sidepanel-border': '#333',
      '--node-selection-border': '#444',
      '--node-selection-focus': '#00eaff',
      '--node-selection-hover': '#00b8cc',
      '--node-selection-selected': '#00eaff',
      '--control-bg': '#23272f',
      '--control-text': '#f6f7f9',
      '--control-border': '#333',
      '--control-border-hover': '#555',
      '--control-border-focus': '#00eaff',
      '--control-focus': '#1976d2',
      '--control-placeholder': '#666',
      '--control-shadow': 'rgba(0, 0, 0, 0.3)',
      '--control-shadow-focus': 'rgba(0, 234, 255, 0.2)',
      '--topbar-bg': '#23272f',
      '--topbar-text': '#f6f7f9',
      '--cluster-bg': 'rgba(255,255,255,0.02)',
      '--cluster-stroke': 'rgba(255,255,255,0.1)',
      '--cluster-title-color': '#CCCCCC',
      '--image-filter': 'invert(100%) brightness(0.8) contrast(1.2)',
      '--bg-image': 'url(img/backgrounds/grid-dots.svg)',
      '--bg-opacity': '1',
      '--loading-color': '#999',
      '--loading-bg': '#23272f',
      '--tree-simple-vertical-spacing': '80',
      '--tree-simple-horizontal-spacing': '160',
      '--tree-vertical-spacing': '100',
      '--tree-horizontal-spacing': '180',
      '--cluster-padding-x': '220',
      '--cluster-padding-y': '220',
      '--cluster-spacing': '120'
    },
    vintage: {
      '--bg-color': '#f5f1e8',
      '--text-color': '#2c1810',
      '--node-fill': '#faf6f0',
      '--node-stroke-focus': '#8b4513',
      '--link-color': '#8b7355',
      '--label-border': '#d4c4a8',
      '--side-panel-bg': '#faf6f0',
      '--side-panel-text': '#2c1810',
      '--side-panel-header-bg': '#f5f1e8',
      '--side-panel-header-border': '#d4c4a8',
      '--side-panel-border': '#d4c4a8',
      '--side-panel-label': '#8b4513',
      '--side-panel-value': '#2c1810',
      '--sidepanel-bg': '#faf6f0',
      '--sidepanel-text': '#2c1810',
      '--sidepanel-border': '#d4c4a8',
      '--node-selection-border': '#d4c4a8',
      '--node-selection-focus': '#8b4513',
      '--node-selection-hover': '#a0522d',
      '--node-selection-selected': '#8b4513',
      '--control-bg': '#faf6f0',
      '--control-text': '#2c1810',
      '--control-border': '#d4c4a8',
      '--control-border-hover': '#c4b498',
      '--control-border-focus': '#8b4513',
      '--control-focus': '#8b4513',
      '--control-placeholder': '#a0522d',
      '--control-shadow': 'rgba(139, 69, 19, 0.1)',
      '--control-shadow-focus': 'rgba(139, 69, 19, 0.2)',
      '--topbar-bg': '#f5f1e8',
      '--topbar-text': '#2c1810',
      '--cluster-bg': 'rgba(139, 69, 19, 0.05)',
      '--cluster-stroke': 'rgba(139, 69, 19, 0.1)',
      '--cluster-title-color': '#8b4513',
      '--image-filter': 'sepia(20%) brightness(0.95)',
      '--bg-image': 'url(img/backgrounds/vintage-texture.svg)',
      '--bg-opacity': '1',
      '--loading-color': '#8b7355',
      '--loading-bg': '#faf6f0',
      '--tree-simple-vertical-spacing': '60',
      '--tree-simple-horizontal-spacing': '140',
      '--tree-vertical-spacing': '100',
      '--tree-horizontal-spacing': '180',
      '--cluster-padding-x': '220',
      '--cluster-padding-y': '220',
      '--cluster-spacing': '120'
    },
    pastel: {
      '--bg-color': '#f8f9ff',
      '--text-color': '#4a4a6a',
      '--node-fill': '#ffffff',
      '--node-stroke-focus': '#a8b4f5',
      '--link-color': '#b8c5d6',
      '--label-border': '#e1e8f0',
      '--side-panel-bg': '#ffffff',
      '--side-panel-text': '#4a4a6a',
      '--side-panel-header-bg': '#f8f9ff',
      '--side-panel-header-border': '#e1e8f0',
      '--side-panel-border': '#e1e8f0',
      '--side-panel-label': '#a8b4f5',
      '--side-panel-value': '#4a4a6a',
      '--sidepanel-bg': '#ffffff',
      '--sidepanel-text': '#4a4a6a',
      '--sidepanel-border': '#e1e8f0',
      '--node-selection-border': '#e1e8f0',
      '--node-selection-focus': '#a8b4f5',
      '--node-selection-hover': '#8b9af0',
      '--node-selection-selected': '#a8b4f5',
      '--control-bg': '#ffffff',
      '--control-text': '#4a4a6a',
      '--control-border': '#e1e8f0',
      '--control-border-hover': '#d1d8e0',
      '--control-border-focus': '#a8b4f5',
      '--control-focus': '#a8b4f5',
      '--control-placeholder': '#b8c5d6',
      '--control-shadow': 'rgba(168, 180, 245, 0.1)',
      '--control-shadow-focus': 'rgba(168, 180, 245, 0.2)',
      '--topbar-bg': '#f8f9ff',
      '--topbar-text': '#4a4a6a',
      '--cluster-bg': 'rgba(168, 180, 245, 0.05)',
      '--cluster-stroke': 'rgba(168, 180, 245, 0.1)',
      '--cluster-title-color': '#a8b4f5',
      '--image-filter': 'brightness(1.05) saturate(0.9)',
      '--bg-image': 'url(img/backgrounds/pastel-dots.svg)',
      '--bg-opacity': '1',
      '--loading-color': '#b8c5d6',
      '--loading-bg': '#ffffff',
      '--tree-simple-vertical-spacing': '60',
      '--tree-simple-horizontal-spacing': '140',
      '--tree-vertical-spacing': '100',
      '--tree-horizontal-spacing': '180',
      '--cluster-padding-x': '220',
      '--cluster-padding-y': '220',
      '--cluster-spacing': '120'
    },
    neon: {
      '--bg-color': '#0a0a0a',
      '--text-color': '#00ff41',
      '--node-fill': '#1a1a1a',
      '--node-stroke-focus': '#00ff88',
      '--link-color': '#00ff88',
      '--label-border': '#00ff41',
      '--side-panel-bg': '#1a1a1a',
      '--side-panel-text': '#00ff41',
      '--side-panel-header-bg': '#0a0a0a',
      '--side-panel-header-border': '#00ff41',
      '--side-panel-border': '#00ff41',
      '--side-panel-label': '#00ff88',
      '--side-panel-value': '#00ff41',
      '--sidepanel-bg': '#1a1a1a',
      '--sidepanel-text': '#00ff41',
      '--sidepanel-border': '#00ff41',
      '--node-selection-border': '#00ff41',
      '--node-selection-focus': '#00ff88',
      '--node-selection-hover': '#00cc6a',
      '--node-selection-selected': '#00ff88',
      '--control-bg': '#1a1a1a',
      '--control-text': '#00ff41',
      '--control-border': '#00ff41',
      '--control-border-hover': '#00ff88',
      '--control-border-focus': '#00ff88',
      '--control-focus': '#00ff88',
      '--control-placeholder': '#00cc6a',
      '--control-shadow': 'rgba(0, 255, 65, 0.2)',
      '--control-shadow-focus': 'rgba(0, 255, 136, 0.3)',
      '--topbar-bg': '#0a0a0a',
      '--topbar-text': '#00ff41',
      '--cluster-bg': 'rgba(0, 255, 65, 0.05)',
      '--cluster-stroke': 'rgba(0, 255, 65, 0.2)',
      '--cluster-title-color': '#00ff88',
      '--image-filter': 'brightness(1.2) contrast(1.1) saturate(1.3)',
      '--bg-image': 'url(img/backgrounds/neon-grid.svg)',
      '--bg-opacity': '1',
      '--loading-color': '#666',
      '--loading-bg': '#1a1a1a',
      '--tree-simple-vertical-spacing': '60',
      '--tree-simple-horizontal-spacing': '140',
      '--tree-vertical-spacing': '100',
      '--tree-horizontal-spacing': '180',
      '--cluster-padding-x': '220',
      '--cluster-padding-y': '220',
      '--cluster-spacing': '120'
    }
  };
  
  return themes[themeId] || themes.snow;
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
    clusterTitleColor: computedStyle.getPropertyValue('--cluster-title-color')
  };

  // Apply colors to SVG elements
  d3.selectAll('.link').style('stroke', variables.linkColor);
  d3.selectAll('.node rect').style('fill', variables.nodeFill).style('stroke', variables.labelBorder);
  d3.selectAll('.label-text').style('fill', variables.textColor);
  d3.selectAll('.subtitle-text').style('fill', variables.textColor);
  d3.selectAll('.cluster-rect').style('fill', variables.clusterBg).style('stroke', variables.clusterStroke);
  d3.selectAll('.cluster-title').style('fill', variables.clusterTitleColor);
}

// Generate unique key for localStorage based on file URL
function getStorageKey() {
  const path = window.location.pathname;
  const filename = path.split('/').pop() || 'index.html';
  return `selectedTheme_${filename}`;
}

// Get theme configuration from HTML
function getThemeConfiguration() {
  const container = document.querySelector('.sw-diagram-container');
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
  return lightThemes.includes(themeId);
}

// Get opposite theme based on configuration
function getOppositeTheme(currentTheme, config) {
  const isLight = isLightTheme(currentTheme);
  return isLight ? config.darkTheme : config.lightTheme;
}

// Initialize theme system (simplified version to use with theme-loader.js)
function initializeThemeSystem() {
  const config = getThemeConfiguration();
  const storageKey = getStorageKey();
  console.log('[Theme System] Configuración cargada:', config);
  console.log('[Theme System] Clave de almacenamiento:', storageKey);
  
  // If theme was already applied early, just configure the toggle
  const currentTheme = localStorage.getItem(storageKey) || config.lightTheme;
  console.log('[Theme System] Tema actual:', currentTheme);
  
  // Apply complete theme (with all CSS variables)
  setTheme(currentTheme);
  
  // Configure theme toggle if it exists
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', function() {
      const currentTheme = localStorage.getItem(storageKey);
      const newTheme = getOppositeTheme(currentTheme, config);
      console.log('[Theme System] Cambiando de', currentTheme, 'a', newTheme);
      setTheme(newTheme);
    });
  }
}

// Function to force default light theme
function forceDefaultLightTheme() {
  const config = getThemeConfiguration();
  const storageKey = getStorageKey();
  localStorage.removeItem(storageKey);
  localStorage.setItem(`themeSystemInitialized_${storageKey}`, 'true');
  console.log('[Theme System] Forzando tema claro por defecto:', config.lightTheme);
  setTheme(config.lightTheme);
}

// Function to preserve current theme
function preserveCurrentTheme() {
  const storageKey = getStorageKey();
  const currentTheme = localStorage.getItem(storageKey);
  if (currentTheme) {
    console.log('[Theme System] Preservando tema actual:', currentTheme);
    // Apply current theme without changing localStorage
    const themeVariables = getThemeVariables(currentTheme);
    const targetElement = document.querySelector('.sw-diagram-container') || document.documentElement;
    
    Object.keys(themeVariables).forEach(varName => {
      targetElement.style.setProperty(varName, themeVariables[varName]);
      document.body.style.setProperty(varName, themeVariables[varName]);
      document.documentElement.style.setProperty(varName, themeVariables[varName]);
    });
    
    // Update SVG colors
    updateSVGColors();
  }
}

// --- Diagram management and switcher (no default diagrams) ---
window.swDiagrams = window.swDiagrams || {};
window.swDiagrams.currentDiagramIdx = 0;
window.swDiagrams.isLoading = false;
window.swDiagrams.loadedDiagrams = new Map();
window.swDiagrams.currentUrl = null;
// DO NOT define default diagrams here
window.swDiagrams.getDiagramIndexFromURL = function() {
    const urlParams = new URLSearchParams(window.location.search);
    const diagramId = urlParams.get('d');
    if (diagramId !== null && Array.isArray(window.swDiagrams.diagrams)) {
        const index = parseInt(diagramId);
        if (!isNaN(index) && index >= 0 && index < window.swDiagrams.diagrams.length) {
            return index;
        }
    }
    return 0;
};
window.swDiagrams.updateTopbarTitle = function(diagramIndex) {
    // Title is now fixed and doesn't change based on diagram selection
    // The title is set once during initialization and remains constant
    const titleElement = document.querySelector('.diagram-title');
    if (!titleElement) {
        // If title element doesn't exist, get the fixed title from HTML or page title
        const originalContainer = document.querySelector('.sw-diagram-container');
        let fixedTitle = originalContainer ? originalContainer.getAttribute('data-title') : null;
        
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
window.swDiagrams.renderDiagramButtons = function() {
    const switcher = document.getElementById('diagram-switcher');
    if (!switcher) return;
    const header = switcher.querySelector('.switcher-header');
    switcher.innerHTML = '';
    if (header) switcher.appendChild(header);
    if (!Array.isArray(window.swDiagrams.diagrams) || window.swDiagrams.diagrams.length === 0) {
        // Show centered message
        const msg = document.createElement('div');
        msg.style.textAlign = 'center';
        msg.style.padding = '40px 0';
        msg.style.color = 'var(--text-color, #333)';
        msg.style.fontSize = '1.2em';
        msg.textContent = 'Sin datos';
        switcher.appendChild(msg);
        return;
    }
    window.swDiagrams.diagrams.forEach((d, idx) => {
        const link = document.createElement('a');
        link.href = `?d=${idx}`;
        link.className = 'diagram-btn' + (idx === window.swDiagrams.currentDiagramIdx ? ' active' : '');
        link.textContent = d.name;
        link.style.textDecoration = 'none';
        if (window.swDiagrams.isLoading) {
            link.style.pointerEvents = 'none';
            link.style.opacity = '0.5';
        }
        link.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (window.swDiagrams.currentDiagramIdx !== idx && !window.swDiagrams.isLoading) {
                // Clear cache before switching diagrams
                if (window.swDiagrams.clearCache) {
                    window.swDiagrams.clearCache();
                }
                
                const url = new URL(window.location);
                url.searchParams.set('d', idx.toString());
                window.history.pushState({}, '', url);
                window.swDiagrams.currentDiagramIdx = idx;
                window.swDiagrams.updateTopbarTitle(idx);
                window.swDiagrams.renderDiagramButtons();
                window.swDiagrams.loadDiagram(d.url);
            }
        });
        link.addEventListener('mouseenter', () => {});
        switcher.appendChild(link);
    });
};
window.swDiagrams.loadDiagram = function(url) {
    if (!Array.isArray(window.swDiagrams.diagrams) || window.swDiagrams.diagrams.length === 0) {
        // Don't load anything if no diagrams are defined
        return;
    }
    if (window.swDiagrams.isLoading) return;
    window.swDiagrams.isLoading = true;
    window.swDiagrams.currentUrl = url;
    
    // Force cache refresh before loading
    window.swDiagrams.clearCache();
    
    // Add cache buster to URL if it's a Google Sheets URL
    let finalUrl = url;
    if (url.includes('docs.google.com') || url.includes('sheets.google.com')) {
        const cacheBuster = `&_cb=${Date.now()}`;
        finalUrl = url.includes('?') ? `${url}${cacheBuster}` : `${url}?${cacheBuster}`;
        console.log('[Cache] Google Sheets URL with cache buster:', finalUrl);
    }
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
        window.initDiagram(finalUrl, function() {
            if (window.applyAutoZoom) window.applyAutoZoom();
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
                window.swDiagrams.isLoading = false;
            }, 100);
        });
        setTimeout(() => {
            if (window.swDiagrams.isLoading) {
                if (loading) loading.style.display = 'none';
                if (svg) svg.classList.add('loaded');
                window.swDiagrams.isLoading = false;
                window.swDiagrams.currentUrl = null;
            }
        }, 10000);
    } else {
        window.swDiagrams.isLoading = false;
    }
};
window.swDiagrams.clearCache = function() {
    window.swDiagrams.loadedDiagrams.clear();
    window.swDiagrams.currentUrl = null;
    
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
    container.className = 'sw-diagram-container';
    
    // Get theme configuration from original container
    const originalContainer = document.querySelector('.sw-diagram-container');
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
    
    // Get fixed title from HTML or use page title as fallback
    const titleContainer = document.querySelector('.sw-diagram-container');
    let fixedTitle = titleContainer ? titleContainer.getAttribute('data-title') : null;
    
    // If no data-title is defined, use the HTML <title> element
    if (!fixedTitle) {
        const pageTitle = document.querySelector('title');
        fixedTitle = pageTitle ? pageTitle.textContent : 'SW Diagrams';
    }
    
    container.innerHTML = `
      <div class="topbar">
        <div class="topbar-left"></div>
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
          <h4 style="margin:0 0 10px 0; color:var(--text-color, #333);">Diagramas</h4>
        </div>
      </div>
      <svg id="main-diagram-svg"></svg>
      <div id="loading" class="loading"><div class="spinner"></div></div>
      <small id="error-message" class="error-message"></small>
    `;
    document.body.appendChild(container);
  }
  // Add event listener to theme change button
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', function() {
      const config = window.getThemeConfiguration ? window.getThemeConfiguration() : { lightTheme: 'snow', darkTheme: 'onyx' };
      const storageKey = window.getStorageKey ? window.getStorageKey() : 'selectedTheme_index.html';
      const currentTheme = localStorage.getItem(storageKey) || config.lightTheme;
      const newTheme = (window.getOppositeTheme ? window.getOppositeTheme(currentTheme, config) : (currentTheme === config.lightTheme ? config.darkTheme : config.lightTheme));
      if (window.setTheme) window.setTheme(newTheme);
    });
  }
  // Automatic initialization of switcher and diagram when page loads
  if (document.getElementById('diagram-switcher')) {
    window.swDiagrams.currentDiagramIdx = window.swDiagrams.getDiagramIndexFromURL();
    window.swDiagrams.updateTopbarTitle(window.swDiagrams.currentDiagramIdx);
    window.swDiagrams.renderDiagramButtons();
    window.swDiagrams.loadDiagram(window.swDiagrams.diagrams[window.swDiagrams.currentDiagramIdx].url);
  }
}

// Call base rendering function when library loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderSwDiagramBase);
} else {
  renderSwDiagramBase();
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

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  setupClosePanelOnSvgClick();
  
  // Clear cache on page refresh
  window.addEventListener('beforeunload', () => {
    if (window.swDiagrams && window.swDiagrams.clearCache) {
      window.swDiagrams.clearCache();
    }
  });
  
  // Clear cache on theme change
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    const originalClick = themeToggle.onclick;
    themeToggle.addEventListener('click', () => {
      // Clear cache before theme change
      if (window.swDiagrams && window.swDiagrams.clearCache) {
        window.swDiagrams.clearCache();
      }
    });
  }
}); 