import { Server } from 'socket.io';
import { NextResponse } from 'next/server';

// Extend NodeJS.Global to include io
declare global {
  var io: Server | undefined;
}

const ioHandler = (req: Request) => {
  if (!global.io) {
    console.log('Initializing Socket.io server...');
    global.io = new Server({
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
      path: '/api/socket',
      transports: ['websocket'],
    });

    global.io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      socket.on('createLobby', ({ code, name }: { code: string; name: string }) => {
        console.log('Creating lobby:', code, name);
        socket.join(code);
        socket.emit('lobbyCreated', { code });
        socket.to(code).emit('playerJoined', { name, isHost: true });
      });

      socket.on('joinLobby', ({ code, name }: { code: string; name: string }) => {
        console.log('Joining lobby:', code, name);
        const room = global.io?.sockets.adapter.rooms.get(code);
        if (!room) {
          socket.emit('lobbyError', { message: 'Lobby not found' });
          return;
        }
        socket.join(code);
        socket.to(code).emit('playerJoined', { name, isHost: false });
      });

      socket.on('startGame', ({ code, rounds }: { code: string; rounds: number }) => {
        console.log('Starting game:', code, rounds);
        socket.to(code).emit('gameStarted', { rounds });
      });

      socket.on('nextRound', ({ code }: { code: string }) => {
        console.log('Next round:', code);
        socket.to(code).emit('roundAdvanced');
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
  }

  return NextResponse.json({ success: true });
};

export { ioHandler as GET, ioHandler as POST }; 