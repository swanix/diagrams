// Swanix Diagrams - Versión Limpia y Simplificada
// Eliminado código no usado, bugs y simplificada estructura

// Zoom behavior global - definido al inicio para evitar problemas de scope
const zoom = d3.zoom()
  .scaleExtent([0.1, 4])
  .on("zoom", event => {
    d3.select("#main-diagram-svg g").attr("transform", event.transform);
  });

// Función principal para inicializar diagrama
function initDiagram(csvUrl, onComplete) {
  console.log("Iniciando carga del diagrama...");
  
  const loadingElement = document.querySelector("#loading");
  const errorElement = document.querySelector("#error-message");
  
  if (loadingElement) loadingElement.style.display = "block";
  if (errorElement) errorElement.style.display = "none";

  Papa.parse(csvUrl, {
    download: true,
    header: true,
    complete: function(results) {
      console.log("CSV cargado exitosamente:", results.data.length, "filas");
      
      try {
        const trees = buildHierarchies(results.data);
        drawTrees(trees);
        createSidePanel();
        
        // Preservar el tema actual después de cargar el diagrama
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

// Construir jerarquías simplificado
function buildHierarchies(data) {
  let roots = [];
  let nodeMap = new Map();

  data.forEach(d => {
    let id = d.Node?.trim() || d.id?.trim() || "";
    let name = d.Name?.trim() || d.name?.trim() || "Nodo sin nombre";
    let subtitle = d.Description?.trim() || d.subtitle?.trim() || "";
    let img = d.Thumbnail?.trim() || d.img?.trim() || d.Type?.trim() || d.type?.trim() || "";
    let parent = d.Parent?.trim() || d.parent?.trim() || "";
    let url = d.url?.trim() || "";
    let type = d.Type?.trim() || d.type?.trim() || "";

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

// Dibujar árboles simplificado
function drawTrees(trees) {
  const svg = document.getElementById("main-diagram-svg");
  if (!svg) {
    console.error("No se encontró el SVG principal");
    return;
  }
  
  // Limpiar SVG y ocultarlo durante el renderizado
  svg.innerHTML = "";
  svg.style.opacity = '0';
  svg.classList.remove('loaded');
  
  try {
    const g = d3.select(svg).append("g");
    let xOffset = 150;
    const clusters = [];

    // Obtener variables de espaciado desde el theme (CSS)
    const themeVars = getComputedStyle(document.documentElement);
    const clusterSpacing = parseFloat(themeVars.getPropertyValue('--cluster-spacing')) || 400;

    trees.forEach((data, index) => {
      try {
        // Variables de espaciado de árbol
        const treeSimpleVertical = parseFloat(themeVars.getPropertyValue('--tree-simple-vertical-spacing')) || 60;
        const treeSimpleHorizontal = parseFloat(themeVars.getPropertyValue('--tree-simple-horizontal-spacing')) || 140;
        const treeVertical = parseFloat(themeVars.getPropertyValue('--tree-vertical-spacing')) || 100;
        const treeHorizontal = parseFloat(themeVars.getPropertyValue('--tree-horizontal-spacing')) || 180;
        const clusterPaddingX = parseFloat(themeVars.getPropertyValue('--cluster-padding-x')) || 220;
        const clusterPaddingY = parseFloat(themeVars.getPropertyValue('--cluster-padding-y')) || 220;

        const root = d3.hierarchy(data);
        
        // Detectar si el árbol es tipo 'site map' (root con varios hijos, y cada hijo solo tiene un hijo, y así sucesivamente)
        function isLinearSiteMap(root) {
          if (!root.children || root.children.length < 2) return false;
          return root.children.every(child => {
            let current = child;
            while (current.children && current.children.length === 1) {
              current = current.children[0];
            }
            // Si en algún punto hay más de un hijo, no es lineal
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

        // Si es tree-simple, aumentar la separación vertical solo para los hijos directos del root y todos sus descendientes
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

        // Renderizar enlaces
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

        // Renderizar nodos
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

        // Rectángulo del nodo
        node.append("rect")
          .style("stroke-width", "var(--node-bg-stroke, 2)")
          .attr("x", parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--node-bg-x')) || -30)
          .attr("y", parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--node-bg-y')) || -20)
          .attr("width", parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--node-bg-width')) || 60)
          .attr("height", parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--node-bg-height')) || 40);

        // Imagen del nodo
        node.append("image")
          .attr("href", d => d.data.img ? `img/${d.data.img}.svg` : "img/detail.svg")
          .attr("x", parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--image-x')))
          .attr("y", parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--image-y')))
          .attr("class", "image-base image-filter")
          .attr("width", parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--image-width')))
          .attr("height", parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--image-height')))
          .on("error", function() {
            d3.select(this).attr("href", "img/detail.svg");
          });

        // Texto del nodo
        const textGroup = node.append("g").attr("class", "text-group");
        
        // ID del nodo
        textGroup.append("text")
          .attr("class", "label-id")
          .attr("x", parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--label-id-x')))
          .attr("y", parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--label-id-y')))
          .attr("dy", getComputedStyle(document.documentElement).getPropertyValue('--label-id-dy'))
          .attr("text-anchor", getComputedStyle(document.documentElement).getPropertyValue('--label-id-anchor'))
          .style("font-size", getComputedStyle(document.documentElement).getPropertyValue('--label-id-font-size'))
          .style("fill", getComputedStyle(document.documentElement).getPropertyValue('--label-id-text-color'))
          .text(d => d.data.id);

        // Nombre del nodo
        const nameText = textGroup.append("text")
          .attr("class", "label-text")
          .attr("x", parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--label-x')))
          .attr("y", parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--label-y')))
          .attr("dy", getComputedStyle(document.documentElement).getPropertyValue('--label-dy'))
          .style("font-size", getComputedStyle(document.documentElement).getPropertyValue('--label-font-size'))
          .text(d => d.data.name);

        // Aplicar wrap al texto
        wrap(nameText, 80);

        // Subtítulo del nodo
        if (data.subtitle) {
          textGroup.append("text")
            .attr("class", "subtitle-text")
            .attr("transform", "rotate(270)") // Rotar el texto 90 grados para posición vertical
            .attr("x", parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--subtitle-x')))
            .attr("y", parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--subtitle-y')))
            .attr("text-anchor", getComputedStyle(document.documentElement).getPropertyValue('--subtitle-anchor'))
            .style("font-size", getComputedStyle(document.documentElement).getPropertyValue('--subtitle-font-size'))
            .style("fill", getComputedStyle(document.documentElement).getPropertyValue('--text-subtitle-color'))
            .text(d => d.data.subtitle);
        }

        // Crear cluster siempre (incluso para nodos únicos)
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

    // Recalcular espaciado con reintentos
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

// Función para recalcular el espaciado entre clusters
function recalculateClusterSpacing(clusters, clusterSpacing) {
  if (clusters.length <= 1) return;

  const uniformSpacing = Math.abs(clusterSpacing); // Espaciado fijo
  let currentX = 150; // Margen inicial izquierdo

  clusters.forEach((cluster, index) => {
    const treeGroup = cluster.treeGroup;
    const bbox = treeGroup.node().getBBox();

    // Coloca el cluster en currentX
    const newX = currentX - bbox.x;
    treeGroup.attr("transform", `translate(${newX}, 100)`);
    console.log(`[ClusterSpacing] Cluster ${index}: newX=${newX}, width=${bbox.width}, spacing=${uniformSpacing}`);

    // El siguiente cluster empieza justo después del borde derecho del actual + espaciado uniforme
    currentX = newX + bbox.x + bbox.width + uniformSpacing;
  });
}

// Aplicar zoom automático simplificado
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

  // Calcular bounds totales
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

  // Calcular transformación
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
  
  // Aplicar zoom específico según el tipo de diagrama
  if (isSingleGroup) {
    // Para un solo cluster: zoom out para mostrar todo el cluster con aura
    scale = Math.min(scale * 0.6, 0.6); // Zoom out más agresivo para mostrar aura
    console.log('[Zoom] Aplicando zoom out para cluster único con aura. Scale:', scale);
  } else {
    // Para múltiples clusters: zoom in para mejor visibilidad
    scale = Math.min(scale * 2.0, 2.0); // Zoom in más agresivo para múltiples clusters
    console.log('[Zoom] Aplicando zoom in para múltiples clusters. Scale:', scale);
  }
  
  let translateX = svgCenterX - contentCenterX * scale;
  
  // Mejorar centrado según el tipo de diagrama
  if (isSingleGroup) {
    // Centrado perfecto para grupos únicos, sin ajustes de margen
    translateX = svgCenterX - contentCenterX * scale;
    console.log('[Zoom] Centrado perfecto para grupo único. translateX:', translateX);
  } else {
    // Para múltiples clusters: empezar desde la izquierda
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
      
      // Posicionar el primer cluster desde la izquierda con margen negativo
      const firstClusterLeftEdge = firstClusterBounds.x + firstClusterOffsetX;
      translateX = -150 - firstClusterLeftEdge * scale; // -150px de margen desde la izquierda
      console.log('[Zoom] Primer cluster desde la izquierda con margen negativo. translateX:', translateX);
    } else {
      // Fallback a la lógica original
      const leftEdge = totalBounds.x * scale + translateX;
      if (leftEdge > 300) {
        translateX -= (leftEdge - 300);
      }
    }
  }
  
  const translateY = svgCenterY - contentCenterY * scale - 50;

  // Aplicar transformación
  const transform = d3.zoomIdentity
    .translate(translateX, translateY)
    .scale(scale);

  svg.call(zoom.transform, transform);
  console.log('[Zoom] Zoom automático aplicado exitosamente');
  
  // Preservar el tema actual después del zoom
  setTimeout(() => {
    if (window.preserveCurrentTheme) {
      window.preserveCurrentTheme();
    }
  }, 100);
}

// Aplicar zoom behavior
function ensureZoomBehavior() {
  const svg = d3.select("#main-diagram-svg");
  if (!svg.empty()) {
    svg.call(zoom);
    svg.style('pointer-events', 'auto');
    console.log('[Zoom] Zoom behavior aplicado');
  }
}

// Función para envolver texto
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

// Panel lateral simplificado
function createSidePanel() {
  const container = document.querySelector('.swanix-diagram-container');
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

  // Evento para tecla Escape
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
      closeSidePanel();
    }
  });
}

// Abrir panel lateral
function openSidePanel(nodeData) {
  const sidePanel = document.getElementById('side-panel');
  const content = document.getElementById('side-panel-content');

  if (!sidePanel || !content) {
    console.error("No se encontró el panel lateral");
    return;
  }

  // Quitar selección previa
  d3.selectAll('.node.node-selected').classed('node-selected', false);
  
  if (nodeData && nodeData.id) {
    d3.selectAll('.node').filter(d => d.data.id == nodeData.id).classed('node-selected', true);
  }

  // Generar contenido
  content.innerHTML = generateSidePanelContent(nodeData);
  sidePanel.classList.add('open');
}

// Cerrar panel lateral
function closeSidePanel() {
  const sidePanel = document.getElementById('side-panel');
  if (sidePanel) {
    d3.selectAll('.node.node-selected').classed('node-selected', false);
    sidePanel.classList.remove('open');
  }
}

// Generar contenido del panel
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

// Configurar cierre del panel al hacer clic fuera
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

// Sistema de temas simplificado
function setTheme(themeId) {
  const sidePanel = document.getElementById('side-panel');
  if (sidePanel && sidePanel.classList.contains('open')) {
    sidePanel.classList.remove('open');
  }
  
  // Limpiar clases anteriores
  document.body.classList.remove('theme-snow', 'theme-onyx', 'theme-vintage', 'theme-pastel', 'theme-neon');
  
  // Aplicar nueva clase
  document.body.classList.add('theme-' + themeId);
  
  // Guardar tema con clave única por archivo
  const storageKey = getStorageKey();
  localStorage.setItem(storageKey, themeId);
  console.log('[Theme System] Tema guardado:', themeId, 'en clave:', storageKey);
  
  // Aplicar variables CSS del tema
  const themeVariables = getThemeVariables(themeId);
  const targetElement = document.querySelector('.swanix-diagram-container') || document.documentElement;
  
  Object.keys(themeVariables).forEach(varName => {
    targetElement.style.setProperty(varName, themeVariables[varName]);
    document.body.style.setProperty(varName, themeVariables[varName]);
    document.documentElement.style.setProperty(varName, themeVariables[varName]);
  });
  
  // Actualizar colores del SVG
  updateSVGColors();
}

// Obtener variables del tema
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
      '--cluster-spacing': '400'
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
      '--cluster-spacing': '400'
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
      '--cluster-spacing': '400'
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
      '--cluster-spacing': '-1400'
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
      '--cluster-spacing': '400'
    }
  };
  
  return themes[themeId] || themes.snow;
}

// Actualizar colores del SVG
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

  // Aplicar colores a elementos SVG
  d3.selectAll('.link').style('stroke', variables.linkColor);
  d3.selectAll('.node rect').style('fill', variables.nodeFill).style('stroke', variables.labelBorder);
  d3.selectAll('.label-text').style('fill', variables.textColor);
  d3.selectAll('.subtitle-text').style('fill', variables.textColor);
  d3.selectAll('.cluster-rect').style('fill', variables.clusterBg).style('stroke', variables.clusterStroke);
  d3.selectAll('.cluster-title').style('fill', variables.clusterTitleColor);
}

// Generar clave única para el localStorage basada en la URL del archivo
function getStorageKey() {
  const path = window.location.pathname;
  const filename = path.split('/').pop() || 'index.html';
  return `selectedTheme_${filename}`;
}

// Obtener configuración de temas desde el HTML
function getThemeConfiguration() {
  const container = document.querySelector('.swanix-diagram-container');
  if (container) {
    return {
      lightTheme: container.getAttribute('data-light-theme') || 'snow',
      darkTheme: container.getAttribute('data-dark-theme') || 'onyx'
    };
  }
  return { lightTheme: 'snow', darkTheme: 'onyx' };
}

// Determinar si un tema es claro u oscuro
function isLightTheme(themeId) {
  const lightThemes = ['snow', 'vintage', 'pastel'];
  return lightThemes.includes(themeId);
}

// Obtener el tema opuesto basado en la configuración
function getOppositeTheme(currentTheme, config) {
  const isLight = isLightTheme(currentTheme);
  return isLight ? config.darkTheme : config.lightTheme;
}

// Inicializar sistema de temas
function initializeThemeSystem() {
  const config = getThemeConfiguration();
  const storageKey = getStorageKey();
  console.log('[Theme System] Configuración cargada:', config);
  console.log('[Theme System] Clave de almacenamiento:', storageKey);
  
  // Verificar si es la primera vez para este archivo específico
  const isFirstTime = !localStorage.getItem(`themeSystemInitialized_${storageKey}`);
  
  let currentTheme;
  if (isFirstTime) {
    // Primera vez: usar el tema claro por defecto
    currentTheme = config.lightTheme;
    localStorage.setItem(`themeSystemInitialized_${storageKey}`, 'true');
    localStorage.setItem(storageKey, currentTheme); // Guardar el tema por defecto
    console.log('[Theme System] Primera vez para este archivo, usando tema claro por defecto:', config.lightTheme);
  } else {
    // No es la primera vez: usar el tema guardado
    currentTheme = localStorage.getItem(storageKey);
    if (!currentTheme) {
      // Si no hay tema guardado, usar el tema claro por defecto
      currentTheme = config.lightTheme;
      localStorage.setItem(storageKey, currentTheme);
    }
    console.log('[Theme System] Usando tema guardado:', currentTheme);
  }
  
  console.log('[Theme System] Tema final a aplicar:', currentTheme);
  setTheme(currentTheme);
  
  // Configurar theme toggle si existe
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

// Función para forzar el tema claro por defecto
function forceDefaultLightTheme() {
  const config = getThemeConfiguration();
  const storageKey = getStorageKey();
  localStorage.removeItem(storageKey);
  localStorage.setItem(`themeSystemInitialized_${storageKey}`, 'true');
  console.log('[Theme System] Forzando tema claro por defecto:', config.lightTheme);
  setTheme(config.lightTheme);
}

// Función para preservar el tema actual
function preserveCurrentTheme() {
  const storageKey = getStorageKey();
  const currentTheme = localStorage.getItem(storageKey);
  if (currentTheme) {
    console.log('[Theme System] Preservando tema actual:', currentTheme);
    // Aplicar el tema actual sin cambiar el localStorage
    const themeVariables = getThemeVariables(currentTheme);
    const targetElement = document.querySelector('.swanix-diagram-container') || document.documentElement;
    
    Object.keys(themeVariables).forEach(varName => {
      targetElement.style.setProperty(varName, themeVariables[varName]);
      document.body.style.setProperty(varName, themeVariables[varName]);
      document.documentElement.style.setProperty(varName, themeVariables[varName]);
    });
    
    // Actualizar colores del SVG
    updateSVGColors();
  }
}

// Exportar funciones globalmente
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

// Inicializar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  setupClosePanelOnSvgClick();
}); 