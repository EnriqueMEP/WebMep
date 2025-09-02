import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { applyMEPTokens } from '../tokens';

export const useLiveTokens = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    // Aplicar tokens iniciales
    applyMEPTokens();

    // Conectar WebSocket
    const socket = io('http://localhost:3001');

    socket.on('connect', () => {
      setIsConnected(true);
      console.log('🔌 MEP-Projects: Conectado para updates en vivo');
    });

    socket.on('disconnect', () => setIsConnected(false));

    socket.on('mep-tokens-updated', (data) => {
      console.log('🎨 MEP: Tokens actualizados:', data);
      setLastUpdate(data);
      
      // Hot reload automático en desarrollo
      if (import.meta.env.DEV) {
        setTimeout(() => window.location.reload(), 1000);
      }
    });

    return () => socket.disconnect();
  }, []);

  return { isConnected, lastUpdate };
};