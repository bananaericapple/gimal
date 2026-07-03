import React from 'react';
import { BIRD_SIZE } from '../constants';

interface BirdProps {
  y: number;
  rotation: number;
  image?: string | null;
  skinScale?: number;
}

const Bird: React.FC<BirdProps> = ({ y, rotation, image, skinScale = 1 }) => {
  return (
    <div
      className="absolute z-20"
      style={{
        left: 60, // Fixed X
        top: y,
        width: BIRD_SIZE,
        height: BIRD_SIZE,
        transform: `rotate(${rotation}deg)`,
        transition: 'transform 0.1s ease-out',
      }}
    >
      {image ? (
        // Custom Skin Render
        <div className="w-full h-full rounded-md border-4 border-black overflow-hidden bg-white relative shadow-sm">
            <img 
              src={image} 
              alt="Bird Skin" 
              className="w-full h-full object-cover transition-transform origin-center" 
              style={{ transform: `scale(${skinScale})` }}
            />
        </div>
      ) : (
        // Default Pixel Art Bird Construction using CSS
        <div className="relative w-full h-full">
            {/* Body */}
            <div className="absolute inset-0 bg-yellow-400 rounded-md border-4 border-black"></div>
            {/* Eye */}
            <div className="absolute top-1 right-2 w-4 h-4 bg-white border-2 border-black rounded-full">
                <div className="absolute right-0 top-1 w-1.5 h-1.5 bg-black rounded-full"></div>
            </div>
            {/* Wing */}
            <div className="absolute top-4 left-1 w-5 h-3 bg-white border-2 border-black rounded-full opacity-80"></div>
            {/* Beak */}
            <div className="absolute top-4 -right-2 w-4 h-3 bg-red-500 border-2 border-black rounded-r-md"></div>
        </div>
      )}
    </div>
  );
};

export default Bird;