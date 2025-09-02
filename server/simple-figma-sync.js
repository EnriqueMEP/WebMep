// server/simple-figma-sync.js
import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const token = process.env.FIGMA_ACCESS_TOKEN;
const fileKey = process.env.FIGMA_FILE_KEY;

console.log('🚀 Iniciando sincronización simple con Figma...');

async function syncFigma() {
  try {
    // 1. Obtener datos del archivo
    console.log('📄 Obteniendo archivo...');
    const response = await fetch(`https://api.figma.com/v1/files/${fileKey}`, {
      headers: { 'X-Figma-Token': token },
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`✅ Archivo obtenido: ${data.name}`);

    // 2. Extraer colores básicos
    const colors = extractColors(data);
    console.log(`🎨 Colores encontrados: ${Object.keys(colors).length}`);

    // 3. Extraer espaciado básico
    const spacing = extractSpacing(data);
    console.log(`📏 Espaciados encontrados: ${Object.keys(spacing).length}`);

    // 4. Extraer componentes básicos
    const components = extractComponents(data);
    console.log(`🧩 Componentes encontrados: ${Object.keys(components).length}`);

    // 5. Generar archivos
    await generateFiles(colors, spacing, components);
    console.log('✅ Archivos generados exitosamente');

    return { colors, spacing, components };
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

function extractColors(data) {
  const colors = {};
  let colorIndex = 1;

  function processNode(node) {
    if (!node) return;

    // Extraer colores de fills
    if (node.fills && node.fills.length > 0) {
      node.fills.forEach(fill => {
        if (fill.type === 'SOLID' && fill.color) {
          const color = rgbaToHex(fill.color);
          const name = node.name ? camelCase(node.name) : `color${colorIndex++}`;
          colors[name] = color;
        }
      });
    }

    // Procesar hijos
    if (node.children) {
      node.children.forEach(child => processNode(child));
    }
  }

  if (data.document && data.document.children) {
    data.document.children.forEach(page => processNode(page));
  }

  return colors;
}

function extractSpacing(data) {
  const spacing = {};

  function processNode(node) {
    if (!node) return;

    if (node.type === 'COMPONENT' && node.absoluteBoundingBox) {
      const name = camelCase(node.name);
      const { width, height } = node.absoluteBoundingBox;
      
      // Solo guardar tamaños comunes
      if (isCommonSize(width)) {
        spacing[`${name}Width`] = `${Math.round(width)}px`;
      }
      if (isCommonSize(height)) {
        spacing[`${name}Height`] = `${Math.round(height)}px`;
      }

      // Extraer padding si existe
      if (node.paddingLeft) spacing[`${name}PaddingX`] = `${node.paddingLeft}px`;
      if (node.paddingTop) spacing[`${name}PaddingY`] = `${node.paddingTop}px`;
      if (node.itemSpacing) spacing[`${name}Gap`] = `${node.itemSpacing}px`;
      if (node.cornerRadius) spacing[`${name}Radius`] = `${node.cornerRadius}px`;
    }

    if (node.children) {
      node.children.forEach(child => processNode(child));
    }
  }

  if (data.document && data.document.children) {
    data.document.children.forEach(page => processNode(page));
  }

  return spacing;
}

function extractComponents(data) {
  const components = {};

  function processNode(node) {
    if (!node) return;

    if (node.type === 'COMPONENT') {
      const name = camelCase(node.name);
      components[name] = {
        id: node.id,
        name: node.name,
        width: node.absoluteBoundingBox?.width,
        height: node.absoluteBoundingBox?.height,
        cornerRadius: node.cornerRadius,
        fills: node.fills || [],
        opacity: node.opacity
      };
    }

    if (node.children) {
      node.children.forEach(child => processNode(child));
    }
  }

  if (data.document && data.document.children) {
    data.document.children.forEach(page => processNode(page));
  }

  return components;
}

function isCommonSize(size) {
  const common = [8, 12, 16, 20, 24, 32, 40, 48, 56, 64, 80, 96];
  return common.some(s => Math.abs(size - s) <= 2);
}

function rgbaToHex(rgba) {
  if (!rgba || typeof rgba !== 'object') return '#000000';
  
  const r = Math.round((rgba.r || 0) * 255);
  const g = Math.round((rgba.g || 0) * 255);
  const b = Math.round((rgba.b || 0) * 255);
  
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function camelCase(str) {
  if (!str) return 'unnamed';
  return str
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
    .replace(/^[A-Z]/, chr => chr.toLowerCase());
}

async function generateFiles(colors, spacing, components) {
  const tokensDir = path.join(process.cwd(), '..', 'frontend', 'src', 'tokens');
  
  try {
    await fs.mkdir(tokensDir, { recursive: true });
  } catch (error) {
    // Directorio ya existe
  }

  const timestamp = new Date().toISOString();

  // Colores
  await fs.writeFile(
    path.join(tokensDir, 'colors.js'),
    `// 🎨 Colores sincronizados desde Figma\n// ${timestamp}\n\nexport const mepColors = ${JSON.stringify(colors, null, 2)};\n\nexport default mepColors;\n`
  );

  // Espaciado
  await fs.writeFile(
    path.join(tokensDir, 'spacing.js'),
    `// 📏 Espaciado sincronizado desde Figma\n// ${timestamp}\n\nexport const mepSpacing = ${JSON.stringify(spacing, null, 2)};\n\nexport default mepSpacing;\n`
  );

  // Componentes
  await fs.writeFile(
    path.join(tokensDir, 'components.js'),
    `// 🧩 Componentes sincronizados desde Figma\n// ${timestamp}\n\nexport const mepComponents = ${JSON.stringify(components, null, 2)};\n\nexport default mepComponents;\n`
  );

  // CSS
  const css = generateCSS(colors, spacing, components);
  await fs.writeFile(path.join(tokensDir, 'mep-design-system.css'), css);

  // Index actualizado
  await fs.writeFile(
    path.join(tokensDir, 'index.js'),
    `// 🎯 MEP Design System\n// Sincronizado desde Figma: ${timestamp}\n\nimport { mepColors } from './colors.js';\nimport { mepSpacing } from './spacing.js';\nimport { mepComponents } from './components.js';\n\nexport { mepColors, mepSpacing, mepComponents };\n\nexport const applyMEPTokens = () => {\n  const root = document.documentElement;\n  \n  Object.entries(mepColors).forEach(([key, value]) => {\n    root.style.setProperty(\`--mep-color-\${key}\`, value);\n  });\n  \n  Object.entries(mepSpacing).forEach(([key, value]) => {\n    root.style.setProperty(\`--mep-spacing-\${key}\`, value);\n  });\n  \n  console.log('🎨 MEP Design System aplicado');\n};\n\nexport const mepTokens = { colors: mepColors, spacing: mepSpacing, components: mepComponents };\nexport default mepTokens;\n`
  );

  console.log(`📁 Archivos guardados en: ${tokensDir}`);
}

function generateCSS(colors, spacing, components) {
  const timestamp = new Date().toISOString();
  
  let css = `/* 🎨 MEP Design System CSS */\n/* Generado desde Figma: ${timestamp} */\n\n:root {\n`;
  
  // Variables CSS para colores
  Object.entries(colors).forEach(([key, value]) => {
    css += `  --mep-color-${key}: ${value};\n`;
  });
  
  // Variables CSS para espaciado  
  Object.entries(spacing).forEach(([key, value]) => {
    css += `  --mep-spacing-${key}: ${value};\n`;
  });
  
  css += `}\n\n/* Utilidades de color */\n`;
  Object.entries(colors).forEach(([key, value]) => {
    css += `.mep-bg-${key} { background-color: var(--mep-color-${key}); }\n`;
    css += `.mep-text-${key} { color: var(--mep-color-${key}); }\n`;
  });

  css += `\n/* Utilidades de espaciado */\n`;
  Object.entries(spacing).forEach(([key, value]) => {
    css += `.mep-${key} { ${key.includes('Width') ? 'width' : key.includes('Height') ? 'height' : key.includes('Padding') ? 'padding' : key.includes('Gap') ? 'gap' : key.includes('Radius') ? 'border-radius' : 'margin'}: var(--mep-spacing-${key}); }\n`;
  });

  return css;
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  syncFigma().catch(console.error);
}

export default { syncFigma };
