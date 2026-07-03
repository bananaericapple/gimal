
import React, { useState } from 'react';
import { ALL_ITEMS } from '../constants';
import { Inventory, Item } from '../types';
import { PackageOpen, Dices, Sparkles } from 'lucide-react';

interface Props {
  inventory: Inventory;
  onPull: (item: Item) => void;
}

const GachaPanel: React.FC<Props> = ({ inventory, onPull }) => {
  const [lastPulled, setLastPulled] = useState<Item | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const handlePull = () => {
    setIsAnimating(true);
    // Simulate slight delay for effect
    setTimeout(() => {
        // Pick random item from ALL items
        const randomIndex = Math.floor(Math.random() * ALL_ITEMS.length);
        const newItem = ALL_ITEMS[randomIndex];
        
        onPull(newItem);
        setLastPulled(newItem);
        setIsAnimating(false);
    }, 600);
  };

  const getTotalUniqueCount = () => {
    const ownedIds = Object.keys(inventory);
    return ALL_ITEMS.filter(i => ownedIds.includes(i.id)).length;
  };

  const totalItems = ALL_ITEMS.length;
  const remainingCount = totalItems - getTotalUniqueCount();

  return (
    <div className="p-4 bg-white rounded-3xl shadow-xl border-4 border-yellow-200 h-full flex flex-col">
      <h2 className="text-2xl font-black text-yellow-600 mb-6 flex items-center gap-2">
        <PackageOpen /> 옷장 (랜덤 뽑기)
      </h2>

      <div className="flex-1 flex flex-col items-center justify-center gap-6">
          
          <button
            onClick={handlePull}
            disabled={isAnimating}
            className={`
                relative w-full max-w-xs aspect-square rounded-full border-b-8 border-yellow-600
                flex flex-col items-center justify-center gap-2 transition-all transform
                ${isAnimating ? 'bg-yellow-200 scale-95 border-b-0 translate-y-2' : 'bg-yellow-400 hover:bg-yellow-300 hover:scale-105 active:scale-95 active:border-b-0 active:translate-y-2'}
                shadow-2xl
            `}
          >
            {isAnimating ? (
                <Sparkles className="animate-spin text-white w-20 h-20" />
            ) : (
                <>
                    <Dices size={64} className="text-yellow-800" />
                    <span className="text-3xl font-black text-yellow-900">뽑기!</span>
                </>
            )}
          </button>

          <div className="text-center bg-yellow-50 p-4 rounded-xl border-2 border-yellow-200 w-full">
              <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-500 font-bold">수집 현황</span>
                  <span className="text-xs text-red-400 font-black">남은 옷 갯수: {remainingCount}개</span>
              </div>
              <div className="text-3xl font-black text-yellow-600">
                  {getTotalUniqueCount()} / {totalItems}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2 overflow-hidden">
                <div 
                    className="bg-yellow-400 h-2.5 rounded-full transition-all duration-500" 
                    style={{ width: `${(getTotalUniqueCount() / totalItems) * 100}%` }}
                ></div>
              </div>
          </div>
      </div>

      {/* Result Modal / Overlay */}
      {lastPulled && !isAnimating && (
        <div className="mt-6 p-6 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-2xl border-4 border-yellow-400 animate-bounce text-center relative overflow-hidden shadow-lg">
           <div className="absolute top-0 left-0 w-full h-full bg-white/20"></div>
           <p className="text-lg text-yellow-800 font-bold mb-2 relative z-10">짜잔! 무언가 나왔다!</p>
           <div 
             className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-white text-xl font-bold shadow-md border-2 border-black/10 relative z-10"
             style={{ backgroundColor: lastPulled.color }}
           >
             {lastPulled.name}
           </div>
           <div className="text-sm text-gray-600 mt-3 font-medium relative z-10">
             {inventory[lastPulled.id] > 1 ? '😓 이미 가지고 있는 옷이에요...' : '✨ 새로운 옷을 획득했어요!'}
           </div>
        </div>
      )}
    </div>
  );
};

export default GachaPanel;
