import React from 'react';
import { Player, Platform, Rect, Particle, GameStatus } from '../types';
import { PLAYER_SIZE, L1_EXIT, L2_EXIT, L3_EXIT, L4_EXIT, LOLLIPOP_TARGET } from '../constants';
import { MapPin, ArrowRight } from 'lucide-react';

interface GameRendererProps {
  player: Player;
  platforms: Platform[];
  particles: Particle[];
  viewOffset: { x: number; y: number };
  gameState: GameStatus;
}

export const GameRenderer: React.FC<GameRendererProps> = ({ player, platforms, particles, viewOffset, gameState }) => {
  
  const getBackground = () => {
    switch(gameState) {
      case GameStatus.LEVEL_1: 
        return 'radial-gradient(circle at 50% 50%, #1e293b 0%, #0f172a 100%)'; // Dark Blue Room
      case GameStatus.LEVEL_2:
        return 'linear-gradient(to bottom, #60a5fa 0%, #3b82f6 100%)'; // Sky/Shirt blueish
      case GameStatus.LEVEL_3:
        return 'radial-gradient(circle at 50% 50%, #881337 0%, #4c0519 100%)'; // Inside Ear (Dark Red)
      case GameStatus.LEVEL_4:
        return 'radial-gradient(circle at 50% 50%, #44403c 0%, #1c1917 100%)'; // Middle Ear (Dark Gray/Bone)
      case GameStatus.LEVEL_5:
      case GameStatus.WON:
        return 'radial-gradient(circle at 50% 50%, #2e1065 0%, #000000 100%)'; // Brain/Dream (Deep Purple/Space)
      default:
        return 'bg-black';
    }
  };

  const getExitLabel = () => {
    switch(gameState) {
      case GameStatus.LEVEL_1: return "To Body";
      case GameStatus.LEVEL_2: return "To Ear";
      case GameStatus.LEVEL_3: return "Deeper";
      case GameStatus.LEVEL_4: return "To Brain";
      case GameStatus.LEVEL_5: return "CANDY!";
      default: return "";
    }
  };

  const getStageInfo = () => {
    switch(gameState) {
      case GameStatus.LEVEL_1: return { num: 1, name: "The Desk" };
      case GameStatus.LEVEL_2: return { num: 2, name: "The Giant" };
      case GameStatus.LEVEL_3: return { num: 3, name: "Ear Canal" };
      case GameStatus.LEVEL_4: return { num: 4, name: "Middle Ear" };
      case GameStatus.LEVEL_5: return { num: 5, name: "Dream World" };
      default: return { num: 0, name: "" };
    }
  };

  const currentExit = 
    gameState === GameStatus.LEVEL_1 ? L1_EXIT :
    gameState === GameStatus.LEVEL_2 ? L2_EXIT :
    gameState === GameStatus.LEVEL_3 ? L3_EXIT :
    gameState === GameStatus.LEVEL_4 ? L4_EXIT :
    gameState === GameStatus.LEVEL_5 ? LOLLIPOP_TARGET : null;

  const stage = getStageInfo();

  return (
    <div 
      className="relative w-full h-full overflow-hidden transition-colors duration-1000"
      style={{ background: getBackground() }}
    >
      {/* Background Ambience */}
      {gameState === GameStatus.LEVEL_5 && (
        <div className="absolute inset-0 opacity-30">
           <div className="absolute top-10 left-10 w-2 bg-white h-2 rounded-full animate-ping"></div>
           <div className="absolute top-1/2 left-1/4 w-3 bg-purple-400 h-3 rounded-full animate-pulse"></div>
           <div className="absolute bottom-20 right-20 w-2 bg-cyan-400 h-2 rounded-full animate-bounce"></div>
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
        </div>
      )}

      {/* Container that moves with camera */}
      <div 
        className="absolute transition-transform duration-75 ease-linear will-change-transform"
        style={{
          transform: `translate(${-viewOffset.x}px, ${-viewOffset.y}px)`,
          width: '100%',
          height: '100%'
        }}
      >
        
        {/* Background Visuals for L2 Giant Face */}
        {gameState === GameStatus.LEVEL_2 && (
            <div className="absolute left-[850px] top-[150px] w-64 h-64 rounded-full bg-orange-200 border-4 border-orange-300 shadow-xl z-0 opacity-80">
               {/* Ear Visual */}
               <div className="absolute top-20 right-[-10px] w-12 h-20 bg-orange-300 rounded-r-3xl border-r-4 border-orange-400"></div>
            </div>
        )}

        {/* Exit / Target Marker */}
        {currentExit && (
           <div 
             className="absolute z-10 animate-pulse flex flex-col items-center justify-center"
             style={{
               left: currentExit.x,
               top: currentExit.y,
               width: currentExit.w,
               height: currentExit.h,
             }}
           >
              {gameState === GameStatus.LEVEL_5 ? (
                // Lollipop Graphic
                <div className="relative w-full h-full flex flex-col items-center animate-bounce">
                  <div className="w-12 h-12 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-full border-2 border-white/30 shadow-[0_0_20px_rgba(236,72,153,0.8)] z-10">
                    <div className="absolute top-2 left-3 w-3 h-2 bg-white/40 rounded-full rotate-45"></div>
                  </div>
                  <div className="w-2 h-14 bg-white -mt-1 shadow-sm"></div>
                </div>
              ) : (
                // Generic Portal/Zone
                <div className="w-full h-full rounded-xl border-4 border-white/50 bg-white/10 backdrop-blur-sm animate-pulse shadow-[0_0_15px_rgba(255,255,255,0.3)]"></div>
              )}
              
              <div className="absolute -top-10 flex items-center gap-1 whitespace-nowrap text-xs font-bold text-white bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full border border-white/10">
                 {getExitLabel()} <ArrowRight size={12} />
              </div>
           </div>
        )}

        {/* Platforms */}
        {platforms.map((platform) => (
          <div
            key={platform.id}
            className={`absolute ${platform.color} shadow-md`}
            style={{
              left: platform.x,
              top: platform.y,
              width: platform.w,
              height: platform.h,
              transform: platform.rotation ? `rotate(${platform.rotation}deg)` : 'none',
              borderRadius: 
                 platform.type === 'head' || platform.type === 'organic' ? '1rem' : 
                 platform.type === 'neuron' ? '1rem' :
                 platform.type === 'wax' ? '0.4rem' : '2px',
              border: platform.type === 'neuron' ? '2px solid rgba(255,255,255,0.5)' : 'none',
              boxShadow: platform.type === 'neuron' ? '0 0 10px rgba(255,255,255,0.2)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          >
            {/* Texture overlays */}
            {platform.type === 'desk' && (
              <div className="w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')]"></div>
            )}
            {platform.type === 'bone' && (
               <div className="absolute inset-1 border border-stone-400/30 rounded-sm"></div>
            )}
            {platform.type === 'neuron' && (
               <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
            )}
          </div>
        ))}

        {/* Player */}
        <div
          className="absolute z-20 will-change-transform"
          style={{
            left: player.x,
            top: player.y,
            width: player.w,
            height: player.h,
          }}
        >
          <div className={`w-full h-full transition-transform ${player.facingRight ? 'scale-x-100' : '-scale-x-100'}`}>
             <div className="w-full h-full bg-green-400 rounded-sm border-2 border-green-600 relative overflow-visible shadow-lg">
                {/* Eyes */}
                <div className="absolute top-1 right-1 w-2 h-2 bg-white rounded-full">
                  <div className="absolute top-0.5 right-0.5 w-1 h-1 bg-black rounded-full"></div>
                </div>
                {/* Sweat drop */}
                {Math.abs(player.vx) > 3 && (
                  <div className="absolute -top-2 -left-2 w-2 h-2 bg-cyan-300 rounded-full animate-ping"></div>
                )}
             </div>
          </div>
        </div>

        {/* Particles */}
        {particles.map(p => (
          <div 
            key={p.id}
            className="absolute rounded-full"
            style={{
              left: p.x,
              top: p.y,
              width: p.life * 6,
              height: p.life * 6,
              backgroundColor: p.color,
              opacity: p.life,
              boxShadow: `0 0 5px ${p.color}`
            }}
          />
        ))}

      </div>

      {/* STAGE BADGE (Status Overlay) */}
      <div className="absolute top-4 left-4 z-40">
        <div className="flex items-center gap-3 bg-slate-900/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 shadow-lg">
          <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center font-black text-slate-900 text-sm border-2 border-amber-300">
             {stage.num}
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Current Stage</span>
            <span className="text-sm font-bold text-white leading-none">{stage.name}</span>
          </div>
        </div>
      </div>
      
      {/* Small Controls Hint (Always visible but unobtrusive) */}
      <div className="absolute bottom-4 left-4 z-40 opacity-50 hover:opacity-100 transition-opacity duration-300">
         <div className="bg-slate-900/40 backdrop-blur rounded px-3 py-1.5 text-[10px] text-white/70 border border-white/5">
            Move: <span className="font-bold text-white">WASD / Arrows</span> • Jump: <span className="font-bold text-white">SPACE</span>
         </div>
      </div>
    </div>
  );
};