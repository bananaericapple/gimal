
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Sword, MessageCircle, Hand, Skull } from 'lucide-react';
import SansVisual from './components/SansVisual';
import BattleArena from './components/BattleArena';
import Typewriter from './components/Typewriter';
import DeathAnimation from './components/DeathAnimation';
import { GameState, ActionType, PlayerStats } from './types';

interface Item {
  id: string;
  label: string;
  heal: number;
  count: number;
}

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('START');
  const [playerStats, setPlayerStats] = useState<PlayerStats>({
    hp: 92,
    maxHp: 92,
    name: 'CHARA',
    lv: 19
  });
  
  const [inventory, setInventory] = useState<Item[]>([
    { id: 'steak', label: 'FaceSteak', heal: 100, count: 2 },
    { id: 'lhero', label: 'L. Hero', heal: 50, count: 5 },
    { id: 'pie', label: 'Pie', heal: 99, count: 1 }
  ]);

  const [turnCount, setTurnCount] = useState(1);
  const [sansDialogue, setSansDialogue] = useState("");
  const [battleText, setBattleText] = useState("* You feel your sins crawling on your back.");
  const [currentMenu, setCurrentMenu] = useState<ActionType>(null);
  const [isActionProcessing, setIsActionProcessing] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0); 
  
  const [isFlashing, setIsFlashing] = useState(false);
  const [isGameOverAnimationPlaying, setIsGameOverAnimationPlaying] = useState(false);
  const [showKoreanGameOver, setShowKoreanGameOver] = useState(false);

  const gameStateRef = useRef(gameState);
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  const handleStart = () => {
    setSansDialogue("");
    setGameState('PLAYER_TURN');
  };

  const handleActionTextComplete = useCallback(() => {
    if (isActionProcessing) {
      setTimeout(() => {
        setIsActionProcessing(false);
        setGameState('ENEMY_TURN');
      }, 1000);
    }
  }, [isActionProcessing]);

  const handleUseItem = useCallback((item: Item) => {
    if (gameState !== 'PLAYER_TURN' || item.count <= 0) return;

    const newHp = Math.min(playerStats.maxHp, playerStats.hp + item.heal);
    setPlayerStats(prev => ({ ...prev, hp: newHp }));
    setInventory(prev => prev.map(i => i.id === item.id ? { ...i, count: i.count - 1 } : i));

    setBattleText(`* You ate the ${item.label}. \n* Recovered ${item.heal} HP!`);
    setCurrentMenu(null);
    setIsActionProcessing(true);
  }, [gameState, playerStats.hp, playerStats.maxHp]);

  const executeAction = useCallback((action: ActionType) => {
    if (action === 'FIGHT') {
      // FIGHT는 텍스트를 바로 띄우는 게 아니라 게임을 먼저 실행해야 함
      setGameState('ATTACK_GAME');
      setBattleText("");
      setIsActionProcessing(false); 
    } else {
      if (action === 'ACT') {
        setBattleText("* SANS 1 ATK 1 DEF. The easiest enemy. \n* Can only deal 1 damage.");
      } else if (action === 'MERCY') {
        setBattleText("* You spared Sans. He doesn't seem to care.");
      }
      setIsActionProcessing(true);
    }
    setCurrentMenu(null);
  }, []);

  const handleMainMenuClick = (action: ActionType) => {
    if (gameState !== 'PLAYER_TURN' || isActionProcessing) return;
    setCurrentMenu(action);
    setSelectedIndex(0);
  };

  const getMenuItems = () => {
    if (currentMenu === 'FIGHT') return [{ id: 'sans', label: 'Sans' }];
    if (currentMenu === 'ACT') return [{ id: 'check', label: 'Check' }];
    if (currentMenu === 'ITEM') return inventory.filter(i => i.count > 0);
    if (currentMenu === 'MERCY') return [{ id: 'spare', label: 'Spare' }];
    return [];
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'PLAYER_TURN' || isActionProcessing || currentMenu === null) return;
      
      const items = getMenuItems();
      if (items.length === 0) return;

      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        setSelectedIndex(prev => (prev + 1) % items.length);
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        setSelectedIndex(prev => (prev - 1 + items.length) % items.length);
      } else if (e.key === 'Enter' || e.key === 'z' || e.key === 'Z') {
        const selected = items[selectedIndex];
        if (currentMenu === 'ITEM') {
          handleUseItem(selected as Item);
        } else {
          executeAction(currentMenu);
        }
      } else if (e.key === 'Escape' || e.key === 'x' || e.key === 'X') {
        setCurrentMenu(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, isActionProcessing, currentMenu, selectedIndex, inventory, handleUseItem, executeAction]);

  const handleAttackComplete = useCallback((damage: number) => {
    // 공격 게임이 끝나면 다시 텍스트 박스 화면으로 전환해서 MISS를 보여줌
    setGameState('PLAYER_TURN');
    setBattleText(damage > 0 ? "* MISS" : "* MISSED");
    setIsActionProcessing(true); // 결과 텍스트 출력 후 턴을 넘기도록 설정
  }, []);

  const handleEnemyTurnEnd = useCallback(() => {
    setTurnCount(prev => prev + 1);
    setGameState('PLAYER_TURN');
    setBattleText("* You feel like you're going to have a bad time."); 
    setSansDialogue("");
    setIsActionProcessing(false);
    setCurrentMenu(null);
  }, []);

  const handleHit = useCallback(() => {
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 150);
    setPlayerStats(prev => {
      const newHp = Math.max(0, prev.hp - 4); 
      if (newHp === 0) {
        setGameState('GAME_OVER');
        setIsGameOverAnimationPlaying(true);
      }
      return { ...prev, hp: newHp };
    });
  }, []);

  const handleRetry = () => {
    setPlayerStats({ hp: 92, maxHp: 92, name: 'CHARA', lv: 19 });
    setInventory([
      { id: 'steak', label: 'FaceSteak', heal: 100, count: 2 },
      { id: 'lhero', label: 'L. Hero', heal: 50, count: 5 },
      { id: 'pie', label: 'Pie', heal: 99, count: 1 }
    ]);
    setTurnCount(1);
    setSansDialogue("");
    setBattleText("* You feel like you're going to have a bad time.");
    setGameState('PLAYER_TURN');
    setIsActionProcessing(false);
    setCurrentMenu(null);
    setIsGameOverAnimationPlaying(false);
    setShowKoreanGameOver(false);
  };

  if (gameState === 'START') {
    return (
      <div className="h-full w-full bg-black flex flex-col items-center justify-center text-white pixel-font">
        <button 
          onClick={handleStart}
          className="text-6xl border-8 border-white px-20 py-10 hover:bg-white hover:text-black transition-all duration-200 tracking-widest font-bold"
        >
          START
        </button>
      </div>
    );
  }

  if (gameState === 'GAME_OVER') {
    return (
      <div className="h-full w-full bg-black flex flex-col items-center justify-center text-white pixel-font select-none overflow-hidden">
        {isGameOverAnimationPlaying ? (
          <DeathAnimation onComplete={() => setIsGameOverAnimationPlaying(false)} />
        ) : (
          <>
            <h1 className="text-7xl mb-12 text-center text-white tracking-widest animate-[fadeIn_1.5s_ease-in]">GAME OVER</h1>
            <div className="relative w-full max-w-xl h-40 flex items-center justify-center mb-12">
              <p className="text-3xl opacity-90 text-white italic animate-[fadeIn_2.5s_ease-in]">"geettttttt dunked on!"</p>
              {showKoreanGameOver && (
                <div className="absolute inset-0 flex items-center justify-center bg-black z-10 border-y-4 border-red-600 animate-[fadeIn_0.3s_ease-out]">
                   <p className="text-4xl md:text-5xl font-black text-red-600 text-center leading-tight drop-shadow-[0_0_10px_rgba(255,0,0,0.5)]">
                     누군가에게 모욕적으로<br/>패배하거나 완벽하게 당했읍니다
                   </p>
                </div>
              )}
            </div>
            <button 
              onClick={handleRetry}
              className="text-3xl border-4 border-white px-12 py-4 hover:bg-white hover:text-black transition-colors animate-[fadeIn_3.5s_ease-in] z-20"
            >
              TRY AGAIN
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className={`h-full w-full bg-black text-white flex flex-col items-center p-4 pixel-font overflow-hidden ${isFlashing ? 'bg-red-950/40' : ''}`}>
      
      <div className="w-full flex-grow flex flex-col items-center justify-center relative mt-4">
         {(gameState === 'PLAYER_TURN' || gameState === 'ATTACK_GAME' || gameState === 'ENEMY_TURN') && (
            <div className="absolute top-0 right-[5%] md:right-[15%] max-w-[240px] border-[5px] border-black rounded-[40px] p-6 bg-white text-black text-2xl min-h-[100px] z-10">
               <div className="font-bold lowercase leading-none" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                {(gameState === 'PLAYER_TURN' || gameState === 'ATTACK_GAME') ? "ready?" : 
                  sansDialogue || "..."
                }
               </div>
               <div className="absolute top-1/2 -left-6 w-0 h-0 border-t-[10px] border-t-transparent border-r-[30px] border-r-white border-b-[10px] border-b-transparent"></div>
            </div>
         )}
         <SansVisual 
           isAttacking={gameState === 'ENEMY_TURN'} 
           isTired={turnCount > 3}
         />
      </div>

      <div className="w-full max-w-[750px] flex justify-center my-6 min-h-[200px]">
        {(gameState === 'ENEMY_TURN' || gameState === 'ATTACK_GAME') ? (
          <BattleArena 
            key={`${gameState}-${turnCount}`} 
            isActive={true} 
            mode={gameState === 'ATTACK_GAME' ? 'ATTACK' : 'DEFEND'}
            onHit={handleHit} 
            onTurnEnd={handleEnemyTurnEnd}
            onAttackEnd={handleAttackComplete}
            difficulty={turnCount}
          />
        ) : (
          <div className="w-full border-[6px] border-white p-8 min-h-[180px] text-4xl leading-relaxed relative bg-black overflow-hidden">
            {currentMenu === null ? (
              <>
                <span className="absolute top-8 left-8">*</span>
                <div className="ml-10">
                  <Typewriter 
                    key={battleText} 
                    text={battleText} 
                    speed={25} 
                    onComplete={handleActionTextComplete}
                  />
                </div>
              </>
            ) : (
               <div className="grid grid-cols-2 gap-x-12 gap-y-4">
                  {getMenuItems().map((item, idx) => (
                    <div 
                      key={item.id} 
                      className={`relative flex items-center pl-10 cursor-pointer transition-colors select-none ${selectedIndex === idx ? 'text-yellow-400' : 'text-white'}`}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      onClick={() => {
                        if (currentMenu === 'ITEM') handleUseItem(item as Item);
                        else executeAction(currentMenu);
                      }}
                    >
                      {selectedIndex === idx && (
                        <div className="absolute left-0 w-6 h-6 bg-red-600 soul-mini"></div>
                      )}
                      * {item.label} {(item as Item).count !== undefined ? `(x${(item as Item).count})` : ''}
                    </div>
                  ))}
               </div>
            )}
          </div>
        )}
      </div>

      <div className="w-full max-w-[750px] mb-6">
        <div className="flex items-center text-3xl mb-6 font-bold tracking-widest select-none">
          <span className="mr-8">{playerStats.name}</span>
          <span className="mr-12">LV {playerStats.lv}</span>
          <div className="flex items-center flex-grow max-w-[350px]">
            <span className="mr-3 text-lg font-black">HP</span>
            <div className="h-7 w-full bg-red-600 border border-transparent relative">
               <div 
                 className="h-full bg-yellow-400 transition-all duration-300"
                 style={{ width: `${(playerStats.hp / playerStats.maxHp) * 100}%` }}
               />
            </div>
            <div className="ml-4 text-2xl flex items-center min-w-[120px]">
               <span className="text-sm mr-2 text-yellow-400">KR</span>
               <span>{playerStats.hp} / {playerStats.maxHp}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-between gap-4">
          <ActionButton 
            label="FIGHT" 
            icon={<Sword size={32} />} 
            onClick={() => handleMainMenuClick('FIGHT')} 
            disabled={gameState !== 'PLAYER_TURN' || isActionProcessing} 
            active={currentMenu === 'FIGHT'}
          />
          <ActionButton 
            label="ACT" 
            icon={<MessageCircle size={32} />} 
            onClick={() => handleMainMenuClick('ACT')} 
            disabled={gameState !== 'PLAYER_TURN' || isActionProcessing}
            active={currentMenu === 'ACT'}
          />
          <ActionButton 
            label="ITEM" 
            icon={<Hand size={32} />} 
            onClick={() => handleMainMenuClick('ITEM')} 
            disabled={gameState !== 'PLAYER_TURN' || isActionProcessing}
            active={currentMenu === 'ITEM'}
          />
          <ActionButton 
            label="MERCY" 
            icon={<Skull size={32} />} 
            onClick={() => handleMainMenuClick('MERCY')} 
            disabled={gameState !== 'PLAYER_TURN' || isActionProcessing}
            active={currentMenu === 'MERCY'}
          />
        </div>
      </div>
      <style>{`
        .soul-mini {
          clip-path: polygon(50% 15%, 70% 0%, 100% 20%, 100% 50%, 50% 100%, 0% 50%, 0% 20%, 30% 0%);
          width: 20px;
          height: 20px;
          animation: pulse 1s infinite alternate;
        }
        @keyframes pulse {
          from { transform: scale(1); }
          to { transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
};

interface ActionButtonProps {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled: boolean;
  active: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({ label, icon, onClick, disabled, active }) => (
  <button 
    onClick={onClick}
    disabled={disabled}
    className={`
      flex-1 h-20 border-[6px] flex items-center justify-center text-3xl tracking-widest transition-all select-none
      ${disabled ? 'border-gray-800 text-gray-800 opacity-40 cursor-not-allowed' : 'border-[#e46400] text-[#e46400] hover:text-white hover:border-white active:bg-white/10'}
      ${active ? 'bg-white !text-black border-white' : 'bg-black'}
    `}
  >
    <div className="flex items-center gap-3">
      {icon}
      <span className="font-bold">{label}</span>
    </div>
  </button>
);

export default App;
