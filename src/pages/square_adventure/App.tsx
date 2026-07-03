import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameRenderer } from './components/GameRenderer';
import { 
  Player, 
  GameStatus, 
  Rect, 
  Particle,
  Platform
} from './types';
import { 
  GRAVITY, 
  MOVE_SPEED, 
  JUMP_FORCE, 
  WORLD_WIDTH, 
  WORLD_HEIGHT, 
  PLAYER_SIZE, 
  LEVEL_1_PLATFORMS,
  LEVEL_2_PLATFORMS,
  LEVEL_3_PLATFORMS,
  LEVEL_4_PLATFORMS,
  LEVEL_5_PLATFORMS,
  L1_EXIT,
  L2_EXIT,
  L3_EXIT,
  L4_EXIT,
  LOLLIPOP_TARGET
} from './constants';
import { 
  Play, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Trophy, 
  BookOpen, 
  User, 
  Ear, 
  Hammer, 
  Brain, 
  Keyboard 
} from 'lucide-react';

const INITIAL_PLAYER: Player = {
  x: 50,
  y: 650,
  w: PLAYER_SIZE,
  h: PLAYER_SIZE,
  vx: 0,
  vy: 0,
  isGrounded: false,
  facingRight: true
};

const getLevelStartPos = (level: GameStatus): {x: number, y: number} => {
  switch(level) {
    case GameStatus.LEVEL_2: return { x: 50, y: 650 };
    case GameStatus.LEVEL_3: return { x: 50, y: 400 };
    case GameStatus.LEVEL_4: return { x: 50, y: 550 };
    case GameStatus.LEVEL_5: return { x: 50, y: 650 };
    default: return { x: 50, y: 650 };
  }
};

export default function App() {
  const [gameState, setGameState] = useState<GameStatus>(GameStatus.START);
  const [player, setPlayer] = useState<Player>(INITIAL_PLAYER);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  const playerRef = useRef<Player>(INITIAL_PLAYER);
  const gameStateRef = useRef<GameStatus>(GameStatus.START);
  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const requestRef = useRef<number>();
  const lastTimeRef = useRef<number>();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [viewOffset, setViewOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = true;
      if(e.code === "Space") e.preventDefault();
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const spawnParticles = (x: number, y: number, color: string, count: number) => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: Math.random(),
        x,
        y,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        life: 1.0,
        color
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
  };

  const checkCollision = (r1: Rect, r2: Rect) => {
    return (
      r1.x < r2.x + r2.w &&
      r1.x + r1.w > r2.x &&
      r1.y < r2.y + r2.h &&
      r1.y + r1.h > r2.y
    );
  };

  const startGame = () => {
    playerRef.current = { ...INITIAL_PLAYER };
    setPlayer(INITIAL_PLAYER);
    setParticles([]);
    setGameState(GameStatus.LEVEL_1);
    setViewOffset({ x: 0, y: 0 });
  };

  const advanceLevel = (nextLevel: GameStatus) => {
    const startPos = getLevelStartPos(nextLevel);
    playerRef.current = { 
      ...INITIAL_PLAYER, 
      x: startPos.x, 
      y: startPos.y 
    };
    setPlayer(playerRef.current);
    setParticles([]);
    setGameState(nextLevel);
    // Instant camera snap
    setViewOffset({ x: 0, y: Math.max(0, startPos.y - 400) }); 
  };

  const updatePhysics = useCallback((deltaTime: number) => {
    const currentStatus = gameStateRef.current;
    
    // Only run physics if in a playing level
    if (![GameStatus.LEVEL_1, GameStatus.LEVEL_2, GameStatus.LEVEL_3, GameStatus.LEVEL_4, GameStatus.LEVEL_5].includes(currentStatus)) return;

    const p = playerRef.current;
    
    let currentPlatforms: Platform[] = [];
    let currentExit: Rect | null = null;
    let nextLevel: GameStatus | null = null;
    let particleColor = '#ffffff';

    switch (currentStatus) {
      case GameStatus.LEVEL_1: 
        currentPlatforms = LEVEL_1_PLATFORMS; 
        currentExit = L1_EXIT;
        nextLevel = GameStatus.LEVEL_2;
        particleColor = '#fbbf24';
        break;
      case GameStatus.LEVEL_2: 
        currentPlatforms = LEVEL_2_PLATFORMS; 
        currentExit = L2_EXIT;
        nextLevel = GameStatus.LEVEL_3;
        particleColor = '#60a5fa';
        break;
      case GameStatus.LEVEL_3: 
        currentPlatforms = LEVEL_3_PLATFORMS; 
        currentExit = L3_EXIT;
        nextLevel = GameStatus.LEVEL_4;
        particleColor = '#f43f5e';
        break;
      case GameStatus.LEVEL_4: 
        currentPlatforms = LEVEL_4_PLATFORMS; 
        currentExit = L4_EXIT;
        nextLevel = GameStatus.LEVEL_5;
        particleColor = '#a8a29e';
        break;
      case GameStatus.LEVEL_5: 
        currentPlatforms = LEVEL_5_PLATFORMS; 
        currentExit = LOLLIPOP_TARGET;
        nextLevel = GameStatus.WON; // Special case
        particleColor = '#d8b4fe';
        break;
    }

    // Movement
    if (keysPressed.current['ArrowLeft'] || keysPressed.current['KeyA']) {
      p.vx = -MOVE_SPEED;
      p.facingRight = false;
    } else if (keysPressed.current['ArrowRight'] || keysPressed.current['KeyD']) {
      p.vx = MOVE_SPEED;
      p.facingRight = true;
    } else {
      p.vx = 0;
    }

    // Jump
    if ((keysPressed.current['Space'] || keysPressed.current['ArrowUp'] || keysPressed.current['KeyW']) && p.isGrounded) {
      p.vy = JUMP_FORCE;
      p.isGrounded = false;
      spawnParticles(p.x + p.w / 2, p.y + p.h, particleColor, 5);
    }

    p.vy += GRAVITY;
    p.x += p.vx;
    p.y += p.vy;

    // Bounds & Respawn
    if (p.x < 0) p.x = 0;
    if (p.x > WORLD_WIDTH - p.w) p.x = WORLD_WIDTH - p.w;
    
    if (p.y > WORLD_HEIGHT) {
      const startPos = getLevelStartPos(currentStatus);
      p.x = startPos.x;
      p.y = startPos.y;
      p.vy = 0;
    }

    // Collisions
    p.isGrounded = false;
    for (const platform of currentPlatforms) {
      if (checkCollision(p, platform)) {
        const overlapX = (p.w + platform.w) / 2 - Math.abs((p.x + p.w / 2) - (platform.x + platform.w / 2));
        const overlapY = (p.h + platform.h) / 2 - Math.abs((p.y + p.h / 2) - (platform.y + platform.h / 2));

        if (overlapX < overlapY) {
          if (p.vx > 0) p.x = platform.x - p.w;
          else p.x = platform.x + platform.w;
          p.vx = 0;
        } else {
          if (p.vy > 0) {
            p.y = platform.y - p.h;
            p.isGrounded = true;
            p.vy = 0;
          } else {
            p.y = platform.y + platform.h;
            p.vy = 0;
          }
        }
      }
    }

    // Level Transition / Win
    if (currentExit && checkCollision(p, currentExit)) {
      if (nextLevel === GameStatus.WON) {
        setGameState(GameStatus.WON);
        spawnParticles(p.x, p.y, '#f0f', 50);
      } else if (nextLevel) {
        spawnParticles(p.x, p.y, '#fff', 20);
        advanceLevel(nextLevel);
        return; 
      }
    }

    // Update State
    setParticles(prev => prev
      .map(pt => ({ ...pt, x: pt.x + pt.vx, y: pt.y + pt.vy, life: pt.life - 0.02 }))
      .filter(pt => pt.life > 0)
    );
    setPlayer({ ...p });

    // Camera Logic
    // We use the container dimensions to ensure camera works with any screen size/resize
    const container = containerRef.current;
    const viewportW = container ? container.clientWidth : window.innerWidth;
    const viewportH = container ? container.clientHeight : window.innerHeight;
    
    // Try to center player
    let targetCamX = p.x - viewportW / 2 + p.w / 2;
    let targetCamY = p.y - viewportH / 2 + p.h / 2;
    
    // Clamp to World
    targetCamX = Math.max(0, Math.min(targetCamX, WORLD_WIDTH - viewportW));
    targetCamY = Math.max(0, Math.min(targetCamY, WORLD_HEIGHT - viewportH));

    setViewOffset({
      x: Math.max(0, targetCamX),
      y: Math.max(0, Math.min(targetCamY, 200)) // Limit vertical scroll slightly
    });

  }, []);

  const loop = (time: number) => {
    if (lastTimeRef.current !== undefined) {
      const deltaTime = time - lastTimeRef.current;
      const cappedDelta = Math.min(deltaTime, 32); 
      updatePhysics(cappedDelta);
    }
    lastTimeRef.current = time;
    requestRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(loop);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [updatePhysics]);

  const getCurrentPlatforms = () => {
    switch(gameState) {
      case GameStatus.LEVEL_1: return LEVEL_1_PLATFORMS;
      case GameStatus.LEVEL_2: return LEVEL_2_PLATFORMS;
      case GameStatus.LEVEL_3: return LEVEL_3_PLATFORMS;
      case GameStatus.LEVEL_4: return LEVEL_4_PLATFORMS;
      case GameStatus.LEVEL_5: return LEVEL_5_PLATFORMS;
      default: return [];
    }
  };

  return (
    <div className="w-full h-full bg-black overflow-hidden select-none font-sans">
      
      {/* Fullscreen Game Container */}
      <div 
        ref={containerRef}
        className="relative w-full h-full bg-slate-900 overflow-hidden shadow-2xl ring-1 ring-white/10"
      >
        
        <GameRenderer 
          player={player} 
          platforms={getCurrentPlatforms()} 
          particles={particles}
          viewOffset={viewOffset}
          gameState={gameState}
        />

        {/* --- START SCREEN --- */}
        {gameState === GameStatus.START && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center text-white z-50 p-6 text-center animate-in fade-in duration-500">
            <div className="mb-2">
              <span className="inline-block px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold tracking-wider border border-amber-500/30 mb-4">
                PLATFORMER ADVENTURE
              </span>
            </div>
            
            <h1 className="text-6xl md:text-7xl font-black mb-2 tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 drop-shadow-2xl filter">
              거인 깨우기
            </h1>
            <p className="text-xl text-slate-400 mb-8 font-light tracking-widest uppercase">
              Sleepy Giant Wake Up <span className="text-slate-600 mx-2">|</span> 5 Stages
            </p>
            
            {/* Level Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 max-w-4xl w-full mb-8">
              {[
                { id: 1, title: "The Desk", icon: BookOpen, color: "text-amber-400", border: "border-amber-500/30", bg: "bg-amber-950/30" },
                { id: 2, title: "The Giant", icon: User, color: "text-blue-400", border: "border-blue-500/30", bg: "bg-blue-950/30" },
                { id: 3, title: "Ear Canal", icon: Ear, color: "text-rose-400", border: "border-rose-500/30", bg: "bg-rose-950/30" },
                { id: 4, title: "Middle Ear", icon: Hammer, color: "text-stone-300", border: "border-stone-500/30", bg: "bg-stone-900/30" },
                { id: 5, title: "The Brain", icon: Brain, color: "text-purple-400", border: "border-purple-500/30", bg: "bg-purple-950/30" }
              ].map((lvl) => (
                <div key={lvl.id} className={`flex flex-col items-center justify-center p-3 rounded-xl border ${lvl.border} ${lvl.bg} hover:-translate-y-1 transition-transform duration-300 group`}>
                  <lvl.icon className={`w-8 h-8 mb-2 ${lvl.color} group-hover:scale-110 transition-transform`} />
                  <div className="text-xs font-bold text-slate-300 uppercase tracking-tight">{lvl.title}</div>
                  <div className="text-[10px] text-slate-500">Stage {lvl.id}</div>
                </div>
              ))}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-6 mb-10 bg-white/5 px-6 py-3 rounded-full border border-white/10">
               <div className="flex items-center gap-2">
                 <Keyboard className="w-5 h-5 text-slate-400" />
                 <span className="text-slate-400 text-sm font-bold mr-2">CONTROLS</span>
               </div>
               <div className="flex gap-1">
                 <span className="w-8 h-8 flex items-center justify-center bg-slate-800 rounded border-b-2 border-slate-600 text-xs font-bold">A</span>
                 <span className="w-8 h-8 flex items-center justify-center bg-slate-800 rounded border-b-2 border-slate-600 text-xs font-bold">D</span>
                 <span className="text-xs text-slate-500 self-center mx-1">/</span>
                 <span className="w-8 h-8 flex items-center justify-center bg-slate-800 rounded border-b-2 border-slate-600 text-xs font-bold">←</span>
                 <span className="w-8 h-8 flex items-center justify-center bg-slate-800 rounded border-b-2 border-slate-600 text-xs font-bold">→</span>
               </div>
               <div className="h-4 w-[1px] bg-slate-700 mx-2"></div>
               <div className="flex gap-1 items-center">
                 <span className="px-3 h-8 flex items-center justify-center bg-slate-800 rounded border-b-2 border-slate-600 text-xs font-bold">SPACE</span>
                 <span className="text-xs text-slate-400 ml-2">Jump</span>
               </div>
            </div>

            <button 
              onClick={startGame}
              className="group relative px-10 py-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-black text-xl rounded-full flex items-center gap-3 hover:scale-105 transition-all shadow-[0_0_20px_rgba(245,158,11,0.5)] overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              <Play className="fill-white w-6 h-6" />
              START ADVENTURE
            </button>
            
            <div className="mt-8 text-xs text-slate-600">
               v1.0.6 • Fullscreen Supported
            </div>
          </div>
        )}

        {/* --- WIN SCREEN --- */}
        {gameState === GameStatus.WON && (
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex flex-col items-center justify-center text-white z-50 animate-in zoom-in duration-300">
             
             {/* Glowing Background Effect */}
             <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-[100px] animate-pulse"></div>
             </div>

             <div className="relative z-10 flex flex-col items-center">
                <div className="mb-6 relative">
                   <div className="absolute inset-0 bg-yellow-400/30 blur-xl rounded-full animate-ping"></div>
                   <Trophy className="w-40 h-40 text-yellow-300 drop-shadow-[0_0_15px_rgba(253,224,71,0.8)] relative z-10" />
                </div>
                
                <h1 className="text-7xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 to-yellow-600 drop-shadow-sm">
                  VICTORY!
                </h1>
                
                <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl max-w-md text-center mb-10 shadow-xl">
                  <p className="text-xl text-purple-100 font-medium mb-2">
                    Mission Accomplished
                  </p>
                  <p className="text-sm text-purple-200/70">
                    You navigated the dreamscape and delivered the legendary Chupa Chups to wake the giant!
                  </p>
                </div>

                <button 
                  onClick={startGame}
                  className="px-8 py-3 bg-white text-purple-900 hover:bg-gray-100 font-bold text-lg rounded-full shadow-lg flex items-center gap-2 hover:-translate-y-1 transition-all"
                >
                  <RotateCcw className="w-5 h-5" />
                  Play Again
                </button>
             </div>
          </div>
        )}

        {/* --- HUD --- */}
        <div className="absolute top-4 right-4 flex gap-2 z-40">
           <div className="flex p-1 bg-slate-900/60 backdrop-blur-md rounded-full border border-white/10 shadow-lg">
             <button 
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 hover:bg-white/10 rounded-full text-slate-300 transition-colors"
              title={soundEnabled ? "Mute Sound" : "Enable Sound"}
             >
               {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
             </button>
             <div className="w-[1px] bg-white/10 my-1 mx-1"></div>
             <button 
              onClick={() => setGameState(GameStatus.START)}
              className="p-2 hover:bg-white/10 rounded-full text-slate-300 transition-colors"
              title="Restart Game"
             >
               <RotateCcw size={20} />
             </button>
           </div>
        </div>

      </div>
    </div>
  );
}
