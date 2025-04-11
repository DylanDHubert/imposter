import { Manager } from 'socket.io-client';
import type { Socket } from 'socket.io-client';

let socket: Socket | null = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 1000;

export const initializeSocket = () => {
  if (!socket) {
    const manager = new Manager({
      path: '/api/socket/io',
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
      reconnectionDelay: RECONNECT_DELAY,
    });

    socket = manager.socket('/');

    socket.on('connect', () => {
      console.log('Socket connected:', socket?.id);
      reconnectAttempts = 0;
    });

    socket.on('connect_error', (error: Error) => {
      console.error('Socket connection error:', error);
      reconnectAttempts++;
      if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
        console.error('Max reconnection attempts reached');
        socket?.disconnect();
      }
    });

    socket.on('disconnect', (reason: string) => {
      console.log('Socket disconnected:', reason);
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, try to reconnect
        socket?.connect();
      }
    });

    socket.on('error', (error: Error) => {
      console.error('Socket error:', error);
    });
  }
  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return initializeSocket();
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}; 