// frontend/src/pages/dashboard/Dashboard.jsx
import { useAuth } from '../../hooks/useAuth';
import { mepColors, mepSpacing } from '../../tokens';

const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: mepColors.background_default || '#fafafa'
    }}>
      {/* Header del dashboard */}
      <header style={{
        backgroundColor: 'white',
        padding: mepSpacing.padding_06 || '16px',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color: mepColors.on_surface || '#1f2937'
        }}>
          Dashboard MEP-Projects
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span>Hola, {user?.firstName}</span>
          <button
            onClick={logout}
            style={{
              backgroundColor: mepColors.error_500 || '#ef4444',
              color: 'white',
              padding: '6px 12px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Cerrar Sesión
          </button>
        </div>
      </header>

      {/* Contenido del dashboard */}
      <main style={{
        padding: mepSpacing.padding_08 || '24px'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: mepSpacing.padding_08 || '24px',
          borderRadius: mepSpacing.radius_04 || '8px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            marginBottom: '16px',
            color: mepColors.on_surface || '#1f2937'
          }}>
            Bienvenido al Panel de Control
          </h2>

          <p style={{ color: mepColors.on_surface || '#6b7280' }}>
            Rol: <strong>{user?.role}</strong>
          </p>
          
          <p style={{ 
            color: mepColors.on_surface || '#6b7280',
            marginTop: '8px' 
          }}>
            Aquí podrás gestionar tus proyectos y acceder a las herramientas 
            según tu nivel de acceso.
          </p>

          {user?.role === 'admin' && (
            <div style={{
              marginTop: '24px',
              padding: '16px',
              backgroundColor: mepColors.primary_container || '#dcfce7',
              borderRadius: '6px'
            }}>
              <h3 style={{ marginBottom: '8px' }}>Funciones de Administrador</h3>
              <p>Como administrador, puedes crear usuarios y gestionar proyectos.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;