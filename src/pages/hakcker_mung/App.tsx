import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Terminal } from './components/Terminal';
import { Jumpscare } from './components/Jumpscare';
import { HACKER_CODE } from './constants';

const App: React.FC = () => {
  const [typedIndex, setTypedIndex] = useState(0);
  const [showJumpscare, setShowJumpscare] = useState(false);
  
  // Hidden input ref to handle mobile virtual keyboards
  const inputRef = useRef<HTMLInputElement>(null);

  // The actual displayed content based on the index
  const displayContent = HACKER_CODE.substring(0, typedIndex);

  const handleInteraction = useCallback(() => {
    if (showJumpscare) return;

    // Logic: Increase index by a random amount (3 to 15 characters)
    // This makes typing look extremely fast and hacker-like
    const increment = Math.floor(Math.random() * 12) + 3;
    
    setTypedIndex((prev) => {
      const nextIndex = prev + increment;
      
      // Check if we reached the end
      if (nextIndex >= HACKER_CODE.length) {
        setTimeout(() => setShowJumpscare(true), 300); // Slight delay for dramatic effect
        return HACKER_CODE.length;
      }
      return nextIndex;
    });
  }, [showJumpscare]);

  // Handle physical keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Exclude functional keys and Enter as requested
      const ignoredKeys = [
        'Enter', 'Backspace', 'Tab', 'Escape', 
        'Shift', 'Control', 'Alt', 'Meta', 
        'CapsLock', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
        'Home', 'End', 'PageUp', 'PageDown', 'Insert', 'Delete',
        'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12'
      ];

      if (ignoredKeys.includes(e.key)) {
          return;
      }

      // Allow Alphabet, Numbers, Symbols, Korean (Process)
      // Generally anything that produces a printable character
      if (e.key.length === 1 || e.key === 'Process') {
        handleInteraction();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleInteraction]);

  // Focus hidden input on click to support mobile keyboards
  const handleClick = () => {
    if (inputRef.current) {
        inputRef.current.focus();
    }
    // Note: We removed handleInteraction() from here so clicks don't type code
  };

  // Handle mobile virtual keyboard input via onChange
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     handleInteraction();
     e.target.value = '';
  };

  return (
    <div 
        className="hacker-mung-page relative w-full h-full bg-black cursor-text select-none rounded-lg shadow-2xl flex flex-col"
        onClick={handleClick}
        onTouchStart={handleClick} // Focus on touch
    >
      {/* Hidden input to trigger virtual keyboard on mobile */}
      <input 
        ref={inputRef}
        type="text" 
        className="fixed opacity-0 -top-10 -left-10 h-px w-px"
        autoFocus
        onChange={handleInputChange}
        autoComplete="off"
      />

      <div className="flex-1 overflow-hidden">
        <Terminal content={displayContent} />
      </div>
      
      {showJumpscare && <Jumpscare onClose={() => setShowJumpscare(false)} />}

      {/* Instructional Overlay (Fades out once typing starts) */}
      {typedIndex === 0 && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="bg-black/80 text-[#0f0] border border-[#0f0] p-6 rounded-lg shadow-[0_0_20px_#0f0] animate-pulse text-center">
            <h2 className="text-xl font-bold mb-2">SYSTEM READY</h2>
            <p>Type any key to hack...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
