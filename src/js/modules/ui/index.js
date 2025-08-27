/**
 * XDiagrams UI Manager Module - Coordinador Principal
 * Maneja toda la interfaz de usuario, loading, errores, notificaciones y paneles
 */

import { XDiagramsLoadingManager } from './loading-manager.js';
import { XDiagramsErrorManager } from './error-manager.js';
import { XDiagramsNotificationManager } from './notification-manager.js';
import { XDiagramsInfoPanel } from './infopanel.js';
import { XDiagramsFloatingTitlePill } from './floating-title-pill.js';

class XDiagramsUIManager {
  constructor(options = {}) {
    this.errorManager = new XDiagramsErrorManager();
    this.loadingManager = new XDiagramsLoadingManager();
    this.notificationManager = new XDiagramsNotificationManager();
    this.infoPanel = new XDiagramsInfoPanel({ thumbsSystem: options.thumbsSystem });
    this.floatingTitlePill = new XDiagramsFloatingTitlePill();
  }

  // Métodos de coordinación esencial
  showLoading() {
    return this.loadingManager.show();
  }

  hideLoading() {
    return this.loadingManager.hide();
  }

  showErrorMessage(error) {
    return this.errorManager.showError(error);
  }

  showSimpleErrorMessage(message) {
    return this.errorManager.showSimpleError(message);
  }

  showCacheClearedNotification() {
    return this.notificationManager.showCacheCleared();
  }

  // Métodos del InfoPanel
  openInfoPanel(nodeData, diagramConfig = {}) {
    return this.infoPanel.open(nodeData, diagramConfig);
  }

  closeInfoPanel() {
    return this.infoPanel.close();
  }

  updateInfoPanel(transform) {
    return this.infoPanel.updateInfoPanel(transform);
  }

  getInfoPanelData() {
    return this.infoPanel.getInfoPanelData();
  }

  clearInfoPanel() {
    return this.infoPanel.clearInfoPanel();
  }

  setInfoPanelValue(id, value) {
    return this.infoPanel.setInfoPanelValue(id, value);
  }

  getInfoPanelElement(id) {
    return this.infoPanel.getInfoPanelElement(id);
  }

  // Acceso directo a los submódulos para casos específicos
  get loadingManagerInstance() {
    return this.loadingManager;
  }

  get errorManagerInstance() {
    return this.errorManager;
  }

  get notificationManagerInstance() {
    return this.notificationManager;
  }

  get infoPanelInstance() {
    return this.infoPanel;
  }

  // Propiedades delegadas del InfoPanel
  get isInfoPanelClosing() {
    return this.infoPanel.isClosing;
  }

  // Métodos del Floating Title Pill
  updateFloatingTitlePill(config) {
    // Verificar si se debe mostrar el floating title pill
    const showTitle = config.showTitle !== false; // Por defecto true
    
    if (showTitle) {
      this.floatingTitlePill.updateFromConfig(config);
      // Iniciar monitoreo de visibilidad
      this.floatingTitlePill.startVisibilityMonitoring();
      // Iniciar listener de tema
      this.floatingTitlePill.setupThemeListener();
    } else {
      // Ocultar el floating title pill si está configurado para no mostrarse
      this.floatingTitlePill.hide();
    }
  }

  showFloatingTitlePill() {
    return this.floatingTitlePill.show();
  }

  hideFloatingTitlePill() {
    return this.floatingTitlePill.hide();
  }

  destroyFloatingTitlePill() {
    return this.floatingTitlePill.destroy();
  }

  // Acceso directo al Floating Title Pill
  get floatingTitlePillInstance() {
    return this.floatingTitlePill;
  }
}

// Exportar la clase principal
export { XDiagramsUIManager };

