import { io } from 'socket.io-client';

// Automatically use correct backend URL based on environment
const BACKEND_URL = import.meta.env.PROD 
  ? 'https://ipl-auction-backend-pgr5.onrender.com'  // Production (Render)
  : 'http://localhost:5051';                         // Development (Local)

export const socket = io(BACKEND_URL, {
  autoConnect: false,  // Don't auto-connect, wait for token
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  transports: ['websocket', 'polling']
});

export const connectSocket = (token) => {
  if (socket.connected) {
    socket.disconnect();
  }
  socket.auth = { token };
  socket.connect();
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};

socket.on('connect', () => {
  console.log('✅ Connected to backend server at', BACKEND_URL);
});

socket.on('disconnect', () => {
  console.log('❌ Disconnected from backend server');
});

socket.on('connect_error', (error) => {
  console.error('Connection error:', error.message);
});