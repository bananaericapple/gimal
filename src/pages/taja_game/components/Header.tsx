
import React from 'react';
import { Category } from '../types';

interface HeaderProps {
  selectedCategory: Category;
  onCategoryChange: (category: Category) => void;
  onStart: () => void;
  disabled: boolean;
}

const Header: React.FC<HeaderProps> = ({ selectedCategory, onCategoryChange, onStart, disabled }) => {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b pb-6">
      <h1 className="text-3xl font-bold text-blue-600 flex items-center gap-2">
        <span className="bg-blue-600 text-white p-1 rounded-lg">한</span>
        HanTyper
      </h1>
      
      <div className="flex items-center gap-2">
        <select 
          value={selectedCategory} 
          onChange={(e) => onCategoryChange(e.target.value as Category)}
          disabled={disabled}
          className="bg-gray-100 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 transition-all outline-none"
        >
          {Object.values(Category).map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        
        <button 
          onClick={onStart}
          disabled={disabled}
          className={`px-6 py-2.5 rounded-lg font-medium text-white transition-all ${
            disabled 
            ? 'bg-gray-300 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700 active:transform active:scale-95'
          }`}
        >
          {disabled ? '연습 중...' : '시작'}
        </button>
      </div>
    </div>
  );
};

export default Header;
