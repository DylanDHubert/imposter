'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from './store';
import { getSocket } from './lib/socket';
import Game from './components/Game';

interface Player {
  name: string;
  isHost: boolean;
}

export default function Home() {
  const [name, setName] = useState('');
  const [lobbyCode, setLobbyCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const { players, addPlayer, setLobbyCode: setStoreLobbyCode, gameStarted } = useGameStore();

  useEffect(() => {
    const socket = getSocket();

    socket.on('playerJoined', (player: Player) => {
      addPlayer(player.name, player.isHost);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const createLobby = () => {
    if (!name) return;
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setStoreLobbyCode(code);
    const socket = getSocket();
    socket.emit('createLobby', { code, name });
    addPlayer(name, true);
  };

  const joinLobby = () => {
    if (!name || !lobbyCode) return;
    setIsJoining(true);
    const socket = getSocket();
    socket.emit('joinLobby', { code: lobbyCode, name });
    setStoreLobbyCode(lobbyCode);
    addPlayer(name);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Imposter Game</h1>
        
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
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>{player.name}</span>
                    {player.isHost && <span className="text-sm text-gray-500">(Host)</span>}
                  </div>
                ))}
              </div>
              <Game />
            </div>
          )
        ) : (
          <Game />
        )}
      </div>
    </div>
  );
}
