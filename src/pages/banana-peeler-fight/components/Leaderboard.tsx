import React, { useEffect, useState } from 'react';
import { getScores } from '../services/storageService';
import { PlayerScore } from '../types';
import { ArrowLeft, Medal } from 'lucide-react';

interface LeaderboardProps {
  onBack: () => void;
  currentPlayerName?: string;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ onBack, currentPlayerName }) => {
  const [scores, setScores] = useState<PlayerScore[]>([]);

  useEffect(() => {
    setScores(getScores());
  }, []);

  const getMedalColor = (index: number) => {
    switch(index) {
        case 0: return 'text-yellow-400';
        case 1: return 'text-gray-400';
        case 2: return 'text-amber-600';
        default: return 'text-gray-300';
    }
  };

  return (
    <div className="w-full h-full bg-yellow-50 p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-md">
        <button 
            onClick={onBack}
            className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors font-bold"
        >
            <ArrowLeft size={20} />
            Back to Game
        </button>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border-4 border-yellow-200">
            <div className="bg-yellow-400 p-6 text-center">
                <h2 className="text-3xl font-black text-white uppercase tracking-wider">Hall of Peel</h2>
            </div>
            
            <div className="p-4 overflow-y-auto max-h-[60vh]">
                {scores.length === 0 ? (
                    <div className="text-center py-10 text-gray-400">
                        No peels yet. Be the first!
                    </div>
                ) : (
                    <ul className="space-y-3">
                        {scores.map((score, index) => (
                            <li 
                                key={score.id || index}
                                className={`flex items-center justify-between p-4 rounded-xl border-2 ${score.name === currentPlayerName ? 'bg-yellow-50 border-yellow-300' : 'bg-white border-gray-100'}`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`font-black text-xl w-8 text-center ${getMedalColor(index)}`}>
                                        {index < 3 ? <Medal size={24} fill="currentColor" /> : `#${index + 1}`}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-gray-800 text-lg truncate max-w-[120px] sm:max-w-[180px]">
                                            {score.name}
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            {new Date(score.date).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-2xl font-black text-gray-800 tabular-nums">
                                        {score.peels}
                                    </span>
                                    <span className="text-xs font-bold text-gray-400 uppercase">Peels</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};
