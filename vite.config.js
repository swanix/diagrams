import { defineConfig } from 'vite'
import { writeFileSync, copyFileSync, mkdirSync, existsSync, readFileSync } from 'fs'
import { execSync } from 'child_process'
import { join } from 'path'
import Papa from 'papaparse'

// Leer información del package.json
const packageInfo = JSON.parse(readFileSync('package.json', 'utf8'))
const libraryName = packageInfo.name
const version = packageInfo.version
const description = packageInfo.description
const author = packageInfo.author
const license = packageInfo.license
const homepage = packageInfo.homepage

export default defineConfig(({ mode, command }) => {
  // Detectar el tipo de servidor basado en variables de entorno
  const isDocs = process.env.VITE_SERVER === 'docs'
  const isDev = command === 'serve' && !isDocs
  
  // Función para generar encabezado de JavaScript
  const generateJSHeader = () => {
    return `/**
 * ${libraryName} v${version}
 */
`
  }
  
  // Función para generar encabezado de CSS
  const generateCSSHeader = () => {
    return `/**
 * ${libraryName} v${version}
 */
`
  }
  
  // Función para minificar CSS (versión simplificada)
  const minifyCSS = (cssContent) => {
    try {
      // Minificación básica: remover comentarios, espacios extra y saltos de línea
      return cssContent
        .replace(/\/\*[\s\S]*?\*\//g, '') // Remover comentarios /* */
        .replace(/\/\/.*$/gm, '') // Remover comentarios //
        .replace(/\s+/g, ' ') // Remover espacios múltiples
        .replace(/\s*{\s*/g, '{') // Remover espacios alrededor de {
        .replace(/\s*}\s*/g, '}') // Remover espacios alrededor de }
        .replace(/\s*:\s*/g, ':') // Remover espacios alrededor de :
        .replace(/\s*;\s*/g, ';') // Remover espacios alrededor de ;
        .replace(/\s*,\s*/g, ',') // Remover espacios alrededor de ,
        .trim() // Remover espacios al inicio y final
    } catch (error) {
      console.error('Error minificando CSS:', error)
      return cssContent
    }
  }

  // Función para generar archivo de contexto LLM estático
  const generateStaticLLMFile = () => {
    try {
      const csvPath = 'src/data/companies-board.csv'
      if (!existsSync(csvPath)) {
        console.log('Archivo CSV no encontrado, saltando generación de LLM estático')
        return
      }

      console.log('Generando archivo de contexto LLM...')
      
      // Leer el CSV
      const csvContent = readFileSync(csvPath, 'utf8')
      const csvData = Papa.parse(csvContent, { header: true }).data
      
      // Generar contenido LLM
      const llmContent = generateLLMContent(csvData)
      
      // Escribir archivo
      const outputPath = 'src/data/context.md'
      writeFileSync(outputPath, llmContent, 'utf8')
      
      console.log('Archivo de contexto LLM generado:', outputPath)
      
    } catch (error) {
      console.error('Error generando archivo LLM estático:', error)
    }
  }

  // Función para generar contenido LLM
  const generateLLMContent = (csvData) => {
    const config = { title: 'Companies Board' }
    
    // Procesar nodos
    const nodes = csvData.map((row, index) => ({
      id: row.id || row.Id || row.Node || `node_${index}`,
      name: row.name || row.Name || row.title || 'Sin nombre',
      type: row.type || row.Type || 'default',
      icon: row.icon || row.Icon || 'detail',
      parent: row.parent || row.Parent || null,
      img: row.img || row.Img || null,
      description: row.description || row.Description || '',
      category: row.category || row.Category || '',
      status: row.status || row.Status || 'active',
      priority: row.priority || row.Priority || 'medium',
      tags: row.tags || row.Tags || '',
      url: row.url || row.Url || row.link || row.Link || '',
      notes: row.notes || row.Notes || '',
      ...extractAdditionalFields(row)
    }))

    // Identificar clusters
    const clusters = {}
    csvData.forEach(row => {
      const parentId = row.parent || row.Parent
      if (parentId) {
        if (!clusters[parentId]) {
          clusters[parentId] = {
            id: parentId,
            name: findParentName(csvData, parentId),
            children: [],
            childCount: 0
          }
        }
        clusters[parentId].children.push(row.id || row.Id || row.Node)
        clusters[parentId].childCount++
      }
    })

    // Generar resumen
    const totalNodes = csvData.length
    const nodesWithParents = csvData.filter(row => row.parent || row.Parent).length
    const rootNodes = totalNodes - nodesWithParents
    
    const categories = {}
    const types = {}
    csvData.forEach(row => {
      const category = row.category || row.Category || 'Sin categoría'
      const type = row.type || row.Type || 'default'
      categories[category] = (categories[category] || 0) + 1
      types[type] = (types[type] || 0) + 1
    })

    const topCategories = Object.entries(categories)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }))

    const topTypes = Object.entries(types)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }))

    // Generar texto
    let text = `# ${config.title}\n\n`
    text += `## Resumen del Diagrama\n`
    text += `- Total de nodos: ${totalNodes}\n`
    text += `- Nodos raíz: ${rootNodes}\n`
    text += `- Nodos hijos: ${nodesWithParents}\n`
    text += `- Categorías: ${Object.keys(categories).length}\n`
    text += `- Tipos: ${Object.keys(types).length}\n\n`
    
    text += `## Categorías Principales\n`
    topCategories.forEach(cat => {
      text += `- ${cat.name}: ${cat.count} nodos\n`
    })
    text += `\n`
    
    text += `## Tipos Principales\n`
    topTypes.forEach(type => {
      text += `- ${type.name}: ${type.count} nodos\n`
    })
    text += `\n`
    
    text += `## Clusters y Jerarquías\n`
    Object.values(clusters).forEach(cluster => {
      text += `### Cluster: ${cluster.name} (ID: ${cluster.id})\n`
      text += `- Nodos hijos: ${cluster.childCount}\n`
      text += `- IDs de hijos: ${cluster.children.join(', ')}\n\n`
    })
    
    text += `## Nodos Detallados\n`
    nodes.forEach(node => {
      text += `### ${node.name} (ID: ${node.id})\n`
      text += `- Tipo: ${node.type}\n`
      text += `- Icono: ${node.icon}\n`
      if (node.parent) text += `- Padre: ${node.parent}\n`
      if (node.description) text += `- Descripción: ${node.description}\n`
      if (node.category) text += `- Categoría: ${node.category}\n`
      if (node.status) text += `- Estado: ${node.status}\n`
      if (node.priority) text += `- Prioridad: ${node.priority}\n`
      if (node.tags) text += `- Etiquetas: ${node.tags}\n`
      if (node.url) text += `- URL: ${node.url}\n`
      if (node.notes) text += `- Notas: ${node.notes}\n`
      
      // Campos adicionales
      Object.keys(node).forEach(key => {
        if (!['id', 'name', 'type', 'icon', 'parent', 'img', 'description', 
              'category', 'status', 'priority', 'tags', 'url', 'notes'].includes(key)) {
          text += `- ${key}: ${node[key]}\n`
        }
      })
      text += `\n`
    })
    
    text += `## Relaciones\n`
    csvData.forEach(row => {
      const parentId = row.parent || row.Parent
      const nodeId = row.id || row.Id || row.Node
      if (parentId && nodeId) {
        text += `- ${parentId} → ${nodeId} (parent-child)\n`
      }
    })
    
    text += `\n---\n`
    text += `Generado automáticamente el ${new Date().toISOString()}\n`
    text += `Fuente: CSV estático\n`
    
    return text
  }

  // Función auxiliar para extraer campos adicionales
  const extractAdditionalFields = (row) => {
    const additionalFields = {}
    const excludeFields = ['id', 'Id', 'Node', 'name', 'Name', 'title', 'type', 'Type', 
                          'icon', 'Icon', 'parent', 'Parent', 'img', 'Img', 'description', 
                          'Description', 'category', 'Category', 'status', 'Status', 
                          'priority', 'Priority', 'tags', 'Tags', 'url', 'Url', 'link', 
                          'Link', 'notes', 'Notes']
    
    Object.keys(row).forEach(key => {
      if (!excludeFields.includes(key) && row[key] !== undefined && row[key] !== '') {
        additionalFields[key] = row[key]
      }
    })
    
    return additionalFields
  }

  // Función auxiliar para encontrar nombre del padre
  const findParentName = (csvData, parentId) => {
    const parent = csvData.find(row => 
      (row.id || row.Id || row.Node) === parentId
    )
    return parent ? (parent.name || parent.Name || parent.title || parentId) : parentId
  }

  // Plugin para verificar archivos de producción antes de servir
  const productionCheckPlugin = () => {
    return {
      name: 'production-check',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          // Solo verificar en rutas de producción
          if (req.url && (req.url.includes('/docs/demo/') || req.url.includes('/dist/'))) {
            const requiredFiles = [
              'dist/xdiagrams.min.js',
              'dist/xdiagrams.min.css',
              'docs/demo/index.html'
            ];
            
            const missingFiles = requiredFiles.filter(file => !existsSync(file));
            
            if (missingFiles.length > 0) {
              console.log('Archivos de producción no encontrados. Ejecutando build...');
              console.log('Archivos faltantes:', missingFiles.join(', '));
              
              try {
                execSync('npm run build', { stdio: 'inherit' });
                console.log('Build completado exitosamente');
              } catch (error) {
                console.error('Error durante el build:', error.message);
                res.statusCode = 500;
                res.end('Error: Build failed');
                return;
              }
            }
          }
          next();
        });
      }
    }
  }

  // Plugin para manejar archivos Markdown de Docsify
  const docsifyPlugin = () => {
    return {
      name: 'docsify-md-handler',
      configureServer(server) {
        // Middleware para archivos Markdown
        server.middlewares.use((req, res, next) => {
          if (req.url && req.url.endsWith('.md')) {
            res.setHeader('Content-Type', 'text/plain; charset=utf-8')
          }
          next()
        })
        
        // Forzar recarga cuando cambian archivos Markdown
        server.watcher.on('change', (file) => {
          if (file.includes('docs/content/') && file.endsWith('.md')) {
            console.log(`Archivo Markdown modificado: ${file}`)
            // Forzar recarga completa del navegador
            setTimeout(() => {
              server.ws.send({
                type: 'full-reload',
                path: '*'
              })
            }, 100)
          }
        })
      }
    }
  }

  // Plugin para generar archivo LLM estático
  const generateLLMStaticPlugin = () => {
    return {
      name: 'generate-llm-static',
      buildStart() {
        generateStaticLLMFile()
      }
    }
  }

  // Función para copiar archivos del bundle a docs/demo
  const copyBundleToDocs = () => {
    return {
      name: 'copy-bundle-to-docs',
      async closeBundle() {
        try {
          // Crear directorio docs/demo si no existe
          const demoDir = 'docs/demo'
          if (!existsSync(demoDir)) {
            mkdirSync(demoDir, { recursive: true })
          }
          
          // Copiar archivos del bundle con encabezados
          const bundleFiles = ['xdiagrams.js', 'xdiagrams.min.js']
          bundleFiles.forEach(file => {
            const sourcePath = join('dist', file)
            const destPath = join(demoDir, file)
            if (existsSync(sourcePath)) {
              const content = readFileSync(sourcePath, 'utf8')
              const header = generateJSHeader()
              writeFileSync(destPath, header + content)
              console.log(`Copiado con encabezado: ${sourcePath} → ${destPath}`)
            }
          })
          
          // Agregar encabezados a los archivos en dist/
          bundleFiles.forEach(file => {
            const distPath = join('dist', file)
            if (existsSync(distPath)) {
              const content = readFileSync(distPath, 'utf8')
              const header = generateJSHeader()
              writeFileSync(distPath, header + content)
              console.log(`Agregado encabezado a: ${distPath}`)
            }
          })
          
          // Copiar y ajustar archivo CSS a docs/demo
          const cssSourcePath = join('src', 'styles', 'xdiagrams.css')
          const cssDestPath = join(demoDir, 'xdiagrams.css')
          if (existsSync(cssSourcePath)) {
            let cssContent = readFileSync(cssSourcePath, 'utf8')
            // Ajustar ruta de la fuente para docs/demo
            cssContent = cssContent.replace(
              /url\('\.\.\/icons\/xdiagrams\.woff\?[^']*'\)/g,
              "url('xdiagrams.woff')"
            )
            const cssHeader = generateCSSHeader()
            writeFileSync(cssDestPath, cssHeader + cssContent)
            console.log(`Copiado y ajustado con encabezado: ${cssSourcePath} → ${cssDestPath}`)
            
            // Generar versión minificada para docs/demo
            const cssMinContent = minifyCSS(cssContent)
            const cssMinDestPath = join(demoDir, 'xdiagrams.min.css')
            const cssMinHeader = generateCSSHeader()
            writeFileSync(cssMinDestPath, cssMinHeader + cssMinContent)
            console.log(`Generado CSS minificado con encabezado: ${cssMinDestPath}`)
          }
          
          // Copiar y ajustar archivo CSS a dist/ principal para CDN
          const cssDistPath = join('dist', 'xdiagrams.css')
          if (existsSync(cssSourcePath)) {
            let cssContent = readFileSync(cssSourcePath, 'utf8')
            // Ajustar ruta de la fuente para dist/
            cssContent = cssContent.replace(
              /url\('\.\.\/icons\/xdiagrams\.woff\?[^']*'\)/g,
              "url('xdiagrams.woff')"
            )
            const distCssHeader = generateCSSHeader()
            writeFileSync(cssDistPath, distCssHeader + cssContent)
            console.log(`Copiado y ajustado con encabezado: ${cssSourcePath} → ${cssDistPath}`)
            
            // Generar versión minificada para dist/
            const cssMinContent = minifyCSS(cssContent)
            const cssMinDistPath = join('dist', 'xdiagrams.min.css')
            const distCssMinHeader = generateCSSHeader()
            writeFileSync(cssMinDistPath, distCssMinHeader + cssMinContent)
            console.log(`Generado CSS minificado con encabezado: ${cssMinDistPath}`)
          }
          
          // Copiar archivo de fuente de iconos a docs/demo
          const fontSourcePath = join('src', 'icons', 'xdiagrams.woff')
          const fontDemoPath = join(demoDir, 'xdiagrams.woff')
          if (existsSync(fontSourcePath)) {
            copyFileSync(fontSourcePath, fontDemoPath)
            console.log(`Copiado: ${fontSourcePath} → ${fontDemoPath}`)
          }
          
          // Copiar archivo de fuente de iconos a dist/ principal para CDN
          const fontDistPath = join('dist', 'xdiagrams.woff')
          if (existsSync(fontSourcePath)) {
            copyFileSync(fontSourcePath, fontDistPath)
            console.log(`Copiado: ${fontSourcePath} → ${fontDistPath}`)
          }
          
          // Copiar archivo CSV de datos a docs/demo para el demo de SheetBest
          const csvSourcePath = join('src', 'data', 'companies-board.csv')
          const csvDemoPath = join(demoDir, 'companies-board.csv')
          if (existsSync(csvSourcePath)) {
            copyFileSync(csvSourcePath, csvDemoPath)
            console.log(`Copiado: ${csvSourcePath} → ${csvDemoPath}`)
          }
          
          // Verificar configuración de API Keys (ahora solo variables de entorno)
          console.log(`Configuración de API Keys: Variables de entorno del archivo .env`)
          
          // El módulo de temas ahora está integrado en xdiagrams.js, no necesita copiarse por separado
          
          // Generar automáticamente el archivo de demo basado en src/index.html
          const originalHtmlPath = join('src', 'index.html')
          const demoHtmlPath = join(demoDir, 'index.html')
          
          if (existsSync(originalHtmlPath)) {
            let htmlContent = readFileSync(originalHtmlPath, 'utf8')
            
            // Cambiar el título para indicar que es la versión de producción
            htmlContent = htmlContent.replace(
              /<title>.*?<\/title>/,
              '<title>XDiagrams - Versión Producción (Demo)</title>'
            )
            
            // Reemplazar el script de módulos ES6 por el bundle minificado
            htmlContent = htmlContent.replace(
              /<script type="module" src="js\/xdiagrams\.js"><\/script>/,
              '<script src="xdiagrams.min.js"></script>'
            )
            
            // Reemplazar el CSS de desarrollo por el minificado
            htmlContent = htmlContent.replace(
              /<link href="styles\/xdiagrams\.css" rel="stylesheet" \/>/,
              '<link href="xdiagrams.min.css" rel="stylesheet" />'
            )
            
            // Asegurar que showThemeToggle esté en false para producción
            htmlContent = htmlContent.replace(
              /showThemeToggle:\s*true/,
              'showThemeToggle: false'
            )
            
            // Ajustar rutas relativas para que funcionen en docs/demo
            htmlContent = htmlContent.replace(
              /logo:\s*"img\/logo\.svg"/,
              'logo: "/src/img/logo.svg"'
            )
            
            writeFileSync(demoHtmlPath, htmlContent)
            console.log(`Generado automáticamente: ${originalHtmlPath} → ${demoHtmlPath}`)
          }
          
        } catch (error) {
          console.error('Error copiando archivos a docs/demo:', error)
        }
      }
    }
  }
  
  if (isDocs) {
    // Configuración para servidor de documentación
    return {
      plugins: [docsifyPlugin()],
      server: {
        port: 4000,
        open: '/',
        host: true,
        watch: {
          usePolling: true,
          interval: 100
        },
        hmr: {
          overlay: true
        }
      },
      root: 'docs',
      base: './',
      build: {
        outDir: 'docs-dist',
        rollupOptions: {
          input: {
            main: 'docs/index.html'
          }
        },
        minify: 'terser',
        terserOptions: {
          compress: {
            drop_console: true,
            drop_debugger: true
          }
        }
      },
      optimizeDeps: {
        include: ['d3', 'papaparse']
      },
      css: {
        devSourcemap: false
      }
    }
  }
  
  if (isDev) {
    // Configuración para servidor de desarrollo
    return {
      plugins: [generateLLMStaticPlugin(), copyBundleToDocs(), productionCheckPlugin()],
      define: {
        // No inyectar variables de entorno en el cliente por seguridad
        'process.env': JSON.stringify({})
      },
      server: {
        port: process.env.NETLIFY_DEV ? 8888 : 3000,
        open: '/',
        host: true,
        watch: {
          usePolling: true,
          interval: 100
        },
        hmr: {
          overlay: true
        }
      },
      root: 'src',
      base: './',
      publicDir: '../dist',
      build: {
        lib: {
          entry: 'js/xdiagrams.js',
          name: 'XDiagrams',
          fileName: (format) => `xdiagrams.${format === 'es' ? 'js' : 'min.js'}`,
          formats: ['es', 'umd']
        },
        outDir: '../dist',
        target: 'es2020',
        rollupOptions: {
          external: [],
          output: {
            inlineDynamicImports: true
          }
        },
        minify: 'terser',
        terserOptions: {
          compress: {
            drop_console: false,
            drop_debugger: false
          }
        }
      },
      optimizeDeps: {
        include: ['d3', 'papaparse']
      },
      css: {
        devSourcemap: true
      }
    }
  }
  
  // Configuración por defecto (build de librería)
  return {
    plugins: [generateLLMStaticPlugin(), copyBundleToDocs()],
    define: {
      // No inyectar variables de entorno en el cliente por seguridad
      'process.env': JSON.stringify({})
    },
    build: {
      lib: {
        entry: 'src/js/xdiagrams.js',
        name: 'XDiagrams',
        fileName: (format) => `xdiagrams.${format === 'es' ? 'js' : 'min.js'}`,
        formats: ['es', 'umd']
      },
      outDir: 'dist',
      target: 'es2020',
      rollupOptions: {
        external: [],
        output: {
          inlineDynamicImports: true
        }
      },
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: false,  // Mantener console.log para debug
          drop_debugger: false
        }
      }
    },
    base: './',
    optimizeDeps: {
      include: ['d3', 'papaparse']
    },
    css: {
      devSourcemap: mode === 'development'
    }
  }
})
