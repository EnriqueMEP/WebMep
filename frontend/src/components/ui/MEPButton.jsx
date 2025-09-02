// frontend/src/components/ui/MEPButton.jsx
import React from 'react';
import { mepColors } from '../../tokens';

const MEPButton = ({ 
  variant = 'primary', 
  size = 'default', 
  state = 'default',
  children, 
  onClick,
  ...props 
}) => {
  const getButtonStyles = () => {
    let baseStyles = {
      padding: size === 'small' ? '8px 16px' : size === 'large' ? '16px 32px' : '12px 24px',
      borderRadius: '8px',
      border: 'none',
      cursor: state === 'disabled' ? 'not-allowed' : 'pointer',
      fontWeight: '600',
      fontSize: size === 'small' ? '14px' : size === 'large' ? '18px' : '16px',
      transition: 'all 0.2s ease',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      opacity: state === 'disabled' ? '0.6' : '1'
    };

    // Aplicar estilos según la variante
    switch (variant) {
      case 'primary':
        baseStyles.backgroundColor = mepColors.mepGreenPrimary || '#22c55e';
        baseStyles.color = 'white';
        if (state === 'hover') {
          baseStyles.backgroundColor = '#16a34a';
        }
        break;
      case 'secondary':
        baseStyles.backgroundColor = 'transparent';
        baseStyles.border = `2px solid ${mepColors.mepGreenPrimary || '#22c55e'}`;
        baseStyles.color = mepColors.mepGreenPrimary || '#22c55e';
        if (state === 'hover') {
          baseStyles.backgroundColor = mepColors.mepGreenPrimary || '#22c55e';
          baseStyles.color = 'white';
        }
        break;
      case 'ghost':
        baseStyles.backgroundColor = 'transparent';
        baseStyles.color = mepColors.mepGreenPrimary || '#22c55e';
        if (state === 'hover') {
          baseStyles.backgroundColor = 'rgba(34, 197, 94, 0.1)';
        }
        break;
      case 'danger':
        baseStyles.backgroundColor = '#ef4444';
        baseStyles.color = 'white';
        if (state === 'hover') {
          baseStyles.backgroundColor = '#dc2626';
        }
        break;
    }

    return baseStyles;
  };

  return (
    <button 
      style={getButtonStyles()}
      disabled={state === 'disabled'}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default MEPButton;
