/**
 * D3 Configuration Module - Compatible con GitHub Pages
 * Usa dependencias globales cuando están disponibles, módulos ES6 como fallback
 */

import { select, selectAll } from 'd3-selection';
import { zoom, zoomIdentity, zoomTransform } from 'd3-zoom';
import { hierarchy, tree } from 'd3-hierarchy';
import { easeCubicOut } from 'd3-ease';

let d3;

// Verificar si D3 está disponible globalmente (CDN)
if (typeof window !== 'undefined' && window.d3) {
  // Usar D3 desde CDN (GitHub Pages)
  d3 = window.d3;
} else {
  // Usar módulos ES6 (desarrollo local)
  try {
    // Crear objeto D3 con solo las funciones necesarias
    d3 = {
      select,
      selectAll,
      zoom,
      zoomIdentity,
      zoomTransform,
      hierarchy,
      tree,
      easeCubicOut
    };
  } catch (error) {
    console.error('❌ Error cargando D3:', error);
    throw new Error('D3 no está disponible ni globalmente ni como módulo ES6');
  }
}

// Hacer D3 disponible globalmente para compatibilidad
if (typeof window !== 'undefined') {
  window.d3 = d3;
}

export { d3 };
export default d3;
