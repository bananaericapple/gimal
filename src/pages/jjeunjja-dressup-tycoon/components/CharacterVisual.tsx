
import React from 'react';
import { Character, Wardrobe } from '../types';
import { ALL_ITEMS } from '../constants';

interface Props {
  character: Character;
  equipped: Wardrobe;
  className?: string;
}

const CharacterVisual: React.FC<Props> = ({ character, equipped, className = '' }) => {
  const getItem = (id: string | null) => ALL_ITEMS.find((i) => i.id === id);

  const hair = getItem(equipped.hair);
  const top = getItem(equipped.top);
  const bottom = getItem(equipped.bottom);
  const outer = getItem(equipped.outer);
  const socks = getItem(equipped.socks);
  const shoes = getItem(equipped.shoes);

  // --- COORDINATE SYSTEM ---
  // Canvas: 288 x 450
  // Center X: 144
  const CX = 144;
  
  // Anchor Points (Fixed)
  const ANCHOR = {
    HEAD: 100,
    NECK: 145,
    SHOULDER: 165,
    WAIST: 280,
    KNEE: 350,
    FOOT: 420
  };

  // --- CLOTHING PATHS (Designed to fit 1:1 without complex scaling) ---
  
  // T-Shirt: Anchored at Shoulder (165)
  // Drawn locally relative to shoulder center (0,0) -> Translated to (144, 165)
  const ShirtPath = ({ color }: { color: string }) => (
    <path 
      d="M-40 -15 Q0 -5 40 -15 L65 5 L55 35 L40 25 L40 125 L-40 125 L-40 25 L-55 35 L-65 5 Z" 
      fill={color} 
      className={`stroke-black stroke-2`}
      strokeLinejoin="round"
    />
  );

  // Pants: Anchored at Waist (280)
  // Drawn locally relative to waist center (0,0) -> Translated to (144, 280)
  const PantsPath = ({ color }: { color: string }) => (
    <path 
      d="M-35 -10 L35 -10 L40 30 L35 130 L10 130 L5 50 L-5 50 L-10 130 L-35 130 L-40 30 Z" 
      fill={color} 
      className={`stroke-black stroke-2`}
      strokeLinejoin="round"
    />
  );

  // Coat/Outer: Anchored at Shoulder (165) - Slightly larger
  const OuterPath = ({ color }: { color: string }) => (
    <path 
      d="M-45 -15 Q0 -5 45 -15 L75 15 L65 45 L50 35 L50 160 L-50 160 L-50 35 L-65 45 L-75 15 Z" 
      fill={color} 
      className={`stroke-black stroke-2`}
      strokeLinejoin="round"
    />
  );

  // Shoes: Anchored at Foot (420)
  const ShoePath = ({ color, isRight }: { color: string; isRight?: boolean }) => (
    <path 
      d={`M-12 0 Q-12 -15 0 -15 Q12 -15 12 0 L15 8 L-15 8 Z`}
      transform={isRight ? "scale(-1, 1)" : ""}
      fill={color} 
      className={`stroke-black stroke-2`}
      strokeLinejoin="round"
    />
  );
  
  // Hair: Anchored at Head (100)
  const HairPath = ({ color }: { color: string }) => (
    <path
        d="M-40 10 C-40 -30 -20 -50 0 -50 C20 -50 40 -30 40 10 C45 30 40 50 35 40 L35 10 L-35 10 L-35 40 C-40 50 -45 30 -40 10 Z"
        fill={color}
        className={`stroke-black stroke-2`}
        strokeLinejoin="round"
    />
  );

  // --- RENDER HELPERS ---

  const renderBaseBody = () => {
    const isSkeleton = character.visualType === 'skeleton';
    const isHimalaya = character.visualType === 'himalaya';
    const isHockey = character.visualType === 'hockey';
    const isPotato = character.visualType === 'potato';

    // Skin Color Logic
    let skinColor = "#fcd3b1"; // Default Flesh
    if (isSkeleton) skinColor = "#e5e7eb"; // Bone
    if (isHimalaya && !outer) skinColor = "#93c5fd"; // Cold Blue (when jacket off)
    if (isPotato) skinColor = "#d4a373"; // Potato Skin

    // Body Width Logic
    let bodyWidth = 70;
    if (isSkeleton) bodyWidth = 20; // Spine
    if (isHockey) bodyWidth = 90; // Muscular
    if (isHimalaya && outer) bodyWidth = 110; // Puffy (Base state with coat)

    // Render Logic
    return (
      <g>
        {/* LEGS (Always drawn, maybe covered by pants) */}
        {!bottom && (
           <g>
             <rect x={CX - 30} y={ANCHOR.WAIST} width={20} height={ANCHOR.FOOT - ANCHOR.WAIST} fill={skinColor} stroke="black" strokeWidth="2" rx={isSkeleton ? 8 : 0}/>
             <rect x={CX + 10} y={ANCHOR.WAIST} width={20} height={ANCHOR.FOOT - ANCHOR.WAIST} fill={skinColor} stroke="black" strokeWidth="2" rx={isSkeleton ? 8 : 0}/>
           </g>
        )}
        {/* If pants are equipped, we might want to hide legs or just draw ankles? 
            For simplicity, legs are drawn behind. */}
        
        {/* TORSO */}
        {!top && (
            <g>
                {/* Neck */}
                <rect x={CX - 10} y={ANCHOR.HEAD} width={20} height={60} fill={skinColor} stroke="black" strokeWidth={isSkeleton?1:2} />
                
                {/* Main Body */}
                {isSkeleton ? (
                    // Skeleton Ribs
                    <g>
                        <rect x={CX - 10} y={ANCHOR.SHOULDER} width={20} height={100} fill={skinColor} stroke="black" />
                        <path d={`M${CX-30} ${ANCHOR.SHOULDER+10} Q${CX} ${ANCHOR.SHOULDER+25} ${CX+30} ${ANCHOR.SHOULDER+10}`} fill="none" stroke="black" strokeWidth="3"/>
                        <path d={`M${CX-25} ${ANCHOR.SHOULDER+30} Q${CX} ${ANCHOR.SHOULDER+45} ${CX+25} ${ANCHOR.SHOULDER+30}`} fill="none" stroke="black" strokeWidth="3"/>
                        <path d={`M${CX-20} ${ANCHOR.SHOULDER+50} Q${CX} ${ANCHOR.SHOULDER+65} ${CX+20} ${ANCHOR.SHOULDER+50}`} fill="none" stroke="black" strokeWidth="3"/>
                        {/* Pelvis */}
                        <path d={`M${CX-25} ${ANCHOR.WAIST-10} L${CX+25} ${ANCHOR.WAIST-10} L${CX} ${ANCHOR.WAIST+10} Z`} fill={skinColor} stroke="black" />
                    </g>
                ) : (
                    // Normal / Muscular Body
                    <path 
                        d={`M${CX - bodyWidth/2} ${ANCHOR.SHOULDER} L${CX + bodyWidth/2} ${ANCHOR.SHOULDER} L${CX + bodyWidth/2 - 5} ${ANCHOR.WAIST} L${CX - bodyWidth/2 + 5} ${ANCHOR.WAIST} Z`} 
                        fill={skinColor} 
                        stroke="black" 
                        strokeWidth="2"
                    />
                )}
                
                {/* Hockey Muscles / Potato Details */}
                {isHockey && !top && (
                    <path d={`M${CX-30} ${ANCHOR.SHOULDER+40} Q${CX} ${ANCHOR.SHOULDER+60} ${CX+30} ${ANCHOR.SHOULDER+40}`} fill="none" stroke="black" strokeOpacity="0.2" strokeWidth="2" />
                )}
                
                {/* Himalaya Shivering Effect (Lines) */}
                {isHimalaya && !top && (
                    <g stroke="#3b82f6" strokeWidth="1" strokeDasharray="2 2">
                         <path d={`M${CX-40} ${ANCHOR.SHOULDER-20} L${CX-50} ${ANCHOR.SHOULDER-30}`} />
                         <path d={`M${CX+40} ${ANCHOR.SHOULDER-20} L${CX+50} ${ANCHOR.SHOULDER-30}`} />
                    </g>
                )}
            </g>
        )}

        {/* HEAD BASE */}
        {isPotato ? (
             <ellipse cx={CX} cy={ANCHOR.HEAD} rx="50" ry="60" fill="#d4a373" stroke="#78350f" strokeWidth="3" />
        ) : isSkeleton ? (
             <path d={`M${CX-25} ${ANCHOR.HEAD-35} Q${CX} ${ANCHOR.HEAD-55} ${CX+25} ${ANCHOR.HEAD-35} L${CX+20} ${ANCHOR.HEAD+15} Q${CX} ${ANCHOR.HEAD+25} ${CX-20} ${ANCHOR.HEAD+15} Z`} fill="#f3f4f6" stroke="black" strokeWidth="2" />
        ) : (
             <circle cx={CX} cy={ANCHOR.HEAD} r="35" fill={skinColor} stroke="black" strokeWidth="2" />
        )}

      </g>
    );
  };

  const renderFace = () => {
    // Face Group Transform
    const Y_FACE = ANCHOR.HEAD;
    
    switch (character.visualType) {
      case 'hockey': 
        return (
          <g transform={`translate(${CX}, ${Y_FACE})`}>
            {/* Eyes */}
            <circle cx="-12" cy="0" r="3" fill="black" />
            <circle cx="12" cy="0" r="3" fill="black" />
            {/* Eyebrows (Angry/Determined) */}
            <line x1="-18" y1="-8" x2="-5" y2="-3" stroke="black" strokeWidth="2" />
            <line x1="18" y1="-8" x2="5" y2="-3" stroke="black" strokeWidth="2" />
            {/* Nose */}
            <path d="M-2 8 L0 12 L2 8" fill="none" stroke="black" strokeWidth="2" />
            {/* Mouth (Missing tooth) */}
            <path d="M-10 22 Q0 28 10 22" fill="none" stroke="black" strokeWidth="2" />
            <rect x="2" y="22" width="4" height="4" fill="black" />
          </g>
        );
      case 'skeleton':
        return (
          <g transform={`translate(${CX}, ${Y_FACE + 5})`}>
             <circle cx="-12" cy="-2" r="8" fill="#111" />
             <circle cx="12" cy="-2" r="8" fill="#111" />
             <path d="M0 10 L-4 16 L4 16 Z" fill="#111" />
             <path d="M-15 25 Q0 30 15 25" fill="none" stroke="black" strokeWidth="2" />
             {[ -10, -3, 3, 10 ].map(x => <line key={x} x1={x} y1={22} x2={x} y2={28} stroke="black" strokeWidth="1.5" />)}
          </g>
        );
      case 'potato':
        return (
          <g transform={`translate(${CX}, ${Y_FACE})`}>
            <g transform="translate(-15, -5)">
               <circle r="10" fill="white" stroke="black" strokeWidth="2" />
               <circle r="3" fill="black" />
            </g>
            <g transform="translate(15, -5)">
               <circle r="12" fill="white" stroke="black" strokeWidth="2" />
               <circle r="3" fill="black" />
            </g>
            <path d="M-15 25 Q0 40 15 25" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" />
            {/* Potato dots */}
            <circle cx="-30" cy="10" r="1" fill="#78350f" opacity="0.5" />
            <circle cx="30" cy="-20" r="1" fill="#78350f" opacity="0.5" />
          </g>
        );
      case 'himalaya':
        return (
          <g transform={`translate(${CX}, ${Y_FACE})`}>
             {/* If wearing top (padding), he is mysterious. If not, he is scared/cold */}
             {outer ? (
                 <g>
                     <rect x="-40" y="-10" width="80" height="20" fill="#111" opacity="0.8" rx="5" />
                     <circle cx="-15" cy="0" r="5" fill="#3b82f6" className="animate-pulse" />
                     <circle cx="15" cy="0" r="5" fill="#3b82f6" className="animate-pulse" />
                 </g>
             ) : (
                 <g>
                     <circle cx="-10" cy="-2" r="2" fill="black" />
                     <circle cx="10" cy="-2" r="2" fill="black" />
                     <path d="M-5 15 Q0 10 5 15" fill="none" stroke="black" strokeWidth="2" />
                     <path d="M-40 0 L-20 0" stroke="#3b82f6" strokeWidth="2" strokeDasharray="2 2" />
                     <text x="25" y="-10" fontSize="20">🥶</text>
                 </g>
             )}
          </g>
        );
      default:
        return null;
    }
  };

  // --- COMPOSITION ---

  return (
    <div className={`relative w-[288px] h-[450px] bg-white rounded-3xl border-4 border-gray-100 shadow-2xl overflow-hidden ${className}`}>
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white pointer-events-none"></div>

        <svg viewBox="0 0 288 450" className="absolute inset-0 w-full h-full">
            
            {/* 1. BASE BODY & HEAD */}
            {renderBaseBody()}

            {/* 2. SOCKS */}
            {socks && (
                <g>
                    <rect x={CX - 30} y={ANCHOR.FOOT - 40} width={20} height={40} fill={socks.color} />
                    <rect x={CX + 10} y={ANCHOR.FOOT - 40} width={20} height={40} fill={socks.color} />
                </g>
            )}

            {/* 3. SHOES (Anchor Foot) */}
            {shoes && (
                <g>
                    <g transform={`translate(${CX-20}, ${ANCHOR.FOOT})`}>
                        <ShoePath color={shoes.color} isRight={false} />
                    </g>
                    <g transform={`translate(${CX+20}, ${ANCHOR.FOOT})`}>
                        <ShoePath color={shoes.color} isRight={true} />
                    </g>
                </g>
            )}

            {/* 4. BOTTOMS (Anchor Waist) */}
            {bottom && (
                <g transform={`translate(${CX}, ${ANCHOR.WAIST})`}>
                    <PantsPath color={bottom.color} />
                </g>
            )}

            {/* 5. TOPS (Anchor Shoulder) */}
            {top && (
                <g transform={`translate(${CX}, ${ANCHOR.SHOULDER})`}>
                    <ShirtPath color={top.color} />
                </g>
            )}

            {/* 6. OUTER (Anchor Shoulder) */}
            {outer && (
                <g transform={`translate(${CX}, ${ANCHOR.SHOULDER})`}>
                    <OuterPath color={outer.color} />
                </g>
            )}

            {/* 7. FACE (Always on top of clothes necklines) */}
            {renderFace()}

            {/* 8. HAIR (Anchor Head Top ~ 65) */}
            {hair && (
                <g transform={`translate(${CX}, ${ANCHOR.HEAD - 35})`}>
                    <HairPath color={hair.color} />
                </g>
            )}

            {/* 9. PROPS (Character Specific) */}
            {character.visualType === 'hockey' && !top && (
                 <g transform={`translate(${CX-60}, ${ANCHOR.WAIST}) rotate(-15)`}>
                    <rect width="10" height="150" fill="#9ca3af" stroke="black" strokeWidth="2"/>
                    <path d="M0 150 L40 160 L45 140 L10 130 Z" fill="black" />
                 </g>
            )}
             {character.visualType === 'potato' && !top && (
                 <g transform={`translate(${CX+70}, ${ANCHOR.SHOULDER}) rotate(15)`}>
                    <path d="M0 0 L10 80 L20 75 L10 -5 Z" fill="#d97706" stroke="black" strokeWidth="2" />
                 </g>
            )}

        </svg>
    </div>
  );
};

export default CharacterVisual;
