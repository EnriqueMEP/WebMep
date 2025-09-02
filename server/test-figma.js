// server/test-figma.js
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const token = process.env.FIGMA_ACCESS_TOKEN;
const fileKey = process.env.FIGMA_FILE_KEY;

console.log('🔍 Testando conexión con Figma...');
console.log('Token length:', token ? token.length : 'No token');
console.log('File key:', fileKey);

async function testConnection() {
  try {
    const response = await fetch(`https://api.figma.com/v1/files/${fileKey}`, {
      headers: {
        'X-Figma-Token': token,
      },
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers.get('content-type'));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      return;
    }

    const data = await response.json();
    console.log('✅ Conexión exitosa!');
    console.log('Archivo:', data.name);
    console.log('Última modificación:', data.lastModified);
    
    // Intentar obtener variables
    console.log('\n🎨 Probando variables...');
    const variablesResponse = await fetch(`https://api.figma.com/v1/files/${fileKey}/variables/local`, {
      headers: {
        'X-Figma-Token': token,
      },
    });
    
    if (variablesResponse.ok) {
      const variablesData = await variablesResponse.json();
      console.log('Variables encontradas:', Object.keys(variablesData.meta.variables).length);
    } else {
      console.log('Variables response status:', variablesResponse.status);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testConnection();
