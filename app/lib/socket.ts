import { io, Socket } from 'socket.io-client';

let socket: Socket | undefined;

export const initializeSocket = () => {
  if (!socket) {
    socket = io({
      path: '/api/socket',
      addTrailingSlash: false,
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
      console.log('Socket connected:', socket?.id);
    });

    socket.on('connect_error', (error: Error) => {
      console.error('Socket connection error:', error);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
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