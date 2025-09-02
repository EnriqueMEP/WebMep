import axios from 'axios';
import fs from 'fs';
import path from 'path';

class MEPFigmaSync {
  constructor() {
    this.token = process.env.FIGMA_ACCESS_TOKEN;
    this.fileKey = process.env.FIGMA_FILE_KEY;
  }

  async syncTokens() {
    console.log('🎨 MEP-Projects: Sincronizando tokens desde Figma...');
    
    try {
      const response = await axios.get(
        `https://api.figma.com/v1/files/${this.fileKey}/variables/local`,
        { headers: { 'X-Figma-Token': this.token } }
      );

      const tokens = this.parseTokens(response.data);
      await this.saveToReactFiles(tokens);
      
      return tokens;
    } catch (error) {
      console.error('❌ Error sync tokens:', error.message);
      throw error;
    }
  }

  parseTokens(data) {
    const mepTokens = {
      colors: {},
      spacing: {},
      radius: {}
    };

    if (data.meta?.variables) {
      Object.values(data.meta.variables).forEach(variable => {
        const cleanName = this.formatName(variable.name);
        const category = this.getCategory(variable.name);
        const value = this.parseValue(variable, category);
        
        if (mepTokens[category]) {
          mepTokens[category][cleanName] = value;
        }
      });
    }

    return mepTokens;
  }

  formatName(name) {
    return name
      .replace(/Primitive\/|Semantic\//g, '')
      .replace(/Color\/|Size\//g, '')
      .replace(/\//g, '_')
      .toLowerCase();
  }

  getCategory(name) {
    const lower = name.toLowerCase();
    if (lower.includes('color') || lower.includes('primary') || 
        lower.includes('surface') || lower.includes('olive') || 
        lower.includes('green')) return 'colors';
    if (lower.includes('padding') || lower.includes('gap') || 
        lower.includes('height')) return 'spacing';
    if (lower.includes('radius')) return 'radius';
    return 'colors';
  }

  parseValue(variable, category) {
    const modes = variable.valuesByMode || {};
    const value = modes['1:0'] || modes[Object.keys(modes)[0]];

    if (category === 'colors' && value?.r !== undefined) {
      const r = Math.round(value.r * 255);
      const g = Math.round(value.g * 255);
      const b = Math.round(value.b * 255);
      return `rgb(${r}, ${g}, ${b})`;
    }

    return typeof value === 'number' ? `${value}px` : value;
  }

  async saveToReactFiles(tokens) {
    const tokensDir = path.join(process.cwd(), 'frontend', 'src', 'tokens');
    
    if (!fs.existsSync(tokensDir)) {
      fs.mkdirSync(tokensDir, { recursive: true });
    }

    // Colores
    const colorsFile = `// 🎨 MEP-Projects Colors - Auto-sync Figma
export const mepColors = ${JSON.stringify(tokens.colors, null, 2)};

// CSS Variables
export const mepColorVars = {${Object.entries(tokens.colors).map(([k, v]) => 
  `\n  '--mep-${k}': '${v}'`
).join(',')}\n};
`;

    // Espaciado  
    const spacingFile = `// 📐 MEP-Projects Spacing - Auto-sync Figma
export const mepSpacing = ${JSON.stringify(tokens.spacing, null, 2)};

// CSS Variables
export const mepSpacingVars = {${Object.entries(tokens.spacing).map(([k, v]) => 
  `\n  '--mep-${k}': '${v}'`
).join(',')}\n};
`;

    // Índice principal
    const indexFile = `// 🚀 MEP-Projects Design Tokens
// Última actualización: ${new Date().toLocaleString()}

export { mepColors, mepColorVars } from './colors.js';
export { mepSpacing, mepSpacingVars } from './spacing.js';

// Helper para usar tokens
export const mep = (token) => {
  const [category, name] = token.split('.');
  if (category === 'color') return mepColors[name];
  if (category === 'spacing') return mepSpacing[name];
  return \`var(--mep-\${name})\`;
};

// Aplicar variables CSS automáticamente
export const applyMEPTokens = () => {
  const root = document.documentElement;
  Object.entries({...mepColorVars, ...mepSpacingVars}).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
};
`;

    fs.writeFileSync(path.join(tokensDir, 'colors.js'), colorsFile);
    fs.writeFileSync(path.join(tokensDir, 'spacing.js'), spacingFile);
    fs.writeFileSync(path.join(tokensDir, 'index.js'), indexFile);
    
    console.log('✅ Tokens MEP-Projects guardados en React');
  }
}

export default MEPFigmaSync;