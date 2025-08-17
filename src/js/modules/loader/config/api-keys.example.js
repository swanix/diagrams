/**
 * XDiagrams API Keys Configuration Example
 * 
 * INSTRUCCIONES:
 * 1. Copia este archivo a api-keys.js
 * 2. Reemplaza los valores con tus API Keys reales
 * 3. NUNCA subas api-keys.js al repositorio
 * 
 * ALTERNATIVA: Configura las variables de entorno en tu servidor
 */

// Ejemplo de configuración de API Keys
// window.__XDIAGRAMS_CONFIG__ = {
//   API_KEYS: {
//     // SheetBest API Key
//     'sheet.best': 'tu_sheetbest_api_key_aqui',
//     'sheetbest.com': 'tu_sheetbest_api_key_aqui',
//     
//     // Otras APIs
//     'api.example.com': 'tu_otra_api_key_aqui',
//     
//     // Configuración por URL específica
//     'https://sheet.best/api/sheets/tu-sheet-id': 'api_key_especifica_aqui'
//   }
// };

/**
 * Configuración por Variables de Entorno (Recomendado)
 * 
 * En tu servidor o entorno de desarrollo, configura:
 * 
 * SHEETBEST_API_KEY=tu_api_key_real_aqui
 * EXAMPLE_API_KEY=tu_otra_api_key_aqui
 * 
 * El sistema automáticamente detectará estas variables.
 */

/**
 * Para desarrollo local, puedes crear un archivo .env:
 * 
 * # .env (no subir al repositorio)
 * SHEETBEST_API_KEY=tu_api_key_real_aqui
 * EXAMPLE_API_KEY=tu_otra_api_key_aqui
 * 
 * Y configurar tu servidor para cargar estas variables.
 */

export default {
  // Este archivo es solo para documentación
  // No contiene API Keys reales
};
