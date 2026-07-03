
import React, { useState } from 'react';

interface IntroViewProps {
  onStart: (name: string) => void;
  initialName: string;
}

const IntroView: React.FC<IntroViewProps> = ({ onStart, initialName }) => {
  const [name, setName] = useState(initialName);
  const [step, setStep] = useState(initialName ? 'WELCOME' : 'NAME');

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      setStep('WELCOME');
    }
  };

  const handleFinalStart = () => {
    onStart(name.trim());
  };

  return (
    <div className="text-center min-h-[400px] flex flex-col items-center justify-center">
      {step === 'NAME' ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 flex flex-col items-center">
          <div className="inline-block mb-6 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold tracking-[0.3em] uppercase">
            Longevity Protocol
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-10 tracking-tighter text-white">
            이름을 알려주세요
          </h1>
          
          <form onSubmit={handleNext} className="w-full max-w-xs space-y-6">
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="이름 입력..."
                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-center text-white placeholder:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-bold text-xl shadow-inner"
                maxLength={10}
                autoFocus
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              다음으로
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </form>
        </div>
      ) : (
        <div className="animate-in fade-in zoom-in duration-700 flex flex-col items-center">
          <div className="w-20 h-20 bg-blue-500/20 rounded-3xl flex items-center justify-center mb-6 border border-blue-500/30">
            <span className="text-3xl">👋</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter text-white">
            반갑습니다, <span className="text-blue-400">{name}</span>님!
          </h1>
          <p className="text-zinc-500 mb-12 max-w-sm mx-auto leading-relaxed font-medium">
            오늘 당신의 수명을 늘릴 준비가 되셨나요?<br/>
            준비가 되면 아래 버튼을 눌러주세요.
          </p>
          
          <div className="space-y-4 w-full max-w-xs">
            <button
              onClick={handleFinalStart}
              className="w-full group relative px-8 py-5 bg-white text-black font-black rounded-2xl overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_20px_50px_rgba(59,130,246,0.2)]"
            >
              <div className="absolute inset-0 bg-blue-50 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              <span className="relative flex items-center justify-center gap-3 text-lg">
                챌린지 시작하기
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
              </span>
            </button>
            <button 
              onClick={() => setStep('NAME')}
              className="text-zinc-600 hover:text-zinc-400 text-sm font-bold uppercase tracking-widest transition-colors"
            >
              이름 수정하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntroView;
