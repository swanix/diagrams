# XDiagrams - Guía de Troubleshooting

## 🔐 Problemas con API Keys y Autenticación

### Error: "Esta API requiere autenticación. Configura una API Key para continuar."

**Síntomas:**
- Error en consola: `API protegida detectada pero no se encontró API Key configurada`
- El diagrama no se carga
- Mensaje de error sobre autenticación requerida

**Causas comunes:**
1. API Key no configurada
2. API Key configurada incorrectamente
3. Archivo de configuración no encontrado
4. Variables de entorno no cargadas

**Solución paso a paso:**

#### 1. Verificar configuración de API Keys

**Opción A: Archivo de configuración externo (Recomendado)**
```bash
# 1. Copiar el archivo de ejemplo
cp src/js/config/api-keys.example.js src/js/config/api-keys.js

# 2. Editar el archivo con tu API Key real
nano src/js/config/api-keys.js
```

**Contenido del archivo `src/js/config/api-keys.js`:**
```javascript
export const API_KEYS = {
  SHEETBEST_API_KEY: 'tu-api-key-real-aqui'
};

export function getApiKeys() {
  return API_KEYS;
}
```

**Opción B: Variables de entorno**
```bash
# 1. Crear archivo .env en la raíz del proyecto
echo "SHEETBEST_API_KEY=tu-api-key-real-aqui" > .env

# 2. Reiniciar el servidor de desarrollo
npm run dev
```

#### 2. Verificar que el archivo está en .gitignore

```bash
# Verificar que api-keys.js está en .gitignore
grep "api-keys.js" .gitignore
```

Si no está, agregarlo:
```bash
echo "src/js/config/api-keys.js" >> .gitignore
```

#### 3. Verificar la URL de SheetBest

Asegúrate de que la URL en el HTML sea correcta:
```javascript
window.$xDiagrams = {
  url: "https://api.sheetbest.com/sheets/TU-SHEET-ID/tabs/All",
  // ... resto de configuración
};
```

#### 4. Debugging paso a paso

Si el problema persiste, verificar la configuración:

**Verificar configuración en `src/js/modules/loader/config/api-keys.js`:**
```javascript
// Verificar que la configuración se carga correctamente
console.log('🔍 [Debug] Configuración cargada:', Object.keys(apiKeysConfig.apiKeys));
```

**Verificar inicialización en `src/js/xdiagrams.js`:**
```javascript
// Verificar que el módulo se inicializa correctamente
console.log('🔍 [Debug] Configuración encontrada:', config);
console.log('🔍 [Debug] DOM readyState:', document.readyState);
```

### Error: "Failed to parse source for import analysis"

**Síntomas:**
- Error de Vite sobre sintaxis JS inválida
- El servidor no inicia correctamente

**Solución:**
1. Verificar que no hay caracteres especiales en los archivos JS
2. Asegurarse de que los archivos tienen extensión `.js` (no `.jsx`)
3. Revisar la sintaxis de import/export

### Error: "DOM ya cargado, inicializando inmediatamente"

**Síntomas:**
- El módulo se carga pero el diagrama no aparece
- No hay errores en consola

**Solución:**
1. Verificar que `window.$xDiagrams` está configurado correctamente
2. Asegurarse de que la configuración tiene al menos una propiedad
3. Verificar que el elemento `#app` existe en el DOM

## 🔧 Verificación de Configuración

### Checklist de configuración correcta:

- [ ] Archivo `src/js/config/api-keys.js` existe y tiene la API Key correcta
- [ ] Archivo está en `.gitignore`
- [ ] URL de SheetBest es correcta y accesible
- [ ] Configuración `window.$xDiagrams` está presente en el HTML
- [ ] Servidor de desarrollo está corriendo (`npm run dev`)
- [ ] No hay errores de sintaxis en la consola

### Comandos útiles para debugging:

```bash
# Verificar que el archivo de configuración existe
ls -la src/js/config/api-keys.js

# Verificar que está en .gitignore
grep "api-keys.js" .gitignore

# Verificar variables de entorno
cat .env

# Reiniciar servidor de desarrollo
npm run dev
```

## 📝 Notas importantes

1. **Nunca subir API Keys al repositorio**
2. **Siempre usar el archivo de ejemplo como base**
3. **Verificar que las URLs de SheetBest incluyan `/tabs/All` si es necesario**
4. **Reiniciar el servidor después de cambios en variables de entorno**

## 🆘 Si nada funciona

1. Verificar que SheetBest está funcionando: `curl https://api.sheetbest.com/sheets/TU-SHEET-ID/tabs/All`
2. Verificar permisos de la API Key en SheetBest
3. Revisar logs del servidor de desarrollo
4. Verificar que no hay conflictos de CORS
