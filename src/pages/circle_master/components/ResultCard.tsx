import React, { useState } from 'react';
import { CircleResult, GeminiFeedback } from '../types';
import { getGeminiFeedback } from '../services/geminiService';
import { RefreshCcw, Star, BrainCircuit, Loader2 } from 'lucide-react';

interface ResultCardProps {
  result: CircleResult;
  onReset: () => void;
}

const ResultCard: React.FC<ResultCardProps> = ({ result, onReset }) => {
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<GeminiFeedback | null>(null);

  const handleGetAiFeedback = async () => {
    setLoadingAi(true);
    const feedback = await getGeminiFeedback(result);
    setAiFeedback(feedback);
    setLoadingAi(false);
  };

  const getColor = (grade: string) => {
    if (grade === 'S' || grade === 'A+') return 'text-purple-400';
    if (grade === 'A') return 'text-green-400';
    if (grade === 'B') return 'text-blue-400';
    if (grade === 'C') return 'text-yellow-400';
    if (grade === 'D') return 'text-orange-400';
    return 'text-red-500';
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="text-center mb-6">
          <h2 className="text-slate-400 text-sm uppercase tracking-widest font-semibold mb-2">Analysis Complete</h2>
          <div className={`text-8xl font-black ${getColor(result.grade)} drop-shadow-lg mb-2`}>
            {result.grade}
          </div>
          <div className="text-3xl font-bold text-slate-100">
            {result.score.toFixed(1)}%
          </div>
          {!result.isClosed && (
             <span className="inline-block mt-2 px-3 py-1 bg-red-500/10 text-red-400 text-xs rounded-full">
               Circle not closed
             </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
          <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700">
             <div className="text-slate-500 mb-1">Deviation</div>
             <div className="text-slate-200 font-mono">{Math.round(result.deviation)}px</div>
          </div>
          <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700">
             <div className="text-slate-500 mb-1">Radius</div>
             <div className="text-slate-200 font-mono">{Math.round(result.radius)}px</div>
          </div>
        </div>

        {aiFeedback && (
          <div className="mb-6 bg-indigo-900/20 border border-indigo-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2 text-indigo-300 font-semibold text-sm">
              <BrainCircuit size={16} />
              <span>Gemini Analysis</span>
            </div>
            <p className="text-slate-300 text-sm italic mb-3">"{aiFeedback.comment}"</p>
            <ul className="text-xs text-slate-400 list-disc list-inside space-y-1">
              {aiFeedback.tips.map((tip, idx) => (
                <li key={idx}>{tip}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {!aiFeedback && (
            <button 
              onClick={handleGetAiFeedback}
              disabled={loadingAi}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loadingAi ? <Loader2 className="animate-spin" size={20} /> : <Star size={20} />}
              {loadingAi ? 'Asking Gemini...' : 'Get AI Critique'}
            </button>
          )}

          <button 
            onClick={onReset}
            className="w-full py-3 px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCcw size={20} />
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultCard;
