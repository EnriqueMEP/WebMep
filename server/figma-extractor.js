// server/figma-extractor.js
import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

export default class MEPFigmaExtractor {
  constructor() {
    this.token = process.env.FIGMA_ACCESS_TOKEN;
    this.fileKey = process.env.FIGMA_FILE_KEY;
    this.baseUrl = 'https://api.figma.com/v1';
    
    if (!this.token || !this.fileKey) {
      throw new Error('FIGMA_ACCESS_TOKEN y FIGMA_FILE_KEY son requeridos');
    }
  }

  async makeRequest(endpoint) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        'X-Figma-Token': this.token,
      },
    });

    if (!response.ok) {
      throw new Error(`Figma API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Obtener información completa del archivo
  async getFileData() {
    console.log('📄 Obteniendo datos del archivo Figma...');
    const data = await this.makeRequest(`/files/${this.fileKey}`);
    return data;
  }

  // Extraer colores de los estilos de pintura
  extractColorsFromStyles(styles) {
    const colors = {};
    
    if (!styles) return colors;

    styles.forEach(style => {
      if (style.style_type === 'FILL') {
        const name = this.camelCase(style.name);
        const fills = style.fills || [];
        
        if (fills.length > 0 && fills[0].type === 'SOLID') {
          const color = fills[0].color;
          colors[name] = this.rgbaToHex(color);
        }
      }
    });

    return colors;
  }

  // Extraer colores directamente de nodos
  extractColorsFromNodes(node, colors = {}) {
    if (!node) return colors;

    // Extraer fills del nodo actual
    if (node.fills && node.fills.length > 0) {
      node.fills.forEach((fill, index) => {
        if (fill.type === 'SOLID' && fill.color) {
          const nodeName = node.name ? this.camelCase(node.name) : `color${index}`;
          colors[nodeName] = this.rgbaToHex(fill.color);
        }
      });
    }

    // Procesar hijos recursivamente
    if (node.children) {
      node.children.forEach(child => {
        this.extractColorsFromNodes(child, colors);
      });
    }

    return colors;
  }

  // Extraer espaciado basado en geometría de componentes
  extractSpacingFromNodes(node, spacing = {}) {
    if (!node) return spacing;

    if (node.type === 'COMPONENT' || node.type === 'FRAME') {
      const name = this.camelCase(node.name);
      
      // Extraer dimensiones
      if (node.absoluteBoundingBox) {
        const { width, height } = node.absoluteBoundingBox;
        
        // Agregar dimensiones comunes
        if (width && this.isCommonSize(width)) {
          spacing[`${name}Width`] = `${Math.round(width)}px`;
        }
        if (height && this.isCommonSize(height)) {
          spacing[`${name}Height`] = `${Math.round(height)}px`;
        }
      }

      // Extraer padding de Layout
      if (node.paddingLeft) spacing[`${name}PaddingLeft`] = `${node.paddingLeft}px`;
      if (node.paddingRight) spacing[`${name}PaddingRight`] = `${node.paddingRight}px`;
      if (node.paddingTop) spacing[`${name}PaddingTop`] = `${node.paddingTop}px`;
      if (node.paddingBottom) spacing[`${name}PaddingBottom`] = `${node.paddingBottom}px`;
      
      // Extraer gaps de Auto Layout
      if (node.itemSpacing) spacing[`${name}Gap`] = `${node.itemSpacing}px`;
      
      // Extraer border radius
      if (node.cornerRadius) spacing[`${name}BorderRadius`] = `${node.cornerRadius}px`;
    }

    // Procesar hijos recursivamente
    if (node.children) {
      node.children.forEach(child => {
        this.extractSpacingFromNodes(child, spacing);
      });
    }

    return spacing;
  }

  // Verificar si es un tamaño común usado en design systems
  isCommonSize(size) {
    const commonSizes = [8, 12, 16, 20, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160, 176, 192, 208, 224, 240, 256];
    return commonSizes.some(commonSize => Math.abs(size - commonSize) <= 2);
  }

  // Extraer tipografía de nodos de texto
  extractTypographyFromNodes(node, typography = {}) {
    if (!node) return typography;

    if (node.type === 'TEXT' && node.style) {
      const name = this.camelCase(node.name);
      const style = node.style;
      
      typography[name] = {
        fontFamily: style.fontFamily || 'inherit',
        fontSize: style.fontSize ? `${style.fontSize}px` : 'inherit',
        fontWeight: style.fontWeight || 'normal',
        lineHeight: style.lineHeightPx ? `${style.lineHeightPx}px` : 'normal',
        letterSpacing: style.letterSpacing ? `${style.letterSpacing}px` : 'normal'
      };
    }

    // Procesar hijos recursivamente
    if (node.children) {
      node.children.forEach(child => {
        this.extractTypographyFromNodes(child, typography);
      });
    }

    return typography;
  }

  // Extraer componentes completos
  extractComponents(fileData) {
    const components = {
      buttons: {},
      inputs: {},
      cards: {},
      modals: {},
      navigation: {},
      icons: {},
      other: {}
    };

    const processNode = (node) => {
      if (!node) return;

      const name = node.name ? node.name.toLowerCase() : '';
      const type = node.type;

      // Extraer información del componente
      if (type === 'COMPONENT' || type === 'COMPONENT_SET') {
        const componentInfo = {
          id: node.id,
          name: node.name,
          type: type,
          absoluteBoundingBox: node.absoluteBoundingBox,
          fills: node.fills || [],
          strokes: node.strokes || [],
          effects: node.effects || [],
          cornerRadius: node.cornerRadius,
          opacity: node.opacity,
          styles: this.extractNodeStyles(node)
        };

        // Clasificar componente
        if (name.includes('button') || name.includes('btn')) {
          components.buttons[this.camelCase(node.name)] = componentInfo;
        } else if (name.includes('input') || name.includes('field') || name.includes('textbox')) {
          components.inputs[this.camelCase(node.name)] = componentInfo;
        } else if (name.includes('card') || name.includes('item')) {
          components.cards[this.camelCase(node.name)] = componentInfo;
        } else if (name.includes('modal') || name.includes('dialog')) {
          components.modals[this.camelCase(node.name)] = componentInfo;
        } else if (name.includes('nav') || name.includes('menu') || name.includes('header')) {
          components.navigation[this.camelCase(node.name)] = componentInfo;
        } else if (name.includes('icon') || type === 'VECTOR') {
          components.icons[this.camelCase(node.name)] = componentInfo;
        } else {
          components.other[this.camelCase(node.name)] = componentInfo;
        }
      }

      // Procesar hijos recursivamente
      if (node.children) {
        node.children.forEach(child => processNode(child));
      }
    };

    // Procesar todas las páginas
    if (fileData.document && fileData.document.children) {
      fileData.document.children.forEach(page => {
        if (page.children) {
          page.children.forEach(child => processNode(child));
        }
      });
    }

    return components;
  }

  // Extraer estilos específicos de un nodo
  extractNodeStyles(node) {
    const styles = {};
    
    if (node.fills && node.fills.length > 0) {
      styles.backgroundColor = this.rgbaToHex(node.fills[0].color);
    }
    
    if (node.strokes && node.strokes.length > 0) {
      styles.borderColor = this.rgbaToHex(node.strokes[0].color);
      styles.borderWidth = `${node.strokeWeight || 1}px`;
    }
    
    if (node.cornerRadius) {
      styles.borderRadius = `${node.cornerRadius}px`;
    }
    
    if (node.opacity !== undefined && node.opacity !== 1) {
      styles.opacity = node.opacity;
    }

    if (node.effects && node.effects.length > 0) {
      const shadows = node.effects
        .filter(effect => effect.type === 'DROP_SHADOW')
        .map(shadow => {
          const color = this.rgbaToHex(shadow.color);
          return `${shadow.offset.x}px ${shadow.offset.y}px ${shadow.radius}px ${color}`;
        });
      
      if (shadows.length > 0) {
        styles.boxShadow = shadows.join(', ');
      }
    }

    return styles;
  }

  // Convertir RGBA a HEX
  rgbaToHex(rgba) {
    if (typeof rgba === 'object' && rgba.r !== undefined) {
      const r = Math.round(rgba.r * 255);
      const g = Math.round(rgba.g * 255);
      const b = Math.round(rgba.b * 255);
      const a = rgba.a !== undefined ? rgba.a : 1;
      
      if (a < 1) {
        return `rgba(${r}, ${g}, ${b}, ${a})`;
      }
      
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
    return rgba || '#000000';
  }

  // Convertir a camelCase
  camelCase(str) {
    return str
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
      .replace(/^[A-Z]/, chr => chr.toLowerCase());
  }

  // Generar CSS completo
  generateCSS(colors, spacing, typography, components) {
    const timestamp = new Date().toISOString();
    
    let css = `/* 🎨 MEP Design System CSS - Extraído de Figma */
/* Archivo: ${this.fileKey} */
/* Generado: ${timestamp} */

:root {
  /* Colores */
${Object.entries(colors).map(([key, value]) => `  --mep-color-${key}: ${value};`).join('\n')}
  
  /* Espaciado */
${Object.entries(spacing).map(([key, value]) => `  --mep-spacing-${key}: ${value};`).join('\n')}
}

/* Tipografía */
${Object.entries(typography).map(([key, config]) => `
.mep-text-${key} {
  font-family: ${config.fontFamily};
  font-size: ${config.fontSize};
  font-weight: ${config.fontWeight};
  line-height: ${config.lineHeight};
  letter-spacing: ${config.letterSpacing};
}`).join('\n')}

/* Componentes */
`;

    // Generar CSS para cada tipo de componente
    Object.entries(components.buttons).forEach(([name, config]) => {
      css += this.generateButtonCSS(name, config);
    });

    Object.entries(components.cards).forEach(([name, config]) => {
      css += this.generateCardCSS(name, config);
    });

    return css;
  }

  // Generar CSS para botones
  generateButtonCSS(name, config) {
    const styles = config.styles || {};
    
    return `
.mep-button-${name} {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 24px;
  background-color: ${styles.backgroundColor || 'var(--mep-color-primary, #3b82f6)'};
  color: white;
  border: none;
  border-radius: ${styles.borderRadius || '8px'};
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  ${styles.boxShadow ? `box-shadow: ${styles.boxShadow};` : ''}
  ${config.absoluteBoundingBox ? `
  width: ${config.absoluteBoundingBox.width}px;
  height: ${config.absoluteBoundingBox.height}px;` : ''}
}

.mep-button-${name}:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.mep-button-${name}:active {
  transform: translateY(0);
}
`;
  }

  // Generar CSS para cards
  generateCardCSS(name, config) {
    const styles = config.styles || {};
    
    return `
.mep-card-${name} {
  background-color: ${styles.backgroundColor || '#ffffff'};
  border-radius: ${styles.borderRadius || '12px'};
  padding: 24px;
  ${styles.boxShadow ? `box-shadow: ${styles.boxShadow};` : 'box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);'}
  transition: all 0.2s ease;
  ${config.absoluteBoundingBox ? `
  width: ${config.absoluteBoundingBox.width}px;
  min-height: ${config.absoluteBoundingBox.height}px;` : ''}
}

.mep-card-${name}:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}
`;
  }

  // Generar archivos de tokens
  async generateTokenFiles(colors, spacing, typography, components) {
    const tokensDir = path.join(process.cwd(), '..', 'frontend', 'src', 'tokens');
    
    try {
      await fs.mkdir(tokensDir, { recursive: true });
    } catch (error) {
      // Directorio ya existe
    }

    const timestamp = new Date().toISOString();

    // Generar colores
    await fs.writeFile(
      path.join(tokensDir, 'colors.js'),
      `// 🎨 Colores extraídos de Figma
// Generado: ${timestamp}

export const mepColors = ${JSON.stringify(colors, null, 2)};

export default mepColors;
`
    );

    // Generar espaciado
    await fs.writeFile(
      path.join(tokensDir, 'spacing.js'),
      `// 📏 Espaciado extraído de Figma
// Generado: ${timestamp}

export const mepSpacing = ${JSON.stringify(spacing, null, 2)};

export default mepSpacing;
`
    );

    // Generar tipografía
    await fs.writeFile(
      path.join(tokensDir, 'typography.js'),
      `// ✍️ Tipografía extraída de Figma
// Generado: ${timestamp}

export const mepTypography = ${JSON.stringify(typography, null, 2)};

export default mepTypography;
`
    );

    // Generar componentes
    await fs.writeFile(
      path.join(tokensDir, 'components.js'),
      `// 🧩 Componentes extraídos de Figma
// Generado: ${timestamp}

export const mepComponents = ${JSON.stringify(components, null, 2)};

export default mepComponents;
`
    );

    // Generar CSS completo
    const fullCSS = this.generateCSS(colors, spacing, typography, components);
    await fs.writeFile(
      path.join(tokensDir, 'mep-design-system.css'),
      fullCSS
    );

    // Actualizar index.js
    await fs.writeFile(
      path.join(tokensDir, 'index.js'),
      `// 🎯 MEP Design System
// Extraído automáticamente de Figma
// Generado: ${timestamp}

import { mepColors } from './colors.js';
import { mepSpacing } from './spacing.js';
import { mepTypography } from './typography.js';
import { mepComponents } from './components.js';

export { mepColors, mepSpacing, mepTypography, mepComponents };

// Función para aplicar todos los tokens al DOM
export const applyMEPTokens = () => {
  const root = document.documentElement;
  
  // Aplicar colores
  Object.entries(mepColors).forEach(([key, value]) => {
    root.style.setProperty(\`--mep-color-\${key}\`, value);
  });
  
  // Aplicar espaciado
  Object.entries(mepSpacing).forEach(([key, value]) => {
    root.style.setProperty(\`--mep-spacing-\${key}\`, value);
  });
  
  console.log('🎨 MEP Design System aplicado');
};

export const mepTokens = {
  colors: mepColors,
  spacing: mepSpacing,
  typography: mepTypography,
  components: mepComponents
};

export default mepTokens;
`
    );

    console.log('✅ Archivos de design system generados en:', tokensDir);
  }

  // Extraer todo el design system
  async extractAll() {
    try {
      console.log('🚀 Iniciando extracción completa del design system...');
      console.log(`📁 Archivo Figma: ${this.fileKey}`);
      
      const fileData = await this.getFileData();
      console.log(`📄 Archivo: ${fileData.name}`);
      console.log(`📅 Última modificación: ${fileData.lastModified}`);

      // Extraer todos los elementos
      const colors = {};
      const spacing = {};
      const typography = {};
      
      // Procesar todas las páginas
      if (fileData.document && fileData.document.children) {
        fileData.document.children.forEach(page => {
          console.log(`📄 Procesando página: ${page.name}`);
          
          this.extractColorsFromNodes(page, colors);
          this.extractSpacingFromNodes(page, spacing);
          this.extractTypographyFromNodes(page, typography);
        });
      }

      const components = this.extractComponents(fileData);

      console.log(`🎨 Colores extraídos: ${Object.keys(colors).length}`);
      console.log(`📏 Espaciados extraídos: ${Object.keys(spacing).length}`);
      console.log(`✍️ Tipografías extraídas: ${Object.keys(typography).length}`);
      console.log(`🧩 Componentes extraídos: ${Object.keys(components.buttons).length + Object.keys(components.cards).length + Object.keys(components.other).length}`);

      await this.generateTokenFiles(colors, spacing, typography, components);

      const result = {
        variables: { colors, spacing, typography },
        components,
        stats: {
          colors: Object.keys(colors).length,
          spacing: Object.keys(spacing).length,
          typography: Object.keys(typography).length,
          buttons: Object.keys(components.buttons).length,
          cards: Object.keys(components.cards).length,
          total: Object.keys(colors).length + Object.keys(spacing).length + Object.keys(typography).length
        }
      };

      console.log('✅ Extracción completada exitosamente');
      return result;
    } catch (error) {
      console.error('❌ Error en extracción:', error.message);
      throw error;
    }
  }
}

// Si se ejecuta directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const extractor = new MEPFigmaExtractor();
  extractor.extractAll().catch(console.error);
}
