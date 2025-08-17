# Configuración de API Keys - XDiagrams

## 🎯 Resumen

Este documento explica cómo configurar API Keys de forma segura para XDiagrams, especialmente para APIs protegidas como SheetBest.

## 🔐 Configuración Segura de API Keys

### Método Recomendado: Archivo de Configuración Externo

#### 1. Crear archivo de configuración

```bash
# Copiar el archivo de ejemplo
cp src/js/config/api-keys.example.js src/js/config/api-keys.js
```

#### 2. Configurar API Keys

Editar `src/js/config/api-keys.js`:

```javascript
/**
 * XDiagrams API Keys Configuration
 * 
 * IMPORTANTE: Este archivo NO debe subirse al repositorio
 * Agrega este archivo a .gitignore
 */

// Configuración de API Keys
export const API_KEYS = {
  SHEETBEST_API_KEY: 'tu-api-key-de-sheetbest-aqui'
};

// Función para obtener la configuración
export function getApiKeys() {
  return API_KEYS;
}
```

#### 3. Verificar .gitignore

Asegúrate de que el archivo esté en `.gitignore`:

```bash
# Verificar que está incluido
grep "api-keys.js" .gitignore

# Si no está, agregarlo
echo "src/js/config/api-keys.js" >> .gitignore
```

### Método Alternativo: Variables de Entorno

#### 1. Crear archivo .env

```bash
# Crear archivo .env en la raíz del proyecto
echo "SHEETBEST_API_KEY=tu-api-key-de-sheetbest-aqui" > .env
```

#### 2. Reiniciar servidor

```bash
npm run dev
```

## 🔄 Prioridad de Configuración

El sistema carga las API Keys en el siguiente orden:

1. **Archivo de configuración externo** (`src/js/config/api-keys.js`)
2. **Configuración de window** (`window.__XDIAGRAMS_CONFIG__`)
3. **Variables de entorno** (`SHEETBEST_API_KEY`)

## 📋 Checklist de Configuración

- [ ] Archivo `src/js/config/api-keys.js` creado
- [ ] API Key configurada correctamente
- [ ] Archivo agregado a `.gitignore`
- [ ] URL de SheetBest correcta en el HTML
- [ ] Servidor reiniciado después de cambios

## 🚨 Seguridad

### ✅ Hacer:
- Usar archivo de configuración externo
- Agregar archivo a `.gitignore`
- Usar variables de entorno con prefijo `VITE_`
- Mantener API Keys fuera del código fuente

### ❌ No hacer:
- Hardcodear API Keys en el HTML
- Subir archivos con API Keys al repositorio
- Usar API Keys en archivos de ejemplo
- Compartir API Keys en logs o consola

## 🔧 Troubleshooting

### Error: "API protegida detectada pero no se encontró API Key configurada"

**Solución:**
1. Verificar que el archivo `src/js/config/api-keys.js` existe
2. Verificar que la API Key está configurada correctamente
3. Verificar que el archivo está siendo cargado

### Error: "Failed to parse source for import analysis"

**Solución:**
1. Verificar sintaxis del archivo de configuración
2. Asegurarse de que no hay caracteres especiales
3. Verificar que el archivo tiene extensión `.js`

## 📝 Ejemplos

### Configuración para SheetBest

```javascript
export const API_KEYS = {
  SHEETBEST_API_KEY: 'tu-api-key-de-sheetbest-aqui'
};
```

### Configuración para múltiples APIs

```javascript
export const API_KEYS = {
  SHEETBEST_API_KEY: 'tu-api-key-de-sheetbest',
  EXAMPLE_API_KEY: 'tu-api-key-de-ejemplo',
  CUSTOM_API_KEY: 'tu-api-key-personalizada'
};
```

## 🔗 Enlaces útiles

- [Guía de Troubleshooting](./TROUBLESHOOTING.md)
- [Documentación de SheetBest](https://sheet.best/docs)
- [Variables de entorno en Vite](https://vitejs.dev/guide/env-and-mode.html)
