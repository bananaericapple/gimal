import React, { useState, useEffect, useRef, useCallback } from 'react';
import Bird from './components/Bird';
import Pipe from './components/Pipe';
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  GRAVITY,
  JUMP_STRENGTH,
  PIPE_SPEED,
  PIPE_SPAWN_RATE,
  PIPE_WIDTH,
  PIPE_GAP,
  BIRD_SIZE,
  BIRD_X_POSITION,
  GROUND_HEIGHT,
  GameState,
  PipeData
} from './constants';

const App: React.FC = () => {
  const stageRef = useRef<HTMLDivElement>(null);
  const [stageScale, setStageScale] = useState(1);

  // --- State for Rendering ---
  const [gameState, setGameState] = useState<GameState>(GameState.START);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  
  // Custom Skin State
  const [customSkin, setCustomSkin] = useState<string | null>(null);
  const [skinScale, setSkinScale] = useState<number>(1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // We sync these from refs to state for the React Render cycle
  const [birdY, setBirdY] = useState(GAME_HEIGHT / 2);
  const [birdRotation, setBirdRotation] = useState(0);
  const [pipes, setPipes] = useState<PipeData[]>([]);

  // --- Refs for Physics Loop (High Performance) ---
  const requestRef = useRef<number>();
  const frameCountRef = useRef(0);
  const scoreRef = useRef(0);
  
  // Physics State held in Refs to avoid React batching lag
  const physicsState = useRef({
    birdY: GAME_HEIGHT / 2,
    velocity: 0,
    pipes: [] as PipeData[],
  });

  useEffect(() => {
    const updateStageScale = () => {
      if (!stageRef.current) return;
      const { width, height } = stageRef.current.getBoundingClientRect();
      setStageScale(Math.min(width / GAME_WIDTH, height / GAME_HEIGHT));
    };

    updateStageScale();
    window.addEventListener('resize', updateStageScale);
    return () => window.removeEventListener('resize', updateStageScale);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('flappyHighScore');
    if (saved) setHighScore(parseInt(saved, 10));
    
    const savedSkin = localStorage.getItem('flappyCustomSkin');
    if (savedSkin) setCustomSkin(savedSkin);

    const savedScale = localStorage.getItem('flappySkinScale');
    if (savedScale) setSkinScale(parseFloat(savedScale));
  }, []);

  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('flappyHighScore', score.toString());
    }
  }, [score, highScore]);

  // --- Skin Handling ---
  const handleSkinUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setCustomSkin(result);
        localStorage.setItem('flappyCustomSkin', result);
        // Reset scale on new upload if needed, or keep previous
        setSkinScale(1);
        localStorage.setItem('flappySkinScale', '1');
      };
      reader.readAsDataURL(file);
    }
  };

  const removeSkin = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent jump/start
    setCustomSkin(null);
    setSkinScale(1);
    localStorage.removeItem('flappyCustomSkin');
    localStorage.removeItem('flappySkinScale');
  };

  const triggerFileUpload = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent jump/start
    fileInputRef.current?.click();
  };

  const handleScaleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const scale = parseFloat(e.target.value);
    setSkinScale(scale);
    localStorage.setItem('flappySkinScale', scale.toString());
  };

  // --- Core Game Logic ---

  const resetGame = useCallback(() => {
    setGameState(GameState.START);
    setScore(0);
    setBirdY(GAME_HEIGHT / 2);
    setBirdRotation(0);
    setPipes([]);
    
    // Reset Physics Ref
    scoreRef.current = 0;
    frameCountRef.current = 0;
    physicsState.current = {
      birdY: GAME_HEIGHT / 2,
      velocity: 0,
      pipes: []
    };
  }, []);

  const jump = useCallback(() => {
    if (gameState === GameState.PLAYING) {
      physicsState.current.velocity = JUMP_STRENGTH;
    } else if (gameState === GameState.START) {
      setGameState(GameState.PLAYING);
      physicsState.current.velocity = JUMP_STRENGTH;
    }
  }, [gameState]);

  const checkCollision = (birdY: number, pipes: PipeData[]) => {
    // 1. Floor/Ceiling Collision
    if (birdY + BIRD_SIZE >= GAME_HEIGHT - GROUND_HEIGHT) return true; // Floor
    if (birdY <= 0) return true; // Ceiling (optional, but good for gameplay)

    // 2. Pipe Collision
    // The bird's hitbox
    const birdLeft = BIRD_X_POSITION + 4; // Padding
    const birdRight = BIRD_X_POSITION + BIRD_SIZE - 4;
    const birdTop = birdY + 4;
    const birdBottom = birdY + BIRD_SIZE - 4;

    for (const pipe of pipes) {
      const pipeLeft = pipe.x;
      const pipeRight = pipe.x + PIPE_WIDTH;

      // Check if bird is within the horizontal area of the pipe
      if (birdRight > pipeLeft && birdLeft < pipeRight) {
        // Check vertical collision (hitting top pipe OR hitting bottom pipe)
        const hitTopPipe = birdTop < pipe.topHeight;
        const hitBottomPipe = birdBottom > pipe.topHeight + PIPE_GAP;

        if (hitTopPipe || hitBottomPipe) {
          return true;
        }
      }
    }
    return false;
  };

  const gameLoop = useCallback(() => {
    if (gameState !== GameState.PLAYING) return;

    // 1. Update Physics
    physicsState.current.velocity += GRAVITY;
    physicsState.current.birdY += physicsState.current.velocity;

    // 2. Handle Rotation
    // Map velocity to rotation: -10 (jump) -> -25deg, +10 (fall) -> +90deg
    let rotation = Math.min(Math.PI / 4, Math.max(-Math.PI / 4, (physicsState.current.velocity * 0.1)));
    // Convert to degrees for CSS
    const rotationDeg = (rotation * 180) / Math.PI * 2.5; 
    
    // 3. Update Pipes
    frameCountRef.current++;
    
    // Move pipes
    physicsState.current.pipes.forEach(pipe => {
      pipe.x -= PIPE_SPEED;
    });

    // Spawn new pipe
    if (frameCountRef.current % PIPE_SPAWN_RATE === 0) {
      const minPipeHeight = 50;
      const maxPipeHeight = GAME_HEIGHT - GROUND_HEIGHT - PIPE_GAP - minPipeHeight;
      const randomHeight = Math.floor(Math.random() * (maxPipeHeight - minPipeHeight + 1)) + minPipeHeight;
      
      physicsState.current.pipes.push({
        x: GAME_WIDTH,
        topHeight: randomHeight,
        passed: false
      });
    }

    // Remove off-screen pipes
    physicsState.current.pipes = physicsState.current.pipes.filter(pipe => pipe.x + PIPE_WIDTH > -10);

    // 4. Update Score
    physicsState.current.pipes.forEach(pipe => {
      if (!pipe.passed && pipe.x + PIPE_WIDTH < BIRD_X_POSITION) {
        pipe.passed = true;
        scoreRef.current += 1;
        setScore(scoreRef.current);
      }
    });

    // 5. Check Collisions
    if (checkCollision(physicsState.current.birdY, physicsState.current.pipes)) {
      setGameState(GameState.GAME_OVER);
      return; // Stop loop
    }

    // 6. Sync to State for Render
    setBirdY(physicsState.current.birdY);
    setBirdRotation(rotationDeg);
    setPipes([...physicsState.current.pipes]); // Create copy to trigger re-render

    requestRef.current = requestAnimationFrame(gameLoop);
  }, [gameState]);

  // --- Effects ---

  // Handle Key Press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault(); // Prevent scrolling
        if (gameState === GameState.GAME_OVER) {
          resetGame();
        } else {
          jump();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, jump, resetGame]);

  // Start/Stop Loop
  useEffect(() => {
    if (gameState === GameState.PLAYING) {
      requestRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameState, gameLoop]);

  // --- Render Helpers ---

  return (
    <div ref={stageRef} className="relative w-full h-full bg-neutral-900 flex items-center justify-center font-sans select-none overflow-hidden">
      {/* Game Container */}
      <div 
        className="relative overflow-hidden bg-sky-300 shadow-2xl ring-8 ring-neutral-800"
        style={{
          width: GAME_WIDTH,
          height: GAME_HEIGHT,
          transform: `scale(${stageScale})`,
          transformOrigin: 'center',
        }}
        // Mouse/Touch handlers removed to enforce Spacebar only
      >
        {/* Background Clouds (Decorative) */}
        <div className="absolute bottom-[120px] left-10 text-white opacity-40">
           <CloudIcon size={60} />
        </div>
        <div className="absolute top-20 right-20 text-white opacity-30">
           <CloudIcon size={40} />
        </div>
        <div className="absolute top-40 left-40 text-white opacity-20">
           <CloudIcon size={50} />
        </div>

        {/* Game World Elements */}
        {pipes.map((pipe, i) => (
          <Pipe key={`pipe-${i}`} x={pipe.x} topHeight={pipe.topHeight} />
        ))}
        
        <Bird y={birdY} rotation={birdRotation} image={customSkin} skinScale={skinScale} />

        {/* Moving Ground */}
        <div 
          className="absolute bottom-0 w-full z-30"
          style={{ height: GROUND_HEIGHT }}
        >
            {/* Grass Top */}
            <div className="h-4 w-full bg-green-600 border-t-4 border-b-4 border-black"></div>
            {/* Dirt Body with Moving Stripes */}
            <div className="h-full w-full bg-[#ded895] border-b-4 border-black relative overflow-hidden">
                 <div 
                    className={`absolute inset-0 flex ${gameState === GameState.PLAYING ? 'animate-scrolling-ground' : ''}`}
                    style={{ width: '200%' }}
                 >
                    {/* Pattern for ground */}
                    {Array.from({ length: 40 }).map((_, i) => (
                        <div key={i} className="w-8 h-full border-r-2 border-[#cbb968] transform -skew-x-12"></div>
                    ))}
                 </div>
            </div>
        </div>

        {/* UI: Score (Playing) */}
        {gameState === GameState.PLAYING && (
          <div className="absolute top-10 w-full text-center z-40 pointer-events-none">
            <span className="text-6xl font-bold text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] stroke-black" style={{ WebkitTextStroke: '2px black' }}>
              {score}
            </span>
          </div>
        )}

        {/* UI: Start Screen */}
        {gameState === GameState.START && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-black/20 backdrop-blur-sm">
             <div className="bg-white p-6 rounded-xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center w-64">
                <h1 className="text-4xl font-black text-green-500 mb-2 tracking-tighter" style={{ WebkitTextStroke: '1px black' }}>FLAPPY<br/>BIRD</h1>
                <p className="text-gray-600 mb-6 font-bold">Press SPACE</p>
                
                <div className="animate-bounce mb-6">
                   {customSkin ? (
                       <div className="w-12 h-12 mx-auto rounded-md border-4 border-black overflow-hidden bg-white shadow-sm">
                           <img 
                              src={customSkin} 
                              alt="Skin" 
                              className="w-full h-full object-cover origin-center" 
                              style={{ transform: `scale(${skinScale})` }}
                           />
                       </div>
                   ) : (
                       <div className="mx-auto"><BirdIcon /></div>
                   )}
                </div>

                {/* Skin Selector */}
                <div className="flex flex-col gap-2">
                    <button 
                        onClick={triggerFileUpload}
                        className="text-xs bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-3 rounded border-b-4 border-blue-700 active:border-b-0 active:translate-y-1 transition-all uppercase"
                    >
                        {customSkin ? 'Change Photo' : 'Upload Photo'}
                    </button>
                    {customSkin && (
                        <>
                            <div className="w-full px-2 pt-2 border-t-2 border-dashed border-gray-300 mt-2">
                                <label className="text-[10px] font-bold text-gray-500 block mb-1 uppercase tracking-wider">Image Zoom: {skinScale.toFixed(1)}x</label>
                                <input 
                                    type="range"
                                    min="0.5"
                                    max="3.0"
                                    step="0.1"
                                    value={skinScale}
                                    onChange={handleScaleChange}
                                    onKeyDown={(e) => e.stopPropagation()}
                                    onClick={(e) => e.stopPropagation()}
                                    className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                />
                            </div>
                            <button 
                                onClick={removeSkin}
                                className="text-xs bg-red-500 hover:bg-red-400 text-white font-bold py-2 px-3 rounded border-b-4 border-red-700 active:border-b-0 active:translate-y-1 transition-all uppercase mt-2"
                            >
                                Reset to Default
                            </button>
                        </>
                    )}
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleSkinUpload} 
                        accept="image/*" 
                        className="hidden" 
                    />
                </div>
             </div>
          </div>
        )}

        {/* UI: Game Over Screen */}
        {gameState === GameState.GAME_OVER && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-black/50">
             <div className="bg-[#ded895] p-6 w-64 rounded-xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center relative">
                <h2 className="text-4xl font-black text-orange-500 mb-6 tracking-widest drop-shadow-md" style={{ WebkitTextStroke: '1.5px black' }}>GAME OVER</h2>
                
                <div className="flex flex-col gap-2 mb-6 bg-[#cbb968] p-4 rounded border-2 border-black/20">
                    <div className="flex justify-between text-orange-900 font-bold text-xl">
                        <span>SCORE</span>
                        <span>{score}</span>
                    </div>
                    <div className="w-full h-0.5 bg-orange-900/20"></div>
                    <div className="flex justify-between text-orange-900 font-bold text-xl">
                        <span>BEST</span>
                        <span>{highScore}</span>
                    </div>
                    {score >= 10 && score > highScore - 5 && (
                        <div className="absolute -top-4 -right-4 bg-red-500 text-white text-xs font-bold px-2 py-1 rotate-12 border-2 border-white shadow-lg rounded">
                            NEW RECORD!
                        </div>
                    )}
                </div>

                <button 
                  onClick={(e) => { e.stopPropagation(); resetGame(); }}
                  className="w-full bg-green-500 hover:bg-green-400 text-white font-bold py-3 px-4 rounded border-b-4 border-green-700 active:border-b-0 active:translate-y-1 transition-all uppercase"
                >
                  Play Again
                </button>
             </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-24px); } /* Approx pattern width */
        }
        .animate-scrolling-ground {
          animation: scroll 0.5s linear infinite;
        }
      `}</style>
    </div>
  );
};

// SVG Components for visuals
const CloudIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size / 1.5} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.5,19c-3.037,0-5.5-2.463-5.5-5.5c0-0.106,0.005-0.211,0.014-0.315C10.963,11.39,9.549,10,8,10 c-2.209,0-4,1.791-4,4c0,2.209,1.791,4,4,4h9.5c1.381,0,2.5-1.119,2.5-2.5S18.881,13,17.5,13 c-0.21,0-0.413,0.026-0.607,0.075C17.164,13.682,17.5,14.305,17.5,15c0,1.657-1.343,3-3,3h-4.5"/>
    <path d="M17.5,6c-1.722,0-3.248,0.749-4.306,1.936C12.791,7.91,12.404,7.882,12,7.882C9.239,7.882,7,10.122,7,12.882 c0,0.17,0.011,0.338,0.029,0.504C6.012,13.844,5.263,14.771,5.263,15.882C5.263,17.598,6.657,18.992,8.373,18.992h9.127 c2.485,0,4.5-2.015,4.5-4.5S19.985,6,17.5,6z"/>
  </svg>
);

const BirdIcon = () => (
    <div className="w-12 h-12 relative">
        <div className="w-full h-full bg-yellow-400 rounded-lg border-4 border-black"></div>
        <div className="absolute top-2 right-2 w-4 h-4 bg-white border-2 border-black rounded-full"><div className="absolute right-0 top-1 w-1.5 h-1.5 bg-black rounded-full"></div></div>
        <div className="absolute top-5 -right-3 w-5 h-4 bg-red-500 border-2 border-black rounded-r-md"></div>
        <div className="absolute top-6 left-1 w-6 h-4 bg-white border-2 border-black rounded-full opacity-80"></div>
    </div>
)

export default App;
