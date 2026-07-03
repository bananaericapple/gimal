
import React from 'react';
import { CATEGORIES, CATEGORY_LABELS, ALL_ITEMS } from '../constants';
import { Inventory, Wardrobe, Item, Category } from '../types';
import { Shirt, X } from 'lucide-react';

interface Props {
  inventory: Inventory;
  equipped: Wardrobe;
  onEquip: (item: Item) => void;
  onUnequip: (category: Category) => void;
}

const DressUpPanel: React.FC<Props> = ({ inventory, equipped, onEquip, onUnequip }) => {
  const [activeTab, setActiveTab] = React.useState<Category>('top');

  const ownedItems = ALL_ITEMS.filter((item) => inventory[item.id] && inventory[item.id] > 0);

  return (
    <div className="flex flex-col h-full bg-white rounded-3xl shadow-xl border-4 border-pink-200 overflow-hidden">
      <div className="p-4 bg-pink-100 border-b-2 border-pink-200">
        <h2 className="text-2xl font-black text-pink-600 flex items-center gap-2">
          <Shirt /> 꾸미기 방
        </h2>
      </div>

      {/* Category Tabs */}
      <div className="flex overflow-x-auto p-2 gap-2 bg-pink-50 scrollbar-hide">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-bold transition-colors ${
              activeTab === cat
                ? 'bg-pink-500 text-white shadow-md'
                : 'bg-white text-pink-400 hover:bg-pink-100'
            }`}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Item List */}
      <div className="flex-1 overflow-y-auto p-4 bg-pink-50/50">
        <div className="grid grid-cols-2 gap-3">
          {/* Unequip Button */}
          <button
            onClick={() => onUnequip(activeTab)}
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-400 hover:border-red-400 hover:text-red-400 hover:bg-red-50 transition-all"
          >
            <X size={20} className="mr-1" /> 벗기
          </button>

          {/* Owned Items */}
          {ownedItems
            .filter((item) => item.category === activeTab)
            .map((item) => {
              const isEquipped = equipped[item.category] === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onEquip(item)}
                  className={`relative p-3 rounded-xl border-2 text-left transition-all ${
                    isEquipped
                      ? 'border-pink-500 bg-pink-100 ring-2 ring-pink-300'
                      : 'border-gray-200 bg-white hover:border-pink-300'
                  }`}
                >
                  <div className="w-full h-12 rounded-md mb-2 shadow-inner" style={{ backgroundColor: item.color }}></div>
                  <span className="text-xs font-bold text-gray-700 block truncate">{item.name}</span>
                  {isEquipped && (
                      <span className="absolute top-1 right-1 w-3 h-3 bg-pink-500 rounded-full border border-white"></span>
                  )}
                </button>
              );
            })}
            
            {ownedItems.filter((item) => item.category === activeTab).length === 0 && (
                <div className="col-span-2 text-center text-gray-400 py-8 text-sm">
                    아직 이 종류의 옷이 없어요.<br/>
                    옷장에서 뽑아보세요!
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default DressUpPanel;
