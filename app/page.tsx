'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from './store';
import { getSocket, disconnectSocket } from './lib/socket';
import Game from './components/Game';

interface Player {
  id: string;
  name: string;
  isHost: boolean;
}

export default function Home() {
  const [name, setName] = useState('');
  const [lobbyCode, setLobbyCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [socketError, setSocketError] = useState<string | null>(null);
  const { players, addPlayer, removePlayer, updatePlayerConnection, setLobbyCode: setStoreLobbyCode, gameStarted } = useGameStore();

  useEffect(() => {
    const socket = getSocket();

    socket.on('connect', () => {
      console.log('Connected to server');
      setSocketError(null);
    });

    socket.on('connect_error', (error: Error) => {
      console.error('Connection error:', error);
      setSocketError('Failed to connect to server. Please try again.');
    });

    socket.on('playerJoined', (player: Player) => {
      console.log('Player joined:', player);
      addPlayer(player.name, player.isHost);
    });

    socket.on('playerLeft', (playerId: string) => {
      console.log('Player left:', playerId);
      updatePlayerConnection(playerId, false);
    });

    socket.on('lobbyCreated', ({ code }: { code: string }) => {
      console.log('Lobby created:', code);
      setStoreLobbyCode(code);
    });

    socket.on('lobbyError', ({ message }: { message: string }) => {
      console.error('Lobby error:', message);
      setSocketError(message);
      setIsJoining(false);
    });

    socket.on('gameStarted', ({ rounds }: { rounds: number }) => {
      console.log('Game started with rounds:', rounds);
      // Update game state here
    });

    return () => {
      socket.off('connect');
      socket.off('connect_error');
      socket.off('playerJoined');
      socket.off('playerLeft');
      socket.off('lobbyCreated');
      socket.off('lobbyError');
      socket.off('gameStarted');
      disconnectSocket();
    };
  }, []);

  const createLobby = () => {
    if (!name) {
      setSocketError('Please enter your name');
      return;
    }
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const socket = getSocket();
    socket.emit('createLobby', { code, name });
    addPlayer(name, true);
  };

  const joinLobby = () => {
    if (!name) {
      setSocketError('Please enter your name');
      return;
    }
    if (!lobbyCode) {
      setSocketError('Please enter a lobby code');
      return;
    }
    setIsJoining(true);
    const socket = getSocket();
    socket.emit('joinLobby', { code: lobbyCode, name });
    setStoreLobbyCode(lobbyCode);
  };

  const startGame = () => {
    const socket = getSocket();
    socket.emit('startGame', { code: lobbyCode, rounds: 3 });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Imposter Game</h1>
        
        {socketError && (
          <div className="bg-red-100 p-4 rounded-lg mb-4">
            <p className="text-red-700">{socketError}</p>
          </div>
        )}
        
        {!gameStarted ? (
          players.length === 0 ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter your name"
                />
              </div>

              <div className="flex flex-col space-y-4">
                <button
                  onClick={createLobby}
                  className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
                >
                  Create New Lobby
                </button>

                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={lobbyCode}
                    onChange={(e) => setLobbyCode(e.target.value.toUpperCase())}
                    className="flex-1 p-2 border rounded-md"
                    placeholder="Enter lobby code"
                  />
                  <button
                    onClick={joinLobby}
                    disabled={isJoining}
                    className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 disabled:opacity-50"
                  >
                    Join
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Lobby Code: {lobbyCode}</h2>
              <div className="space-y-2">
                <h3 className="font-medium">Players:</h3>
                {players.map((player) => (
                  <div key={player.id} className="flex items-center space-x-2">
                    <span className={`w-2 h-2 rounded-full ${player.isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    <span>{player.name}</span>
                    {player.isHost && <span className="text-sm text-gray-500">(Host)</span>}
                    {!player.isConnected && <span className="text-sm text-red-500">(Disconnected)</span>}
                  </div>
                ))}
              </div>
              {players.some(p => p.isHost) && (
                <button
                  onClick={startGame}
                  className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
                >
                  Start Game
                </button>
              )}
            </div>
          )
        ) : (
          <Game />
        )}
      </div>
    </div>
  );
}
