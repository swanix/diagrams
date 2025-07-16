# 🎯 Swanix Diagrams - Interactive SVG Diagram Library

A powerful JavaScript library for creating interactive, hierarchical SVG diagrams with advanced theming, real-time switching, and responsive design.

## ✨ Key Features

### 🎨 **Advanced Theming System**
- **6 Built-in Themes**: Snow (light), Onyx (dark), Vintage, Pastel, Neon, Forest
- **CSS Variables Control**: Complete visual customization through `themes.json`
- **Theme Persistence**: Automatic theme saving and restoration
- **FOUC Prevention**: Smooth theme transitions without white flashes
- **Theme Loader**: Early theme application to prevent visual glitches

### 🏷️ **Auto Logo Detection**
- **Automatic Detection**: Automatically detects logo files in `img/` folder
- **Multiple Formats**: Supports SVG, PNG, JPG, JPEG formats
- **Priority System**: Manual configuration > data-logo attribute > auto-detection
- **Zero Configuration**: Works without any setup if `img/logo.svg` exists

### 🔄 **Dynamic Diagram Switching**
- **Dropdown Interface**: Clean dropdown in topbar for diagram selection
- **URL-based Navigation**: Direct access to specific diagrams via URL parameters
- **Fallback System**: Automatic fallback URLs for improved reliability
- **Real-time Loading**: Seamless diagram switching without page reload

### 📊 **Hierarchical Data Visualization**
- **Tree Structures**: Support for complex hierarchical relationships
- **Cluster Grouping**: Visual grouping of related nodes
- **Custom Columns**: Flexible data mapping for different diagram types
- **Multiple Data Sources**: CSV files, REST APIs (SheetDB, Sheetson, Airtable), and local data

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

### Data Sources Supported

Swanix Diagrams now supports multiple data sources for maximum flexibility:

- **📄 CSV Files**: Local files and remote URLs
- **🌐 REST APIs**: SheetDB, Sheetson, Airtable, and custom APIs
- **📊 Local Data**: Pre-processed JavaScript objects
- **🔄 Real-time Updates**: Automatic data refresh from APIs

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
    <div class="xcanvas" 
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
          name: "SheetDB API", 
          url: "https://sheetdb.io/api/v1/YOUR_SHEET_ID"
        },
        {
          name: "Sheetson API",
          url: "https://api.sheetson.com/v2/sheets/YOUR_SHEET_ID"
        }
      ];
    </script>
    
    <script src="sw-diagrams.js"></script>
</body>
</html>
```

### Advanced Configuration

```html
<div class="xcanvas" 
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

## 🏷️ Auto Logo Detection

### How It Works

Swanix Diagrams now includes automatic logo detection that works without any configuration:

1. **Place your logo file** in the `img/` folder with one of these names:
   - `logo.svg` (recommended)
   - `logo.png`
   - `logo.jpg`
   - `logo.jpeg`

2. **The system will automatically detect it** and display it in the topbar

### Priority System

The logo detection follows this priority order:

1. **Manual Configuration**: If `logo` is specified in `window.$xDiagrams`
2. **HTML Attribute**: If `data-logo` is set on the container
3. **Auto Detection**: Automatically finds files in `img/` folder

### Example

```javascript
// Before (manual configuration required)
window.$xDiagrams = {
  title: "My Diagram",
  logo: "img/logo.svg",  // ← Manual configuration
  // ... rest of config
};

// After (automatic detection)
window.$xDiagrams = {
  title: "My Diagram",
  // ← No logo configuration needed if img/logo.svg exists
  // ... rest of config
};
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

### Multiple Data Sources

Swanix Diagrams automatically detects and handles different data sources:

#### CSV Files
```csv
ID,Parent,Name,Role,Department
1,,CEO,Chief Executive Officer,Executive
2,1,CTO,Chief Technology Officer,Technology
3,1,CFO,Chief Financial Officer,Finance
4,2,Lead Dev,Lead Developer,Engineering
```

#### REST APIs (JSON)
```json
[
  {
    "ID": "1",
    "Parent": "",
    "Name": "CEO",
    "Role": "Chief Executive Officer",
    "Department": "Executive"
  },
  {
    "ID": "2", 
    "Parent": "1",
    "Name": "CTO",
    "Role": "Chief Technology Officer",
    "Department": "Technology"
  }
]
```

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

## 🌐 REST API Support

Swanix Diagrams now supports REST APIs for enhanced privacy and flexibility. This is perfect for users who want to use services like **SheetDB** or **Sheetson** to convert Google Sheets into private APIs.

### Supported Services

- **SheetDB.io** - Easy Google Sheets to API conversion
- **Sheetson.com** - Full-featured spreadsheet API
- **Airtable** - Database with API access
- **Custom APIs** - Any JSON API with proper format

### Quick Setup

```javascript
window.$xDiagrams = {
  diagrams: [
    {
      name: "SheetDB Example",
      url: "https://sheetdb.io/api/v1/YOUR_SHEET_ID"
    },
    {
      name: "Sheetson Example", 
      url: "https://api.sheetson.com/v2/sheets/YOUR_SHEET_ID"
    }
  ]
};
```

### Benefits

- **🔐 Privacy**: Data not publicly exposed
- **🔑 Authentication**: Support for API keys and tokens
- **📊 Real-time**: Automatic data updates
- **🔄 Scalability**: Handle large datasets efficiently
- **📦 Intelligent Cache**: Reduces API calls by 90%+ automatically

📖 **Complete Guide**: See [REST-API-GUIDE.md](./REST-API-GUIDE.md) for detailed instructions and examples.

## 📚 Documentation

### Core Documentation
- [Base Usage Guide](./readme/README-CLEAN.md) - Getting started
- [Custom Columns](./readme/CUSTOM_COLUMNS_README.md) - Data mapping
- [Theme System](./readme/THEMES_JSON_README.md) - Theme customization
- [Theme Creator](./readme/THEME_CREATOR_README.md) - Visual theme editor

### Advanced Features
- [REST API Guide](./REST-API-GUIDE.md) - API integration guide
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
