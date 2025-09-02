// server/figma-sync-advanced.js
import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config({ path: '../.env' });

export default class MEPFigmaSyncAdvanced {
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

  // Obtener variables locales del archivo
  async getLocalVariables() {
    console.log('🎨 Obteniendo variables locales de Figma...');
    try {
      const data = await this.makeRequest(`/files/${this.fileKey}/variables/local`);
      return data.meta.variables;
    } catch (error) {
      console.warn('⚠️ No se pudieron obtener variables:', error.message);
      return {};
    }
  }

  // Obtener información completa del archivo
  async getFileData() {
    console.log('📄 Obteniendo datos completos del archivo...');
    const data = await this.makeRequest(`/files/${this.fileKey}`);
    return data;
  }

  // Obtener estilos del archivo
  async getFileStyles() {
    console.log('🎭 Obteniendo estilos del archivo...');
    try {
      const data = await this.makeRequest(`/files/${this.fileKey}/styles`);
      return data.meta.styles;
    } catch (error) {
      console.warn('⚠️ No se pudieron obtener estilos:', error.message);
      return {};
    }
  }

  // Procesar variables según tipo
  processVariables(variables) {
    const processed = {
      colors: {},
      spacing: {},
      typography: {},
      effects: {},
      opacity: {}
    };

    Object.values(variables).forEach(variable => {
      const name = variable.name.toLowerCase().replace(/\s+/g, '_');
      const resolvedType = variable.resolvedType;
      
      // Obtener el valor por defecto (primer modo disponible)
      const defaultModeId = Object.keys(variable.valuesByMode)[0];
      const value = variable.valuesByMode[defaultModeId];

      switch (resolvedType) {
        case 'COLOR':
          processed.colors[this.camelCase(name)] = this.rgbaToHex(value);
          break;
        case 'FLOAT':
          if (this.isSpacingVariable(name)) {
            processed.spacing[this.camelCase(name)] = `${value}px`;
          } else if (name.includes('opacity') || name.includes('alpha')) {
            processed.opacity[this.camelCase(name)] = value;
          }
          break;
        case 'STRING':
          if (this.isTypographyVariable(name)) {
            processed.typography[this.camelCase(name)] = value;
          }
          break;
        case 'BOOLEAN':
          // Para flags o configuraciones
          processed[this.camelCase(name)] = value;
          break;
      }
    });

    return processed;
  }

  // Verificar si es variable de espaciado
  isSpacingVariable(name) {
    const spacingKeywords = ['spacing', 'gap', 'margin', 'padding', 'size', 'width', 'height', 'radius'];
    return spacingKeywords.some(keyword => name.includes(keyword));
  }

  // Verificar si es variable de tipografía
  isTypographyVariable(name) {
    const typoKeywords = ['font', 'text', 'letter', 'line', 'weight'];
    return typoKeywords.some(keyword => name.includes(keyword));
  }

  // Convertir RGBA a HEX o conservar RGBA si tiene transparencia
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
    return rgba;
  }

  // Convertir a camelCase
  camelCase(str) {
    return str
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
      .replace(/^[A-Z]/, chr => chr.toLowerCase());
  }

  // Extraer componentes específicos
  extractComponents(fileData) {
    const components = {
      buttons: {},
      inputs: {},
      cards: {},
      modals: {},
      navigation: {},
      other: {}
    };

    const processNode = (node, depth = 0) => {
      if (!node) return;

      const name = node.name ? node.name.toLowerCase() : '';
      const type = node.type;

      // Extraer información del nodo
      const nodeInfo = {
        id: node.id,
        name: node.name,
        type: type,
        visible: node.visible !== false,
        absoluteBoundingBox: node.absoluteBoundingBox,
        constraints: node.constraints,
        effects: node.effects || [],
        fills: node.fills || [],
        strokes: node.strokes || [],
        strokeWeight: node.strokeWeight,
        cornerRadius: node.cornerRadius,
        opacity: node.opacity
      };

      // Clasificar componentes
      if (type === 'COMPONENT' || type === 'COMPONENT_SET') {
        if (name.includes('button') || name.includes('btn')) {
          components.buttons[this.camelCase(node.name)] = nodeInfo;
        } else if (name.includes('input') || name.includes('field') || name.includes('textbox')) {
          components.inputs[this.camelCase(node.name)] = nodeInfo;
        } else if (name.includes('card') || name.includes('item')) {
          components.cards[this.camelCase(node.name)] = nodeInfo;
        } else if (name.includes('modal') || name.includes('dialog') || name.includes('popup')) {
          components.modals[this.camelCase(node.name)] = nodeInfo;
        } else if (name.includes('nav') || name.includes('menu') || name.includes('header')) {
          components.navigation[this.camelCase(node.name)] = nodeInfo;
        } else {
          components.other[this.camelCase(node.name)] = nodeInfo;
        }
      }

      // Procesar hijos recursivamente
      if (node.children && depth < 10) { // Limitar profundidad para evitar recursión infinita
        node.children.forEach(child => processNode(child, depth + 1));
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

  // Generar CSS personalizado para componentes
  generateComponentCSS(components) {
    let css = `/* 🎨 MEP Components CSS - Generado automáticamente desde Figma */\n\n`;

    // Generar CSS para botones
    Object.entries(components.buttons).forEach(([name, config]) => {
      css += this.generateButtonCSS(name, config);
    });

    // Generar CSS para inputs
    Object.entries(components.inputs).forEach(([name, config]) => {
      css += this.generateInputCSS(name, config);
    });

    // Generar CSS para cards
    Object.entries(components.cards).forEach(([name, config]) => {
      css += this.generateCardCSS(name, config);
    });

    return css;
  }

  // Generar CSS específico para botones
  generateButtonCSS(name, config) {
    const fills = config.fills && config.fills[0];
    const backgroundColor = fills ? this.rgbaToHex(fills.color) : 'transparent';
    
    return `
.mep-${name} {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 24px;
  background-color: ${backgroundColor};
  border-radius: ${config.cornerRadius || 8}px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
  opacity: ${config.opacity || 1};
  ${config.absoluteBoundingBox ? `
  width: ${config.absoluteBoundingBox.width}px;
  height: ${config.absoluteBoundingBox.height}px;` : ''}
}

.mep-${name}:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.mep-${name}:active {
  transform: translateY(0);
}

.mep-${name}:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

`;
  }

  // Generar CSS para inputs
  generateInputCSS(name, config) {
    const fills = config.fills && config.fills[0];
    const backgroundColor = fills ? this.rgbaToHex(fills.color) : '#ffffff';
    
    return `
.mep-${name} {
  display: block;
  width: 100%;
  padding: 12px 16px;
  background-color: ${backgroundColor};
  border: ${config.strokeWeight || 1}px solid ${config.strokes && config.strokes[0] ? this.rgbaToHex(config.strokes[0].color) : '#e5e7eb'};
  border-radius: ${config.cornerRadius || 6}px;
  font-size: 16px;
  transition: all 0.2s ease;
  opacity: ${config.opacity || 1};
}

.mep-${name}:focus {
  outline: none;
  border-color: var(--mep-color-primary, #3b82f6);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

`;
  }

  // Generar CSS para cards
  generateCardCSS(name, config) {
    const fills = config.fills && config.fills[0];
    const backgroundColor = fills ? this.rgbaToHex(fills.color) : '#ffffff';
    
    return `
.mep-${name} {
  background-color: ${backgroundColor};
  border-radius: ${config.cornerRadius || 12}px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  opacity: ${config.opacity || 1};
  ${config.absoluteBoundingBox ? `
  width: ${config.absoluteBoundingBox.width}px;
  min-height: ${config.absoluteBoundingBox.height}px;` : ''}
}

.mep-${name}:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

`;
  }

  // Generar archivos de tokens
  async generateTokenFiles(variables, components) {
    const tokensDir = path.join(process.cwd(), '..', 'frontend', 'src', 'tokens');
    
    try {
      await fs.mkdir(tokensDir, { recursive: true });
    } catch (error) {
      // Directorio ya existe
    }

    const timestamp = new Date().toISOString();

    // Generar archivo de colores (sobrescribir el existente)
    await fs.writeFile(
      path.join(tokensDir, 'colors.js'),
      `// 🎨 Colores sincronizados desde Figma
// Última actualización: ${timestamp}

export const mepColors = ${JSON.stringify(variables.colors, null, 2)};

export default mepColors;
`
    );

    // Generar archivo de espaciado (sobrescribir el existente)
    await fs.writeFile(
      path.join(tokensDir, 'spacing.js'),
      `// 📏 Espaciado sincronizado desde Figma
// Última actualización: ${timestamp}

export const mepSpacing = ${JSON.stringify(variables.spacing, null, 2)};

export default mepSpacing;
`
    );

    // Generar archivo de tipografía
    await fs.writeFile(
      path.join(tokensDir, 'typography.js'),
      `// ✍️ Tipografía sincronizada desde Figma
// Última actualización: ${timestamp}

export const mepTypography = ${JSON.stringify(variables.typography, null, 2)};

export default mepTypography;
`
    );

    // Generar archivo de componentes
    await fs.writeFile(
      path.join(tokensDir, 'components.js'),
      `// 🧩 Componentes sincronizados desde Figma
// Última actualización: ${timestamp}

export const mepComponents = ${JSON.stringify(components, null, 2)};

export default mepComponents;
`
    );

    // Generar CSS completo
    const componentCSS = this.generateComponentCSS(components);
    await fs.writeFile(
      path.join(tokensDir, 'mep-components.css'),
      `/* 🎨 MEP Components CSS - Generado desde Figma */
/* Última actualización: ${timestamp} */

/* CSS Custom Properties */
:root {
${Object.entries(variables.colors).map(([key, value]) => `  --mep-color-${key}: ${value};`).join('\n')}
${Object.entries(variables.spacing).map(([key, value]) => `  --mep-spacing-${key}: ${value};`).join('\n')}
}

${componentCSS}
`
    );

    // Actualizar archivo principal de tokens (sobrescribir el existente)
    await fs.writeFile(
      path.join(tokensDir, 'index.js'),
      `// 🎯 Design Tokens de MEP Projects
// Sincronizado automáticamente desde Figma
// Última actualización: ${timestamp}

import { mepColors } from './colors.js';
import { mepSpacing } from './spacing.js';
import { mepTypography } from './typography.js';
import { mepComponents } from './components.js';

export { mepColors, mepSpacing, mepTypography, mepComponents };

// Función para aplicar tokens dinámicamente
export const applyMEPTokens = () => {
  const root = document.documentElement;
  
  // Aplicar colores como CSS custom properties
  Object.entries(mepColors).forEach(([key, value]) => {
    root.style.setProperty(\`--mep-color-\${key}\`, value);
  });
  
  // Aplicar espaciado
  Object.entries(mepSpacing).forEach(([key, value]) => {
    root.style.setProperty(\`--mep-spacing-\${key}\`, value);
  });
  
  console.log('🎨 Tokens MEP aplicados al DOM');
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

    console.log('✅ Archivos de tokens generados exitosamente en:', tokensDir);
  }

  // Sincronizar todo
  async syncAll() {
    try {
      console.log('🚀 Iniciando sincronización completa con Figma...');
      console.log(`📁 Archivo: ${this.fileKey}`);
      
      const [variables, fileData] = await Promise.all([
        this.getLocalVariables(),
        this.getFileData()
      ]);

      console.log(`📊 Variables encontradas: ${Object.keys(variables).length}`);

      const processedVariables = this.processVariables(variables);
      const components = this.extractComponents(fileData);

      console.log(`🎨 Colores extraídos: ${Object.keys(processedVariables.colors).length}`);
      console.log(`📏 Espaciados extraídos: ${Object.keys(processedVariables.spacing).length}`);
      console.log(`🧩 Componentes extraídos: ${Object.keys(components.buttons).length + Object.keys(components.inputs).length + Object.keys(components.cards).length}`);

      await this.generateTokenFiles(processedVariables, components);

      const result = { 
        variables: processedVariables, 
        components,
        stats: {
          colors: Object.keys(processedVariables.colors).length,
          spacing: Object.keys(processedVariables.spacing).length,
          typography: Object.keys(processedVariables.typography).length,
          buttons: Object.keys(components.buttons).length,
          inputs: Object.keys(components.inputs).length,
          cards: Object.keys(components.cards).length
        }
      };

      console.log('✅ Sincronización completada exitosamente');
      return result;
    } catch (error) {
      console.error('❌ Error en sincronización:', error.message);
      throw error;
    }
  }
}

// Si se ejecuta directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const sync = new MEPFigmaSyncAdvanced();
  sync.syncAll().catch(console.error);
}
