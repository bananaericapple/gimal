
import React from 'react';

interface RankingButtonProps {
  onClick: () => void;
}

const RankingButton: React.FC<RankingButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed top-8 right-8 z-50 group flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 hover:scale-105 transition-all active:scale-95"
    >
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-[0_0_15px_rgba(251,191,36,0.3)]">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white">
          <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
          <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
          <path d="M4 22h16"></path>
          <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
          <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
          <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
        </svg>
      </div>
      <span className="text-xs font-black tracking-widest text-zinc-300 group-hover:text-white uppercase">
        장수왕 랭킹
      </span>
    </button>
  );
};

export default RankingButton;
