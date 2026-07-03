
import React from 'react';

interface RankingModalProps {
  onClose: () => void;
}

const RankingModal: React.FC<RankingModalProps> = ({ onClose }) => {
  const savedData = localStorage.getItem('longevity_rankings');
  const rankings: Record<string, number> = savedData ? JSON.parse(savedData) : {};
  
  // Convert object to sorted array
  const sortedRankings = Object.entries(rankings)
    .map(([name, days]) => ({ name, days }))
    .sort((a, b) => b.days - a.days)
    .slice(0, 10); // Top 10

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative w-full max-w-md bg-zinc-900/90 border border-white/10 rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in slide-in-from-bottom-10 duration-500 overflow-hidden">
        {/* Aesthetic background patterns */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 blur-3xl rounded-full translate-y-1/2 -translate-x-1/2"></div>

        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center border border-yellow-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-500">
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
                <path d="M4 22h16"></path>
                <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
                <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
                <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-black tracking-tighter text-white">명예의 전당 <span className="text-yellow-500">장수왕</span></h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-full transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {sortedRankings.length === 0 ? (
            <div className="py-20 text-center text-zinc-600 font-bold uppercase tracking-widest text-sm">
              기록이 아직 없습니다.
            </div>
          ) : (
            sortedRankings.map((user, index) => (
              <div 
                key={user.name} 
                className={`flex items-center justify-between p-5 rounded-2xl border transition-all ${
                  index === 0 
                  ? 'bg-yellow-500/10 border-yellow-500/20' 
                  : 'bg-white/5 border-white/5'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className={`text-lg font-black w-6 ${
                    index === 0 ? 'text-yellow-500' : 'text-zinc-500'
                  }`}>
                    {index + 1}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-white font-bold text-lg">{user.name} 님</span>
                    <span className="text-zinc-500 text-[10px] font-bold tracking-widest uppercase">HONORARY CHALLENGER</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-zinc-400 mb-0.5">더 살 수 있는 날</div>
                  <div className="text-xl font-black text-blue-400">{user.days}일</div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-white/5">
          <button 
            onClick={onClose}
            className="w-full py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-2xl transition-all"
          >
            확인
          </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
      `}} />
    </div>
  );
};

export default RankingModal;
