/**
 * XDiagrams Node Navigation Module
 * Manejo de navegación entre nodos y selección
 */

class XDiagramsNodeNav {
  constructor(navigation) {
    this.navigation = navigation;
    this.core = navigation.core;
    this.lastNodeDistance = 0;
    this.isCircularNavigation = false;
  }

  handleTabNavigation() {
    const selectedNodeRect = d3.select('.node-selected');
    if (selectedNodeRect.empty()) {
      return;
    }

    const nodeGroup = d3.select(selectedNodeRect.node().closest('.node'));
    if (nodeGroup.empty()) {
      return;
    }

    const clusterGroup = d3.select(nodeGroup.node().closest('.cluster'));
    if (clusterGroup.empty()) {
      return;
    }

    const allNodes = clusterGroup.selectAll('.node');
    
    if (allNodes.empty()) {
      return;
    }
    
    const currentIndex = Array.from(allNodes.nodes()).indexOf(nodeGroup.node());
    const nextIndex = event.shiftKey 
      ? (currentIndex <= 0 ? allNodes.size() - 1 : currentIndex - 1)
      : (currentIndex >= allNodes.size() - 1 ? 0 : currentIndex + 1);
    
    const nextNode = allNodes.nodes()[nextIndex];
    if (!nextNode) {
      return;
    }
    
    this.selectNode(d3.select(nextNode), false);
  }

  handleNodeArrowNavigation(arrowKey) {
    const selectedNodeRect = d3.select('.node-selected');
    if (selectedNodeRect.empty()) {
      return;
    }

    let nodeGroup = d3.select(selectedNodeRect.node().closest('.node'));
    let isParentNode = false;
    
    if (nodeGroup.empty()) {
      nodeGroup = d3.select(selectedNodeRect.node().closest('.cluster-bg'));
      if (!nodeGroup.empty()) {
        isParentNode = true;
      }
    } else {
      const nodeElement = nodeGroup.node();
      const nodeData = nodeElement.__data__;
      if (nodeData && (nodeData.parent === null || nodeData.parent === undefined || nodeData.parent === '')) {
        isParentNode = true;
      }
    }
    
    if (nodeGroup.empty()) {
      return;
    }

    const clusterGroup = d3.select(nodeGroup.node().closest('.cluster'));
    if (clusterGroup.empty()) {
      return;
    }

    const allNodes = isParentNode 
      ? clusterGroup.selectAll('.node, .cluster-bg')
      : clusterGroup.selectAll('.node');
    
    if (allNodes.empty()) {
      return;
    }

    const currentIndex = Array.from(allNodes.nodes()).indexOf(nodeGroup.node());
    
    let nextIndex;
    
    switch (arrowKey) {
      case 'ArrowUp':
        nextIndex = this.getPreviousNodeInColumn(currentIndex, allNodes, isParentNode);
        break;
      case 'ArrowDown':
        nextIndex = this.getNextNodeInColumn(currentIndex, allNodes, isParentNode);
        break;
      case 'ArrowLeft':
        nextIndex = this.getPreviousNodeInRow(currentIndex, allNodes);
        break;
      case 'ArrowRight':
        nextIndex = this.getNextNodeInRow(currentIndex, allNodes);
        break;
      default:
        return;
    }

    const nextNode = allNodes.nodes()[nextIndex];
    if (!nextNode) {
      return;
    }

    this.selectNode(d3.select(nextNode), false);
  }

  selectNode(nodeGroup, isClickNavigation = false) {
    let distanceFromPrevious = 0;
    if (!isClickNavigation) {
      const previousSelectedNode = d3.select('.node-selected');
      if (!previousSelectedNode.empty()) {
        const previousNodeGroup = d3.select(previousSelectedNode.node().closest('.node'));
        if (!previousNodeGroup.empty()) {
          const previousRect = previousNodeGroup.node().getBoundingClientRect();
          const currentRect = nodeGroup.node().getBoundingClientRect();
          
          const previousCenterX = previousRect.left + previousRect.width / 2;
          const previousCenterY = previousRect.top + previousRect.height / 2;
          const currentCenterX = currentRect.left + currentRect.width / 2;
          const currentCenterY = currentRect.top + currentRect.height / 2;
          
          const deltaX = currentCenterX - previousCenterX;
          const deltaY = currentCenterY - previousCenterY;
          distanceFromPrevious = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        }
      }
    }
    
    d3.selectAll('.node-selected')
      .classed('node-selected', false);

    // Aplicar la clase al elemento .node, no al rect
    nodeGroup
      .classed('node-selected', true);
    
    const rect = nodeGroup.select('rect');
    rect.style('stroke-linejoin', 'round');

    this.ensureNodeVisibleWithTransition(nodeGroup);

    const nodeElement = nodeGroup.node();
    const nodeData = nodeElement.__data__;
    
    if (nodeData) {
      const dataPayload = nodeData.data?.data || nodeData.data || {};
      this.core.uiManager.openInfoPanel(dataPayload, this.core.config);
    } else {
      const nodeId = nodeElement.querySelector('.node-id-label')?.textContent;
      if (nodeId) {
        const dataPayload = { id: nodeId };
        this.core.uiManager.openInfoPanel(dataPayload, this.core.config);
      }
    }
    
    this.lastNodeDistance = distanceFromPrevious;
    this.isCircularNavigation = distanceFromPrevious > 500;
  }

  exitNodeNavigationMode(fromInfoPanel = false) {
    const selectedNode = d3.select('.node-selected');
    let parentClusterGroup = null;
    
    if (!selectedNode.empty()) {
      const nodeElement = selectedNode.node();
      const clusterElement = nodeElement.closest('.cluster');
      if (clusterElement) {
        parentClusterGroup = d3.select(clusterElement);
      }
    }
    
    if (!fromInfoPanel) {
      if (this.core.uiManager.isInfoPanelClosing) {
      } else {
        this.core.uiManager.closeInfoPanel();
      }
    } else {
      if (this.core.uiManager.isInfoPanelClosing) {
      } else {
        this.core.uiManager.closeInfoPanel();
      }
    }
    
    d3.selectAll('.node-selected')
      .classed('node-selected', false);
    
    if (parentClusterGroup) {
      try {
        this.navigation.clusterNavInstance.zoomToCluster(parentClusterGroup, this.core.globalContainer, false, true);
      } catch (error) {
        console.error('Error calling zoomToCluster from exitNodeNavigationMode:', error);
      }
    }
  }

  selectFirstNodeInCluster(clusterGroup) {
    const cluster = d3.select(clusterGroup.node().closest('.cluster'));
    if (cluster.empty()) {
      return;
    }

    const allNodes = cluster.selectAll('.node');
    if (allNodes.empty()) {
      return;
    }

    const firstNode = allNodes.nodes()[0];
    if (firstNode) {
      this.selectNode(d3.select(firstNode), false);
      
      const nodeData = firstNode.__data__;
      
      if (nodeData) {
        this.core.diagramRenderer.zoomToNode(d3.select(firstNode), nodeData, true);
      }
    }
  }

  ensureNodeVisible(nodeGroup) {
    const svg = d3.select('#diagram');
    if (svg.empty()) return;

    const svgNode = svg.node();
    const svgRect = svgNode.getBoundingClientRect();
    const nodeRect = nodeGroup.node().getBoundingClientRect();
    
    const currentTransform = d3.zoomTransform(svgNode);
    
    const nodeCenterX = nodeRect.left + nodeRect.width / 2;
    const nodeCenterY = nodeRect.top + nodeRect.height / 2;
    
    const diagramX = (nodeCenterX - currentTransform.x) / currentTransform.k;
    const diagramY = (nodeCenterY - currentTransform.y) / currentTransform.k;
    
    const viewportWidth = svgRect.width;
    const viewportHeight = svgRect.height;
    
    const infoPanel = document.getElementById('side-panel');
    let infoPanelWidth = 0;
    if (infoPanel && infoPanel.style.display !== 'none') {
      const panelRect = infoPanel.getBoundingClientRect();
      infoPanelWidth = panelRect.width;
    }
    
    const availableViewportWidth = viewportWidth - infoPanelWidth;
    
    const marginX = availableViewportWidth * 0.2;
    const marginY = viewportHeight * 0.2;
    
    const viewportLeft = -currentTransform.x / currentTransform.k;
    const viewportRight = viewportLeft + availableViewportWidth / currentTransform.k;
    const viewportTop = -currentTransform.y / currentTransform.k;
    const viewportBottom = viewportTop + viewportHeight / currentTransform.k;
    
    let newX = currentTransform.x;
    let newY = currentTransform.y;
    let needsPan = false;
    
    if (diagramX < viewportLeft + marginX) {
      newX = -(diagramX - marginX) * currentTransform.k;
      needsPan = true;
    } else if (diagramX > viewportRight - marginX) {
      newX = -(diagramX + marginX - availableViewportWidth / currentTransform.k) * currentTransform.k;
      needsPan = true;
    }
    
    if (diagramY < viewportTop + marginY) {
      newY = -(diagramY - marginY) * currentTransform.k;
      needsPan = true;
    } else if (diagramY > viewportBottom - marginY) {
      newY = -(diagramY + marginY - viewportHeight / currentTransform.k) * currentTransform.k;
      needsPan = true;
    }
    
    if (needsPan) {
      const newTransform = d3.zoomIdentity
        .translate(newX, newY)
        .scale(currentTransform.k);
      
      // Usar módulo de navegación para aplicar transformación
      if (this.core.navigation && this.core.navigation.zoomManagerInstance) {
        this.core.navigation.zoomManagerInstance.zoomTo(newTransform, 300);
      } else {
        svg.transition()
          .duration(300)
          .ease(d3.easeCubicOut)
          .call(d3.zoom().transform, newTransform);
      }
    }
  }

  ensureNodeVisibleWithTransition(nodeGroup) {
    const svg = d3.select('#diagram');
    if (svg.empty()) return;

    const svgNode = svg.node();
    const svgRect = svgNode.getBoundingClientRect();
    const nodeRect = nodeGroup.node().getBoundingClientRect();
    
    const currentTransform = d3.zoomTransform(svgNode);
    
    const nodeCenterX = nodeRect.left + nodeRect.width / 2;
    const nodeCenterY = nodeRect.top + nodeRect.height / 2;
    
    const diagramX = (nodeCenterX - currentTransform.x) / currentTransform.k;
    const diagramY = (nodeCenterY - currentTransform.y) / currentTransform.k;
    
    const viewportWidth = svgRect.width;
    const viewportHeight = svgRect.height;
    
    const infoPanel = document.getElementById('side-panel');
    let infoPanelWidth = 0;
    if (infoPanel && infoPanel.style.display !== 'none') {
      const panelRect = infoPanel.getBoundingClientRect();
      infoPanelWidth = panelRect.width;
    }
    
    const availableViewportWidth = viewportWidth - infoPanelWidth;
    
    const marginX = availableViewportWidth * 0.2;
    const marginY = viewportHeight * 0.2;
    
    const viewportLeft = -currentTransform.x / currentTransform.k;
    const viewportRight = viewportLeft + availableViewportWidth / currentTransform.k;
    const viewportTop = -currentTransform.y / currentTransform.k;
    const viewportBottom = viewportTop + viewportHeight / currentTransform.k;
    
    let newX = currentTransform.x;
    let newY = currentTransform.y;
    let needsPan = false;
    
    if (diagramX < viewportLeft + marginX) {
      newX = -(diagramX - marginX) * currentTransform.k;
      needsPan = true;
    } else if (diagramX > viewportRight - marginX) {
      newX = -(diagramX + marginX - availableViewportWidth / currentTransform.k) * currentTransform.k;
      needsPan = true;
    }
    
    if (diagramY < viewportTop + marginY) {
      newY = -(diagramY - marginY) * currentTransform.k;
      needsPan = true;
    } else if (diagramY > viewportBottom - marginY) {
      newY = -(diagramY + marginY - viewportHeight / currentTransform.k) * currentTransform.k;
      needsPan = true;
    }
    
    if (needsPan) {
      const distanceX = Math.abs(newX - currentTransform.x);
      const distanceY = Math.abs(newY - currentTransform.y);
      const totalDistance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
      
      let baseDuration, maxDuration;
      
      if (this.isCircularNavigation) {
        baseDuration = 800;
        maxDuration = 2500;
      } else {
        baseDuration = 300;
        maxDuration = 1500;
      }
      
      const distanceFactor = Math.min(totalDistance / 1000, 1);
      const duration = baseDuration + (maxDuration - baseDuration) * distanceFactor;
      
      const newTransform = d3.zoomIdentity
        .translate(newX, newY)
        .scale(currentTransform.k);
      
      // Usar módulo de navegación para aplicar transformación
      if (this.core.navigation && this.core.navigation.zoomManagerInstance) {
        this.core.navigation.zoomManagerInstance.zoomTo(newTransform, duration);
      } else {
        svg.transition()
          .duration(duration)
          .ease(d3.easeCubicOut)
          .call(d3.zoom().transform, newTransform);
      }
    }
  }

  getPreviousNodeInRow(currentIndex, allNodes) {
    return this._findNodeInRow(currentIndex, allNodes, 'previous');
  }

  getNextNodeInRow(currentIndex, allNodes) {
    return this._findNodeInRow(currentIndex, allNodes, 'next');
  }

  getPreviousNodeInColumn(currentIndex, allNodes, isParentNode = false) {
    return this._findNodeInColumn(currentIndex, allNodes, 'previous', isParentNode);
  }

  getNextNodeInColumn(currentIndex, allNodes, isParentNode = false) {
    return this._findNodeInColumn(currentIndex, allNodes, 'next', isParentNode);
  }

  _findNodeInRow(currentIndex, allNodes, direction) {
    const nodes = allNodes.nodes();
    const currentNode = nodes[currentIndex];
    if (!currentNode) return currentIndex;

    const currentRect = currentNode.getBoundingClientRect();
    const currentY = currentRect.top + currentRect.height / 2;
    const tolerance = 20;

    let bestIndex = currentIndex;
    let bestDistance = Infinity;

    for (let i = 0; i < nodes.length; i++) {
      if (i === currentIndex) continue;

      const nodeRect = nodes[i].getBoundingClientRect();
      const nodeY = nodeRect.top + nodeRect.height / 2;
      
      if (Math.abs(nodeY - currentY) <= tolerance) {
        const distance = nodeRect.left - currentRect.left;
        
        if (direction === 'next' && distance > 0 && distance < bestDistance) {
          bestIndex = i;
          bestDistance = distance;
        } else if (direction === 'previous' && distance < 0 && Math.abs(distance) < bestDistance) {
          bestIndex = i;
          bestDistance = Math.abs(distance);
        }
      }
    }

    if (bestIndex === currentIndex) {
      const sameRowNodes = [];
      for (let i = 0; i < nodes.length; i++) {
        if (i === currentIndex) continue;

        const nodeRect = nodes[i].getBoundingClientRect();
        const nodeY = nodeRect.top + nodeRect.height / 2;
        
        if (Math.abs(nodeY - currentY) <= tolerance) {
          sameRowNodes.push({
            index: i,
            x: nodeRect.left,
            distance: nodeRect.left - currentRect.left
          });
        }
      }

      if (sameRowNodes.length > 0) {
        sameRowNodes.sort((a, b) => a.x - b.x);
        
        if (direction === 'next') {
          bestIndex = sameRowNodes[0].index;
        } else {
          bestIndex = sameRowNodes[sameRowNodes.length - 1].index;
        }
      }
    }

    return bestIndex;
  }

  _findNodeInColumn(currentIndex, allNodes, direction, isParentNode = false) {
    const nodes = allNodes.nodes();
    const currentNode = nodes[currentIndex];
    if (!currentNode) return currentIndex;

    const currentRect = currentNode.getBoundingClientRect();
    const currentX = currentRect.left + currentRect.width / 2;
    const currentY = currentRect.top + currentRect.height / 2;
    
    const horizontalTolerance = 50;
    
    const candidates = [];
    
    for (let i = 0; i < nodes.length; i++) {
      if (i === currentIndex) continue;

      const nodeRect = nodes[i].getBoundingClientRect();
      const nodeX = nodeRect.left + nodeRect.width / 2;
      const nodeY = nodeRect.top + nodeRect.height / 2;
      
      const verticalDistance = nodeY - currentY;
      
      if ((direction === 'next' && verticalDistance > 0) || 
          (direction === 'previous' && verticalDistance < 0)) {
        
        const horizontalDistance = Math.abs(nodeX - currentX);
        
        const isCandidateNode = isParentNode ? !nodes[i].classList.contains('cluster-bg') : true;
        
        if (horizontalDistance <= horizontalTolerance && isCandidateNode) {
          candidates.push({
            index: i,
            verticalDistance: Math.abs(verticalDistance),
            horizontalDistance: horizontalDistance,
            node: nodes[i],
            nodeY: nodeY
          });
        }
      }
    }
    
    if (candidates.length === 0) {
      for (let i = 0; i < nodes.length; i++) {
        if (i === currentIndex) continue;

        const nodeRect = nodes[i].getBoundingClientRect();
        const nodeY = nodeRect.top + nodeRect.height / 2;
        const verticalDistance = nodeY - currentY;
        
        if ((direction === 'next' && verticalDistance > 0) || 
            (direction === 'previous' && verticalDistance < 0)) {
          
          const isCandidateNode = isParentNode ? !nodes[i].classList.contains('cluster-bg') : true;
          
          if (isCandidateNode) {
            candidates.push({
              index: i,
              verticalDistance: Math.abs(verticalDistance),
              horizontalDistance: Math.abs(nodeRect.left + nodeRect.width / 2 - currentX),
              node: nodes[i],
              nodeY: nodeY
            });
          }
        }
      }
    }
    
    if (candidates.length === 0) {
      if (isParentNode) {
        if (direction === 'previous') {
        } else {
        }
        return currentIndex;
      } else {
        const allChildNodes = [];
        
        for (let i = 0; i < nodes.length; i++) {
          if (i === currentIndex) continue;
          
          if (!nodes[i].classList.contains('cluster-bg')) {
            const nodeRect = nodes[i].getBoundingClientRect();
            const nodeY = nodeRect.top + nodeRect.height / 2;
            const nodeX = nodeRect.left + nodeRect.width / 2;
            
            allChildNodes.push({
              index: i,
              y: nodeY,
              x: nodeX,
              verticalDistance: nodeY - currentY
            });
          }
        }

        if (allChildNodes.length > 0) {
          allChildNodes.sort((a, b) => a.y - b.y);
          
          let bestIndex;
          if (direction === 'next') {
            bestIndex = allChildNodes[0].index;
          } else {
            bestIndex = allChildNodes[allChildNodes.length - 1].index;
          }
          
          return bestIndex;
        } else {
          return currentIndex;
        }
      }
    }
    
    const levelGroups = new Map();
    const levelTolerance = 20;
    
    for (const candidate of candidates) {
      let grouped = false;
      for (const [levelY, group] of levelGroups) {
        if (Math.abs(candidate.nodeY - levelY) <= levelTolerance) {
          group.push(candidate);
          grouped = true;
          break;
        }
      }
      if (!grouped) {
        levelGroups.set(candidate.nodeY, [candidate]);
      }
    }
    
    const sortedLevels = Array.from(levelGroups.entries())
      .sort(([levelY1], [levelY2]) => {
        const distance1 = Math.abs(levelY1 - currentY);
        const distance2 = Math.abs(levelY2 - currentY);
        return distance1 - distance2;
      });
    
    if (sortedLevels.length === 0) {
      return currentIndex;
    }
    
    const [closestLevelY, levelCandidates] = sortedLevels[0];
    
    let bestIndex = currentIndex;
    let bestHorizontalDistance = Infinity;
    
    for (const candidate of levelCandidates) {
      if (candidate.horizontalDistance < bestHorizontalDistance) {
        bestIndex = candidate.index;
        bestHorizontalDistance = candidate.horizontalDistance;
      }
    }
    
    return bestIndex;
  }
}

export { XDiagramsNodeNav }; 