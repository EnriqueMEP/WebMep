// frontend/src/pages/DesignSystem.jsx
import { useEffect, useState } from 'react';
import { 
  applyMEPTokens, 
  getDesignSystemStats, 
  mepColors, 
  mepSpacing, 
  mepTypography,
  componentsByType,
  getMEPColor,
  getMEPSpacing
} from '../tokens/index.js';

const DesignSystemShowcase = () => {
  const [stats, setStats] = useState(null);
  const [selectedColor, setSelectedColor] = useState('primary');
  const [selectedSpacing, setSelectedSpacing] = useState('md');

  useEffect(() => {
    applyMEPTokens();
    setStats(getDesignSystemStats());
  }, []);

  const ColorSwatch = ({ name, value }) => (
    <div 
      className="mep-card mep-p-md mep-rounded-lg cursor-pointer mep-hover-lift mep-transition"
      onClick={() => setSelectedColor(name)}
    >
      <div 
        className="w-16 h-16 mep-rounded-md mb-2 border-2"
        style={{ backgroundColor: value }}
      ></div>
      <p className="mep-text-body-small font-medium">{name}</p>
      <p className="mep-text-caption mep-text-neutral-500">{value}</p>
    </div>
  );

  const TypographyExample = ({ name, config }) => (
    <div className="mep-card mep-p-md">
      <h4 className="mep-text-body-small font-semibold mb-2">{name}</h4>
      <p style={{
        fontSize: config.fontSize,
        fontWeight: config.fontWeight,
        lineHeight: config.lineHeight,
        letterSpacing: config.letterSpacing
      }}>
        El veloz murciélago hindú comía feliz cardillo y kiwi. 123
      </p>
      <div className="mt-2 mep-text-caption mep-text-neutral-500">
        {config.fontSize} · {config.fontWeight} · {config.lineHeight}
      </div>
    </div>
  );

  const ComponentExample = ({ name, component }) => (
    <div className="mep-card mep-p-lg">
      <h4 className="mep-text-body-small font-semibold mb-3">{name}</h4>
      <div 
        className="border-2 border-dashed border-gray-300 p-4 mep-rounded-md"
        style={{
          width: component.width ? `${component.width}px` : 'auto',
          height: component.height ? `${component.height}px` : 'auto',
          ...component.styles
        }}
      >
        <div className="flex items-center justify-center h-full">
          <span className="mep-text-body-small mep-text-neutral-600">
            {component.type} component
          </span>
        </div>
      </div>
      <div className="mt-2 mep-text-caption mep-text-neutral-500">
        {component.width}×{component.height}px
      </div>
    </div>
  );

  return (
    <div className="min-h-screen mep-bg-neutral-50">
      {/* Header */}
      <header className="mep-nav-header mep-px-lg">
        <div className="mep-max-w-container mx-auto mep-flex mep-items-center mep-justify-between h-full">
          <div>
            <h1 className="mep-text-h5 font-bold">MEP Design System</h1>
            <p className="mep-text-body-small mep-text-neutral-600">
              Sincronizado desde Figma · v{stats?.version || '1.0.0'}
            </p>
          </div>
          <div className="mep-flex mep-gap-md mep-items-center">
            <div className="mep-bg-success mep-rounded-full w-3 h-3"></div>
            <span className="mep-text-body-small">En vivo</span>
          </div>
        </div>
      </header>

      <main className="mep-max-w-container mx-auto mep-p-xl">
        {/* Stats */}
        {stats && (
          <section className="mb-12">
            <h2 className="mep-text-h3 mb-6">Estadísticas del Sistema</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 mep-gap-md">
              <div className="mep-card mep-p-lg text-center">
                <div className="mep-text-h4 mep-text-primary font-bold">{stats.colors}</div>
                <div className="mep-text-body-small mep-text-neutral-600">Colores</div>
              </div>
              <div className="mep-card mep-p-lg text-center">
                <div className="mep-text-h4 mep-text-secondary font-bold">{stats.spacing}</div>
                <div className="mep-text-body-small mep-text-neutral-600">Espaciados</div>
              </div>
              <div className="mep-card mep-p-lg text-center">
                <div className="mep-text-h4 mep-text-warning font-bold">{stats.typography}</div>
                <div className="mep-text-body-small mep-text-neutral-600">Tipografías</div>
              </div>
              <div className="mep-card mep-p-lg text-center">
                <div className="mep-text-h4 mep-text-error font-bold">{stats.components}</div>
                <div className="mep-text-body-small mep-text-neutral-600">Componentes</div>
              </div>
            </div>
          </section>
        )}

        {/* Colors */}
        <section className="mb-12">
          <h2 className="mep-text-h3 mb-6">Colores</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 mep-gap-md mb-6">
            {Object.entries(mepColors).slice(0, 12).map(([name, value]) => (
              <ColorSwatch key={name} name={name} value={value} />
            ))}
          </div>
          <div className="mep-card mep-p-lg">
            <h3 className="mep-text-h6 mb-3">Color Seleccionado: {selectedColor}</h3>
            <div className="mep-flex mep-gap-md mep-items-center">
              <div 
                className="w-20 h-20 mep-rounded-lg border-2"
                style={{ backgroundColor: getMEPColor(selectedColor) }}
              ></div>
              <div>
                <p className="mep-text-body-normal font-medium">{getMEPColor(selectedColor)}</p>
                <p className="mep-text-body-small mep-text-neutral-600">CSS: var(--mep-color-{selectedColor})</p>
              </div>
            </div>
          </div>
        </section>

        {/* Typography */}
        <section className="mb-12">
          <h2 className="mep-text-h3 mb-6">Tipografía</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 mep-gap-md">
            {Object.entries(mepTypography.headings || {}).map(([name, config]) => (
              <TypographyExample key={name} name={name} config={config} />
            ))}
          </div>
        </section>

        {/* Buttons */}
        <section className="mb-12">
          <h2 className="mep-text-h3 mb-6">Botones</h2>
          <div className="mep-card mep-p-xl">
            <div className="mep-flex mep-gap-md mep-items-center flex-wrap">
              <button className="mep-button mep-button-primary">
                Primario
              </button>
              <button className="mep-button mep-button-secondary">
                Secundario
              </button>
              <button className="mep-button mep-button-danger">
                Peligro
              </button>
              <button className="mep-button mep-button-primary mep-button-sm">
                Pequeño
              </button>
              <button className="mep-button mep-button-primary mep-button-lg">
                Grande
              </button>
              <button className="mep-button mep-button-primary" disabled>
                Deshabilitado
              </button>
            </div>
          </div>
        </section>

        {/* Inputs */}
        <section className="mb-12">
          <h2 className="mep-text-h3 mb-6">Formularios</h2>
          <div className="mep-card mep-p-xl max-w-2xl">
            <div className="space-y-4">
              <div>
                <label className="block mep-text-body-small font-medium mb-2">
                  Texto
                </label>
                <input 
                  type="text" 
                  className="mep-input" 
                  placeholder="Introduce tu texto..."
                />
              </div>
              <div>
                <label className="block mep-text-body-small font-medium mb-2">
                  Área de texto
                </label>
                <textarea 
                  className="mep-input mep-textarea" 
                  placeholder="Introduce tu mensaje..."
                ></textarea>
              </div>
              <div>
                <label className="block mep-text-body-small font-medium mb-2">
                  Select
                </label>
                <select className="mep-input">
                  <option>Opción 1</option>
                  <option>Opción 2</option>
                  <option>Opción 3</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Cards */}
        <section className="mb-12">
          <h2 className="mep-text-h3 mb-6">Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mep-gap-lg">
            <div className="mep-card mep-hover-lift">
              <h3 className="mep-text-h6 mb-2">Card Básica</h3>
              <p className="mep-text-body-normal mep-text-neutral-600">
                Esta es una card básica del design system con hover effect.
              </p>
            </div>
            <div className="mep-card mep-card-project mep-hover-lift">
              <h3 className="mep-text-h6 mb-2">Project Card</h3>
              <p className="mep-text-body-normal mep-text-neutral-600">
                Card especial para proyectos con estilos específicos.
              </p>
            </div>
            <div className="mep-card mep-card-lg mep-hover-lift">
              <h3 className="mep-text-h6 mb-2">Card Grande</h3>
              <p className="mep-text-body-normal mep-text-neutral-600">
                Card con padding aumentado para más contenido.
              </p>
            </div>
          </div>
        </section>

        {/* Spacing */}
        <section className="mb-12">
          <h2 className="mep-text-h3 mb-6">Espaciado</h2>
          <div className="mep-card mep-p-xl">
            <div className="space-y-4">
              {Object.entries(mepSpacing).slice(0, 8).map(([name, value]) => (
                <div key={name} className="mep-flex mep-items-center mep-gap-md">
                  <div className="w-20 mep-text-body-small font-mono">{name}</div>
                  <div className="w-16 mep-text-body-small font-mono mep-text-neutral-600">{value}</div>
                  <div 
                    className="mep-bg-primary"
                    style={{ width: value, height: '8px' }}
                  ></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Components Preview */}
        <section className="mb-12">
          <h2 className="mep-text-h3 mb-6">Componentes Extraídos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mep-gap-lg">
            {Object.entries(componentsByType.buttons || {}).map(([name, component]) => (
              <ComponentExample key={name} name={name} component={component} />
            ))}
            {Object.entries(componentsByType.cards || {}).slice(0, 3).map(([name, component]) => (
              <ComponentExample key={name} name={name} component={component} />
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mep-bg-neutral-800 mep-text-neutral-100 mep-p-xl mt-20">
        <div className="mep-max-w-container mx-auto text-center">
          <p className="mep-text-body-normal">
            🎨 MEP Design System - Sincronizado automáticamente desde Figma
          </p>
          <p className="mep-text-body-small mep-text-neutral-400 mt-2">
            Última actualización: {stats?.lastUpdated}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default DesignSystemShowcase;
