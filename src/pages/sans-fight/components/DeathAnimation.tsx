import React, { useEffect, useRef, useState } from 'react';

interface Shard {
  id: number;
  d: string; // SVG path
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  vRot: number;
  color: string;
}

interface DeathAnimationProps {
  onComplete: () => void;
}

const DeathAnimation: React.FC<DeathAnimationProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'CRACK' | 'SHATTER'>('CRACK');
  const [shards, setShards] = useState<Shard[]>([]);
  const requestRef = useRef<number>(0);

  // Initialize Animation
  useEffect(() => {
    // 1. Start with Crack phase
    const crackTimer = setTimeout(() => {
      startShatter();
    }, 1000); // Wait 1 second before shattering

    return () => clearTimeout(crackTimer);
  }, []);

  const startShatter = () => {
    setPhase('SHATTER');

    // Define 5 shards that roughly make up a heart shape
    // Center is 50,50
    const newShards: Shard[] = [
      { id: 1, d: "M 50 50 L 20 30 Q 25 10 50 25 Z", x: 0, y: 0, vx: -2, vy: -3, rotation: 0, vRot: -2, color: "#FF0000" }, // Top Left
      { id: 2, d: "M 50 50 L 50 25 Q 75 10 80 30 Z", x: 0, y: 0, vx: 2, vy: -3, rotation: 0, vRot: 2, color: "#FF0000" },  // Top Right
      { id: 3, d: "M 50 50 L 20 30 L 15 50 L 50 60 Z", x: 0, y: 0, vx: -3, vy: 1, rotation: 0, vRot: -1, color: "#FF0000" }, // Mid Left
      { id: 4, d: "M 50 50 L 80 30 L 85 50 L 50 60 Z", x: 0, y: 0, vx: 3, vy: 1, rotation: 0, vRot: 1, color: "#FF0000" },  // Mid Right
      { id: 5, d: "M 50 50 L 15 50 L 50 95 L 85 50 Z", x: 0, y: 0, vx: 0, vy: 2, rotation: 0, vRot: 0, color: "#FF0000" },   // Bottom
    ];

    setShards(newShards);
    
    // Start Physics Loop
    let animationFrame = 0;
    const animate = () => {
      setShards(prevShards => 
        prevShards.map(shard => ({
          ...shard,
          x: shard.x + shard.vx,
          y: shard.y + shard.vy,
          vy: shard.vy + 0.25, // Gravity
          rotation: shard.rotation + shard.vRot
        }))
      );
      
      animationFrame = requestAnimationFrame(animate);

      // Stop after 2 seconds (enough time to fall off screen)
      // Check bounding box or just time
    };
    
    requestRef.current = requestAnimationFrame(animate);

    // End animation callback
    setTimeout(() => {
      cancelAnimationFrame(requestRef.current);
      onComplete();
    }, 1500); 
  };

  useEffect(() => {
    return () => cancelAnimationFrame(requestRef.current);
  }, []);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <svg width="200" height="200" viewBox="0 0 100 100" className="overflow-visible">
        {phase === 'CRACK' ? (
          <g>
            {/* Full Heart */}
            <path 
              d="M 50 90 L 15 50 Q 15 15 50 25 Q 85 15 85 50 Z" 
              fill="#FF0000" 
            />
            {/* The Crack */}
            <path 
              d="M 50 25 L 45 35 L 55 45 L 45 55 L 55 65 L 50 90" 
              stroke="white" 
              strokeWidth="2" 
              fill="none" 
              className="animate-pulse"
            />
          </g>
        ) : (
          <g>
            {shards.map(shard => (
              <path
                key={shard.id}
                d={shard.d}
                fill={shard.color}
                style={{
                  transform: `translate(${shard.x}px, ${shard.y}px) rotate(${shard.rotation}deg)`,
                  transformOrigin: '50px 50px', // Rotate around center of heart initially
                }}
              />
            ))}
          </g>
        )}
      </svg>
      {/* Sound Effect Hint (Visual only) */}
      {phase === 'CRACK' && <div className="absolute top-0 text-gray-500 text-xs opacity-50">*CRACK*</div>}
      {phase === 'SHATTER' && <div className="absolute bottom-0 text-gray-500 text-xs opacity-50">*SHATTER*</div>}
    </div>
  );
};

export default DeathAnimation;
