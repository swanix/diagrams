/**
 * XDiagrams Navigation Module - Coordinador Principal
 * Coordina todos los submódulos de navegación
 */

import { XDiagramsZoomControls } from './zoom-controls.js';
import { XDiagramsZoomManager } from './zoom-manager.js';
import { XDiagramsKeyboardNav } from './keyboard-nav.js';
import { XDiagramsClusterNav } from './cluster-nav.js';
import { XDiagramsNodeNav } from './node-nav.js';
import { XDiagramsResizeHandler } from './resize-handler.js';
import { XDiagramsEventHandler } from './event-handler.js';

class XDiagramsNavigation {
  constructor(core) {
    this.core = core;
    this.escapeLevel = 0;

    // Inicializar submódulos
    this.zoomManager = new XDiagramsZoomManager();
    this.zoomControls = new XDiagramsZoomControls(this);
    this.keyboardNav = new XDiagramsKeyboardNav(this);
    this.clusterNav = new XDiagramsClusterNav(this);
    this.nodeNav = new XDiagramsNodeNav(this);
    this.resizeHandler = new XDiagramsResizeHandler(this);
    this.eventHandler = new XDiagramsEventHandler();
  }

  // Métodos de coordinación esencial
  createZoomControls() {
    return this.zoomControls.create();
  }

  setupKeyboardNavigation(container) {
    return this.keyboardNav.setup(container);
  }

  setupResizeHandler() {
    return this.resizeHandler.setup();
  }

  destroyZoomControls() {
    this.keyboardNav.destroy();
    this.resizeHandler.destroy();
    this.zoomControls.destroy();
    this.eventHandler.destroy();
  }

  // Método delegado del zoom manager
  getCurrentZoom() {
    return this.zoomManager.getCurrentZoom();
  }

  // Acceso directo a los submódulos para casos específicos
  get zoomManagerInstance() {
    return this.zoomManager;
  }

  get zoomControlsInstance() {
    return this.zoomControls;
  }

  get keyboardNavInstance() {
    return this.keyboardNav;
  }

  get clusterNavInstance() {
    return this.clusterNav;
  }

  get nodeNavInstance() {
    return this.nodeNav;
  }

  get resizeHandlerInstance() {
    return this.resizeHandler;
  }

  // Getters para propiedades de navegación
  get lastNodeDistance() {
    return this.nodeNav.lastNodeDistance;
  }

  get isCircularNavigation() {
    return this.nodeNav.isCircularNavigation;
  }
}

export { XDiagramsNavigation }; 