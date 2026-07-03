
import React, { useState } from 'react';
import { Difficulty, GameStats } from './types';
import GameCanvas from './components/GameCanvas';
import ResultsView from './components/ResultsView';

const App: React.FC = () => {
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.MEDIUM);
  const [view, setView] = useState<'lobby' | 'playing' | 'results'>('lobby');
  const [currentStats, setCurrentStats] = useState<GameStats>({
    hits: 0,
    misses: 0,
    totalClicks: 0,
    accuracy: 100,
    score: 0,
    reactionTimes: [],
    startTime: null,
    endTime: null,
  });

  const handleUpdateStats = (newStats: Partial<GameStats>) => {
    setCurrentStats(prev => ({ ...prev, ...newStats }));
  };

  const handleGameEnd = (finalStats: GameStats) => {
    setCurrentStats(finalStats);
    setView('results');
  };

  const resetGame = () => {
    setCurrentStats({
      hits: 0,
      misses: 0,
      totalClicks: 0,
      accuracy: 100,
      score: 0,
      reactionTimes: [],
      startTime: null,
      endTime: null,
    });
    setView('lobby');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 overflow-auto py-8 px-4">
      {/* Background decoration */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full"></div>
      </div>

      <main className="max-w-6xl xl:max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-cyan-500 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                <svg className="w-6 h-6 text-slate-900" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h1 className="text-3xl font-black italic tracking-tighter uppercase">AimMaster<span className="text-cyan-400">Pro</span></h1>
            </div>
            <p className="text-slate-500 text-sm mt-1 font-medium">Precision Tracking System v2.0</p>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
              <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Accuracy</span>
              <span className={`text-2xl font-mono font-bold ${currentStats.accuracy < 80 ? 'text-red-400' : 'text-cyan-400'}`}>
                {currentStats.accuracy.toFixed(1)}%
              </span>
            </div>
            <div className="w-px h-10 bg-slate-800"></div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Total Score</span>
              <span className="text-2xl font-mono font-bold text-white">
                {currentStats.score.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {view === 'lobby' && (
          <div className="flex flex-col items-center justify-center min-h-[500px] animate-in slide-in-from-bottom-4 duration-500">
            <div className="bg-slate-900/40 p-12 rounded-3xl border border-slate-800 backdrop-blur-md max-w-xl w-full text-center shadow-2xl">
              <h2 className="text-4xl font-extrabold mb-8">Choose Your Difficulty</h2>
              <div className="grid grid-cols-1 gap-4 mb-10">
                {(Object.keys(Difficulty) as Array<keyof typeof Difficulty>).map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setDifficulty(Difficulty[diff])}
                    className={`group flex items-center justify-between p-6 rounded-2xl border-2 transition-all ${
                      difficulty === Difficulty[diff]
                        ? 'border-cyan-500 bg-cyan-500/10 shadow-[0_0_20px_rgba(6,182,212,0.1)]'
                        : 'border-slate-800 bg-slate-800/20 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-left">
                      <div className={`text-xl font-bold ${difficulty === Difficulty[diff] ? 'text-cyan-400' : 'text-slate-300'}`}>
                        {Difficulty[diff]}
                      </div>
                      <p className="text-xs text-slate-500">
                        {Difficulty[diff] === 'EASY' ? 'Perfect for warmups' : 
                         Difficulty[diff] === 'MEDIUM' ? 'Standard training mode' : 
                         'Elite level precision'}
                      </p>
                    </div>
                    {difficulty === Difficulty[diff] && (
                      <div className="w-4 h-4 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.8)]"></div>
                    )}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setView('playing')}
                className="w-full py-5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-xl rounded-2xl transition-all transform hover:-translate-y-1 active:translate-y-0 shadow-lg"
              >
                ENTER ARENA
              </button>
            </div>
          </div>
        )}

        {view === 'playing' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm font-semibold uppercase tracking-widest text-slate-500 px-2">
              <div className="flex gap-4">
                <span>Hits: <span className="text-cyan-400">{currentStats.hits}</span></span>
                <span>Misses: <span className="text-red-400">{currentStats.misses}</span></span>
              </div>
              <button 
                onClick={resetGame}
                className="hover:text-white transition-colors flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Abort Training
              </button>
            </div>
            <GameCanvas 
              difficulty={difficulty} 
              onGameEnd={handleGameEnd}
              onUpdateStats={handleUpdateStats}
            />
          </div>
        )}

        {view === 'results' && (
          <ResultsView 
            stats={currentStats} 
            difficulty={difficulty} 
            onRetry={resetGame} 
          />
        )}
      </main>

      <footer className="mt-20 text-center text-slate-600 text-xs">
        <p>© 2024 AimMaster Pro Training Engine. All rights reserved.</p>
        <p className="mt-2 font-mono">ENHANCING HUMAN PRECISION THROUGH TECHNOLOGY</p>
      </footer>
    </div>
  );
};

export default App;
