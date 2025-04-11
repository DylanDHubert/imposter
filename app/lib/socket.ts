import { io, Socket } from 'socket.io-client';

let socket: Socket | undefined;

export const initializeSocket = () => {
  if (!socket) {
    socket = io({
      path: '/api/socket',
      addTrailingSlash: false,
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