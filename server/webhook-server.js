import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import MEPFigmaSync from './figma-sync.js';

// Cargar variables de entorno
dotenv.config({ path: '../.env' });

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176", "http://localhost:5177", process.env.VITE_PRODUCTION_URL],
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

let activeConnections = 0;

// Ruta raíz
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok',
    message: 'MEP Projects API',
    version: '1.0.0'
  });
});

// Ruta para obtener proyectos
app.get('/api/projects', (req, res) => {
  try {
    const projectsData = require('./data/projects.json');
    res.json(projectsData);
  } catch (error) {
    res.status(500).json({ error: 'Error loading projects' });
  }
});

// Ruta de autenticación (simulada)
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Autenticación simulada
  if (email === 'admin@mep.com' && password === 'admin123') {
    res.json({
      success: true,
      token: 'fake-jwt-token',
      user: {
        id: 1,
        email: email,
        name: 'Admin MEP'
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Credenciales inválidas'
    });
  }
});

// 🎨 Webhook para cambios de Figma
app.post('/figma-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  console.log('🔄 Figma cambió - actualizando MEP-Projects...');
  
  try {
    // Verificar firma del webhook si está configurada
    const signature = req.headers['x-figma-signature'];
    const webhookSecret = process.env.WEBHOOK_SECRET;
    
    if (webhookSecret && signature) {
      const crypto = await import('crypto');
      const expectedSignature = crypto.default
        .createHmac('sha256', webhookSecret)
        .update(req.body, 'utf8')
        .digest('hex');
      
      if (signature !== expectedSignature) {
        console.log('❌ Firma de webhook inválida');
        return res.status(401).json({ error: 'Invalid signature' });
      }
    }

    const figmaSync = new MEPFigmaSync();
    const result = await figmaSync.syncAll();
    
    // Notificar a todos los navegadores conectados
    io.emit('mep-tokens-updated', {
      timestamp: new Date(),
      message: '🎨 Design tokens updated from Figma!',
      tokensCount: Object.keys(result.variables.colors).length + Object.keys(result.variables.spacing).length,
      data: result
    });

    console.log(`📡 ${activeConnections} usuarios notificados`);
    res.json({ success: true, message: 'MEP tokens updated', result });
    
  } catch (error) {
    console.error('❌ Error webhook:', error);
    res.status(500).json({ error: error.message });
  }
});

// 🔌 WebSocket connections
io.on('connection', (socket) => {
  activeConnections++;
  console.log(`👤 Usuario conectado a MEP-Projects. Total: ${activeConnections}`);
  
  socket.emit('mep-connected', {
    message: 'Conectado a MEP-Projects Live Updates',
    connections: activeConnections
  });

  socket.on('disconnect', () => {
    activeConnections--;
    console.log(`👤 Usuario desconectado. Total: ${activeConnections}`);
  });
});

// 🔄 Sync manual
app.get('/sync-tokens', async (req, res) => {
  try {
    console.log('🔄 Sincronización manual iniciada...');
    const figmaSync = new MEPFigmaSync();
    const result = await figmaSync.syncAll();
    
    // Notificar via WebSocket
    io.emit('mep-tokens-updated', {
      timestamp: new Date(),
      message: '🔄 Manual sync completed!',
      data: result
    });
    
    res.json({ 
      success: true, 
      message: 'Tokens sincronizados manualmente',
      result 
    });
  } catch (error) {
    console.error('❌ Error sync manual:', error);
    res.status(500).json({ error: error.message });
  }
});

// Nueva ruta para obtener el estado actual de los tokens
app.get('/api/tokens', async (req, res) => {
  try {
    const figmaSync = new MEPFigmaSync();
    const result = await figmaSync.syncAll();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

server.listen(PORT, () => {
  console.log(`🚀 MEP-Projects server running on port ${PORT}`);
  console.log(`📡 WebSocket: ws://localhost:${PORT}`);
  console.log(`🎨 Figma webhook: http://localhost:${PORT}/figma-webhook`);
  console.log(`🔐 Auth endpoint: http://localhost:${PORT}/api/auth/login`);
});