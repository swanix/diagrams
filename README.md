# 🎯 Swanix Diagrams - Interactive SVG Diagram Library

A powerful JavaScript library for creating interactive, hierarchical SVG diagrams with advanced theming, real-time switching, and responsive design.

## ✨ Key Features

### 🎨 **Advanced Theming System**
- **6 Built-in Themes**: Snow (light), Onyx (dark), Vintage, Pastel, Neon, Forest
- **CSS Variables Control**: Complete visual customization through `themes.json`
- **Theme Persistence**: Automatic theme saving and restoration
- **FOUC Prevention**: Smooth theme transitions without white flashes
- **Theme Loader**: Early theme application to prevent visual glitches

### 🔄 **Dynamic Diagram Switching**
- **Dropdown Interface**: Clean dropdown in topbar for diagram selection
- **URL-based Navigation**: Direct access to specific diagrams via URL parameters
- **Fallback System**: Automatic fallback URLs for improved reliability
- **Real-time Loading**: Seamless diagram switching without page reload

### 📊 **Hierarchical Data Visualization**
- **Tree Structures**: Support for complex hierarchical relationships
- **Cluster Grouping**: Visual grouping of related nodes
- **Custom Columns**: Flexible data mapping for different diagram types
- **CSV Integration**: Easy data import from CSV files

### 🎯 **Interactive Elements**
- **Node Selection**: Click to select and highlight nodes
- **Side Panel**: Detailed information display for selected nodes
- **Keyboard Navigation**: Full keyboard navigation with hierarchical and sequential modes
- **Auto Zoom**: Automatic zoom fitting for optimal viewing
- **Responsive Design**: Adapts to different screen sizes

### 🛠 **Developer Experience**
- **Modular Architecture**: Clean separation of concerns
- **Extensible Design**: Easy to add new themes and features
- **Comprehensive Documentation**: Detailed guides for all features
- **Error Handling**: Robust error management and fallbacks

## 🚀 Quick Start

### Basic Implementation

```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Diagram</title>
    <script src="theme-loader.js"></script>
    <link rel="stylesheet" href="sw-diagrams.css">
    <script src="https://d3js.org/d3.v7.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.0/papaparse.min.js"></script>
</head>
<body>
    <div class="sw-diagram-container" 
         data-themes='{
           "light": "snow",
           "dark": "onyx"
         }'
         data-title="My Diagram"
         data-columns='{
           "id": "ID",
           "name": "Name", 
           "subtitle": "Description",
           "parent": "Parent",
           "img": "Thumbnail",
           "url": "url",
           "type": "Type"
         }'>
    </div>
    
    <script>
      window.swDiagrams = window.swDiagrams || {};
      window.swDiagrams.diagrams = [
        {
          name: "Diagram 1", 
          url: "data/sample-diagram.csv"
        },
        {
          name: "Diagram 2", 
          url: "data/another-diagram.csv"
        }
      ];
    </script>
    
    <script src="sw-diagrams.js"></script>
</body>
</html>
```

### Advanced Configuration

```html
<div class="sw-diagram-container" 
     data-themes='{
       "light": "pastel",
       "dark": "neon"
     }'
     data-title="Organization Chart"
     data-columns='{
       "id": "ID",
       "name": "Name", 
       "subtitle": "Role",
       "parent": "Parent",
       "img": "Avatar",
       "url": "Profile",
       "type": "Department"
     }'>
</div>

<script>
  window.swDiagrams = window.swDiagrams || {};
  window.swDiagrams.diagrams = [
    {
      name: "Org Chart", 
      url: "data/org-chart.csv"
    },
    {
      name: "Team Structure", 
      url: "data/team-structure.csv"
    }
  ];
</script>
```

## 📁 Project Structure

```
diagrams/
├── src/
│   ├── sw-diagrams.js          # Main library file
│   ├── sw-diagrams.css         # Core styles
│   ├── themes.json             # Theme definitions
│   ├── theme-loader.js         # Early theme loading
│   ├── data/                   # CSV data files
│   ├── themes/                 # Theme system files
│   └── templates/              # Template engine
├── docs/                       # Documentation and demos
├── readme/                     # Technical documentation
└── package.json
```

## 🎨 Theme System

### Built-in Themes

| Theme | Type | Description |
|-------|------|-------------|
| **Snow** | Light | Clean, professional light theme |
| **Onyx** | Dark | Modern dark theme with blue accents |
| **Vintage** | Light | Warm, retro-inspired theme |
| **Pastel** | Light | Soft, gentle color palette |
| **Neon** | Dark | High contrast with neon green |
| **Forest** | Dark | Nature-inspired green theme |

### Custom Themes

Create custom themes by adding new entries to `themes.json`:

```json
{
  "my-theme": {
    "--bg-color": "#ffffff",
    "--text-color": "#333333",
    "--node-fill": "#f8f9fa",
    "--link-color": "#6c757d"
  }
}
```

## 📊 Data Format

### CSV Structure

```csv
ID,Parent,Name,Role,Department
1,,CEO,Chief Executive Officer,Executive
2,1,CTO,Chief Technology Officer,Technology
3,1,CFO,Chief Financial Officer,Finance
4,2,Lead Dev,Lead Developer,Engineering
```

### Column Mapping

Customize column names for different diagram types:

```javascript
{
  "id": "ID",
  "parent": "Parent", 
  "name": "Name",
  "role": "Role",
  "department": "Department"
}
```

## 🔧 Configuration Options

### Container Attributes

| Attribute | Description | Default |
|-----------|-------------|---------|
| `data-themes` | Theme configuration object | `{"light": "snow", "dark": "onyx"}` |
| `data-title` | Diagram title | Page title |
| `data-columns` | Column mapping object | Auto-detected |

### Required Dependencies

```html
<!-- Theme loader for FOUC prevention -->
<script src="theme-loader.js"></script>

<!-- Core library styles -->
<link rel="stylesheet" href="sw-diagrams.css">

<!-- D3.js for SVG manipulation -->
<script src="https://d3js.org/d3.v7.min.js"></script>

<!-- PapaParse for CSV parsing -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.0/papaparse.min.js"></script>

<!-- Main library -->
<script src="sw-diagrams.js"></script>
```

### URL Parameters

- `?diagram=index` - Load specific diagram
- `?theme=snow` - Set initial theme
- `?zoom=auto` - Enable auto zoom

## 🎯 Advanced Features

### Keyboard Navigation

The library provides comprehensive keyboard navigation for accessibility and efficient diagram exploration:

#### Hierarchical Navigation
- **↑** - Navigate to parent node
- **↓** - Navigate to first child node
- **←→** - Navigate between nodes at the same level (siblings, cousins)
- **Home** - Jump to first node
- **End** - Jump to last node
- **Escape** - Clear selection

#### Sequential Navigation (Form-like)
- **Tab** - Navigate to next node sequentially
- **Shift + Tab** - Navigate to previous node sequentially
- Automatically jumps between levels when reaching the end of current level

#### Visual Indicators
- Selected nodes show keyboard icon (⌨) indicator
- Smooth scrolling to keep selected nodes visible
- Side panel automatically opens with node details

### Fallback URLs

Configure multiple data sources for reliability:

```javascript
{
  "url": "primary-data.csv",
  "fallbacks": [
    "backup-data.csv",
    "legacy-data.csv"
  ]
}
```

### Custom Styling

Override theme variables with CSS:

```css
:root {
  --node-fill: #custom-color;
  --link-color: #custom-link;
}
```

### Event Handling

Listen to diagram events:

```javascript
// Diagram loaded
document.addEventListener('diagramLoaded', (e) => {
  console.log('Diagram loaded:', e.detail);
});

// Theme changed
document.addEventListener('themeChanged', (e) => {
  console.log('Theme changed to:', e.detail.theme);
});
```

## 📚 Documentation

### Core Documentation
- [Base Usage Guide](./readme/README-CLEAN.md) - Getting started
- [Custom Columns](./readme/CUSTOM_COLUMNS_README.md) - Data mapping
- [Theme System](./readme/THEMES_JSON_README.md) - Theme customization
- [Theme Creator](./readme/THEME_CREATOR_README.md) - Visual theme editor

### Advanced Features
- [Fallback System](./readme/FALLBACKS_README.md) - URL fallbacks
- [CSS Variables](./readme/SWITCHER_CSS_VARIABLES_README.md) - Style control
- [FOUC Prevention](./readme/FOUC_FIX_README.md) - Smooth transitions
- [Theme Loader](./readme/THEME_LOADER_README.md) - Early loading

## 🛠 Development

### Building

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Support

- **Issues**: Report bugs and request features on GitHub
- **Documentation**: Check the `readme/` folder for detailed guides
- **Examples**: See `docs/demo/` for working examples

---

**Ready to start?** Check out the [Base Usage Guide](./readme/README-CLEAN.md) for your first diagram!
