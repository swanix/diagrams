/**
 * XDiagrams Text Handler Module
 * Maneja el renderizado y formateo de texto para el diagrama
 */

class XDiagramsTextHandler {
  constructor(config = {}) {
    this.config = {
      maxWidth: 80,
      maxLines: 2,
      fontSize: 8,
      nodeNameFontSize: 9,  // Tamaño específico para el nombre del nodo
      lineHeight: 1.2,
      fontFamily: 'Arial, sans-serif',
      textAnchor: 'middle',
      dominantBaseline: 'middle',
      ellipsis: '...',
      fontWeight: 'bold',
      ...config
    };
    // XDiagramsTextHandler inicializado
  }

  /**
   * Renderiza texto con manejo inteligente
   * @param {d3.Selection} container - Contenedor SVG donde renderizar el texto
   * @param {string} text - Texto a renderizar
   * @param {Object} options - Opciones de configuración
   * @returns {d3.Selection} - Elemento de texto creado
   */
  renderText(container, text, options = {}) {
    const config = { ...this.config, ...options };
    
    if (!text || text.trim() === '') {
      return container.append('text')
        .attr('class', 'empty-text')
        .style('display', 'none');
    }

    const textGroup = container.append('g')
      .attr('class', 'text-group');

    const textElement = textGroup.append('text')
      .attr('class', 'smart-text')
      .style('font-family', config.fontFamily)
      .style('font-size', config.fontSize + 'px')
      .style('font-weight', config.fontWeight || 'normal')
      .style('text-anchor', config.textAnchor)
      .style('dominant-baseline', config.dominantBaseline);

    // Implementar wrap de texto optimizado
    this.wrapText(textElement, text, config);

    return textElement;
  }

  /**
   * Implementación optimizada de wrap de texto
   */
  wrapText(textElement, text, config) {
    const words = text.split(/\s+/);
    const lines = [];
    let currentLine = '';

    for (let i = 0; i < words.length; i++) {
      const testLine = currentLine ? currentLine + ' ' + words[i] : words[i];
      const testElement = textElement.text(testLine);
      
      // Medir el ancho del texto con verificación de disponibilidad
      const node = testElement.node();
      let textWidth = 0;
      
      if (node && typeof node.getComputedTextLength === 'function') {
        textWidth = node.getComputedTextLength();
      } else {
        // Fallback: estimar basado en caracteres
        const avgCharWidth = config.fontSize * 0.6;
        textWidth = testLine.length * avgCharWidth;
      }
      
      if (textWidth > config.maxWidth && currentLine !== '') {
        lines.push(currentLine);
        currentLine = words[i];
      } else {
        currentLine = testLine;
      }
    }
    
    if (currentLine) {
      lines.push(currentLine);
    }

    // Limitar el número de líneas
    if (lines.length > config.maxLines) {
      lines.splice(config.maxLines);
      if (lines[config.maxLines - 1]) {
        lines[config.maxLines - 1] = this.truncateText(lines[config.maxLines - 1], config.maxWidth, config.ellipsis);
      }
    }

    // Limpiar el texto anterior y aplicar las líneas
    textElement.text('');
    
    lines.forEach((line, index) => {
      const tspan = textElement.append('tspan')
        .attr('x', 0)
        .attr('dy', index === 0 ? '0' : config.lineHeight + 'em')
        .text(line);
    });
  }

  /**
   * Trunca texto con ellipsis si es necesario
   */
  truncateText(text, maxWidth, ellipsis) {
    const testElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    testElement.style.fontFamily = this.config.fontFamily;
    testElement.style.fontSize = this.config.fontSize + 'px';
    testElement.style.fontWeight = this.config.fontWeight || 'normal';
    
    let truncatedText = text;
    let ellipsisText = ellipsis;
    
    while (truncatedText.length > 0) {
      testElement.textContent = truncatedText + ellipsisText;
      const textWidth = testElement.getComputedTextLength();
      
      if (textWidth <= maxWidth) {
        break;
      }
      
      truncatedText = truncatedText.slice(0, -1);
    }
    
    return truncatedText + ellipsisText;
  }

  /**
   * Renderiza texto para nodos con posición específica
   */
  renderNodeText(container, text, x, y, options = {}) {
    const textElement = this.renderText(container, text, options);
    textElement.attr('x', x).attr('y', y);
    return textElement;
  }

  /**
   * Renderiza texto centrado verticalmente en el espacio disponible
   */
  renderNodeTextCentered(container, text, x, y, options = {}) {
    const config = { ...this.config, ...options };
    
    if (!text || text.trim() === '') {
      return container.append('text')
        .attr('class', 'empty-text')
        .attr('x', x)
        .attr('y', y)
        .style('display', 'none');
    }

    // Calcular el número de líneas que tendrá el texto
    const words = text.split(/\s+/);
    const lines = [];
    let currentLine = '';

    for (let i = 0; i < words.length; i++) {
      const testLine = currentLine ? currentLine + ' ' + words[i] : words[i];
      const testElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      testElement.style.fontFamily = config.fontFamily;
      testElement.style.fontSize = config.fontSize + 'px';
      testElement.style.fontWeight = config.fontWeight || 'normal';
      testElement.textContent = testLine;
      
      let textWidth = 0;
      if (testElement.getComputedTextLength) {
        textWidth = testElement.getComputedTextLength();
      } else {
        const avgCharWidth = config.fontSize * 0.6;
        textWidth = testLine.length * avgCharWidth;
      }
      
      if (textWidth > config.maxWidth && currentLine !== '') {
        lines.push(currentLine);
        currentLine = words[i];
      } else {
        currentLine = testLine;
      }
    }
    
    if (currentLine) {
      lines.push(currentLine);
    }

    // Limitar el número de líneas
    if (lines.length > config.maxLines) {
      lines.splice(config.maxLines);
    }

    // Ajustar posición Y según el número de líneas
    let adjustedY = y;
    let baseline = config.dominantBaseline;
    
    if (lines.length === 1) {
      // Para texto de una línea, usar hanging baseline y ajustar posición
      adjustedY = y + 8;
      baseline = 'hanging';
    } else {
      // Para texto de múltiples líneas, ajustar hacia arriba para mejor centrado
      adjustedY = y - 5;
      baseline = 'middle';
    }

    const textGroup = container.append('g')
      .attr('class', 'text-group')
      .attr('transform', `translate(${x}, ${adjustedY})`);

    const textElement = textGroup.append('text')
      .attr('class', 'smart-text')
      .style('font-family', config.fontFamily)
      .style('font-size', config.fontSize + 'px')
      .style('font-weight', config.fontWeight || 'normal')
      .style('text-anchor', config.textAnchor)
      .style('dominant-baseline', baseline);

    // Implementar wrap de texto optimizado
    this.wrapText(textElement, text, config);

    return textElement;
  }

  /**
   * Actualiza configuración
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }
}

export { XDiagramsTextHandler }; 