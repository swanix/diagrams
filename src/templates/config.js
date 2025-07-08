// Configuración de campos para el side panel
const SIDE_PANEL_CONFIG = {
  // Campos predefinidos que se mostrarán en el panel
  fields: [
    { key: 'id', label: 'ID', type: 'text' },
    { key: 'name', label: 'Nombre', type: 'text' },
    { key: 'subtitle', label: 'Subtítulo', type: 'text' },
    { key: 'type', label: 'Tipo', type: 'text' },
    { key: 'url', label: 'URL', type: 'url' },
    { key: 'img', label: 'Imagen', type: 'image' },
    { key: 'description', label: 'Descripción', type: 'text' },
    { key: 'status', label: 'Estado', type: 'status' },
    { key: 'priority', label: 'Prioridad', type: 'priority' },
    { key: 'created_date', label: 'Fecha de Creación', type: 'text' },
    { key: 'owner', label: 'Propietario', type: 'text' },
    { key: 'department', label: 'Departamento', type: 'text' },
  ],

  // Configuración de tipos de campos
  fieldTypes: {
    text: {
      render: (value) => value,
      cssClass: ''
    },
    url: {
      render: (value) => `<a class="side-panel-url" href="${value}" target="_blank">${value}</a>`,
      cssClass: 'side-panel-url'
    },
    image: {
      render: (value) => `<img class="side-panel-image" src="${value}" alt="Imagen"/>`,
      cssClass: 'side-panel-image'
    },
    status: {
      render: (value) => `<span class="status-${value.toLowerCase()}">${value}</span>`,
      cssClass: 'status-field'
    },
    priority: {
      render: (value) => `<span class="priority-${value.toLowerCase()}">${value}</span>`,
      cssClass: 'priority-field'
    },
    date: {
      render: (value) => formatDate(value),
      cssClass: 'date-field'
    },
    email: {
      render: (value) => `<a href="mailto:${value}">${value}</a>`,
      cssClass: 'email-field'
    }
  },

  // Configuración de secciones adicionales
  sections: {
    stats: {
      enabled: true,
      title: '📊 Estadísticas',
      template: 'stats-section-template'
    },
    actions: {
      enabled: true,
      title: '⚡ Acciones',
      template: 'actions-section-template'
    }
  },

  // Configuración de botones de acción
  actions: [
    { id: 'edit', label: 'Editar', icon: '✏️', action: 'editNode' },
    { id: 'delete', label: 'Eliminar', icon: '🗑️', action: 'deleteNode' },
    { id: 'duplicate', label: 'Duplicar', icon: '📋', action: 'duplicateNode' }
  ],

  // Array principal de variables del theme creator
  themeControls: [
    {
      label: 'Cluster fondo',
      var: '--cluster-bg',
      type: 'color-rgba', // Soporta transparencias
      default: 'rgba(0,0,0,0.2)'
    },
    {
      label: 'Cluster borde',
      var: '--cluster-stroke',
      type: 'color',
      default: '#222'
    }
  ]
};

// Función para formatear fechas
function formatDate(dateString) {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString;
    }
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    return dateString;
  }
}

// Exportar configuración
window.SIDE_PANEL_CONFIG = SIDE_PANEL_CONFIG; 