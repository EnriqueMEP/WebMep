// server/figma-sync-simple.js
import { processFigmaData } from './process-figma-data.js';
import fs from 'fs/promises';
import path from 'path';

export default class MEPFigmaSyncSimple {
  constructor() {
    this.dataFile = path.join(process.cwd(), 'figma-data.json');
  }

  async syncAll() {
    try {
      console.log('🔄 Iniciando sincronización con datos locales...');
      
      // Verificar si el archivo de datos existe
      try {
        await fs.access(this.dataFile);
      } catch (error) {
        throw new Error('Archivo de datos de Figma no encontrado. Ejecuta download-figma.js primero.');
      }

      // Procesar los datos de Figma
      const result = await processFigmaData();
      
      console.log('✅ Sincronización completada');
      return result;
    } catch (error) {
      console.error('❌ Error en sincronización:', error.message);
      throw error;
    }
  }

  async extractAll() {
    return this.syncAll();
  }
}
