
import React from 'react';
import { Target } from '../types';

interface TargetProps {
  target: Target;
  onHit: (id: string) => void;
}

const TargetComponent: React.FC<TargetProps> = ({ target, onHit }) => {
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onHit(target.id);
      }}
      className="absolute rounded-full cursor-crosshair transition-transform active:scale-95 group"
      style={{
        left: `${target.x}%`,
        top: `${target.y}%`,
        width: `${target.size}px`,
        height: `${target.size}px`,
        transform: 'translate(-50%, -50%)',
        zIndex: 10
      }}
    >
      <div className="absolute inset-0 bg-cyan-400 rounded-full shadow-[0_0_15px_rgba(34,211,238,0.6)] group-hover:bg-cyan-300 transition-colors"></div>
      <div className="absolute inset-0 bg-cyan-400 rounded-full animate-ping-custom opacity-20"></div>
      <div className="absolute inset-[25%] bg-white rounded-full opacity-30"></div>
    </div>
  );
};

export default TargetComponent;
