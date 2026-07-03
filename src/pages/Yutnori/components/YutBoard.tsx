
import React from 'react';
import { BOARD_NODES } from '../constants';
import { Piece, Player } from '../types';

interface YutBoardProps {
  pieces: Piece[];
  players: Player[];
  onNodeClick?: (nodeId: number) => void;
  onDropPiece?: (nodeId: number) => void;
  validTargets?: number[];
  onDragStartPiece?: (pieceId: number) => void;
}

const YutBoard: React.FC<YutBoardProps> = ({ 
  pieces, 
  players, 
  onNodeClick, 
  onDropPiece, 
  validTargets = [],
  onDragStartPiece
}) => {
  return (
    <div className="relative w-full aspect-square bg-[#fdf6e3] rounded-[3rem] shadow-[0_30px_60px_rgba(0,0,0,0.3)] p-4 overflow-hidden border-[16px] border-[#3e2723] select-none">
      {/* 배경 장식 */}
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(circle_at_center,_transparent_0%,_#000_100%)]"></div>
      
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none">
        <g stroke="#795548" strokeWidth="0.6" fill="none" strokeLinecap="round" strokeDasharray="1.5,2.5">
          <path d="M 90 90 L 90 10 L 10 10 L 10 90 Z" />
          <path d="M 90 10 L 10 90" />
          <path d="M 10 10 L 90 90" />
        </g>
        {BOARD_NODES.map((node) => (
          <g key={`node-bg-${node.id}`}>
            <circle
              cx={node.x}
              cy={node.y}
              r={node.type === 'CORNER' || node.type === 'START' || node.type === 'CENTER' ? 5 : 3.8}
              className="fill-amber-50 stroke-[#4e342e] stroke-[1]"
            />
            {node.type === 'START' && (
               <text x={node.x} y={node.y} textAnchor="middle" dy=".35em" fontSize="3.5" className="fill-[#3e2723] font-black">시작</text>
            )}
          </g>
        ))}
      </svg>

      {/* 말 및 상호작용 레이어 통합 */}
      <div className="absolute inset-0 w-full h-full z-10">
        {BOARD_NODES.map(node => {
          const nodePieces = pieces.filter(p => p.position === node.id && !p.isFinished);
          const isValidTarget = validTargets.includes(node.id);
          const topPiece = nodePieces.length > 0 ? nodePieces[0] : null;
          const owner = topPiece ? players.find(p => p.id === topPiece.ownerId) : null;

          return (
            <div 
              key={`node-cell-${node.id}`}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
              style={{ 
                left: `${node.x}%`, 
                top: `${node.y}%`, 
                width: '14%', 
                height: '14%',
                zIndex: isValidTarget ? 50 : 20
              }}
              onDragOver={(e) => {
                if (isValidTarget) {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                }
              }}
              onDrop={(e) => {
                e.preventDefault();
                if (isValidTarget) onDropPiece?.(node.id);
              }}
            >
              {/* 도착 가능 위치 강조 (말 뒤에 배치) */}
              {isValidTarget && (
                <div className="absolute inset-0 bg-orange-500/30 rounded-full animate-pulse border-4 border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.6)]" />
              )}

              {/* 말 렌더링 (가장 위) */}
              {topPiece && (
                <div 
                  className={`relative w-4/5 h-4/5 rounded-full border-[4px] border-white shadow-xl flex items-center justify-center cursor-grab active:cursor-grabbing transition-transform hover:scale-110 active:scale-90 z-30`}
                  style={{ backgroundColor: owner?.color || '#ccc' }}
                  draggable="true"
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', topPiece.id.toString());
                    onDragStartPiece?.(topPiece.id);
                    // 드래그 고스트 이미지 처리
                    const target = e.currentTarget as HTMLElement;
                    setTimeout(() => target.style.opacity = '0.4', 0);
                  }}
                  onDragEnd={(e) => {
                    const target = e.currentTarget as HTMLElement;
                    target.style.opacity = '1';
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-white/20 rounded-full" />
                  {nodePieces.length > 1 && (
                    <div className="absolute -top-2 -right-2 w-7 h-7 bg-white rounded-full border-2 border-slate-300 shadow-md flex items-center justify-center text-[14px] font-black text-slate-800">
                      {nodePieces.length}
                    </div>
                  )}
                </div>
              )}

              {/* 빈 공간 클릭 핸들러 */}
              {!topPiece && (
                <div 
                  className="absolute inset-0 rounded-full cursor-pointer" 
                  onClick={() => onNodeClick?.(node.id)}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default YutBoard;
