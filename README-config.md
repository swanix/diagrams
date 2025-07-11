# Swanix Diagrams 
## Configuration

## Basic Configuration
- `name`: Application name (e.g., "Swanix XDiagrams")
- `version`: Current software version (e.g., "0.2.0")

```javascript
window.$xDiagrams = {
  name: "Swanix XDiagrams",
  version: "0.2.0"
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
- `columns.img`: Image/icon type (maps to: "Type")
- `columns.url`: Associated links (maps to: "url")
- `columns.type`: Node type (maps to: "Type")

```javascript
window.$xDiagrams = {
  columns: {
    id: "Node",
    name: "Name",
    subtitle: "Description",
    parent: "Parent",
    img: "Type",
    url: "url",
    type: "Type"
  }
};
```

## Diagrams
List of available diagrams, each with:
- `name`: Diagram name
- `url`: CSV data source URL

```javascript
window.$xDiagrams = {
  diagrams: [
    {
      name: "Site Map Basic",
      url: "https://docs.google.com/spreadsheets/d/e/.../pub?output=csv"
    },
    {
      name: "Simple Tree",
      url: "data/tree-simple.csv"
    },
    {
      name: "Multi-Clusters",
      url: "data/test-multiclusters.csv"
    }
  ]
};
```

## Advanced Options
- `options.autoZoom`: Automatic zoom adjustment (true/false) - Controls whether the diagram automatically zooms to fit content
- `options.keyboardNavigation`: Keyboard navigation (true/false) - Enables/disables arrow key navigation between nodes
- `options.sidePanel`: Side panel visible (true/false) - Controls whether clicking nodes opens the details panel
- `options.tooltips`: Show tooltips (true/false) - Enables/disables hover tooltips on long text
- `options.responsive`: Responsive design (true/false) - Controls responsive behavior (currently always enabled)

```javascript
window.$xDiagrams = {
  options: {
    autoZoom: true,           // Automatically zoom to fit content
    keyboardNavigation: true, // Enable arrow key navigation
    sidePanel: true,          // Show details panel on node click
    tooltips: true,           // Show tooltips on hover
    responsive: true          // Enable responsive design
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
    responsive: true          // Keep responsive enabled
  }
};
```

## Hooks (Callbacks)
Available functions for events:
- `hooks.onLoad`: Executed when loading a diagram
- `hooks.onThemeChange`: Executed when changing theme
- `hooks.onNodeClick`: Executed when clicking on a node

```javascript
window.$xDiagrams = {
  hooks: {
    onLoad: function(data) {
      console.log('Diagram loaded:', data);
    },
    onThemeChange: function(data) {
      console.log('Theme changed to:', data.theme);
    },
    onNodeClick: function(data) {
      console.log('Node clicked:', data.node);
    }
  }
};
```

## Complete Example
Here's a complete configuration example:

```javascript
window.$xDiagrams = {
  // Basic settings
  name: "Swanix XDiagrams",
  version: "0.2.0",
  
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
    subtitle: "Description",
    parent: "Parent",
    img: "Type",
    url: "url",
    type: "Type"
  },
  
  // Diagram sources
  diagrams: [
    {
      name: "Site Map Basic",
      url: "https://docs.google.com/spreadsheets/d/e/2PACX-1vT1F3LXPwnGlnF_uOlhoR-5kK1DrWLwlCAKH8Ag6hPrNLzwqWYWU8ofE19xSv4cH1-Cq7ZYm7lPys7V/pub?output=csv"
    },
    {
      name: "Simple Tree",
      url: "data/tree-simple.csv"
    }
  ],
  
  // Advanced options
  options: {
    autoZoom: true,
    keyboardNavigation: true,
    sidePanel: true,
    tooltips: true,
    responsive: true
  },
  
  // Event hooks
  hooks: {
    onLoad: function(data) {
      console.log('Diagram loaded successfully');
    },
    onThemeChange: function(data) {
      console.log('Theme changed to:', data.theme);
    },
    onNodeClick: function(data) {
      console.log('Node clicked:', data.node.name);
    }
  }
};
```