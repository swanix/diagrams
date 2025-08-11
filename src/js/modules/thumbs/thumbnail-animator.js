/**
 * XDiagrams Thumbnail Animator Module
 * Maneja la lógica de animación de thumbnails
 */

class XDiagramsThumbnailAnimator {
  constructor(iconManager) {
    this.iconManager = iconManager;
    this.animationDelay = 100; // ms
    this.fadeInDuration = 300; // ms
  }

  /**
   * Muestra iconos con fade-in
   */
  showIconsWithFadeIn() {
    if (this.iconManager.isCustomIconsLoaded()) {
      this.showAllIcons();
    } else {
      setTimeout(() => this.showIconsWithFadeIn(), this.animationDelay);
    }
  }

  /**
   * Muestra todos los iconos con animación
   */
  showAllIcons() {
    // Mostrar todos los elementos de texto que usan la fuente xdiagrams-icons
    this.showCustomIcons();
    
    // Mostrar todas las imágenes externas
    this.showExternalImages();
  }

  /**
   * Muestra iconos personalizados con fade-in
   */
  showCustomIcons() {
    d3.selectAll('text[font-family="xdiagrams-icons"]')
      .transition()
      .duration(this.fadeInDuration)
      .style('opacity', 1);
  }

  /**
   * Muestra imágenes externas con fade-in
   */
  showExternalImages() {
    d3.selectAll('image[href]')
      .transition()
      .duration(this.fadeInDuration)
      .style('opacity', 1);
  }

  /**
   * Oculta todos los iconos
   */
  hideAllIcons() {
    d3.selectAll('text[font-family="xdiagrams-icons"]')
      .style('opacity', 0);
    
    d3.selectAll('image[href]')
      .style('opacity', 0);
  }

  /**
   * Muestra un icono específico con fade-in
   * @param {Object} element - El elemento D3 a animar
   * @param {number} duration - Duración de la animación (opcional)
   */
  showIconWithFadeIn(element, duration = this.fadeInDuration) {
    element
      .transition()
      .duration(duration)
      .style('opacity', 1);
  }

  /**
   * Oculta un icono específico con fade-out
   * @param {Object} element - El elemento D3 a animar
   * @param {number} duration - Duración de la animación (opcional)
   */
  hideIconWithFadeOut(element, duration = this.fadeInDuration) {
    element
      .transition()
      .duration(duration)
      .style('opacity', 0);
  }

  /**
   * Configura la duración de las animaciones
   * @param {number} duration - Duración en milisegundos
   */
  setAnimationDuration(duration) {
    this.fadeInDuration = duration;
  }

  /**
   * Configura el delay de las animaciones
   * @param {number} delay - Delay en milisegundos
   */
  setAnimationDelay(delay) {
    this.animationDelay = delay;
  }

  /**
   * Verifica si los iconos están listos para animar
   * @returns {boolean} True si los iconos están cargados
   */
  areIconsReady() {
    return this.iconManager.isCustomIconsLoaded();
  }
}

export { XDiagramsThumbnailAnimator }; 