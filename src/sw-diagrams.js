/* Swanix Diagrams v0.1.0 */
/* Based on D3.js */


function initDiagram(csvUrl) {
  document.getElementById("loading").style.display = "block";

  Papa.parse(csvUrl, {
    download: true,
    header: true,
    complete: function(results) {
      const data = results.data;
      const trees = buildMultipleHierarchies(data);
      drawMultipleTrees(trees);
      createTypeDropdown(data);
      createSidePanel();
      document.getElementById("loading").style.display = "none";
    },
    error: function(err) {
      console.error("CSV File:", err);
      document.getElementById("error-message").innerText = `CSV File ${err.message}`;
      document.getElementById("loading").style.display = "none";
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
    let id = d.id?.trim() || "";
    let name = d.name?.trim() || "Nodo sin nombre";
    let subtitle = d.subtitle?.trim() || "";
    let img = d.img?.trim() || "";
    let parent = d.parent?.trim() || "";
    let url = d.url?.trim() || "";
    let type = d.type?.trim() || "";

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
  
  const svg = d3.select("svg");
  const g = svg.append("g");

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

    node.append("image")
      .attr("xlink:href", d => {
        // Verificar si hay una URL en la columna 'img'
        const imgUrl = d.data.img?.trim(); // Obtener la URL de la columna 'img'
        if (imgUrl) {
          return imgUrl; // Si hay una URL, usarla
        }
        // Si no hay URL en 'img', usar la clase CSS desde 'type'
        const className = d.data.type; // Suponiendo que 'type' contiene el nombre de la clase
        return className ? getComputedStyle(document.documentElement).getPropertyValue(`--${className}`) : "https://swanix.org/diagrams/lib/detail.svg"; // Obtener la URL de la clase CSS
      })
      .attr("x", parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--image-x')))
      .attr("y", parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--image-y')))
      .attr("class", d => {
        // Aplicar el filtro solo si se usa la imagen de la columna 'type'
        return d.data.img ? "image-base" : "image-base image-filter"; // Cambia 'image-base' por la clase que desees
      })
      .attr("width", parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--image-width')))
      .attr("height", parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--image-height')));

    /* Insertar SVG
    d3.select(this).append("svg")
      .attr("width", 80) // Ajusta el ancho según sea necesario
      .attr("height", 100) // Ajusta la altura según sea necesario
      .append("xhtml:div")
      .html(svgContent); // Inserta el contenido del SVG
    */

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
      const scale = Math.min(svgWidth / bounds.width, svgHeight / bounds.height) * 0.9;
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
  // Crear un dropdown para las opciones de type
  const typeDropdown = document.createElement("select");
  typeDropdown.setAttribute("id", "type-dropdown");
  typeDropdown.style.position = "absolute";
  typeDropdown.style.top = "50px"; // Distancia desde la parte superior
  typeDropdown.style.left = "10px"; // Distancia desde la izquierda
  typeDropdown.style.zIndex = "10"; // Asegurarse de que esté por encima del SVG

  // Agregar opción por defecto "All" con contador
  const allCount = data.length; // Contar todos los nodos
  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = `All (${allCount})`; // Opción para mostrar todos los nodos con contador
  typeDropdown.appendChild(allOption);

  // Obtener las opciones únicas de type
  const types = [...new Set(data.map(d => d.type))]; // Suponiendo que 'data' es accesible aquí
  types.forEach(type => {
    const count = data.filter(d => d.type === type).length; // Contar nodos que coinciden con el tipo
    const option = document.createElement("option");
    option.value = type;
    option.textContent = `${type || "No type"} (${count})`; // Mostrar el tipo y el contador
    typeDropdown.appendChild(option);
  });

  document.body.appendChild(typeDropdown);

  // Evento para seleccionar tipo
  typeDropdown.addEventListener("change", function() {
    const selectedType = this.value;

    d3.selectAll(".node")
      .select("rect") // Seleccionar solo el rectángulo base del nodo
      .style("stroke", d => {
        const strokeColor = getComputedStyle(document.documentElement).getPropertyValue('--node-stroke-focus');
        return d.data.type === selectedType ? strokeColor : "none"; // Resaltar nodos coincidentes
      })
      .style("stroke-width", d => d.data.type === selectedType ? "4px" : "none"); // Cambiar el ancho del borde
  });
}

document.addEventListener("DOMContentLoaded", () => {
  // Agregar un campo de entrada para el buscador
  const searchInput = document.createElement("input");
  searchInput.setAttribute("id", "search-input");
  searchInput.setAttribute("placeholder", "Search node..."); // Placeholder en inglés
  
  // Estilos para el input
  searchInput.style.position = "absolute"; // Posicionamiento absoluto
  searchInput.style.top = "10px"; // Distancia desde la parte superior
  searchInput.style.left = "10px"; // Distancia desde la izquierda
  searchInput.style.zIndex = "10"; // Asegurarse de que esté por encima del SVG

  document.body.appendChild(searchInput);

  // Evento para buscar nodos
  searchInput.addEventListener("input", function() {
    const searchTerm = this.value.toLowerCase();
    
    if (searchTerm) {
      d3.selectAll(".node")
        .select("rect") // Seleccionar solo el rectángulo base del nodo
        .style("stroke", d => d.data.name.toLowerCase().includes(searchTerm) ? "white" : "none") // Resaltar nodos coincidentes
        .style("stroke-width", d => d.data.name.toLowerCase().includes(searchTerm) ? "4px" : "none"); // Cambiar el ancho del borde
    } else {
      // Restablecer el estilo de todos los nodos si el campo de búsqueda está vacío
      d3.selectAll(".node")
        .select("rect")
        .style("stroke", "none") // Quitar el borde
        .style("stroke-width", "none"); // Restablecer el ancho del borde
    }
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

  // Añadir evento para tecla Escape
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
      closeSidePanel();
    }
  });
}

function openSidePanel(nodeData) {
  const sidePanel = document.getElementById('side-panel');
  const content = document.getElementById('side-panel-content');

  // Quitar selección previa
  d3.selectAll('.node.node-selected').classed('node-selected', false);
  // Seleccionar el nodo actual por ID
  if (nodeData && nodeData.id) {
    d3.selectAll('.node').filter(d => d.data.id == nodeData.id).classed('node-selected', true);
  }

  // Llenar el contenido del panel
  content.innerHTML = generateSidePanelContent(nodeData);

  // Abrir el panel
  sidePanel.classList.add('open');

  // Prevenir el scroll del body
  document.body.style.overflow = 'hidden';
}

function closeSidePanel() {
  const sidePanel = document.getElementById('side-panel');

  // Quitar selección de nodo
  d3.selectAll('.node.node-selected').classed('node-selected', false);

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
    { key: 'type', label: 'Tipo', type: 'text' },
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
    
    if (nodeData[field.key] && nodeData[field.key] !== '') {
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