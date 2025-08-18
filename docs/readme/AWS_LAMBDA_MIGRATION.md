# ☁️ Migración a AWS Lambda

## 📋 Resumen

La implementación de APIs Protegidas de XDiagrams se puede migrar a AWS Lambda con **mínimos cambios**. AWS Lambda ofrece mayor control y escalabilidad.

## 🔄 Cambios Necesarios

### 1. Estructura de Archivos

#### Antes (Netlify)
```
netlify/
  functions/
    sheetbest-proxy.js
netlify.toml
```

#### Después (AWS Lambda)
```
lambda/
  sheetbest-proxy.js
serverless.yml
```

### 2. Función Adaptada para AWS Lambda

```javascript
// lambda/sheetbest-proxy.js
const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  // CORS headers
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
    // Obtener API Key desde variables de entorno de AWS
    const apiKey = process.env.SHEETBEST_API_KEY;
    
    if (!apiKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'API Key no configurada en el servidor',
          suggestion: 'Verifica que SHEETBEST_API_KEY esté configurada en AWS Lambda'
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

    const response = await fetch(url, {
      headers: {
        'X-Api-Key': apiKey,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
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
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data)
    };
    
  } catch (error) {
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
```

### 3. Configuración con Serverless Framework

```yaml
# serverless.yml
service: xdiagrams-api

provider:
  name: aws
  runtime: nodejs18.x
  region: us-east-1
  environment:
    SHEETBEST_API_KEY: ${env:SHEETBEST_API_KEY}
  iamRoleStatements:
    - Effect: Allow
      Action:
        - logs:CreateLogGroup
        - logs:CreateLogStream
        - logs:PutLogEvents
      Resource: "arn:aws:logs:*:*:*"

functions:
  sheetbest-proxy:
    handler: lambda/sheetbest-proxy.handler
    events:
      - http:
          path: /api/sheetbest-proxy
          method: get
          cors: true
    timeout: 30
    memorySize: 256

plugins:
  - serverless-offline
```

### 4. Variables de Entorno en AWS

```bash
# Usar AWS CLI
aws lambda update-function-configuration \
  --function-name xdiagrams-api-sheetbest-proxy \
  --environment Variables='{SHEETBEST_API_KEY=tu_api_key_aqui}'

# O en AWS Console
# Lambda > Functions > sheetbest-proxy > Configuration > Environment variables
```

## 🔧 Diferencias Principales

| Aspecto | Netlify | AWS Lambda |
|---|---|---|
| **Estructura** | `netlify/functions/` | `lambda/` |
| **Configuración** | `netlify.toml` | `serverless.yml` |
| **Handler** | `exports.handler` | `exports.handler` ✅ |
| **Request/Response** | `event, context` | `event, context` ✅ |
| **Query Params** | `event.queryStringParameters` | `event.queryStringParameters` ✅ |
| **CORS** | Headers en response | Headers en response ✅ |
| **Deploy** | Git push | `serverless deploy` |

## 🚀 Comandos de Migración

```bash
# 1. Instalar Serverless Framework
npm install -g serverless

# 2. Configurar AWS credentials
aws configure

# 3. Instalar dependencias
npm install serverless-offline --save-dev

# 4. Configurar variable de entorno
export SHEETBEST_API_KEY="tu_api_key_aqui"

# 5. Deploy
serverless deploy

# 6. Testing local
serverless offline
```

## ✅ Ventajas de AWS Lambda

- **Mayor control** sobre la infraestructura
- **Escalabilidad** automática avanzada
- **Integración** con otros servicios AWS
- **Costos** más bajos para alto tráfico
- **Monitoreo** detallado con CloudWatch
- **Seguridad** avanzada con IAM

## 🔒 Configuración de Seguridad

```yaml
# serverless.yml - Configuración de seguridad
provider:
  name: aws
  runtime: nodejs18.x
  vpc:
    securityGroupIds:
      - sg-xxxxxxxxxxxxxxxxx
    subnetIds:
      - subnet-xxxxxxxxxxxxxxxxx
  environment:
    SHEETBEST_API_KEY: ${ssm:/xdiagrams/sheetbest-api-key}
```

## 📊 Monitoreo y Logs

```javascript
// Agregar logging detallado
const AWS = require('aws-sdk');
const cloudwatch = new AWS.CloudWatch();

// En la función
console.log('Function invoked:', {
  requestId: context.awsRequestId,
  timestamp: new Date().toISOString(),
  url: url
});
```

---

**AWS Lambda mantiene la misma funcionalidad con mayor control y escalabilidad.** 🚀
