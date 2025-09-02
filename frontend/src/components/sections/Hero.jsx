import { mepColors, mepSpacing } from '../../tokens';
import Button from '../ui/Button';

const Hero = () => {
  return (
    <section 
      className="min-h-[80vh] flex items-center"
      style={{
        backgroundColor: mepColors.background_default || 'var(--mep-background_default, #fafafa)',
        padding: `${mepSpacing.padding_12 || '48px'} ${mepSpacing.padding_06 || '16px'}`
      }}
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          {/* Badge "Nuevo" */}
          <div 
            className="inline-block px-4 py-2 rounded-full text-sm font-medium mb-6"
            style={{
              backgroundColor: mepColors.primary_container || 'var(--mep-primary_container)',
              color: mepColors.on_primary_container || 'var(--mep-on_primary_container)'
            }}
          >
            Nuevo
          </div>

          {/* Título principal */}
          <h1 
            className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6"
            style={{ color: mepColors.on_surface || 'var(--mep-on_surface, #1f2937)' }}
          >
            Avanzamos comprometidos
          </h1>

          {/* Descripción */}
          <p 
            className="text-lg md:text-xl leading-relaxed mb-8"
            style={{ 
              color: mepColors.on_surface || 'var(--mep-on_surface, #6b7280)',
              opacity: 0.8 
            }}
          >
            Nuestra compañía refuerza su identidad de marca comunicando así su 
            crecimiento y solidez dentro del mercado. Comprometiéndose a seguir 
            aportando valor a futuro.
          </p>

          {/* CTA Button */}
          <Button variant="primary" size="large">
            Conocer más
          </Button>
        </div>

        {/* Hero Image/Graphic */}
        <div 
          className="relative h-96 lg:h-[500px] rounded-2xl flex items-center justify-center"
          style={{
            backgroundColor: mepColors.primary_container || 'var(--mep-primary_container)',
            background: `linear-gradient(135deg, ${mepColors.primary_container || '#dcfce7'} 0%, ${mepColors.secondary || '#22c55e'} 100%)`
          }}
        >
          {/* Aquí irá la imagen real o gráfico */}
          <div 
            className="text-center text-2xl font-bold"
            style={{ color: mepColors.on_primary_container || 'white' }}
          >
            MEP Projects
            <br />
            <span className="text-lg opacity-75">Imagen Hero</span>
          </div>
          
          {/* Elementos decorativos */}
          <div className="absolute top-8 left-8 w-20 h-20 rounded-full bg-white/20"></div>
          <div className="absolute bottom-12 right-12 w-32 h-32 rounded-full bg-white/10"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;