
import React, { useEffect, useState } from 'react';
import { GameStats, Difficulty, AIAnalysis } from '../types';
import { getAIAnalysis } from '../services/geminiService';

interface ResultsViewProps {
  stats: GameStats;
  difficulty: Difficulty;
  onRetry: () => void;
}

const getGrade = (accuracy: number) => {
  if (accuracy >= 98) return { label: 'S+', color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/50' };
  if (accuracy >= 95) return { label: 'S', color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/50' };
  if (accuracy >= 90) return { label: 'A', color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/50' };
  if (accuracy >= 80) return { label: 'B', color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/50' };
  if (accuracy >= 70) return { label: 'C', color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/50' };
  return { label: 'F', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/50' };
};

const ResultsView: React.FC<ResultsViewProps> = ({ stats, difficulty, onRetry }) => {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const grade = getGrade(stats.accuracy);

  useEffect(() => {
    const fetchAnalysis = async () => {
      setLoading(true);
      const data = await getAIAnalysis(stats, difficulty, grade.label);
      setAnalysis(data);
      setLoading(false);
    };
    fetchAnalysis();
  }, [stats, difficulty]);

  const avgReaction = stats.reactionTimes.length > 0
    ? (stats.reactionTimes.reduce((a, b) => a + b, 0) / stats.reactionTimes.length).toFixed(0)
    : "0";

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto animate-in fade-in zoom-in duration-700">
      <div className="text-center relative py-12">
        {/* Grade Badge */}
        <div className={`absolute left-1/2 -top-4 -translate-x-1/2 w-32 h-32 rounded-full flex items-center justify-center border-4 ${grade.border} ${grade.bg} backdrop-blur-xl shadow-2xl animate-bounce-slow`}>
          <span className={`text-6xl font-black ${grade.color} drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]`}>
            {grade.label}
          </span>
        </div>
        
        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-2 mt-20">Session Complete</h1>
        <p className="text-slate-400 uppercase tracking-widest text-sm font-bold">Difficulty: {difficulty}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Score', value: stats.score.toLocaleString(), color: 'text-cyan-400' },
          { label: 'Accuracy', value: `${stats.accuracy.toFixed(1)}%`, color: grade.color },
          { label: 'Hits', value: stats.hits, color: 'text-blue-400' },
          { label: 'Avg Reaction', value: `${avgReaction}ms`, color: 'text-purple-400' },
        ].map((item, idx) => (
          <div key={idx} className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 text-center hover:bg-slate-800 transition-colors">
            <p className="text-xs uppercase tracking-widest text-slate-500 mb-1 font-bold">{item.label}</p>
            <p className={`text-2xl font-black ${item.color}`}>{item.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-slate-800/80 rounded-3xl border border-slate-700 p-8 shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-cyan-500/20 rounded-xl border border-cyan-500/30">
            <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">AI Combat Assessment</h2>
        </div>

        {loading ? (
          <div className="flex flex-col items-center py-12">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-4 border-cyan-400/20"></div>
              <div className="absolute inset-0 rounded-full border-4 border-cyan-400 border-t-transparent animate-spin"></div>
            </div>
            <p className="text-slate-400 text-sm mt-4 font-medium">Gemini is analyzing your aim trajectory...</p>
          </div>
        ) : analysis ? (
          <div className="space-y-8">
            <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-700/50">
              <p className="text-slate-200 leading-relaxed italic text-lg">"{analysis.summary}"</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Improvement Protocol</h3>
                <ul className="space-y-3">
                  {analysis.tips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-slate-300 group">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-cyan-400 group-hover:bg-cyan-500 group-hover:text-slate-900 transition-colors">
                        {idx + 1}
                      </span>
                      <span className="text-sm font-medium">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Recommended Module</h3>
                <div className="mt-auto bg-gradient-to-br from-cyan-900/20 to-blue-900/20 p-6 rounded-2xl border border-cyan-500/20 flex flex-col items-center justify-center text-center">
                  <p className="text-cyan-400 font-black text-xl mb-1">{analysis.recommendedDrill}</p>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Next Evolution Target</p>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <div className="flex justify-center pt-4">
        <button 
          onClick={onRetry}
          className="group relative px-12 py-5 bg-white text-slate-950 font-black text-xl rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-[0_0_40px_rgba(255,255,255,0.2)]"
        >
          RESTART SEQUENCE
          <div className="absolute inset-0 rounded-2xl bg-white animate-ping opacity-0 group-hover:opacity-20 pointer-events-none"></div>
        </button>
      </div>
    </div>
  );
};

export default ResultsView;
