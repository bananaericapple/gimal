import React from 'react';
import { PIPE_WIDTH, PIPE_GAP, GAME_HEIGHT, GROUND_HEIGHT } from '../constants';

interface PipeProps {
  x: number;
  topHeight: number;
}

const Pipe: React.FC<PipeProps> = ({ x, topHeight }) => {
  const bottomPipeTop = topHeight + PIPE_GAP;
  const bottomPipeHeight = GAME_HEIGHT - GROUND_HEIGHT - bottomPipeTop;

  return (
    <>
      {/* Top Pipe */}
      <div
        className="absolute z-10 flex flex-col items-center justify-end"
        style={{
          left: x,
          top: 0,
          width: PIPE_WIDTH,
          height: topHeight,
        }}
      >
        <div className="w-full h-full bg-green-500 border-x-4 border-black relative overflow-hidden">
            {/* Highlights */}
            <div className="absolute top-0 left-2 w-2 h-full bg-green-300 opacity-50"></div>
            <div className="absolute top-0 right-2 w-1 h-full bg-green-800 opacity-30"></div>
        </div>
        {/* Cap */}
        <div className="w-[110%] h-8 bg-green-500 border-4 border-black mb-0 z-20 relative">
             <div className="absolute top-0 left-2 w-2 h-full bg-green-300 opacity-50"></div>
        </div>
      </div>

      {/* Bottom Pipe */}
      <div
        className="absolute z-10 flex flex-col items-center justify-start"
        style={{
          left: x,
          top: bottomPipeTop,
          width: PIPE_WIDTH,
          height: bottomPipeHeight,
        }}
      >
        {/* Cap */}
        <div className="w-[110%] h-8 bg-green-500 border-4 border-black mt-0 z-20 relative">
            <div className="absolute top-0 left-2 w-2 h-full bg-green-300 opacity-50"></div>
        </div>
        <div className="w-full h-full bg-green-500 border-x-4 border-black relative overflow-hidden">
            <div className="absolute top-0 left-2 w-2 h-full bg-green-300 opacity-50"></div>
            <div className="absolute top-0 right-2 w-1 h-full bg-green-800 opacity-30"></div>
        </div>
      </div>
    </>
  );
};

export default Pipe;