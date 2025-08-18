# 🚀 Template XDiagrams - Proyecto Listo para Usar

Este template te permite usar **XDiagrams** en cualquier proyecto con **APIs protegidas** de forma rápida y segura.

## 📁 Estructura del Template

```
template-xdiagrams/
├── README.md                    ← Este archivo
├── index.html                   ← HTML principal con CDN
├── netlify.toml                 ← Configuración de Netlify
├── .env.example                 ← Ejemplo de variables de entorno
├── .gitignore                   ← Archivos a ignorar
└── netlify/
    └── functions/
        └── sheetbest-proxy.js   ← Función proxy para APIs protegidas
```

## 🚀 Uso Rápido

### 1. Copiar el template
```bash
# Copiar toda la carpeta a tu nuevo proyecto
cp -r template-xdiagrams/ mi-nuevo-proyecto/
cd mi-nuevo-proyecto/
```

### 2. Configurar variables de entorno
```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar con tus API keys
nano .env
```

### 3. Personalizar el HTML
Editar `index.html` con tu configuración:
```javascript
window.$xDiagrams = {
  url: "https://api.sheetbest.com/sheets/TU-SHEET-ID/tabs/TU-TAB",
  title: "Mi Diagrama",
  clustersPerRow: "6 3 7 6 3"
};
```

### 4. Deploy en Netlify
```bash
# Conectar a Netlify
netlify init

# O subir a GitHub y conectar desde Netlify Dashboard
```

## 🔐 Configuración de APIs Protegidas

### Variables de entorno necesarias:
- `SHEETBEST_API_KEY`: Tu API key de SheetBest

### Configurar en Netlify:
1. Ir a **Site settings** → **Environment variables**
2. Agregar `SHEETBEST_API_KEY` con tu valor
3. Hacer deploy

## 📊 URLs de ejemplo

### Para datos locales:
```javascript
url: "datos.csv"
```

### Para APIs públicas:
```javascript
url: "https://api.ejemplo.com/datos"
```

### Para APIs protegidas (SheetBest):
```javascript
url: "/.netlify/functions/sheetbest-proxy?url=https://api.sheetbest.com/sheets/TU-ID/tabs/TU-TAB"
```

## 🎨 Personalización

### Temas:
```javascript
showThemeToggle: true,  // Mostrar toggle de tema
```

### Layout:
```javascript
clustersPerRow: "6 3 7 6 3",  // Número de clusters por fila
spacing: 80,                  // Espaciado horizontal
verticalSpacing: 170,         // Espaciado vertical
nodeWidth: 100,               // Ancho de nodos
nodeHeight: 125               // Alto de nodos
```

## 🔧 Troubleshooting

### Error: "API Key no configurada"
- Verificar que `SHEETBEST_API_KEY` está en variables de entorno de Netlify
- Verificar que la función proxy está desplegada

### Error: "CORS"
- Verificar que la función proxy tiene los headers CORS correctos
- Verificar que la URL del proxy es correcta

### Error: "Función no encontrada"
- Verificar que `netlify.toml` está en la raíz del proyecto
- Verificar que la función está en `netlify/functions/`

## 📚 Enlaces útiles

- [Documentación XDiagrams](https://github.com/swanix/diagrams)
- [SheetBest API](https://sheet.best/docs)
- [Netlify Functions](https://docs.netlify.com/functions/overview/)

## 🎯 Próximos pasos

1. **Personalizar** el diseño y configuración
2. **Agregar** más funciones proxy si necesitas otras APIs
3. **Optimizar** para tu caso de uso específico
4. **Deploy** y compartir tu diagrama

---

**¡Listo para usar! 🚀**
