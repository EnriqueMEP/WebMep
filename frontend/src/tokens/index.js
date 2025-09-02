// frontend/src/tokens/index.js
export { mepColors } from './colors';
export { mepSpacing } from './spacing';

// Función para aplicar tokens dinámicamente
export const applyMEPTokens = (tokens = {}) => {
  console.log('🎨 Aplicando tokens MEP:', tokens);
  
  // Aquí se aplicarían los tokens a CSS custom properties
  if (typeof document !== 'undefined') {
    const root = document.documentElement;
    
    // Aplicar colores
    if (tokens.colors) {
      Object.entries(tokens.colors).forEach(([key, value]) => {
        root.style.setProperty(`--mep-color-${key}`, value);
      });
    }
    
    // Aplicar espaciado
    if (tokens.spacing) {
      Object.entries(tokens.spacing).forEach(([key, value]) => {
        root.style.setProperty(`--mep-spacing-${key}`, value);
      });
    }
  }
};
