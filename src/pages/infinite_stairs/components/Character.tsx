
import React from 'react';
import { CharacterState, Direction, SkinId } from '../types';

interface CharacterProps {
  state: CharacterState;
  facing: Direction;
  skinId: SkinId;
  showAura: boolean;
}

export const Character: React.FC<CharacterProps> = ({ state, facing, skinId, showAura }) => {
  const isLeft = facing === Direction.LEFT;
  
  // Transform string for facing
  const transformStyle = {
    transform: `scale(1) scaleX(${isLeft ? -1 : 1})`,
    transition: 'transform 0.1s',
  };

  const renderSkin = () => {
    switch (skinId) {
      case 'training': // Red Tracksuit
        return (
          <>
             {/* Legs */}
             {state === CharacterState.RUN ? (
                <>
                  <rect x="8" y="22" width="4" height="6" fill="#7f1d1d" />
                  <rect x="14" y="24" width="4" height="8" fill="#7f1d1d" />
                  {/* Stripes */}
                  <rect x="11" y="22" width="1" height="6" fill="#ffffff" />
                  <rect x="17" y="24" width="1" height="8" fill="#ffffff" />
                </>
             ) : (
                <>
                   <rect x="9" y="24" width="3" height="8" fill="#7f1d1d" />
                   <rect x="13" y="24" width="3" height="8" fill="#7f1d1d" />
                   <rect x="11" y="24" width="1" height="8" fill="#ffffff" />
                   <rect x="15" y="24" width="1" height="8" fill="#ffffff" />
                </>
             )}
             {/* Body */}
             <rect x="6" y="14" width="13" height="10" fill="#dc2626" rx="1" />
             <rect x="10" y="14" width="5" height="10" fill="#ffffff" opacity="0.2" /> {/* Zip area */}
             <rect x="12" y="14" width="1" height="10" fill="#7f1d1d" /> {/* Zipper */}
             
             {/* Arms */}
             <rect x="5" y="14" width="4" height="9" fill="#dc2626" rx="1" />
             <rect x="5" y="16" width="4" height="2" fill="#ffffff" /> {/* Arm Stripe */}

             {/* Head */}
             <rect x="7" y="4" width="11" height="10" fill="#fca5a5" rx="1" />
             <rect x="6" y="2" width="13" height="5" fill="#dc2626" rx="2"/> {/* Hood/Hair */}
             
             {/* Face details */}
             <rect x="9" y="7" width="2" height="2" fill="#000" />
             <rect x="14" y="7" width="2" height="2" fill="#000" />
             <rect x="10" y="11" width="5" height="1" fill="#7f1d1d" />
          </>
        );
      case 'security': // Pink Guard (Masked)
        return (
          <>
             {/* Legs */}
             {state === CharacterState.RUN ? (
                <>
                  <rect x="8" y="22" width="4" height="6" fill="#be185d" />
                  <rect x="14" y="24" width="4" height="8" fill="#be185d" />
                </>
             ) : (
                <>
                   <rect x="9" y="24" width="3" height="8" fill="#be185d" />
                   <rect x="13" y="24" width="3" height="8" fill="#be185d" />
                </>
             )}
             {/* Body */}
             <rect x="6" y="14" width="13" height="10" fill="#db2777" rx="1" />
             <rect x="10" y="14" width="5" height="10" fill="#be185d" opacity="0.5" /> 
             <rect x="5" y="14" width="4" height="9" fill="#db2777" rx="1" />
             
             {/* Head (Mask) */}
             <rect x="6" y="2" width="13" height="12" fill="#000000" rx="2" />
             <rect x="10" y="5" width="5" height="5" stroke="#ffffff" strokeWidth="1" fill="none" /> {/* Square Symbol */}
          </>
        );
      case 'bear': // Polar Bear
        return (
          <>
             {/* Legs */}
             {state === CharacterState.RUN ? (
                <>
                  <rect x="8" y="22" width="4" height="6" fill="#e5e7eb" />
                  <rect x="14" y="24" width="4" height="8" fill="#e5e7eb" />
                </>
             ) : (
                <>
                   <rect x="9" y="24" width="3" height="8" fill="#e5e7eb" />
                   <rect x="13" y="24" width="3" height="8" fill="#e5e7eb" />
                </>
             )}
             {/* Body */}
             <rect x="5" y="13" width="15" height="12" fill="#f3f4f6" rx="2" />
             <rect x="10" y="15" width="5" height="8" fill="#ffffff" /> {/* Belly */}
             
             {/* Head */}
             <rect x="6" y="3" width="13" height="10" fill="#f3f4f6" rx="2" />
             <rect x="5" y="2" width="3" height="3" fill="#f3f4f6" /> {/* Ear L */}
             <rect x="17" y="2" width="3" height="3" fill="#f3f4f6" /> {/* Ear R */}
             
             {/* Face */}
             <rect x="8" y="6" width="2" height="2" fill="#000" />
             <rect x="15" y="6" width="2" height="2" fill="#000" />
             <rect x="11" y="8" width="3" height="2" fill="#000" /> {/* Nose */}
          </>
        );
      case 'chef': // Master Chef
        return (
          <>
             {/* Legs */}
             {state === CharacterState.RUN ? (
                <>
                  <rect x="8" y="22" width="4" height="6" fill="#1f2937" />
                  <rect x="14" y="24" width="4" height="8" fill="#1f2937" />
                </>
             ) : (
                <>
                   <rect x="9" y="24" width="3" height="8" fill="#1f2937" />
                   <rect x="13" y="24" width="3" height="8" fill="#1f2937" />
                </>
             )}
             {/* Body */}
             <rect x="6" y="14" width="13" height="10" fill="#ffffff" rx="1" />
             <rect x="14" y="14" width="1" height="10" fill="#d1d5db" /> {/* Buttons line */}
             <rect x="10" y="16" width="2" height="1" fill="#000" /> {/* Button */}
             <rect x="10" y="19" width="2" height="1" fill="#000" /> {/* Button */}
             <rect x="5" y="14" width="4" height="9" fill="#ffffff" rx="1" />
             
             {/* Red Scarf */}
             <rect x="7" y="14" width="11" height="2" fill="#ef4444" />

             {/* Head */}
             <rect x="7" y="4" width="11" height="10" fill="#fca5a5" rx="1" />
             <rect x="9" y="8" width="2" height="2" fill="#000" />
             <rect x="14" y="8" width="2" height="2" fill="#000" />
             
             {/* Chef Hat */}
             <rect x="6" y="0" width="13" height="6" fill="#ffffff" rx="2" />
             <rect x="7" y="-2" width="3" height="3" fill="#ffffff" rx="1" />
             <rect x="11" y="-3" width="3" height="4" fill="#ffffff" rx="1" />
             <rect x="15" y="-2" width="3" height="3" fill="#ffffff" rx="1" />
          </>
        );
      case 'ninja': // Shadow Ninja
        return (
          <>
             {/* Legs */}
             {state === CharacterState.RUN ? (
                <>
                  <rect x="8" y="22" width="4" height="6" fill="#111827" />
                  <rect x="14" y="24" width="4" height="8" fill="#111827" />
                </>
             ) : (
                <>
                   <rect x="9" y="24" width="3" height="8" fill="#111827" />
                   <rect x="13" y="24" width="3" height="8" fill="#111827" />
                </>
             )}
             {/* Body */}
             <rect x="6" y="14" width="13" height="10" fill="#1f2937" rx="1" />
             <rect x="5" y="14" width="4" height="9" fill="#1f2937" rx="1" />
             <rect x="8" y="17" width="9" height="1" fill="#ef4444" /> {/* Red Sash */}
             <rect x="10" y="17" width="2" height="6" fill="#ef4444" /> {/* Sash Drop */}

             {/* Head */}
             <rect x="7" y="4" width="11" height="10" fill="#111827" rx="1" />
             <rect x="8" y="7" width="9" height="3" fill="#fca5a5" /> {/* Skin reveal */}
             <rect x="9" y="8" width="2" height="1" fill="#000" />
             <rect x="14" y="8" width="2" height="1" fill="#000" />
             <rect x="6" y="3" width="13" height="2" fill="#ef4444" /> {/* Headband */}
             <rect x="16" y="4" width="4" height="2" fill="#ef4444" /> {/* Headband knot */}
          </>
        );
      case 'robot': // Bot-X
        return (
          <>
             {/* Legs */}
             {state === CharacterState.RUN ? (
                <>
                  <rect x="8" y="22" width="4" height="6" fill="#4b5563" />
                  <rect x="14" y="24" width="4" height="8" fill="#4b5563" />
                </>
             ) : (
                <>
                   <rect x="9" y="24" width="3" height="8" fill="#4b5563" />
                   <rect x="13" y="24" width="3" height="8" fill="#4b5563" />
                </>
             )}
             {/* Body */}
             <rect x="6" y="14" width="13" height="10" fill="#9ca3af" />
             <rect x="8" y="16" width="3" height="2" fill="#10b981" /> {/* Panel */}
             <rect x="12" y="16" width="1" height="1" fill="#ef4444" /> {/* Light */}
             <rect x="14" y="16" width="1" height="1" fill="#fbbf24" /> {/* Light */}
             <rect x="5" y="14" width="4" height="9" fill="#6b7280" /> {/* Arm */}

             {/* Head */}
             <rect x="6" y="3" width="13" height="11" fill="#9ca3af" />
             <rect x="7" y="6" width="11" height="4" fill="#000" /> {/* Visor */}
             <rect x="8" y="7" width="3" height="2" fill="#10b981" /> {/* Eye */}
             <rect x="14" y="7" width="3" height="2" fill="#10b981" /> {/* Eye */}
             
             {/* Antenna */}
             <rect x="12" y="0" width="1" height="3" fill="#4b5563" />
             <rect x="11" y="-1" width="3" height="1" fill="#ef4444" />
          </>
        );
      case 'zombie': // Zombie
        return (
          <>
             {/* Legs */}
             {state === CharacterState.RUN ? (
                <>
                  <rect x="8" y="22" width="4" height="6" fill="#374151" />
                  <rect x="14" y="24" width="4" height="8" fill="#374151" />
                </>
             ) : (
                <>
                   <rect x="9" y="24" width="3" height="8" fill="#374151" />
                   <rect x="13" y="24" width="3" height="8" fill="#374151" />
                </>
             )}
             {/* Body */}
             <rect x="6" y="14" width="13" height="10" fill="#60a5fa" rx="1" /> {/* Shirt */}
             <rect x="10" y="17" width="3" height="3" fill="#86efac" /> {/* Skin tear */}
             <rect x="5" y="14" width="4" height="9" fill="#86efac" rx="1" /> {/* Green Arm */}

             {/* Head */}
             <rect x="7" y="4" width="11" height="10" fill="#86efac" rx="1" /> {/* Green Skin */}
             <rect x="7" y="2" width="11" height="3" fill="#4b5563" rx="1"/> {/* Hair */}
             
             <rect x="9" y="8" width="2" height="2" fill="#000" />
             <rect x="14" y="7" width="3" height="3" fill="#000" /> {/* Big eye */}
             <rect x="15" y="8" width="1" height="1" fill="#fff" />
             
             <rect x="10" y="12" width="5" height="1" fill="#000" /> {/* Mouth */}
          </>
        );
      case 'astronaut': // Astronaut
        return (
          <>
             {/* Legs */}
             {state === CharacterState.RUN ? (
                <>
                  <rect x="8" y="22" width="4" height="6" fill="#e5e7eb" />
                  <rect x="14" y="24" width="4" height="8" fill="#e5e7eb" />
                </>
             ) : (
                <>
                   <rect x="9" y="24" width="3" height="8" fill="#e5e7eb" />
                   <rect x="13" y="24" width="3" height="8" fill="#e5e7eb" />
                </>
             )}
             {/* Body */}
             <rect x="5" y="14" width="15" height="10" fill="#f3f4f6" rx="2" />
             <rect x="10" y="16" width="5" height="4" fill="#60a5fa" /> {/* Chest panel */}
             <rect x="4" y="14" width="4" height="9" fill="#e5e7eb" rx="1" />

             {/* Head */}
             <rect x="5" y="2" width="15" height="12" fill="#f3f4f6" rx="3" />
             <rect x="7" y="4" width="11" height="8" fill="#1e40af" rx="2" /> {/* Visor */}
             <rect x="14" y="5" width="3" height="2" fill="#ffffff" opacity="0.5" /> {/* Glare */}
          </>
        );
      case 'business': // Default
      default:
        return (
          <>
            {/* Legs */}
            {state === CharacterState.RUN ? (
                <>
                  <rect x="8" y="22" width="4" height="6" fill="#1f2937" />
                  <rect x="14" y="24" width="4" height="8" fill="#1f2937" />
                </>
            ) : (
                <>
                   <rect x="9" y="24" width="3" height="8" fill="#1f2937" />
                   <rect x="13" y="24" width="3" height="8" fill="#1f2937" />
                </>
            )}
            
            {/* Body (Suit) */}
            <rect x="6" y="14" width="13" height="10" fill="#1e3a8a" rx="1" />
            <rect x="10" y="14" width="5" height="10" fill="#ffffff" /> {/* Shirt */}
            <rect x="11.5" y="14" width="2" height="7" fill="#ef4444" /> {/* Tie */}
            
            {/* Jacket details */}
            <rect x="5" y="14" width="4" height="9" fill="#1e3a8a" rx="1" /> {/* Back Arm */}
            
            {/* Head */}
            <rect x="7" y="4" width="11" height="10" fill="#fca5a5" rx="1" /> {/* Skin */}
            <rect x="7" y="2" width="11" height="4" fill="#3f2315" rx="1"/> {/* Hair Top */}
            <rect x="6" y="3" width="2" height="5" fill="#3f2315" /> {/* Hair Side */}
            
            {/* Glasses */}
            <g opacity="0.9">
                <rect x="8" y="7" width="3" height="2" fill="#000" />
                <rect x="13" y="7" width="3" height="2" fill="#000" />
                <rect x="11" y="8" width="2" height="1" fill="#000" />
            </g>
          </>
        );
    }
  };

  // Arm color logic based on skin
  let armColor = 'bg-blue-900';
  if (skinId === 'training') armColor = 'bg-red-600';
  if (skinId === 'security') armColor = 'bg-pink-700';
  if (skinId === 'bear') armColor = 'bg-gray-100';
  if (skinId === 'chef') armColor = 'bg-white';
  if (skinId === 'ninja') armColor = 'bg-gray-800';
  if (skinId === 'robot') armColor = 'bg-gray-500';
  if (skinId === 'zombie') armColor = 'bg-green-300';
  if (skinId === 'astronaut') armColor = 'bg-gray-200';

  return (
    <div 
      className={`relative w-12 h-16 pointer-events-none`}
      style={transformStyle}
    >
      {/* Aura Effect Layer */}
      {showAura && (
        <div className="absolute inset-0 -z-10 animate-pulse">
           <svg viewBox="0 0 24 32" className="w-full h-full opacity-60 blur-sm">
             <path d="M4 14 h16 v16 h-16 z" fill="#3b82f6" />
           </svg>
        </div>
      )}

      {/* Main Character Sprite */}
      <svg viewBox="0 0 24 32" className="w-full h-full drop-shadow-lg pixel-art overflow-visible">
        {renderSkin()}
        
        {state === CharacterState.FALL && (
          <path d="M18 6 C 20 6, 22 4, 22 2" stroke="#00ffff" strokeWidth="2" fill="none" className="animate-ping" /> 
        )}
      </svg>
      
      {/* Front Arm (HTML Element for smooth rotation) */}
      <div 
        className={`absolute top-[48%] left-[60%] w-[12%] h-[24%] rounded-sm origin-top ${armColor}`}
        style={{
            transform: state === CharacterState.RUN ? 'rotate(-60deg)' : 'rotate(0deg)',
            transition: 'transform 0.05s'
        }}
      />
    </div>
  );
};
