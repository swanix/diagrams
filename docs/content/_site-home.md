<figure class="hero-large" style="--hero-image:url(https://source.unsplash.com/g-YsyUUwT9M/1800x600);"></figure>

# Swanix Diagrams


### D3 - Tree Diagram (CSV files & Google Sheets)

<div style="width: 780px; height: 500px; margin: 10px; position: relative;"><iframe allowfullscreen frameborder="0" style="width:780px; height:480px" src="./demo/d3"></iframe></div>

D3 diagram with a tree structure. Data is dynamically loaded from a [CSV file]()

[View Fullscreen](https://swanix.org/diagrams/demo/d3)

### D3 - Tree Diagram Simple

<div style="width: 780px; height: 500px; margin: 10px; position: relative;"><iframe allowfullscreen frameborder="0" style="width:780px; height:480px" src="./demo/d3"></iframe></div>

D3 diagram with a tree structure. Data is dynamically loaded from a [Google Sheets file](https://docs.google.com/spreadsheets/d/e/2PACX-1vTQZfZhC3cWHg0QkqRoY9i3alinAnSHab5DJtWzsm_xAhLKKJdHri8fBMUawh-DhpvCkm-G1vBeWPFq/pub?gid=466976322&single=true&output=csv
)

[View Fullscreen](https://swanix.org/diagrams/demo/d3/simple)


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
