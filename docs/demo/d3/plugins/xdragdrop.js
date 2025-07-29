/**
 * XDragDrop Plugin - Sistema de Drag & Drop para XDiagrams
 * 
 * Este plugin proporciona funcionalidad de drag & drop para cargar archivos
 * CSV y JSON en el sistema XDiagrams, con soporte para múltiples archivos
 * y combinación automática.
 * 
 * Uso:
 * 1. Incluir este archivo después de xdiagrams.js
 * 2. Llamar a XDragDrop.init() para activar
 * 3. Opcional: configurar opciones personalizadas
 */

(function() {
  'use strict';

  // Namespace para el plugin
  window.XDragDrop = {
    
    // Configuración por defecto
    config: {
      enabled: true,
      autoCombine: true,           // Preguntar automáticamente si combinar múltiples archivos
      supportedTypes: ['csv', 'json'],
      dropZoneSelector: '#sw-diagram',
      dragOverlaySelector: '#dragOverlay',
      fileDropZoneSelector: '#fileDropZone',
      showToast: true,             // Usar sistema de toast integrado
      onFileProcessed: null,       // Callback cuando se procesa un archivo
      onFilesCombined: null,       // Callback cuando se combinan archivos
      onError: null                // Callback para errores
    },

    // Estado interno
    state: {
      isInitialized: false,
      isDragging: false,
      activeDropZone: null
    },

    // Inicializar el plugin
    init: function(options = {}) {
      if (this.state.isInitialized) {
        console.warn('XDragDrop ya está inicializado');
        return;
      }

      // Merge configuración
      this.config = { ...this.config, ...options };

      if (!this.config.enabled) {
        console.log('XDragDrop deshabilitado por configuración');
        return;
      }

      this.setupEventListeners();
      this.state.isInitialized = true;
      console.log('XDragDrop inicializado correctamente');
    },

    // Configurar event listeners
    setupEventListeners: function() {
      const dropZone = document.querySelector(this.config.dropZoneSelector);
      const dragOverlay = document.querySelector(this.config.dragOverlaySelector);
      const fileDropZone = document.querySelector(this.config.fileDropZoneSelector);

      if (!dropZone) {
        console.error('XDragDrop: No se encontró la zona de drop:', this.config.dropZoneSelector);
        return;
      }

      // Event listeners principales
      dropZone.addEventListener('dragover', this.handleDragOver.bind(this));
      dropZone.addEventListener('dragenter', this.handleDragEnter.bind(this));
      dropZone.addEventListener('dragleave', this.handleDragLeave.bind(this));
      dropZone.addEventListener('drop', this.handleFileDrop.bind(this));

      // Event listeners para overlay
      if (dragOverlay) {
        dragOverlay.addEventListener('dragover', this.handleDragOver.bind(this));
        dragOverlay.addEventListener('dragenter', this.handleDragEnter.bind(this));
        dragOverlay.addEventListener('dragleave', this.handleDragLeave.bind(this));
        dragOverlay.addEventListener('drop', this.handleFileDrop.bind(this));
      }

      // Event listeners para file drop zone
      if (fileDropZone) {
        fileDropZone.addEventListener('dragover', this.handleDragOver.bind(this));
        fileDropZone.addEventListener('dragenter', this.handleDragEnter.bind(this));
        fileDropZone.addEventListener('dragleave', this.handleDragLeave.bind(this));
        fileDropZone.addEventListener('drop', this.handleFileDrop.bind(this));
      }

      console.log('XDragDrop: Event listeners configurados');
    },

    // Manejar drag over
    handleDragOver: function(e) {
      e.preventDefault();
      e.stopPropagation();
    },

    // Manejar drag enter
    handleDragEnter: function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      this.state.isDragging = true;
      this.showDragState(true);
    },

    // Manejar drag leave
    handleDragLeave: function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      // Solo remover estado si estamos saliendo completamente del área
      const dropZone = document.querySelector(this.config.dropZoneSelector);
      if (dropZone && !dropZone.contains(e.relatedTarget)) {
        this.state.isDragging = false;
        this.showDragState(false);
      }
    },

    // Manejar file drop
    handleFileDrop: function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      this.state.isDragging = false;
      this.showDragState(false);

      const files = e.dataTransfer.files;
      if (files.length === 0) {
        this.showError('No se detectaron archivos');
        return;
      }

      this.processDroppedFiles(files);
    },

    // Mostrar/ocultar estado de drag
    showDragState: function(show) {
      const dropZone = document.querySelector(this.config.dropZoneSelector);
      const dragOverlay = document.querySelector(this.config.dragOverlaySelector);
      const fileDropZone = document.querySelector(this.config.fileDropZoneSelector);

      if (dropZone) {
        dropZone.classList.toggle('drag-over', show);
      }
      if (dragOverlay) {
        dragOverlay.classList.toggle('active', show);
      }
      if (fileDropZone) {
        fileDropZone.classList.toggle('active', show);
      }
    },

    // Procesar archivos soltados
    processDroppedFiles: function(files) {
      // Filtrar archivos compatibles
      const supportedFiles = Array.from(files).filter(file => {
        const name = file.name.toLowerCase();
        const type = file.type;
        return this.config.supportedTypes.some(ext => 
          name.endsWith('.' + ext) || 
          type === 'text/csv' || 
          type === 'application/json' || 
          type === 'text/json'
        );
      });

      if (supportedFiles.length === 0) {
        this.showError('Por favor, selecciona archivos CSV o JSON válidos.');
        return;
      }

      this.showSuccess(`Se detectaron ${supportedFiles.length} archivos compatibles`);

      if (supportedFiles.length === 1) {
        // Archivo único
        this.processSingleFile(supportedFiles[0]);
      } else {
        // Múltiples archivos
        this.processMultipleFiles(supportedFiles);
      }
    },

    // Procesar archivo único
    processSingleFile: function(file) {
      console.log('XDragDrop: Procesando archivo único:', file.name);
      
      this.processFile(file)
        .then(diagram => {
          console.log('XDragDrop: Archivo procesado exitosamente:', diagram.name);
          this.addAndLoadDiagram(diagram);
          this.showSuccess(`Diagrama "${diagram.name}" agregado exitosamente`);
          
          if (this.config.onFileProcessed) {
            this.config.onFileProcessed(diagram);
          }
        })
        .catch(error => {
          console.error('XDragDrop: Error procesando archivo:', error);
          this.showError('Error al procesar el archivo: ' + error.message);
          
          if (this.config.onError) {
            this.config.onError(error);
          }
        });
    },

    // Procesar múltiples archivos
    processMultipleFiles: function(files) {
      console.log(`XDragDrop: Procesando ${files.length} archivos...`);
      
      if (this.config.autoCombine) {
        // Preguntar si combinar
        const shouldCombine = window.confirm(
          `Se detectaron ${files.length} archivos.\n\n` +
          `¿Deseas combinarlos en un solo diagrama?\n\n` +
          `• "Aceptar" = Un diagrama combinado\n` +
          `• "Cancelar" = Diagramas separados`
        );
        
        if (shouldCombine) {
          this.createCombinedDiagram(files);
        } else {
          this.createSeparateDiagrams(files);
        }
      } else {
        // Crear diagramas separados por defecto
        this.createSeparateDiagrams(files);
      }
    },

    // Crear diagrama combinado
    createCombinedDiagram: function(files) {
      console.log('XDragDrop: Creando diagrama combinado...');
      
      const combinedDiagramConfig = {
        name: `Combinado (${files.length} archivos)`,
        combineFiles: {
          enabled: true,
          fileNames: files.map(file => file.name.replace(/\.[^/.]+$/, "")),
          mergeStrategy: "append"
        }
      };
      
      if (window.initDiagram) {
        window.initDiagram(files, () => {
          console.log('XDragDrop: Diagrama combinado creado exitosamente');
          this.showSuccess(`Diagrama combinado creado con ${files.length} archivos`);
          
          if (this.config.onFilesCombined) {
            this.config.onFilesCombined(files, combinedDiagramConfig);
          }
        }, 0, combinedDiagramConfig);
      } else {
        this.showError('Sistema XDiagrams no disponible');
      }
    },

    // Crear diagramas separados
    createSeparateDiagrams: function(files) {
      console.log('XDragDrop: Creando diagramas separados...');
      
      Promise.allSettled(files.map(file => this.processFile(file)))
        .then(results => {
          const successful = results.filter(r => r.status === 'fulfilled').map(r => r.value);
          const failed = results
            .map((r, i) => r.status === 'rejected' ? { name: files[i].name, reason: r.reason && r.reason.message ? r.reason.message : r.reason } : null)
            .filter(Boolean);

          // Agregar los diagramas exitosos
          successful.forEach(diagram => {
            this.addAndLoadDiagram(diagram);
          });

          // Feedback
          if (failed.length > 0) {
            let msg = `${successful.length} diagramas agregados exitosamente\n${failed.length} fallaron:\n`;
            msg += failed.map(f => `- ${f.name}: ${f.reason}`).join('\n');
            this.showMixed(msg);
          } else {
            this.showSuccess(`${successful.length} diagramas agregados exitosamente`);
          }
        });
    },

    // Procesar archivo individual
    processFile: function(file) {
      const isCsv = file.name.toLowerCase().endsWith('.csv') || file.type === 'text/csv';
      return isCsv ? this.processCSVFile(file) : this.processJSONFile(file);
    },

    // Procesar archivo CSV (pública para compatibilidad con xdiagrams.js)
    processCSVFile: function(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
          try {
            const csvContent = e.target.result;
            
            if (typeof Papa === 'undefined') {
              reject(new Error('Papa Parse no está disponible'));
              return;
            }
            
            Papa.parse(csvContent, {
              header: true,
              skipEmptyLines: true,
              complete: function(results) {
                const fatalErrors = results.errors.filter(err => err.code !== 'TooFewFields');
                if (fatalErrors.length > 0) {
                  reject(new Error('Error parsing CSV: ' + fatalErrors[0].message));
                  return;
                }
                
                const diagram = {
                  name: file.name.replace('.csv', ''),
                  url: null,
                  data: results.data,
                  isLocal: true,
                  timestamp: new Date().toISOString()
                };
                
                resolve(diagram);
              },
              error: function(error) {
                reject(new Error('Error parsing CSV: ' + error.message));
              }
            });
          } catch (error) {
            reject(error);
          }
        };
        
        reader.onerror = function() {
          reject(new Error('Error reading file'));
        };
        
        reader.readAsText(file);
      });
    },

    // Procesar archivo JSON (pública para compatibilidad con xdiagrams.js)
    processJSONFile: function(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = function(e) {
          try {
            const jsonContent = e.target.result;
            let jsonData;
            
            try {
              jsonData = JSON.parse(jsonContent);
            } catch (parseErr) {
              return reject(new Error('Error parsing JSON: ' + parseErr.message));
            }

            // Convert JSON to internal array-of-objects format
            const dataArray = this.convertJsonToCsvFormat(jsonData);

            if (!Array.isArray(dataArray) || dataArray.length === 0) {
              return reject(new Error('JSON vacío o en formato no reconocido'));
            }

            // Create diagram object
            const diagram = {
              name: file.name.replace(/\.json$/i, ''),
              url: null,
              data: dataArray,
              isLocal: true,
              timestamp: new Date().toISOString()
            };

            resolve(diagram);
          } catch (error) {
            reject(error);
          }
        }.bind(this);

        reader.onerror = function() {
          reject(new Error('Error reading file'));
        };

        reader.readAsText(file);
      });
    },

    // Convertir JSON a formato CSV
    convertJsonToCsvFormat: function(jsonData) {
      console.log("XDragDrop: Convirtiendo JSON a formato CSV:", jsonData);
      
      let dataArray = [];
      
      // Case 1: Array of objects (most common)
      if (Array.isArray(jsonData)) {
        dataArray = jsonData;
      }
      // Case 2: Object with data property
      else if (jsonData && typeof jsonData === 'object' && jsonData.data && Array.isArray(jsonData.data)) {
        dataArray = jsonData.data;
      }
      // Case 3: Object with records property (Airtable-like)
      else if (jsonData && typeof jsonData === 'object' && jsonData.records && Array.isArray(jsonData.records)) {
        dataArray = jsonData.records.map(record => record.fields || record);
      }
      // Case 4: Single object (convert to array)
      else if (jsonData && typeof jsonData === 'object' && !Array.isArray(jsonData)) {
        dataArray = [jsonData];
      }
      else {
        console.warn("XDragDrop: Formato JSON no reconocido:", jsonData);
        return [];
      }
      
      console.log("XDragDrop: Datos convertidos:", dataArray.length, "registros");
      return dataArray;
    },

    // Agregar y cargar diagrama
    addAndLoadDiagram: function(diagram) {
      // Add to configuration if available
      if (window.$xDiagrams && window.$xDiagrams.diagrams) {
        window.$xDiagrams.diagrams.push(diagram);
      }
      
      // Save to localStorage if function available
      if (window.saveDiagramToStorage) {
        window.saveDiagramToStorage(diagram);
      }
      
      // Trigger hook if available
      if (window.$xDiagrams && window.$xDiagrams.hooks && window.$xDiagrams.hooks.onFileDrop) {
        window.$xDiagrams.hooks.onFileDrop(diagram);
      }
      
      // Load the diagram if function available
      if (window.initDiagram) {
        window.initDiagram(diagram, function() {
          console.log('XDragDrop: Diagrama cargado exitosamente');
        });
      }
    },

    // Mostrar mensaje de éxito
    showSuccess: function(message) {
      if (this.config.showToast && window.showToast) {
        window.showToast(message, 'success');
      } else {
        console.log('XDragDrop Success:', message);
      }
    },

    // Mostrar mensaje de error
    showError: function(message) {
      if (this.config.showToast && window.showToast) {
        window.showToast(message, 'error');
      } else {
        console.error('XDragDrop Error:', message);
      }
    },

    // Mostrar mensaje mixto
    showMixed: function(message) {
      if (this.config.showToast && window.showToast) {
        window.showToast(message, 'mixed');
      } else {
        console.warn('XDragDrop Mixed:', message);
      }
    },

    // Deshabilitar el plugin
    disable: function() {
      this.config.enabled = false;
      this.state.isInitialized = false;
      console.log('XDragDrop deshabilitado');
    },

    // Habilitar el plugin
    enable: function() {
      this.config.enabled = true;
      if (!this.state.isInitialized) {
        this.init();
      }
      console.log('XDragDrop habilitado');
    },

    // Obtener configuración actual
    getConfig: function() {
      return { ...this.config };
    },

    // Actualizar configuración
    updateConfig: function(newConfig) {
      this.config = { ...this.config, ...newConfig };
      console.log('XDragDrop: Configuración actualizada', this.config);
    },

    // Verificar si está activo
    isActive: function() {
      return this.state.isInitialized && this.config.enabled;
    },

    // Limpiar recursos
    destroy: function() {
      this.state.isInitialized = false;
      this.state.isDragging = false;
      this.config.enabled = false;
      console.log('XDragDrop destruido');
    }
  };

  // Auto-inicializar si se especifica
  if (window.XDragDropAutoInit !== false) {
    document.addEventListener('DOMContentLoaded', function() {
      window.XDragDrop.init();
    });
  }

  console.log('XDragDrop Plugin cargado');

})(); 