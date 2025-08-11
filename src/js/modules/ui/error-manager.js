/**
 * XDiagrams Error Manager Module
 * Maneja la visualización de errores y mensajes de error
 */

class XDiagramsErrorManager {
  constructor() {
    this.errorContainer = null;
  }

  showError(error) {
    // Manejar errores específicos con mensajes simples
    if (this.isSimpleError(error)) {
      this.showSimpleError('No se ha encontrado el archivo de datos');
      return;
    }

    const errorContainer = document.createElement('div');
    errorContainer.id = 'xdiagrams-error';
    errorContainer.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #dc3545;
      color: white;
      padding: 20px;
      border-radius: 8px;
      font-family: Arial, sans-serif;
      font-size: 14px;
      max-width: 500px;
      z-index: 10000;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      text-align: center;
    `;

    const title = document.createElement('h3');
    title.textContent = 'Error al cargar el diagrama';
    title.style.cssText = 'margin: 0 0 15px 0; font-size: 18px;';
    errorContainer.appendChild(title);

    const message = document.createElement('p');
    message.textContent = error.message || 'Error desconocido al cargar los datos';
    message.style.cssText = 'margin: 0 0 15px 0; line-height: 1.4;';
    errorContainer.appendChild(message);

    const retryButton = document.createElement('button');
    retryButton.textContent = 'Reintentar';
    retryButton.style.cssText = `
      background: white;
      color: #dc3545;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      margin-right: 10px;
    `;
    retryButton.onclick = () => {
      errorContainer.remove();
      // Emitir evento para reintentar
      window.dispatchEvent(new CustomEvent('xdiagrams-retry'));
    };

    const closeButton = document.createElement('button');
    closeButton.textContent = 'Cerrar';
    closeButton.style.cssText = `
      background: transparent;
      color: white;
      border: 1px solid white;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    `;
    closeButton.onclick = () => {
      errorContainer.remove();
    };

    const buttonContainer = document.createElement('div');
    buttonContainer.appendChild(retryButton);
    buttonContainer.appendChild(closeButton);
    errorContainer.appendChild(buttonContainer);

    document.body.appendChild(errorContainer);
    this.errorContainer = errorContainer;

    // Auto-remover después de 30 segundos
    setTimeout(() => {
      if (errorContainer.parentNode) {
        errorContainer.remove();
      }
    }, 30000);
  }

  showSimpleError(message) {
    const existingError = document.getElementById('xdiagrams-simple-error');
    if (existingError) {
      existingError.remove();
    }

    const errorContainer = document.createElement('div');
    errorContainer.id = 'xdiagrams-simple-error';
    errorContainer.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: white;
      opacity: 0.5;
      font-family: Arial, sans-serif;
      font-size: 18px;
      z-index: 10000;
      text-align: center;
      max-width: 400px;
      line-height: 1.4;
    `;

    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    messageElement.style.cssText = 'margin: 0;';
    errorContainer.appendChild(messageElement);

    document.body.appendChild(errorContainer);
    this.errorContainer = errorContainer;
  }

  isSimpleError(error) {
    const simpleErrorPatterns = [
      '404',
      'No se pudo cargar',
      'Failed to fetch',
      'ERR_CONNECTION_CLOSED',
      'Error cargando archivo CSV',
      'No se pudo determinar el tipo de fuente',
      'URL o formato no reconocido'
    ];

    return simpleErrorPatterns.some(pattern => 
      error.message && error.message.includes(pattern)
    );
  }

  clearError() {
    if (this.errorContainer && this.errorContainer.parentNode) {
      this.errorContainer.remove();
      this.errorContainer = null;
    }
  }
}

export { XDiagramsErrorManager }; 