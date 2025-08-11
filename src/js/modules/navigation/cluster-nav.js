/**
 * XDiagrams Cluster Navigation Module
 * Manejo de navegación entre clusters y zoom a clusters
 */

class XDiagramsClusterNav {
  constructor(navigation) {
    this.navigation = navigation;
    this.core = navigation.core;
    
    // Agregar listener para redimensionamiento de ventana
    window.addEventListener('resize', () => {
      this.updateOverlayPosition();
    });
  }

  zoomToCluster(clusterGroup, container, isTabNavigation = false, shouldDeselectNode = true) {
    try {
      const selectedNode = d3.select('.node-selected');
      if (!selectedNode.empty() && shouldDeselectNode) {
        this.core.uiManager.closeInfoPanel();
        d3.selectAll('.node-selected')
          .classed('node-selected', false)
          .style('stroke', null)
          .style('stroke-width', null)
          .style('fill', null);
        this.navigation.escapeLevel = 0;
      }
      
      if (!clusterGroup || clusterGroup.empty()) return;

      const svg = d3.select('#diagram');
      if (svg.empty()) return;

      const svgNode = svg.node();
      const svgRect = svgNode.getBoundingClientRect();
      const { width: svgWidth, height: svgHeight } = svgRect;
      
      if (svgWidth <= 0 || svgHeight <= 0) return;
      
      const clusterBg = clusterGroup.select('.cluster-bg');
      if (clusterBg.empty()) return;
      
      const clusterWidth = parseFloat(clusterBg.attr('width'));
      const clusterHeight = parseFloat(clusterBg.attr('height'));
      
      if (isNaN(clusterWidth) || isNaN(clusterHeight) || clusterWidth <= 0 || clusterHeight <= 0) return;
      
      const clusterTitle = clusterGroup.select('.cluster-title').attr('data-cluster-name') || clusterGroup.select('.cluster-title').text();
      const originalPosition = this.core.clusterPositions.get(clusterTitle);
      
      let clusterX = 0, clusterY = 0;
      if (originalPosition) {
        clusterX = originalPosition.x;
        clusterY = originalPosition.y;
      } else {
        const clusterTransform = clusterGroup.attr('transform');
        if (clusterTransform) {
          const match = clusterTransform.match(/translate\(([^,]+),\s*([^)]+)\)/);
          if (match) {
            clusterX = parseFloat(match[1]);
            clusterY = parseFloat(match[2]);
          }
        }
      }
      
      const clusterCenterX = clusterX + clusterWidth / 2;
      const clusterCenterY = clusterY + clusterHeight / 2;
      
      const screenSize = Math.min(svgWidth, svgHeight);
      const padding = screenSize < 768 ? 30 : screenSize < 1024 ? 50 : 80;
      const scaleX = (svgWidth - padding * 2) / clusterWidth;
      const scaleY = (svgHeight - padding * 2) / clusterHeight;
      const maxZoom = screenSize < 768 ? 1.8 : screenSize < 1024 ? 2.0 : 2.2;
      const scale = Math.min(scaleX, scaleY, maxZoom);
      
      if (isNaN(scale) || scale <= 0) return;
      
      const newX = svgWidth / 2 - clusterCenterX * scale;
      const newY = svgHeight / 2 - clusterCenterY * scale;
      
      const newTransform = d3.zoomIdentity.translate(newX, newY).scale(scale);
      
      const transitionDuration = isTabNavigation ? this.core.config.transitionDuration.tab : this.core.config.transitionDuration.click;
      
      // Usar módulo de navegación para aplicar transformación
      if (this.core.navigation && this.core.navigation.zoomManagerInstance) {
        this.core.navigation.zoomManagerInstance.zoomTo(newTransform, transitionDuration);
      } else {
        svg.transition()
          .duration(transitionDuration)
          .ease(d3.easeCubicOut)
          .call(d3.zoom().transform, newTransform);
      }
      
      // Usar UI Manager para actualizar panel de información
      if (this.core.uiManager) {
        this.core.uiManager.updateInfoPanel({ k: scale, x: newX, y: newY });
      }
      
      const zoomStatus = document.getElementById('zoom-status');
      if (zoomStatus) {
        zoomStatus.style.display = 'block';
        setTimeout(() => zoomStatus.style.display = 'none', 2000);
      }
      
      // Seleccionar el cluster y remover bloqueadores
      const bg = clusterGroup.select('.cluster-bg');
      if (!bg.empty()) {
        // Primero limpiar selección de TODOS los clusters existentes
        this.clearClusterSelection();
        
        // Seleccionar el nuevo cluster
        bg.classed('cluster-focused', true);
        bg.attr('data-selected', 'true');
        bg.style('outline', 'none');
        bg.node().focus();
        
        // Cluster seleccionado
        
        // Remover bloqueadores para permitir interacción con nodos
        this.removeNodeBlockerOverlay();
        
        // Aplicar estilo de cluster seleccionado
        this.applySelectedClusterStyle(clusterGroup);
      }
      
    } catch (error) {
      // Error silencioso para evitar spam en consola
    }
  }

  handleTabNavigation() {
    const currentCluster = d3.select('.cluster-bg:focus');
    const allClusters = d3.selectAll('.cluster-bg');
    
    if (allClusters.empty()) {
      return;
    }
    
    const currentIndex = currentCluster.empty() ? -1 : Array.from(allClusters.nodes()).indexOf(currentCluster.node());
    const nextIndex = event.shiftKey 
      ? (currentIndex <= 0 ? allClusters.size() - 1 : currentIndex - 1)
      : (currentIndex >= allClusters.size() - 1 ? 0 : currentIndex + 1);
    
    const nextCluster = allClusters.nodes()[nextIndex];
    if (!nextCluster) {
      return;
    }
    
    d3.select(nextCluster).node().focus();
    
    const clusterGroup = d3.select(nextCluster.parentNode);
    if (clusterGroup.empty()) {
      return;
    }
    
    this.applyClusterStyle(clusterGroup, '#28a745', '6px');
    
    setTimeout(() => {
      this.applyClusterStyle(clusterGroup, '#007bff', '4px');
    }, 200);
    
    this.zoomToCluster(clusterGroup, this.core.globalContainer, true);
  }

  handleArrowNavigation(arrowKey) {
    const allClusters = d3.selectAll('.cluster-bg');
    if (allClusters.empty()) {
      return;
    }

    const currentCluster = d3.select('.cluster-bg:focus');
    const currentIndex = currentCluster.empty() ? -1 : Array.from(allClusters.nodes()).indexOf(currentCluster.node());
    
    if (currentIndex === -1) {
      const firstCluster = allClusters.nodes()[0];
      if (firstCluster) {
        d3.select(firstCluster).node().focus();
        const clusterGroup = d3.select(firstCluster.parentNode);
        this.highlightCluster(clusterGroup);
        this.zoomToCluster(clusterGroup, this.core.globalContainer, true);
      }
      return;
    }

    let nextIndex;
    
    switch (arrowKey) {
      case 'ArrowUp':
        nextIndex = this.getClusterInPreviousRow(currentIndex, allClusters);
        break;
      case 'ArrowDown':
        nextIndex = this.getClusterInNextRow(currentIndex, allClusters);
        break;
      case 'ArrowLeft':
        nextIndex = this.getPreviousClusterInRow(currentIndex, allClusters);
        break;
      case 'ArrowRight':
        nextIndex = this.getNextClusterInRow(currentIndex, allClusters);
        break;
      default:
        return;
    }

    const nextCluster = allClusters.nodes()[nextIndex];
    if (!nextCluster) {
      return;
    }

    d3.select(nextCluster).node().focus();
    this.highlightCluster(d3.select(nextCluster.parentNode));
    
    this.zoomToCluster(d3.select(nextCluster.parentNode), this.core.globalContainer, true);
  }

  getPreviousClusterInRow(currentIndex, allClusters) {
    return this._findClusterInRow(currentIndex, allClusters, 'previous');
  }

  getNextClusterInRow(currentIndex, allClusters) {
    return this._findClusterInRow(currentIndex, allClusters, 'next');
  }

  _findClusterInRow(currentIndex, allClusters, direction) {
    const currentCluster = allClusters.nodes()[currentIndex];
    const currentRect = currentCluster.getBoundingClientRect();
    const currentY = currentRect.top;
    const currentX = currentRect.left;
    
    let bestIndex = currentIndex;
    let minDistance = Infinity;
    
    allClusters.each(function(d, i) {
      if (i === currentIndex) return;
      
      const rect = this.getBoundingClientRect();
      const yDiff = Math.abs(rect.top - currentY);
      
      if (yDiff < 50) {
        const isPrevious = direction === 'previous' && rect.left < currentX;
        const isNext = direction === 'next' && rect.left > currentX;
        
        if (isPrevious || isNext) {
          const distance = Math.abs(rect.left - currentX);
          if (distance < minDistance) {
            minDistance = distance;
            bestIndex = i;
          }
        }
      }
    });
    
    if (bestIndex === currentIndex) {
      if (direction === 'previous') {
        bestIndex = this.getLastClusterInPreviousRow(currentIndex, allClusters);
        if (bestIndex === currentIndex) {
          bestIndex = allClusters.size() - 1;
        }
      } else {
        bestIndex = this.getFirstClusterInNextRow(currentIndex, allClusters);
        if (bestIndex === currentIndex) {
          bestIndex = 0;
        }
      }
    }
    
    return bestIndex;
  }

  getClusterInPreviousRow(currentIndex, allClusters) {
    return this._findClusterInAdjacentRow(currentIndex, allClusters, 'previous');
  }

  getClusterInNextRow(currentIndex, allClusters) {
    return this._findClusterInAdjacentRow(currentIndex, allClusters, 'next');
  }

  _findClusterInAdjacentRow(currentIndex, allClusters, direction) {
    const currentCluster = allClusters.nodes()[currentIndex];
    const currentRect = currentCluster.getBoundingClientRect();
    const currentX = currentRect.left + currentRect.width / 2;
    const currentY = currentRect.top;
    
    let bestIndex = currentIndex;
    let minVerticalDistance = Infinity;
    let bestHorizontalDistance = Infinity;
    
    allClusters.each(function(d, i) {
      if (i === currentIndex) return;
      
      const rect = this.getBoundingClientRect();
      const clusterCenterX = rect.left + rect.width / 2;
      const clusterY = rect.top;
      
      const yDiff = direction === 'previous' 
        ? currentY - clusterY
        : clusterY - currentY;
      
      if (yDiff > 50) {
        const horizontalDistance = Math.abs(clusterCenterX - currentX);
        
        if (yDiff < minVerticalDistance) {
          minVerticalDistance = yDiff;
          bestIndex = i;
          bestHorizontalDistance = horizontalDistance;
        }
        else if (Math.abs(yDiff - minVerticalDistance) < 10 && horizontalDistance < bestHorizontalDistance) {
          bestIndex = i;
          bestHorizontalDistance = horizontalDistance;
        }
      }
    });
    
    if (bestIndex === currentIndex) {
      bestIndex = direction === 'previous' ? allClusters.size() - 1 : 0;
    }
    
    return bestIndex;
  }

  getLastClusterInPreviousRow(currentIndex, allClusters) {
    return this._findClusterAtRowExtreme(currentIndex, allClusters, 'previous', 'last');
  }

  getFirstClusterInNextRow(currentIndex, allClusters) {
    return this._findClusterAtRowExtreme(currentIndex, allClusters, 'next', 'first');
  }

  _findClusterAtRowExtreme(currentIndex, allClusters, direction, extreme) {
    const currentCluster = allClusters.nodes()[currentIndex];
    const currentRect = currentCluster.getBoundingClientRect();
    const currentY = currentRect.top;
    
    let bestIndex = currentIndex;
    let minVerticalDistance = Infinity;
    let extremePosition = extreme === 'first' ? Infinity : -Infinity;
    
    allClusters.each(function(d, i) {
      if (i === currentIndex) return;
      
      const rect = this.getBoundingClientRect();
      const yDiff = direction === 'previous' 
        ? currentY - rect.top
        : rect.top - currentY;
      
      if (yDiff > 50) {
        if (yDiff < minVerticalDistance) {
          minVerticalDistance = yDiff;
          bestIndex = i;
          extremePosition = rect.left;
        }
        else if (Math.abs(yDiff - minVerticalDistance) < 10) {
          const isBetterExtreme = extreme === 'first' 
            ? rect.left < extremePosition 
            : rect.left > extremePosition;
          
          if (isBetterExtreme) {
            bestIndex = i;
            extremePosition = rect.left;
          }
        }
      }
    });
    return bestIndex;
  }

  highlightCluster(clusterGroup) {
    d3.selectAll('.cluster-bg:not(.cluster-focused)')
      .style('stroke', 'var(--cluster-stroke)')
      .style('stroke-width', '3px');
    
    this.applyClusterStyle(clusterGroup, 'var(--cluster-selected-stroke)', '6px');
    
    setTimeout(() => {
      this.applyClusterStyle(clusterGroup, 'var(--cluster-hover-stroke)', '4px');
    }, 200);
  }

  deselectActiveCluster() {
    d3.selectAll('.cluster-bg').each(function() {
      this.blur();
    });
    
    // Limpiar selección de todos los clusters
    d3.selectAll('.cluster-bg').classed('cluster-focused', false);
    d3.selectAll('.cluster-bg').classed('cluster-hover-simulated', false);
    d3.selectAll('.cluster-bg').attr('data-selected', 'false');
    
    // Restaurar estilos normales de todos los clusters
    d3.selectAll('.cluster-bg')
      .style('fill', 'var(--cluster-bg)')
      .style('stroke', 'var(--cluster-stroke)')
      .style('stroke-width', '3px');
    
    // Cluster deseleccionado
    
    // Recrear bloqueadores para volver a bloquear nodos
    this.createNodeBlockerOverlay();
    
    console.log('🔧 [ClusterNav] Cluster deseleccionado, bloqueadores recreados');
  }

  clearClusterSelection() {
    // Solo limpiar selección sin recrear bloqueadores
    d3.selectAll('.cluster-bg').each(function() {
      this.blur();
    });
    
    // Limpiar selección de todos los clusters
    d3.selectAll('.cluster-bg').classed('cluster-focused', false);
    d3.selectAll('.cluster-bg').classed('cluster-hover-simulated', false);
    d3.selectAll('.cluster-bg').attr('data-selected', 'false');
    
    // Restaurar estilos normales de todos los clusters
    d3.selectAll('.cluster-bg')
      .style('fill', 'var(--cluster-bg)')
      .style('stroke', 'var(--cluster-stroke)')
      .style('stroke-width', '3px');
    
    console.log('🔧 [ClusterNav] Selección de clusters limpiada');
  }

  applyClusterStyle(clusterGroup, strokeColor, strokeWidth) {
    // Solo aplicar estilo si el cluster no está seleccionado
    const clusterBg = clusterGroup.select('.cluster-bg');
    if (!clusterBg.empty() && clusterBg.attr('data-selected') !== 'true') {
      clusterBg
        .style('stroke', strokeColor)
        .style('stroke-width', strokeWidth);
    }
  }

  applySelectedClusterStyle(clusterGroup) {
    const clusterBg = clusterGroup.select('.cluster-bg');
    if (!clusterBg.empty()) {
      clusterBg
        .style('fill', 'var(--cluster-selected-bg)')
        .style('stroke', 'var(--cluster-selected-stroke)')
        .style('stroke-width', '5px');
    }
  }

  // Método para deseleccionar cluster cuando se hace clic fuera
  deselectClusterOnOutsideClick() {
    const selectedCluster = d3.select('.cluster-bg[data-selected="true"]');
    if (!selectedCluster.empty()) {
      this.deselectActiveCluster();
    } else {
      // Si no hay cluster seleccionado, asegurar que los bloqueadores estén activos
      this.createNodeBlockerOverlay();
    }
  }

  // Crear rects SVG invisibles para bloquear nodos en cada cluster
  createNodeBlockerOverlay() {
    // Remover rects bloqueadores existentes
    d3.selectAll('.cluster-node-blocker').remove();
    
    const clusters = d3.selectAll('.cluster');
    
    clusters.each((d, i, nodes) => {
      const cluster = d3.select(nodes[i]);
      const clusterBg = cluster.select('.cluster-bg');
      
      if (!clusterBg.empty()) {
        const clusterWidth = parseFloat(clusterBg.attr('width'));
        const clusterHeight = parseFloat(clusterBg.attr('height'));
        
        // Crear rect SVG invisible que bloquee los nodos
        const blocker = cluster.append('rect')
          .attr('class', 'cluster-node-blocker')
          .attr('data-cluster-index', i)
          .attr('x', 0)
          .attr('y', 0)
          .attr('width', clusterWidth)
          .attr('height', clusterHeight)
          .attr('fill', 'transparent')
          .attr('stroke', 'none')
          .attr('pointer-events', 'all')
          .style('cursor', 'pointer');
        
        // Agregar eventos al rect bloqueador para simular hover del cluster
        blocker
          .on('mouseenter', () => {
            // Simular hover del cluster usando clases CSS
            if (clusterBg.attr('data-selected') !== 'true') {
              // Agregar clase temporal para simular hover
              clusterBg.classed('cluster-hover-simulated', true);
            }
          })
          .on('mouseleave', () => {
            // Remover clase de hover simulado
            if (clusterBg.attr('data-selected') !== 'true') {
              clusterBg.classed('cluster-hover-simulated', false);
            }
          })
          .on('click', () => {
            // Seleccionar el cluster y remover bloqueadores
            this.zoomToCluster(cluster, null, false, true);
            this.removeNodeBlockerOverlay();
          });
      }
    });
    
    console.log('🔧 [ClusterNav] Rects SVG bloqueadores creados para cada cluster');
  }

  // Remover rects bloqueadores
  removeNodeBlockerOverlay() {
    d3.selectAll('.cluster-node-blocker').remove();
    console.log('🔧 [ClusterNav] Rects SVG bloqueadores removidos');
  }

  // Actualizar posición de los rects bloqueadores cuando cambia el tamaño de la ventana
  updateOverlayPosition() {
    const blockers = d3.selectAll('.cluster-node-blocker');
    if (!blockers.empty()) {
      // Recrear todos los rects bloqueadores para actualizar posiciones
      this.createNodeBlockerOverlay();
    }
  }


}

export { XDiagramsClusterNav }; 