
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  GameState, 
  Direction, 
  CharacterState, 
  StairData, 
  Player,
  SkinId,
  KeyConfig
} from './types';
import { GAME_CONFIG, SKINS, DEFAULT_KEYS } from './constants';
import { Character } from './components/Character';
import { playSound } from './utils/audio';
import { 
  Play, 
  RotateCcw, 
  Pause, 
  Coins,
  ArrowUp,
  RotateCw,
  Keyboard,
  ShoppingBag,
  Settings,
  X,
  Check,
  Lock,
  Home
} from 'lucide-react';


const App: React.FC = () => {
  // --- State ---
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [stamina, setStamina] = useState(GAME_CONFIG.STAMINA_MAX);
  
  // Persistent Data (Skins & Keys)
  const [ownedSkins, setOwnedSkins] = useState<SkinId[]>(['business']);
  const [equippedSkin, setEquippedSkin] = useState<SkinId>('business');
  const [keyConfig, setKeyConfig] = useState<KeyConfig>(DEFAULT_KEYS);

  // UI Modals
  const [shopOpen, setShopOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [listeningForKey, setListeningForKey] = useState<'turn' | 'climb' | null>(null);

  // Render specific state
  const [stairs, setStairs] = useState<StairData[]>([]);
  const [player, setPlayer] = useState<Player>({
    currentStepIndex: 0,
    facing: Direction.RIGHT,
    state: CharacterState.IDLE,
    skin: 'business',
  });
  
  // Animations & Feedback
  const [shakeScreen, setShakeScreen] = useState(false);
  const [ghosts, setGhosts] = useState<{id: number, x: number, y: number, facing: Direction, opacity: number}[]>([]);
  const nextGhostId = useRef(0);
  
  // Refs for loop
  const requestRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  
  // --- Initialization ---
  
  useEffect(() => {
    // Load persisted data
    const savedBest = localStorage.getItem('infinite_stairs_best');
    if (savedBest) setHighScore(parseInt(savedBest, 10));
    
    const savedCoins = localStorage.getItem('infinite_stairs_coins');
    if (savedCoins) setCoins(parseInt(savedCoins, 10));

    const savedSkins = localStorage.getItem('infinite_stairs_skins');
    if (savedSkins) setOwnedSkins(JSON.parse(savedSkins));

    const savedEquipped = localStorage.getItem('infinite_stairs_equipped');
    if (savedEquipped && SKINS[savedEquipped as SkinId]) setEquippedSkin(savedEquipped as SkinId);

    const savedKeys = localStorage.getItem('infinite_stairs_keys');
    if (savedKeys) setKeyConfig(JSON.parse(savedKeys));
  }, []);


  // Save on change
  useEffect(() => localStorage.setItem('infinite_stairs_coins', coins.toString()), [coins]);
  useEffect(() => localStorage.setItem('infinite_stairs_skins', JSON.stringify(ownedSkins)), [ownedSkins]);
  useEffect(() => localStorage.setItem('infinite_stairs_equipped', equippedSkin), [equippedSkin]);
  useEffect(() => localStorage.setItem('infinite_stairs_keys', JSON.stringify(keyConfig)), [keyConfig]);

  // --- Game Logic ---

  // Generate stairs STARTING FROM the given coordinates (exclusive of startX/startY)
  const generateStairs = useCallback((startIndex: number, count: number, startX: number, startY: number, startDir: Direction): StairData[] => {
    const newStairs: StairData[] = [];
    let currentX = startX;
    let currentY = startY;
    let currentDir = startDir;
    
    // Logic for random turns
    // We want 3-6 steps in same direction usually
    let stepsUntilTurn = Math.floor(Math.random() * 4) + 3;

    for (let i = 0; i < count; i++) {
      // Determine if we should turn BEFORE moving
      const isTurn = i > 0 && stepsUntilTurn <= 0;
      
      if (isTurn) {
        currentDir = currentDir === Direction.RIGHT ? Direction.LEFT : Direction.RIGHT;
        stepsUntilTurn = Math.floor(Math.random() * 4) + 3;
      } else {
        stepsUntilTurn--;
      }
      
      // Move to NEXT position
      // Y always goes up by 1
      // X changes based on direction
      currentY += 1;
      currentX += (currentDir === Direction.RIGHT ? 1 : -1);

      newStairs.push({
        id: startIndex + i, // id starts from 0 for initial batch
        x: currentX,
        y: currentY,
        direction: currentDir, // The direction taken to reach this step
        hasCoin: Math.random() < GAME_CONFIG.COIN_CHANCE && i > 3,
      });
    }
    return newStairs;
  }, []);

  const startGame = () => {
    playSound('click');
    setScore(0);
    setStamina(GAME_CONFIG.STAMINA_MAX);
    setPlayer({
      currentStepIndex: 0,
      facing: Direction.RIGHT, // Initial facing
      state: CharacterState.IDLE,
      skin: equippedSkin,
    });
    setGhosts([]);
    
    // Generate initial stairs
    const startStair = { id: 0, x: 0, y: 0, direction: Direction.RIGHT, hasCoin: false };
    const nextStairs = generateStairs(1, 49, 0, 0, Direction.RIGHT);
    
    setStairs([startStair, ...nextStairs]);
    
    setGameState(GameState.PLAYING);
    lastTimeRef.current = performance.now();
  };

  const handleGameOver = () => {
    if (gameState === GameState.GAMEOVER) return;
    playSound('gameover');
    setGameState(GameState.GAMEOVER);
    setPlayer(p => ({ ...p, state: CharacterState.FALL }));
    setShakeScreen(true);
    setTimeout(() => setShakeScreen(false), 500);
    
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('infinite_stairs_best', score.toString());
    }
  };

  const addGhost = () => {
    const currentStair = stairs[player.currentStepIndex];
    if (!currentStair) return;
    
    const id = nextGhostId.current++;
    setGhosts(prev => [...prev, {
      id,
      x: currentStair.x,
      y: currentStair.y,
      facing: player.facing,
      opacity: 0.6
    }]);
    
    // Cleanup ghost after animation
    setTimeout(() => {
      setGhosts(prev => prev.filter(g => g.id !== id));
    }, 200);
  };

  const climb = useCallback(() => {
    if (gameState !== GameState.PLAYING) return;
    
    const nextIndex = player.currentStepIndex + 1;
    const nextStair = stairs[nextIndex]; // Target stair
    
    if (!nextStair) return; // Should not happen with infinite gen

    const currentStair = stairs[player.currentStepIndex];
    
    // Determine required direction to move from current to next
    let requiredDirection = Direction.RIGHT;
    if (nextStair.x < currentStair.x) requiredDirection = Direction.LEFT;
    
    if (player.facing === requiredDirection) {
      // SUCCESS
      playSound('jump');
      setPlayer(prev => ({
        ...prev,
        currentStepIndex: nextIndex,
        state: CharacterState.RUN
      }));
      setScore(s => s + 1);
      setStamina(s => Math.min(GAME_CONFIG.STAMINA_MAX, s + GAME_CONFIG.STAMINA_RECOVERY));
      
      addGhost();
      
      if (nextStair.hasCoin) {
        playSound('coin');
        setCoins(c => c + (Math.floor(Math.random() * 5) + 1));
        // Remove coin visually
        setStairs(prev => prev.map(s => s.id === nextIndex ? {...s, hasCoin: false} : s));
      }

      // Generate more stairs if needed
      // Buffer of 20 stairs
      if (stairs.length - nextIndex < 30) {
        const lastStair = stairs[stairs.length - 1];
        const newStairs = generateStairs(
          stairs.length, 
          20, 
          lastStair.x, 
          lastStair.y, 
          lastStair.direction
        );
        setStairs(prev => [...prev, ...newStairs]);
      }
    } else {
      // WRONG DIRECTION - FALL
      handleGameOver();
    }
  }, [gameState, player, stairs, generateStairs]);

  const turn = useCallback(() => {
    if (gameState !== GameState.PLAYING) return;
    playSound('click');
    setPlayer(prev => ({
      ...prev,
      facing: prev.facing === Direction.RIGHT ? Direction.LEFT : Direction.RIGHT
    }));
  }, [gameState]);

  // --- Controls (Keyboard) ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Key Binding Listening Mode
      if (listeningForKey) {
        e.preventDefault();
        setKeyConfig(prev => ({ ...prev, [listeningForKey]: e.code }));
        setListeningForKey(null);
        playSound('coin'); // Confirmation sound
        return;
      }

      if (gameState !== GameState.PLAYING) return;

      if (e.code === keyConfig.climb) {
        climb();
      } else if (e.code === keyConfig.turn) {
        turn();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, climb, turn, listeningForKey, keyConfig]);

  // --- Game Loop (Stamina) ---
  const loop = (time: number) => {
    requestRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [gameState]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (gameState === GameState.PLAYING) {
      interval = setInterval(() => {
        setStamina(prev => {
          if (prev <= 0) {
            handleGameOver();
            return 0;
          }
          // Decay rate increases with score to make it harder
          const difficultyMultiplier = 1 + (score / 150);
          return prev - (GAME_CONFIG.STAMINA_DECAY_RATE * difficultyMultiplier * 5); // 5 for interval speed
        });
      }, 50); // Tick every 50ms
    }
    return () => clearInterval(interval);
  }, [gameState, score]);


  // --- Render Helpers ---

  // Calculate Camera Offset
  const currentPlayerStair = stairs[player.currentStepIndex];
  
  const getCameraStyle = () => {
    if (!currentPlayerStair) return {};

    const px = currentPlayerStair.x * GAME_CONFIG.STEP_WIDTH;
    const py = currentPlayerStair.y * GAME_CONFIG.STEP_HEIGHT;
    
    // Position player fixed at "offsetY" from the bottom of the viewport
    const offsetY = 300; 
    
    return {
      transform: `translate(calc(50% - ${px}px), ${py - offsetY}px)`,
      transition: 'transform 0.1s linear'
    };
  };

  // --- Subcomponents for Modals ---
  
  const renderShop = () => (
    <div className="absolute inset-0 z-50 bg-black/90 flex flex-col p-6 animate-fade-in pointer-events-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl text-yellow-400 font-bold font-[Press Start 2P]">SKIN SHOP</h2>
        <button onClick={() => { playSound('click'); setShopOpen(false); }} className="bg-red-500 p-2 rounded hover:bg-red-600"><X size={24} color="white"/></button>
      </div>
      
      <div className="flex items-center gap-2 mb-6 bg-gray-800 p-3 rounded-lg w-fit">
        <Coins size={20} className="text-yellow-400 fill-yellow-400" />
        <span className="text-white font-bold">{coins}</span>
      </div>

      <div className="grid grid-cols-2 gap-4 overflow-y-auto pb-8">
        {Object.entries(SKINS).map(([id, skin]) => {
          const isOwned = ownedSkins.includes(id as SkinId);
          const isEquipped = equippedSkin === id;
          const canAfford = coins >= skin.cost;

          return (
            <div key={id} className={`bg-gray-800 rounded-xl p-4 flex flex-col items-center border-2 ${isEquipped ? 'border-green-500' : 'border-gray-600'}`}>
              <div className="mb-2 text-white font-bold text-xs">{skin.name}</div>
              <div className="w-24 h-24 bg-blue-900/30 rounded-lg mb-2 flex items-center justify-center relative">
                 <div className="scale-125">
                   <Character state={CharacterState.IDLE} facing={Direction.RIGHT} skinId={id as SkinId} showAura={false} />
                 </div>
                 {!isOwned && <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg"><Lock className="text-gray-400"/></div>}
              </div>
              
              <div className="mt-auto w-full">
                {isOwned ? (
                  <button 
                    onClick={() => { playSound('click'); setEquippedSkin(id as SkinId); }}
                    disabled={isEquipped}
                    className={`w-full py-2 rounded font-bold text-xs ${isEquipped ? 'bg-green-600 text-white cursor-default' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
                  >
                    {isEquipped ? 'EQUIPPED' : 'EQUIP'}
                  </button>
                ) : (
                  <button 
                    onClick={() => {
                       if (canAfford) {
                         playSound('coin');
                         setCoins(c => c - skin.cost);
                         setOwnedSkins(prev => [...prev, id as SkinId]);
                       } else {
                         playSound('error');
                       }
                    }}
                    className={`w-full py-2 rounded font-bold text-xs flex items-center justify-center gap-1 ${canAfford ? 'bg-yellow-500 hover:bg-yellow-400 text-black' : 'bg-gray-600 text-gray-400 cursor-not-allowed'}`}
                  >
                    <Coins size={12}/> {skin.cost}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="absolute inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-6 animate-fade-in pointer-events-auto">
      <div className="bg-gray-800 p-8 rounded-2xl border-2 border-gray-600 w-full max-w-sm shadow-2xl relative">
        <button onClick={() => { playSound('click'); setSettingsOpen(false); setListeningForKey(null); }} className="absolute top-4 right-4 bg-red-500 p-1 rounded hover:bg-red-600"><X size={20} color="white"/></button>
        
        <h2 className="text-2xl text-blue-400 font-bold mb-8 text-center flex items-center justify-center gap-2">
           <Keyboard/> KEY BINDINGS
        </h2>

        {listeningForKey && (
          <div className="absolute inset-0 bg-black/90 z-50 flex items-center justify-center rounded-2xl">
             <div className="text-center animate-pulse">
                <p className="text-yellow-400 text-sm mb-2">PRESS ANY KEY FOR</p>
                <h3 className="text-3xl font-bold text-white uppercase">{listeningForKey}</h3>
             </div>
          </div>
        )}

        <div className="space-y-6">
           {/* Turn Config */}
           <div className="flex justify-between items-center bg-gray-900 p-4 rounded-lg">
              <span className="text-white font-bold">TURN</span>
              <button 
                onClick={() => { playSound('click'); setListeningForKey('turn'); }}
                className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-yellow-400 font-mono text-sm border-b-2 border-gray-950 active:border-b-0 active:translate-y-[2px]"
              >
                {keyConfig.turn}
              </button>
           </div>

           {/* Climb Config */}
           <div className="flex justify-between items-center bg-gray-900 p-4 rounded-lg">
              <span className="text-white font-bold">CLIMB</span>
              <button 
                onClick={() => { playSound('click'); setListeningForKey('climb'); }}
                className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-blue-400 font-mono text-sm border-b-2 border-gray-950 active:border-b-0 active:translate-y-[2px]"
              >
                {keyConfig.climb}
              </button>
           </div>
        </div>

        <div className="mt-8 text-center text-xs text-gray-500">
           Click a button to remap the key.
        </div>
      </div>
    </div>
  );

  return (
    <div className={`w-full h-full relative bg-[#87CEEB] overflow-hidden ${shakeScreen ? 'animate-shake' : ''} touch-none select-none`}>
      
      {/* Background Clouds/City */}
      <div className="absolute inset-0 opacity-30 pointer-events-none" 
           style={{
             backgroundImage: 'linear-gradient(to bottom, #87CEEB 0%, #e0f7fa 100%)'
           }}>
           <div className="absolute top-10 left-10 text-white opacity-80 text-6xl animate-pulse">☁️</div>
           <div className="absolute top-20 right-20 text-white opacity-60 text-5xl">☁️</div>
           
           {/* Buildings Background */}
           <div className="absolute bottom-0 w-full h-full bg-repeat-x opacity-20" 
                style={{
                  backgroundImage: 'url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiBmaWxsPSIjMDAwIj48cmVjdCB4PSI1IiB5PSI1MCIgd2lkdGg9IjE1IiBoZWlnaHQ9IjUwIi8+PHJlY3QgeD0iMjUiIHk9IjMwIiB3aWR0aD0iMjAiIGhlaWdodD0iNzAiLz48cmVjdCB4PSI1MCIgeT0iMjAiIHdpZHRoPSIyNSIgaGVpZ2h0PSI4MCIvPjxyZWN0IHg9IjgwIiB5PSI0MCIgd2lkdGg9IjE1IiBoZWlnaHQ9IjYwIi8+PC9zdmc+")',
                  backgroundSize: '400px 400px',
                  backgroundPosition: 'bottom'
                }} 
            />
      </div>

      {/* --- HUD --- */}
      <div className="absolute top-0 left-0 w-full p-4 z-50 flex justify-between items-start pointer-events-none">
        
        {/* Coins & Score */}
        <div className="flex flex-col gap-2 pointer-events-auto">
          <div className="flex items-center gap-2 bg-black/40 p-2 rounded-lg text-yellow-400 border border-yellow-600/30 w-fit">
            <Coins size={20} className="fill-yellow-400" />
            <span className="text-sm font-bold">{coins}</span>
          </div>
          {gameState === GameState.PLAYING && (
             <div className="text-5xl font-bold text-white drop-shadow-[0_4px_0_rgba(0,0,0,0.5)] font-[Press Start 2P] stroke-black">
               {score}
             </div>
          )}
        </div>

        {/* Stamina Bar (Center Top) */}
        {gameState === GameState.PLAYING && (
          <div className="absolute left-1/2 -translate-x-1/2 top-6 w-32 md:w-64 h-6 bg-gray-800 border-2 border-white rounded-full overflow-hidden shadow-lg">
            <div 
              className={`h-full transition-all duration-75 ${stamina < 30 ? 'bg-red-500' : 'bg-green-500'}`}
              style={{ width: `${stamina}%` }}
            />
          </div>
        )}

        {/* Pause Button */}
        <button 
          className="pointer-events-auto bg-black/20 p-2 rounded-lg backdrop-blur-sm active:scale-95 transition-transform hover:bg-black/40"
          onClick={() => {
            playSound('click');
            if (gameState === GameState.PLAYING) setGameState(GameState.PAUSED);
            else if (gameState === GameState.PAUSED) setGameState(GameState.PLAYING);
          }}
        >
          {gameState === GameState.PAUSED ? <Play fill="white" /> : <Pause fill="white" />}
        </button>
      </div>

      {/* --- Game World Renderer --- */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="absolute bottom-0 left-0 w-full h-full will-change-transform"
          style={getCameraStyle()}
        >
          
          {/* Render Stairs */}
          {stairs.map((stair) => {
            // Optimization: Only render visible stairs
            const dx = Math.abs(stair.id - player.currentStepIndex);
            if (dx > 30) return null; 

            const leftPx = stair.x * GAME_CONFIG.STEP_WIDTH;
            const bottomPx = stair.y * GAME_CONFIG.STEP_HEIGHT;
            
            return (
              <div 
                key={stair.id}
                className="absolute"
                style={{
                  left: leftPx,
                  bottom: bottomPx,
                  width: GAME_CONFIG.STEP_WIDTH,
                  height: GAME_CONFIG.STEP_HEIGHT,
                }}
              >
                {/* Visual Stair Block */}
                <div className="w-full h-4 bg-gray-300 border-t-4 border-white shadow-lg relative top-0 z-10"></div>
                <div className="w-full h-full bg-gray-400 opacity-50 relative -z-10 top-[-4px] border-l-2 border-r-2 border-gray-500/20"></div>
                
                {/* Coin */}
                {stair.hasCoin && (
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 animate-coin z-20 text-yellow-400">
                    <div className="w-8 h-8 bg-yellow-400 rounded-full border-2 border-yellow-200 shadow-[0_4px_0_rgba(180,83,9,1)] flex items-center justify-center text-xs font-bold text-yellow-900">$</div>
                  </div>
                )}
              </div>
            );
          })}
          
          {/* Render Ghosts (Dash Effect) */}
          {ghosts.map(ghost => (
             <div 
               key={`ghost-${ghost.id}`}
               className="absolute z-20 transition-opacity duration-200"
               style={{
                 left: ghost.x * GAME_CONFIG.STEP_WIDTH + (GAME_CONFIG.STEP_WIDTH/2) - 24, 
                 bottom: ghost.y * GAME_CONFIG.STEP_HEIGHT + 16,
                 opacity: ghost.opacity
               }}
             >
                <div className="opacity-30 filter blur-[1px] grayscale contrast-150">
                   <Character state={CharacterState.RUN} facing={ghost.facing} skinId={equippedSkin} showAura={false} />
                </div>
             </div>
          ))}

          {/* Render Player */}
          {gameState !== GameState.MENU && currentPlayerStair && (
              <div 
                className="absolute z-30 transition-all duration-100 ease-linear"
                style={{
                  left: currentPlayerStair.x * GAME_CONFIG.STEP_WIDTH + (GAME_CONFIG.STEP_WIDTH/2) - 24, // Center 48px sprite
                  bottom: currentPlayerStair.y * GAME_CONFIG.STEP_HEIGHT + 16, // Sit on top of the 4px stair border
                }}
              >
                <Character 
                  state={player.state} 
                  facing={player.facing} 
                  skinId={equippedSkin}
                  showAura={score > 50} 
                />
              </div>
          )}
          
        </div>
      </div>

      {/* --- Menus & Overlays --- */}

      {/* Shop Overlay */}
      {shopOpen && renderShop()}
      
      {/* Settings Overlay */}
      {settingsOpen && renderSettings()}

      {/* Main Menu */}
      {gameState === GameState.MENU && !shopOpen && !settingsOpen && (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white z-40 p-6 text-center animate-fade-in pointer-events-auto">
          <div className="mb-8 relative">
             <h1 className="text-4xl md:text-6xl text-blue-400 font-bold drop-shadow-[0_6px_0_#1e3a8a] leading-tight font-[Press Start 2P] tracking-tighter">
               INFINITE<br/>STAIRS
             </h1>
          </div>

          {/* Character Preview */}
          <div className="mb-8 relative w-48 h-48 flex items-center justify-center bg-blue-900/30 rounded-full border-4 border-blue-500/50 shadow-[0_0_30px_rgba(59,130,246,0.3)]">
             <div className="scale-150 animate-float">
                <Character 
                  state={CharacterState.IDLE} 
                  facing={Direction.RIGHT} 
                  skinId={equippedSkin}
                  showAura={true} 
                />
             </div>
          </div>
          
          {/* Main Action Buttons */}
          <div className="flex flex-col gap-4 w-full max-w-sm">
            <button 
              onClick={startGame}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 border-b-8 border-blue-800 rounded-xl text-xl font-bold active:border-b-0 active:translate-y-2 transition-all flex items-center justify-center gap-3 group"
            >
              <Play fill="white" className="group-hover:scale-110 transition-transform"/> 
              START GAME
            </button>
            
            <div className="flex gap-4">
              <button 
                 onClick={() => { playSound('click'); setShopOpen(true); }}
                 className="flex-1 py-3 bg-yellow-600 hover:bg-yellow-500 border-b-4 border-yellow-800 rounded-xl font-bold active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2"
              >
                <ShoppingBag size={20}/> SHOP
              </button>
              <button 
                 onClick={() => { playSound('click'); setSettingsOpen(true); }}
                 className="flex-1 py-3 bg-gray-600 hover:bg-gray-500 border-b-4 border-gray-800 rounded-xl font-bold active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2"
              >
                <Settings size={20}/> KEYS
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Over */}
      {gameState === GameState.GAMEOVER && (
        <div className="absolute inset-0 bg-red-950/90 flex flex-col items-center justify-center text-white z-50 p-6 animate-fade-in pointer-events-auto">
          <h2 className="text-6xl mb-2 text-red-500 font-bold drop-shadow-[0_4px_0_rgba(0,0,0,1)] animate-pulse">KO!</h2>
          <p className="text-red-300 mb-8 text-sm">You fell off the stairs!</p>
          
          <div className="bg-black/40 p-6 rounded-lg backdrop-blur-md border border-red-500/30 mb-8 text-center w-full max-w-sm shadow-2xl">
             <div className="text-xs text-gray-400 mb-1 tracking-widest">SCORE</div>
             <div className="text-5xl font-bold text-white mb-6 drop-shadow-md">{score}</div>
             
             <div className="flex justify-between px-4 py-2 bg-white/5 rounded">
                <div className="text-left">
                    <div className="text-[10px] text-gray-400">BEST</div>
                    <div className="text-yellow-400 font-bold">{highScore}</div>
                </div>
                <div className="text-right">
                    <div className="text-[10px] text-gray-400">COINS</div>
                    <div className="text-yellow-400 font-bold">{coins}</div>
                </div>
             </div>
          </div>

          <div className="flex gap-4 w-full max-w-sm">
            <button 
              onClick={() => { playSound('click'); setGameState(GameState.MENU); }}
              className="flex-1 py-4 bg-gray-700 hover:bg-gray-600 border-b-4 border-gray-900 rounded-lg active:translate-y-1 active:border-b-0 transition-all font-bold text-sm"
            >
              MENU
            </button>
            <button 
              onClick={startGame}
              className="flex-1 py-4 bg-green-600 hover:bg-green-500 border-b-4 border-green-800 rounded-lg active:translate-y-1 active:border-b-0 transition-all flex justify-center items-center gap-2 font-bold text-sm"
            >
              <RotateCcw size={16} /> RETRY
            </button>
          </div>
        </div>
      )}

      {/* Pause Menu */}
      {gameState === GameState.PAUSED && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 pointer-events-auto">
           <div className="bg-gray-900 p-8 rounded-2xl border-2 border-gray-700 shadow-2xl w-full max-w-sm flex flex-col gap-4">
              <h2 className="text-3xl text-white mb-4 font-bold text-center">PAUSED</h2>
              
              <button 
                onClick={() => { playSound('click'); setGameState(GameState.PLAYING); }}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-bold border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 flex items-center justify-center gap-2"
              >
                <Play size={20} fill="white" /> RESUME
              </button>

              <div className="flex gap-4">
                <button 
                  onClick={() => { playSound('click'); setGameState(GameState.MENU); }}
                  className="flex-1 py-4 bg-gray-600 hover:bg-gray-500 rounded-lg text-white font-bold border-b-4 border-gray-800 active:border-b-0 active:translate-y-1 flex items-center justify-center gap-2"
                >
                  <Home size={20} fill="white" /> MENU
                </button>
                <button 
                  onClick={startGame}
                  className="flex-1 py-4 bg-green-600 hover:bg-green-500 rounded-lg text-white font-bold border-b-4 border-green-800 active:border-b-0 active:translate-y-1 flex items-center justify-center gap-2"
                >
                  <RotateCcw size={20} /> RETRY
                </button>
              </div>
           </div>
        </div>
      )}

      {/* --- Controls --- */}
      {(gameState === GameState.PLAYING || gameState === GameState.PAUSED) && (
        <div className="absolute bottom-0 left-0 w-full p-4 pb-8 flex justify-between items-end z-40 gap-4 pointer-events-auto">
          
          {/* Turn Button (Left) */}
          <button 
            className="flex-1 h-32 bg-orange-500 border-b-[8px] border-orange-800 rounded-2xl active:border-b-0 active:translate-y-2 transition-all flex flex-col items-center justify-center group shadow-lg active:shadow-none"
            onPointerDown={turn} 
          >
            <RotateCw className="w-12 h-12 text-white mb-2 group-active:scale-90 transition-transform drop-shadow-md" strokeWidth={3} />
            <span className="text-white text-sm font-bold tracking-widest drop-shadow-md">TURN</span>
            <span className="text-[10px] text-orange-200 mt-1 opacity-70">({keyConfig.turn})</span>
          </button>

          {/* Climb Button (Right) */}
          <button 
            className="flex-1 h-32 bg-blue-600 border-b-[8px] border-blue-800 rounded-2xl active:border-b-0 active:translate-y-2 transition-all flex flex-col items-center justify-center group shadow-lg active:shadow-none"
            onPointerDown={climb}
          >
            <ArrowUp className="w-12 h-12 text-white mb-2 group-active:scale-90 transition-transform drop-shadow-md" strokeWidth={3} />
            <span className="text-white text-sm font-bold tracking-widest drop-shadow-md">CLIMB</span>
            <span className="text-[10px] text-blue-200 mt-1 opacity-70">({keyConfig.climb})</span>
          </button>
          
        </div>
      )}
      
    </div>
  );
};

export default App;
