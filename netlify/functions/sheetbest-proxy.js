const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  // Configurar CORS para Netlify Functions
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE'
  };

  // Manejar preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    // Obtener API Key desde variables de entorno de Netlify
    const apiKey = process.env.VITE_SHEETBEST_API_KEY;
    
    if (!apiKey) {
      console.error('❌ [Netlify Function] API Key no configurada');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'API Key no configurada en el servidor',
          suggestion: 'Verifica que VITE_SHEETBEST_API_KEY esté configurada en Netlify'
        })
      };
    }

    // Extraer la URL de SheetBest de los query parameters
    const { url } = event.queryStringParameters || {};
    
    if (!url) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'URL de SheetBest no proporcionada',
          suggestion: 'Proporciona la URL como query parameter: ?url=https://api.sheetbest.com/...'
        })
      };
    }

    console.log(`🔐 [Netlify Function] Proxying request to: ${url}`);

    const response = await fetch(url, {
      headers: {
        'X-Api-Key': apiKey,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ [Netlify Function] Error from SheetBest: ${response.status} - ${errorText}`);
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({
          error: `Error desde SheetBest: ${response.status}`,
          details: errorText
        })
      };
    }

    const data = await response.json();
    console.log(`✅ [Netlify Function] Successfully proxied data from SheetBest`);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data)
    };

  } catch (error) {
    console.error('❌ [Netlify Function] Error proxying request:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Error interno del servidor',
        details: error.message
      })
    };
  }
};
