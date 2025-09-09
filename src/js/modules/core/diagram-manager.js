/**
 * XDiagrams Diagram Manager Module
 * Maneja la lógica de inicialización y gestión del diagrama
 */

class XDiagramsDiagramManager {
  constructor(core) {
    this.core = core;
  }

  async initDiagram() {
    try {
      if (!this.core.config.url && !this.core.config.data) {
        console.error('XDiagrams: URL o datos no configurados');
        this.core.uiManager.hideLoading();
        return;
      }

      this.core.uiManager.showLoading();

      // Crear diagrama y configurar zoom
      const { diagram, container } = this.core.svgManager.createDiagram();
      if (!diagram || !container) {
        throw new Error('No se pudo crear el diagrama');
      }

      this.core.navigation.zoomManagerInstance.setupZoom(diagram, this.core.navigation);

      // Cargar datos
      const data = await this.loadData();
      
      // Logging temporal para debug
      console.log('XDiagrams: DEBUG - diagram-manager - Datos cargados:', data);
      if (data && data.length > 0) {
        console.log('XDiagrams: DEBUG - diagram-manager - Primer registro:', data[0]);
        console.log('XDiagrams: DEBUG - diagram-manager - Claves del primer registro:', Object.keys(data[0]));
        console.log('XDiagrams: DEBUG - diagram-manager - Technology:', data[0].Technology);
        console.log('XDiagrams: DEBUG - diagram-manager - Country:', data[0].Country);
        console.log('XDiagrams: DEBUG - diagram-manager - Responsive:', data[0].Responsive);
      }

      // Construir jerarquía
      const trees = this.core.hierarchyBuilder.buildHierarchy(data);
      this.core.globalTrees = trees;
      this.core.globalContainer = container;

      // Renderizar árboles
      this.core.diagramRenderer.renderTrees(trees, container);

      // Inicializar sistema de filtros
      await this.core.filters.initialize(data);

      // Inicializar generador de datos LLM en segundo plano
      await this.core.llmDataGenerator.initialize(data, this.core.config);

      // Inicializar pill flotante con la configuración del diagrama
      this.core.uiManager.updateFloatingTitlePill(this.core.config);

    } catch (error) {
      console.error('XDiagrams: Error de inicialización:', error);
      this.core.uiManager.hideLoading();
      this.core.uiManager.showErrorMessage(error);
    }
  }

  async loadData() {
    let data;
    
    // Si se proporciona data directamente, usarla
    if (this.core.config.data) {
      console.log('[DiagramManager] Usando datos proporcionados directamente');
      return this.core.config.data;
    }
    
    // Si se proporciona URL, cargar desde la fuente
    if (this.core.config.url) {
      if (window.xDiagramsLoader) {
        await new Promise((resolve, reject) => {
          window.xDiagramsLoader.loadData(this.core.config.url, (result, error) => {
            if (error) {
              console.error('XDiagrams: Error en loader:', error);
              reject(error);
            } else {
              data = result;
              resolve();
            }
          }, { privateApi: this.core.config.privateApi });
        });
      } else {
        const response = await fetch(this.core.config.url);
        const csvText = await response.text();
        data = await new Promise((resolve, reject) => {
          Papa.parse(csvText, {
            header: true,
            complete: (results) => resolve(results.data),
            error: (error) => reject(error)
          });
        });
      }
    }
    
    return data;
  }

  clearCacheAndReload() {
    if (window.xDiagramsLoader) {
      window.xDiagramsLoader.clearCache();
      this.core.uiManager.showCacheClearedNotification();
      setTimeout(() => {
        this.reloadDiagram();
      }, 500);
    } else {
      console.warn('XDiagrams: Loader no disponible');
    }
  }

  async reloadDiagram() {
    try {
      this.core.navigation.destroyZoomControls();
      
      this.core.svgManager.clearDiagram();
      
      this.core.navigation.createZoomControls();
      await this.initDiagram();
    } catch (error) {
      console.error('XDiagrams: Error de recarga:', error);
    }
  }

  setupEventListeners() {
    // Configurar evento de reintento
    window.addEventListener('xdiagrams-retry', () => {
      this.initDiagram();
    });
  }
}

export { XDiagramsDiagramManager }; 