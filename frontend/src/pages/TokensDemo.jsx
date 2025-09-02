// frontend/src/pages/TokensDemo.jsx
import React, { useState, useEffect } from 'react';
import MEPButton from '../components/ui/MEPButton';
import { mepColors, mepSpacing, fetchTokensFromServer } from '../tokens';

const TokensDemo = () => {
  const [tokens, setTokens] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSyncTokens = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3001/sync-tokens');
      const data = await response.json();
      console.log('Tokens sincronizados:', data);
      
      // Refrescar tokens desde el servidor
      const newTokens = await fetchTokensFromServer();
      setTokens(newTokens);
    } catch (error) {
      console.error('Error sincronizando tokens:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTokensFromServer().then(setTokens);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            🎨 MEP Design Tokens Demo
          </h1>
          
          {/* Sync Button */}
          <div className="mb-8 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">Sincronización con Figma</h2>
            <MEPButton 
              onClick={handleSyncTokens}
              disabled={isLoading}
            >
              {isLoading ? '🔄 Sincronizando...' : '🔄 Sincronizar con Figma'}
            </MEPButton>
            <p className="text-sm text-gray-600 mt-2">
              Haz clic para obtener los últimos tokens desde Figma
            </p>
          </div>

          {/* Colors Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Colores</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(mepColors).map(([name, color]) => (
                <div key={name} className="text-center">
                  <div 
                    className="w-20 h-20 rounded-lg mx-auto mb-2 shadow-md"
                    style={{ backgroundColor: color }}
                  ></div>
                  <p className="text-sm font-medium">{name}</p>
                  <p className="text-xs text-gray-500">{color}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Buttons Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Componentes Button</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Primary Buttons */}
              <div>
                <h3 className="text-lg font-medium mb-3">Primary</h3>
                <div className="space-y-3">
                  <MEPButton variant="primary" size="small">
                    Small Primary
                  </MEPButton>
                  <MEPButton variant="primary">
                    Default Primary
                  </MEPButton>
                  <MEPButton variant="primary" size="large">
                    Large Primary
                  </MEPButton>
                  <MEPButton variant="primary" state="disabled">
                    Disabled Primary
                  </MEPButton>
                </div>
              </div>

              {/* Secondary Buttons */}
              <div>
                <h3 className="text-lg font-medium mb-3">Secondary</h3>
                <div className="space-y-3">
                  <MEPButton variant="secondary" size="small">
                    Small Secondary
                  </MEPButton>
                  <MEPButton variant="secondary">
                    Default Secondary
                  </MEPButton>
                  <MEPButton variant="secondary" size="large">
                    Large Secondary
                  </MEPButton>
                  <MEPButton variant="secondary" state="disabled">
                    Disabled Secondary
                  </MEPButton>
                </div>
              </div>

              {/* Ghost Buttons */}
              <div>
                <h3 className="text-lg font-medium mb-3">Ghost</h3>
                <div className="space-y-3">
                  <MEPButton variant="ghost">
                    Ghost Button
                  </MEPButton>
                  <MEPButton variant="ghost" state="disabled">
                    Disabled Ghost
                  </MEPButton>
                </div>
              </div>

              {/* Danger Buttons */}
              <div>
                <h3 className="text-lg font-medium mb-3">Danger</h3>
                <div className="space-y-3">
                  <MEPButton variant="danger">
                    Danger Button
                  </MEPButton>
                  <MEPButton variant="danger" state="disabled">
                    Disabled Danger
                  </MEPButton>
                </div>
              </div>
            </div>
          </div>

          {/* Live Tokens Display */}
          {tokens && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Tokens en Vivo</h2>
              <div className="bg-gray-100 rounded-lg p-4">
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(tokens, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-green-50 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-green-800 mb-3">
              🚀 Instrucciones para tu diseñador
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-green-700">
              <li>Modifica variables en Figma (colores, espaciado, etc.)</li>
              <li>Publica los cambios en la librería</li>
              <li>Haz clic en "Sincronizar con Figma" arriba</li>
              <li>¡Los cambios se reflejan automáticamente!</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokensDemo;
