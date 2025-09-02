// 🎯 Design Tokens de MEP Projects
// Sincronizado automáticamente desde Figma
// Última actualización: ${new Date().toISOString()}

export { mepColors } from './colors.js';
export { mepSpacing } from './spacing.js';

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
    
    console.log('✅ Tokens MEP aplicados al DOM');
  }
};

// Función para obtener tokens desde el servidor
export const fetchTokensFromServer = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/tokens');
    const data = await response.json();
    
    // Aplicar tokens al DOM
    applyMEPTokens(data.variables);
    
    return data;
  } catch (error) {
    console.error('Error fetching tokens:', error);
    return null;
  }
};

// Re-exportar para compatibilidad
import { mepColors } from './colors.js';
import { mepSpacing } from './spacing.js';

export { mepColors as colors, mepSpacing as spacing };
