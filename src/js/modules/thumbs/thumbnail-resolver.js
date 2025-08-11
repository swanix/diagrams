/**
 * XDiagrams Thumbnail Resolver Module
 * Maneja la lógica de resolución de thumbnails para nodos
 */

class XDiagramsThumbnailResolver {
  constructor(iconManager) {
    this.iconManager = iconManager;
  }

  /**
   * Resuelve el thumbnail para un nodo
   * @param {Object} node - El nodo para resolver el thumbnail
   * @returns {Object} Objeto con type y value del thumbnail
   */
  resolveThumbnail(node) {
    const img = node.img || (node.data && node.data.img);
    const layout = node.layout || (node.data && node.data.layout);
    
    // Si Img tiene un valor, usarlo siempre (prioridad alta)
    if (img) {
      const imgResult = this.resolveFromValue(img);
      if (imgResult) {
        return imgResult;
      }
    }
    
    // Si Img no tiene valor pero Layout sí, usar Layout
    if (!img && layout) {
      const layoutResult = this.resolveFromValue(layout);
      if (layoutResult) {
        return layoutResult;
      }
    }
    
    // Usar icono por defecto
    return { type: 'custom-icon', value: this.iconManager.getDefaultIcon() };
  }

  /**
   * Resuelve un valor específico (img o layout)
   * @param {string} value - El valor a resolver
   * @returns {Object|null} Objeto con type y value, o null si no es válido
   */
  resolveFromValue(value) {
    // Si es un icono personalizado válido, usarlo
    if (this.iconManager.isValidCustomIcon(value)) {
      const normalizedValue = this.iconManager.normalizeIconName(value);
      return { type: 'custom-icon', value: normalizedValue };
    }
    
    // Si es una URL de imagen externa, usarla
    if (this.iconManager.isExternalImageUrl(value)) {
      return { type: 'external-image', value: value };
    }
    
    return null;
  }

  /**
   * Obtiene el tipo de thumbnail para un valor
   * @param {string} value - El valor a analizar
   * @returns {string} Tipo de thumbnail ('custom-icon', 'external-image', o 'unknown')
   */
  getThumbnailType(value) {
    if (this.iconManager.isValidCustomIcon(value)) {
      return 'custom-icon';
    }
    
    if (this.iconManager.isExternalImageUrl(value)) {
      return 'external-image';
    }
    
    return 'unknown';
  }

  /**
   * Valida si un nodo tiene un thumbnail válido
   * @param {Object} node - El nodo a validar
   * @returns {boolean} True si el nodo tiene un thumbnail válido
   */
  hasValidThumbnail(node) {
    const img = node.img || (node.data && node.data.img);
    const layout = node.layout || (node.data && node.data.layout);
    
    return (img && this.getThumbnailType(img) !== 'unknown') ||
           (layout && this.getThumbnailType(layout) !== 'unknown');
  }
}

export { XDiagramsThumbnailResolver }; 