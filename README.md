<p align="center">
    <img alt="Swanix" title="Swanix Diagrams" src="https://swanix.org/assets/images/apple-touch-icon.png">
</p>
<h1 align="center">Swanix Diagrams</h1>
<p align="center">
    Experimental Diagrams library <br>
    https://swanix.org/diagrams
</p>

<p align="center">
    <img alt="Swanix" title="Swanix" src="https://img.shields.io/badge/status-beta-mediumpurple">
    <img alt="Swanix" title="Swanix" src="https://img.shields.io/badge/version-v0.9.0-blue">
    <img alt="Swanix" title="Swanix" src="https://img.shields.io/github/license/swanix/diagrams?color=blue">
    <a href="https://github.com/swanix/diagrams/blob/master/README.md"><img alt="Swanix" title="Swanix" src="https://img.shields.io/badge/lang-EN-grey.svg"></a>
    <a href="https://github.com/swanix/diagrams/blob/master/docs/i18n/README_es.md"><img alt="Swanix" title="Swanix" src="https://img.shields.io/badge/lang-ES-grey.svg"></a>
</p>

---

## Requirements

Before starting, you must have the following installed:

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/)

## Installation

In an empty folder on your computer, type the following command in the terminal:

```
git clone https://github.com/swanix/diagrams.git
```

When the project finishes cloning, type the command:

```
npm install
```
This command will install the Node.js dependencies specified in the `package.json` file (essentially [Vite](https://vite.dev/) and a series of plugins necessary to automate development tasks).

### Development Server

The dependencies are installed in the `node_modules` folder (created automatically with the `npm install` command) and after installation, we can use Vite to view our development server with:

```
npm run dev
```
This command runs a server that points to the `src` folder. It will automatically open the browser at `localhost:3000` showing the test site with examples of the library and monitoring for changes in the `src` folder files to perform hot reload.

### Documentation Server

```
npm run docs
```
This command runs a server that points to the `docs` folder. It will automatically open the browser at `localhost:4000` showing the test site with examples of the library and monitoring for changes in the `docs` folder files to perform hot reload.

### Generate Production Build

```
npm run build:lib
```
This command runs a series of processes in Vite to package the code for production in the `dist` folder and in the `docs/demo` folder for the documentation example files that should use the production files.


## Directory Structure


```sh
diagrams/  # Repository root folder
│
├── dist/                     # Generated code for production         
│   ├── xdiagrams.css  
│   ├── xdiagrams.js          # ES6 bundle
│   ├── xdiagrams.min.css  
│   ├── xdiagrams.min.js      # Minified UMD bundle
│   └── xdiagrams.woff
│
├── docs/                     # Documentation and demos     
│   ├── assets/
│   ├── content/
│   ├── demo/                 # Demo examples
│   └── index.html
│       
├── src/                     # Source code for development   
│   │  
│   ├── data/                # Local data folder
│   │   ├── complex.csv    
│   │   └── simple.csv  
│   │ 
│   ├── icons/                # Icons folder
│   │   ├── thumbs/    
│   │   └── xdiagrams.woff  
│   │              
│   ├── img/                  # Images folder
│   │   ├── logo.svg   
│   │   └── favicon.ico       
│   │  
│   ├── js/                   # JavaScript folder
│   │   ├── modules/          # ES6 modules   
│   │   │   ├── core/
│   │   │   ├── loader/
│   │   │   ├── navigation/   
│   │   │   ├── thumbs/
│   │   │   └── ui/ 
│   │   ├── vendor/           # External libraries config
│   │   │   ├── d3.js
│   │   │   └── papaparse.js   
│   │   └── xdiagrams.js      # JavaScript entry point   
│   │         
│   ├── styles/               # Styles folder
│   │   └── xdiagrams.css   
│   │
│   ├── dev.html              # Demo with ES6 source files
│   └── index.html            # Demo with production bundle file
│       
├── LICENSE                   # License
├── README.md                 # Initial README file
├── vite.config.js            # Vite Config
└── package.json              # Node.js dependencies
│
└---------------------------------------------------------

```

## Node.js Modules

The following Node.js modules are used for development

|Module|Version|Description|
|--- |--- |--- |
|vite|5.0.0|Development tool that allows compiling and serving web projects quickly and efficiently.|
|cssnano|7.1.0|CSS file minifier to optimize the size and performance of styles.|
|terser|5.0.0|JavaScript file minifier that reduces code size for production.|
|d3|7.9.0|Library for data manipulation and creation of dynamic and interactive visualizations on the web.|
|papaparse|5.5.3|Library for parsing CSV files and manipulating tabular data easily in JavaScript.|


## License

The MIT License (MIT)

Copyright (c) 2025 - Swanix

The source code in this repository was created partially or entirely with the assistance of Cursor, a code editor powered by artificial intelligence that employs advanced language models (LLMs) such as Claude, GPT, Gemini, among others. The use of this tool has been carefully guided and supervised by the author of the project.