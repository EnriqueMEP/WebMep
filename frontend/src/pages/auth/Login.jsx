// frontend/src/pages/auth/Login.jsx
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { mepColors, mepSpacing } from '../../tokens';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (error) {
      setError('Credenciales inválidas');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: mepColors.background_default || '#fafafa',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: mepSpacing.padding_12 || '48px',
        borderRadius: mepSpacing.radius_04 || '8px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: mepSpacing.gap_08 || '24px',
          color: mepColors.on_surface || '#1f2937'
        }}>
          MEP-Projects
        </h1>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: mepSpacing.gap_06 || '16px' }}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: mepSpacing.padding_04 || '8px',
                border: `1px solid ${mepColors.surface || '#e5e7eb'}`,
                borderRadius: mepSpacing.radius_02 || '4px'
              }}
              required
            />
          </div>

          <div style={{ marginBottom: mepSpacing.gap_08 || '24px' }}>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: mepSpacing.padding_04 || '8px',
                border: `1px solid ${mepColors.surface || '#e5e7eb'}`,
                borderRadius: mepSpacing.radius_02 || '4px'
              }}
              required
            />
          </div>

          {error && (
            <div style={{
              color: mepColors.error_500 || '#ef4444',
              marginBottom: mepSpacing.gap_04 || '12px',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            style={{
              width: '100%',
              backgroundColor: mepColors.primary || '#22c55e',
              color: mepColors.on_primary || 'white',
              padding: mepSpacing.padding_04 || '8px',
              borderRadius: mepSpacing.radius_02 || '4px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Iniciar Sesión
          </button>
        </form>

        <div style={{
          textAlign: 'center',
          marginTop: mepSpacing.gap_06 || '16px'
        }}>
          <a 
            href="/" 
            style={{ 
              color: mepColors.primary || '#22c55e',
              textDecoration: 'none'
            }}
          >
            ← Volver al sitio público
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;