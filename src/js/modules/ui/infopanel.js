/**
 * XDiagrams Info Panel Module
 * Maneja la gestión del panel lateral de información y sus transformaciones
 */

const d3 = window.d3;

class XDiagramsInfoPanel {
  constructor(options = {}) {
    this.options = {
      panelId: 'side-panel',
      ...options,
    };
    this.isClosing = false;
    this.infoPanelElements = new Map();
    this.ensureStylesInjected();
    this.ensurePanel();
  }

  // ===== GESTIÓN DEL PANEL =====

  ensureStylesInjected() {
    if (document.getElementById('xdiagrams-infopanel-styles')) return;
    const style = document.createElement('style');
    style.id = 'xdiagrams-infopanel-styles';
    style.textContent = `
      .side-panel { 
        position: fixed; 
        top: 0; 
        right: 0; 
        width: 360px; 
        height: 100%;
        background: var(--ui-panel-bg); 
        color: var(--ui-panel-text); 
        box-shadow: var(--side-panel-shadow);
        z-index: 10050; 
        transform: translateX(100%); 
        transition: transform var(--transition-normal); 
      }
      .side-panel.open { transform: translateX(0); }
      
      .side-panel-header { 
        display: flex; 
        align-items: center; 
        justify-content: space-between;
        padding: 28px 20px 24px; 
        border-bottom: 1px solid var(--ui-panel-border); 
      }
      
      .side-panel-title { 
        margin: 0; 
        font-size: 18px; 
        font-weight: 600; 
        display: flex; 
        gap: 16px; 
        align-items: flex-start; 
        flex: 1;
        min-width: 0;
        position: relative;
      }
      

      
      .side-panel-title-content {
        display: flex;
        flex-direction: column;
        gap: 4px;
        flex: 1;
        min-width: 0;
      }
      
      .side-panel-title-text {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        flex: 1;
      }
      
      .side-panel-title-id {
        font-size: 11px;
        color: var(--ui-panel-text-muted);
        font-weight: normal;
        opacity: 0.8;
      }
      
      .side-panel-title-text {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        flex: 1;
      }
      
      .side-panel-title-thumbnail {
        width: 36px;
        height: 36px;
        object-fit: contain;
        flex-shrink: 0;
        border-radius: 8px;
        background: var(--ui-control-bg);
        border: 1px solid var(--ui-control-border);
        margin-left: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding-top: 2px;
      }
      
      .side-panel-title-thumbnail.embedded-thumbnail {
        background: transparent;
        border: none;
      }
      
      .side-panel-title-thumbnail.custom-image {
        border-radius: 6px;
      }
      
      .side-panel-title-thumbnail .detail:before {
        content: "\\e900";
        font-family: 'xdiagrams-icons';
      }
      
      .side-panel-title-thumbnail .document:before {
        content: "\\e901";
        font-family: 'xdiagrams-icons';
      }
      
      .side-panel-title-thumbnail .form:before {
        content: "\\e934";
        font-family: 'xdiagrams-icons';
      }
      
      .side-panel-title-thumbnail .grid:before {
        content: "\\e938";
        font-family: 'xdiagrams-icons';
      }
      
      .side-panel-title-thumbnail .home:before {
        content: "\\e939";
        font-family: 'xdiagrams-icons';
      }
      
      .side-panel-title-thumbnail .list:before {
        content: "\\e93b";
        font-family: 'xdiagrams-icons';
      }
      
      .side-panel-title-thumbnail .modal:before {
        content: "\\e93c";
        font-family: 'xdiagrams-icons';
      }
      
      .side-panel-title-thumbnail .profile:before {
        content: "\\e941";
        font-family: 'xdiagrams-icons';
      }
      
      .side-panel-title-thumbnail .report:before {
        content: "\\e942";
        font-family: 'xdiagrams-icons';
      }
      
      .side-panel-title-thumbnail .settings:before {
        content: "\\e943";
        font-family: 'xdiagrams-icons';
      }
      
      .side-panel-close { 
        cursor: pointer; 
        font-size: 24px; 
        line-height: 1; 
        opacity: .8; 
        color: var(--ui-panel-text);
        transition: opacity var(--transition-fast);
      }
      .side-panel-close:hover { opacity: 1; }
      
      .side-panel-id-tag { 
        padding: 6px 16px; 
        font-size: 12px; 
        opacity: .8; 
        color: var(--ui-panel-text-muted);
      }
      
      .side-panel-content { 
        padding: 20px 32px 28px; 
        overflow: auto; 
        height: calc(100% - 92px); 
      }
      
      .side-panel-fields-table { 
        display: grid; 
        grid-template-columns: 1fr; 
        gap: 10px; 
      }
      
      .side-panel-field { 
        display: grid; 
        grid-template-columns: 30% 70%; 
        gap: 8px; 
        align-items: start; 
      }
      
      .side-panel-label { 
        color: var(--ui-panel-text-muted); 
        font-size: 12px; 
      }
      
      .side-panel-value { 
        color: var(--ui-panel-text); 
        font-size: 12px; 
        word-break: break-word; 
      }
      
      .side-panel-value.empty { 
        opacity: .5; 
        font-style: italic; 
      }
      
      .side-panel-url-link {
        color: var(--ui-focus);
        text-decoration: none;
        transition: color var(--transition-fast);
      }
      
      .side-panel-url-link:hover {
        text-decoration: underline;
      }
    `;
    document.head.appendChild(style);
  }

  ensurePanel() {
    if (document.getElementById(this.options.panelId)) return;
    const panel = document.createElement('div');
    panel.className = 'side-panel';
    panel.id = this.options.panelId;
    panel.innerHTML = `
      <div class="side-panel-header">
        <h3 class="side-panel-title" id="side-panel-title">
          <span class="side-panel-title-thumbnail" id="side-panel-thumbnail"></span>
          <div class="side-panel-title-content">
            <span class="side-panel-title-text" id="side-panel-title-text">Detalles del Nodo</span>
            <span class="side-panel-title-id" id="side-panel-title-id"></span>
          </div>
        </h3>
        <span class="side-panel-close" id="side-panel-close" role="button" aria-label="Cerrar">×</span>
      </div>
      <div class="side-panel-content" id="side-panel-content"></div>
    `;
    document.body.appendChild(panel);

    panel.querySelector('#side-panel-close')?.addEventListener('click', () => this.close());
  }

  async open(nodeData, diagramConfig = {}) {
    this.ensurePanel();
    const panel = document.getElementById(this.options.panelId);
    const content = document.getElementById('side-panel-content');
    const titleEl = document.getElementById('side-panel-title-text');
    const titleIdEl = document.getElementById('side-panel-title-id');
    const thumbnailEl = document.getElementById('side-panel-thumbnail');
    
    if (!panel || !content || !titleEl || !titleIdEl || !thumbnailEl) return;

    // Buscar el valor de la columna Name en diferentes ubicaciones posibles
    const title = nodeData?.name || 
                  nodeData?.Name || 
                  (nodeData.data && nodeData.data.name) || 
                  (nodeData.data && nodeData.data.Name) || 
                  nodeData?.title || 
                  'Nodo';
    const nodeIdValue = nodeData?.id ?? 
                        nodeData?.ID ?? 
                        nodeData?.Node ?? 
                        (nodeData.data && nodeData.data.id) ?? 
                        (nodeData.data && nodeData.data.ID) ?? 
                        (nodeData.data && nodeData.data.Node) ?? 
                        '';
    
    console.log('[InfoPanel] nodeData:', JSON.stringify(nodeData, null, 2));

    // Actualizar título
    titleEl.textContent = String(title);
    
    // Actualizar ID en el header
    titleIdEl.textContent = nodeIdValue || '';
    

    
    // Crear thumbnail
    await this.createThumbnail(thumbnailEl, nodeData, diagramConfig);
    
    // Generar contenido
    content.innerHTML = await this.buildFieldsHtml(nodeData, diagramConfig);

    panel.classList.add('open');
    try { window.dispatchEvent(new CustomEvent('xdiagrams:infopanel:open')); } catch (_) {}
  }

  async createThumbnail(thumbnailEl, nodeData, diagramConfig = {}) {
    try {
      // Verificar si hay imagen en la columna img
      const imgVal = nodeData.img || (nodeData.data && nodeData.data.img) || "";
      
      // Si hay imagen personalizada, mostrarla
      if (imgVal && imgVal.trim() !== "") {
        thumbnailEl.innerHTML = `<img src="${imgVal}" class="custom-image" width="36" height="36" style="opacity: 1; transition: opacity 0.2s ease-in-out;" onerror="this.style.display='none'">`;
        return;
      }

      // Si no hay imagen personalizada, mostrar icono por defecto
      const defaultIcon = this.getDefaultIcon(nodeData, diagramConfig);
      thumbnailEl.innerHTML = defaultIcon;
      
    } catch (error) {
      console.error('[InfoPanel] Error creating thumbnail:', error);
      // Fallback: mostrar icono por defecto
      const defaultIcon = this.getDefaultIcon(nodeData, diagramConfig);
      thumbnailEl.innerHTML = defaultIcon;
    }
  }

  // Método simplificado para resolver imagen del nodo
  resolveNodeImage(nodeData) {
    return nodeData.img || (nodeData.data && nodeData.data.img) || "";
  }

  getDefaultIcon(nodeData, diagramConfig = {}) {
    try {
      // Intentar obtener el icono del nodo desde el diagrama
      const nodeIcon = this.getNodeIconFromDiagram(nodeData);
      if (nodeIcon) {
        return nodeIcon;
      }
      
      // Si no se encuentra, usar el icono por defecto de la configuración
      const defaultIconName = diagramConfig.defaultIcon || 'detail';
      
      // Usar la fuente de iconos xdiagrams-icons
      return `<span class="${defaultIconName}" style="display: flex; align-items: center; justify-content: center; font-family: 'xdiagrams-icons'; font-size: 18px; color: var(--ui-panel-text);"></span>`;
      
    } catch (error) {
      console.error('[InfoPanel] Error creating default icon:', error);
      return `<span style="display: flex; align-items: center; justify-content: center; font-size: 14px; color: var(--ui-panel-text-muted);">📄</span>`;
    }
  }

  getNodeIconFromDiagram(nodeData) {
    try {
      // Obtener el icono directamente de los datos del nodo
      const iconName = nodeData.icon || nodeData.Icon || (nodeData.data && nodeData.data.icon) || (nodeData.data && nodeData.data.Icon);
      
      if (iconName) {
        // Si hay un icono definido, usar la fuente de iconos
        const iconUnicode = this.getIconUnicode(iconName);
        return `<span style="display: flex; align-items: center; justify-content: center; font-family: 'xdiagrams-icons'; font-size: 18px; color: var(--ui-panel-text);">${iconUnicode}</span>`;
      }

      return null;
    } catch (error) {
      console.error('[InfoPanel] Error getting node icon from diagram:', error);
      return null;
    }
  }

  getIconUnicode(iconName) {
    // Mapeo de iconos a códigos Unicode (igual que en icon-manager.js)
    const iconUnicodeMap = {
      'detail': '\ue900',
      'list': '\ue93b',
      'grid': '\ue938',
      'form': '\ue934',
      'document': '\ue901',
      'modal': '\ue93c',
      'report': '\ue942',
      'profile': '\ue941',
      'home': '\ue939',
      'settings': '\ue943'
    };
    
    const normalizedName = this.normalizeIconName(iconName);
    return iconUnicodeMap[normalizedName] || iconUnicodeMap['detail'];
  }

  normalizeIconName(iconName) {
    if (!iconName || typeof iconName !== 'string') return '';
    
    let normalized = iconName
      .toLowerCase()
      .trim();
    
    // Aplicar normalización estándar
    normalized = normalized
      .replace(/\s+/g, '-')  // Reemplazar espacios múltiples con un solo guión
      .replace(/[^a-z0-9-]/g, '-')  // Reemplazar caracteres especiales con guiones
      .replace(/-+/g, '-')  // Reemplazar múltiples guiones consecutivos con uno solo
      .replace(/^-|-$/g, '');  // Remover guiones al inicio y final
    
    return normalized;
  }

  close() {
    // Evitar recursión durante el cierre
    this.isClosing = true;

    const panel = document.getElementById(this.options.panelId);
    panel?.classList.remove('open');

    // Si hay un nodo seleccionado, salir del modo de navegación de nodos
    const selectedNode = d3.select('.node-selected');
    if (!selectedNode.empty() && window.$xDiagrams?.navigation) {
      try {
        window.$xDiagrams.navigation.exitNodeNavigationMode(true);
      } catch (_) {}
    }

    // Notificar cierre
    try { window.dispatchEvent(new CustomEvent('xdiagrams:infopanel:close')); } catch (_) {}

    // Resetear flag después de un delay
    setTimeout(() => {
      this.isClosing = false;
    }, 300);
  }

  async buildFieldsHtml(nodeData, diagramConfig = {}) {
    try {
      const fields = [];
      const data = nodeData.data || nodeData;
      
      // Obtener configuración de columnas
      const showAllColumns = diagramConfig.showAllColumns !== false;
      const hideEmptyColumns = diagramConfig.hideEmptyColumns === true;
      
      // Procesar cada campo
      for (const [key, value] of Object.entries(data)) {
        // Saltar campos internos
        if (key.startsWith('_') || key === 'children' || key === 'parent' || key === 'Parent') continue;
        
        // Si hideEmptyColumns está activado, saltar campos vacíos
        if (hideEmptyColumns && (!value || value.toString().trim() === '')) continue;
        
        // Ocultar campos que ya se muestran en el header o son internos del diagrama
        const headerFields = ['name', 'Name'];
        const idFields = ['id', 'ID', 'Node'];
        const internalFields = ['parent', 'Parent', 'img', 'Img'];
        if (headerFields.includes(key) || idFields.includes(key) || internalFields.includes(key)) continue;
        
        // Si showAllColumns está desactivado, solo mostrar campos específicos
        if (!showAllColumns) {
          const allowedFields = ['title', 'description', 'desc', 'url', 'link'];
          if (!allowedFields.includes(key.toLowerCase())) continue;
        }
        
        const displayValue = this.formatValue(value);
        const isUrl = this.isUrl(value);
        
        fields.push({
          label: key.charAt(0).toUpperCase() + key.slice(1),
          value: value,
          displayValue: displayValue,
          isUrl: isUrl,
          labelTitle: `Campo: ${key}`,
          valueTitle: isUrl ? `Abrir: ${value}` : undefined
        });
      }
      
      if (fields.length === 0) {
        return '<div class="side-panel-field"><div class="side-panel-value empty">No hay información disponible</div></div>';
      }
      
      let html = '<div class="side-panel-fields-table">';
      
      fields.forEach(field => {
        html += `
          <div class="side-panel-field">
            <div class="side-panel-label" ${field.labelTitle ? `data-tooltip="${field.labelTitle}"` : ''}>${field.label}</div>
            <div class="side-panel-value ${!field.value ? 'empty' : ''}" ${field.valueTitle ? `data-tooltip="${field.valueTitle}"` : ''}>
              ${field.isUrl ? 
                `<a href="${field.value}" target="_blank" rel="noreferrer" class="side-panel-url-link">${field.displayValue}</a>` : 
                field.displayValue
              }
            </div>
          </div>
        `;
      });
      
      html += '</div>';
      return html;
      
    } catch (error) {
      console.error('[InfoPanel] Error building fields HTML:', error);
      return '<div class="side-panel-field"><div class="side-panel-value empty">Error al cargar información</div></div>';
    }
  }

  formatValue(value) {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return this.escapeHtml(value);
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'boolean') return value ? 'Sí' : 'No';
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  }

  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  isUrl(value) {
    if (typeof value !== 'string') return false;
    try {
      const url = new URL(value);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  }

  // ===== MÉTODOS DE COMPATIBILIDAD =====

  updateInfoPanel(transform) {
    // Método de compatibilidad con el sistema anterior
    console.warn('[InfoPanel] updateInfoPanel is deprecated, use open() instead');
  }

  getInfoPanelData() {
    // Método de compatibilidad
    return {};
  }

  clearInfoPanel() {
    // Método de compatibilidad
    this.close();
  }

  setInfoPanelValue(id, value) {
    // Método de compatibilidad
    console.warn('[InfoPanel] setInfoPanelValue is deprecated');
  }

  getInfoPanelElement(id) {
    // Método de compatibilidad
    return document.getElementById(id);
  }
}

export { XDiagramsInfoPanel }; 