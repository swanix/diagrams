/**
 * XDiagrams Icon Manager Module
 * Maneja la gestión de iconos personalizados y validaciones
 */

class XDiagramsIconManager {
  constructor(config = {}) {
    this.config = {
      defaultIcon: 'detail',
      ...config
    };
    
    // Iconos personalizados válidos (nombres sin prefijo)
    this.validCustomIcons = [
      'detail', 'list', 'grid', 'form', 'document', 'modal', 'report', 'profile', 'home', 'settings'
    ];

    // Mapeo de iconos a códigos Unicode (nombres sin prefijo)
    this.iconUnicodeMap = {
      'detail': '\ue900',
      'list': '\ue93b',
      'grid': '\ue938',
      'form': '\ue934',
      'document': '\ue901',
      'modal': '\ue93c',
      'report': '\ue942',
      'profile': '\ue941',
      'home': '\ue939',
      'settings': '\ue943'
    };

    // Mapeo de alias comunes a nombres de iconos
    this.iconAliases = {
      'icon': 'detail',
      'default': 'detail'
    };
  }

  // Validar si un icono personalizado es válido
  isValidCustomIcon(iconName) {
    if (!iconName || typeof iconName !== 'string') {
      return false;
    }
    
    const normalizedName = this.normalizeIconName(iconName);
    return this.validCustomIcons.includes(normalizedName);
  }

  // Obtener código Unicode de un icono
  getIconUnicode(iconName) {
    if (!iconName || typeof iconName !== 'string') {
      return this.iconUnicodeMap['detail'];
    }
    
    const normalizedName = this.normalizeIconName(iconName);
    return this.iconUnicodeMap[normalizedName] || this.iconUnicodeMap['detail'];
  }

  // Normalizar nombre de icono (convertir a minúsculas y reemplazar espacios con guiones)
  normalizeIconName(iconName) {
    if (!iconName || typeof iconName !== 'string') return '';
    
    let normalized = iconName
      .toLowerCase()
      .trim();
    
    // Verificar si hay un alias directo
    if (this.iconAliases[normalized]) {
      return this.iconAliases[normalized];
    }
    
    // Aplicar normalización estándar
    normalized = normalized
      .replace(/\s+/g, '-')  // Reemplazar espacios múltiples con un solo guión
      .replace(/[^a-z0-9-]/g, '-')  // Reemplazar caracteres especiales con guiones
      .replace(/-+/g, '-')  // Reemplazar múltiples guiones consecutivos con uno solo
      .replace(/^-|-$/g, '');  // Remover guiones al inicio y final
    
    return normalized;
  }

  // Verificar si es una URL de imagen externa
  isExternalImageUrl(url) {
    if (!url || typeof url !== 'string') return false;
    
    try {
      const urlObj = new URL(url);
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.bmp'];
      const hasImageExtension = imageExtensions.some(ext => 
        urlObj.pathname.toLowerCase().endsWith(ext)
      );
      
      const imageIndicators = ['image', 'img', 'photo', 'pic', 'avatar'];
      const hasImageIndicator = imageIndicators.some(indicator => 
        urlObj.pathname.toLowerCase().includes(indicator)
      );
      
      return hasImageExtension || hasImageIndicator;
    } catch (e) {
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.bmp'];
      return imageExtensions.some(ext => url.toLowerCase().endsWith(ext));
    }
  }

  // Verificar si los iconos personalizados están cargados
  isCustomIconsLoaded() {
    const testElement = document.createElement('span');
    testElement.style.cssText = 'position: absolute; visibility: hidden; font-size: 24px; font-family: xdiagrams-icons;';
    testElement.textContent = '\ue900';
    
    document.body.appendChild(testElement);
    const beforeSize = testElement.offsetWidth + testElement.offsetHeight;
    
    testElement.style.fontFamily = 'Arial, sans-serif';
    const afterSize = testElement.offsetWidth + testElement.offsetHeight;
    
    testElement.remove();
    
    return beforeSize !== afterSize;
  }

  // Obtener icono por defecto
  getDefaultIcon() {
    return this.config.defaultIcon || 'detail';
  }
}

export { XDiagramsIconManager }; 