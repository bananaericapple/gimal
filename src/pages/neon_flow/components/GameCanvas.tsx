
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Difficulty, Target, GameStats } from '../types';
import { DIFFICULTY_SETTINGS, GAME_DURATION } from '../constants';
import TargetComponent from './TargetComponent';

interface GameCanvasProps {
  difficulty: Difficulty;
  onGameEnd: (stats: GameStats) => void;
  onUpdateStats: (stats: Partial<GameStats>) => void;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ difficulty, onGameEnd, onUpdateStats }) => {
  const [targets, setTargets] = useState<Target[]>([]);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [isActive, setIsActive] = useState(false);
  
  const statsRef = useRef<GameStats>({
    hits: 0,
    misses: 0,
    totalClicks: 0,
    accuracy: 0,
    score: 0,
    reactionTimes: [],
    startTime: null,
    endTime: null,
  });

  const settings = DIFFICULTY_SETTINGS[difficulty];

  const spawnTarget = useCallback(() => {
    const id = Math.random().toString(36).substr(2, 9);
    const newTarget: Target = {
      id,
      x: 10 + Math.random() * 80, // Keep away from extreme edges
      y: 10 + Math.random() * 80,
      size: settings.targetSize,
      createdAt: Date.now(),
    };
    setTargets(prev => [...prev, newTarget]);
  }, [settings]);

  const startGame = () => {
    setIsActive(true);
    statsRef.current.startTime = Date.now();
    spawnTarget();
  };

  const endGame = useCallback(() => {
    setIsActive(false);
    statsRef.current.endTime = Date.now();
    onGameEnd(statsRef.current);
  }, [onGameEnd]);

  useEffect(() => {
    if (!isActive) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const spawner = setInterval(() => {
      if (targets.length < 5) {
        spawnTarget();
      }
    }, settings.spawnRate);

    return () => {
      clearInterval(timer);
      clearInterval(spawner);
    };
  }, [isActive, targets.length, spawnTarget, settings.spawnRate, endGame]);

  const handleHit = (id: string) => {
    const now = Date.now();
    const target = targets.find(t => t.id === id);
    if (target) {
      const reactionTime = now - target.createdAt;
      statsRef.current.reactionTimes.push(reactionTime);
    }

    statsRef.current.hits += 1;
    statsRef.current.totalClicks += 1;
    statsRef.current.score += 100 * settings.scoreMultiplier;
    statsRef.current.accuracy = (statsRef.current.hits / statsRef.current.totalClicks) * 100;
    
    setTargets(prev => prev.filter(t => t.id !== id));
    onUpdateStats({ ...statsRef.current });
    spawnTarget();
  };

  const handleMiss = () => {
    if (!isActive) return;
    statsRef.current.misses += 1;
    statsRef.current.totalClicks += 1;
    statsRef.current.accuracy = (statsRef.current.hits / statsRef.current.totalClicks) * 100;
    onUpdateStats({ ...statsRef.current });
  };

  return (
    <div 
      className="relative w-full h-[600px] bg-slate-900/50 border-2 border-slate-700/50 rounded-2xl overflow-hidden cursor-crosshair backdrop-blur-sm"
      onClick={handleMiss}
    >
      {!isActive && timeLeft === GAME_DURATION && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-900/80">
          <h2 className="text-4xl font-extrabold mb-6 text-white tracking-tight">Ready?</h2>
          <button 
            onClick={(e) => { e.stopPropagation(); startGame(); }}
            className="px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold rounded-xl transition-all transform hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(6,182,212,0.5)]"
          >
            START TRAINING
          </button>
          <p className="mt-4 text-slate-400 text-sm">Targets will spawn for {GAME_DURATION} seconds</p>
        </div>
      )}

      {isActive && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-slate-800/80 rounded-full border border-slate-700 backdrop-blur-md z-30 pointer-events-none">
          <span className="text-2xl font-mono font-bold text-cyan-400">{timeLeft}s</span>
        </div>
      )}

      {targets.map(target => (
        <TargetComponent key={target.id} target={target} onHit={handleHit} />
      ))}
    </div>
  );
};

export default GameCanvas;
