/**
 * XDiagrams Loading Manager Module
 * Maneja la creación, visualización y ocultación del indicador de carga
 */

class XDiagramsLoadingManager {
  constructor() {
    this.isLoading = false;
    this.loadingContainer = null;
  }

  createLoading() {
    const app = document.querySelector('#app');
    if (!app) return;

    // Remover loading existente si existe
    document.getElementById('loading-container')?.remove();

    const loadingContainer = document.createElement('div');
    loadingContainer.id = 'loading-container';
    loadingContainer.style.cssText = `
      position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
      z-index: 9999; opacity: 1; transition: opacity 0.5s ease-in-out; pointer-events: none;
    `;

    const spinner = document.createElement('div');
    spinner.style.cssText = `
      width: 50px; height: 50px; border: 3px solid rgba(255, 255, 255, 0.3);
      border-top: 3px solid var(--loading-color); border-radius: 50%; animation: spin 1s linear infinite;
    `;

    // Crear animación CSS si no existe
    if (!document.querySelector('#loading-animation')) {
      const animationStyle = document.createElement('style');
      animationStyle.id = 'loading-animation';
      animationStyle.textContent = `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(animationStyle);
    }

    loadingContainer.appendChild(spinner);
    app.appendChild(loadingContainer);
    
    this.loadingContainer = loadingContainer;
  }

  show() {
    this.isLoading = true;
    this.createLoading();
    
    const diagram = document.getElementById('diagram');
    if (diagram) {
      diagram.style.setProperty('opacity', '0');
    }
  }

  hide() {
    this.isLoading = false;
    
    if (this.loadingContainer) {
      this.loadingContainer.style.opacity = '0';
      setTimeout(() => {
        if (this.loadingContainer && this.loadingContainer.parentNode) {
          this.loadingContainer.remove();
        }
      }, 500);
    }
  }

  getLoadingState() {
    return {
      isLoading: this.isLoading,
      loadingContainer: this.loadingContainer
    };
  }
}

export { XDiagramsLoadingManager }; 