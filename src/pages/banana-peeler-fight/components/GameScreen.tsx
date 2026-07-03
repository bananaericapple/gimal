import React, { useState, useEffect, useCallback } from 'react';
import { Banana } from './Banana';
import { Trophy, ArrowLeft } from 'lucide-react';
import { saveScore } from '../services/storageService';

interface GameScreenProps {
  playerName: string;
  onExit: () => void;
  onViewLeaderboard: () => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({ playerName, onExit, onViewLeaderboard }) => {
  const [peelStage, setPeelStage] = useState(0); // 0 = Full, 3 = Naked
  const [totalPeels, setTotalPeels] = useState(0);
  const [isRegrowing, setIsRegrowing] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Handle peeling logic
  const handlePeel = useCallback(() => {
    if (isRegrowing) return;

    if (peelStage < 3) {
      setPeelStage(prev => prev + 1);
    }
  }, [peelStage, isRegrowing]);

  // Check if fully peeled
  useEffect(() => {
    if (peelStage === 3 && !isRegrowing) {
      // Banana fully peeled!
      setTotalPeels(prev => {
         const newScore = prev + 1;
         saveScore(playerName, newScore); // Save every successful peel
         return newScore;
      });
      setIsRegrowing(true);
      setCountdown(15); // Reduced to 15 seconds
    }
  }, [peelStage, isRegrowing, playerName]);

  // Timer logic for countdown display
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRegrowing && countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRegrowing, countdown]);

  // Handle regrowth completion
  const handleRegrowComplete = useCallback(() => {
    setIsRegrowing(false);
    setPeelStage(0);
    setCountdown(0);
  }, []);

  useEffect(() => {
    if (!isRegrowing || countdown !== 0) return;
    handleRegrowComplete();
  }, [countdown, handleRegrowComplete, isRegrowing]);

  return (
    <div
      className="relative w-full h-full flex flex-col items-center overflow-hidden bg-gradient-to-b from-yellow-50 to-orange-50"
    >
      
      {/* Header UI */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start z-40">
        <div className="flex flex-col gap-1">
            <button 
                onClick={onExit}
                className="bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-sm hover:bg-white transition-colors text-gray-600"
            >
                <ArrowLeft size={24} />
            </button>
            <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl shadow-sm mt-2">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Player</p>
                <p className="font-bold text-gray-800">{playerName}</p>
            </div>
        </div>

        <button 
            onClick={onViewLeaderboard}
            className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-3 rounded-xl shadow-sm hover:shadow-md transition-all text-yellow-600 font-bold"
        >
            <Trophy size={20} />
            <span>Ranking</span>
        </button>
      </div>

      {/* Main Stats */}
      <div className="mt-8 z-40 text-center">
        <h2 className="text-5xl font-black text-yellow-500 drop-shadow-sm tabular-nums">
            {totalPeels}
        </h2>
        <p className="text-yellow-700/60 font-medium uppercase tracking-widest text-sm">Bananas Peeled</p>
      </div>

      {/* Game Area */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-lg mx-auto relative mt-[-40px]">
        
        {/* Helper Text */}
        <div className={`absolute top-10 transition-opacity duration-300 ${isRegrowing ? 'opacity-0' : 'opacity-100'} z-30 pointer-events-none`}>
            {peelStage === 0 && <p className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-bold animate-bounce">Click to peel!</p>}
        </div>

        {/* The Banana */}
        <Banana 
            peelStage={peelStage} 
            isRegrowing={isRegrowing}
            onClick={handlePeel} 
            onTransitionEnd={handleRegrowComplete}
        />

        {/* Regrowth Overlay / Status */}
        {isRegrowing && (
            <div className="absolute bottom-10 flex flex-col items-center animate-pulse z-40">
                <div className="text-2xl font-bold text-green-600 mb-1">Regrowing...</div>
                <div className="text-sm text-green-800 font-medium bg-green-100 px-3 py-1 rounded-full">
                    Wait {countdown}s
                </div>
            </div>
        )}
      </div>

      {/* Progress Bar (Visual indicator for the 15s) */}
      {isRegrowing && (
          <div className="absolute bottom-0 left-0 w-full h-2 bg-gray-200">
              <div 
                className="h-full bg-green-500 origin-left" 
                style={{ 
                    transition: 'width 15s linear',
                    width: isRegrowing ? '100%' : '0%' 
                }}
              >
                {/* 
                   Animation backup for smoother visual if transition behaves oddly
                */}
                <style>{`
                    .progress-fill {
                        animation: fillBar 15s linear forwards;
                    }
                    @keyframes fillBar {
                        from { width: 0%; }
                        to { width: 100%; }
                    }
                `}</style>
                <div className="h-full bg-green-500 w-0 progress-fill" />
              </div>
          </div>
      )}
    </div>
  );
};
