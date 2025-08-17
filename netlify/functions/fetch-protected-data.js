/**
 * Netlify Function para obtener datos de APIs protegidas
 * Maneja la autenticación con API keys desde variables de entorno
 */

exports.handler = async (event, context) => {
  // Configurar CORS para permitir peticiones desde el frontend
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
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
    // Verificar que sea una petición POST
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: 'Método no permitido. Solo se aceptan peticiones POST.' })
      };
    }

    // Parsear el cuerpo de la petición
    let requestBody;
    try {
      requestBody = JSON.parse(event.body);
    } catch (parseError) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Cuerpo de petición JSON inválido' })
      };
    }

    const { url, options = {} } = requestBody;

    // Validar que se proporcione una URL
    if (!url || typeof url !== 'string') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'URL requerida en el cuerpo de la petición' })
      };
    }

    console.log(`Procesando petición para URL: ${url}`);

    // Obtener la API key desde las variables de entorno
    const apiKey = process.env.SHEETBEST_API_KEY;

    if (!apiKey) {
      console.error('SHEETBEST_API_KEY no está configurada en las variables de entorno');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'API key no configurada en el servidor' })
      };
    }

    // Configurar headers para la petición a la API protegida
    const apiHeaders = {
      'X-Api-Key': apiKey,
      'Content-Type': 'application/json'
    };

    // Configurar timeout
    const timeout = options.timeout || 30000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      // Hacer la petición a la API protegida
      const response = await fetch(url, {
        method: 'GET',
        headers: apiHeaders,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Verificar si la petición fue exitosa
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error en API protegida: ${response.status} - ${errorText}`);
        
        let errorMessage = `Error HTTP: ${response.status}`;
        
        if (response.status === 401 || response.status === 403) {
          errorMessage = 'Error de autenticación: API key inválida o expirada';
        } else if (response.status === 404) {
          errorMessage = 'URL no encontrada en la API';
        } else if (response.status >= 500) {
          errorMessage = 'Error interno del servidor de la API';
        }
        
        return {
          statusCode: response.status,
          headers,
          body: JSON.stringify({ 
            error: errorMessage,
            details: errorText
          })
        };
      }

      // Obtener el contenido de la respuesta
      const contentType = response.headers.get('content-type') || '';
      
      let data;
      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        // Si no es JSON, obtener como texto
        data = await response.text();
      }

      console.log(`Datos obtenidos exitosamente de: ${url}`);

      // Devolver los datos
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          data: data,
          source: url,
          timestamp: new Date().toISOString()
        })
      };

    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      console.error('Error en fetch:', fetchError);
      
      if (fetchError.name === 'AbortError') {
        return {
          statusCode: 408,
          headers,
          body: JSON.stringify({ 
            error: `Timeout: La petición tardó más de ${timeout}ms` 
          })
        };
      }
      
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: `Error de conexión: ${fetchError.message}` 
        })
      };
    }

  } catch (error) {
    console.error('Error general en la función:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: `Error interno del servidor: ${error.message}` 
      })
    };
  }
};
