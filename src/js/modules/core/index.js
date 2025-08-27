/**
 * XDiagrams Core Module - Coordinador Principal
 * Coordina todos los submódulos del core
 */

import { XDiagramsThumbs } from '../thumbs/index.js';
import { XDiagramsNavigation } from '../navigation/index.js';
import { XDiagramsLoader } from '../loader/index.js';
import { XDiagramsDiagramRenderer } from './diagram-renderer.js';
import { XDiagramsHierarchyBuilder } from './hierarchy-builder.js';
import { XDiagramsSVGManager } from './svg-manager.js';
import { XDiagramsTextHandler } from './text-handler.js';
import { XDiagramsDiagramManager } from './diagram-manager.js';
import { XDiagramsUIManager } from '../ui/index.js';
import { XDiagramsLLMDataGenerator } from '../utils/llm-data-generator.js';

class XDiagrams {
  constructor(config) {
    this.config = {
      url: null,
      title: "Diagrams",
      logo: "img/logo.svg",
      spacing: 80,
      verticalSpacing: 170,
      linearSpacing: 30,
      branchedSpacing: 80,
      nodeWidth: 100,
      nodeHeight: 125,
      treeSpacing: 100,
      clustersPerRow: "4 5 5 5",
      clusterGapX: 120,
      clusterGapY: 120,
      defaultIcon: 'detail',
      showThemeToggle: false,
      transitionDuration: {
        click: 1000,
        tab: 1500,
        reset: 3000,
        resize: 300
      },
      initialZoom: {
        scale: 0.95,
        padding: 0.05
      },
      fitOnResize: true,
      textConfig: {
        maxWidth: 80,
        maxLines: 2,
        fontSize: 8,
        nodeNameFontSize: 9,
        lineHeight: 1.2,
        fontFamily: 'Arial, sans-serif',
        textAnchor: 'middle',
        dominantBaseline: 'middle',
        ellipsis: '...',
        fontWeight: 'bold'
      },
      linkConfig: {
        cornerRadius: 8,
        verticalTolerance: 5
      },
      selectedNode: {
        stroke: '#007bff',
        strokeWidth: 6,
        fill: '#E0FFFF'
      },
      enableNavigationLogs: false, // Desactivar logs de navegación por defecto (mejor performance)
      privateApi: false, // Indicar si la API es privada/protegida
      ...config
    };
    
    this.globalTrees = [];
    this.globalContainer = null;
    this.clusterPositions = new Map();
    
    // Inicializar submódulos
    this.thumbs = new XDiagramsThumbs({
      defaultIcon: this.config.defaultIcon
    });
    this.uiManager = new XDiagramsUIManager({ thumbsSystem: this.thumbs });
    this.svgManager = new XDiagramsSVGManager();
    this.textHandler = new XDiagramsTextHandler(this.config.textConfig);
    
    this.navigation = new XDiagramsNavigation(this);
    this.loader = new XDiagramsLoader();
    this.diagramRenderer = new XDiagramsDiagramRenderer(this);
    this.hierarchyBuilder = new XDiagramsHierarchyBuilder();
    this.diagramManager = new XDiagramsDiagramManager(this);
    this.llmDataGenerator = new XDiagramsLLMDataGenerator();
    
    this.svgManager.ensureDiagramHidden();
    this.diagramManager.setupEventListeners();
  }

  // Métodos delegados al Diagram Manager
  async initDiagram() {
    return this.diagramManager.initDiagram();
  }

  clearCacheAndReload() {
    return this.diagramManager.clearCacheAndReload();
  }

  async reloadDiagram() {
    return this.diagramManager.reloadDiagram();
  }

  // Métodos delegados al diagram-renderer
  calculateDiagramBounds() {
    return this.diagramRenderer.calculateDiagramBounds();
  }

  zoomToNode(nodeGroup, node, isClickNavigation = false) {
    return this.diagramRenderer.zoomToNode(nodeGroup, node, isClickNavigation);
  }

  applyInitialZoomImmediate(container, width, height) {
    return this.diagramRenderer.applyInitialZoomImmediate(container, width, height);
  }

  // Métodos delegados al Navigation
  getCurrentZoom() {
    return this.navigation.getCurrentZoom();
  }

  // Métodos delegados al SVG Manager
  createDiagram() {
    return this.svgManager.createDiagram();
  }

  ensureDiagramHidden() {
    return this.svgManager.ensureDiagramHidden();
  }

  showDiagram() {
    return this.svgManager.showDiagram();
  }

  hideDiagram() {
    return this.svgManager.hideDiagram();
  }

  clearDiagram() {
    return this.svgManager.clearDiagram();
  }

  getDiagram() {
    return this.svgManager.getDiagram();
  }

  getContainer() {
    return this.svgManager.getContainer();
  }

  getDiagramDimensions() {
    return this.svgManager.getDiagramDimensions();
  }

  // Métodos delegados al Text Handler
  renderText(container, text, options = {}) {
    return this.textHandler.renderText(container, text, options);
  }

  renderNodeText(container, text, x, y, options = {}) {
    return this.textHandler.renderNodeText(container, text, x, y, options);
  }

  renderNodeTextCentered(container, text, x, y, options = {}) {
    return this.textHandler.renderNodeTextCentered(container, text, x, y, options);
  }

  updateTextConfig(newConfig) {
    return this.textHandler.updateConfig(newConfig);
  }

  // Métodos delegados al UI Manager (InfoPanel)
  updateInfoPanel(transform) {
    return this.uiManager.updateInfoPanel(transform);
  }

  openInfoPanel(nodeData, diagramConfig = {}) {
    return this.uiManager.openInfoPanel(nodeData, diagramConfig);
  }

  closeInfoPanel() {
    return this.uiManager.closeInfoPanel();
  }

  // Acceso directo a los submódulos para casos específicos
  get svgManagerInstance() {
    return this.svgManager;
  }

  get textHandlerInstance() {
    return this.textHandler;
  }

  get uiManagerInstance() {
    return this.uiManager;
  }

  get diagramManagerInstance() {
    return this.diagramManager;
  }

  get llmDataGeneratorInstance() {
    return this.llmDataGenerator;
  }
}

export { XDiagrams }; 