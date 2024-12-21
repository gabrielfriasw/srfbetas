import { io } from 'socket.io-client';
import { User, UserRole } from '../../types';

// Use the correct WebSocket URL based on environment
const WEBSOCKET_URL = import.meta.env.PROD 
  ? '/.netlify/functions/websocket'
  : 'http://localhost:5173/.netlify/functions/websocket';

const socket = io(WEBSOCKET_URL, {
  path: '/socket.io',
  transports: ['websocket'],
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

// Add connection event listeners
socket.on('connect', () => {
  console.log('Connected to WebSocket server');
});

socket.on('connect_error', (error) => {
  console.error('WebSocket connection error:', error);
});

export const authService = {
  socket,

  emitAuthEvent: (type: string, data: any) => {
    return new Promise((resolve, reject) => {
      // Add timeout to prevent infinite loading
      const timeout = setTimeout(() => {
        reject(new Error('Tempo limite excedido. Tente novamente.'));
      }, 5000);

      socket.emit(type, data, (response: { error?: string; data?: any }) => {
        clearTimeout(timeout);
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response.data);
        }
      });
    });
  },

  onUserUpdate: (callback: (users: Omit<User, 'password'>[]) => void) => {
    socket.on('users_updated', callback);
    return () => socket.off('users_updated', callback);
  },
};