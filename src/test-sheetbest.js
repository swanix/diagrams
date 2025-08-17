/**
 * Módulo de prueba para SheetBest con XDiagrams
 */

import { XDiagrams } from './js/xdiagrams.js';
import { apiKeysConfig } from './js/modules/loader/config/api-keys.js';

let xdiagrams;

// Inicializar XDiagrams cuando se cargue la página
document.addEventListener('DOMContentLoaded', function() {
    xdiagrams = new XDiagrams('#diagram');
    console.log('XDiagrams inicializado');
    
    // Verificar que el loader esté disponible
    if (xdiagrams && xdiagrams.loader) {
        console.log('✅ Loader disponible');
    } else {
        console.warn('⚠️ Loader no disponible');
    }
});

// Funciones globales para el HTML
window.showResult = function(message, type = 'info') {
    const element = document.getElementById('result');
    element.textContent = message;
    element.className = `result ${type}`;
    element.style.display = 'block';
};

window.configureAndTest = function() {
    const apiKey = document.getElementById('apiKey').value.trim();
    const sheetUrl = document.getElementById('sheetUrl').value.trim();
    
    if (!apiKey) {
        window.showResult('❌ Por favor ingresa una API Key', 'error');
        return;
    }
    
    if (!sheetUrl) {
        window.showResult('❌ Por favor ingresa una URL de SheetBest', 'error');
        return;
    }

    // Configurar API Key
    if (!window.__XDIAGRAMS_CONFIG__) {
        window.__XDIAGRAMS_CONFIG__ = {};
    }
    if (!window.__XDIAGRAMS_CONFIG__.API_KEYS) {
        window.__XDIAGRAMS_CONFIG__.API_KEYS = {};
    }

    window.__XDIAGRAMS_CONFIG__.API_KEYS['sheet.best'] = apiKey;
    window.__XDIAGRAMS_CONFIG__.API_KEYS['sheetbest.com'] = apiKey;
    window.__XDIAGRAMS_CONFIG__.API_KEYS['SHEETBEST_API_KEY'] = apiKey;

    // Agregar API Key directamente al sistema de autenticación
    try {
        // Agregar API Key directamente a la configuración global
        apiKeysConfig.addTemporaryApiKey('sheet.best', apiKey);
        apiKeysConfig.addTemporaryApiKey('sheetbest.com', apiKey);
        apiKeysConfig.addTemporaryApiKey('api.sheetbest.com', apiKey);
        
        console.log('✅ API Key agregada directamente al sistema');
        console.log('Patrones configurados:', apiKeysConfig.getConfiguredPatterns());
    } catch (error) {
        console.warn('⚠️ Error al agregar API Key:', error);
    }

    window.showResult('✅ API Key configurada. Probando carga de datos...', 'info');

    // Verificar que XDiagrams esté inicializado
    if (!xdiagrams) {
        window.showResult(
            `❌ Error: XDiagrams no está inicializado\n\n` +
            `Espera a que la página termine de cargar e intenta de nuevo.`, 
            'error'
        );
        return;
    }

    // Verificar que el loader esté disponible
    if (!xdiagrams.loader) {
        window.showResult(
            `❌ Error: Loader no disponible\n\n` +
            `El sistema de carga de datos no está inicializado correctamente.`, 
            'error'
        );
        return;
    }

    // Probar carga de datos usando el loader
    xdiagrams.loader.loadData(sheetUrl, (data, error) => {
        if (error) {
            window.showResult(
                `❌ Error cargando datos:\n\n${error.message}\n\n` +
                `Detalles:\n` +
                `- Tipo de error: ${error.constructor.name}\n` +
                `- Es error de autenticación: ${error.isAuthError ? 'Sí' : 'No'}\n` +
                `- Status HTTP: ${error.status || 'N/A'}\n` +
                `- URL: ${sheetUrl}`, 
                'error'
            );
        } else {
            window.showResult(
                `✅ ¡Datos cargados exitosamente!\n\n` +
                `📊 Cantidad de registros: ${data.length}\n` +
                `🔗 URL: ${sheetUrl}\n\n` +
                `📋 Primeros 3 registros:\n` +
                JSON.stringify(data.slice(0, 3), null, 2) + '\n\n' +
                `📋 Estructura de datos:\n` +
                `Columnas: ${Object.keys(data[0] || {}).join(', ')}`, 
                'success'
            );
        }
    });
};

window.clearResults = function() {
    document.getElementById('result').style.display = 'none';
};
