/**
 * XDiagrams Thumbnail Renderer Module
 * Maneja la lógica de renderizado de elementos de thumbnail
 */

class XDiagramsThumbnailRenderer {
  constructor(iconManager) {
    this.iconManager = iconManager;
  }

  /**
   * Crea un elemento de thumbnail para un nodo
   * @param {Object} node - El nodo para crear el thumbnail
   * @param {Object} container - El contenedor D3
   * @param {number} x - Posición X
   * @param {number} y - Posición Y
   * @param {number} width - Ancho del thumbnail
   * @param {number} height - Alto del thumbnail
   * @param {Object} thumbnail - Objeto con type y value del thumbnail
   * @returns {Object} Elemento D3 creado
   */
  createThumbnailElement(node, container, x, y, width, height, thumbnail) {
    if (thumbnail.type === 'custom-icon') {
      return this.createCustomIconElement(container, x, y, thumbnail.value);
    } else if (thumbnail.type === 'external-image') {
      return this.createExternalImageElement(container, x, y, width, height, thumbnail.value);
    }
    
    // Fallback a icono personalizado por defecto
    return this.createDefaultIconElement(container, x, y);
  }

  /**
   * Crea un elemento de icono personalizado
   * @param {Object} container - El contenedor D3
   * @param {number} x - Posición X
   * @param {number} y - Posición Y
   * @param {string} iconName - Nombre del icono
   * @returns {Object} Elemento D3 creado
   */
  createCustomIconElement(container, x, y, iconName) {
    const unicode = this.iconManager.getIconUnicode(iconName);
    
    return container.append('text')
      .attr('x', x)
      .attr('y', y)
      .attr('font-family', 'xdiagrams-icons')
      .attr('font-size', '82px')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('class', 'embedded-thumbnail')
      .text(unicode)
      .style('opacity', 0);
  }

  /**
   * Crea un elemento de imagen externa
   * @param {Object} container - El contenedor D3
   * @param {number} x - Posición X
   * @param {number} y - Posición Y
   * @param {number} width - Ancho de la imagen
   * @param {number} height - Alto de la imagen
   * @param {string} imageUrl - URL de la imagen
   * @returns {Object} Elemento D3 creado
   */
  createExternalImageElement(container, x, y, width, height, imageUrl) {
    return container.append('image')
      .attr('x', x - width/2)
      .attr('y', y - height/2 - 10) // Ajustar posición Y para alinear mejor con iconos de texto
      .attr('width', width)
      .attr('height', height)
      .attr('href', imageUrl)
      .style('opacity', 0)
      .on('error', function() {
        console.error('Failed to load external image:', imageUrl);
        // Fallback a icono por defecto si la imagen falla
        d3.select(this).remove();
        return this.createDefaultIconElement(container, x, y);
      }.bind(this));
  }

  /**
   * Crea un elemento de icono por defecto
   * @param {Object} container - El contenedor D3
   * @param {number} x - Posición X
   * @param {number} y - Posición Y
   * @returns {Object} Elemento D3 creado
   */
  createDefaultIconElement(container, x, y) {
    const defaultUnicode = this.iconManager.getIconUnicode(this.iconManager.getDefaultIcon());
    
    return container.append('text')
      .attr('x', x)
      .attr('y', y)
      .attr('font-family', 'xdiagrams-icons')
      .attr('font-size', '82px')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('class', 'embedded-thumbnail')
      .text(defaultUnicode)
      .style('opacity', 0);
  }

  /**
   * Aplica estilos comunes a un elemento de thumbnail
   * @param {Object} element - El elemento D3
   * @param {Object} styles - Objeto con estilos a aplicar
   */
  applyStyles(element, styles = {}) {
    Object.entries(styles).forEach(([property, value]) => {
      element.style(property, value);
    });
  }

  /**
   * Actualiza la posición de un elemento de thumbnail
   * @param {Object} element - El elemento D3
   * @param {number} x - Nueva posición X
   * @param {number} y - Nueva posición Y
   */
  updatePosition(element, x, y) {
    element.attr('x', x).attr('y', y);
  }

  /**
   * Actualiza el tamaño de un elemento de thumbnail
   * @param {Object} element - El elemento D3
   * @param {number} width - Nuevo ancho
   * @param {number} height - Nuevo alto
   */
  updateSize(element, width, height) {
    element.attr('width', width).attr('height', height);
  }
}

export { XDiagramsThumbnailRenderer }; 