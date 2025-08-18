# ⚡ Inicio Rápido - Template XDiagrams

## 🚀 En 5 minutos tendrás tu diagrama funcionando

### 1. Copiar el template
```bash
# Copiar a tu nuevo proyecto
cp -r template-xdiagrams/ mi-proyecto/
cd mi-proyecto/
```

### 2. Configurar API Key
```bash
# Copiar archivo de ejemplo
cp env.example .env

# Editar con tu API key de SheetBest
nano .env
```

### 3. Personalizar configuración
Editar `index.html` y cambiar:
```javascript
window.$xDiagrams = {
  url: "/.netlify/functions/sheetbest-proxy?url=https://api.sheetbest.com/sheets/TU-ID/tabs/TU-TAB",
  title: "Mi Diagrama",
  clustersPerRow: "6 3 7 6 3"
};
```

### 4. Probar localmente
```bash
npm run dev
# Abrir http://localhost:3000
```

### 5. Deploy en Netlify
```bash
# Opción A: Con CLI
netlify init
netlify deploy --prod

# Opción B: Con GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/tu-usuario/tu-repo.git
git push -u origin main
# Luego conectar desde Netlify Dashboard
```

## 🔐 Configurar variables en Netlify

1. Ir a **Site Settings** → **Environment Variables**
2. Agregar: `SHEETBEST_API_KEY` = `tu-api-key`
3. Hacer deploy

## ✅ ¡Listo!

Tu diagrama estará disponible en: `https://tu-sitio.netlify.app`

---

**¿Problemas?** Revisa el [README.md](README.md) completo o los logs en Netlify.
