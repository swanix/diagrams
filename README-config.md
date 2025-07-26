# Swanix Diagrams 
## Configuration

## Basic Configuration
- `title`: Application title (e.g., "Swanix Diagrams")
- `name`: Application name (e.g., "Swanix XDiagrams")
- `version`: Current software version (e.g., "0.3.1")

```javascript
window.$xDiagrams = {
  title: "Swanix Diagrams",
  name: "Swanix XDiagrams",
  version: "0.3.1"
};
```

## Themes
Configuration of available visual themes:
- `themes.light`: Light theme (value: "snow")
- `themes.dark`: Dark theme (value: "onyx")
- `themes.default`: Default theme (value: "snow")

```javascript
window.$xDiagrams = {
  themes: {
    light: "snow",
    dark: "onyx",
    default: "snow"
  }
};
```

## Column Mapping
Configuration of correspondence between CSV columns and properties:
- `columns.id`: Unique node identifier (maps to: "Node")
- `columns.name`: Node name (maps to: "Name")
- `columns.subtitle`: Description or subtitle (maps to: "Description")
- `columns.parent`: Parent node for hierarchical relationships (maps to: "Parent")
- `columns.img`: Image/icon identifier (maps to: "thumbnail")
- `columns.url`: Associated links (maps to: "URL")
- `columns.type`: Node type (maps to: "Type")

```javascript
window.$xDiagrams = {
  columns: {
    id: "Node",
    name: "Name",
    subtitle: "Description",
    parent: "Parent",
    img: "thumbnail",
    url: "URL",
    type: "Type"
  }
};
```

## Diagrams
List of available diagrams, each with:
- `name`: Diagram name
- `file`: CSV data source URL or local file path
- `edit`: (Optional) Edit URL for Google Sheets diagrams

```javascript
window.$xDiagrams = {
  diagrams: [
    {
      name: "Site Map Basic",
      file: "https://docs.google.com/spreadsheets/d/e/.../pub?output=csv",
      edit: "https://docs.google.com/spreadsheets/d/.../edit?gid=0#gid=0"
    },
    {
      name: "Simple Tree",
      file: "data/tree-simple.csv"
    },
    {
      name: "Multi-Clusters",
      file: "data/test-multiclusters.csv"
    }
  ]
};
```

## Advanced Options
- `options.autoZoom`: Automatic zoom adjustment (true/false) - Controls whether the diagram automatically zooms to fit content
- `options.keyboardNavigation`: Keyboard navigation (true/false) - Enables/disables arrow key navigation between nodes and link opening
- `options.sidePanel`: Side panel visible (true/false) - Controls whether clicking nodes opens the details panel
- `options.tooltips`: Show tooltips (true/false) - Enables/disables hover tooltips on long text
- `options.responsive`: Responsive design (true/false) - Controls responsive behavior (currently always enabled)
- `options.dragAndDrop`: File drag & drop (true/false) - Enables/disables CSV file upload via drag & drop

```javascript
window.$xDiagrams = {
  options: {
    autoZoom: true,           // Automatically zoom to fit content
    keyboardNavigation: true, // Enable arrow key navigation and link opening
    sidePanel: true,          // Show details panel on node click
    tooltips: true,           // Show tooltips on hover
    responsive: true,         // Enable responsive design
    dragAndDrop: true         // Enable CSV file upload via drag & drop
  }
};
```

**Example with options disabled:**
```javascript
window.$xDiagrams = {
  options: {
    autoZoom: false,          // No automatic zoom
    keyboardNavigation: false, // No keyboard navigation
    sidePanel: false,         // No side panel
    tooltips: false,          // No tooltips
    responsive: true,         // Keep responsive enabled
    dragAndDrop: false        // No drag & drop upload
  }
};
```

## Keyboard Navigation
When `keyboardNavigation` is enabled, the following keys are available:

### Navigation Keys:
- **Arrow Keys**: Navigate between nodes (Up/Down/Left/Right)

- **Home/End**: Go to first/last node
- **Escape**: Clear selection

### Action Keys:


### Security Features:
- All external links open with `rel="noreferrer noopener"` for security
- URL validation before opening
- Temporary link creation and cleanup

## Drag & Drop Functionality
When `dragAndDrop` is enabled:
- Drop CSV files directly onto the diagram area
- Files are automatically processed and added to the diagram list
- Saved to localStorage for persistence
- Supports single or multiple CSV files

## Hooks (Callbacks)
Available functions for events:
- `hooks.onLoad`: Executed when loading a diagram
- `hooks.onThemeChange`: Executed when changing theme
- `hooks.onNodeClick`: Executed when clicking on a node
- `hooks.onFileDrop`: Executed when dropping a CSV file

```javascript
window.$xDiagrams = {
  hooks: {
    onLoad: function(diagram) {
      console.log('Diagram loaded:', diagram.name);
    },
    onThemeChange: function(theme) {
      console.log('Theme changed to:', theme);
    },
    onNodeClick: function(node) {
      console.log('Node clicked:', node.name);
    },
    onFileDrop: function(file) {
      console.log('File dropped:', file.name);
    }
  }
};
```

## Security Features
The library includes several security measures:

### Link Security:
- All external links use `rel="noreferrer noopener"`
- URL validation before opening
- Temporary link creation to prevent DOM pollution

### Data Validation:
- CSV parsing with error handling
- URL format validation
- Safe file handling for drag & drop

## Google Sheets Integration
For Google Sheets diagrams:
- Automatic detection of Google Sheets URLs
- Edit button with tooltip "Abrir archivo"
- Secure opening with security attributes
- Support for both view and edit URLs

## Complete Example
Here's a complete configuration example:

```javascript
window.$xDiagrams = {
  // Basic settings
  title: "Swanix Diagrams",
  name: "Swanix XDiagrams",
  version: "0.3.1",
  
  // Theme configuration
  themes: {
    light: "snow",
    dark: "onyx",
    default: "snow"
  },
  
  // Column mapping
  columns: {
    id: "Node",
    name: "Name", 
    parent: "Parent",
    img: "Type",
    url: "URL",
    type: "Type",
    subtitle: "Description"
  },
  
  // Diagram sources
  diagrams: [
    {
      name: "Site Map Basic",
      file: "https://docs.google.com/spreadsheets/d/e/2PACX-1vT1F3LXPwnGlnF_uOlhoR-5kK1DrWLwlCAKH8Ag6hPrNLzwqWYWU8ofE19xSv4cH1-Cq7ZYm7lPys7V/pub?output=csv",
      edit: "https://docs.google.com/spreadsheets/d/12XSWGm6CAkv7SVSeBU0dtS3dhqc1dLasoxWqsW2AX40/edit?gid=0#gid=0"
    },
    {
      name: "Simple Tree",
      file: "data/tree-simple.csv"
    },
    {
      name: "Test con URLs",
      file: "data/test-with-urls.csv"
    }
  ],
  
  // Advanced options
  options: {
    autoZoom: true,
    keyboardNavigation: true,
    sidePanel: true,
    tooltips: true,
    responsive: true,
    dragAndDrop: true
  },
  
  // Event hooks
  hooks: {
    onLoad: function(diagram) {
      console.log('Diagram loaded successfully:', diagram.name);
    },
    onThemeChange: function(theme) {
      console.log('Theme changed to:', theme);
    },
    onNodeClick: function(node) {
      console.log('Node clicked:', node.name);
    },
    onFileDrop: function(file) {
      console.log('File dropped:', file.name);
    }
  }
};
```

## CSV Data Format
Your CSV files should include these columns for full functionality:

```csv
Node,Parent,Name,Description,Type,URL
ROOT,,Swanix,Empresa de tecnología,detail,https://swanix.com
DEV,ROOT,Desarrollo,Equipo de desarrollo,detail,https://github.com/swanix
```

## Browser Compatibility
- Modern browsers with ES6+ support
- Drag & Drop API support for file upload
- LocalStorage for theme persistence
- Fetch API for remote data loading