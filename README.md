# 🎨 MEP Projects - Design System Integrado

Sistema completo de proyectos MEP con sincronización automática de Design System desde Figma.

## 🚀 Características

- ✅ **Design System Sincronizado**: Extrae automáticamente colores, espaciados, tipografías y componentes desde Figma
- ✅ **Real-time Updates**: WebSocket para actualizaciones en vivo cuando cambia el diseño
- ✅ **Frontend React**: Interfaz moderna con Vite, React 19 y Tailwind CSS
- ✅ **Backend Node.js**: API REST con webhooks de Figma y autenticación
- ✅ **CSS Generado**: Sistema completo de utilidades CSS basado en los tokens de Figma
- ✅ **Componentes Extraídos**: Análisis automático de componentes desde Figma

## 📁 Estructura del Proyecto

```
mep-projects-website/
├── frontend/                 # React + Vite frontend
│   ├── src/
│   │   ├── tokens/          # 🎨 Design System sincronizado
│   │   │   ├── colors.js    # Colores desde Figma
│   │   │   ├── spacing.js   # Espaciados desde Figma
│   │   │   ├── typography.js # Tipografías desde Figma
│   │   │   ├── components.js # Componentes extraídos
│   │   │   ├── mep-design-system.css # CSS completo
│   │   │   └── index.js     # Funciones de aplicación
│   │   ├── pages/
│   │   │   └── DesignSystem.jsx # Showcase del design system
│   │   └── components/
│   └── package.json
├── server/                   # Node.js backend
│   ├── webhook-server.js    # Servidor principal con WebSocket
│   ├── download-figma.js    # Descarga datos de Figma API
│   ├── process-figma-data.js # Procesa y genera tokens
│   ├── figma-sync-simple.js # Sincronizador simplificado
│   └── figma-data.json      # Datos de Figma cached
├── .env                     # Variables de entorno
├── sync-figma.bat          # Script de sincronización (Windows)
└── package.json            # Scripts principales
```

## 🔧 Configuración

### 1. Variables de Entorno

Crear `.env` en la raíz:

```env
# Figma Configuration
FIGMA_ACCESS_TOKEN=tu_token_de_figma
FIGMA_FILE_KEY=tu_file_key_de_figma

# Development
FRONTEND_PORT=5173
BACKEND_PORT=3001
NODE_ENV=development
```

### 2. Instalación

```bash
# Instalar dependencias
npm install

# Instalar dependencias del frontend
cd frontend && npm install

# Instalar dependencias del backend
cd ../server && npm install
```

### 3. Obtener Credenciales de Figma

1. **Token de Acceso**:
   - Ve a [Figma Account Settings](https://www.figma.com/settings)
   - Genera un "Personal Access Token"
   - Copia el token a `FIGMA_ACCESS_TOKEN`

2. **File Key**:
   - Abre tu archivo de Figma
   - La URL será algo como: `https://www.figma.com/file/XXXXXXXX/nombre-archivo`
   - Copia `XXXXXXXX` a `FIGMA_FILE_KEY`

## 🚀 Uso

### Desarrollo

```bash
# Iniciar frontend y backend simultáneamente
npm run dev

# Acceder a:
# Frontend: http://localhost:5173
# Backend: http://localhost:3001
# Design System: http://localhost:5173/design-system
```

### Sincronización Manual de Figma

```bash
# Método 1: Script completo
npm run sync-figma

# Método 2: Script de Windows
sync-figma.bat

# Método 3: API endpoint
curl http://localhost:3001/sync-tokens
```

### Verificar Sincronización

1. **Via Web**: Visita `http://localhost:5173/design-system`
2. **Via API**: `GET http://localhost:3001/api/tokens`
3. **Via Consola**: Revisa logs del servidor durante `npm run dev`

## 🎨 Design System

### Tokens Disponibles

#### Colores
- `mepColors.primary` → `var(--mep-color-primary)`
- `mepColors.secondary` → `var(--mep-color-secondary)`
- `mepColors.neutral50` - `neutral900`
- `mepColors.success`, `warning`, `error`, `info`

#### Espaciado
- `mepSpacing.xs` → `var(--mep-spacing-xs)` (4px)
- `mepSpacing.sm` → `var(--mep-spacing-sm)` (8px)
- `mepSpacing.md` → `var(--mep-spacing-md)` (12px)
- Hasta `mepSpacing.8xl` (96px)

#### Componentes CSS
- `.mep-button` + `.mep-button-primary/secondary/danger`
- `.mep-input` + `.mep-textarea`
- `.mep-card` + `.mep-card-sm/lg/project`
- `.mep-nav-header` + `.mep-nav-sidebar`

### Uso en React

```jsx
import { applyMEPTokens, mepColors, getMEPColor } from '../tokens/index.js';

function MyComponent() {
  useEffect(() => {
    applyMEPTokens(); // Aplicar tokens al DOM
  }, []);

  return (
    <div className="mep-bg-neutral-50 mep-p-xl">
      <h1 className="mep-text-h1 mep-text-primary">
        Título con Design System
      </h1>
      <button className="mep-button mep-button-primary mep-hover-lift">
        Botón Primario
      </button>
    </div>
  );
}
```

### Uso en CSS Puro

```css
.mi-componente {
  background-color: var(--mep-color-primary);
  padding: var(--mep-spacing-lg);
  border-radius: var(--mep-spacing-radius-md);
}
```

## 🔄 Flujo de Sincronización

1. **Diseñador actualiza en Figma** → Design System components
2. **Sistema detecta cambios** → Via webhook o sincronización manual
3. **Extrae tokens** → Colores, espaciados, tipografías, componentes
4. **Genera archivos** → `colors.js`, `spacing.js`, `typography.js`, `components.js`, CSS
5. **Actualiza frontend** → Aplicación aplica nuevos tokens automáticamente
6. **Notifica via WebSocket** → Desarrolladores ven cambios en vivo

## 📊 Estadísticas del Sistema

Actual (sincronizado):
- **33 Colores** extraídos del design system
- **57 Espaciados** configurados (responsive + componentes)
- **107 Componentes** encontrados en Figma
- **CSS Completo** generado automáticamente

## 🌐 Endpoints API

### Figma Sync
- `POST /figma-webhook` - Webhook desde Figma
- `GET /sync-tokens` - Sincronización manual
- `GET /api/tokens` - Ver tokens actuales

### Auth (Demo)
- `POST /api/auth/login` - Login simulado
- `GET /api/auth/me` - Usuario actual

### WebSocket
- Conexión: `ws://localhost:3001`
- Eventos: `mep-tokens-updated`, `user-connected`

## 🔐 Autenticación

Sistema de autenticación simulado para demostración:
- Usuario: `admin@mep.com`
- Password: `mep123`

## 🛠️ Scripts Disponibles

```bash
npm run dev              # Desarrollo completo
npm run dev:frontend     # Solo frontend
npm run dev:server       # Solo backend
npm run build           # Build de producción
npm run sync-figma      # Sincronizar design system
npm run deploy          # Deploy a producción
```

## 📱 Responsive

El design system incluye breakpoints y utilidades responsive:
- Mobile: < 768px
- Desktop: >= 768px
- Container max-width: 1200px
- Content max-width: 800px

## 🎯 Casos de Uso

### Para Diseñadores
1. Actualizar colores/espaciados en Figma
2. El sistema sincroniza automáticamente
3. Ver cambios en `http://localhost:5173/design-system`

### Para Desarrolladores
1. Usar clases CSS del design system
2. Importar tokens en JavaScript/React
3. Recibir notificaciones de cambios en vivo

### Para Product Managers
1. Ver estadísticas del design system
2. Verificar consistencia entre diseño y código
3. Aprobar cambios antes de despliegue

## 🚀 Próximos Pasos

- [ ] Configurar webhook real de Figma
- [ ] Añadir más componentes (Modal, Navigation, Forms)
- [ ] Implementar versionado de design system
- [ ] Añadir tests automatizados
- [ ] Deploy a producción
- [ ] Documentación Storybook

## 📞 Contacto

MEP Projects - Expertos en Proyectos Industriales
- Email: contacto@mep.com  
- Web: https://mep-projects.com

---

**🎨 Design System sincronizado desde Figma | v1.0.0 | 2025-09-02**
