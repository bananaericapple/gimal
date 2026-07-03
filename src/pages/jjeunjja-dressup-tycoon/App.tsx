import React, { useState } from 'react';
import { Character, Inventory, Wardrobe, Item, Category } from './types';
import { CHARACTERS, CATEGORIES } from './constants';
import CharacterVisual from './components/CharacterVisual';
import GachaPanel from './components/GachaPanel';
import DressUpPanel from './components/DressUpPanel';
import { Play, RotateCcw, Sparkles } from 'lucide-react';

type GameState = 'START' | 'SELECT' | 'GAME';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('START');
  const [selectedCharId, setSelectedCharId] = useState<string | null>(null);
  
  // Game State
  const [inventory, setInventory] = useState<Inventory>({});
  const [equipped, setEquipped] = useState<Wardrobe>({
    hair: null,
    top: null,
    bottom: null,
    outer: null,
    socks: null,
    shoes: null,
  });

  const selectedCharacter = CHARACTERS.find((c) => c.id === selectedCharId);

  const handleStartGame = () => setGameState('SELECT');

  const handleSelectCharacter = (id: string) => {
    setSelectedCharId(id);
    setGameState('GAME');
  };

  const handlePullItem = (item: Item) => {
    setInventory((prev) => ({
      ...prev,
      [item.id]: (prev[item.id] || 0) + 1,
    }));
  };

  const handleEquip = (item: Item) => {
    setEquipped((prev) => ({
      ...prev,
      [item.category]: item.id,
    }));
  };

  const handleUnequip = (category: Category) => {
    setEquipped((prev) => ({
      ...prev,
      [category]: null,
    }));
  };

  const resetGame = () => {
      setGameState('START');
      setSelectedCharId(null);
      setInventory({});
      setEquipped({
        hair: null,
        top: null,
        bottom: null,
        outer: null,
        socks: null,
        shoes: null,
      });
  };

  // --- Screens ---

  if (gameState === 'START') {
    return (
      <div
        className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex flex-col items-center justify-center p-4 overflow-hidden relative"
        style={{ height: '100%', minHeight: '100%' }}
      >
        {/* Background Decoration */}
        <div className="absolute top-20 left-20 text-white/20 animate-bounce delay-700"><Sparkles size={48} /></div>
        <div className="absolute bottom-20 right-20 text-white/20 animate-bounce"><Sparkles size={64} /></div>
        
        <div className="bg-white/95 backdrop-blur-sm p-12 rounded-[3rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] text-center border-8 border-yellow-400 transform transition-transform duration-500 hover:scale-105 relative z-10">
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 font-black px-6 py-2 rounded-full text-sm uppercase tracking-widest shadow-lg">
             Best Game Ever
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 mb-8 drop-shadow-sm leading-tight tracking-tight">
            쯘짜 옷 입히기<br />
            <span className="text-4xl md:text-6xl text-yellow-500 stroke-black stroke-2" style={{textShadow: '2px 2px 0 #000'}}>타이쿤</span>
          </h1>
          <p className="text-gray-500 font-bold mb-8 text-lg">
             나만의 스타일로 캐릭터를 꾸며보세요!
          </p>
          <button
            onClick={handleStartGame}
            className="group relative inline-flex items-center justify-center px-10 py-5 text-2xl font-black text-white transition-all duration-200 bg-gradient-to-r from-yellow-400 to-orange-500 font-sans rounded-full hover:to-orange-600 hover:scale-110 active:scale-95 shadow-xl hover:shadow-2xl"
          >
            <Play className="mr-3 fill-current w-8 h-8" /> GAME START
            <div className="absolute inset-0 rounded-full ring-4 ring-white/30 group-hover:ring-white/50 animate-pulse"></div>
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'SELECT') {
    return (
      <div
        className="bg-gradient-to-b from-blue-50 to-white p-6 flex flex-col items-center"
        style={{ height: '100%', minHeight: '100%' }}
      >
        <h2 className="text-3xl font-black text-blue-900 mb-8 mt-4 bg-white px-8 py-3 rounded-full shadow-lg border-2 border-blue-100">
          ✨ 캐릭터를 선택하세요!
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl w-full">
          {CHARACTERS.map((char) => (
            <button
              key={char.id}
              onClick={() => handleSelectCharacter(char.id)}
              className="relative bg-white rounded-[2rem] p-6 shadow-xl border-4 border-white hover:border-blue-400 hover:-translate-y-2 transition-all duration-300 flex flex-col items-center text-center group overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-gray-100 to-white -z-10 group-hover:from-blue-50 transition-colors"></div>
              
              {/* Character Visual Container: Increased height to ensure no overlap */}
              <div className="w-full h-80 mb-4 flex items-center justify-center transform group-hover:scale-105 transition-transform">
                <div className="scale-[0.75] origin-center">
                    <CharacterVisual 
                        character={char} 
                        equipped={{hair:null, top:null, bottom:null, outer:null, socks:null, shoes:null}} 
                    />
                </div>
              </div>
              
              {/* Text: Added z-index to ensure visibility */}
              <h3 className="relative z-10 text-2xl font-black text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">{char.name}</h3>
              <p className="relative z-10 text-sm font-medium text-gray-500 break-keep leading-relaxed bg-gray-50 p-3 rounded-xl w-full">
                  {char.description}
              </p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // GAME SCREEN
  return (
    <div
      className="bg-pink-50 flex flex-col font-sans"
      style={{ height: '100%', minHeight: '100%' }}
    >
        {/* Header */}
        <header className="bg-white/90 backdrop-blur-md shadow-sm p-4 flex justify-between items-center z-50 sticky top-0 border-b border-pink-100">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-pink-500 rounded-lg flex items-center justify-center text-white font-black">Ty</div>
                <h1 className="text-xl font-bold text-gray-800">쯘짜 옷 입히기 타이쿤</h1>
            </div>
            <button onClick={resetGame} className="flex items-center text-sm font-bold text-gray-500 hover:text-red-500 bg-gray-100 hover:bg-red-50 px-4 py-2 rounded-full transition-colors">
                <RotateCcw size={16} className="mr-2"/> 처음으로
            </button>
        </header>

      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Wardrobe / Gacha */}
        <div className="lg:col-span-3 order-2 lg:order-1 h-full max-h-full">
          <GachaPanel inventory={inventory} onPull={handlePullItem} />
        </div>

        {/* Center: Character Stage */}
        <div className="lg:col-span-5 order-1 lg:order-2 flex flex-col items-center justify-center bg-gradient-to-b from-pink-200 to-pink-300 rounded-[3rem] border-[10px] border-white shadow-2xl p-8 relative h-full min-h-[500px] overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            
            {/* NAME TAG: Moved to top-left */}
            <div className="absolute top-8 left-8 bg-white/90 backdrop-blur px-6 py-3 rounded-2xl text-pink-900 font-black text-3xl shadow-lg border-4 border-white/50 transform -rotate-3 z-20">
                {selectedCharacter?.name}
            </div>

            <div className="absolute top-6 right-8 text-white font-black text-4xl opacity-30 select-none tracking-widest text-right leading-none z-0">
                DRESS<br/>ROOM
            </div>
            
            {selectedCharacter && (
                <div className="transform scale-125 md:scale-150 transition-all drop-shadow-2xl z-10 pt-10">
                    <CharacterVisual 
                        character={selectedCharacter} 
                        equipped={equipped} 
                    />
                </div>
            )}
        </div>

        {/* Right: Inventory / Equip */}
        <div className="lg:col-span-4 order-3 lg:order-3 h-full max-h-full overflow-hidden">
          <DressUpPanel 
            inventory={inventory} 
            equipped={equipped} 
            onEquip={handleEquip}
            onUnequip={handleUnequip}
          />
        </div>

      </main>
    </div>
  );
};

export default App;
