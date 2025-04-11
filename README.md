# Imposter Game

A social deduction game where players try to identify the imposter based on their answers to AI-generated questions.

## Features

- Real-time multiplayer using Socket.IO
- AI-generated questions using Google's Gemini
- Mobile-friendly UI
- Host controls for game flow
- Multiple rounds with different questions

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file and add your Gemini API key:
   ```
   NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## How to Play

1. One player creates a new lobby and becomes the host
2. Other players join using the lobby code
3. The host sets the number of rounds and starts the game
4. Each round:
   - All players receive a question (except the imposter, who gets a slightly different one)
   - Players discuss their answers
   - Players vote on who they think is the imposter
   - The host moves to the next round
5. After all rounds, the player with the most votes is revealed as the imposter

## Technologies Used

- Next.js
- TypeScript
- Socket.IO
- Google Gemini AI
- Tailwind CSS
- Zustand (State Management)
