// server/figma-sync.js
import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';

export default class MEPFigmaSync {
  constructor() {
    this.token = process.env.FIGMA_ACCESS_TOKEN;
    this.fileKey = process.env.FIGMA_FILE_KEY;
    this.baseUrl = 'https://api.figma.com/v1';
  }

  async makeRequest(endpoint) {
    if (!this.token || !this.fileKey) {
      console.log('⚠️ Token o File Key de Figma no configurados, usando tokens mock');
      return this.getMockData(endpoint);
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'X-Figma-Token': this.token,
        },
      });

      if (!response.ok) {
        throw new Error(`Figma API error: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.log('⚠️ Error conectando con Figma API, usando tokens mock:', error.message);
      return this.getMockData(endpoint);
    }
  }

  getMockData(endpoint) {
    if (endpoint.includes('variables/local')) {
      return {
        meta: {
          variables: {
            'primary-color': {
              name: 'MEP Green Primary',
              resolvedType: 'COLOR',
              valuesByMode: {
                'default': { r: 0.133, g: 0.773, b: 0.369, a: 1 }
              }
            },
            'secondary-color': {
              name: 'MEP Gray',
              resolvedType: 'COLOR',
              valuesByMode: {
                'default': { r: 0.4, g: 0.4, b: 0.4, a: 1 }
              }
            },
            'spacing-small': {
              name: 'Spacing Small',
              resolvedType: 'FLOAT',
              valuesByMode: {
                'default': 8
              }
            },
            'spacing-medium': {
              name: 'Spacing Medium',
              resolvedType: 'FLOAT',
              valuesByMode: {
                'default': 16
              }
            }
          }
        }
      };
    }
    
    return {
      document: {
        children: [{
          name: 'Button Primary',
          type: 'COMPONENT',
          absoluteBoundingBox: { width: 120, height: 40 },
          cornerRadius: 8,
          fills: [{ type: 'SOLID', color: { r: 0.133, g: 0.773, b: 0.369 } }],
          children: []
        }]
      }
    };
  }

  // Obtener variables locales del archivo
  async getLocalVariables() {
    console.log('🎨 Obteniendo variables locales de Figma...');
    const data = await this.makeRequest(`/files/${this.fileKey}/variables/local`);
    return data.meta.variables;
  }

  // Obtener información del archivo para componentes
  async getFileData() {
    console.log('📄 Obteniendo datos del archivo de Figma...');
    const data = await this.makeRequest(`/files/${this.fileKey}`);
    return data;
  }

  // Procesar variables según el tipo
  processVariables(variables) {
    const processed = {
      colors: {},
      spacing: {},
      typography: {},
      buttons: {},
      effects: {}
    };

    Object.values(variables).forEach(variable => {
      const name = variable.name.toLowerCase();
      const resolvedType = variable.resolvedType;
      
      // Obtener el valor por defecto (primer modo disponible)
      const defaultModeId = Object.keys(variable.valuesByMode)[0];
      const value = variable.valuesByMode[defaultModeId];

      switch (resolvedType) {
        case 'COLOR':
          processed.colors[this.camelCase(name)] = this.rgbaToHex(value);
          break;
        case 'FLOAT':
          if (name.includes('spacing') || name.includes('gap') || name.includes('margin') || name.includes('padding')) {
            processed.spacing[this.camelCase(name)] = `${value}px`;
          }
          break;
        case 'STRING':
          if (name.includes('font') || name.includes('text')) {
            processed.typography[this.camelCase(name)] = value;
          }
          break;
      }
    });

    return processed;
  }

  // Convertir RGBA a HEX
  rgbaToHex(rgba) {
    if (typeof rgba === 'object' && rgba.r !== undefined) {
      const r = Math.round(rgba.r * 255);
      const g = Math.round(rgba.g * 255);
      const b = Math.round(rgba.b * 255);
      const a = rgba.a || 1;
      
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
      .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase());
  }

  // Extraer información de componentes Button
  extractButtonComponents(fileData) {
    const buttons = {};
    
    const findButtons = (node) => {
      if (node.name && node.name.toLowerCase().includes('button')) {
        // Extraer propiedades del botón
        buttons[this.camelCase(node.name)] = {
          width: node.absoluteBoundingBox?.width,
          height: node.absoluteBoundingBox?.height,
          borderRadius: node.cornerRadius,
          fills: node.fills,
          effects: node.effects,
          constraints: node.constraints
        };
      }
      
      if (node.children) {
        node.children.forEach(findButtons);
      }
    };

    fileData.document.children.forEach(findButtons);
    return buttons;
  }

  // Generar archivos de tokens
  async generateTokenFiles(variables, buttons) {
    const tokensDir = path.join(process.cwd(), '..', 'frontend', 'src', 'tokens');
    
    try {
      await fs.mkdir(tokensDir, { recursive: true });
    } catch (error) {
      // Directorio ya existe
    }

    // Generar archivo de colores
    await fs.writeFile(
      path.join(tokensDir, 'colors.js'),
      `// 🎨 Colores sincronizados desde Figma
// Última actualización: ${new Date().toISOString()}

export const mepColors = ${JSON.stringify(variables.colors, null, 2)};

export default mepColors;
`
    );

    // Generar archivo de espaciado
    await fs.writeFile(
      path.join(tokensDir, 'spacing.js'),
      `// 📏 Espaciado sincronizado desde Figma
// Última actualización: ${new Date().toISOString()}

export const mepSpacing = ${JSON.stringify(variables.spacing, null, 2)};

export default mepSpacing;
`
    );

    // Generar archivo de tipografía
    await fs.writeFile(
      path.join(tokensDir, 'typography.js'),
      `// ✍️ Tipografía sincronizada desde Figma
// Última actualización: ${new Date().toISOString()}

export const mepTypography = ${JSON.stringify(variables.typography, null, 2)};

export default mepTypography;
`
    );

    // Generar archivo de botones
    await fs.writeFile(
      path.join(tokensDir, 'buttons.js'),
      `// 🔘 Componentes Button sincronizados desde Figma
// Última actualización: ${new Date().toISOString()}

export const mepButtons = ${JSON.stringify(buttons, null, 2)};

export default mepButtons;
`
    );

    console.log('✅ Archivos de tokens generados exitosamente');
  }

  // Sincronizar todo
  async syncAll() {
    try {
      console.log('🚀 Iniciando sincronización completa con Figma...');
      
      const [variables, fileData] = await Promise.all([
        this.getLocalVariables(),
        this.getFileData()
      ]);

      const processedVariables = this.processVariables(variables);
      const buttons = this.extractButtonComponents(fileData);

      await this.generateTokenFiles(processedVariables, buttons);

      console.log('✅ Sincronización completada');
      return { variables: processedVariables, buttons };
    } catch (error) {
      console.error('❌ Error en sincronización:', error);
      throw error;
    }
  }

  // Método legacy para compatibilidad
  async syncTokens() {
    const result = await this.syncAll();
    return result.variables;
  }
}

// Si se ejecuta directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const sync = new MEPFigmaSync();
  sync.syncAll().then(() => {
    console.log('🎉 Sincronización completada exitosamente');
  }).catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
}
