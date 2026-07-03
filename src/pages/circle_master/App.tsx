import React, { useState } from 'react';
import DrawingCanvas from './components/DrawingCanvas';
import ResultCard from './components/ResultCard';
import { GameState, CircleResult } from './types';
import { Circle, Info } from 'lucide-react';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.IDLE);
  const [result, setResult] = useState<CircleResult | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  const handleReset = () => {
    setGameState(GameState.IDLE);
    setResult(null);
  };

  return (
    <div className="w-full h-full bg-slate-950 flex flex-col relative overflow-hidden">
      {/* Header */}
      <header className="absolute top-0 left-0 w-full p-6 flex justify-between items-start z-10 pointer-events-none">
        <div className="pointer-events-auto">
            <h1 className="text-2xl font-black tracking-tighter text-white flex items-center gap-2">
                <Circle className="text-purple-500" fill="currentColor" fillOpacity={0.2} />
                CIRCLE<span className="text-purple-500">MASTER</span>
            </h1>
            <p className="text-slate-500 text-sm mt-1">Try to draw a perfect circle.</p>
        </div>
        
        <button 
            onClick={() => setShowInfo(!showInfo)}
            className="pointer-events-auto p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full transition-colors"
        >
            <Info size={20} />
        </button>
      </header>

      {/* Info Modal */}
      {showInfo && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setShowInfo(false)}>
              <div className="bg-slate-900 border border-slate-700 p-6 rounded-xl max-w-sm text-slate-300 shadow-2xl" onClick={e => e.stopPropagation()}>
                  <h3 className="font-bold text-white mb-2">How it works</h3>
                  <p className="text-sm mb-4">
                      Draw a circle with your mouse or finger. We calculate the mathematical perfection of your shape based on:
                  </p>
                  <ul className="list-disc list-inside text-sm space-y-1 mb-4 text-slate-400">
                      <li>Roundness (Standard Deviation)</li>
                      <li>Closure (Gap between start/end)</li>
                      <li>Consistency of radius</li>
                  </ul>
                  <div className="space-y-2 text-xs font-mono">
                      <div className="flex justify-between"><span className="text-purple-400">S Rank</span> <span>98.5% +</span></div>
                      <div className="flex justify-between"><span className="text-green-400">A Rank</span> <span>93% +</span></div>
                      <div className="flex justify-between"><span className="text-blue-400">B Rank</span> <span>88% +</span></div>
                  </div>
                  <button 
                    onClick={() => setShowInfo(false)}
                    className="mt-6 w-full py-2 bg-slate-800 hover:bg-slate-700 rounded text-white font-semibold transition-colors"
                  >
                      Got it
                  </button>
              </div>
          </div>
      )}

      {/* Main Canvas Area */}
      <main className="flex-1 relative">
        <DrawingCanvas 
            gameState={gameState} 
            setGameState={setGameState} 
            setResult={setResult}
            result={result}
        />
      </main>

      {/* Results Overlay */}
      {gameState === GameState.RESULT && result && (
        <ResultCard result={result} onReset={handleReset} />
      )}

      {/* Footer / Instructions */}
      {gameState !== GameState.RESULT && (
         <div className="absolute bottom-8 left-0 w-full text-center pointer-events-none">
             <p className="text-slate-600 text-sm font-medium animate-pulse">
                {gameState === GameState.DRAWING ? 'Release to finish...' : ''}
             </p>
         </div>
      )}
    </div>
  );
};

export default App;
