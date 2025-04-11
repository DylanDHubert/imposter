import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

interface Player {
  id: string;
  name: string;
  isHost: boolean;
}

interface GameState {
  players: Player[];
  currentRound: number;
  totalRounds: number;
  gameStarted: boolean;
  currentQuestion: string;
  isImposter: boolean;
  lobbyCode: string;
  addPlayer: (name: string, isHost?: boolean) => void;
  removePlayer: (id: string) => void;
  startGame: (rounds: number) => void;
  nextRound: () => void;
  setQuestion: (question: string) => void;
  setIsImposter: (isImposter: boolean) => void;
  setLobbyCode: (code: string) => void;
  resetGame: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  players: [],
  currentRound: 0,
  totalRounds: 0,
  gameStarted: false,
  currentQuestion: '',
  isImposter: false,
  lobbyCode: '',
  addPlayer: (name: string, isHost = false) =>
    set((state) => ({
      players: [...state.players, { id: uuidv4(), name, isHost }],
    })),
  removePlayer: (id: string) =>
    set((state) => ({
      players: state.players.filter((player) => player.id !== id),
    })),
  startGame: (rounds: number) =>
    set({ gameStarted: true, totalRounds: rounds, currentRound: 1 }),
  nextRound: () =>
    set((state) => ({
      currentRound: state.currentRound + 1,
      currentQuestion: '',
    })),
  setQuestion: (question: string) => set({ currentQuestion: question }),
  setIsImposter: (isImposter: boolean) => set({ isImposter }),
  setLobbyCode: (code: string) => set({ lobbyCode: code }),
  resetGame: () =>
    set({
      players: [],
      currentRound: 0,
      totalRounds: 0,
      gameStarted: false,
      currentQuestion: '',
      isImposter: false,
      lobbyCode: '',
    }),
})); 