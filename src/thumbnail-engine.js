/**
 * Thumbnail Engine para XDiagrams
 * Motor independiente para la gestión de thumbnails e imágenes
 * 
 * Funcionalidades:
 * - Resolución de imágenes de nodos
 * - Precarga de imágenes comunes
 * - Creación de elementos de imagen con manejo de errores
 * - Aplicación de filtros CSS
 * - Detección automática de logos
 * - Gestión de thumbnails en side panel
 */

// ============================================================================
// THUMBNAILS EMBEBIDOS - SISTEMA DE GESTIÓN INTERNA
// ============================================================================

/**
 * Biblioteca de thumbnails embebidos para evitar peticiones externas
 * Los thumbnails se almacenan como strings SVG y se convierten a data URIs
 * cuando se necesitan. Esto mejora el rendimiento y reduce las peticiones HTTP.
 */
const EMBEDDED_THUMBNAILS = {
  // Thumbnails básicos del sistema
  'detail': `<svg width="200" height="180" viewBox="0 0 200 180" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect x="20" y="84" width="160" height="82" fill="black" fill-opacity="0.1"/>
<rect x="20" y="23" width="160" height="43" fill="black" fill-opacity="0.1"/>
</svg>`,
  
  'document': `<svg width="200" height="180" viewBox="0 0 200 180" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M29 21H144L174 51V171H29V21Z" fill="black" fill-opacity="0.05"/>
<path d="M144 21L174 51L144 51L144 21Z" fill="black" fill-opacity="0.1"/>
<rect x="55" y="124" width="94" height="16" fill="black" fill-opacity="0.1"/>
<rect x="55" y="92" width="94" height="16" fill="black" fill-opacity="0.1"/>
<rect x="55" y="58" width="40" height="16" fill="black" fill-opacity="0.1"/>
</svg>`,
  
  'form': `<svg width="200" height="180" viewBox="0 0 200 180" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect x="20" y="20" width="160" height="140" fill="black" fill-opacity="0.05"/>
<rect x="40" y="40" width="120" height="8" fill="black" fill-opacity="0.1"/>
<rect x="40" y="60" width="80" height="8" fill="black" fill-opacity="0.1"/>
<rect x="40" y="80" width="100" height="8" fill="black" fill-opacity="0.1"/>
<rect x="40" y="100" width="60" height="8" fill="black" fill-opacity="0.1"/>
<rect x="40" y="120" width="90" height="8" fill="black" fill-opacity="0.1"/>
<rect x="40" y="140" width="70" height="8" fill="black" fill-opacity="0.1"/>
</svg>`,
  
  'list': `<svg width="200" height="180" viewBox="0 0 200 180" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect x="20" y="20" width="160" height="140" fill="black" fill-opacity="0.05"/>
<rect x="40" y="40" width="100" height="8" fill="black" fill-opacity="0.1"/>
<rect x="40" y="60" width="120" height="8" fill="black" fill-opacity="0.1"/>
<rect x="40" y="80" width="80" height="8" fill="black" fill-opacity="0.1"/>
<rect x="40" y="100" width="110" height="8" fill="black" fill-opacity="0.1"/>
<rect x="40" y="120" width="90" height="8" fill="black" fill-opacity="0.1"/>
<rect x="40" y="140" width="70" height="8" fill="black" fill-opacity="0.1"/>
</svg>`,
  
  'mosaic': `<svg width="200" height="180" viewBox="0 0 200 180" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect x="20" y="20" width="70" height="70" fill="black" fill-opacity="0.1"/>
<rect x="110" y="20" width="70" height="70" fill="black" fill-opacity="0.1"/>
<rect x="20" y="110" width="70" height="50" fill="black" fill-opacity="0.1"/>
<rect x="110" y="110" width="70" height="50" fill="black" fill-opacity="0.1"/>
</svg>`,
  
  'report': `<svg width="200" height="180" viewBox="0 0 200 180" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect x="20" y="20" width="160" height="140" fill="black" fill-opacity="0.05"/>
<rect x="40" y="40" width="120" height="8" fill="black" fill-opacity="0.1"/>
<rect x="40" y="60" width="100" height="8" fill="black" fill-opacity="0.1"/>
<rect x="40" y="80" width="80" height="8" fill="black" fill-opacity="0.1"/>
<rect x="40" y="100" width="110" height="8" fill="black" fill-opacity="0.1"/>
<rect x="40" y="120" width="90" height="8" fill="black" fill-opacity="0.1"/>
<rect x="40" y="140" width="70" height="8" fill="black" fill-opacity="0.1"/>
<rect x="160" y="40" width="8" height="8" fill="black" fill-opacity="0.2"/>
<rect x="160" y="60" width="8" height="8" fill="black" fill-opacity="0.2"/>
<rect x="160" y="80" width="8" height="8" fill="black" fill-opacity="0.2"/>
<rect x="160" y="100" width="8" height="8" fill="black" fill-opacity="0.2"/>
<rect x="160" y="120" width="8" height="8" fill="black" fill-opacity="0.2"/>
<rect x="160" y="140" width="8" height="8" fill="black" fill-opacity="0.2"/>
</svg>`,
  
  'settings': `<svg width="200" height="180" viewBox="0 0 200 180" fill="none" xmlns="http://www.w3.org/2000/svg">
<circle cx="100" cy="90" r="30" fill="black" fill-opacity="0.1"/>
<circle cx="100" cy="90" r="20" fill="black" fill-opacity="0.05"/>
<circle cx="100" cy="90" r="10" fill="black" fill-opacity="0.2"/>
<rect x="95" y="20" width="10" height="20" fill="black" fill-opacity="0.1"/>
<rect x="95" y="150" width="10" height="20" fill="black" fill-opacity="0.1"/>
<rect x="20" y="95" width="20" height="10" fill="black" fill-opacity="0.1"/>
<rect x="160" y="95" width="20" height="10" fill="black" fill-opacity="0.1"/>
<rect x="35" y="35" width="15" height="15" fill="black" fill-opacity="0.1"/>
<rect x="150" y="35" width="15" height="15" fill="black" fill-opacity="0.1"/>
<rect x="35" y="130" width="15" height="15" fill="black" fill-opacity="0.1"/>
<rect x="150" y="130" width="15" height="15" fill="black" fill-opacity="0.1"/>
</svg>`,
  
  'modal': `<svg width="200" height="180" viewBox="0 0 200 180" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect x="20" y="20" width="160" height="140" fill="black" fill-opacity="0.05"/>
<rect x="40" y="40" width="120" height="8" fill="black" fill-opacity="0.1"/>
<rect x="40" y="60" width="100" height="8" fill="black" fill-opacity="0.1"/>
<rect x="40" y="80" width="80" height="8" fill="black" fill-opacity="0.1"/>
<rect x="40" y="100" width="110" height="8" fill="black" fill-opacity="0.1"/>
<rect x="40" y="120" width="90" height="8" fill="black" fill-opacity="0.1"/>
<rect x="40" y="140" width="70" height="8" fill="black" fill-opacity="0.1"/>
<rect x="160" y="40" width="8" height="8" fill="black" fill-opacity="0.2"/>
<rect x="160" y="60" width="8" height="8" fill="black" fill-opacity="0.2"/>
<rect x="160" y="80" width="8" height="8" fill="black" fill-opacity="0.2"/>
<rect x="160" y="100" width="8" height="8" fill="black" fill-opacity="0.2"/>
<rect x="160" y="120" width="8" height="8" fill="black" fill-opacity="0.2"/>
<rect x="160" y="140" width="8" height="8" fill="black" fill-opacity="0.2"/>
</svg>`,
  
  // Thumbnails de archivos
  'file-csv': `<svg width="200" height="180" viewBox="0 0 200 180" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M29 21H144L174 51V171H29V21Z" fill="black" fill-opacity="0.05"/>
<path d="M144 21L174 51L144 51L144 21Z" fill="black" fill-opacity="0.1"/>
<rect x="55" y="124" width="94" height="16" fill="black" fill-opacity="0.1"/>
<rect x="55" y="92" width="94" height="16" fill="black" fill-opacity="0.1"/>
<rect x="55" y="58" width="40" height="16" fill="black" fill-opacity="0.1"/>
<text x="100" y="105" text-anchor="middle" font-family="monospace" font-size="12" fill="black" fill-opacity="0.3">CSV</text>
</svg>`,
  
  'file-pdf': `<svg width="200" height="180" viewBox="0 0 200 180" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M29 21H144L174 51V171H29V21Z" fill="black" fill-opacity="0.05"/>
<path d="M144 21L174 51L144 51L144 21Z" fill="black" fill-opacity="0.1"/>
<rect x="55" y="124" width="94" height="16" fill="black" fill-opacity="0.1"/>
<rect x="55" y="92" width="94" height="16" fill="black" fill-opacity="0.1"/>
<rect x="55" y="58" width="40" height="16" fill="black" fill-opacity="0.1"/>
<text x="100" y="105" text-anchor="middle" font-family="monospace" font-size="12" fill="black" fill-opacity="0.3">PDF</text>
</svg>`,
  
  'file-xls': `<svg width="200" height="180" viewBox="0 0 200 180" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M29 21H144L174 51V171H29V21Z" fill="black" fill-opacity="0.05"/>
<path d="M144 21L174 51L144 51L144 21Z" fill="black" fill-opacity="0.1"/>
<rect x="55" y="124" width="94" height="16" fill="black" fill-opacity="0.1"/>
<rect x="55" y="92" width="94" height="16" fill="black" fill-opacity="0.1"/>
<rect x="55" y="58" width="40" height="16" fill="black" fill-opacity="0.1"/>
<text x="100" y="105" text-anchor="middle" font-family="monospace" font-size="12" fill="black" fill-opacity="0.3">XLS</text>
</svg>`,
  
  'file-xml': `<svg width="200" height="180" viewBox="0 0 200 180" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M29 21H144L174 51V171H29V21Z" fill="black" fill-opacity="0.05"/>
<path d="M144 21L174 51L144 51L144 21Z" fill="black" fill-opacity="0.1"/>
<rect x="55" y="124" width="94" height="16" fill="black" fill-opacity="0.1"/>
<rect x="55" y="92" width="94" height="16" fill="black" fill-opacity="0.1"/>
<rect x="55" y="58" width="40" height="16" fill="black" fill-opacity="0.1"/>
<text x="100" y="105" text-anchor="middle" font-family="monospace" font-size="12" fill="black" fill-opacity="0.3">XML</text>
</svg>`,
  
  'file-html': `<svg width="200" height="180" viewBox="0 0 200 180" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M29 21H144L174 51V171H29V21Z" fill="black" fill-opacity="0.05"/>
<path d="M144 21L174 51L144 51L144 21Z" fill="black" fill-opacity="0.1"/>
<rect x="55" y="124" width="94" height="16" fill="black" fill-opacity="0.1"/>
<rect x="55" y="92" width="94" height="16" fill="black" fill-opacity="0.1"/>
<rect x="55" y="58" width="40" height="16" fill="black" fill-opacity="0.1"/>
<text x="100" y="105" text-anchor="middle" font-family="monospace" font-size="12" fill="black" fill-opacity="0.3">HTML</text>
</svg>`,
  
  'file-js': `<svg width="200" height="180" viewBox="0 0 200 180" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M29 21H144L174 51V171H29V21Z" fill="black" fill-opacity="0.05"/>
<path d="M144 21L174 51L144 51L144 21Z" fill="black" fill-opacity="0.1"/>
<rect x="55" y="124" width="94" height="16" fill="black" fill-opacity="0.1"/>
<rect x="55" y="92" width="94" height="16" fill="black" fill-opacity="0.1"/>
<rect x="55" y="58" width="40" height="16" fill="black" fill-opacity="0.1"/>
<text x="100" y="105" text-anchor="middle" font-family="monospace" font-size="12" fill="black" fill-opacity="0.3">JS</text>
</svg>`,
  
  'file-css': `<svg width="200" height="180" viewBox="0 0 200 180" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M29 21H144L174 51V171H29V21Z" fill="black" fill-opacity="0.05"/>
<path d="M144 21L174 51L144 51L144 21Z" fill="black" fill-opacity="0.1"/>
<rect x="55" y="124" width="94" height="16" fill="black" fill-opacity="0.1"/>
<rect x="55" y="92" width="94" height="16" fill="black" fill-opacity="0.1"/>
<rect x="55" y="58" width="40" height="16" fill="black" fill-opacity="0.1"/>
<text x="100" y="105" text-anchor="middle" font-family="monospace" font-size="12" fill="black" fill-opacity="0.3">CSS</text>
</svg>`,
  
  'file-txt': `<svg width="200" height="180" viewBox="0 0 200 180" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M29 21H144L174 51V171H29V21Z" fill="black" fill-opacity="0.05"/>
<path d="M144 21L174 51L144 51L144 21Z" fill="black" fill-opacity="0.1"/>
<rect x="55" y="124" width="94" height="16" fill="black" fill-opacity="0.1"/>
<rect x="55" y="92" width="94" height="16" fill="black" fill-opacity="0.1"/>
<rect x="55" y="58" width="40" height="16" fill="black" fill-opacity="0.1"/>
<text x="100" y="105" text-anchor="middle" font-family="monospace" font-size="12" fill="black" fill-opacity="0.3">TXT</text>
</svg>`,
  
  'file-docx': `<svg width="200" height="180" viewBox="0 0 200 180" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M29 21H144L174 51V171H29V21Z" fill="black" fill-opacity="0.05"/>
<path d="M144 21L174 51L144 51L144 21Z" fill="black" fill-opacity="0.1"/>
<rect x="55" y="124" width="94" height="16" fill="black" fill-opacity="0.1"/>
<rect x="55" y="92" width="94" height="16" fill="black" fill-opacity="0.1"/>
<rect x="55" y="58" width="40" height="16" fill="black" fill-opacity="0.1"/>
<text x="100" y="105" text-anchor="middle" font-family="monospace" font-size="12" fill="black" fill-opacity="0.3">DOCX</text>
</svg>`,
  
  // Thumbnails especiales
  'home': `<svg width="200" height="180" viewBox="0 0 200 180" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M20 90L100 20L180 90V160H140V120H60V160H20V90Z" fill="black" fill-opacity="0.1"/>
<rect x="80" y="100" width="40" height="60" fill="black" fill-opacity="0.05"/>
<rect x="90" y="110" width="20" height="20" fill="black" fill-opacity="0.1"/>
</svg>`,
  
  'profile': `<svg width="200" height="180" viewBox="0 0 200 180" fill="none" xmlns="http://www.w3.org/2000/svg">
<circle cx="100" cy="70" r="25" fill="black" fill-opacity="0.1"/>
<path d="M40 140C40 120 60 100 100 100C140 100 160 120 160 140V160H40V140Z" fill="black" fill-opacity="0.1"/>
</svg>`,
  
  'logo': `<svg width="200" height="180" viewBox="0 0 200 180" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect x="20" y="20" width="160" height="140" fill="black" fill-opacity="0.05"/>
<circle cx="100" cy="90" r="40" fill="black" fill-opacity="0.1"/>
<text x="100" y="100" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="black" fill-opacity="0.3">LOGO</text>
</svg>`
};

/**
 * Convierte un SVG string a data URI
 * @param {string} svgString - String SVG a convertir
 * @returns {string} Data URI del SVG
 */
function svgToDataUri(svgString) {
  const encoded = encodeURIComponent(svgString);
  return `data:image/svg+xml;charset=utf-8,${encoded}`;
}

/**
 * Obtiene un thumbnail embebido por nombre
 * @param {string} thumbnailName - Nombre del thumbnail (sin extensión)
 * @returns {string|null} Data URI del thumbnail o null si no existe
 */
function getEmbeddedThumbnail(thumbnailName) {
  const normalizedName = thumbnailName.toLowerCase().replace(/\s+/g, '-');
  const svgString = EMBEDDED_THUMBNAILS[normalizedName];
  
  if (svgString) {
    return svgToDataUri(svgString);
  }
  
  return null;
}

/**
 * Verifica si un thumbnail está disponible como embebido
 * @param {string} thumbnailName - Nombre del thumbnail
 * @returns {boolean} True si está disponible como embebido
 */
function isEmbeddedThumbnailAvailable(thumbnailName) {
  const normalizedName = thumbnailName.toLowerCase().replace(/\s+/g, '-');
  return EMBEDDED_THUMBNAILS.hasOwnProperty(normalizedName);
}

/**
 * Obtiene la lista de thumbnails embebidos disponibles
 * @returns {Array} Lista de nombres de thumbnails embebidos
 */
function getAvailableEmbeddedThumbnails() {
  return Object.keys(EMBEDDED_THUMBNAILS);
}

// ============================================================================
// CONFIGURACIÓN DE COLUMNAS DE IMAGEN
// ============================================================================

/**
 * Obtiene la configuración de columnas de imagen con fallbacks
 * @param {Object} diagramConfig - Configuración específica del diagrama
 * @returns {Array} Lista de nombres de columnas para imágenes
 */
function getImageColumnNames(diagramConfig = null) {
  // Esta función requiere getXDiagramsConfiguration que está en xdiagrams.js
  // Por ahora retornamos la configuración por defecto
  // Se puede mejorar cuando se refactorice la configuración
  return ['img', 'Img', 'IMG', 'thumbnail', 'Thumbnail', 'THUMBNAIL', 'icon', 'Icon', 'ICON', 'image', 'Image', 'IMAGE', 'picture', 'Picture', 'PICTURE'];
}

// ============================================================================
// RESOLUCIÓN DE IMÁGENES DE NODOS
// ============================================================================

/**
 * Resuelve la URL de imagen para un nodo
 * Prioriza thumbnails embebidos, luego la columna 'img' sobre 'type'
 * @param {Object} node - Objeto del nodo
 * @returns {string} URL de la imagen (puede ser data URI para thumbnails embebidos)
 */
function resolveNodeImage(node) {
  // Obtener valor de la columna img directamente del nodo
  const imgVal = node.img || (node.data && node.data.img) || "";
  const typeVal = node.type || (node.data && node.data.type) || "";

  // SIEMPRE usar img si tiene valor (prioridad absoluta)
  if (imgVal && imgVal.trim() !== "") {
    // Si es una URL absoluta, data URI o ruta con barra, úsala directamente
    if (/^(https?:\/\/|data:|\/)/i.test(imgVal) || imgVal.includes('/')) {
      return imgVal;
    }
    
    // Verificar si existe como thumbnail embebido
    const embeddedThumbnail = getEmbeddedThumbnail(imgVal);
    if (embeddedThumbnail) {
      console.log(`[resolveNodeImage] imgVal: "${imgVal}" -> thumbnail embebido encontrado`);
      return embeddedThumbnail;
    }
    
    // Si no es embebido, usar ruta de archivo
    let fileName = imgVal.toLowerCase().replace(/\s+/g, '-');
    
    // Verificar si ya tiene una extensión de imagen válida
    const hasImageExtension = fileName.match(/\.(svg|png|jpg|jpeg|gif|webp|bmp|ico)$/i);
    
    if (!hasImageExtension) {
      // Solo agregar .svg si no tiene extensión de imagen
      fileName += '.svg';
    }
    
    console.log(`[resolveNodeImage] imgVal: "${imgVal}" -> fileName: "${fileName}" -> URL: "img/${fileName}"`);
    return `img/${fileName}`;
  }

  // SOLO si img está completamente vacío, usar type como fallback
  const typeName = (typeVal || 'detail').toLowerCase().replace(/\s+/g, '-');
  
  // Verificar si el type existe como thumbnail embebido
  const embeddedThumbnail = getEmbeddedThumbnail(typeName);
  if (embeddedThumbnail) {
    console.log(`[resolveNodeImage] type: "${typeName}" -> thumbnail embebido encontrado`);
    return embeddedThumbnail;
  }
  
  return `img/${typeName}.svg`;
}

/**
 * Resuelve la URL de imagen con fallback inteligente
 * Prioriza thumbnails embebidos, luego verifica archivos externos
 * @param {Object} node - Objeto del nodo
 * @param {Function} onImgFallback - Callback cuando se usa fallback de img
 * @returns {Promise<string>} Promise que resuelve a la URL de la imagen
 */
function resolveNodeImageWithFallback(node, onImgFallback = null) {
  const imgVal = node.img || (node.data && node.data.img) || "";
  const typeVal = node.type || (node.data && node.data.type) || "";

  // Si img tiene valor, intentar usarlo primero
  if (imgVal && imgVal.trim() !== "") {
    // Si es una URL absoluta, data URI o ruta con barra, úsala directamente
    if (/^(https?:\/\/|data:|\/)/i.test(imgVal) || imgVal.includes('/')) {
      return Promise.resolve(imgVal);
    }
    
    // Verificar si existe como thumbnail embebido
    const embeddedThumbnail = getEmbeddedThumbnail(imgVal);
    if (embeddedThumbnail) {
      console.log(`[resolveNodeImageWithFallback] imgVal: "${imgVal}" -> thumbnail embebido encontrado`);
      return Promise.resolve(embeddedThumbnail);
    }
    
    // Si no es embebido, verificar archivo externo
    let fileName = imgVal.toLowerCase().replace(/\s+/g, '-');
    
    // Verificar si ya tiene una extensión de imagen válida
    const hasImageExtension = fileName.match(/\.(svg|png|jpg|jpeg|gif|webp|bmp|ico)$/i);
    
    if (!hasImageExtension) {
      // Solo agregar .svg si no tiene extensión de imagen
      fileName += '.svg';
    }
    
    const imgUrl = `img/${fileName}`;
    console.log(`[resolveNodeImageWithFallback] imgVal: "${imgVal}" -> fileName: "${fileName}" -> URL: "img/${fileName}"`);
    
    // Verificar si la imagen existe antes de retornarla
    return new Promise((resolve) => {
      const testImg = new Image();
      testImg.onload = function() {
        // La imagen existe, usarla
        resolve(imgUrl);
      };
      testImg.onerror = function() {
        // La imagen no existe, usar type como fallback
        console.log(`[Img Fallback] Imagen '${imgVal}' no encontrada, usando type como fallback`);
        if (onImgFallback) {
          onImgFallback(imgVal, typeVal);
        }
        
        // Verificar si el type existe como thumbnail embebido
        const typeName = (typeVal || 'detail').toLowerCase().replace(/\s+/g, '-');
        const embeddedTypeThumbnail = getEmbeddedThumbnail(typeName);
        if (embeddedTypeThumbnail) {
          console.log(`[Img Fallback] Type "${typeName}" -> thumbnail embebido encontrado`);
          resolve(embeddedTypeThumbnail);
        } else {
          resolve(`img/${typeName}.svg`);
        }
      };
      testImg.src = imgUrl;
    });
  }

  // Si img está vacío, usar type directamente
  const typeName = (typeVal || 'detail').toLowerCase().replace(/\s+/g, '-');
  
  // Verificar si el type existe como thumbnail embebido
  const embeddedThumbnail = getEmbeddedThumbnail(typeName);
  if (embeddedThumbnail) {
    console.log(`[resolveNodeImageWithFallback] type: "${typeName}" -> thumbnail embebido encontrado`);
    return Promise.resolve(embeddedThumbnail);
  }
  
  return Promise.resolve(`img/${typeName}.svg`);
}

/**
 * Determina si se debe aplicar filtro CSS a una imagen
 * @param {string} url - URL de la imagen
 * @returns {boolean} True si se debe aplicar filtro
 */
function shouldApplyFilter(url) {
  // Si es una URL de datos (data URI), no aplicar filtro
  if (url.startsWith('data:')) return false;
  
  // Si es una URL externa (http/https), no aplicar filtro
  if (url.match(/^https?:\/\//i)) return false;
  
  // Extraer el nombre del archivo sin parámetros
  const baseUrl = url.split('?')[0].toLowerCase();
  
  // NO aplicar filtro a imágenes locales (PNG, JPG, etc.) que vienen de la columna Img
  // Solo aplicar filtro a imágenes SVG del sistema (iconos, thumbnails, etc.)
  const isLocalImage = baseUrl.includes('img/') && (
    baseUrl.endsWith('.png') || 
    baseUrl.endsWith('.jpg') || 
    baseUrl.endsWith('.jpeg') || 
    baseUrl.endsWith('.gif') || 
    baseUrl.endsWith('.webp')
  );
  
  // Si es una imagen local (no SVG), no aplicar filtro
  if (isLocalImage) return false;
  
  // Solo aplicar filtro a imágenes SVG del sistema para consistencia visual
  return baseUrl.endsWith('.svg');
}

// ============================================================================
// CREACIÓN Y GESTIÓN DE ELEMENTOS DE IMAGEN
// ============================================================================

/**
 * Crea un elemento de imagen con manejo mejorado de errores
 * @param {string} baseUrl - URL principal de la imagen
 * @param {string} fallbackUrl - URL de respaldo si falla la principal
 * @param {string} className - Clase CSS para el elemento
 * @param {Object} node - Objeto del nodo para obtener type como fallback
 * @returns {HTMLImageElement} Elemento de imagen creado
 */
function createImageElement(baseUrl, fallbackUrl, className = "image-base", node = null) {
  const img = new Image();
  // Agregar cache buster para URLs externas y imágenes locales PNG/JPG que pueden tener problemas de caché
  let finalUrl = baseUrl;
  const baseUrlLower = baseUrl.toLowerCase();
  const isExternalUrl = baseUrl.startsWith('http') || baseUrl.startsWith('//');
  const isLocalImage = baseUrlLower.includes('img/') && (baseUrlLower.endsWith('.png') || baseUrlLower.endsWith('.jpg') || baseUrlLower.endsWith('.jpeg'));
  
  if (isExternalUrl || isLocalImage) {
    const cacheBuster = `?t=${Date.now()}`;
    finalUrl = baseUrl.includes('?') ? `${baseUrl}&_cb=${Date.now()}` : `${baseUrl}${cacheBuster}`;
    if (isLocalImage) {
      console.log(`[Cache Buster] Aplicado a imagen local: ${baseUrl} -> ${finalUrl}`);
    }
  }
  
  // Aplicar fade-in a TODAS las imágenes durante la carga
  console.log(`[Fade In] Configurando fade-in para imagen HTML: ${baseUrl}`);
  img.style.opacity = '0';
  img.style.transition = 'opacity 0.8s ease-in-out';
  
  img.onload = function() {
    // Image loaded successfully
    this.classList.add('loaded');
    
    // Completar fade-in para TODAS las imágenes
    // Fade-in después de un pequeño delay
    setTimeout(() => {
      this.style.opacity = '1';
      console.log(`[Fade In] ✅ Fade-in completado para imagen HTML: ${baseUrl}`);
    }, 200);
    
    // Solo aplicar el filtro si es necesario
    if (shouldApplyFilter(baseUrl)) {
      this.classList.add('image-filter');
    }
  };
  
  img.onerror = function() {
    // Si tenemos un nodo y la imagen que falló es de la columna Img, usar Type como fallback
    if (node && baseUrl.includes('img/')) {
      const typeVal = node.type || (node.data && node.data.type) || "";
      if (typeVal && typeVal.trim() !== "") {
        const typeName = typeVal.toLowerCase().replace(/\s+/g, '-');
        const typeUrl = `img/${typeName}.svg`;
        console.log(`[Img Fallback] Imagen '${baseUrl}' falló, usando type '${typeVal}' como fallback`);
        this.src = typeUrl;
        if (shouldApplyFilter(typeUrl)) {
          this.classList.add('image-filter');
          console.log(`[Img Fallback] Filtro aplicado a imagen de fallback: ${typeUrl}`);
        } else {
          this.classList.remove('image-filter');
          console.log(`[Img Fallback] Filtro removido de imagen de fallback: ${typeUrl}`);
        }
        return;
      }
    }
    
    // Try fallback tradicional
    if (fallbackUrl && this.src !== fallbackUrl) {
      this.src = fallbackUrl;
      // Verificar si el fallback necesita filtro
      if (shouldApplyFilter(fallbackUrl)) {
        this.classList.add('image-filter');
      } else {
        this.classList.remove('image-filter');
      }
    } else {
      // If fallback also fails, hide the image
      this.style.display = 'none';
    }
  };
  
  img.src = finalUrl;
  img.className = className;
  
  return img;
}

/**
 * Maneja la carga de imágenes SVG de forma robusta con efecto fade-in
 * @param {SVGElement} svgElement - Elemento SVG <image> 
 * @param {string} imageUrl - URL de la imagen
 * @param {string} context - Contexto para logging (opcional)
 */
function handleSVGImageLoad(svgElement, imageUrl, context = '') {
  if (!svgElement || !imageUrl) {
    console.warn('[SVG Image Load] Elemento o URL inválidos');
    return;
  }
  
  const contextLabel = context ? `(${context})` : '';
  console.log(`[SVG Image Load] Configurando imagen SVG ${contextLabel}: ${imageUrl}`);
  
  // Aplicar fade-in a TODAS las imágenes durante la carga
  console.log(`[Fade In] Configurando fade-in para imagen ${contextLabel}: ${imageUrl}`);
  // Inicialmente transparente
  svgElement.style.opacity = '0';
  svgElement.style.transition = 'opacity 0.8s ease-in-out';
  
  // Función para agregar clase loaded y completar fade-in
  const addLoadedClass = () => {
    const currentClasses = svgElement.getAttribute('class') || '';
    if (!currentClasses.includes('loaded')) {
      const newClasses = currentClasses + ' loaded';
      svgElement.setAttribute('class', newClasses);
      console.log(`[SVG Image Load] ✅ Clase 'loaded' agregada ${contextLabel}: ${imageUrl}`);
      
      // Completar fade-in para TODAS las imágenes
      // Fade-in después de un pequeño delay
      setTimeout(() => {
        svgElement.style.opacity = '1';
        console.log(`[Fade In] ✅ Fade-in completado para imagen ${contextLabel}: ${imageUrl}`);
      }, 200);
    }
  };
  
  // Verificar si la imagen ya está en caché del navegador
  const testImg = new Image();
  testImg.onload = function() {
    // La imagen se cargó exitosamente, agregar clase loaded
    addLoadedClass();
  };
  testImg.onerror = function() {
    console.warn(`[SVG Image Load] Error al cargar imagen ${contextLabel}: ${imageUrl}`);
  };
  testImg.src = imageUrl;
  
  // También agregar un timeout como respaldo para imágenes que ya están en caché
  setTimeout(() => {
    addLoadedClass();
  }, 100);
}

/**
 * Crea HTML de thumbnail para el side panel
 * @param {string} nodeType - Tipo de nodo para determinar el thumbnail
 * @returns {string} HTML del thumbnail
 */
function createSidePanelThumbnailHtml(nodeType) {
  const normalizedType = nodeType.toLowerCase().replace(/\s+/g, '-');
  return `<img src="img/${normalizedType}.svg" alt="${normalizedType}" class="side-panel-title-thumbnail" style="opacity: 0; transition: opacity 0.2s ease-in-out;" onload="this.style.opacity='1'" onerror="this.src='img/detail.svg'; this.style.opacity='1'; this.onerror=function(){this.style.display='none'; this.nextElementSibling.style.display='inline-block';}"><div class="side-panel-title-thumbnail-placeholder" style="width: 24px; height: 24px; background-color: #e0e0e0; border: 1px solid #ccc; border-radius: 4px; display: none; margin-right: 8px;"></div>`;
}

// ============================================================================
// PRECARGA DE IMÁGENES
// ============================================================================

/**
 * Lista de imágenes comunes que se precargan
 * @type {Array<string>}
 */
const COMMON_IMAGES = [
  'detail', 'document', 'settings', 'form', 'list', 'modal', 
  'mosaic', 'report', 'file-csv', 'file-pdf', 'file-xls', 'file-xml',
  'home', 'transparent'
];

/**
 * Precarga imágenes comunes para evitar el flash por defecto de Chrome
 */
function preloadCommonImages() {
  const commonImages = COMMON_IMAGES.map(name => name.toLowerCase().replace(/\s+/g, '-'));
  
  let loadedCount = 0;
  const totalImages = commonImages.length;
  
  commonImages.forEach(imageName => {
    const img = new Image();
    img.onload = function() {
      loadedCount++;
      if (loadedCount === totalImages) {
        console.log('🖼️ [Preload] All common images preloaded successfully');
      }
    };
    img.onerror = function() {
      console.warn(`[Preload] Failed to load image: ${imageName}.svg`);
      loadedCount++;
      if (loadedCount === totalImages) {
        console.log('🖼️ [Preload] Common images preload completed with some errors');
      }
    };
    img.src = `img/${imageName}.svg`;
  });
}

// ============================================================================
// FILTROS DE IMAGEN
// ============================================================================

/**
 * Aplica filtros CSS a las imágenes
 * @param {string} filterValue - Valor del filtro CSS
 */
function updateImageFilters(filterValue) {
  console.log('[Image Filter] Aplicando filtro:', filterValue);
  
  // Verificar que el filtro no esté vacío
  if (!filterValue || filterValue.trim() === '') {
    console.warn('[Image Filter] Filtro vacío, no se aplicará');
    return;
  }
  
  // En lugar de aplicar estilos inline, usar variables CSS
  // Esto permite que el filtro se actualice automáticamente cuando cambie el tema
  const imagesWithFilter = document.querySelectorAll('.image-filter');
  console.log('[Image Filter] Encontradas', imagesWithFilter.length, 'imágenes con clase image-filter');
  
  // Remover cualquier estilo inline previo
  imagesWithFilter.forEach((img, index) => {
    img.style.removeProperty('filter');
    // Manejar tanto elementos HTML <img> como SVG <image>
    const imgName = img.src ? img.src.split('/').pop() : 
                   (img.href ? img.href.baseVal.split('/').pop() : 'unknown');
    console.log(`[Image Filter] Estilo inline removido de imagen ${index + 1} (${imgName})`);
  });
  
  // También remover estilos inline del side panel
  const sidePanelImages = document.querySelectorAll('.side-panel-title-thumbnail');
  sidePanelImages.forEach((img, index) => {
    if (img && img.style) {
      img.style.removeProperty('filter');
      console.log(`[Image Filter] Estilo inline removido de side panel imagen ${index + 1}`);
    }
  });
  
  // Agregar regla CSS que use la variable --image-filter
  const styleId = 'image-filter-css-rule';
  let existingStyle = document.getElementById(styleId);
  if (existingStyle) {
    existingStyle.remove();
  }
  
  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    .image-filter {
      filter: var(--image-filter) !important;
    }
    .side-panel-title-thumbnail {
      filter: var(--image-filter) !important;
    }
  `;
  document.head.appendChild(style);
  
  console.log('[Image Filter] Regla CSS agregada usando variable --image-filter');
  console.log('[Image Filter] Valor actual de --image-filter:', filterValue);
}

// ============================================================================
// DETECCIÓN AUTOMÁTICA DE LOGOS
// ============================================================================

/**
 * Detecta automáticamente archivos de logo en la carpeta img
 */
function detectAutoLogo() {
  const logoExtensions = ['svg', 'png', 'jpg', 'jpeg'];
  const imgPath = 'img/';
  
  // Check if any logo file exists by trying to load them
  for (const ext of logoExtensions) {
    const logoUrl = `${imgPath}logo.${ext}`;
    
    // Create a test image to check if file exists
    const testImg = new Image();
    testImg.onload = function() {
      // If image loads successfully, set it as auto logo
      if (!window.$xDiagrams.logo) {
        window.$xDiagrams.logo = logoUrl;
        console.log('[Auto Logo] Logo detectado automáticamente:', logoUrl);
        
        // Update the topbar if it already exists
        if (window.$xDiagrams.updateTopbarTitle) {
          window.$xDiagrams.updateTopbarTitle(window.$xDiagrams.currentDiagramIdx || 0);
        }
      }
    };
    testImg.onerror = function() {
      // File doesn't exist, continue to next extension
    };
    testImg.src = logoUrl;
  }
}

// ============================================================================
// UTILIDADES PARA THUMBNAILS
// ============================================================================

/**
 * Obtiene la lista de thumbnails disponibles
 * @returns {Array<string>} Lista de nombres de thumbnails
 */
function getAvailableThumbnails() {
  return [
    'document', 'settings', 'form', 'list', 'modal', 'mosaic', 
    'report', 'detail', 'file-csv', 'file-pdf', 'file-xls', 'file-xml'
  ];
}

/**
 * Normaliza el nombre de un thumbnail
 * @param {string} thumbnailName - Nombre del thumbnail
 * @returns {string} Nombre normalizado
 */
function normalizeThumbnailName(thumbnailName) {
  return thumbnailName.toLowerCase().replace(/\s+/g, '-');
}

/**
 * Verifica si un thumbnail existe
 * @param {string} thumbnailName - Nombre del thumbnail
 * @returns {Promise<boolean>} True si el thumbnail existe
 */
function checkThumbnailExists(thumbnailName) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = `img/${normalizeThumbnailName(thumbnailName)}.svg`;
  });
}

// ============================================================================
// EXPORTACIÓN DE FUNCIONES
// ============================================================================

// Exportar funciones para uso global
window.ThumbnailEngine = {
  // Configuración
  getImageColumnNames,
  
  // Resolución de imágenes
  resolveNodeImage,
  resolveNodeImageWithFallback,
  shouldApplyFilter,
  
  // Creación de elementos
  createImageElement,
  createSidePanelThumbnailHtml,
  
  // Manejo de carga SVG
  handleSVGImageLoad,
  
  // Precarga
  preloadCommonImages,
  COMMON_IMAGES,
  
  // Filtros
  updateImageFilters,
  
  // Detección de logos
  detectAutoLogo,
  
  // Utilidades
  getAvailableThumbnails,
  normalizeThumbnailName,
  checkThumbnailExists,

  // Thumbnails Embebidos
  getEmbeddedThumbnail,
  isEmbeddedThumbnailAvailable,
  getAvailableEmbeddedThumbnails
};

// También exportar funciones individuales para compatibilidad
window.resolveNodeImage = resolveNodeImage;
window.resolveNodeImageWithFallback = resolveNodeImageWithFallback;
window.createImageElement = createImageElement;
window.handleSVGImageLoad = handleSVGImageLoad;
window.preloadCommonImages = preloadCommonImages;
window.updateImageFilters = updateImageFilters;
window.detectAutoLogo = detectAutoLogo;

console.log('[ThumbnailEngine] Motor de thumbnails cargado correctamente'); 