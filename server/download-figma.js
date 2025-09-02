// server/download-figma.js
import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const token = process.env.FIGMA_ACCESS_TOKEN;
const fileKey = process.env.FIGMA_FILE_KEY;

console.log('📥 Descargando archivo de Figma...');
console.log('Token length:', token?.length);
console.log('File key:', fileKey);

async function downloadFigmaFile() {
  try {
    console.log('🌐 Haciendo petición a Figma API...');
    
    const response = await fetch(`https://api.figma.com/v1/files/${fileKey}`, {
      headers: {
        'X-Figma-Token': token,
      },
      timeout: 10000 // 10 segundos timeout
    });

    console.log('📡 Respuesta recibida:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error:', response.status, errorText);
      return;
    }

    console.log('📊 Parseando JSON...');
    const data = await response.json();
    
    console.log('✅ Datos obtenidos correctamente');
    console.log('📄 Archivo:', data.name);
    console.log('📅 Última modificación:', data.lastModified);
    console.log('📋 Páginas:', data.document?.children?.length || 0);

    // Guardar el JSON completo para análisis
    const outputPath = path.join(process.cwd(), 'figma-data.json');
    await fs.writeFile(outputPath, JSON.stringify(data, null, 2));
    console.log('💾 Archivo guardado en:', outputPath);

    // Análisis básico
    let nodeCount = 0;
    let componentCount = 0;
    const colors = new Set();

    function analyzeNode(node) {
      nodeCount++;
      if (node.type === 'COMPONENT') componentCount++;
      
      if (node.fills) {
        node.fills.forEach(fill => {
          if (fill.type === 'SOLID' && fill.color) {
            const hex = rgbaToHex(fill.color);
            colors.add(hex);
          }
        });
      }

      if (node.children) {
        node.children.forEach(child => analyzeNode(child));
      }
    }

    if (data.document?.children) {
      data.document.children.forEach(page => analyzeNode(page));
    }

    console.log('📊 Análisis rápido:');
    console.log(`  - Nodos totales: ${nodeCount}`);
    console.log(`  - Componentes: ${componentCount}`);
    console.log(`  - Colores únicos: ${colors.size}`);

    return data;
  } catch (error) {
    console.error('❌ Error en descarga:', error.message);
    return null;
  }
}

function rgbaToHex(rgba) {
  const r = Math.round((rgba.r || 0) * 255);
  const g = Math.round((rgba.g || 0) * 255);
  const b = Math.round((rgba.b || 0) * 255);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

downloadFigmaFile();
