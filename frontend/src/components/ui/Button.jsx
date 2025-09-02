import { mepColors, mepSpacing } from '../../tokens';

const Button = ({ 
  variant = 'primary', 
  size = 'medium', 
  children, 
  className = '',
  ...props 
}) => {
  const getStyles = () => {
    const baseStyles = {
      border: 'none',
      borderRadius: mepSpacing.radius_04 || 'var(--mep-radius_04, 8px)',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center'
    };

    const sizes = {
      small: {
        padding: `${mepSpacing.padding_03 || '6px'} ${mepSpacing.padding_05 || '12px'}`,
        fontSize: '14px'
      },
      medium: {
        padding: `${mepSpacing.padding_04 || '8px'} ${mepSpacing.padding_06 || '16px'}`,
        fontSize: '16px'
      },
      large: {
        padding: `${mepSpacing.padding_05 || '12px'} ${mepSpacing.padding_08 || '24px'}`,
        fontSize: '18px'
      }
    };

    const variants = {
      primary: {
        backgroundColor: mepColors.primary || 'var(--mep-primary, #22c55e)',
        color: mepColors.on_primary || 'var(--mep-on_primary, white)'
      },
      secondary: {
        backgroundColor: mepColors.secondary || 'var(--mep-secondary)',
        color: mepColors.on_secondary || 'var(--mep-on_secondary)'
      },
      outline: {
        backgroundColor: 'transparent',
        border: `2px solid ${mepColors.primary || 'var(--mep-primary)'}`,
        color: mepColors.primary || 'var(--mep-primary)'
      }
    };

    return {
      ...baseStyles,
      ...sizes[size],
      ...variants[variant]
    };
  };

  const handleMouseEnter = (e) => {
    if (variant === 'primary') {
      e.target.style.backgroundColor = mepColors.primary_hover || `color-mix(in srgb, ${mepColors.primary} 85%, black)`;
    }
  };

  const handleMouseLeave = (e) => {
    e.target.style.backgroundColor = getStyles().backgroundColor;
  };

  return (
    <button
      style={getStyles()}
      className={`mep-button ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;