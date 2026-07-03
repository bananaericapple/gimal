
import React, { useEffect, useState } from 'react';

interface ResultViewProps {
  onRestart: () => void;
  userName: string;
}

const ResultView: React.FC<ResultViewProps> = ({ onRestart, userName }) => {
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    // Update ranking data in localStorage
    const savedData = localStorage.getItem('longevity_rankings');
    let rankings: Record<string, number> = savedData ? JSON.parse(savedData) : {};
    
    rankings[userName] = (rankings[userName] || 0) + 1;
    localStorage.setItem('longevity_rankings', JSON.stringify(rankings));

    const timer = setTimeout(() => setShowText(true), 500);
    return () => clearTimeout(timer);
  }, [userName]);

  return (
    <div className="text-center flex flex-col items-center">
      <div className="mb-10 flex justify-center">
        <div className="relative group">
          {/* Animated Glow Rings */}
          <div className="absolute inset-0 animate-ping rounded-full bg-red-500/20 scale-150 duration-2000"></div>
          <div className="absolute inset-0 animate-pulse rounded-full bg-red-400/10 scale-125"></div>
          
          {/* Main Heart Container */}
          <div className="relative w-28 h-28 bg-gradient-to-br from-red-500 via-rose-500 to-pink-600 rounded-[2rem] flex items-center justify-center shadow-[0_20px_60px_-15px_rgba(225,29,72,0.5)] rotate-3 group-hover:rotate-0 transition-transform duration-500">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="currentColor" 
              className="w-14 h-14 text-white drop-shadow-lg"
            >
              <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.5 3c1.373 0 2.585.55 3.46 1.442.875-.892 2.087-1.442 3.46-1.442 2.786 0 5.25 2.322 5.25 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001Z" />
            </svg>
          </div>
        </div>
      </div>

      <div className={`transition-all duration-1000 transform ${showText ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <h2 className="text-5xl md:text-6xl font-black mb-4 bg-gradient-to-r from-blue-400 via-white to-purple-400 bg-clip-text text-transparent tracking-tighter">
          축하합니다!
        </h2>
        <div className="space-y-2 mb-10">
          <p className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            <span className="text-blue-400">{userName}</span>님의 수명이
          </p>
          <div className="flex items-center justify-center gap-3">
            <span className="text-4xl md:text-5xl font-black text-white bg-blue-600 px-4 py-1 rounded-2xl shadow-lg shadow-blue-500/20">하루</span>
            <span className="text-2xl md:text-3xl font-bold text-white">더 늘어났습니다!</span>
          </div>
        </div>
        
        <p className="text-zinc-500 mb-12 max-w-md mx-auto leading-relaxed font-medium">
          호흡 하나로 당신의 생명력 지수가 상승했습니다.<br/>
          꾸준한 호흡은 정신과 신체 모두를 건강하게 만듭니다.
        </p>
        
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={onRestart}
            className="w-full max-w-xs px-12 py-5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-white font-black text-lg active:scale-95 shadow-2xl backdrop-blur-md"
          >
            한 번 더 연장하기
          </button>
          <p className="text-[10px] text-zinc-700 font-bold tracking-[0.3em] uppercase">
            Consistency is the key to longevity
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResultView;
