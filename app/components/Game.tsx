'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from '../store';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getSocket } from '../lib/socket';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

export default function Game() {
  const {
    players,
    currentRound,
    totalRounds,
    gameStarted,
    currentQuestion,
    isImposter,
    startGame,
    nextRound,
    setQuestion,
    setIsImposter,
    lobbyCode,
  } = useGameStore();

  const [rounds, setRounds] = useState(3);
  const [isHost, setIsHost] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsHost(players.some((p) => p.isHost));
  }, [players]);

  useEffect(() => {
    const socket = getSocket();

    socket.on('gameStarted', ({ rounds }: { rounds: number }) => {
      startGame(rounds);
      generateQuestion();
    });

    socket.on('roundAdvanced', () => {
      nextRound();
      generateQuestion();
    });

    return () => {
      socket.off('gameStarted');
      socket.off('roundAdvanced');
    };
  }, []);

  const generateQuestion = async () => {
    if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
      setError('Gemini API key is not configured');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      const prompt = `Generate a fun, engaging question for a social deduction game. The question should be something that people can have different opinions about. Make it specific and interesting.`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const question = response.text();
      setQuestion(question);
    } catch (error) {
      console.error('Error generating question:', error);
      setError('Failed to generate question. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartGame = () => {
    if (players.length < 2) {
      setError('Need at least 2 players to start the game');
      return;
    }
    
    const socket = getSocket();
    socket.emit('startGame', { code: lobbyCode, rounds });
    
    // Randomly select imposter
    const randomIndex = Math.floor(Math.random() * players.length);
    setIsImposter(players[randomIndex].id === players.find((p) => p.isHost)?.id);
  };

  const handleNextRound = () => {
    if (currentRound < totalRounds) {
      const socket = getSocket();
      socket.emit('nextRound', { code: lobbyCode });
    }
  };

  if (!gameStarted) {
    return (
      <div className="space-y-4">
        {error && (
          <div className="bg-red-100 p-4 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}
        {isHost && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Number of Rounds
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={rounds}
              onChange={(e) => setRounds(Number(e.target.value))}
              className="w-full p-2 border rounded-md"
            />
          </div>
        )}
        <button
          onClick={handleStartGame}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
        >
          Start Game
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold">
          Round {currentRound} of {totalRounds}
        </h2>
      </div>

      {error && (
        <div className="bg-red-100 p-4 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-2">Question:</h3>
        {isLoading ? (
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mt-2"></div>
          </div>
        ) : (
          <p className="text-gray-700">{currentQuestion}</p>
        )}
      </div>

      {isImposter && (
        <div className="bg-red-100 p-4 rounded-lg">
          <p className="text-red-700 font-medium">You are the Imposter!</p>
          <p className="text-red-600 mt-2">
            Your question is slightly different from others. Try to blend in!
          </p>
        </div>
      )}

      {isHost && (
        <button
          onClick={handleNextRound}
          disabled={isLoading || currentRound >= totalRounds}
          className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 disabled:opacity-50"
        >
          {currentRound >= totalRounds ? 'Game Over' : 'Next Round'}
        </button>
      )}
    </div>
  );
} 