import React, { useState } from 'react';
import { Play, AlertCircle } from 'lucide-react';
import { isNameTaken } from '../services/storageService';

interface WelcomeScreenProps {
  onStart: (name: string) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    
    if (!trimmedName) return;

    if (isNameTaken(trimmedName)) {
      setError('This name is already on the leaderboard! Please choose another.');
      return;
    }

    onStart(trimmedName);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    if (error) setError('');
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-yellow-50">
      <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full border-4 border-yellow-400">
        <div className="flex justify-center mb-6">
          <span className="text-6xl">🍌</span>
        </div>
        <h1 className="text-3xl font-black text-center text-yellow-500 mb-2 font-mono">BANANA PEELER</h1>
        <p className="text-gray-500 text-center mb-8">The most potassium-rich clicker game.</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Enter your name to start
            </label>
            <div className="relative">
              <input
                type="text"
                id="name"
                required
                maxLength={30}
                className={`w-full px-4 py-3 rounded-xl border-2 transition-colors text-lg outline-none text-gray-900 ${
                  error 
                    ? 'border-red-400 focus:border-red-500 focus:ring focus:ring-red-200' 
                    : 'border-yellow-200 focus:border-yellow-500 focus:ring focus:ring-yellow-200'
                } focus:ring-opacity-50`}
                placeholder="Monkey King"
                value={name}
                onChange={handleNameChange}
              />
            </div>
            {error && (
              <div className="flex items-center gap-1 mt-2 text-red-500 text-sm font-medium animate-pulse">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}
          </div>
          
          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-4 px-6 rounded-xl transition-transform transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
          >
            <span>Start Peeling</span>
            <Play size={20} fill="currentColor" />
          </button>
        </form>
      </div>
    </div>
  );
};
