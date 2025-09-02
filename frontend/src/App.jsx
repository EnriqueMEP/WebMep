// frontend/src/App.jsx
import { BrowserRouter as Router, Routes, Route, useEffect } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useLiveTokens } from './hooks/useLiveTokens';
import { applyMEPTokens, getDesignSystemStats } from './tokens/index.js';

// Páginas de auth
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import DesignSystemShowcase from './pages/DesignSystem';

// Componentes de protección
import ProtectedRoute from './components/auth/ProtectedRoute';

// Página Home simple con design system aplicado
const Home = () => {
  useEffect(() => {
    // Aplicar tokens MEP al cargar la página
    const applied = applyMEPTokens();
    if (applied) {
      const stats = getDesignSystemStats();
      console.log('📊 Design System Stats:', stats);
    }
  }, []);

  return (
    <div className="min-h-screen mep-bg-neutral-50 flex items-center justify-center mep-section-spacing">
      <div className="text-center max-w-4xl mx-auto mep-p-xl">
        <h1 className="mep-text-h1 mep-text-neutral-900 mb-4">MEP Projects</h1>
        <p className="mep-text-body-large mep-text-neutral-600 mb-8">
          Expertos en Proyectos Industriales con Design System Sincronizado desde Figma
        </p>
        <div className="mep-flex mep-gap-md mep-justify-center">
          <a
            href="/login"
            className="mep-button mep-button-primary mep-hover-lift"
          >
            Acceder al Dashboard
          </a>
          <a
            href="/design-system"
            className="mep-button mep-button-secondary mep-hover-lift"
          >
            Ver Design System
          </a>
        </div>
        
        {/* Indicador de design system */}
        <div className="mt-8 mep-p-md mep-bg-neutral-100 mep-rounded-lg">
          <p className="mep-text-body-small mep-text-neutral-600">
            🎨 Design System MEP v1.0.0 | Sincronizado desde Figma
          </p>
        </div>
      </div>
    </div>
  );
};

function App() {
  const { isConnected } = useLiveTokens();

  return (
    <AuthProvider>
      <Router>
        {/* Indicador Live de Figma */}
        <div className="fixed top-4 right-4 z-50">
          <div className={`px-3 py-2 rounded-full text-sm ${
            isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            MEP Live {isConnected ? '🟢' : '🔴'}
          </div>
        </div>

        <Routes>
          {/* Página pública */}
          <Route path="/" element={<Home />} />
          
          {/* Design System Showcase */}
          <Route path="/design-system" element={<DesignSystemShowcase />} />
          
          {/* Login */}
          <Route path="/login" element={<Login />} />
          
          {/* Dashboard protegido */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
