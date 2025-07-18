/* Swanix Diagrams v0.1.0 */
/* Based on D3.js */


function initDiagram(csvUrl) {
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
        createTypeDropdown(data);
        console.log("Dropdown creado");
        
        console.log("Ocultando loading...");
        if (loadingElement) loadingElement.style.display = "none";
        
        // Aplicar el tema actual después de que el diagrama esté completamente cargado
        const currentTheme = localStorage.getItem('selectedTheme') || 'light';
        console.log("Aplicando tema actual:", currentTheme);
        setTheme(currentTheme);
        
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
  
  // Buscar el SVG directamente en el body
  let svg = document.querySelector("svg");
  if (!svg) {
    console.error("No se encontró el SVG en el documento");
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
  console.log(`Aplicando tema: ${themeId}`);
  
  // EJECUTAR RESET AUTOMÁTICO AL CAMBIAR TEMA
  // Limpiar todos los valores personalizados del localStorage
  const allCSSVars = [
    '--bg-color', '--text-color', '--node-fill', '--node-stroke-focus', '--label-border', '--link-color',
    '--side-panel-bg', '--side-panel-text', '--side-panel-header-bg', '--side-panel-header-border',
    '--side-panel-border', '--side-panel-label', '--side-panel-value', '--node-selection-border',
    '--node-selection-focus', '--node-selection-hover', '--node-selection-selected', '--image-filter',
    '--loading-color', '--loading-bg', '--bg-image', '--bg-opacity', '--control-bg', '--control-text',
    '--control-border', '--control-border-hover', '--control-border-focus', '--control-placeholder',
    '--control-shadow', '--control-shadow-focus'
  ];
  
  // Limpiar localStorage de valores personalizados
  allCSSVars.forEach(function(varName) {
    localStorage.removeItem(`custom_${varName}`);
  });
  
  console.log('Valores personalizados limpiados del localStorage');
  
  // Remover todas las clases de tema anteriores
  document.body.classList.remove(
    'theme-light', 'theme-dark', 'theme-vintage', 'theme-pastel', 'theme-cyberpunk', 'theme-neon'
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
  const themeVariables = getThemeVariables(themeId);
  Object.keys(themeVariables).forEach(function(varName) {
    targetElement.style.setProperty(varName, themeVariables[varName]);
  });
  
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

// Función para obtener las variables CSS de cada tema
function getThemeVariables(themeId) {
  const themes = {
    'light': {
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
      '--control-shadow-focus': 'rgba(25, 118, 210, 0.2)'
    },
    'dark': {
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
      '--bg-image': 'url("https://images.unsplash.com/photo-1632059368252-be6d65abc4e2?w=1920&q=80")',
      '--bg-opacity': '0.9',
      '--control-bg': '#2d3748',
      '--control-text': '#e2e8f0',
      '--control-border': '#4a5568',
      '--control-border-hover': '#718096',
      '--control-border-focus': '#00eaff',
      '--control-placeholder': '#a0aec0',
      '--control-shadow': 'rgba(0, 0, 0, 0.3)',
      '--control-shadow-focus': 'rgba(0, 234, 255, 0.3)'
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
      '--control-shadow-focus': 'rgba(139, 69, 19, 0.4)'
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
      '--control-shadow-focus': 'rgba(182, 182, 247, 0.4)'
    },
    'cyberpunk': {
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
      '--bg-image': 'url("https://images.unsplash.com/photo-1632059368252-be6d65abc4e2?w=1920&q=80")',
      '--bg-opacity': '0.9',
      '--control-bg': '#2a0040',
      '--control-text': '#00ffe7',
      '--control-border': '#ff00c8',
      '--control-border-hover': '#ff33d6',
      '--control-border-focus': '#00ffe7',
      '--control-placeholder': '#7a4d8a',
      '--control-shadow': 'rgba(255, 0, 200, 0.3)',
      '--control-shadow-focus': 'rgba(0, 255, 231, 0.4)'
    },
    'neon': {
      '--bg-color': '#000',
      '--text-color': '#39ff14',
      '--node-fill': '#111',
      '--node-stroke-focus': '#ff00de',
      '--label-border': '#ff00de',
      '--link-color': '#39ff14',
      '--side-panel-bg': '#111',
      '--side-panel-text': '#39ff14',
      '--side-panel-header-bg': '#000',
      '--side-panel-header-border': '#ff00de',
      '--side-panel-border': '#ff00de',
      '--side-panel-label': '#ff00de',
      '--side-panel-value': '#39ff14',
      '--node-selection-border': '#ff00de',
      '--node-selection-focus': '#39ff14',
      '--node-selection-hover': '#ff33e6',
      '--node-selection-selected': '#39ff14',
      '--image-filter': 'invert(100%) brightness(3.5) contrast(200%)',
      '--loading-color': '#39ff14',
      '--loading-bg': '#111111',
      '--bg-image': 'url("img/backgrounds/neon-grid.svg")',
      '--bg-opacity': '0.2',
      '--control-bg': '#1a1a1a',
      '--control-text': '#39ff14',
      '--control-border': '#ff00de',
      '--control-border-hover': '#ff33e6',
      '--control-border-focus': '#39ff14',
      '--control-placeholder': '#666666',
      '--control-shadow': 'rgba(255, 0, 222, 0.3)',
      '--control-shadow-focus': 'rgba(57, 255, 20, 0.4)'
    }
  };
  
  return themes[themeId] || themes['light'];
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
  
  console.log('Variables del tema:', {
    textColor,
    nodeFill,
    labelBorder,
    linkColor,
    imageFilter
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
  const themeVariables = getThemeVariables(themeId);
  
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

// Configurar el selector de tema cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  const selector = document.getElementById('theme-selector');
  if (selector) {
    // Restaurar tema guardado
    const saved = localStorage.getItem('selectedTheme') || 'light';
    selector.value = saved;
    setTheme(saved);
    
    // Agregar event listener para cambios de tema
    selector.addEventListener('change', function() {
      console.log('Cambiando tema a:', this.value);
      setTheme(this.value);
    });
  }
});