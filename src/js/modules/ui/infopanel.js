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
    this.thumbsSystem = options.thumbsSystem || null;
    this.ensureStylesInjected();
    this.ensurePanel();
  }

  // ===== GESTIÓN DEL PANEL =====

  ensureStylesInjected() {
    // Los estilos ahora están en el CSS principal
    // No necesitamos inyectar estilos dinámicamente
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
      </div>
      <div class="side-panel-url-section" id="side-panel-url-section" style="display: none;">
        <div class="side-panel-url-input-container">
          <input type="text" class="side-panel-url-input" id="side-panel-url-input" placeholder="URL del nodo" readonly>
          <button class="side-panel-url-button" id="side-panel-url-button" type="button">
            <svg class="side-panel-url-button-icon" width="14" height="14" viewBox="0 0 640 640" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M384 64C366.3 64 352 78.3 352 96C352 113.7 366.3 128 384 128L466.7 128L265.3 329.4C252.8 341.9 252.8 362.2 265.3 374.7C277.8 387.2 298.1 387.2 310.6 374.7L512 173.3L512 256C512 273.7 526.3 288 544 288C561.7 288 576 273.7 576 256L576 96C576 78.3 561.7 64 544 64L384 64zM144 160C99.8 160 64 195.8 64 240L64 496C64 540.2 99.8 576 144 576L400 576C444.2 576 480 540.2 480 496L480 416C480 398.3 465.7 384 448 384C430.3 384 416 398.3 416 416L416 496C416 504.8 408.8 512 400 512L144 512C135.2 512 128 504.8 128 496L128 240C128 231.2 135.2 224 144 224L224 224C241.7 224 256 209.7 256 192C256 174.3 241.7 160 224 160L144 160z"/>
            </svg>
          </button>
        </div>
      </div>
      <div class="side-panel-content" id="side-panel-content"></div>
      <button class="side-panel-collapse-btn" id="side-panel-collapse-btn" type="button" aria-label="Colapsar panel"></button>
    `;
    document.body.appendChild(panel);

    panel.querySelector('#side-panel-collapse-btn')?.addEventListener('click', () => this.close());
  }

  async open(nodeData, diagramConfig = {}) {
    this.ensurePanel();
    const panel = document.getElementById(this.options.panelId);
    const content = document.getElementById('side-panel-content');
    const titleEl = document.getElementById('side-panel-title-text');
    const titleIdEl = document.getElementById('side-panel-title-id');
    const thumbnailEl = document.getElementById('side-panel-thumbnail');
    const urlSection = document.getElementById('side-panel-url-section');
    const urlInput = document.getElementById('side-panel-url-input');
    const urlButton = document.getElementById('side-panel-url-button');
    
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
    
    // Actualizar título
    titleEl.textContent = String(title);
    
    // Actualizar ID en el header
    titleIdEl.textContent = nodeIdValue || '';
    
          // Manejar URL
      const url = this.findUrl(nodeData);
      if (url && urlSection && urlInput) {
        urlInput.value = url;
      urlSection.style.display = 'block';
      
      // Configurar evento del botón
      if (urlButton) {
        urlButton.onclick = () => {
          window.open(url, '_blank', 'noopener,noreferrer');
        };
      }
    } else if (urlSection) {
      urlSection.style.display = 'none';
    }
    
    // Crear thumbnail
    await this.createThumbnail(thumbnailEl, nodeData, diagramConfig);
    
    // Generar contenido
    content.innerHTML = await this.buildFieldsHtml(nodeData, diagramConfig);

    panel.classList.add('open');
    try { window.dispatchEvent(new CustomEvent('xdiagrams:infopanel:open')); } catch (_) {}
  }

  async createThumbnail(thumbnailEl, nodeData, diagramConfig = {}) {
    try {
      // Usar el sistema de thumbs que se pasó al constructor
      let thumbnailResolver = null;
      
      // Intentar obtener el resolver desde el sistema de thumbs
      if (this.thumbsSystem && this.thumbsSystem.resolverInstance) {
        thumbnailResolver = this.thumbsSystem.resolverInstance;
      } else {
        // Fallback: buscar en el contexto global
        if (window.xDiagramsLoader && window.xDiagramsLoader.instance && window.xDiagramsLoader.instance.thumbs) {
          thumbnailResolver = window.xDiagramsLoader.instance.thumbs.resolverInstance;
        } else if (window.XDiagrams && window.XDiagrams.instance && window.XDiagrams.instance.thumbs) {
          thumbnailResolver = window.XDiagrams.instance.thumbs.resolverInstance;
        }
      }
      
      if (thumbnailResolver) {
        // Usar el resolver para obtener el thumbnail
        const thumbnail = thumbnailResolver.resolveThumbnail(nodeData);
        
        if (thumbnail.type === 'external-image') {
          // Mostrar imagen externa
          thumbnailEl.innerHTML = `<img src="${thumbnail.value}" class="custom-image" width="36" height="36" style="opacity: 1; transition: opacity 0.2s ease-in-out;" onerror="this.style.display='none'">`;
          return;
        } else if (thumbnail.type === 'custom-icon') {
          // Mostrar icono personalizado
          const iconUnicode = this.getIconUnicode(thumbnail.value);
          thumbnailEl.innerHTML = `<span style="display: flex; align-items: center; justify-content: center; font-family: 'xdiagrams-icons'; font-size: 18px; color: var(--ui-panel-text);">${iconUnicode}</span>`;
          return;
        }
      }
      
      // Fallback: usar la lógica anterior si no se encuentra el resolver
      const imgVal = nodeData.img || (nodeData.data && nodeData.data.img) || "";
      
      // Si hay imagen personalizada, mostrarla
      if (imgVal && imgVal.trim() !== "") {
        thumbnailEl.innerHTML = `<img src="${imgVal}" class="custom-image" width="36" height="36" style="opacity: 1; transition: opacity 0.2s ease-in-out;" onerror="this.style.display='none'">`;
        return;
      }

      // Obtener el ícono del nodo usando la fuente de íconos
      const iconElement = this.getNodeIconFromDiagram(nodeData);
      if (iconElement) {
        thumbnailEl.innerHTML = iconElement;
        return;
      }

      // Si no se encuentra ícono específico, usar ícono por defecto de la configuración
      const defaultIconName = diagramConfig.defaultIcon || 'detail';
      const iconUnicode = this.getIconUnicode(defaultIconName);
      thumbnailEl.innerHTML = `<span style="display: flex; align-items: center; justify-content: center; font-family: 'xdiagrams-icons'; font-size: 18px; color: var(--ui-panel-text);">${iconUnicode}</span>`;
      
    } catch (error) {
      console.error('[InfoPanel] Error creating thumbnail:', error);
      // Fallback: mostrar ícono por defecto
      const iconUnicode = this.getIconUnicode('detail');
      thumbnailEl.innerHTML = `<span style="display: flex; align-items: center; justify-content: center; font-family: 'xdiagrams-icons'; font-size: 18px; color: var(--ui-panel-text);">${iconUnicode}</span>`;
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
      // Buscar el ícono en diferentes ubicaciones posibles
      const iconName = nodeData.icon || 
                      nodeData.Icon || 
                      nodeData.type ||
                      nodeData.Type ||
                      (nodeData.data && nodeData.data.icon) || 
                      (nodeData.data && nodeData.data.Icon) ||
                      (nodeData.data && nodeData.data.type) ||
                      (nodeData.data && nodeData.data.Type);
      
      if (iconName) {
        // Si hay un ícono definido, usar la fuente de íconos
        const iconUnicode = this.getIconUnicode(iconName);
        return `<span style="display: flex; align-items: center; justify-content: center; font-family: 'xdiagrams-icons'; font-size: 18px; color: var(--ui-panel-text);">${iconUnicode}</span>`;
      }

      // Si no hay ícono específico, intentar inferir basado en el nombre o tipo
      const nodeName = nodeData.name || nodeData.Name || (nodeData.data && nodeData.data.name) || (nodeData.data && nodeData.data.Name) || '';
      const inferredIcon = this.inferIconFromName(nodeName);
      if (inferredIcon) {
        const iconUnicode = this.getIconUnicode(inferredIcon);
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

  inferIconFromName(nodeName) {
    if (!nodeName || typeof nodeName !== 'string') return null;
    
    const name = nodeName.toLowerCase();
    
    // Mapeo de palabras clave a íconos
    const iconMappings = {
      // Formularios y entradas
      'form': 'form',
      'formulario': 'form',
      'input': 'form',
      'entrada': 'form',
      
      // Documentos y archivos
      'document': 'document',
      'documento': 'document',
      'file': 'document',
      'archivo': 'document',
      'pdf': 'document',
      'report': 'report',
      'reporte': 'report',
      
      // Listas y tablas
      'list': 'list',
      'lista': 'list',
      'table': 'list',
      'tabla': 'list',
      'grid': 'grid',
      'cuadricula': 'grid',
      
      // Navegación
      'home': 'home',
      'inicio': 'home',
      'dashboard': 'home',
      'panel': 'home',
      
      // Usuarios y perfiles
      'profile': 'profile',
      'perfil': 'profile',
      'user': 'profile',
      'usuario': 'profile',
      
      // Configuración
      'settings': 'settings',
      'configuracion': 'settings',
      'config': 'settings',
      'ajustes': 'settings',
      
      // Modales y ventanas
      'modal': 'modal',
      'popup': 'modal',
      'ventana': 'modal',
      'dialog': 'modal',
      
      // Detalles y información
      'detail': 'detail',
      'detalle': 'detail',
      'info': 'detail',
      'informacion': 'detail'
    };
    
    // Buscar coincidencias en el nombre
    for (const [keyword, icon] of Object.entries(iconMappings)) {
      if (name.includes(keyword)) {
        return icon;
      }
    }
    
    return null;
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
        const urlFields = ['url', 'URL', 'Url']; // Solo la columna URL específica
        
        // Verificar si es la columna URL específica
        const isUrlField = urlFields.includes(key);
        
        if (headerFields.includes(key) || idFields.includes(key) || internalFields.includes(key) || isUrlField) {
          continue;
        }
        
        // Si showAllColumns está desactivado, solo mostrar campos específicos
        if (!showAllColumns) {
          const allowedFields = ['title', 'description', 'desc'];
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

  findUrl(nodeData) {
    const data = nodeData.data || nodeData;
    
    // Solo buscar en la columna específica "URL" (case-insensitive)
    const urlValue = data['url'] || data['URL'] || data['Url'];
    
    if (urlValue && this.isUrl(urlValue)) {
      return urlValue;
    }
    
    return null;
  }

  // ===== MÉTODOS DE COMPATIBILIDAD =====

  updateInfoPanel(transform) {
    // Método de compatibilidad con el sistema anterior
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