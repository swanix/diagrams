/**
 * Servidor de desarrollo simple para simular Netlify Functions
 * Ejecutar con: node dev-server.js
 */

const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

// Configuración
const PORT = 8888;
const API_KEY = process.env.SHEETBEST_API_KEY || 'tu-api-key-de-prueba';

// Función para simular la Netlify Function
async function handleProtectedDataRequest(requestBody) {
  try {
    const { url: targetUrl, options = {} } = requestBody;

    if (!targetUrl) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'URL requerida en el cuerpo de la petición' })
      };
    }

    console.log(`🔐 Procesando petición para URL: ${targetUrl}`);

    // Simular petición a la API protegida
    const apiHeaders = {
      'X-Api-Key': API_KEY,
      'Content-Type': 'application/json'
    };

    // Para pruebas, devolver datos simulados
    const mockData = [
      {
        id: 1,
        name: 'Empresa A',
        sector: 'Tecnología',
        employees: 150,
        revenue: '10M'
      },
      {
        id: 2,
        name: 'Empresa B',
        sector: 'Finanzas',
        employees: 300,
        revenue: '25M'
      },
      {
        id: 3,
        name: 'Empresa C',
        sector: 'Salud',
        employees: 75,
        revenue: '5M'
      }
    ];

    console.log(`✅ Datos simulados devueltos para: ${targetUrl}`);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        data: mockData,
        source: targetUrl,
        timestamp: new Date().toISOString(),
        note: 'Datos simulados para desarrollo local'
      })
    };

  } catch (error) {
    console.error('❌ Error en función simulada:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: `Error interno del servidor: ${error.message}` 
      })
    };
  }
}

// Crear servidor HTTP
const server = http.createServer((req, res) => {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  // Manejar preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Solo manejar POST requests a /fetch-protected-data
  if (req.method === 'POST' && req.url === '/fetch-protected-data') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', async () => {
      try {
        const requestBody = JSON.parse(body);
        const result = await handleProtectedDataRequest(requestBody);
        
        res.writeHead(result.statusCode, { 'Content-Type': 'application/json' });
        res.end(result.body);
        
      } catch (error) {
        console.error('❌ Error procesando petición:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Error procesando petición' }));
      }
    });
    
  } else {
    // Para otras rutas, redirigir a Vite (puerto 5500)
    res.writeHead(302, { 'Location': `http://localhost:5500${req.url}` });
    res.end();
  }
});

// Iniciar servidor
server.listen(PORT, () => {
  console.log(`🚀 Servidor de funciones API iniciado en http://localhost:${PORT}`);
  console.log(`🔐 Función simulada disponible en http://localhost:${PORT}/fetch-protected-data`);
  console.log(`📝 API Key configurada: ${API_KEY ? 'Sí' : 'No (usando valor de prueba)'}`);
  console.log(`💡 Para configurar API key real: export SHEETBEST_API_KEY=tu-api-key`);
  console.log(`🌐 Usa Vite en puerto 5500 para desarrollo: npm run dev`);
  console.log(`🔗 Las peticiones a APIs protegidas se redirigen automáticamente a este servidor`);
});
