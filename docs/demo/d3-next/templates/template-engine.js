// Motor de plantillas simple
class TemplateEngine {
  constructor() {
    this.templates = new Map();
    this.loadTemplates();
  }

  // Cargar plantillas desde archivos HTML
  async loadTemplates() {
    try {
      const response = await fetch('/src/templates/side-panel.html');
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // Extraer todas las plantillas
      doc.querySelectorAll('template').forEach(template => {
        this.templates.set(template.id, template.innerHTML);
      });
    } catch (error) {
      console.warn('No se pudieron cargar las plantillas externas, usando plantillas por defecto');
      this.loadDefaultTemplates();
    }
  }

  // Plantillas por defecto (fallback)
  loadDefaultTemplates() {
    this.templates.set('side-panel-template', `
      <div class="side-panel" id="side-panel">
        <div class="side-panel-header">
          <h3 class="side-panel-title">Detalles del Nodo</h3>
          <div class="side-panel-actions">
            <button class="side-panel-action-btn" title="Editar nodo" data-action="edit">✏️</button>
            <button class="side-panel-action-btn" title="Eliminar nodo" data-action="delete">🗑️</button>
            <button class="side-panel-close" onclick="closeSidePanel()">×</button>
          </div>
        </div>
        <div class="side-panel-content" id="side-panel-content">
          <!-- El contenido se llenará dinámicamente -->
        </div>
      </div>
    `);

    this.templates.set('field-template', `
      <div class="side-panel-field">
        <div class="side-panel-label">{{label}}</div>
        <div class="side-panel-value">{{value}}</div>
      </div>
    `);

    this.templates.set('stats-section-template', `
      <div class="side-panel-section">
        <h4 class="side-panel-section-title">📊 Estadísticas</h4>
        <div class="side-panel-stats">
          <div class="stat-item">
            <span class="stat-label">Hijos:</span>
            <span class="stat-value">{{childrenCount}}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Nivel:</span>
            <span class="stat-value">{{level}}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Tipo:</span>
            <span class="stat-value">{{type}}</span>
          </div>
        </div>
      </div>
    `);

    this.templates.set('subnode-link-template', `
      <a href="#" class="subnode-link" data-node-id="{{nodeId}}">{{nodeName}}</a>
    `);
  }

  // Renderizar plantilla con datos
  render(templateName, data = {}) {
    let template = this.templates.get(templateName);
    
    if (!template) {
      console.error(`Plantilla '${templateName}' no encontrada`);
      return '';
    }

    // Reemplazar variables {{variable}} con datos
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key] !== undefined ? data[key] : match;
    });
  }

  // Renderizar plantilla con datos complejos (arrays, objetos)
  renderComplex(templateName, data = {}) {
    let template = this.templates.get(templateName);
    
    if (!template) {
      console.error(`Plantilla '${templateName}' no encontrada`);
      return '';
    }

    // Reemplazar variables {{variable}} con datos
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      const value = this.getNestedValue(data, key);
      return value !== undefined ? value : match;
    });
  }

  // Obtener valor anidado (ej: "user.name")
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }
}

// Instancia global del motor de plantillas
window.templateEngine = new TemplateEngine(); 