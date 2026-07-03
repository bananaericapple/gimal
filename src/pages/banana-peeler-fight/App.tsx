import React, { useState } from 'react';
import { WelcomeScreen } from './components/WelcomeScreen';
import { GameScreen } from './components/GameScreen';
import { Leaderboard } from './components/Leaderboard';
import { GameView } from './types';

function App() {
  const [view, setView] = useState<GameView>('WELCOME');
  const [playerName, setPlayerName] = useState('');

  const handleStart = (name: string) => {
    setPlayerName(name);
    setView('GAME');
  };

  const handleExit = () => {
    setView('WELCOME');
    setPlayerName('');
  };

  const handleViewLeaderboard = () => {
    setView('LEADERBOARD');
  };

  const handleBackFromLeaderboard = () => {
    // If we have a player name, go back to game view (GameScreen is already mounted)
    if (playerName) {
      setView('GAME');
    } else {
      setView('WELCOME');
    }
  };

  return (
    <>
      {view === 'WELCOME' && <WelcomeScreen onStart={handleStart} />}
      
      {/* 
         We keep GameScreen mounted if the player has started the game (playerName exists).
         This ensures the timer and state persist even when the Leaderboard is open.
      */}
      {playerName && (
        <div className={`${view === 'WELCOME' ? 'hidden' : 'block'} h-full w-full`}>
           <GameScreen 
            playerName={playerName} 
            onExit={handleExit} 
            onViewLeaderboard={handleViewLeaderboard} 
          />
        </div>
      )}

      {/* Leaderboard is rendered as an overlay on top of the game when active */}
      {view === 'LEADERBOARD' && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <Leaderboard 
            onBack={handleBackFromLeaderboard} 
            currentPlayerName={playerName}
          />
        </div>
      )}
    </>
  );
}

export default App;
