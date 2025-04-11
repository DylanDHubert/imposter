import { Server as NetServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { NextApiResponse } from 'next';

export type NextApiResponseWithSocket = NextApiResponse & {
  socket: {
    server: NetServer & {
      io?: SocketIOServer;
    };
  };
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function SocketHandler(req: any, res: NextApiResponseWithSocket) {
  if (!res.socket.server.io) {
    console.log('Initializing Socket.io server...');
    const io = new SocketIOServer(res.socket.server, {
      path: '/api/socket',
      addTrailingSlash: false,
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
      transports: ['websocket'],
    });

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      socket.on('createLobby', ({ code, name }: { code: string; name: string }) => {
        console.log('Creating lobby:', code, name);
        socket.join(code);
        socket.emit('lobbyCreated', { code });
        socket.to(code).emit('playerJoined', { name, isHost: true });
      });

      socket.on('joinLobby', ({ code, name }: { code: string; name: string }) => {
        console.log('Joining lobby:', code, name);
        const room = io.sockets.adapter.rooms.get(code);
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

    res.socket.server.io = io;
  }

  res.end();
} 