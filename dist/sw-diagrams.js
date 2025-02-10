/* Swanix Diagrams v0.1.0 */
/* Based on D3.js */

function initDiagram(csvUrl) {
  // Show the loading indicator
  document.getElementById("loading").style.display = "block";

  Papa.parse(csvUrl, {
    download: true,
    header: true,
    complete: function(results) {
      const data = results.data;
      const trees = buildMultipleHierarchies(data);
      drawMultipleTrees(trees);

      // Hide the loading indicator
      document.getElementById("loading").style.display = "none";

    },
    error: function(err) {
      console.error("CSV File:", err);
      document.getElementById("error-message").innerText = `CSV File ${err.message}`;
      // Hide the loading indicator
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

    let node = { name, subtitle, img, url, type, children: [] };
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
      .attr("class", "node")
      .attr("transform", d => `translate(${d.x},${d.y})`);

    node.append("rect")
      .attr("x", parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--node-bg-x')))
      .attr("y", parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--node-bg-y')))
      .attr("width", parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--node-bg-width')))
      .attr("height", parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--node-bg-height')))
      .style("stroke-width", "var(--node-bg-stroke)");

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

    node.append("text")
      .attr("class", "custom-text")
      .attr("dy", parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--label-dy')))
      .attr("font-size", parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--label-font-size')))
      .text(d => d.data.name)
      .attr("text-anchor", "middle")
      .attr("x", parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--label-x')))
      .attr("y", parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--label-y')))
      .style("fill", "var(--text-color)")
      .call(wrap, parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--label-width')));


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

const zoom = d3.zoom().scaleExtent([0.1, 2]).on("zoom", event => {
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