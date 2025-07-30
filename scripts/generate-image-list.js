#!/usr/bin/env node

/**
 * Script para generar automáticamente la lista de imágenes disponibles
 * para la funcionalidad de auto-image
 */

const fs = require('fs');
const path = require('path');

// Ruta a la carpeta de fotos
const photosDir = path.join(__dirname, '../src/img/photos');

// Extensiones de imagen soportadas
const supportedExtensions = ['.jpeg', '.jpg', '.png', '.gif', '.webp'];

function generateImageList() {
  try {
    // Verificar si la carpeta existe
    if (!fs.existsSync(photosDir)) {
      console.error(`❌ La carpeta ${photosDir} no existe`);
      return;
    }

    // Leer archivos en la carpeta
    const files = fs.readdirSync(photosDir);
    
    // Filtrar solo archivos de imagen
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return supportedExtensions.includes(ext);
    });

    if (imageFiles.length === 0) {
      console.log('ℹ️  No se encontraron archivos de imagen en la carpeta');
      return;
    }

    // Crear el objeto de imágenes
    const imageList = {};
    imageFiles.forEach(file => {
      const nameWithoutExt = path.basename(file, path.extname(file));
      const ext = path.extname(file).toLowerCase();
      imageList[nameWithoutExt] = ext;
    });

    // Generar el código JavaScript
    const jsCode = `// Lista de imágenes conocidas disponibles en img/photos/ con sus extensiones
// Generado automáticamente por scripts/generate-image-list.js
const knownImages = ${JSON.stringify(imageList, null, 2)};
`;

    // Guardar en un archivo temporal
    const outputFile = path.join(__dirname, '../temp-image-list.js');
    fs.writeFileSync(outputFile, jsCode);

    console.log('✅ Lista de imágenes generada:');
    console.log(`📁 Archivo: ${outputFile}`);
    console.log(`📊 Total de imágenes: ${imageFiles.length}`);
    console.log('\n📋 Imágenes encontradas:');
    
    Object.entries(imageList).forEach(([name, ext]) => {
      console.log(`   - ${name}${ext}`);
    });

    console.log('\n📝 Para usar esta lista:');
    console.log('1. Copia el contenido del archivo temp-image-list.js');
    console.log('2. Reemplaza la sección "knownImages" en src/xdiagrams.js');
    console.log('3. Elimina el archivo temporal');

  } catch (error) {
    console.error('❌ Error al generar la lista de imágenes:', error);
  }
}

// Ejecutar el script
generateImageList(); 