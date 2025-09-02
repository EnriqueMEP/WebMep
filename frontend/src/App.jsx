// frontend/src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useLiveTokens } from './hooks/useLiveTokens';

// Páginas de auth
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';

// Componentes de protección
import ProtectedRoute from './components/auth/ProtectedRoute';

// Página Home simple
const Home = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">MEP Projects</h1>
      <p className="text-xl text-gray-600 mb-8">Expertos en Proyectos Industriales</p>
      <a
        href="/login"
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
      >
        Acceder al Dashboard
      </a>
    </div>
  </div>
);

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
