import React, { useState, useCallback, useRef } from 'react';
import { HandTracker } from './components/HandTracker';
import { GameCanvas } from './components/GameCanvas';
import { Point } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { Play, RotateCcw, Activity } from 'lucide-react';

export default function App() {
  const [handPosition, setHandPosition] = useState<Point[] | null>(null);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(20);
  const [showGameOver, setShowGameOver] = useState(false);
  
  const scoreRef = useRef(0);

  const handleHandUpdate = useCallback((points: Point[] | null) => {
    setHandPosition(points);
  }, []);

  const handleReady = useCallback(() => {
    setCameraError(null);
    setIsReady(true);
  }, []);

  const handleCameraError = useCallback((message: string) => {
    setCameraError(message);
    setIsReady(false);
  }, []);

  const handleScoreUpdate = useCallback((newScore: number) => {
    setScore(newScore);
    scoreRef.current = newScore;
  }, []);

  const startGame = () => {
    setScore(0);
    scoreRef.current = 0;
    setTimeLeft(20);
    setIsPlaying(true);
    setShowGameOver(false);
  };

  const stopGame = useCallback(() => {
    setIsPlaying(false);
    setShowGameOver(true);
  }, []);

  // Timer logic - stable and independent of score changes
  React.useEffect(() => {
    let timer: number;
    if (isPlaying && timeLeft > 0) {
      timer = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isPlaying) {
      stopGame();
    }
    return () => clearInterval(timer);
  }, [isPlaying, timeLeft, stopGame]);

  return (
    <div className="h-[calc(100vh-var(--topbar-h))] bg-zinc-950 text-white font-sans overflow-hidden">
      <main className="relative w-full h-full flex flex-col items-center">
        {/* Header Section */}
        <header className="absolute top-0 left-0 w-full p-8 flex items-center justify-between gap-8 z-20 pointer-events-none">
          <div />

          <div className="flex gap-4 pointer-events-auto">
            <div className="p-4 bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl flex flex-col items-end min-w-[120px]">
              <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest mb-1">Time</span>
              <span className={`text-3xl font-mono font-bold tabular-nums ${timeLeft < 10 ? 'text-red-500' : 'text-white'}`}>
                {timeLeft}s
              </span>
            </div>
            <div className="p-4 bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl flex flex-col items-end min-w-[140px]">
              <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest mb-1">Score</span>
              <span className="text-3xl font-mono font-bold text-emerald-400 tabular-nums">
                {score.toString().padStart(4, '0')}
              </span>
            </div>
          </div>
        </header>

        {/* Game Container */}
        <div className="relative w-full h-full">
          <div className="relative w-full h-full overflow-hidden bg-black">
            <HandTracker 
              onHandUpdate={handleHandUpdate} 
              onReady={handleReady} 
              onError={handleCameraError}
            />
            
            <GameCanvas 
              handPosition={handPosition} 
              isPlaying={isPlaying} 
              onScoreUpdate={handleScoreUpdate} 
            />

            {/* Overlay UI */}
            <AnimatePresence>
              {(!isPlaying || showGameOver) && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50"
                >
                  <div className="text-center space-y-8 p-12 max-w-md">
                    {showGameOver ? (
                      <div className="space-y-6">
                        <div className="text-white space-y-2">
                          <h2 className="text-4xl font-bold tracking-tighter">GAME OVER</h2>
                          <p className="text-white/60 font-mono text-sm">FINAL SCORE: {score}</p>
                        </div>
                        
                        <button
                          onClick={startGame}
                          className="group relative w-full py-4 bg-white text-black font-bold rounded-full transition-all hover:scale-105 active:scale-95"
                        >
                          <span className="relative flex items-center justify-center gap-2">
                            <RotateCcw size={18} />
                            PLAY AGAIN
                          </span>
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-8">
                        <div className="text-white space-y-2">
                          <h1 className="text-5xl font-bold tracking-tighter">BUBBLE POP</h1>
                          <p className="text-white/60 font-mono text-sm uppercase tracking-widest">Hand-Tracking Edition</p>
                          <p className={`pt-4 text-xs font-mono uppercase tracking-widest ${cameraError ? 'text-red-300' : isReady ? 'text-emerald-300' : 'text-white/50'}`}>
                            {cameraError ?? (isReady ? 'Camera Ready' : 'Preparing Camera...')}
                          </p>
                        </div>
                        <button
                          onClick={startGame}
                          disabled={!isReady}
                          className="group relative px-12 py-5 bg-emerald-500 text-white font-bold rounded-full transition-all hover:scale-105 active:scale-95 shadow-lg disabled:cursor-not-allowed disabled:bg-zinc-600 disabled:text-white/50 disabled:hover:scale-100"
                        >
                          <span className="relative flex items-center gap-2 text-lg">
                            <Play size={20} fill="currentColor" />
                            START GAME
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* In-Game HUD */}
            {isPlaying && (
              <div className="absolute bottom-6 right-6 pointer-events-none z-20">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 backdrop-blur-md border border-white/10 rounded-full">
                  <Activity size={12} className={handPosition ? "text-emerald-400" : "text-red-400"} />
                  <span className="text-[10px] font-mono uppercase tracking-widest text-white/70">
                    {handPosition ? "Tracking Active" : "Searching for Hand..."}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
