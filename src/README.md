# Swanix Diagrams - Organización de Archivos

## 📁 **Estructura del Proyecto**

### **`src/` - Código Principal (Más Actualizado)**
Esta es la carpeta principal donde se desarrolla y mantiene el código más actualizado.

#### **Archivos Principales:**
- `index.html` - Página principal del diagrama
- `sw-diagrams.js` - **Versión más actualizada** con sistema completo de temas
- `sw-diagrams.css` - **Versión más actualizada** con todos los temas predefinidos
- `theme-creator.html` - **Nueva herramienta** para crear temas personalizados

#### **Características de la versión `src/`:**
- ✅ Sistema completo de temas (6 temas predefinidos)
- ✅ Sistema de filtros para thumbnails SVG
- ✅ Panel lateral con información detallada
- ✅ Navegación entre nodos padre/hijos
- ✅ Selector de temas compacto
- ✅ Persistencia de temas en localStorage
- ✅ Theme Creator para crear temas personalizados

### **`docs/demo/d3-next/` - Demo y Pruebas**
Esta carpeta contiene versiones de demostración y archivos de prueba.

#### **Archivos:**
- `index.html` - Demo del diagrama principal
- `sw-diagrams.js` - Copia de la versión de `src/`
- `sw-diagrams.css` - Copia de la versión de `src/`
- `theme-creator.html` - Copia de la herramienta de `src/`
- `data/data.csv` - Datos de ejemplo para el demo

## 🎨 **Sistema de Temas**

### **Temas Predefinidos:**
1. **Light** - Tema limpio y profesional
2. **Oscuro** - Tema dark mode
3. **Vintage** - Efecto vintage con sepia
4. **Pastel** - Colores pastel suaves
5. **Cyberpunk** - Efecto cyberpunk con neón
6. **Neon** - Colores neón vibrantes

### **Theme Creator:**
- Herramienta visual para crear temas personalizados
- Controles en tiempo real
- Vista previa del diagrama
- Generación automática de código CSS
- Copia al portapapeles

## 🚀 **Cómo Usar**

### **Para Desarrollo:**
1. Trabaja en la carpeta `src/`
2. Usa `src/theme-creator.html` para crear nuevos temas
3. Copia los archivos actualizados a `docs/demo/d3-next/` cuando sea necesario

### **Para Demostración:**
1. Usa la carpeta `docs/demo/d3-next/`
2. Accede a `index.html` para ver el diagrama
3. Accede a `theme-creator.html` para crear temas

## 📋 **Comandos Útiles**

```bash
# Copiar archivos actualizados de src a demo
cp src/sw-diagrams.js docs/demo/d3-next/
cp src/sw-diagrams.css docs/demo/d3-next/
cp src/theme-creator.html docs/demo/d3-next/

# Iniciar servidor en src
cd src && python3 -m http.server 8080

# Iniciar servidor en demo
cd docs/demo/d3-next && python3 -m http.server 8081
```

## 🎯 **URLs de Acceso**

### **Carpeta `src/`:**
- **Diagrama Principal:** http://localhost:8080/
- **Theme Creator:** http://localhost:8080/theme-creator.html

### **Carpeta `docs/demo/d3-next/`:**
- **Demo del Diagrama:** http://localhost:8081/
- **Theme Creator:** http://localhost:8081/theme-creator.html

## 📝 **Notas Importantes**

- **Siempre desarrolla en `src/`** - Esta es la fuente de verdad
- **Sincroniza `docs/`** cuando hagas cambios importantes
- **El Theme Creator** está disponible en ambas carpetas
- **Los temas se guardan** en localStorage del navegador 