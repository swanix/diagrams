/* Swanix Diagrams v0.1.0 */
/* Based on D3.js */


// Zoom behavior global - debe estar definido ANTES de cualquier función que lo use
const zoom = d3.zoom()
  .scaleExtent([0.1, 4])
  .on("zoom", event => {
    d3.select("#main-diagram-svg g").attr("transform", event.transform);
  });

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
      const data = results.data;
      
      try {
        console.log("Construyendo jerarquías...");
        const trees = buildMultipleHierarchies(data);
        console.log("Jerarquías construidas:", trees.length, "árboles");
        
        console.log("Dibujando árboles...");
        drawMultipleTrees(trees);
        console.log("Árboles dibujados");
        
        console.log("Creando panel lateral...");
        try {
        createSidePanel();
          console.log("Panel lateral creado exitosamente");
        } catch (error) {
          console.error("Error al crear el panel lateral:", error);
        }
        
        console.log("Creando dropdown de tipos...");
        // Dropdown de tipos removido temporalmente
        console.log("Dropdown removido temporalmente");
        
        console.log("Diagrama renderizado completamente");
        
        // NO ocultar loading aquí - se manejará desde el código principal
        // if (loadingElement) loadingElement.style.display = "none";
        
        // Aplicar el tema actual después de que el diagrama esté completamente cargado
        setTimeout(() => {
            const currentTheme = localStorage.getItem('selectedTheme') || 'snow';
            console.log("Aplicando tema actual:", currentTheme);
            if (window.setTheme) {
                window.setTheme(currentTheme);
            }
        }, 100);
        
        console.log("Diagrama cargado completamente");
        
        // Llamar al callback cuando esté completamente terminado
        if (onComplete && typeof onComplete === 'function') {
          setTimeout(() => {
            // NO aplicar zoom behavior aquí - se aplicará desde applyAutoZoom
            onComplete();
          }, 100); // Pequeño delay para asegurar que todo esté listo
        }
      } catch (error) {
        console.error("Error durante la inicialización:", error);
        if (errorElement) errorElement.innerText = `Error: ${error.message}`;
        if (loadingElement) loadingElement.style.display = "none";
        
        // Llamar al callback incluso en caso de error
        if (onComplete && typeof onComplete === 'function') {
          onComplete();
        }
      }
    },
    error: function(err) {
      console.error("Error al cargar CSV:", err);
      if (errorElement) errorElement.innerText = `CSV File ${err.message}`;
      if (loadingElement) loadingElement.style.display = "none";
      
      // Llamar al callback en caso de error de CSV
      if (onComplete && typeof onComplete === 'function') {
        onComplete();
      }
    }
  });
}

// Export the function to make it globally accessible
window.initDiagram = initDiagram;



function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
}

function buildMultipleHierarchies(data) {
  let roots = [];
  let nodeMap = new Map();

  data.forEach(d => {
    // Mapear columnas genéricas del Google Sheets a las que espera el código
    let id = d.Node?.trim() || d.id?.trim() || "";
    let name = d.Name?.trim() || d.name?.trim() || "Nodo sin nombre";
    let subtitle = d.Description?.trim() || d.subtitle?.trim() || "";
    let img = d.Thumbnail?.trim() || d.img?.trim() || "";
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

function drawMultipleTrees(trees) {
  
  // Buscar el SVG principal del diagrama por ID específico
  let svg = document.getElementById("main-diagram-svg");
  if (!svg) {
    // Fallback: buscar el SVG dentro del contenedor
    svg = document.querySelector(".swanix-diagram-container svg");
  }
  if (!svg) {
    // Fallback: buscar cualquier SVG que no sea un icono del tema
    const allSvgs = document.querySelectorAll("svg");
    svg = Array.from(allSvgs).find(svg => !svg.classList.contains('theme-icon'));
  }
  
  if (!svg) {
    console.error("No se encontró el SVG principal del diagrama en el documento");
    return;
  }
  
  // Limpiar cualquier contenido previo del SVG
  svg.innerHTML = "";
  
  // Asegurar que el SVG esté oculto durante el renderizado
  svg.style.opacity = '0';
  svg.classList.remove('loaded');
  
  console.log("SVG principal seleccionado:", svg);
  
  try {
    const g = d3.select(svg).append("g");
    if (g.empty()) {
      console.error("❌ No se pudo crear el elemento g en el SVG");
      return;
    }

  let xOffset = 150; // Initial margin from left edge
  let treeSpacingX = 3400; // Minimum space between trees
    const clusters = []; // Array para almacenar información de clusters

  trees.forEach((data, index) => {
      try {
    const root = d3.hierarchy(data);
        const treeLayout = d3.tree().nodeSize([120, 180]); // Restaurado a 120 para separación horizontal estándar
    treeLayout(root);

    const treeGroup = g.append("g")
          .attr("class", "diagram-group")
          .attr("data-root-id", root.data.id)
      .attr("transform", `translate(${xOffset}, 100)`);

        // Guardar información del cluster para recalcular después
        clusters.push({
          treeGroup: treeGroup,
          root: root,
          initialX: xOffset,
          index: index
        });

    xOffset += treeSpacingX;

        // --- Renderizado de enlaces y nodos (código existente) ---
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

    const node = treeGroup.selectAll(".node")
      .data(root.descendants())
      .enter().append("g")
      .attr("class", "node node-clickable")
      .attr("data-id", d => d.data.id)
      .attr("transform", d => `translate(${d.x},${d.y})`)
      .on("click", function(event, d) {
        event.stopPropagation();
        openSidePanel(d.data);
      });

    node.append("rect")
      .style("stroke-width", "var(--node-bg-stroke)")
      .attr("x", parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--node-bg-x')))
      .attr("y", parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--node-bg-y')))
      .attr("width", parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--node-bg-width')))
      .attr("height", parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--node-bg-height')));

    // Renderizar thumbnails o imagen por nodo
    node.each(function(d) {
      const nodeSel = d3.select(this);
      // Elimina thumbnail anterior si existe
      nodeSel.select('.thumbnail-container').remove();
      nodeSel.select('image').remove();

      // Obtener el tipo del nodo y asegurar que existe, si no usar 'detail' como fallback
      const type = d.data.type || 'detail';
      
      // Intentar cargar el SVG correspondiente al tipo
      const svgPath = `img/${type}.svg?v=${Date.now()}`;

      // Agregar la imagen SVG con manejo de errores
      const imageElement = nodeSel.append("image")
        .attr("xlink:href", svgPath)
        .attr("x", parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--image-x')))
        .attr("y", parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--image-y')))
        .attr("class", "image-base image-filter")
        .attr("width", parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--image-width')))
        .attr("height", parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--image-height')))
        .on("error", function() {
          // Si hay error al cargar el SVG específico, cambiar al SVG por defecto
          d3.select(this)
            .attr("xlink:href", `img/detail.svg?v=${Date.now()}`);
        });
    });

    // Agregar etiqueta para el Name
    node.append("text")
      .text(d => d.data.name)
      .attr("class", "custom-text")
      .attr("text-anchor", "middle")
      .style("fill", "var(--text-color)")
      .attr("font-size", parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--label-font-size')))
      .attr("dy", parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--label-dy')))
      .attr("x", parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--label-x')))
      .attr("y", parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--label-y')))
      .call(wrap, parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--label-width')));

    // Agregar etiqueta para el ID
    node.append("text")
      .text(d => d.data.id || "No ID") // Mostrar el ID o un mensaje si está vacío
      .attr("class", "id-text")
      .style("fill", "var(--label-id-text-color)")
      .attr("text-anchor", getComputedStyle(document.documentElement).getPropertyValue('--label-id-anchor')) // Convertir text-anchor en variable de CSS
      .attr("font-size", parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--label-id-font-size')))
      .attr("dy", parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--label-id-dy')))
      .attr("x", parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--label-id-x')))
      .attr("y", parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--label-id-y'))); 

    // Agregar etiqueta para el subtítulo
    node.append("text")
      .text(d => d.data.subtitle) // Mostrar el subtítulo
      .attr("class", "subtitle-text")
      .attr("transform", "rotate(270)") // Rotar el texto 90 grados
      .style("fill", "var(--text-subtitle-color)")
      .attr("text-anchor", getComputedStyle(document.documentElement).getPropertyValue('--subtitle-anchor')) // Convertir text-anchor en variable de CSS
      .attr("dy", parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--subtitle-dy'))) // Ajustar la posición vertical
      .attr("font-size", parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--subtitle-font-size'))) // Tamaño de fuente
      .attr("x", parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--subtitle-x'))) // Centrar horizontalmente
      .attr("y", parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--subtitle-y'))); // Ajustar la posición vertical

    // Add a button with a link
    const link = node.append("a")
      .attr("xlink:href", d => d.data.url)
      .attr("target", "_blank")
      .attr("class", "node-link")
      .style("transition", "opacity 0.3s ease");

    link.append("rect")
      .attr("class", "node-button")
      .attr("x", 28)
      .attr("y", -68)
      .attr("width", 16)
      .attr("height", 16)
      .style("opacity", 1)
      .style("transition", "opacity 0.3s ease")
      .style("stroke-width", "var(--btn-stroke)");

    link.append("text")
      .attr("x", 36)
      .attr("y", -57)
      .attr("text-anchor", "middle")
      .style("fill", "var(--btn-text)")
      .style("font-size", "9px")
      .style("opacity", 1)
      .style("transition", "opacity 0.3s ease")
      .text("↗");

    // Add hover events
    link.on("mouseover", function() {
      d3.select(this).select("rect")
        .style("opacity", 1)
        .style("fill", "var(--btn-bg-hover)");
      d3.select(this).select("text")
        .style("opacity", 1)
        .style("fill", "var(--btn-text-hover)");
    })
    .on("mouseout", function() {
      d3.select(this).select("rect")
        .style("opacity", 1)
        .style("fill", "var(--btn-bg)");
      d3.select(this).select("text")
        .style("opacity", 0.7)
        .style("fill", "var(--btn-text)");
    });

        // --- CLUSTER VISUAL ---
        setTimeout(() => {
          const nodes = treeGroup.selectAll(".node");
          if (!nodes.empty()) {
            let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
            let found = false;
            nodes.each(function() {
              const transform = d3.select(this).attr("transform");
              if (transform) {
                // Soporta tanto "translate(x,y)" como "translate(x y)"
                const match = /translate\(([-\d.]+)[, ]+([-.\d]+)\)/.exec(transform);
                if (match) {
                  const x = parseFloat(match[1]);
                  const y = parseFloat(match[2]);
                  if (!isNaN(x) && !isNaN(y)) {
                    minX = Math.min(minX, x);
                    minY = Math.min(minY, y);
                    maxX = Math.max(maxX, x);
                    maxY = Math.max(maxY, y);
                    found = true;
                  }
                }
              }
            });
            if (found) {
              const paddingX = 220; // Aumentado a 220px
              const paddingY = 220; // Aumentado a 220px
              minX -= paddingX;
              minY -= paddingY + 30;
              maxX += paddingX;
              maxY += paddingY;
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
                .style("stroke-dasharray", "12,8");
              treeGroup.append("text")
                .attr("class", "cluster-title")
                .attr("x", minX + 32) // Aumentado de 16 a 32 para separarlo más del borde izquierdo
                .attr("y", minY + 40) // Aumentado de 28 a 40 para bajarlo un poco
                .attr("text-anchor", "start")
                .style("font-size", "1.5em")
                .style("font-weight", "bold")
                .style("fill", "var(--cluster-title-color, #fff)")
                .text(root.data.name);
            }
          }
        }, 0);
        // --- FIN CLUSTER ---

      } catch (err) {
        console.error(`Error al renderizar árbol ${index + 1}:`, err);
      }
    });

    // Recalcular espaciado después de que todos los clusters estén dibujados
    let attempts = 0;
    const maxAttempts = 5;
    function retrySpacing() {
      recalculateClusterSpacing(clusters);
      attempts++;
      if (attempts < maxAttempts) {
        setTimeout(retrySpacing, 120);
      }
    }
    setTimeout(retrySpacing, 120);

  } catch (err) {
    console.error('Error general en drawMultipleTrees:', err);
  }

  // NO llamar applyAutoZoom aquí - se llamará desde el callback de initDiagram
  // applyAutoZoom();
}

// Función para recalcular el espaciado entre clusters
function recalculateClusterSpacing(clusters) {
  if (clusters.length <= 1) return;

  let currentX = 150; // Margen inicial
  // spacing controla la separación horizontal entre clusters (diagram-group):
  //   - Un valor negativo los acerca o superpone
  //   - Un valor positivo los separa más
  //   - Ajusta este valor según el efecto visual deseado
  const spacing = -1400; // Spacing negativo para clusters muy juntos (ajustable)

  clusters.forEach((cluster, index) => {
    const treeGroup = cluster.treeGroup;
    // Usar el bounding box real del grupo
    const bbox = treeGroup.node().getBBox();
    
    // Calcular nueva posición X basada en el borde izquierdo del grupo
    const newX = currentX - bbox.x;
    
    // Aplicar nueva transformación
    treeGroup.attr("transform", `translate(${newX}, 100)`);
    
    // Actualizar posición para el siguiente cluster
    currentX = newX + bbox.width + spacing;
  });
}

function applyAutoZoom() {
  console.log('[Zoom] applyAutoZoom iniciado - Llamada única');
  console.log('[Zoom] zoom behavior definido:', !!zoom);
  
  // Aplicar zoom inmediatamente sin delays
  const svg = d3.select("#main-diagram-svg");
  const g = svg.select("g");
  
  // Verificar que el contenido esté listo
  if (g.empty() || g.node().getBBox().width === 0 || g.node().getBBox().height === 0) {
    console.warn("❗ Contenido no listo para zoom automático");
    return;
  }

  const bounds = g.node().getBBox();
  // Obtener el ancho y alto real del SVG
  const svgElement = document.getElementById('main-diagram-svg');
  const svgWidth = svgElement ? svgElement.clientWidth || svgElement.offsetWidth : window.innerWidth;
  const svgHeight = svgElement ? svgElement.clientHeight || svgElement.offsetHeight : window.innerHeight;

  if (!bounds.width || !bounds.height) {
    console.warn("❗ Bounds inválidos para zoom automático");
    return;
  }

  // Para múltiples clusters, centrar y ajustar el zoom usando el bounding box total de todos los diagram-group
  let totalBounds = bounds;
  
  // Calcular el bounding box total de todos los diagram-group
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

  // Calcular el centro del contenido del bounding box total
  const contentCenterX = totalBounds.x + totalBounds.width / 2;
  const contentCenterY = totalBounds.y + totalBounds.height / 2;
  const svgCenterX = svgWidth / 2;
  const svgCenterY = svgHeight / 2;
  
  // Detectar si es un diagrama pequeño (4 o menos nodos)
  const nodeCount = g.selectAll(".node").size();
  const isSmallDiagram = nodeCount <= 4;
  
  console.log('[Zoom] Número de nodos detectados:', nodeCount, '¿Es diagrama pequeño?', isSmallDiagram);
  
  // Calcular el scale para ajustar el contenido al viewport
  let scaleX = (svgWidth - 100) / totalBounds.width; // 100px de margen
  let scaleY = (svgHeight - 100) / totalBounds.height; // 100px de margen
  let scale = Math.min(scaleX, scaleY, 1); // No hacer zoom in, solo out si es necesario
  
  // Para diagramas pequeños, aplicar zoom out adicional
  if (isSmallDiagram) {
    // Reducir el scale para diagramas pequeños (más zoom out)
    const smallDiagramScaleFactor = 0.8; // Ajusta este valor según necesites
    scale = Math.min(scale * smallDiagramScaleFactor, 0.8); // Máximo 0.8 para diagramas pequeños
    console.log('[Zoom] Aplicando zoom out para diagrama pequeño. Scale ajustado:', scale);
  }
  
  // Calcular la traslación para centrar el contenido
  let translateX = svgCenterX - contentCenterX * scale;
  const leftEdge = totalBounds.x * scale + translateX;
  if (leftEdge > 300) {
    translateX -= (leftEdge - 300);
  }
  const translateY = svgCenterY - contentCenterY * scale - 50; // Ajuste vertical adicional
  
  // LOGS DE CENTRADO
  console.log('[Zoom] totalBounds:', totalBounds, 'contentCenterX:', contentCenterX, 'svgCenterX:', svgCenterX, 'translateX:', translateX, 'leftEdge:', leftEdge);
  console.log('[Zoom] transform:', { translateX, translateY, scale });

  // Create the initial transformation
  const transform = d3.zoomIdentity
    .translate(translateX, translateY)
    .scale(scale);

  // Apply the transformation to the zoom behavior
  console.log('[Zoom] Aplicando transformación:', transform);
  svg.call(zoom.transform, transform);
  
  // NO aplicar zoom behavior aquí - se aplicará después de que el SVG esté visible
  // console.log('[Zoom] Aplicando zoom behavior');
  // svg.call(zoom);
  
  console.log('[Zoom] Zoom automático aplicado exitosamente');
  console.log('[Zoom] Zoom behavior se aplicará después del fade-in');
}

// Zoom behavior global ya está definido al inicio del archivo

// Función para asegurar que el zoom behavior esté activo
function ensureZoomBehavior() {
  const svg = d3.select("#main-diagram-svg");
  if (!svg.empty()) {
    // Verificar si el zoom behavior ya está aplicado de manera más robusta
    const hasZoomBehavior = svg.node().__zoom !== undefined;
    
    // Aplicar zoom behavior siempre para asegurar que funcione
    svg.call(zoom);
    
    // Verificar que se aplicó correctamente
    const hasZoomBehaviorAfter = svg.node().__zoom !== undefined;
    console.log('[Zoom] Zoom behavior aplicado:', hasZoomBehaviorAfter);
    
    // Habilitar pointer events explícitamente
    svg.style('pointer-events', 'auto');
    console.log('[Zoom] Pointer events habilitados');
  }
}

// Función de debug para verificar el estado del SVG
function debugSVGState() {
  const svg = document.getElementById('main-diagram-svg');
  if (svg) {
    const computedStyle = window.getComputedStyle(svg);
    console.log('[Debug] Estado del SVG:', {
      opacity: computedStyle.opacity,
      pointerEvents: computedStyle.pointerEvents,
      visibility: computedStyle.visibility,
      display: computedStyle.display,
      hasZoomBehavior: svg.__zoom !== undefined,
      classList: Array.from(svg.classList)
    });
  }
}

// Exportar las funciones para que estén disponibles globalmente
window.ensureZoomBehavior = ensureZoomBehavior;
window.debugSVGState = debugSVGState;
window.setupClosePanelOnSvgClick = setupClosePanelOnSvgClick;

// NO aplicar zoom behavior aquí - se aplicará después de que el diagrama esté cargado
// d3.select("#main-diagram-svg").call(zoom);

// Custom function to wrap text
function wrap(text, width) {
  const lineHeight = 1.5; // Line spacing

  text.each(function() {
    const textElement = d3.select(this);
    const words = textElement.text().split(/\s+/).reverse();
    let word;
    let line = [];
    let lineNumber = 0;
    const y = textElement.attr("y");
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

    // Center vertically if there's only one line
    if (lineNumber === 0) {
      tspan.attr("dy", getComputedStyle(document.documentElement).getPropertyValue('--label-dy-single')); // Adjust the vertical position for a single line using CSS variable
    }

  });
}

// Función createTypeDropdown removida temporalmente

// Función helper para aplicar estilos de selección (simplificada)
function applyNodeSelectionStyle(node, styleType) {
  const rect = node.select("rect");
  
  // Limpiar estilos previos
  rect.style("stroke", "none")
      .style("stroke-width", "none")
      .style("filter", "none")
      .style("animation", "none");
  
  // Solo mantener estilos para selección de nodos
  if (styleType === 'selected') {
    const focusColor = getComputedStyle(document.documentElement).getPropertyValue('--node-selection-focus');
    rect.style("stroke", focusColor)
        .style("stroke-width", "5px")
        .style("filter", `drop-shadow(0 0 6px ${focusColor}aa)`)
        .style("animation", "node-pulse 1.2s infinite alternate");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // Event listeners de búsqueda removidos temporalmente
  setupClosePanelOnSvgClick();
});

// Funciones para el panel lateral
function createSidePanel() {
  console.log("Creando panel lateral...");
  
  try {
    // Detectar si estamos dentro de un contenedor encapsulado
    const container = document.querySelector('.swanix-diagram-container');
    const targetParent = container || document.body;
    
    console.log("Contenedor encontrado:", container);
    console.log("Target parent:", targetParent);

  // Crear el panel lateral
  const sidePanel = document.createElement('div');
  sidePanel.className = 'side-panel';
  sidePanel.id = 'side-panel';
  
  sidePanel.innerHTML = `
    <div class="side-panel-header">
      <h3 class="side-panel-title">Detalles del Nodo</h3>
      <button class="side-panel-close" onclick="closeSidePanel()">×</button>
    </div>
    <div class="side-panel-content" id="side-panel-content">
      <!-- El contenido se llenará dinámicamente -->
    </div>
  `;
  
  targetParent.appendChild(sidePanel);

  // Agregar event listener para enlaces de subnodos
  sidePanel.addEventListener('click', function(e) {
    if (e.target.classList.contains('subnode-link')) {
      e.preventDefault();
      const nodeId = e.target.getAttribute('data-node-id');
      if (nodeId) {
        // Buscar y seleccionar el nodo correspondiente
        const targetNode = d3.select(`[data-id="${nodeId}"]`);
        if (!targetNode.empty()) {
          // Simular clic en el nodo
          targetNode.dispatch('click');
        }
      }
    }
  });

  // Agregar event listener para el dropdown de thumbnails (cambios persistentes)
  sidePanel.addEventListener('change', function(e) {
    if (e.target.classList.contains('thumbnail-selector-dropdown')) {
      const nodeId = e.target.getAttribute('data-node-id');
      const newThumbnailType = e.target.value;
      
      if (nodeId) {
        // Buscar el nodo en el DOM
        const targetNode = d3.select(`[data-id="${nodeId}"]`);
        if (!targetNode.empty()) {
          // Cambiar visualmente el thumbnail (persiste hasta recargar página)
          const nodeSel = targetNode;
          nodeSel.select('image').remove();

          // Usar el tipo seleccionado temporalmente
          const timestamp = Date.now();
          nodeSel.append("image")
            .attr("href", newThumbnailType ? `img/${newThumbnailType}.svg?v=${timestamp}` : `img/detail.svg?v=${timestamp}`)
            .attr("x", parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--image-x')))
            .attr("y", parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--image-y')))
            .attr("class", "image-base image-filter")
            .attr("width", parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--image-width')))
            .attr("height", parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--image-height')))
            .on("error", function() {
              // Si hay error al cargar el SVG específico, cambiar al SVG por defecto
              d3.select(this)
                .attr("xlink:href", `img/detail.svg?v=${timestamp}`);
            });
        }
      }
    }
  });

  // Añadir evento para tecla Escape
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
      closeSidePanel();
    }
  });
  
  // Aplicar el tema actual al panel lateral
  updateSidePanelTheme();
  
  console.log("Panel lateral creado exitosamente");
  } catch (error) {
    console.error("Error en createSidePanel:", error);
    throw error; // Re-lanzar el error para que se capture en el nivel superior
  }
}

function openSidePanel(nodeData) {
  console.log("Abriendo panel lateral para:", nodeData);
  const sidePanel = document.getElementById('side-panel');
  const content = document.getElementById('side-panel-content');

  console.log("Side panel encontrado:", sidePanel);
  console.log("Content encontrado:", content);

  if (!sidePanel || !content) {
    console.error("No se encontró el panel lateral o su contenido");
    console.log("Elementos en el DOM:", {
      sidePanel: document.getElementById('side-panel'),
      content: document.getElementById('side-panel-content'),
      allSidePanels: document.querySelectorAll('.side-panel')
    });
    return;
  }

  // Quitar selección previa
  d3.selectAll('.node.node-selected').classed('node-selected', false);
  // Seleccionar el nodo actual por ID
  if (nodeData && nodeData.id) {
    d3.selectAll('.node').filter(d => d.data.id == nodeData.id).classed('node-selected', true);
    
    // Log temporal para verificar las variables CSS
    const nodeSelectionFocus = getComputedStyle(document.documentElement).getPropertyValue('--node-selection-focus');
    console.log("Variable --node-selection-focus:", nodeSelectionFocus);
  }

  // Llenar el contenido del panel
  content.innerHTML = generateSidePanelContent(nodeData);

  // Abrir el panel
  sidePanel.classList.add('open');

  // Aplicar el tema actual al panel lateral
  updateSidePanelTheme();
}

function closeSidePanel() {
  const sidePanel = document.getElementById('side-panel');

  if (!sidePanel) {
    console.warn("Panel lateral no encontrado al intentar cerrar");
    return;
  }

  // Quitar selección de nodo
  d3.selectAll('.node.node-selected').classed('node-selected', false);

  // NO restaurar thumbnails al cerrar el panel - mantener los cambios del dropdown
  // Los thumbnails solo se resetean al recargar la página

  // Cerrar el panel
  sidePanel.classList.remove('open');
}

function generateSidePanelContent(nodeData) {
  const fields = [
    { key: 'id', label: 'ID', type: 'text' },
    { key: 'name', label: 'Nombre', type: 'text' },
    { key: 'subtitle', label: 'Subtítulo', type: 'text' },
    { key: 'type', label: 'Tipo', type: 'thumbnail-selector' },
    { key: 'url', label: 'URL', type: 'url' },
    { key: 'img', label: 'Imagen', type: 'image' },
    { key: 'description', label: 'Descripción', type: 'text' },
    { key: 'status', label: 'Estado', type: 'status' },
    { key: 'priority', label: 'Prioridad', type: 'priority' },
    { key: 'created_date', label: 'Fecha de Creación', type: 'text' },
    { key: 'owner', label: 'Propietario', type: 'text' },
    { key: 'department', label: 'Departamento', type: 'text' },
  ];

  let html = '<div class="side-panel-fields-table">';
  
  // Mostrar todos los campos predefinidos, tengan contenido o no
  fields.forEach(field => {
    html += `<div class="side-panel-field"><div class="side-panel-label">${field.label}</div><div class="side-panel-value">`;
    
    if (field.type === 'thumbnail-selector') {
      // Crear dropdown para seleccionar thumbnail (persiste hasta recargar página)
      html += `<select class="thumbnail-selector-dropdown" data-node-id="${nodeData.id}" title="Cambio persistente - se resetea al recargar">`;
      html += `<option value="">Sin thumbnail</option>`;
      
      // Lista de thumbnails disponibles
      const thumbnails = ['document', 'settings', 'form', 'list', 'modal', 'mosaic', 'report', 'detail', 'file-csv', 'file-pdf', 'file-xls', 'file-xml'];
      
      thumbnails.forEach(thumbName => {
        // Siempre usar el valor original del CSV, no el valor temporal del dropdown
        const selected = nodeData.type === thumbName ? 'selected' : '';
        html += `<option value="${thumbName}" ${selected}>${thumbName}</option>`;
      });
      
      html += `</select>`;
    } else if (nodeData[field.key] && nodeData[field.key] !== '') {
      if (field.type === 'url') {
        html += `<a class="side-panel-url" href="${nodeData[field.key]}" target="_blank">${nodeData[field.key]}</a>`;
      } else if (field.type === 'image') {
        html += `<img class="side-panel-image" src="${nodeData[field.key]}" alt="Imagen"/>`;
      } else if (field.type === 'status') {
        html += `<span class="status-${nodeData[field.key].toLowerCase()}">${nodeData[field.key]}</span>`;
      } else if (field.type === 'priority') {
        html += `<span class="priority-${nodeData[field.key].toLowerCase()}">${nodeData[field.key]}</span>`;
      } else {
        html += nodeData[field.key];
      }
    } else {
      html += '<span class="side-panel-value empty">No especificado</span>';
    }
    
    html += '</div></div>';
  });
  
  // Mostrar campos adicionales que no están en la lista predefinida
  const additionalFields = Object.keys(nodeData).filter(key => 
    !fields.some(field => field.key === key) && 
    key !== 'children' &&
    key !== 'parent'
  );
  
  additionalFields.forEach(key => {
    html += `<div class="side-panel-field"><div class="side-panel-label">${key}</div><div class="side-panel-value">`;
    if (nodeData[key] && nodeData[key] !== '') {
      html += nodeData[key];
    } else {
      html += '<span class="side-panel-value empty">No especificado</span>';
    }
    html += '</div></div>';
  });

  // Nodos padre como campo adicional
  html += `<div class="side-panel-field"><div class="side-panel-label">Nodos Padre</div><div class="side-panel-value">`;
  if (nodeData.parent && nodeData.parent !== '') {
    // Buscar el nodo padre en el mapa global de nodos
    const parentNode = findNodeById(nodeData.parent);
    if (parentNode) {
      const parentName = parentNode.name || '[Sin nombre]';
      html += `<a href="#" class="subnode-link" data-node-id="${nodeData.parent}">${parentName}</a>`;
    } else {
      html += `<span class="side-panel-value empty">${nodeData.parent} (no encontrado)</span>`;
    }
  } else {
    html += '<span class="side-panel-value empty">No especificado</span>';
  }
  html += '</div></div>';

  // Subnodos (hijos) como campo adicional
  html += `<div class="side-panel-field"><div class="side-panel-label">Subnodos</div><div class="side-panel-value">`;
  if (nodeData.children && Array.isArray(nodeData.children) && nodeData.children.length > 0) {
    const nombresHijos = nodeData.children.map(child => {
      const name = child.name || (child.data && child.data.name) || '[Sin nombre]';
      const childId = child.id || (child.data && child.data.id) || '';
      if (childId) {
        return `<a href="#" class="subnode-link" data-node-id="${childId}">${name}</a>`;
      } else {
        return name;
      }
    }).join(', ');
    html += nombresHijos;
  } else {
    html += '<span class="side-panel-value empty">No especificado</span>';
  }
  html += '</div></div>';
  
  html += '</div>';

  return html;
}

function getPriorityClass(priority) {
  const priorityLower = priority.toLowerCase();
  switch (priorityLower) {
    case 'crítica':
    case 'critical':
      return 'priority-critical';
    case 'alta':
    case 'high':
      return 'priority-high';
    case 'media':
    case 'medium':
      return 'priority-medium';
    case 'baja':
    case 'low':
      return 'priority-low';
    default:
      return '';
  }
}

function formatDate(dateString) {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString; // Retornar el string original si no es una fecha válida
    }
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    return dateString; // Retornar el string original si hay error
  }
}

// Función para buscar un nodo por ID en toda la jerarquía
function findNodeById(nodeId) {
  // Buscar en todos los nodos del SVG
  const allNodes = d3.selectAll('.node').data();
  for (let node of allNodes) {
    if (node.data && node.data.id === nodeId) {
      return node.data;
    }
  }
  return null;
}

// Función para actualizar todos los dropdowns de thumbnails
function updateThumbnailDropdowns() {
  const dropdowns = document.querySelectorAll('.thumbnail-selector-dropdown');
  dropdowns.forEach(dropdown => {
    const currentValue = dropdown.value;
    const nodeId = dropdown.getAttribute('data-node-id');
    
    // Limpiar opciones existentes
    dropdown.innerHTML = '<option value="">Sin thumbnail</option>';
    
    // Lista de thumbnails disponibles
    const thumbnails = ['document', 'settings', 'form', 'list', 'modal', 'mosaic', 'report', 'detail', 'file-csv', 'file-pdf', 'file-xls', 'file-xml'];
    
    thumbnails.forEach(thumbName => {
      const option = document.createElement('option');
      option.value = thumbName;
      option.textContent = thumbName;
      if (thumbName === currentValue) {
        option.selected = true;
      }
      dropdown.appendChild(option);
    });
  });
}

// Hacer las funciones globales
window.openSidePanel = openSidePanel;
window.closeSidePanel = closeSidePanel;

// Evento global para cerrar el panel al hacer clic fuera de los nodos
function setupClosePanelOnSvgClick() {
  const svg = document.querySelector('#main-diagram-svg');
  if (!svg) {
    console.warn('No se encontró el SVG principal para configurar el cierre del panel');
    return;
  }
  
  console.log('Configurando evento de cierre del panel en SVG:', svg);
  
  // Remover event listener previo si existe
  svg.removeEventListener('click', handleSvgClick);
  
  // Agregar el nuevo event listener
  svg.addEventListener('click', handleSvgClick);
  
  function handleSvgClick(event) {
    console.log('Clic en SVG detectado, target:', event.target);
    
    // Si el clic NO es sobre un nodo ni un descendiente de nodo
    if (!event.target.closest('.node')) {
      console.log('Clic fuera de nodo detectado, cerrando panel');
      closeSidePanel();
    } else {
      console.log('Clic en nodo detectado, no cerrando panel');
    }
  }
}

// === SISTEMA DE THEMES ===
// Variables globales para el sistema de temas
let currentThemeMode = 'light'; // 'light' o 'dark'
let currentTheme = 'snow'; // tema actual

function setTheme(themeId) {
  // Cerrar el panel lateral si está abierto
  const sidePanel = document.getElementById('side-panel');
  if (sidePanel && sidePanel.classList.contains('open')) {
    sidePanel.classList.remove('open');
  }
  console.log(`setTheme llamado con: ${themeId} - Stack:`, new Error().stack);
  
  // Actualizar tema actual
  currentTheme = themeId;
  
  // EJECUTAR RESET AUTOMÁTICO AL CAMBIAR TEMA
  // Limpiar todos los valores personalizados del localStorage
  const allCSSVars = [
    '--bg-color', '--text-color', '--node-fill', '--node-stroke-focus', '--label-border', '--link-color',
    '--side-panel-bg', '--side-panel-text', '--side-panel-header-bg', '--side-panel-header-border',
    '--side-panel-border', '--side-panel-label', '--side-panel-value', '--node-selection-border',
    '--node-selection-focus', '--node-selection-hover', '--node-selection-selected', '--image-filter',
    '--loading-color', '--loading-bg', '--bg-image', '--bg-opacity', '--control-bg', '--control-text',
    '--control-border', '--control-border-hover', '--control-border-focus', '--control-placeholder',
    '--control-shadow', '--control-shadow-focus', '--topbar-bg', '--topbar-text', '--sidepanel-bg', 
    '--sidepanel-text', '--sidepanel-border', '--cluster-bg', '--cluster-stroke', '--cluster-title-color'
  ];
  
  // Limpiar localStorage de valores personalizados
  allCSSVars.forEach(function(varName) {
    localStorage.removeItem(`custom_${varName}`);
  });
  
  console.log('Valores personalizados limpiados del localStorage');
  
  // Remover todas las clases de tema anteriores
  document.body.classList.remove(
    'theme-snow', 'theme-onyx', 'theme-vintage', 'theme-pastel', 'theme-neon'
  );
  
  // Agregar la nueva clase de tema
  document.body.classList.add('theme-' + themeId);
  localStorage.setItem('selectedTheme', themeId);
  
  console.log(`Clase de tema aplicada: theme-${themeId}`);
  
  // Detectar si estamos dentro de un contenedor encapsulado
  const container = document.querySelector('.swanix-diagram-container');
  const targetElement = container || document.documentElement;
  
  // Remover todas las variables CSS anteriores
  allCSSVars.forEach(function(varName) {
    targetElement.style.removeProperty(varName);
  });
  
  // Aplicar variables CSS del nuevo tema (valores puros del tema)
  const themeVariables = window.getThemeVariables(themeId);
  Object.keys(themeVariables).forEach(function(varName) {
    targetElement.style.setProperty(varName, themeVariables[varName]);
    // Aplicar también al body y html para que el fondo funcione en multi-diagramas
    document.body.style.setProperty(varName, themeVariables[varName]);
    document.documentElement.style.setProperty(varName, themeVariables[varName]);
  });
  
  // Aplicar variables CSS también al topbar y sidebar del theme creator si existen
  const topbar = document.querySelector('.topbar');
  const sidebar = document.querySelector('.sidebar');
  const mainContent = document.querySelector('.main-content');
  
  if (topbar) {
    Object.keys(themeVariables).forEach(function(varName) {
      topbar.style.setProperty(varName, themeVariables[varName]);
    });
  }
  
  if (sidebar) {
    Object.keys(themeVariables).forEach(function(varName) {
      sidebar.style.setProperty(varName, themeVariables[varName]);
    });
  }
  
  if (mainContent) {
    Object.keys(themeVariables).forEach(function(varName) {
      mainContent.style.setProperty(varName, themeVariables[varName]);
    });
  }
  
  console.log(`Variables CSS aplicadas directamente para tema: ${themeId}`);
  
  // Forzar la actualización inmediata de todos los elementos
  setTimeout(() => {
    console.log(`Actualizando colores para tema: ${themeId}`);
    
    // Verificar que las variables CSS se aplican correctamente
    const computedStyle = getComputedStyle(targetElement);
    const nodeFill = computedStyle.getPropertyValue('--node-fill');
    const textColor = computedStyle.getPropertyValue('--text-color');
    const linkColor = computedStyle.getPropertyValue('--link-color');
    
    console.log(`Variables CSS del tema ${themeId}:`, {
      '--node-fill': nodeFill,
      '--text-color': textColor,
      '--link-color': linkColor
    });
  
  // Verificar que los filtros se aplican correctamente
  const imageElements = document.querySelectorAll('image.image-filter');
  if (imageElements.length > 0) {
    const computedFilter = getComputedStyle(imageElements[0]).filter;
    console.log(`Tema ${themeId} - Filtro aplicado:`, computedFilter);
  }
  
    // Verificar variables del panel lateral
    const sidePanelBg = computedStyle.getPropertyValue('--side-panel-bg');
    const sidePanelText = computedStyle.getPropertyValue('--side-panel-text');
    console.log(`Tema ${themeId} - Variables del panel:`, { sidePanelBg, sidePanelText });
    
    // Actualizar el SVG dinámicamente
    updateSVGColors();
    
    // Actualizar el panel lateral si está abierto
    updateSidePanelTheme();
    
    // Forzar la actualización de todos los elementos del DOM que usan variables CSS
    forceUpdateAllElements();
    
    // Resetear todos los inputs del theme creator si existe
    resetThemeCreatorInputs(themeId);
    
    console.log(`Tema ${themeId} aplicado completamente con reset automático`);
  }, 50);
}

// Función para cambiar entre modo claro y oscuro
function toggleThemeMode() {
  currentThemeMode = currentThemeMode === 'light' ? 'dark' : 'light';
  
  // Aplicar tema según el modo
  const themeToApply = currentThemeMode === 'light' ? 'snow' : 'onyx';
  
  // Actualizar el botón de toggle
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    if (currentThemeMode === 'dark') {
      themeToggle.classList.add('dark-mode');
    } else {
      themeToggle.classList.remove('dark-mode');
    }
  }
  
  // Aplicar el tema correspondiente
  setTheme(themeToApply);
  
  // Guardar preferencia en localStorage
  localStorage.setItem('themeMode', currentThemeMode);
  
  console.log('Theme mode toggled to:', currentThemeMode);
}

// Función para inicializar el sistema de temas
function initializeThemeSystem() {
  // Cargar preferencia guardada o usar 'light' por defecto
  const savedMode = localStorage.getItem('themeMode') || 'light';
  currentThemeMode = savedMode;
  
  // Configurar el botón de toggle
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    if (currentThemeMode === 'dark') {
      themeToggle.classList.add('dark-mode');
    }
    
    // Agregar event listener
    themeToggle.addEventListener('click', toggleThemeMode);
  }
  
  // Aplicar tema inicial
  const initialTheme = currentThemeMode === 'light' ? 'snow' : 'onyx';
  setTheme(initialTheme);
  
  console.log('Theme system initialized with mode:', currentThemeMode);
}

// Función para obtener las variables CSS de cada tema
window.getThemeVariables = function(themeId) {
  const themes = {
    'snow': {
      '--bg-color': '#ecf2fd',
      '--text-color': '#222',
      '--node-fill': '#fff',
      '--node-stroke-focus': '#1976d2',
      '--label-border': '#bdbdbd',
      '--link-color': '#999',
      '--side-panel-bg': '#fff',
      '--side-panel-text': '#222',
      '--side-panel-header-bg': '#f8f9fa',
      '--side-panel-header-border': '#dee2e6',
      '--side-panel-border': '#e0e0e0',
      '--side-panel-label': '#666',
      '--side-panel-value': '#222',
      '--node-selection-border': '#e0e0e0',
      '--node-selection-focus': '#1976d2',
      '--node-selection-hover': '#bdbdbd',
      '--node-selection-selected': '#1976d2',
      '--image-filter': 'grayscale(30%)',
      '--loading-color': '#1976d2',
      '--loading-bg': '#ffffff',
      '--bg-image': 'url("img/backgrounds/light-pattern.svg")',
      '--bg-opacity': '0.9',
      '--control-bg': '#ffffff',
      '--control-text': '#333333',
      '--control-border': '#d1d5db',
      '--control-border-hover': '#9ca3af',
      '--control-border-focus': '#1976d2',
      '--control-placeholder': '#9ca3af',
      '--control-shadow': 'rgba(0, 0, 0, 0.1)',
      '--control-shadow-focus': 'rgba(25, 118, 210, 0.2)',
      '--topbar-bg': '#ffffff',
      '--topbar-text': '#333333',
      '--sidepanel-bg': '#ffffff',
      '--sidepanel-text': '#333333',
      '--sidepanel-border': '#dddddd',
      '--cluster-bg': 'rgba(0,0,0,0.05)',
      '--cluster-stroke': 'rgba(0,0,0,0.1)',
      '--cluster-title-color': '#222'
    },
    'onyx': {
      '--bg-color': '#181c24',
      '--text-color': '#f6f7f9',
      '--node-fill': '#23272f',
      '--node-stroke-focus': '#00eaff',
      '--label-border': '#444',
      '--link-color': '#666',
      '--side-panel-bg': '#23272f',
      '--side-panel-text': '#f6f7f9',
      '--side-panel-header-bg': '#23272f',
      '--side-panel-header-border': '#333',
      '--side-panel-border': '#333',
      '--side-panel-label': '#aaa',
      '--side-panel-value': '#fff',
      '--node-selection-border': '#444',
      '--node-selection-focus': '#00eaff',
      '--node-selection-hover': '#555',
      '--node-selection-selected': '#00eaff',
      '--image-filter': 'invert(100%) brightness(3.5) contrast(200%)',
      '--loading-color': '#00eaff',
      '--loading-bg': '#23272f',
      '--bg-image': 'url("img/backgrounds/dark-grid.svg")',
      '--bg-opacity': '0.9',
      '--control-bg': '#2d3748',
      '--control-text': '#e2e8f0',
      '--control-border': '#4a5568',
      '--control-border-hover': '#718096',
      '--control-border-focus': '#00eaff',
      '--control-placeholder': '#a0aec0',
      '--control-shadow': 'rgba(0, 0, 0, 0.3)',
      '--control-shadow-focus': 'rgba(0, 234, 255, 0.3)',
      '--topbar-bg': '#23272f',
      '--topbar-text': '#f6f7f9',
      '--sidepanel-bg': '#23272f',
      '--sidepanel-text': '#f6f7f9',
      '--sidepanel-border': '#333',
      '--cluster-bg': 'rgba(255,255,255,0.02)',
      '--cluster-stroke': 'rgba(255,255,255,0.1)',
      '--cluster-title-color': '#00eaff'
    },
    'vintage': {
      '--bg-color': '#f5e9da',
      '--text-color': '#7c4f20',
      '--node-fill': '#fffbe6',
      '--node-stroke-focus': '#b97a56',
      '--label-border': '#b97a56',
      '--link-color': '#b97a56',
      '--side-panel-bg': '#fffbe6',
      '--side-panel-text': '#7c4f20',
      '--side-panel-header-bg': '#f5e9da',
      '--side-panel-header-border': '#b97a56',
      '--side-panel-border': '#b97a56',
      '--side-panel-label': '#b97a56',
      '--side-panel-value': '#7c4f20',
      '--node-selection-border': '#b97a56',
      '--node-selection-focus': '#8b4513',
      '--node-selection-hover': '#a0522d',
      '--node-selection-selected': '#8b4513',
      '--image-filter': 'sepia(40%) brightness(1.1)',
      '--loading-color': '#8b4513',
      '--loading-bg': '#fffbe6',
      '--bg-image': 'url("img/backgrounds/vintage-texture.svg")',
      '--bg-opacity': '0.8',
      '--control-bg': '#fef7e0',
      '--control-text': '#5d4037',
      '--control-border': '#d4a574',
      '--control-border-hover': '#b97a56',
      '--control-border-focus': '#8b4513',
      '--control-placeholder': '#a1887f',
      '--control-shadow': 'rgba(139, 69, 19, 0.2)',
      '--control-shadow-focus': 'rgba(139, 69, 19, 0.4)',
      '--topbar-bg': '#fffbe6',
      '--topbar-text': '#7c4f20',
      '--sidepanel-bg': '#fffbe6',
      '--sidepanel-text': '#7c4f20',
      '--sidepanel-border': '#b97a56',
      '--cluster-bg': 'rgba(139,69,19,0.05)',
      '--cluster-stroke': 'rgba(139,69,19,0.1)',
      '--cluster-title-color': '#7c4f20'
    },
    'pastel': {
      '--bg-color': '#fdf6fb',
      '--text-color': '#7a7a7a',
      '--node-fill': '#fff',
      '--node-stroke-focus': '#b6b6f7',
      '--label-border': '#e0b1cb',
      '--link-color': '#b6b6f7',
      '--side-panel-bg': '#fff',
      '--side-panel-text': '#7a7a7a',
      '--side-panel-header-bg': '#fdf6fb',
      '--side-panel-header-border': '#e0b1cb',
      '--side-panel-border': '#e0b1cb',
      '--side-panel-label': '#b6b6f7',
      '--side-panel-value': '#7a7a7a',
      '--node-selection-border': '#e0b1cb',
      '--node-selection-focus': '#b6b6f7',
      '--node-selection-hover': '#d4a5c0',
      '--node-selection-selected': '#b6b6f7',
      '--image-filter': 'hue-rotate(15deg) saturate(0.8)',
      '--loading-color': '#b6b6f7',
      '--loading-bg': '#ffffff',
      '--bg-image': 'url("img/backgrounds/pastel-dots.svg")',
      '--bg-opacity': '0.85',
      '--control-bg': '#ffffff',
      '--control-text': '#7a7a7a',
      '--control-border': '#e8d5e0',
      '--control-border-hover': '#d4a5c0',
      '--control-border-focus': '#b6b6f7',
      '--control-placeholder': '#c4a8b8',
      '--control-shadow': 'rgba(182, 182, 247, 0.2)',
      '--control-shadow-focus': 'rgba(182, 182, 247, 0.4)',
      '--topbar-bg': '#ffffff',
      '--topbar-text': '#7a7a7a',
      '--sidepanel-bg': '#ffffff',
      '--sidepanel-text': '#7a7a7a',
      '--sidepanel-border': '#e0b1cb',
      '--cluster-bg': 'rgba(182,182,247,0.05)',
      '--cluster-stroke': 'rgba(182,182,247,0.1)',
      '--cluster-title-color': '#b6b6f7'
    },
    'neon': {
      '--bg-color': '#0f0026',
      '--text-color': '#00ffe7',
      '--node-fill': '#1a0033',
      '--node-stroke-focus': '#ff00c8',
      '--label-border': '#00ffe7',
      '--link-color': '#ff00c8',
      '--side-panel-bg': '#1a0033',
      '--side-panel-text': '#00ffe7',
      '--side-panel-header-bg': '#0f0026',
      '--side-panel-header-border': '#ff00c8',
      '--side-panel-border': '#ff00c8',
      '--side-panel-label': '#ff00c8',
      '--side-panel-value': '#00ffe7',
      '--node-selection-border': '#ff00c8',
      '--node-selection-focus': '#00ffe7',
      '--node-selection-hover': '#ff33d6',
      '--node-selection-selected': '#00ffe7',
      '--image-filter': 'invert(100%) brightness(3.5) contrast(200%)',
      '--loading-color': '#00ffe7',
      '--loading-bg': '#1a0033',
      '--bg-image': 'url("img/backgrounds/neon-grid.svg")',
      '--bg-opacity': '0.9',
      '--control-bg': '#2a0040',
      '--control-text': '#00ffe7',
      '--control-border': '#ff00c8',
      '--control-border-hover': '#ff33d6',
      '--control-border-focus': '#00ffe7',
      '--control-placeholder': '#7a4d8a',
      '--control-shadow': 'rgba(255, 0, 200, 0.3)',
      '--control-shadow-focus': 'rgba(0, 255, 231, 0.4)',
      '--topbar-bg': '#1a0033',
      '--topbar-text': '#00ffe7',
      '--sidepanel-bg': '#1a0033',
      '--sidepanel-text': '#00ffe7',
      '--sidepanel-border': '#ff00c8',
      '--cluster-bg': 'rgba(0,255,231,0.05)',
      '--cluster-stroke': 'rgba(0,255,231,0.1)',
      '--cluster-title-color': '#00ffe7'
    }
  };
  
  return themes[themeId] || themes['snow'];
}

// Función para actualizar colores del SVG dinámicamente
function updateSVGColors() {
  console.log('Actualizando colores del SVG...');
  
  // Detectar si estamos dentro de un contenedor encapsulado
  const container = document.querySelector('.swanix-diagram-container');
  const targetElement = container || document.documentElement;
  
  // Obtener las variables CSS del tema actual
  const computedStyle = getComputedStyle(targetElement);
  
  // Variables del tema
  const textColor = computedStyle.getPropertyValue('--text-color');
  const nodeFill = computedStyle.getPropertyValue('--node-fill');
  const labelBorder = computedStyle.getPropertyValue('--label-border');
  const linkColor = computedStyle.getPropertyValue('--link-color');
  const imageFilter = computedStyle.getPropertyValue('--image-filter');
  
  // Variables específicas de clusters
  const clusterBg = computedStyle.getPropertyValue('--cluster-bg');
  const clusterStroke = computedStyle.getPropertyValue('--cluster-stroke');
  const clusterTitleColor = computedStyle.getPropertyValue('--cluster-title-color');
  
  console.log('Variables del tema:', {
    textColor,
    nodeFill,
    labelBorder,
    linkColor,
    imageFilter,
    clusterBg,
    clusterStroke,
    clusterTitleColor
  });
  
  // Actualizar colores de texto de los nodos
  d3.selectAll('.custom-text')
    .style('fill', textColor);
  
  d3.selectAll('.id-text')
    .style('fill', textColor);
  
  d3.selectAll('.subtitle-text')
    .style('fill', textColor);
  
  // Actualizar colores de enlaces
  d3.selectAll('.link')
    .style('stroke', linkColor);
  
  // Actualizar filtros de imágenes
  d3.selectAll('.image-filter')
    .style('filter', imageFilter);
  
  // Actualizar colores de fondo y borde de los nodos
  d3.selectAll('.node rect')
    .style('fill', nodeFill)
    .style('stroke', labelBorder);
  
  // Forzar la actualización de todos los nodos
  d3.selectAll('.node').each(function() {
    const node = d3.select(this);
    
    // Actualizar el rectángulo del nodo
    node.select('rect')
      .style('fill', nodeFill)
      .style('stroke', labelBorder);
    
    // Actualizar el texto del nodo
    node.select('.custom-text')
      .style('fill', textColor);
    
    // Actualizar el texto del ID si existe
    node.select('.id-text')
      .style('fill', textColor);
    
    // Actualizar el texto del subtítulo si existe
    node.select('.subtitle-text')
      .style('fill', textColor);
    
    // Actualizar la imagen del nodo
    node.select('image')
      .style('filter', imageFilter);
  });
  
  // Actualizar colores de clusters
  if (clusterBg && clusterBg.trim() !== '') {
    d3.selectAll('.cluster-rect')
      .style('fill', clusterBg);
  }
  
  if (clusterStroke && clusterStroke.trim() !== '') {
    d3.selectAll('.cluster-rect')
      .style('stroke', clusterStroke);
  }
  
  if (clusterTitleColor && clusterTitleColor.trim() !== '') {
    d3.selectAll('.cluster-title')
      .style('fill', clusterTitleColor);
  }
  
  console.log('Colores del SVG actualizados completamente');
}

// Función para forzar la actualización de todos los elementos que usan variables CSS
function forceUpdateAllElements() {
  console.log('Forzando actualización de todos los elementos...');
  
  // Detectar si estamos dentro de un contenedor encapsulado
  const container = document.querySelector('.swanix-diagram-container');
  const targetElement = container || document.documentElement;
  
  // Obtener las variables CSS del tema actual
  const computedStyle = getComputedStyle(targetElement);
  
  // Forzar la actualización de elementos específicos que podrían tener estilos en línea
  const elementsToUpdate = [
    { selector: '.side-panel', properties: ['background-color', 'color', 'border-color'] },
    { selector: '.side-panel-header', properties: ['background-color', 'border-color'] },
    { selector: '.side-panel-title', properties: ['color'] },
    { selector: '.side-panel-close', properties: ['background-color', 'color', 'border-color'] },
    { selector: '.side-panel-label', properties: ['color'] },
    { selector: '.side-panel-value', properties: ['color'] },
    { selector: '.control-item', properties: ['background-color', 'color', 'border-color'] },
    { selector: '.theme-selector', properties: ['background-color', 'color', 'border-color'] },
    { selector: '.topbar', properties: ['background-color', 'color'] },
    { selector: '.diagram-title', properties: ['color'] }
  ];
  
  elementsToUpdate.forEach(function(elementConfig) {
    const elements = document.querySelectorAll(elementConfig.selector);
    elements.forEach(function(element) {
      // Remover estilos en línea que podrían estar sobrescribiendo las variables CSS
      elementConfig.properties.forEach(function(property) {
        element.style.removeProperty(property);
      });
    });
  });
  
  console.log('Actualización forzada completada');
}

// Función para resetear todos los inputs del theme creator
function resetThemeCreatorInputs(themeId) {
  console.log('Reseteando inputs del theme creator para tema:', themeId);
  
  // Obtener los valores del tema seleccionado
  const themeVariables = window.getThemeVariables(themeId);
  
  // Resetear todos los inputs de texto
  const textInputs = document.querySelectorAll('.text-input');
  textInputs.forEach(function(input) {
    const varName = input.getAttribute('data-var');
    if (varName && themeVariables[varName]) {
      input.value = themeVariables[varName];
      console.log(`Input ${varName} reseteado a:`, themeVariables[varName]);
    }
  });
  
  // Resetear todos los color pickers
  const colorPickers = document.querySelectorAll('.color-picker input[type="color"]');
  colorPickers.forEach(function(colorInput) {
    const varName = colorInput.getAttribute('data-var');
    if (varName && themeVariables[varName]) {
      const colorValue = themeVariables[varName];
      // Solo actualizar si es un color válido (hex)
      if (colorValue.match(/^#[0-9A-F]{6}$/i)) {
        colorInput.value = colorValue;
        // Actualizar el color visual del picker
        const pickerElement = colorInput.closest('.color-picker');
        if (pickerElement) {
          pickerElement.style.setProperty('--picker-color', colorValue);
          pickerElement.style.backgroundColor = colorValue;
        }
        console.log(`Color picker ${varName} reseteado a:`, colorValue);
      }
    }
  });
  
  console.log('Inputs del theme creator reseteados completamente');
}

// Función para actualizar el tema del panel lateral
function updateSidePanelTheme() {
  console.log('Actualizando tema del panel lateral...');
  
  const sidePanel = document.querySelector('.side-panel');
  if (!sidePanel) {
    console.log('Panel lateral no encontrado');
    return;
  }
  
  // Detectar si estamos dentro de un contenedor encapsulado
  const container = document.querySelector('.swanix-diagram-container');
  const targetElement = container || document.documentElement;
  
  // Obtener las variables CSS del tema actual
  const computedStyle = getComputedStyle(targetElement);
  
  // Log de depuración para verificar las variables
  const sidePanelBg = computedStyle.getPropertyValue('--side-panel-bg');
  const sidePanelText = computedStyle.getPropertyValue('--side-panel-text');
  const sidePanelHeaderBg = computedStyle.getPropertyValue('--side-panel-header-bg');
  
  console.log('Variables CSS del tema:', {
    '--side-panel-bg': sidePanelBg,
    '--side-panel-text': sidePanelText,
    '--side-panel-header-bg': sidePanelHeaderBg
  });
  
  // NO aplicar estilos en línea al panel, header, título y contenido
  // Dejar que las variables CSS hagan el trabajo automáticamente
  
  // Los dropdowns de thumbnails ahora usan variables CSS del tema
  // No es necesario aplicar estilos inline
  
  console.log('Tema del panel lateral actualizado');
}

// Hacer las funciones globales para que el theme creator pueda usarlas
window.updateSVGColors = updateSVGColors;
window.setTheme = setTheme;
window.openSidePanel = openSidePanel;
window.closeSidePanel = closeSidePanel;
window.toggleThemeMode = toggleThemeMode;
window.initializeThemeSystem = initializeThemeSystem;
window.applyAutoZoom = applyAutoZoom;

// Configurar el selector de tema cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  // Inicializar el sistema de temas (toggle dark/light) solo si no está ya inicializado
  if (!window.themeSystemInitialized) {
    initializeThemeSystem();
    window.themeSystemInitialized = true;
  }
  
  const selector = document.getElementById('theme-selector');
  if (selector) {
    // Restaurar tema guardado
    const saved = localStorage.getItem('selectedTheme') || 'snow';
    selector.value = saved;
    setTheme(saved);
    
    // Agregar event listener para cambios de tema
    selector.addEventListener('change', function() {
      console.log('Cambiando tema a:', this.value);
      setTheme(this.value);
    });
  }
});