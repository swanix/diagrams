<figure class="hero-large" style="--hero-image:url(https://source.unsplash.com/g-YsyUUwT9M/1800x600);"></figure>

# Swanix Diagrams


### Tree Diagram (CSV files & Google Sheets)

<div style="width: 780px; height: 500px; margin: 10px; position: relative;"><iframe allowfullscreen frameborder="0" style="width:780px; height:480px" src="./demo/d3"></iframe></div>

Diagram showcasing multiple examples including:
- A Google Sheets integration that loads data directly from a published spreadsheet
- Simple one-cluster and multi-cluster layouts with customizable grid sizes
- Complex cluster layouts with custom spacing and row thresholds
- Performance tests with 300-node trees and 1000-node flat layouts
- Special layouts like Hanzi characters display
- Support for flat lists and hierarchical tree structures
- Data loading from CSV, JSON and external APIs

[View Fullscreen](https://swanix.org/diagrams/demo/d3)

### Clusters layout examples

<div style="width: 780px; height: 500px; margin: 10px; position: relative;"><iframe allowfullscreen frameborder="0" style="width:780px; height:480px" src="./demo/d3"></iframe></div>

Example showing different ways to configure cluster layouts per row using single values, multi-value strings (CSS-like syntax), and arrays. The test cases demonstrate various combinations including explicit row definitions and automatic row distribution.

[View Fullscreen](https://swanix.org/diagrams/demo/d3/layout)


## Node Images

There are two ways to set images for nodes:

1. **Custom Images (Highest Priority)**
   - Use the `img` column to specify a direct URL to any image
   - Example: `https://example.com/images/my-image.jpg`
   - This takes precedence over any thumbnail setting

2. **Predefined Thumbnails**
   - Use the `type` column to specify a predefined thumbnail
   - If no custom image is set in `img`, the system will use the thumbnail based on the type
   - If no type is specified, the default 'detail' thumbnail will be used

### Available Thumbnails

#### Generic

- home
- list
- form
- detail
- document
- report
- modal
- settings
- pdf
- xml
- csv
- xls
- mosaic

#### Covers

- cover-home
- cover-home-circle
- cover-menu
- cover-message
- cover-search
- cover-settings
