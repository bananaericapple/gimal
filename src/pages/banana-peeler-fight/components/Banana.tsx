import React from 'react';

interface BananaProps {
  peelStage: number; // 0, 1, 2, 3
  isRegrowing: boolean;
  onTransitionEnd?: () => void;
  onClick: () => void;
}

export const Banana: React.FC<BananaProps> = ({ peelStage, isRegrowing, onTransitionEnd, onClick }) => {
  // We use SVG to draw a nice banana shape.
  // Logic: 
  // We have the "Fruit" (White) always visible (but potentially covered).
  // We have the "Skin" (Yellow).
  // To simulate "Peeling 3 times", we can use a clip-path or simple height manipulation of the skin layer.
  // To simulate "Regrowing from bottom", we can animate the height of the skin layer from 0% to 100%.
  
  // When Playing: Height is controlled by peelStage.
  // Stage 0: 100% height
  // Stage 1: 66% height
  // Stage 2: 33% height
  // Stage 3: 0% height
  
  // When Regrowing: Height transitions from 0% to 100% over 15s.

  let skinHeight = '100%';
  let transitionStyle = 'height 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'; // Bouncy peel effect

  if (isRegrowing) {
    skinHeight = '100%';
    transitionStyle = 'height 15s linear'; // The 15s regrow effect
  } else {
    // Calculate height based on stage
    // Stage 0 = 100%, Stage 3 = 0%
    const percentage = 100 - (peelStage * (100 / 3));
    skinHeight = `${percentage}%`;
  }

  return (
    <div 
      className="relative w-64 h-96 sm:w-80 sm:h-[500px] cursor-pointer group select-none"
      onClick={!isRegrowing ? onClick : undefined}
    >
      {/* Floating Animation Container */}
      <div className={`w-full h-full relative ${!isRegrowing ? 'animate-float' : ''}`}>
        
        {/* SHADOW */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-40 h-8 bg-black/10 rounded-[100%] blur-md transition-all duration-300 group-active:scale-90 group-hover:bg-black/20" />

        {/* FRUIT (The edible part) - Static Background Layer */}
        <div className="absolute inset-0 z-10 flex justify-center items-center">
             <svg viewBox="0 0 200 300" className="w-full h-full drop-shadow-xl">
                {/* Banana Curve Path */}
                <path 
                    d="M100,20 C140,20 160,100 160,150 C160,220 130,280 100,280 C70,280 40,220 40,150 C40,100 60,20 100,20" 
                    fill="#FDF6D8" // Creamy fruit color
                />
            </svg>
        </div>

        {/* SKIN CONTAINER - This acts as a mask/overlay that shrinks/grows */}
        <div className="absolute bottom-[20px] left-0 right-0 z-20 flex justify-center items-end overflow-hidden mx-auto"
             style={{ 
                 height: 'calc(100% - 20px)', // Align with SVG
                 width: '100%',
                 pointerEvents: 'none' // Let clicks pass through if needed, but the parent handles click
             }}>
             
             {/* THE ACTUAL SKIN MASK */}
             <div 
                className="w-full flex justify-center items-end overflow-hidden"
                style={{
                    height: skinHeight,
                    transition: transitionStyle
                }}
                onTransitionEnd={() => {
                    // Only trigger onTransitionEnd if we were regrowing and reached full height
                    if (isRegrowing && skinHeight === '100%') {
                        onTransitionEnd?.();
                    }
                }}
             >
                 {/* The Skin Visual - Fixed size inside the shrinking container */}
                 <div className="w-64 h-96 sm:w-80 sm:h-[500px] flex justify-center items-center shrink-0">
                    <svg viewBox="0 0 200 300" className="w-full h-full">
                         {/* Stem */}
                         <path d="M95,5 L105,5 L108,25 L92,25 Z" fill="#654321" />
                        {/* Skin Body */}
                        <path 
                            d="M100,20 C140,20 160,100 160,150 C160,220 130,280 100,280 C70,280 40,220 40,150 C40,100 60,20 100,20" 
                            fill="#FFE135" 
                            stroke="#E6C229"
                            strokeWidth="2"
                        />
                        {/* Details/Spots */}
                        <circle cx="80" cy="100" r="2" fill="#8B5A2B" opacity="0.4" />
                        <circle cx="130" cy="200" r="3" fill="#8B5A2B" opacity="0.4" />
                        <circle cx="60" cy="240" r="2" fill="#8B5A2B" opacity="0.4" />
                        
                        {/* Visual lines for segments to suggest where it peels */}
                        <path d="M100,20 Q120,80 120,150" fill="none" stroke="#E6C229" strokeWidth="2" opacity="0.6"/>
                        <path d="M100,20 Q80,80 80,150" fill="none" stroke="#E6C229" strokeWidth="2" opacity="0.6"/>
                    </svg>
                 </div>
             </div>
        </div>

        {/* CLICK HINT / Face */}
        {!isRegrowing && peelStage < 3 && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none opacity-80">
                 {/* Cute Face on the skin */}
                 <div className="flex gap-4">
                    <div className="w-3 h-3 bg-black rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                    <div className="w-3 h-3 bg-black rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                 </div>
                 <div className="w-8 h-4 border-b-4 border-black rounded-full mt-1 mx-auto"></div>
            </div>
        )}

      </div>
    </div>
  );
};