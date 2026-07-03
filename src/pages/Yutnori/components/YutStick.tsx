
import React, { useState, useEffect } from 'react';

interface YutStickProps {
  isFlat: boolean;
  isMarked?: boolean;
  animate: boolean;
}

const YutStick: React.FC<YutStickProps> = ({ isFlat, isMarked, animate }) => {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (animate) {
      // Create a "tumbling" effect
      const interval = setInterval(() => {
        setRotation(prev => prev + 45);
      }, 50);
      setTimeout(() => {
        clearInterval(interval);
        setRotation(isFlat ? 180 : 0); // Flat is back side up? Or front?
      }, 800);
      return () => clearInterval(interval);
    } else {
      setRotation(isFlat ? 180 : 0);
    }
  }, [animate, isFlat]);

  return (
    <div 
      className="relative w-8 h-32 transition-transform duration-500 flex items-center justify-center"
      style={{ 
        transform: `rotate(${rotation}deg)`,
        transformStyle: 'preserve-3d'
      }}
    >
      <div className={`absolute w-full h-full rounded-full border-2 border-amber-900 overflow-hidden ${isFlat ? 'bg-amber-100' : 'bg-amber-700'}`}>
        {!isFlat && (
           <div className="w-full h-full flex flex-col justify-around items-center opacity-40">
              <div className="w-1 h-4 bg-amber-900 rounded-full" />
              <div className="w-1 h-4 bg-amber-900 rounded-full" />
              <div className="w-1 h-4 bg-amber-900 rounded-full" />
           </div>
        )}
        {isFlat && isMarked && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-red-600 font-bold text-xl">X</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default YutStick;
