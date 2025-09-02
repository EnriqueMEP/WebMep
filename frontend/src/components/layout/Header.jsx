import { mepColors, mepSpacing } from '../../tokens';
import { useLiveTokens } from '../../hooks/useLiveTokens';

const Header = () => {
  const { isConnected, lastUpdate } = useLiveTokens();

  return (
    <header style={{
      backgroundColor: mepColors.primary || 'var(--mep-primary, #22c55e)',
      padding: mepSpacing.padding_06 || 'var(--mep-padding_06, 16px)',
      position: 'relative'
    }}>
      {/* Live indicator */}
      <div className="fixed top-4 right-4 z-50">
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
          isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
          }`}></div>
          MEP Live
          {lastUpdate && (
            <span className="text-xs">
              🎨 {new Date(lastUpdate.timestamp).toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* Header content */}
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <img 
            src="/mep-logo.svg" 
            alt="MEP-Projects"
            className="h-8 w-auto mr-4"
          />
          <span 
            className="text-xl font-bold"
            style={{ color: mepColors.on_primary || 'white' }}
          >
            MEP-Projects
          </span>
        </div>

        <nav className="hidden md:flex space-x-8">
          {[
            { name: 'Sectores', href: '#sectores' },
            { name: 'Nuestros proyectos', href: '#proyectos' },
            { name: 'Otras', href: '#otras' },
            { name: 'Contacto', href: '#contacto' }
          ].map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="transition-colors hover:opacity-80"
              style={{ 
                color: mepColors.on_primary || 'white',
                padding: `${mepSpacing.padding_02 || '4px'} ${mepSpacing.padding_04 || '8px'}`
              }}
            >
              {item.name}
            </a>
          ))}
        </nav>

        <button
          className="md:hidden text-white"
          style={{ color: mepColors.on_primary || 'white' }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </header>
  );
};

export default Header;