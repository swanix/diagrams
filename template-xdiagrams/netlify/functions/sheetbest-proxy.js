const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  console.log('🚀 [Netlify Function] Function invoked');
  console.log('📋 [Netlify Function] Event:', {
    httpMethod: event.httpMethod,
    path: event.path,
    queryStringParameters: event.queryStringParameters
  });
  
  // Configurar CORS para Netlify Functions
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Manejar preflight requests (CORS)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    // Obtener API Key desde variables de entorno de Netlify
    const apiKey = process.env.SHEETBEST_API_KEY;
    
    console.log('🔍 [Netlify Function] Environment check:', {
      hasApiKey: !!apiKey,
      apiKeyLength: apiKey ? apiKey.length : 0,
      apiKeyPreview: apiKey ? `${apiKey.substring(0, 10)}...` : 'undefined'
    });
    
    if (!apiKey) {
      console.error('❌ [Netlify Function] API Key no configurada');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'API Key no configurada en el servidor',
          suggestion: 'Verifica que SHEETBEST_API_KEY esté configurada en Netlify',
          code: 'MISSING_API_KEY'
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
          suggestion: 'Proporciona la URL como query parameter: ?url=https://api.sheetbest.com/...',
          code: 'MISSING_URL'
        })
      };
    }

    // Validar que la URL es de SheetBest
    if (!url.includes('api.sheetbest.com')) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'URL no válida para SheetBest',
          suggestion: 'La URL debe ser de api.sheetbest.com',
          code: 'INVALID_URL'
        })
      };
    }

    console.log(`🔐 [Netlify Function] Proxying request to: ${url}`);

    const response = await fetch(url, {
      headers: {
        'X-Api-Key': apiKey,
        'Content-Type': 'application/json'
      },
      timeout: 10000 // 10 segundos de timeout
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ [Netlify Function] Error from SheetBest: ${response.status} - ${errorText}`);
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({
          error: `Error desde SheetBest: ${response.status}`,
          details: errorText,
          code: 'SHEETBEST_ERROR'
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
        details: error.message,
        code: 'INTERNAL_ERROR'
      })
    };
  }
};
