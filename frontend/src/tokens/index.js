// 🎯 MEP Design System
// Extraído automáticamente del Design System de Figma
// Generado: 2025-09-02T11:46:38.198Z

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
    root.style.setProperty(`--mep-color-${key}`, value);
  });
  
  // Aplicar espaciado
  Object.entries(mepSpacing).forEach(([key, value]) => {
    root.style.setProperty(`--mep-spacing-${key}`, value);
  });
  
  console.log('🎨 MEP Design System aplicado al DOM');
  console.log(`   - ${Object.keys(mepColors).length} colores`);
  console.log(`   - ${Object.keys(mepSpacing).length} espaciados`);
  console.log(`   - ${Object.keys(mepComponents).length} componentes`);
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
