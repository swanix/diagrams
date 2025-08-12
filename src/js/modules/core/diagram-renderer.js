/**
 * XDiagrams Diagram Renderer Module
 * Maneja el renderizado de árboles y diagramas
 */

class XDiagramsDiagramRenderer {
  constructor(core) {
    this.core = core;
  }

  renderTrees(trees, container) {
    const { clusterGapX, clusterGapY } = this.core.config;
    
    // Calcular configuración de clusters por fila
    const clustersPerRowConfig = this.core.config.clustersPerRow 
      ? this.core.config.clustersPerRow.split(' ').map(n => parseInt(n))
      : this.calculateOptimalLayout(trees.length);
    
    // Dimensiones fijas para títulos de cluster
    const titleWidth = 280;
    const titleHeight = 450;
    
    // Calcular dimensiones de cada cluster
    const clusterDimensions = trees.map((tree, index) => {
      const treeSize = this.calculateTreeSize(tree);
      return {
        tree: tree,
        index: index,
        clusterWidth: treeSize.width,
        clusterHeight: treeSize.height
      };
    });
    
    // Calcular layout de clusters
    const { treeLayouts, maxRowWidth, totalHeight } = this.calculateLayout(
      clusterDimensions, 
      clustersPerRowConfig, 
      clusterGapX, 
      clusterGapY
    );
    
    // Renderizar cada cluster
    const clusterGroups = treeLayouts.map((layout, index) => {
      const { tree, clusterWidth, clusterHeight, x, y } = layout;
      
      const clusterGroup = container.append('g')
        .attr('class', 'cluster')
        .attr('id', `cluster-${tree.id}`)
        .attr('transform', `translate(${x}, ${y})`)
        .style('opacity', 0);
      
      const treeGroup = clusterGroup.append('g')
        .attr('class', 'tree-group');
      
      // Fondo del cluster
      treeGroup.append('rect')
        .attr('class', 'cluster-bg')
        .attr('width', clusterWidth)
        .attr('height', clusterHeight)
        .attr('x', 0)
        .attr('y', 0)
        .attr('tabindex', '0')
        .style('outline', 'none');
      
      // Guardar posición del cluster
      this.core.clusterPositions.set(tree.name, {
        x: x,
        y: y,
        width: clusterWidth,
        height: clusterHeight
      });
      
      // Título del cluster
      const titleContainer = treeGroup.append('g')
        .attr('class', 'cluster-title-container');
      
      const titleBg = titleContainer.append('rect')
        .attr('class', 'cluster-title-bg')
        .attr('rx', 8)
        .attr('ry', 8);
      
      const titleText = titleContainer.append('text')
        .attr('class', 'cluster-title')
        .attr('x', 50) // Corrido hacia la derecha de 5 a 50
        .attr('y', 150) // Bajado de 130 a 150
        .text(tree.id || tree.name);
      
      titleText.attr('data-cluster-name', tree.name);
      
      // Ajustar fondo del título
      const titleBBox = titleText.node().getBBox();
      titleBg
        .attr('x', titleBBox.x - 56) // Duplicado de 28 a 56
        .attr('y', titleBBox.y - 32) // Duplicado de 16 a 32
        .attr('width', titleBBox.width + 112) // Duplicado de 56 a 112
        .attr('height', titleBBox.height + 64); // Duplicado de 32 a 64
      
      // Base de fondo para el texto grande del cluster
      const largeTitleBg = titleContainer.append('rect')
        .attr('class', 'cluster-hover-title-large-bg')
        .attr('x', 0)
        .attr('y', 0)
        .attr('rx', 80) // Bordes redondeados reducidos para el padding más pequeño
        .attr('ry', 80);
      
      // Texto grande del cluster que aparece en hover (misma posición que el título)
      const largeTitleText = titleContainer.append('text')
        .attr('class', 'cluster-hover-title-large')
        .attr('x', 150) // Posición X más a la derecha
        .attr('y', 350) // Posición Y subida más (de 400 a 350)
        .text(tree.id || tree.name)
        .attr('data-cluster-name', tree.name);
      
      // Ajustar el fondo del texto grande basado en el tamaño del texto
      const largeTitleBBox = largeTitleText.node().getBBox();
      const paddingX = 120; // Padding horizontal (se puede hacer variable CSS)
      const paddingY = 90; // Padding vertical (se puede hacer variable CSS)
      largeTitleBg
        .attr('x', largeTitleBBox.x - paddingX)
        .attr('y', largeTitleBBox.y - paddingY)
        .attr('width', largeTitleBBox.width + (paddingX * 2))
        .attr('height', largeTitleBBox.height + (paddingY * 2));
      
      console.log('🔍 [DiagramRenderer] Texto grande creado para cluster:', tree.name, largeTitleText.node());
      
      // Variable para controlar si el texto gigante debe estar oculto permanentemente
      let hideLargeTitlePermanently = false;

      // Agregar eventos de hover para controlar la visibilidad del texto grande
      clusterGroup.on('mouseenter', () => {
        if (hideLargeTitlePermanently) return; // No mostrar si está marcado como oculto permanentemente
        
        const currentZoom = this.core.navigation.zoomManager.getCurrentZoom();
        if (currentZoom <= 0.10) { // Cambiado de 0.12 a 0.10 (10%)
          // Mostrar inmediatamente sin transición
          largeTitleText.style('opacity', 1);
          largeTitleBg.style('opacity', 1);
        }
      }).on('mouseleave', () => {
        if (hideLargeTitlePermanently) return; // No ocultar si ya está marcado como oculto
        
        // Ocultar inmediatamente sin transición
        largeTitleText.style('opacity', 0);
        largeTitleBg.style('opacity', 0);
      }).on('click', () => {
        // Marcar como oculto permanentemente
        hideLargeTitlePermanently = true;
        
        // Ocultar texto gigante inmediatamente al hacer clic (sin transición)
        largeTitleText.style('opacity', 0);
        largeTitleBg.style('opacity', 0);
        
        // Resetear la bandera después de un tiempo para permitir futuros hovers
        setTimeout(() => {
          hideLargeTitlePermanently = false;
        }, 2000); // 2 segundos deberían ser suficientes para completar el zoom
      });

      // Listener para cambios de zoom - ocultar texto cuando zoom > 10%
      const zoomListener = () => {
        const currentZoom = this.core.navigation.zoomManager.getCurrentZoom();
        if (currentZoom > 0.10) { // Cambiado de 0.12 a 0.10 (10%)
          largeTitleText.style('opacity', 0);
          largeTitleBg.style('opacity', 0);
        }
      };

      // Agregar listener al zoom manager
      if (this.core.navigation && this.core.navigation.zoomManager) {
        this.core.navigation.zoomManager.onZoomChange(zoomListener);
      }
      
      // Contenido del árbol
      const treeContent = treeGroup.append('g')
        .attr('class', 'tree-content');
      
      // Crear jerarquía D3
      const hierarchy = d3.hierarchy(tree);
      
      // Aplicar layout de árbol
      d3.tree()
        .nodeSize([
          this.core.config.nodeWidth + this.core.config.spacing,
          this.core.config.nodeHeight + this.core.config.verticalSpacing
        ])(hierarchy);
      
      // Calcular bounds del árbol
      let minX = Infinity, maxX = -Infinity;
      let minY = Infinity, maxY = -Infinity;
      
      hierarchy.descendants().forEach(node => {
        minX = Math.min(minX, node.x);
        maxX = Math.max(maxX, node.x + this.core.config.nodeWidth);
        minY = Math.min(minY, node.y);
        maxY = Math.max(maxY, node.y + this.core.config.nodeHeight);
      });
      
      // Centrar el árbol en el cluster
      const treeCenterX = clusterWidth / 2 - (minX + maxX) / 2;
      const treeCenterY = titleHeight + (clusterHeight - titleHeight - titleHeight) / 2 - (minY + maxY) / 2;
      
      // Renderizar árbol
      this.renderTreeSimple(tree, treeContent, treeCenterX, treeCenterY);
      
      return clusterGroup;
    });
    
    // Agregar eventos de clic a clusters
    this.addClusterClickEvents(clusterGroups, container);
    
    // Escuchar cambios de tema para actualizar border-radius
    this.setupThemeChangeListener();
    
    // Actualizar contadores
    this.updateCounters(this.countTotalNodes(trees), trees.length);
    
    // Aplicar zoom inicial inmediatamente (sin transición)
    this.applyInitialZoomImmediate(container, maxRowWidth, totalHeight);
    
    // Mostrar clusters con animación
    setTimeout(() => {
      // Usar UIManager para ocultar loading
      if (this.core.uiManager) {
        this.core.uiManager.hideLoading();
      }
      setTimeout(() => {
        clusterGroups.forEach(group => group.style('opacity', 1));
        
        const diagram = d3.select('#diagram');
        diagram.select('g').style('opacity', null).style('visibility', null);
        diagram.style('opacity', 1).style('visibility', 'visible');
        
        document.getElementById('diagram').style.cssText = 'opacity: 1; visibility: visible;';
        
        this.core.thumbs.showIconsWithFadeIn();
        this.core.navigation.keyboardNavInstance.initialize();
      }, 300);
    }, 100);
  }

  calculateOptimalLayout(totalTrees) {
    const cols = Math.ceil(Math.sqrt(totalTrees));
    const rows = Math.ceil(totalTrees / cols);
    
    const layout = [];
    for (let i = 0; i < rows; i++) {
      layout.push(Math.min(cols, totalTrees - i * cols));
    }
    
    return layout;
  }

  calculateLayout(clusterDimensions, clustersPerRowConfig, clusterGapX, clusterGapY) {
    const treeLayouts = [];
    const rowWidths = [];
    const rowHeights = [];
    
    let currentIndex = 0;
    let currentRow = 0;
    
    while (currentIndex < clusterDimensions.length) {
      const clustersInThisRow = clustersPerRowConfig[currentRow] || 7;
      const endIndex = Math.min(currentIndex + clustersInThisRow, clusterDimensions.length);
      
      const rowClusters = clusterDimensions.slice(currentIndex, endIndex);
      
      // Calcular ancho total de la fila
      const rowWidth = rowClusters.reduce((total, cluster) => {
        return total + (this.calculateTreeSize(cluster.tree).treeWidth + 280 + 280);
      }, 0) + (rowClusters.length - 1) * clusterGapX;
      
      rowWidths.push(rowWidth);
      rowHeights.push(Math.max(...rowClusters.map(c => c.clusterHeight)));
      
      currentIndex = endIndex;
      currentRow++;
    }
    
    const maxRowWidth = Math.max(...rowWidths);
    
    // Calcular posiciones
    let currentY = 30;
    currentIndex = 0;
    currentRow = 0;
    
    while (currentIndex < clusterDimensions.length) {
      const clustersInThisRow = clustersPerRowConfig[currentRow] || 7;
      const endIndex = Math.min(currentIndex + clustersInThisRow, clusterDimensions.length);
      
      const rowClusters = clusterDimensions.slice(currentIndex, endIndex);
      const rowHeight = rowHeights[currentRow];
      
      // Calcular ancho de cada cluster en esta fila
      const clusterWidths = rowClusters.map(cluster => {
        return this.calculateTreeSize(cluster.tree).treeWidth + 280 + 280;
      });
      
      const totalClusterWidth = clusterWidths.reduce((sum, width) => sum + width, 0);
      const availableWidth = maxRowWidth - (rowClusters.length - 1) * clusterGapX;
      const extraWidth = Math.max(0, availableWidth - totalClusterWidth);
      
      // Distribuir el espacio extra proporcionalmente
      const clusterWidthsWithExtra = clusterWidths.map((width, index) => {
        const proportion = extraWidth > 0 ? width / totalClusterWidth : 0;
        return width + (extraWidth * proportion);
      });
      
      // Calcular posiciones X
      let currentX = 0;
      rowClusters.forEach((cluster, index) => {
        const finalWidth = clusterWidthsWithExtra[index];
        
        treeLayouts.push({
          tree: cluster.tree,
          clusterWidth: finalWidth,
          clusterHeight: rowHeight,
          x: currentX,
          y: currentY
        });
        
        currentX += finalWidth + clusterGapX;
      });
      
      currentY += rowHeight + clusterGapY;
      currentIndex = endIndex;
      currentRow++;
    }
    
    const totalHeight = rowHeights.reduce((sum, height, index) => {
      return sum + height + (index < rowHeights.length - 1 ? clusterGapY : 0);
    }, 30);
    
    return { treeLayouts, maxRowWidth, totalHeight };
  }

  isLinearTree(root) {
    if (!root.children || root.children.length === 0) return true;
    
    function checkLinear(node) {
      if (!node.children || node.children.length === 0) return true;
      if (node.children.length > 1) return false;
      return checkLinear(node.children[0]);
    }
    
    return checkLinear(root);
  }

  hasLinearBranches(root) {
    if (!root.children || root.children.length === 0) return true;
    
    function checkBranchLinear(node) {
      if (!node.children || node.children.length === 0) return true;
      if (node.children.length > 1) return false;
      return checkBranchLinear(node.children[0]);
    }
    
    return root.children.every(child => checkBranchLinear(child));
  }

  isSingleLevelTree(root) {
    if (!root.children || root.children.length === 0) return true;
    return root.children.every(child => !child.children || child.children.length === 0);
  }

  renderTreeSimple(node, container, x = 0, y = 0) {
    const { nodeWidth, nodeHeight, linearSpacing, branchedSpacing } = this.core.config;
    
    const hierarchy = d3.hierarchy(node);
    const isLinear = this.isLinearTree(hierarchy);
    const hasLinearBranches = this.hasLinearBranches(hierarchy);
    const isSingleLevel = this.isSingleLevelTree(hierarchy);
    
    const spacing = (isLinear || hasLinearBranches) ? linearSpacing : branchedSpacing;
    
    // Aplicar layout de árbol
    d3.tree()
      .nodeSize([nodeWidth + spacing, nodeHeight + this.core.config.verticalSpacing])
      (hierarchy);
    
    // Ajustar posiciones para árboles lineales o de ramas lineales
    if (hierarchy.children && hierarchy.children.length > 1 && (hasLinearBranches || isSingleLevel)) {
      const nonEmptyChildren = hierarchy.children.filter(child => 
        child.children && child.children.length > 0
      );
      
      let spacingBetweenBranches = 0;
      
      if (nonEmptyChildren.length > 1) {
        const sortedChildren = nonEmptyChildren.sort((a, b) => a.x - b.x);
        const totalSpread = sortedChildren[sortedChildren.length - 1].x - sortedChildren[0].x;
        spacingBetweenBranches = totalSpread / (nonEmptyChildren.length - 1);
      }
      
      // Ajustar posiciones de nodos hoja
      hierarchy.children.forEach((child, index) => {
        if ((!child.children || child.children.length === 0) && spacingBetweenBranches > 0) {
          if (index > 0) {
            const prevChild = hierarchy.children[index - 1];
            const currentDistance = child.x - prevChild.x;
            
            if (currentDistance < spacingBetweenBranches) {
              const adjustment = spacingBetweenBranches - currentDistance;
              child.x += adjustment;
            }
          } else {
            const nextChild = hierarchy.children[index + 1];
            if (nextChild) {
              const currentDistance = nextChild.x - child.x;
              
              if (currentDistance < spacingBetweenBranches) {
                const adjustment = spacingBetweenBranches - currentDistance;
                child.x -= adjustment;
              }
            }
          }
        }
      });
    }
    
    this.renderTreeFromLayout(hierarchy, container, x, y);
  }

  renderTreeFromLayout(node, container, offsetX = 0, offsetY = 0) {
    const { nodeWidth, nodeHeight } = this.core.config;
    
    // Crear grupo del nodo
    const nodeGroup = container.append('g')
      .attr('class', 'node')
      .attr('transform', `translate(${offsetX + node.x}, ${offsetY + node.y})`)
      .datum(node);
    
    // Rectángulo del nodo
    nodeGroup.append('rect')
      .attr('width', nodeWidth)
      .attr('height', nodeHeight)
      .style('pointer-events', 'all');
    
    // Thumbnail del nodo
    this.core.thumbs.createThumbnailElement(
      node.data, 
      nodeGroup, 
      nodeWidth / 2, 
      nodeHeight / 2, 
      82, 
      82
    );
    
    // Texto del nodo
    this.core.textHandler.renderNodeTextCentered(
      nodeGroup,
      node.data.name,
      nodeWidth / 2,
      nodeHeight * 0.7,
      {
        maxWidth: this.core.config.textConfig.maxWidth,
        fontSize: this.core.config.textConfig.nodeNameFontSize,
        lineHeight: this.core.config.textConfig.lineHeight,
        fontWeight: 'bold',
        textAnchor: 'middle',
        dominantBaseline: 'middle'
      }
    );
    
    // ID del nodo (si existe)
    if (node.data.id) {
      const hasParent = node.parent !== null;
      const idX = hasParent ? offsetX + node.x + 44 : offsetX + node.x + nodeWidth / 2;
      const textAnchor = hasParent ? 'end' : 'middle';
      
      container.append('text')
        .attr('class', 'node-id-label')
        .attr('x', idX)
        .attr('y', offsetY + node.y - 7)
        .style('font-size', '6px')
        .style('font-weight', 'normal')
        .style('text-anchor', textAnchor)
        .style('dominant-baseline', 'baseline')
        .text(node.data.id);
    }
    
    // Eventos del nodo
    nodeGroup
      .style('cursor', 'pointer')
      .style('pointer-events', 'all')
      .on('click', (event) => {
        event.stopPropagation();
        
        let clusterGroup = null;
        try {
          const clusterElement = nodeGroup.node()?.closest('.cluster');
          if (clusterElement) {
            clusterGroup = d3.select(clusterElement);
          }
        } catch (e) {}
        
        if (clusterGroup && !clusterGroup.empty()) {
          if (!clusterGroup.select('.cluster-bg').classed('cluster-focused')) {
            // Primer clic en nodo de cluster no seleccionado: seleccionando solo el cluster
            this.core.navigation.clusterNavInstance.zoomToCluster(clusterGroup, this.core.globalContainer, false, false);
            return;
          }
          // Cluster ya activo: seleccionando nodo y haciendo zoom
          this.selectNodeAndZoomToIt(nodeGroup, node);
        }
      })
      .on('dblclick', (event) => {
        event.stopPropagation();
        
        if (!d3.select('.node-selected').empty()) {
          // Double click on node with node selected: deselecting node and zooming to cluster (like Escape)
          this.core.navigation.nodeNavInstance.exitNodeNavigationMode(true);
          return;
        }
        
        // Double click on node without node selected: selecting node normally
        this.selectNodeAndZoomToIt(nodeGroup, node);
      });
    
    // Renderizar hijos
    if (node.children && node.children.length > 0) {
      node.children.forEach(child => {
        const sourceX = offsetX + node.x + nodeWidth / 2;
        const sourceY = offsetY + node.y + nodeHeight;
        const targetX = offsetX + child.x + nodeWidth / 2;
        const targetY = offsetY + child.y;
        
        // Crear enlace
        container.insert('path', ':first-child')
          .attr('class', 'link')
          .attr('d', this.createLinkPath(sourceX, sourceY, targetX, targetY));
        
        // Renderizar hijo recursivamente
        this.renderTreeFromLayout(child, container, offsetX, offsetY);
      });
    }
  }

  createLinkPath(sourceX, sourceY, targetX, targetY) {
    const { cornerRadius, verticalTolerance } = this.core.config.linkConfig;
    
    const diagonal = (sourceX, sourceY, targetX, targetY) => {
      const midY = (sourceY + targetY) / 2;
      const cornerRadius = this.core.config.linkConfig.cornerRadius;
      
      // Si los puntos están muy cerca horizontalmente, hacer línea recta
      if (Math.abs(sourceX - targetX) < this.core.config.linkConfig.verticalTolerance) {
        return `M${sourceX},${sourceY} L${targetX},${targetY}`;
      }
      
      // Determinar dirección del enlace
      if (targetX < sourceX) {
        // Enlace hacia la izquierda
        return `
          M${sourceX},${sourceY}
          L${sourceX},${midY - cornerRadius}
          Q${sourceX},${midY} ${sourceX - cornerRadius},${midY}
          L${targetX + cornerRadius},${midY}
          Q${targetX},${midY} ${targetX},${midY + cornerRadius}
          L${targetX},${targetY}
        `;
      } else {
        // Enlace hacia la derecha
        return `
          M${sourceX},${sourceY}
          L${sourceX},${midY - cornerRadius}
          Q${sourceX},${midY} ${sourceX + cornerRadius},${midY}
          L${targetX - cornerRadius},${midY}
          Q${targetX},${midY} ${targetX},${midY + cornerRadius}
          L${targetX},${targetY}
        `;
      }
    };
    
    return diagonal(sourceX, sourceY, targetX, targetY);
  }

  countTotalNodes(trees) {
    let totalNodes = 0;
    
    const countNodesRecursive = (node) => {
      totalNodes++;
      node.children.forEach(countNodesRecursive);
    };
    
    trees.forEach(countNodesRecursive);
    return totalNodes;
  }

  calculateTreeSize(node) {
    const hierarchy = d3.hierarchy(node);
    const isLinear = this.isLinearTree(hierarchy);
    const hasLinearBranches = this.hasLinearBranches(hierarchy);
    const spacing = (isLinear || hasLinearBranches) ? this.core.config.linearSpacing : this.core.config.branchedSpacing;
    
    // Aplicar layout de árbol
    d3.tree()
      .nodeSize([
        this.core.config.nodeWidth + spacing,
        this.core.config.nodeHeight + this.core.config.verticalSpacing
      ])(hierarchy);
    
    // Calcular bounds
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    
    hierarchy.descendants().forEach(node => {
      minX = Math.min(minX, node.x);
      maxX = Math.max(maxX, node.x + this.core.config.nodeWidth);
      minY = Math.min(minY, node.y);
      maxY = Math.max(maxY, node.y + this.core.config.nodeHeight);
    });
    
    // Manejar casos edge
    if (minX === Infinity) minX = 0;
    if (maxX === -Infinity) maxX = this.core.config.nodeWidth;
    if (minY === Infinity) minY = 0;
    if (maxY === -Infinity) maxY = this.core.config.nodeHeight;
    
    // Calcular ancho del árbol
    const rootNode = hierarchy.descendants().find(node => node.depth === 0);
    const rootX = rootNode ? rootNode.x : 0;
    const leftDistance = Math.abs(minX - rootX);
    const rightDistance = Math.abs(maxX - rootX);
    const treeWidth = 2 * Math.max(leftDistance, rightDistance) + this.core.config.nodeWidth;
    
    // Calcular altura del árbol
    const treeHeight = maxY - minY;
    const calculatedHeight = treeHeight > 0 ? treeHeight : (hierarchy.height + 1) * (this.core.config.nodeHeight + this.core.config.verticalSpacing);
    
    return {
      width: treeWidth + 280 + 280,
      height: 1.1 * (calculatedHeight + this.core.config.nodeWidth + 280 + 450),
      treeWidth: treeWidth,
      treeHeight: calculatedHeight
    };
  }

  addClusterClickEvents(clusterGroups, container) {
    clusterGroups.forEach(clusterGroup => {
      ['cluster-bg', 'cluster-title'].forEach(className => {
        const element = clusterGroup.select(`.${className}`);
        let startX = 0, startY = 0, isDragging = false;
        
        element
          .style('cursor', 'pointer')
          .on('mousedown', (event) => {
            startX = event.clientX;
            startY = event.clientY;
            isDragging = false;
          })
          .on('mousemove', (event) => {
            if (startX !== 0 && startY !== 0) {
              const deltaX = Math.abs(event.clientX - startX);
              const deltaY = Math.abs(event.clientY - startY);
              
              if (deltaX > 10 || deltaY > 10) {
                isDragging = true;
              }
            }
          })
          .on('click', (event) => {
            if (!isDragging) {
              event.stopPropagation();
              event.preventDefault();
              
              if (!d3.select('.node-selected').empty()) {
                // Click on cluster with node selected: ignoring (use double click to deselect)
                return;
              }
              
              if (clusterGroup && !clusterGroup.empty()) {
                this.core.navigation.clusterNavInstance.zoomToCluster(clusterGroup, container, false, false);
              }
            }
            
            startX = 0;
            startY = 0;
            isDragging = false;
          });
      });
    });
    
    // Eventos del diagrama
    d3.select('#diagram').on('dblclick', (event) => {
      if (!d3.select('.node-selected').empty()) {
        // Double click with node selected: deselecting node and zooming to cluster (like Escape)
        this.core.navigation.nodeNavInstance.exitNodeNavigationMode(true);
        return;
      }
      
      // Double click without node selected: resetting zoom
              this.core.navigation.zoomControlsInstance.resetZoom(container);
    });
    
    d3.select('#diagram').on('click', (event) => {
      if (event.target === event.currentTarget) {
        if (!d3.select('.node-selected').empty()) {
          // Click outside with node selected: completely ignoring (use double click to deselect)
          event.stopPropagation();
          event.preventDefault();
          return;
        }
        
        // Click outside without node selected: deseleccionar cluster si está seleccionado
        this.core.navigation.clusterNavInstance.deselectClusterOnOutsideClick();
      }
    });
    
    // Crear controles de zoom
    this.core.navigation.createZoomControls();
    this.core.navigation.setupKeyboardNavigation(container);
  }

  updateCounters(totalNodes, totalClusters) {
    const counters = {
      'node-count': totalNodes,
      'cluster-count': totalClusters,
      'render-type': 'SVG'
    };
    
    Object.entries(counters).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) {
        element.textContent = value;
      }
    });
  }

  applyInitialZoom(container, diagramWidth, diagramHeight) {
    this.applyInitialZoomWithTransition(container, diagramWidth, diagramHeight, 1000);
  }

  applyInitialZoomImmediate(container, diagramWidth, diagramHeight) {
    this.applyInitialZoomWithTransition(container, diagramWidth, diagramHeight, 0);
  }

  applyInitialZoomWithTransition(container, diagramWidth, diagramHeight, duration = 0) {
    const diagram = d3.select('#diagram');
    const diagramNode = diagram.node();
    const diagramRect = diagramNode.getBoundingClientRect();
    const { width: viewportWidth, height: viewportHeight } = diagramRect;
    
    // Calcular bounds del diagrama
    const bounds = this.calculateDiagramBounds();
    const actualWidth = bounds.width || diagramWidth;
    const actualHeight = bounds.height || diagramHeight;
    
    // Calcular escala para encajar
    const scaleX = viewportWidth / actualWidth;
    const scaleY = viewportHeight / actualHeight;
    const baseScale = Math.min(scaleX, scaleY);
    
    // Aplicar configuración de zoom inicial
    const userScale = this.core.config.initialZoom?.scale || 0.95;
    const userPadding = this.core.config.initialZoom?.padding || 0.05;
    
    let finalScale = baseScale * userScale * (1 - userPadding);
    const unclampedScale = finalScale;
    
    // Limitar escala
    finalScale = Math.max(0.05, Math.min(2, finalScale));
    
    // Calcular posición centrada
    const translateX = (viewportWidth - actualWidth * finalScale) / 2;
    const translateY = (viewportHeight - actualHeight * finalScale) / 2;
    
    // Crear transformación
    const transform = d3.zoomIdentity
      .translate(translateX, translateY)
      .scale(finalScale);
    
    // Guardar la transformación inicial en el módulo de navegación
    if (this.core.navigation && this.core.navigation.zoomManagerInstance) {
      this.core.navigation.zoomManagerInstance.setInitialTransform(transform);
    }
    
    // Zoom inicial aplicado
    
    // Usar el módulo de navegación para aplicar la transformación
    if (this.core.navigation && this.core.navigation.zoomManagerInstance) {
      if (duration > 0) {
        this.core.navigation.zoomManagerInstance.zoomTo(transform, duration);
      } else {
        this.core.navigation.zoomManagerInstance.zoomToImmediate(transform);
      }
    }
    
    // Actualizar panel de información
    this.updateInfoPanel(transform);
    
    // Deseleccionar cluster activo
    this.core.navigation.clusterNavInstance.deselectActiveCluster();
  }

  calculateDiagramBounds() {
    const clusters = d3.selectAll('.cluster');
    if (clusters.empty()) {
      return { width: 8000, height: 8000 };
    }
    
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    let clusterCount = 0;
    
    clusters.each(function() {
      const cluster = d3.select(this);
      const transform = cluster.attr('transform');
      const bg = cluster.select('.cluster-bg');
      
      if (transform && !bg.empty()) {
        const match = transform.match(/translate\(([^,]+),\s*([^)]+)\)/);
        if (match) {
          const x = parseFloat(match[1]);
          const y = parseFloat(match[2]);
          const width = parseFloat(bg.attr('width'));
          const height = parseFloat(bg.attr('height'));
          
          if (!isNaN(x) && !isNaN(y) && !isNaN(width) && !isNaN(height)) {
            minX = Math.min(minX, x);
            maxX = Math.max(maxX, x + width);
            minY = Math.min(minY, y);
            maxY = Math.max(maxY, y + height);
            clusterCount++;
          }
        }
      }
    });
    
    if (minX === Infinity || maxX === -Infinity || minY === Infinity || maxY === -Infinity || clusterCount === 0) {
      return { width: 8000, height: 8000 };
    }
    
    return {
      width: maxX - minX,
      height: maxY - minY
    };
  }

  updateInfoPanel(transform) {
    // Usar el UI Manager para actualizar el panel de información
    if (this.core.uiManager) {
      this.core.uiManager.updateInfoPanel(transform);
    }
  }

  selectNodeAndZoomToIt(nodeGroup, node) {
    // Selecting node and zooming to it
            this.core.navigation.nodeNavInstance.selectNode(nodeGroup, true);
    this.zoomToNode(nodeGroup, node, true);
  }

  zoomToNode(nodeGroup, node, isClickNavigation = false) {
    const diagram = d3.select('#diagram');
    if (diagram.empty()) return;
    
    const diagramNode = diagram.node();
    const currentTransform = d3.zoomTransform(diagramNode);
    
    // Obtener posición del nodo
    const nodeRect = nodeGroup.node().getBoundingClientRect();
    const diagramRect = diagramNode.getBoundingClientRect();
    
    const nodeCenterX = nodeRect.left + nodeRect.width / 2;
    const nodeCenterY = nodeRect.top + nodeRect.height / 2;
    
    // Convertir a coordenadas del diagrama
    const diagramX = (nodeCenterX - currentTransform.x) / currentTransform.k;
    const diagramY = (nodeCenterY - currentTransform.y) / currentTransform.k;
    
    // Configuración de zoom
    const targetScale = 1.6;
    const viewportCenterX = diagramRect.width / 2;
    const viewportCenterY = diagramRect.height / 2;
    
    // Ajustar para panel lateral
    const sidePanel = document.getElementById('side-panel');
    let panelOffset = 0;
    if (sidePanel && sidePanel.style.display !== 'none') {
      panelOffset = sidePanel.getBoundingClientRect().width;
    }
    
    const adjustedCenterX = viewportCenterX - panelOffset / 2;
    
    // Calcular nueva posición
    const newX = adjustedCenterX - diagramX * targetScale;
    const newY = viewportCenterY - diagramY * targetScale;
    
    // Crear nueva transformación
    const newTransform = d3.zoomIdentity
      .translate(newX, newY)
      .scale(targetScale);
    
    // Calcular duración de la transición
    let duration = 800;
    
    if (isClickNavigation) {
      duration = 600;
      // Navegación por clic detectada: usando duración constante
    } else if (this.core.navigation && this.core.navigation.lastNodeDistance) {
      const distance = this.core.navigation.lastNodeDistance;
      let baseDuration, maxDuration;
      
      if (this.core.navigation.isCircularNavigation) {
        baseDuration = 1000;
        maxDuration = 3000;
        // Navegación circular detectada en zoom: usando duraciones más largas
      } else {
        baseDuration = 400;
        maxDuration = 1200;
      }
      
      duration = baseDuration + (maxDuration - baseDuration) * Math.min(distance / 800, 1);
      // Zooming to node with distance-proportional duration
    }
    
    // Zooming to node
    
    // Aplicar transición usando el módulo de navegación
    if (this.core.navigation && this.core.navigation.zoomManagerInstance) {
      this.core.navigation.zoomManagerInstance.zoomTo(newTransform, duration);
    } else {
      // Fallback si no hay módulo de navegación disponible
      diagram
        .transition()
        .duration(duration)
        .ease(d3.easeCubicOut)
        .call(d3.zoom().transform, newTransform);
    }
  }

  setupThemeChangeListener() {
    // Escuchar cambios de tema para actualizar border-radius de clusters
    document.addEventListener('themechange', (event) => {
      this.updateClusterBorderRadius();
    });
  }

  updateClusterBorderRadius() {
    console.log('Theme changed, CSS should handle border-radius automatically');
    // La CSS con !important debería manejar el border-radius automáticamente
  }
}

export { XDiagramsDiagramRenderer }; 