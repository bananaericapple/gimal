import React, { useMemo } from 'react';

interface HypnoticSpiralProps {
  isSpinning: boolean;
}

const HypnoticSpiral: React.FC<HypnoticSpiralProps> = ({ isSpinning }) => {
  // Create an Archimedean spiral path (memoized)
  const spiralPath = useMemo(() => {
    const center = 500;
    const spacing = 40;
    const startRadius = 0;
    const endRadius = 1200;
    const coils = endRadius / spacing;
    const rotation = 2 * Math.PI * coils;
    const steps = 3000;

    let path = `M ${center} ${center}`;

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const theta = t * rotation;
      const radius = startRadius + (endRadius - startRadius) * t;
      
      const x = center + radius * Math.cos(theta);
      const y = center + radius * Math.sin(theta);
      
      path += ` L ${x} ${y}`;
    }
    return path;
  }, []);

  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden bg-black pointer-events-none z-0">
      <svg
        viewBox="0 0 1000 1000"
        style={{ width: '400vmax', height: '400vmax' }}
        className={`opacity-90 overflow-visible hypnosis-spiral ${isSpinning ? 'spin' : 'spin-paused'}`}
      >
        <path
          d={spiralPath}
          fill="none"
          stroke="white"
          strokeWidth="62"
          strokeLinecap="round"
        />
        <path
          d={spiralPath}
          fill="none"
          stroke="black"
          strokeWidth="30"
          strokeLinecap="round"
          className="opacity-50"
        />
      </svg>
      
      <div className="absolute inset-0 bg-radial-gradient-vignette pointer-events-none"></div>
    </div>
  );
};

export default HypnoticSpiral;
