/**
 * PapaParse Configuration Module - Compatible con GitHub Pages
 * Usa dependencias globales cuando están disponibles, módulos ES6 como fallback
 */

import Papa from 'papaparse';

let PapaInstance;

// Verificar si PapaParse está disponible globalmente (CDN)
if (typeof window !== 'undefined' && window.Papa) {
  // Usar PapaParse desde CDN (GitHub Pages)
  PapaInstance = window.Papa;
} else {
  // Usar módulos ES6 (desarrollo local)
  try {
    PapaInstance = Papa;
  } catch (error) {
    console.error('❌ Error cargando PapaParse:', error);
    throw new Error('PapaParse no está disponible ni globalmente ni como módulo ES6');
  }
}

// Hacer PapaParse disponible globalmente para compatibilidad
if (typeof window !== 'undefined') {
  window.Papa = PapaInstance;
}

export { PapaInstance as Papa };
export default PapaInstance;
