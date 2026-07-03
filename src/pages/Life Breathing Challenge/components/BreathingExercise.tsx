
import React, { useState, useEffect, useRef } from 'react';

interface BreathingExerciseProps {
  onComplete: () => void;
}

enum Phase {
  INHALE = "숨을 깊게 들이마세요",
  EXHALE = "천천히, 길게 내쉬세요",
}

const BreathingExercise: React.FC<BreathingExerciseProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<Phase>(Phase.INHALE);
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const startTimeRef = useRef<number | null>(null);

  // Exhale is twice as long as Inhale (4s Inhale, 8s Exhale)
  const INHALE_DURATION = 4000;
  const EXHALE_DURATION = 8000;
  const TOTAL_DURATION = INHALE_DURATION + EXHALE_DURATION;

  // Path Calculation: Triangular Peak
  const peakX = (INHALE_DURATION / TOTAL_DURATION) * 800;
  const pathData = `M 0 320 L ${peakX} 80 L 800 320`;
  
  // Precise segment lengths for mapping
  const len1 = Math.sqrt(Math.pow(peakX, 2) + Math.pow(240, 2));
  const len2 = Math.sqrt(Math.pow(800 - peakX, 2) + Math.pow(240, 2));
  const totalPathLength = len1 + len2;
  const peakRatio = len1 / totalPathLength;

  useEffect(() => {
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      
      let currentPathProgress = 0;

      if (elapsed < INHALE_DURATION) {
        // INHALE PHASE: 0 to peakRatio
        const phaseProgress = elapsed / INHALE_DURATION;
        currentPathProgress = phaseProgress * peakRatio;
        
        if (phase !== Phase.INHALE) setPhase(Phase.INHALE);
        setTimeLeft(Math.ceil((INHALE_DURATION - elapsed) / 1000));
      } else if (elapsed < TOTAL_DURATION) {
        // EXHALE PHASE: peakRatio to 1.0
        const exhaleElapsed = elapsed - INHALE_DURATION;
        const phaseProgress = Math.min(exhaleElapsed / EXHALE_DURATION, 1);
        currentPathProgress = peakRatio + (phaseProgress * (1 - peakRatio));
        
        if (phase !== Phase.EXHALE) setPhase(Phase.EXHALE);
        setTimeLeft(Math.ceil((TOTAL_DURATION - elapsed) / 1000));
      } else {
        setProgress(1);
        onComplete();
        return;
      }

      setProgress(currentPathProgress);
      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [onComplete, phase, peakRatio]);

  return (
    <div className="flex flex-col items-center">
      {/* Timer & Instruction */}
      <div className="mb-6 flex flex-col items-center justify-center text-center">
        <div className="text-8xl font-black font-mono text-blue-400 drop-shadow-[0_0_30px_rgba(96,165,250,0.5)] transition-all duration-300">
          {timeLeft}
        </div>
        <div className="h-10 mt-2">
          <h2 className="text-2xl md:text-3xl font-bold text-white/80 tracking-tight animate-pulse">
            {phase}
          </h2>
        </div>
      </div>

      {/* 3D Scene Container */}
      <div className="relative w-full aspect-[16/9] perspective-[1500px] flex items-center justify-center overflow-visible">
        
        {/* Deep 3D Floor Grid */}
        <div 
          className="absolute inset-x-0 bottom-0 h-full pointer-events-none opacity-20"
          style={{ 
            backgroundImage: 'linear-gradient(to right, #333 1px, transparent 1px), linear-gradient(to bottom, #333 1px, transparent 1px)',
            backgroundSize: '50px 50px',
            transform: 'rotateX(80deg) translateY(120px) translateZ(-150px)',
            maskImage: 'linear-gradient(to top, black, transparent, transparent)'
          }}
        ></div>

        <div 
          className="w-full h-full relative"
          style={{ 
            transform: 'rotateX(25deg) rotateY(0deg)',
            transformStyle: 'preserve-3d'
          }}
        >
          <div className="absolute inset-0 bg-blue-600/5 blur-[150px] rounded-full translate-y-32 scale-150"></div>

          <svg
            viewBox="0 0 800 400"
            className="w-full h-full overflow-visible"
          >
            <defs>
              <linearGradient id="ribbonGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#1e40af" />
                <stop offset={`${peakRatio * 100}%`} stopColor="#60a5fa" />
                <stop offset="100%" stopColor="#1e3a8a" />
              </linearGradient>
              
              <filter id="pathGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="12" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Depth Shadows */}
            <path
              d={pathData}
              fill="none"
              stroke="rgba(0,0,0,0.5)"
              strokeWidth="40"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="translate-y-10 blur-xl"
            />

            {/* Inactive Path Guide */}
            <path
              d={pathData}
              fill="none"
              stroke="rgba(255,255,255,0.03)"
              strokeWidth="16"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Main Smooth Flow Line */}
            <path
              d={pathData}
              fill="none"
              stroke="url(#ribbonGradient)"
              strokeWidth="18"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={totalPathLength}
              strokeDashoffset={totalPathLength - (progress * totalPathLength)}
              filter="url(#pathGlow)"
              style={{
                willChange: 'stroke-dashoffset'
              }}
            />

            {/* Subtle Core Line */}
            <path
              d={pathData}
              fill="none"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={totalPathLength}
              strokeDashoffset={totalPathLength - (progress * totalPathLength)}
            />
          </svg>
        </div>

        {/* Ambient Floating Dust */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-blue-400/10 rounded-full animate-pulse"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="mt-16 w-full max-w-lg">
        <div className="w-full h-1.5 bg-zinc-900/80 rounded-full border border-white/5 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-600 to-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all duration-75" 
            style={{ 
              width: `${progress * 100}%`,
              willChange: 'width' 
            }}
          ></div>
        </div>
        <div className="mt-4 flex justify-between items-center">
          <span className="text-[10px] text-zinc-600 font-bold tracking-widest">0% START</span>
          <span className="text-[10px] text-zinc-400 font-bold tracking-[0.4em] uppercase">
            Mindful Longevity Flow
          </span>
          <span className="text-[10px] text-zinc-600 font-bold tracking-widest">100% COMPLETE</span>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .perspective-1500 {
          perspective: 1500px;
        }
      ` }} />
    </div>
  );
};

export default BreathingExercise;
