import React, { useEffect, useState } from 'react';

interface JumpscareProps {
  onClose: () => void;
}

export const Jumpscare: React.FC<JumpscareProps> = ({ onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Small delay to ensure render before animation starts
    const timer = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black overflow-hidden ${visible ? 'opacity-100' : 'opacity-0'} transition-opacity duration-75`}>
      <div className="relative w-full h-full flex flex-col items-center justify-center shake-hard">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 px-4 py-2 bg-red-700 text-white font-bold border border-white shadow-lg hover:bg-red-600 transition-colors"
        >
          나가기
        </button>
        {/* Scary Image Overlay */}
        <div className="absolute inset-0 bg-red-900 mix-blend-overlay animate-pulse z-10 pointer-events-none"></div>
        
        <img 
          src="https://picsum.photos/seed/scaryghost/1024/1024?grayscale&blur=1" 
          alt="SCARY" 
          className="w-full h-full object-cover filter contrast-[2.5] brightness-75 invert sepia-[.5] saturate-[5]"
        />

        <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
            <h1 className="text-6xl md:text-9xl font-bold text-red-600 tracking-widest uppercase drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)] bg-black px-4">
                cloverPit ERROR
            </h1>
            <p className="mt-8 text-2xl md:text-4xl text-white font-mono bg-red-700 px-4 py-2">
                you lose your 70,000,000 won
            </p>
        </div>
      </div>
    </div>
  );
};
