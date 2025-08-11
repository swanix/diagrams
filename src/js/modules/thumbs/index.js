/**
 * XDiagrams Thumbnails Module - Coordinador Principal
 * Coordina la gestión de iconos y thumbnails
 */

import { XDiagramsIconManager } from './icon-manager.js';
import { XDiagramsThumbnailResolver } from './thumbnail-resolver.js';
import { XDiagramsThumbnailRenderer } from './thumbnail-renderer.js';
import { XDiagramsThumbnailAnimator } from './thumbnail-animator.js';

class XDiagramsThumbs {
  constructor(config = {}) {
    this.iconManager = new XDiagramsIconManager(config);
    this.resolver = new XDiagramsThumbnailResolver(this.iconManager);
    this.renderer = new XDiagramsThumbnailRenderer(this.iconManager);
    this.animator = new XDiagramsThumbnailAnimator(this.iconManager);
  }

  // Métodos de coordinación esencial
  resolveThumbnail(node) {
    return this.resolver.resolveThumbnail(node);
  }

  createThumbnailElement(node, container, x, y, width, height) {
    const thumbnail = this.resolver.resolveThumbnail(node);
    return this.renderer.createThumbnailElement(node, container, x, y, width, height, thumbnail);
  }

  showIconsWithFadeIn() {
    return this.animator.showIconsWithFadeIn();
  }

  // Acceso directo a los submódulos para casos específicos
  get iconManagerInstance() {
    return this.iconManager;
  }

  get resolverInstance() {
    return this.resolver;
  }

  get rendererInstance() {
    return this.renderer;
  }

  get animatorInstance() {
    return this.animator;
  }
}

export { XDiagramsThumbs }; 