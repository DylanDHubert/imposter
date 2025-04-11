import { Server } from 'socket.io';
import { NextResponse } from 'next/server';

const ioHandler = (req: Request) => {
  if (!global.io) {
    console.log('New Socket.io server...');
    // @ts-ignore
    global.io = new Server({
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });

    global.io.on('connection', (socket) => {
      console.log('Client connected');

      socket.on('createLobby', ({ code, name }: { code: string; name: string }) => {
        socket.join(code);
        socket.emit('lobbyCreated', { code });
        global.io.to(code).emit('playerJoined', { name, isHost: true });
      });

      socket.on('joinLobby', ({ code, name }: { code: string; name: string }) => {
        socket.join(code);
        global.io.to(code).emit('playerJoined', { name, isHost: false });
      });

      socket.on('startGame', ({ code, rounds }: { code: string; rounds: number }) => {
        global.io.to(code).emit('gameStarted', { rounds });
      });

      socket.on('nextRound', ({ code }: { code: string }) => {
        global.io.to(code).emit('roundAdvanced');
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected');
      });
    });
  }

  return NextResponse.json({ success: true });
};

export { ioHandler as GET, ioHandler as POST }; 