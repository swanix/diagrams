/* Swanix Diagrams v0.1.0 */
/* Based on D3.js */


function initDiagram(csvUrl) {
  console.log("Iniciando carga del diagrama...");
  const loadingElement = document.querySelector(".diagram-container #loading");
  const errorElement = document.querySelector(".diagram-container #error-message");
  
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
        createSidePanel();
        console.log("Panel lateral creado");
        
        console.log("Creando dropdown de tipos...");
        createTypeDropdown(data);
        console.log("Dropdown creado");
        
        console.log("Ocultando loading...");
        if (loadingElement) loadingElement.style.display = "none";
        console.log("Diagrama cargado completamente");
      } catch (error) {
        console.error("Error durante la inicialización:", error);
        if (errorElement) errorElement.innerText = `Error: ${error.message}`;
        if (loadingElement) loadingElement.style.display = "none";
      }
    },
    error: function(err) {
      console.error("Error al cargar CSV:", err);
      if (errorElement) errorElement.innerText = `CSV File ${err.message}`;
      if (loadingElement) loadingElement.style.display = "none";
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
  
  // Asegurar que solo trabajamos con el SVG del contenedor del diagrama
  const diagramContainer = document.querySelector(".diagram-container");
  if (!diagramContainer) {
    console.error("No se encontró el contenedor del diagrama");
    return;
  }
  
  let svg = diagramContainer.querySelector("svg");
  if (!svg) {
    console.error("No se encontró el SVG en el contenedor del diagrama");
    return;
  }
  
  // Limpiar cualquier contenido previo del SVG
  svg.innerHTML = "";
  console.log("SVG seleccionado:", svg);
  
  const g = d3.select(svg).append("g");

  let xOffset = 150; // Initial margin from left edge
  let treeSpacingX = 3400; // Minimum space between trees

  trees.forEach((data, index) => {
    const root = d3.hierarchy(data);
    const treeLayout = d3.tree()
      .nodeSize([120, 180]); // Adjust these values to control the separation

    treeLayout(root);

    const treeGroup = g.append("g")
      .attr("transform", `translate(${xOffset}, 100)`);

    xOffset += treeSpacingX;

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
        console.log("Nodo clickeado:", d.data);
        // Prevenir que el clic se propague al zoom
        event.stopPropagation();
        // Abrir el panel lateral con los datos del nodo
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
  });

  applyAutoZoom();
}

function applyAutoZoom() {
  // Wait for DOM to be fully loaded
  setTimeout(() => {
    const svg = d3.select("svg");
    const g = svg.select("g");
    // Hide SVG initially
    svg.style("opacity", 0);
    // Try multiple times until the diagram is ready
    let attempts = 0;
    const maxAttempts = 10;
    
    function tryZoom() {
      if (attempts >= maxAttempts) {
        console.warn("❗ Could not apply automatic zoom after multiple attempts");
        return;
      }

      if (g.empty() || g.node().getBBox().width === 0 || g.node().getBBox().height === 0) {
        attempts++;
        setTimeout(tryZoom, 100);
        return;
      }

      const bounds = g.node().getBBox();
      const svgWidth = window.innerWidth;
      const svgHeight = window.innerHeight;

      if (!bounds.width || !bounds.height) {
        attempts++;
        setTimeout(tryZoom, 100);
        return;
      }

      // Calculate the final scale
      const scale = Math.min(svgWidth / bounds.width, svgHeight / bounds.height) * 0.75;
      const translateX = svgWidth / 2 - (bounds.x + bounds.width / 2) * scale;
      const translateY = svgHeight / 2 - (bounds.y + bounds.height / 2) * scale;

      // Create the initial transformation
      const transform = d3.zoomIdentity
        .translate(translateX, translateY)
        .scale(scale);

      // Apply the transformation to the zoom behavior
      svg.call(zoom.transform, transform);

      // Show the SVG with a smooth transition
      svg.transition()
        .duration(800)
        .style("opacity", 1);

      // Reapply zoom behavior to ensure it works
      svg.call(zoom);
    }

    tryZoom();
  }, 100);
}

const zoom = d3.zoom().scaleExtent([0.1, 4]).on("zoom", event => {
  d3.select("svg g").attr("transform", event.transform);
});

d3.select("svg").call(zoom);

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

function createTypeDropdown(data) {
  // Obtener el dropdown del topbar
  const typeDropdown = document.getElementById("type-dropdown");
  
  // Agregar opción por defecto "All" con contador
  const allCount = data.length;
  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = `Todos los tipos (${allCount})`;
  typeDropdown.appendChild(allOption);

  // Obtener las opciones únicas de type
  const types = [...new Set(data.map(d => d.type))];
  types.forEach(type => {
    const count = data.filter(d => d.type === type).length;
    const option = document.createElement("option");
    option.value = type;
    option.textContent = `${type || "Sin tipo"} (${count})`;
    typeDropdown.appendChild(option);
  });

  // Evento para seleccionar tipo
  typeDropdown.addEventListener("change", function() {
    const selectedType = this.value;
    const searchTerm = document.getElementById("search-input").value.toLowerCase();

    d3.selectAll(".node").each(function(d) {
      const node = d3.select(this);
      const nodeGroup = node.node().parentNode;
      const matchesSearch = !searchTerm || d.data.name.toLowerCase().includes(searchTerm);
      const matchesType = selectedType === "all" || d.data.type === selectedType;
      
      if (matchesSearch && matchesType) {
        // Mostrar el nodo
        nodeGroup.style.opacity = "1";
        nodeGroup.style.pointerEvents = "auto";
        // Resaltar según el criterio activo
        if (searchTerm && d.data.name.toLowerCase().includes(searchTerm)) {
          // Resaltar por búsqueda
          applyNodeSelectionStyle(node, 'search');
        } else if (selectedType !== "all" && d.data.type === selectedType) {
          // Resaltar por tipo con el mismo estilo que nodos seleccionados
          applyNodeSelectionStyle(node, 'type-filter');
        } else {
          // Sin resaltado
          applyNodeSelectionStyle(node, 'none');
        }
      } else {
        // Ocultar el nodo pero mantenerlo clickeable
        nodeGroup.style.opacity = "0.3";
        nodeGroup.style.pointerEvents = "none";
      }
    });
  });

  // Función para crear el botón de zoom hacia el nodo seleccionado
  // createZoomToNodeButton(); // Comentado temporalmente
}

// Función helper para aplicar estilos de selección consistentes
function applyNodeSelectionStyle(node, styleType) {
  const rect = node.select("rect");
  
  // Limpiar estilos previos
  rect.style("stroke", "none")
      .style("stroke-width", "none")
      .style("filter", "none")
      .style("animation", "none");
  
  switch (styleType) {
    case 'type-filter':
      // Estilo para filtro por tipo (igual que nodos seleccionados)
      const focusColor = getComputedStyle(document.documentElement).getPropertyValue('--node-selection-focus');
      rect.style("stroke", focusColor)
          .style("stroke-width", "5px")
          .style("filter", `drop-shadow(0 0 6px ${focusColor}aa)`)
          .style("animation", "node-pulse 1.2s infinite alternate");
      break;
      
    case 'search':
      // Estilo para búsqueda (blanco con sombra)
      rect.style("stroke", "white")
          .style("stroke-width", "4px")
          .style("filter", "drop-shadow(0 0 6px rgba(255,255,255,0.6))");
      break;
      
    case 'none':
    default:
      // Sin estilos
      break;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // Obtener el campo de búsqueda del topbar
  const searchInput = document.getElementById("search-input");

  // Evento para buscar nodos
  searchInput.addEventListener("input", function() {
    const searchTerm = this.value.toLowerCase();
    const selectedType = document.getElementById("type-dropdown").value;
    
    d3.selectAll(".node").each(function(d) {
      const node = d3.select(this);
      const nodeGroup = node.node().parentNode;
      const matchesSearch = !searchTerm || d.data.name.toLowerCase().includes(searchTerm);
      const matchesType = selectedType === "all" || d.data.type === selectedType;
      
      if (matchesSearch && matchesType) {
        // Mostrar el nodo
        nodeGroup.style.opacity = "1";
        nodeGroup.style.pointerEvents = "auto";
        // Resaltar si coincide con la búsqueda
        if (searchTerm) {
          applyNodeSelectionStyle(node, 'search');
        } else {
          // Quitar resaltado si no hay término de búsqueda
          applyNodeSelectionStyle(node, 'none');
        }
      } else {
        // Ocultar el nodo pero mantenerlo clickeable
        nodeGroup.style.opacity = "0.3";
        nodeGroup.style.pointerEvents = "none";
      }
    });
  });

  // Agregar evento para presionar "Enter"
  searchInput.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
      const searchTerm = this.value.toLowerCase();
      const foundNode = d3.selectAll(".node").filter(d => d.data.name.toLowerCase().includes(searchTerm));

      if (!foundNode.empty()) {
        const bounds = foundNode.node().getBBox();
        const svg = d3.select("svg");
        const svgWidth = window.innerWidth;
        const svgHeight = window.innerHeight;

        // Calcular la escala y la traducción para centrar el nodo
        const scale = Math.min(svgWidth / bounds.width, svgHeight / bounds.height) * 0.9;
        const translateX = (svgWidth / 2) - (bounds.x + bounds.width / 2) * scale;
        const translateY = (svgHeight / 2) - (bounds.y + bounds.height / 2) * scale;

        // Crear la transformación inicial
        const transform = d3.zoomIdentity.translate(translateX, translateY).scale(scale);

        // Aplicar la transformación con una transición suave
        svg.transition()
          .duration(800)
          .call(zoom.transform, transform);
      }
    }
  });

  setupClosePanelOnSvgClick();
});

// Funciones para el panel lateral
function createSidePanel() {
  console.log("Creando panel lateral...");
  // No crear overlay

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
  
  document.body.appendChild(sidePanel);

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
}

function openSidePanel(nodeData) {
  console.log("Abriendo panel lateral para:", nodeData);
  const sidePanel = document.getElementById('side-panel');
  const content = document.getElementById('side-panel-content');

  if (!sidePanel || !content) {
    console.error("No se encontró el panel lateral o su contenido");
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

  // Prevenir el scroll del body
  document.body.style.overflow = 'hidden';
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

  // Restaurar el scroll del body
  document.body.style.overflow = '';
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
  const svg = document.querySelector('svg');
  if (!svg) return;
  svg.addEventListener('click', function(event) {
    // Si el clic NO es sobre un nodo ni un descendiente de nodo
    if (!event.target.closest('.node')) {
      closeSidePanel();
    }
  });
}

// === SISTEMA DE THEMES ===
function setTheme(themeId) {
  document.body.classList.remove(
    'theme-light', 'theme-dark', 'theme-vintage', 'theme-pastel', 'theme-cyberpunk', 'theme-neon'
  );
  document.body.classList.add('theme-' + themeId);
  localStorage.setItem('selectedTheme', themeId);
  
  // Log temporal para verificar que las variables se aplican
  const nodeSelectionFocus = getComputedStyle(document.documentElement).getPropertyValue('--node-selection-focus');
  console.log(`Tema ${themeId} - Variable --node-selection-focus:`, nodeSelectionFocus);
  
  // Verificar que los filtros se aplican correctamente
  const imageElements = document.querySelectorAll('image.image-filter');
  if (imageElements.length > 0) {
    const computedFilter = getComputedStyle(imageElements[0]).filter;
    console.log(`Tema ${themeId} - Filtro aplicado:`, computedFilter);
  }
  
  // Verificar variables del panel lateral
  const sidePanelBg = getComputedStyle(document.documentElement).getPropertyValue('--side-panel-bg');
  const sidePanelText = getComputedStyle(document.documentElement).getPropertyValue('--side-panel-text');
  console.log(`Tema ${themeId} - Variables del panel:`, { sidePanelBg, sidePanelText });
  
  // Actualizar el SVG dinámicamente
  updateSVGColors();
  
  // Actualizar el panel lateral si está abierto
  updateSidePanelTheme();
}

// Función para actualizar colores del SVG dinámicamente
function updateSVGColors() {
  console.log('Actualizando colores del SVG...');
  
  // Actualizar colores de texto
  d3.selectAll('.custom-text')
    .style('fill', getComputedStyle(document.documentElement).getPropertyValue('--text-color'));
  
  d3.selectAll('.id-text')
    .style('fill', getComputedStyle(document.documentElement).getPropertyValue('--label-id-text-color'));
  
  d3.selectAll('.subtitle-text')
    .style('fill', getComputedStyle(document.documentElement).getPropertyValue('--text-subtitle-color'));
  
  // Actualizar colores de enlaces
  d3.selectAll('.link')
    .style('stroke', getComputedStyle(document.documentElement).getPropertyValue('--link-color'));
  
  // Actualizar filtros de imágenes
  const imageFilter = getComputedStyle(document.documentElement).getPropertyValue('--image-filter');
  d3.selectAll('.image-filter')
    .style('filter', imageFilter);
  
  // Actualizar colores de fondo de nodos
  d3.selectAll('.node rect')
    .style('fill', getComputedStyle(document.documentElement).getPropertyValue('--node-fill'))
    .style('stroke', getComputedStyle(document.documentElement).getPropertyValue('--label-border'));
  
  console.log('Colores del SVG actualizados');
}

// Función para actualizar el tema del panel lateral
function updateSidePanelTheme() {
  console.log('Actualizando tema del panel lateral...');
  
  const sidePanel = document.querySelector('.side-panel');
  if (!sidePanel) {
    console.log('Panel lateral no encontrado');
    return;
  }
  
  // Obtener las variables CSS del tema actual
  const computedStyle = getComputedStyle(document.documentElement);
  
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
  
  // Solo actualizar dropdowns de thumbnails (necesario en algunos navegadores)
  const dropdowns = sidePanel.querySelectorAll('.thumbnail-selector-dropdown');
  dropdowns.forEach(dropdown => {
    dropdown.style.backgroundColor = sidePanelBg;
    dropdown.style.color = sidePanelText;
    dropdown.style.borderColor = computedStyle.getPropertyValue('--side-panel-border');
  });
  
  // Actualizar opciones de los dropdowns
  const options = sidePanel.querySelectorAll('.thumbnail-selector-dropdown option');
  options.forEach(option => {
    option.style.backgroundColor = sidePanelBg;
    option.style.color = sidePanelText;
  });
  
  console.log('Tema del panel lateral actualizado');
}

// Hacer la función global para que el theme creator pueda usarla
window.updateSVGColors = updateSVGColors;

document.addEventListener('DOMContentLoaded', function() {
  const selector = document.getElementById('theme-selector');
  // Restaurar tema guardado
  const saved = localStorage.getItem('selectedTheme') || 'light';
  selector.value = saved;
  setTheme(saved);
  selector.addEventListener('change', function() {
    setTheme(this.value);
  });
});