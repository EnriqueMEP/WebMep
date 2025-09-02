// backend/api/server.js
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Conectar a MongoDB
mongoose.connect('mongodb://localhost:27017/mep-projects');

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Ruta de health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', service: 'MEP-Projects API' });
});

const PORT = process.env.API_PORT || 3002;
app.listen(PORT, () => {
  console.log(`🚀 MEP-Projects API running on port ${PORT}`);
});