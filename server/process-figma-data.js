// server/process-figma-data.js
import fs from 'fs/promises';
import path from 'path';

console.log('🔄 Procesando datos de Figma...');

async function processFigmaData() {
  try {
    // Leer el archivo JSON descargado
    const dataPath = path.join(process.cwd(), 'figma-data.json');
    const rawData = await fs.readFile(dataPath, 'utf8');
    const data = JSON.parse(rawData);

    console.log(`📄 Procesando: ${data.name}`);
    console.log(`📅 Modificado: ${data.lastModified}`);

    // Extraer tokens
    const colors = extractColors(data);
    const spacing = extractSpacing(data);
    const typography = extractTypography(data);
    const components = extractComponents(data);

    console.log(`🎨 Colores: ${Object.keys(colors).length}`);
    console.log(`📏 Espaciado: ${Object.keys(spacing).length}`);
    console.log(`✍️ Tipografía: ${Object.keys(typography).length}`);
    console.log(`🧩 Componentes: ${Object.keys(components).length}`);

    // Generar archivos
    await generateTokenFiles(colors, spacing, typography, components);
    
    console.log('✅ Procesamiento completado');
    return { colors, spacing, typography, components };
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

function extractColors(data) {
  const colors = {};
  const colorMap = new Map();

  function processNode(node) {
    if (!node) return;

    if (node.fills && node.fills.length > 0) {
      node.fills.forEach(fill => {
        if (fill.type === 'SOLID' && fill.color) {
          const hex = rgbaToHex(fill.color);
          const name = sanitizeName(node.name);
          
          if (name && !colorMap.has(hex)) {
            colors[name] = hex;
            colorMap.set(hex, name);
          }
        }
      });
    }

    if (node.children) {
      node.children.forEach(child => processNode(child));
    }
  }

  if (data.document?.children) {
    data.document.children.forEach(page => {
      console.log(`  📄 Procesando página: ${page.name}`);
      processNode(page);
    });
  }

  return colors;
}

function extractSpacing(data) {
  const spacing = {};

  function processNode(node) {
    if (!node) return;

    // Extraer dimensiones de componentes
    if ((node.type === 'COMPONENT' || node.type === 'FRAME') && node.absoluteBoundingBox) {
      const name = sanitizeName(node.name);
      const { width, height } = node.absoluteBoundingBox;

      if (name && isCommonSize(width)) {
        spacing[`${name}Width`] = `${Math.round(width)}px`;
      }
      if (name && isCommonSize(height)) {
        spacing[`${name}Height`] = `${Math.round(height)}px`;
      }

      // Extraer padding
      if (node.paddingLeft && node.paddingLeft > 0) {
        spacing[`${name}PaddingX`] = `${node.paddingLeft}px`;
      }
      if (node.paddingTop && node.paddingTop > 0) {
        spacing[`${name}PaddingY`] = `${node.paddingTop}px`;
      }

      // Extraer gap de Auto Layout
      if (node.itemSpacing && node.itemSpacing > 0) {
        spacing[`${name}Gap`] = `${node.itemSpacing}px`;
      }

      // Extraer border radius
      if (node.cornerRadius && node.cornerRadius > 0) {
        spacing[`${name}Radius`] = `${node.cornerRadius}px`;
      }
    }

    if (node.children) {
      node.children.forEach(child => processNode(child));
    }
  }

  if (data.document?.children) {
    data.document.children.forEach(page => processNode(page));
  }

  return spacing;
}

function extractTypography(data) {
  const typography = {};

  function processNode(node) {
    if (!node) return;

    if (node.type === 'TEXT' && node.style) {
      const name = sanitizeName(node.name);
      const style = node.style;

      if (name && style.fontFamily) {
        typography[name] = {
          fontFamily: style.fontFamily,
          fontSize: style.fontSize ? `${style.fontSize}px` : '16px',
          fontWeight: style.fontWeight || 400,
          lineHeight: style.lineHeightPx ? `${style.lineHeightPx}px` : 'normal',
          letterSpacing: style.letterSpacing ? `${style.letterSpacing}px` : 'normal'
        };
      }
    }

    if (node.children) {
      node.children.forEach(child => processNode(child));
    }
  }

  if (data.document?.children) {
    data.document.children.forEach(page => processNode(page));
  }

  return typography;
}

function extractComponents(data) {
  const components = {};

  function processNode(node) {
    if (!node) return;

    if (node.type === 'COMPONENT') {
      const name = sanitizeName(node.name);
      
      if (name) {
        components[name] = {
          id: node.id,
          name: node.name,
          type: categorizeComponent(node.name),
          width: node.absoluteBoundingBox?.width,
          height: node.absoluteBoundingBox?.height,
          cornerRadius: node.cornerRadius,
          opacity: node.opacity,
          styles: extractNodeStyles(node)
        };
      }
    }

    if (node.children) {
      node.children.forEach(child => processNode(child));
    }
  }

  if (data.document?.children) {
    data.document.children.forEach(page => processNode(page));
  }

  return components;
}

function categorizeComponent(name) {
  const lowerName = name.toLowerCase();
  
  if (lowerName.includes('button') || lowerName.includes('btn')) return 'button';
  if (lowerName.includes('input') || lowerName.includes('field')) return 'input';
  if (lowerName.includes('card')) return 'card';
  if (lowerName.includes('modal') || lowerName.includes('dialog')) return 'modal';
  if (lowerName.includes('nav') || lowerName.includes('menu')) return 'navigation';
  if (lowerName.includes('icon')) return 'icon';
  
  return 'other';
}

function extractNodeStyles(node) {
  const styles = {};

  if (node.fills && node.fills.length > 0) {
    const fill = node.fills[0];
    if (fill.type === 'SOLID' && fill.color) {
      styles.backgroundColor = rgbaToHex(fill.color);
    }
  }

  if (node.strokes && node.strokes.length > 0) {
    const stroke = node.strokes[0];
    if (stroke.color) {
      styles.borderColor = rgbaToHex(stroke.color);
      styles.borderWidth = `${node.strokeWeight || 1}px`;
    }
  }

  if (node.cornerRadius) {
    styles.borderRadius = `${node.cornerRadius}px`;
  }

  if (node.effects && node.effects.length > 0) {
    const shadows = node.effects
      .filter(effect => effect.type === 'DROP_SHADOW')
      .map(shadow => {
        const color = shadow.color ? rgbaToHex(shadow.color) : 'rgba(0,0,0,0.1)';
        return `${shadow.offset?.x || 0}px ${shadow.offset?.y || 0}px ${shadow.radius || 0}px ${color}`;
      });
    
    if (shadows.length > 0) {
      styles.boxShadow = shadows.join(', ');
    }
  }

  return styles;
}

function sanitizeName(name) {
  if (!name || typeof name !== 'string') return null;
  
  return name
    .toLowerCase()
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .replace(/^[0-9]/, 'n$&')
    .replace(/_{2,}/g, '_')
    .replace(/^_|_$/g, '')
    .substring(0, 50)
    || null;
}

function isCommonSize(size) {
  if (!size || size < 8) return false;
  const common = [8, 12, 16, 20, 24, 28, 32, 40, 48, 56, 64, 80, 96, 112, 128];
  return common.some(s => Math.abs(size - s) <= 2);
}

function rgbaToHex(rgba) {
  if (!rgba || typeof rgba !== 'object') return '#000000';
  
  const r = Math.round((rgba.r || 0) * 255);
  const g = Math.round((rgba.g || 0) * 255);
  const b = Math.round((rgba.b || 0) * 255);
  
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

async function generateTokenFiles(colors, spacing, typography, components) {
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
    `// 🎨 Colores extraídos del Design System de Figma
// Generado: ${timestamp}

export const mepColors = ${JSON.stringify(colors, null, 2)};

// Utilidades CSS
export const colorUtilities = {
${Object.entries(colors).map(([key, value]) => `  '${key}': '${value}'`).join(',\n')}
};

export default mepColors;
`
  );

  // Generar espaciado
  await fs.writeFile(
    path.join(tokensDir, 'spacing.js'),
    `// 📏 Espaciado extraído del Design System de Figma
// Generado: ${timestamp}

export const mepSpacing = ${JSON.stringify(spacing, null, 2)};

export default mepSpacing;
`
  );

  // Generar tipografía
  await fs.writeFile(
    path.join(tokensDir, 'typography.js'),
    `// ✍️ Tipografía extraída del Design System de Figma
// Generado: ${timestamp}

export const mepTypography = ${JSON.stringify(typography, null, 2)};

export default mepTypography;
`
  );

  // Generar componentes
  await fs.writeFile(
    path.join(tokensDir, 'components.js'),
    `// 🧩 Componentes extraídos del Design System de Figma
// Generado: ${timestamp}

export const mepComponents = ${JSON.stringify(components, null, 2)};

// Agrupar por tipo
export const componentsByType = {
  buttons: Object.fromEntries(Object.entries(mepComponents).filter(([_, comp]) => comp.type === 'button')),
  inputs: Object.fromEntries(Object.entries(mepComponents).filter(([_, comp]) => comp.type === 'input')),
  cards: Object.fromEntries(Object.entries(mepComponents).filter(([_, comp]) => comp.type === 'card')),
  modals: Object.fromEntries(Object.entries(mepComponents).filter(([_, comp]) => comp.type === 'modal')),
  navigation: Object.fromEntries(Object.entries(mepComponents).filter(([_, comp]) => comp.type === 'navigation')),
  icons: Object.fromEntries(Object.entries(mepComponents).filter(([_, comp]) => comp.type === 'icon')),
  other: Object.fromEntries(Object.entries(mepComponents).filter(([_, comp]) => comp.type === 'other'))
};

export default mepComponents;
`
  );

  // Generar CSS completo
  const css = generateCompleteCSS(colors, spacing, typography, components);
  await fs.writeFile(path.join(tokensDir, 'mep-design-system.css'), css);

  // Actualizar index principal
  await fs.writeFile(
    path.join(tokensDir, 'index.js'),
    `// 🎯 MEP Design System
// Extraído automáticamente del Design System de Figma
// Generado: ${timestamp}

import { mepColors } from './colors.js';
import { mepSpacing } from './spacing.js';
import { mepTypography } from './typography.js';
import { mepComponents, componentsByType } from './components.js';

export { 
  mepColors, 
  mepSpacing, 
  mepTypography, 
  mepComponents, 
  componentsByType 
};

// Función para aplicar todos los tokens al DOM
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
  
  console.log('🎨 MEP Design System aplicado al DOM');
  console.log(\`   - \${Object.keys(mepColors).length} colores\`);
  console.log(\`   - \${Object.keys(mepSpacing).length} espaciados\`);
  console.log(\`   - \${Object.keys(mepComponents).length} componentes\`);
};

// Obtener estadísticas del design system
export const getDesignSystemStats = () => ({
  colors: Object.keys(mepColors).length,
  spacing: Object.keys(mepSpacing).length,
  typography: Object.keys(mepTypography).length,
  components: Object.keys(mepComponents).length,
  componentsByType: Object.fromEntries(
    Object.entries(componentsByType).map(([type, comps]) => [type, Object.keys(comps).length])
  )
});

export const mepTokens = {
  colors: mepColors,
  spacing: mepSpacing,
  typography: mepTypography,
  components: mepComponents
};

export default mepTokens;
`
  );

  console.log(`📁 Tokens generados en: ${tokensDir}`);
}

function generateCompleteCSS(colors, spacing, typography, components) {
  const timestamp = new Date().toISOString();
  
  let css = `/*
🎨 MEP Design System CSS
Extraído automáticamente del Design System de Figma
Generado: ${timestamp}

Estadísticas:
- Colores: ${Object.keys(colors).length}
- Espaciados: ${Object.keys(spacing).length}
- Tipografías: ${Object.keys(typography).length}
- Componentes: ${Object.keys(components).length}
*/

:root {
  /* 🎨 Colores del Design System */
${Object.entries(colors).map(([key, value]) => `  --mep-color-${key}: ${value};`).join('\n')}
  
  /* 📏 Espaciado del Design System */
${Object.entries(spacing).map(([key, value]) => `  --mep-spacing-${key}: ${value};`).join('\n')}
}

/* 🎨 Utilidades de Color */
${Object.entries(colors).map(([key]) => `.mep-bg-${key} { background-color: var(--mep-color-${key}); }
.mep-text-${key} { color: var(--mep-color-${key}); }
.mep-border-${key} { border-color: var(--mep-color-${key}); }`).join('\n')}

/* 📏 Utilidades de Espaciado */
${Object.entries(spacing).map(([key]) => {
  if (key.includes('Width')) return `.mep-w-${key.replace('Width', '')} { width: var(--mep-spacing-${key}); }`;
  if (key.includes('Height')) return `.mep-h-${key.replace('Height', '')} { height: var(--mep-spacing-${key}); }`;
  if (key.includes('PaddingX')) return `.mep-px-${key.replace('PaddingX', '')} { padding-left: var(--mep-spacing-${key}); padding-right: var(--mep-spacing-${key}); }`;
  if (key.includes('PaddingY')) return `.mep-py-${key.replace('PaddingY', '')} { padding-top: var(--mep-spacing-${key}); padding-bottom: var(--mep-spacing-${key}); }`;
  if (key.includes('Gap')) return `.mep-gap-${key.replace('Gap', '')} { gap: var(--mep-spacing-${key}); }`;
  if (key.includes('Radius')) return `.mep-rounded-${key.replace('Radius', '')} { border-radius: var(--mep-spacing-${key}); }`;
  return `.mep-${key} { margin: var(--mep-spacing-${key}); }`;
}).join('\n')}

/* ✍️ Estilos de Tipografía */
${Object.entries(typography).map(([key, config]) => `.mep-text-${key} {
  font-family: ${config.fontFamily};
  font-size: ${config.fontSize};
  font-weight: ${config.fontWeight};
  line-height: ${config.lineHeight};
  letter-spacing: ${config.letterSpacing};
}`).join('\n\n')}

/* 🧩 Componentes del Design System */
${Object.entries(components).map(([key, config]) => {
  const styles = config.styles || {};
  return `.mep-component-${key} {
  ${styles.backgroundColor ? `background-color: ${styles.backgroundColor};` : ''}
  ${styles.borderColor ? `border-color: ${styles.borderColor};` : ''}
  ${styles.borderWidth ? `border-width: ${styles.borderWidth};` : ''}
  ${styles.borderRadius ? `border-radius: ${styles.borderRadius};` : ''}
  ${styles.boxShadow ? `box-shadow: ${styles.boxShadow};` : ''}
  ${config.width ? `width: ${config.width}px;` : ''}
  ${config.height ? `height: ${config.height}px;` : ''}
  ${config.opacity !== undefined ? `opacity: ${config.opacity};` : ''}
}`;
}).join('\n\n')}

/* 🎯 Clases de utilidad generales */
.mep-design-system-ready {
  --mep-version: "1.0.0";
  --mep-source: "figma";
  --mep-generated: "${timestamp}";
}

.mep-hidden { display: none !important; }
.mep-block { display: block !important; }
.mep-flex { display: flex !important; }
.mep-grid { display: grid !important; }
.mep-relative { position: relative !important; }
.mep-absolute { position: absolute !important; }
.mep-fixed { position: fixed !important; }
.mep-sticky { position: sticky !important; }

/* Animaciones sutiles */
.mep-transition { transition: all 0.2s ease; }
.mep-hover-lift:hover { transform: translateY(-2px); }
.mep-hover-scale:hover { transform: scale(1.05); }
`;

  return css;
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  processFigmaData().catch(console.error);
}

export { processFigmaData };
