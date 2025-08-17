# 📋 Changelog - XDiagrams

## [2.0.0] - 2024-01-XX

### 🚀 Nuevas Funcionalidades

#### 🔐 APIs Protegidas (NUEVO)
- **Sistema seguro de manejo de APIs protegidas** usando Netlify Functions
- **Detección automática** de APIs que requieren autenticación
- **Proxy serverless** para manejar credenciales de forma segura
- **Soporte nativo para SheetBest API** con autenticación automática
- **Cero exposición de credenciales** en el frontend

#### 🛡️ Seguridad Mejorada
- **Eliminación completa** de inyección de variables de entorno en el bundle
- **Arquitectura serverless** para manejo seguro de API Keys
- **Variables de entorno** solo en el servidor (Netlify)
- **Logs de seguridad** para debugging y monitoreo

### 🔧 Mejoras Técnicas

#### Arquitectura
- **Netlify Functions** como backend seguro
- **Detección inteligente** de fuentes de datos
- **Manejo automático de CORS** en funciones serverless
- **Sistema de proxy** transparente para el desarrollador

#### Build y Deploy
- **Configuración optimizada** de Vite para producción
- **Bundle seguro** sin credenciales expuestas
- **Netlify.toml** configurado para funciones serverless
- **Publish directory** optimizado para `docs/demo`

### 📚 Documentación

#### Nueva Documentación
- **`docs/readme/PROTECTED_APIS.md`** - Guía completa de APIs Protegidas
- **`NETLIFY_SETUP.md`** - Configuración de Netlify Functions
- **`docs/demo/README.md`** - Guía de uso del demo de producción

#### Documentación Actualizada
- **`docs/readme/API_KEYS_SETUP.md`** - Actualizado para usar Netlify Functions
- **`docs/readme/TROUBLESHOOTING.md`** - Nuevos casos de uso y soluciones

### 🗂️ Estructura del Proyecto

#### Nuevos Archivos
```
netlify/
  functions/
    sheetbest-proxy.js    # Proxy seguro para SheetBest
netlify.toml              # Configuración de Netlify
docs/readme/
  PROTECTED_APIS.md       # Documentación de APIs Protegidas
```

#### Archivos Modificados
- `src/js/modules/loader/data-loader.js` - Soporte para proxy
- `src/js/modules/loader/source-detector.js` - Detección de APIs protegidas
- `src/js/modules/loader/auth-manager.js` - Simplificado para usar proxy
- `src/js/modules/loader/config/api-keys.js` - Limpiado de credenciales
- `vite.config.js` - Configuración optimizada para seguridad
- `package.json` - Dependencias para Netlify Functions

### 🧪 Testing y Debugging

#### Nuevas Capacidades
- **Testing local** con Netlify CLI (`netlify dev`)
- **Logs detallados** en funciones serverless
- **Debugging de seguridad** sin exponer credenciales
- **Verificación automática** de configuración

#### Archivos de Demo
- `docs/demo/sheetbest.html` - Demo funcional con APIs protegidas
- `docs/demo/test-local.html` - Demo con datos locales para testing

### 🔄 Migración desde v1.x

#### Cambios Breaking
- **Eliminación** de archivos `api-keys.js` del frontend
- **Nuevo flujo** de autenticación via proxy
- **Configuración** de Netlify Functions requerida

#### Guía de Migración
1. **Configurar** Netlify Functions
2. **Migrar** variables de entorno a Netlify
3. **Actualizar** código para usar proxy
4. **Probar** en entorno de desarrollo

### 🐛 Correcciones

#### Seguridad
- **Eliminación** de API Keys hardcodeadas
- **Limpieza** de logs que exponían información sensible
- **Protección** de variables de entorno

#### Funcionalidad
- **Corrección** de detección de APIs protegidas
- **Mejora** en manejo de errores de autenticación
- **Optimización** de logs para debugging

### 📦 Dependencias

#### Nuevas Dependencias
- `node-fetch@^2.7.0` - Para Netlify Functions

#### Dependencias Actualizadas
- Todas las dependencias actualizadas a las últimas versiones estables

### 🚨 Notas Importantes

#### Seguridad
- **CRÍTICO**: Las API Keys ahora se manejan exclusivamente en el servidor
- **CRÍTICO**: El frontend nunca tiene acceso a credenciales
- **RECOMENDADO**: Usar Netlify Functions para todas las APIs protegidas

#### Compatibilidad
- **Breaking Change**: Requiere configuración de Netlify Functions
- **Breaking Change**: Cambio en el flujo de autenticación
- **Compatibilidad**: Mantiene compatibilidad con APIs públicas

### 🎯 Próximas Versiones

#### Roadmap
- **Soporte para más APIs** protegidas (Google Sheets, Airtable, etc.)
- **Dashboard de configuración** para Netlify Functions
- **Testing automatizado** de funciones serverless
- **Métricas y monitoreo** de uso de APIs

---

## [1.x.x] - Versiones Anteriores

### [1.0.0] - Versión Inicial
- Funcionalidad básica de diagramas
- Soporte para CSV y JSON
- Sistema de temas
- Navegación por clusters

---

**Nota**: Este changelog documenta los cambios significativos entre versiones. Para cambios menores, consulta los commits individuales en el repositorio.
