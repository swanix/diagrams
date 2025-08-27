/**
 * XDiagrams LLM Data Generator Module
 * Genera automáticamente un archivo llms.txt desde los datos del CSV
 * y lo almacena en localStorage para uso con motores de IA
 */

class XDiagramsLLMDataGenerator {
  constructor() {
    this.storageKey = 'xdiagrams_llm_data';
    this.lastUpdateKey = 'xdiagrams_llm_last_update';
    this.updateInterval = 5 * 60 * 1000; // 5 minutos
  }

  /**
   * Inicializa el generador de datos LLM
   * @param {Array} csvData - Datos del CSV
   * @param {Object} config - Configuración del diagrama
   */
  async initialize(data, config) {
    // Verificar si los datos LLM ya están actualizados
    const lastUpdate = localStorage.getItem('xdiagrams_llm_last_update');
    const now = Date.now();
    const timeSinceLastUpdate = now - (lastUpdate ? parseInt(lastUpdate) : 0);
    
    // Si los datos se actualizaron hace menos de 1 hora, usar caché
    if (lastUpdate && timeSinceLastUpdate < 3600000) {
      return;
    }
    
    try {
      // Generar datos LLM
      const llmData = this.generateLLMData(data, config);
      
      // Almacenar en localStorage
      localStorage.setItem('xdiagrams_llm_data', JSON.stringify(llmData));
      localStorage.setItem('xdiagrams_llm_last_update', now.toString());
      
    } catch (error) {
      console.error('[LLMDataGenerator] Error generando datos LLM:', error);
    }
  }

  /**
   * Verifica si los datos necesitan ser actualizados
   */
  shouldUpdateData() {
    const lastUpdate = localStorage.getItem(this.lastUpdateKey);
    if (!lastUpdate) return true;
    
    const timeSinceUpdate = Date.now() - parseInt(lastUpdate);
    return timeSinceUpdate > this.updateInterval;
  }

  /**
   * Genera los datos LLM desde el CSV
   * @param {Array} csvData - Datos del CSV
   * @param {Object} config - Configuración del diagrama
   */
  async generateLLMData(csvData, config = {}) {
    try {
      console.log('[LLMDataGenerator] Generando datos LLM...');
      
      const llmData = {
        metadata: {
          generatedAt: new Date().toISOString(),
          totalNodes: csvData.length,
          diagramTitle: config.title || 'Diagrama',
          dataSource: 'CSV',
          version: '1.0'
        },
        nodes: this.processNodes(csvData),
        clusters: this.identifyClusters(csvData),
        relationships: this.extractRelationships(csvData),
        summary: this.generateSummary(csvData, config)
      };

      // Generar texto plano para LLMs
      const llmText = this.generateLLMText(llmData);
      
      // Almacenar en localStorage
      this.storeData(llmData, llmText);
      
      console.log('[LLMDataGenerator] Datos LLM generados y almacenados exitosamente');
      
    } catch (error) {
      console.error('[LLMDataGenerator] Error generando datos LLM:', error);
    }
  }

  /**
   * Procesa los nodos del CSV
   * @param {Array} csvData - Datos del CSV
   */
  processNodes(csvData) {
    return csvData.map((row, index) => {
      const node = {
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
        // Incluir todos los campos adicionales
        ...this.extractAdditionalFields(row)
      };

      return node;
    });
  }

  /**
   * Extrae campos adicionales del CSV
   * @param {Object} row - Fila del CSV
   */
  extractAdditionalFields(row) {
    const additionalFields = {};
    const excludeFields = ['id', 'Id', 'Node', 'name', 'Name', 'title', 'type', 'Type', 
                          'icon', 'Icon', 'parent', 'Parent', 'img', 'Img', 'description', 
                          'Description', 'category', 'Category', 'status', 'Status', 
                          'priority', 'Priority', 'tags', 'Tags', 'url', 'Url', 'link', 
                          'Link', 'notes', 'Notes'];
    
    Object.keys(row).forEach(key => {
      if (!excludeFields.includes(key) && row[key] !== undefined && row[key] !== '') {
        additionalFields[key] = row[key];
      }
    });
    
    return additionalFields;
  }

  /**
   * Identifica clusters basados en la estructura jerárquica
   * @param {Array} csvData - Datos del CSV
   */
  identifyClusters(csvData) {
    const clusters = {};
    
    csvData.forEach(row => {
      const parentId = row.parent || row.Parent;
      if (parentId) {
        if (!clusters[parentId]) {
          clusters[parentId] = {
            id: parentId,
            name: this.findParentName(csvData, parentId),
            children: [],
            childCount: 0
          };
        }
        clusters[parentId].children.push(row.id || row.Id || row.Node);
        clusters[parentId].childCount++;
      }
    });
    
    return Object.values(clusters);
  }

  /**
   * Encuentra el nombre del padre
   * @param {Array} csvData - Datos del CSV
   * @param {string} parentId - ID del padre
   */
  findParentName(csvData, parentId) {
    const parent = csvData.find(row => 
      (row.id || row.Id || row.Node) === parentId
    );
    return parent ? (parent.name || parent.Name || parent.title || parentId) : parentId;
  }

  /**
   * Extrae relaciones entre nodos
   * @param {Array} csvData - Datos del CSV
   */
  extractRelationships(csvData) {
    const relationships = [];
    
    csvData.forEach(row => {
      const parentId = row.parent || row.Parent;
      const nodeId = row.id || row.Id || row.Node;
      
      if (parentId && nodeId) {
        relationships.push({
          from: parentId,
          to: nodeId,
          type: 'parent-child',
          relationship: 'hierarchy'
        });
      }
    });
    
    return relationships;
  }

  /**
   * Genera un resumen del diagrama
   * @param {Array} csvData - Datos del CSV
   * @param {Object} config - Configuración del diagrama
   */
  generateSummary(csvData, config) {
    const totalNodes = csvData.length;
    const nodesWithParents = csvData.filter(row => row.parent || row.Parent).length;
    const rootNodes = totalNodes - nodesWithParents;
    
    const categories = {};
    const types = {};
    const statuses = {};
    
    csvData.forEach(row => {
      const category = row.category || row.Category || 'Sin categoría';
      const type = row.type || row.Type || 'default';
      const status = row.status || row.Status || 'active';
      
      categories[category] = (categories[category] || 0) + 1;
      types[type] = (types[type] || 0) + 1;
      statuses[status] = (statuses[status] || 0) + 1;
    });
    
    return {
      totalNodes,
      rootNodes,
      childNodes: nodesWithParents,
      categories: Object.keys(categories).length,
      types: Object.keys(types).length,
      statuses: Object.keys(statuses).length,
      topCategories: Object.entries(categories)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([name, count]) => ({ name, count })),
      topTypes: Object.entries(types)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }))
    };
  }

  /**
   * Genera texto plano para LLMs
   * @param {Object} llmData - Datos estructurados
   */
  generateLLMText(llmData) {
    let text = `# ${llmData.metadata.diagramTitle}\n\n`;
    text += `## Resumen del Diagrama\n`;
    text += `- Total de nodos: ${llmData.summary.totalNodes}\n`;
    text += `- Nodos raíz: ${llmData.summary.rootNodes}\n`;
    text += `- Nodos hijos: ${llmData.summary.childNodes}\n`;
    text += `- Categorías: ${llmData.summary.categories}\n`;
    text += `- Tipos: ${llmData.summary.types}\n\n`;
    
    text += `## Categorías Principales\n`;
    llmData.summary.topCategories.forEach(cat => {
      text += `- ${cat.name}: ${cat.count} nodos\n`;
    });
    text += `\n`;
    
    text += `## Tipos Principales\n`;
    llmData.summary.topTypes.forEach(type => {
      text += `- ${type.name}: ${type.count} nodos\n`;
    });
    text += `\n`;
    
    text += `## Clusters y Jerarquías\n`;
    llmData.clusters.forEach(cluster => {
      text += `### Cluster: ${cluster.name} (ID: ${cluster.id})\n`;
      text += `- Nodos hijos: ${cluster.childCount}\n`;
      text += `- IDs de hijos: ${cluster.children.join(', ')}\n\n`;
    });
    
    text += `## Nodos Detallados\n`;
    llmData.nodes.forEach(node => {
      text += `### ${node.name} (ID: ${node.id})\n`;
      text += `- Tipo: ${node.type}\n`;
      text += `- Icono: ${node.icon}\n`;
      if (node.parent) text += `- Padre: ${node.parent}\n`;
      if (node.description) text += `- Descripción: ${node.description}\n`;
      if (node.category) text += `- Categoría: ${node.category}\n`;
      if (node.status) text += `- Estado: ${node.status}\n`;
      if (node.priority) text += `- Prioridad: ${node.priority}\n`;
      if (node.tags) text += `- Etiquetas: ${node.tags}\n`;
      if (node.url) text += `- URL: ${node.url}\n`;
      if (node.notes) text += `- Notas: ${node.notes}\n`;
      
      // Campos adicionales
      Object.keys(node).forEach(key => {
        if (!['id', 'name', 'type', 'icon', 'parent', 'img', 'description', 
              'category', 'status', 'priority', 'tags', 'url', 'notes'].includes(key)) {
          text += `- ${key}: ${node[key]}\n`;
        }
      });
      text += `\n`;
    });
    
    text += `## Relaciones\n`;
    llmData.relationships.forEach(rel => {
      text += `- ${rel.from} → ${rel.to} (${rel.type})\n`;
    });
    
    text += `\n---\n`;
    text += `Generado automáticamente el ${llmData.metadata.generatedAt}\n`;
    text += `Fuente: ${llmData.metadata.dataSource}\n`;
    
    return text;
  }

  /**
   * Almacena los datos en localStorage
   * @param {Object} llmData - Datos estructurados
   * @param {string} llmText - Texto plano para LLMs
   */
  storeData(llmData, llmText) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(llmData));
      localStorage.setItem(`${this.storageKey}_text`, llmText);
      localStorage.setItem(this.lastUpdateKey, Date.now().toString());
      
      console.log('[LLMDataGenerator] Datos almacenados en localStorage');
    } catch (error) {
      console.error('[LLMDataGenerator] Error almacenando datos:', error);
    }
  }

  /**
   * Obtiene los datos LLM almacenados
   */
  getStoredData() {
    try {
      const data = localStorage.getItem(this.storageKey);
      const text = localStorage.getItem(`${this.storageKey}_text`);
      
      if (data && text) {
        return {
          structured: JSON.parse(data),
          text: text
        };
      }
      
      return null;
    } catch (error) {
      console.error('[LLMDataGenerator] Error obteniendo datos almacenados:', error);
      return null;
    }
  }

  /**
   * Programa actualización en segundo plano
   * @param {Array} csvData - Datos del CSV
   * @param {Object} config - Configuración del diagrama
   */
  scheduleBackgroundUpdate(csvData, config) {
    // Actualizar cada 5 minutos
    setInterval(() => {
      if (this.shouldUpdateData()) {
        console.log('[LLMDataGenerator] Actualización en segundo plano...');
        this.generateLLMData(csvData, config);
      }
    }, this.updateInterval);
  }

  /**
   * Limpia los datos almacenados
   */
  clearStoredData() {
    try {
      localStorage.removeItem(this.storageKey);
      localStorage.removeItem(`${this.storageKey}_text`);
      localStorage.removeItem(this.lastUpdateKey);
      console.log('[LLMDataGenerator] Datos limpiados de localStorage');
    } catch (error) {
      console.error('[LLMDataGenerator] Error limpiando datos:', error);
    }
  }

  /**
   * Exporta los datos como archivo descargable
   */
  exportLLMFile() {
    try {
      const storedData = this.getStoredData();
      if (!storedData) {
        console.warn('[LLMDataGenerator] No hay datos para exportar');
        return;
      }

      const blob = new Blob([storedData.text], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'context.md';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      console.log('[LLMDataGenerator] Archivo context.md exportado');
    } catch (error) {
      console.error('[LLMDataGenerator] Error exportando archivo:', error);
    }
  }
}

export { XDiagramsLLMDataGenerator };
