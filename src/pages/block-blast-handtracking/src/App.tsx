import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Block, getRandomBlocks, getBlockSize } from './blocks';
import { BOARD_SIZE, createEmptyBoard, canPlaceBlock, placeBlock, clearLines, isAnyMoveAvailable, BoardState } from './gameLogic';
import { useInteractionManager, PointerState } from './useInteractionManager';
import { RefreshCw, Hand, MousePointer2 } from 'lucide-react';

const GenericBlock = ({ block, cellSizeVar }: { block: Block, cellSizeVar: string }) => {
  const { width, height } = getBlockSize(block);
  return (
    <div 
      className="relative pointer-events-none" 
      style={{
        width: `calc(${width} * var(${cellSizeVar}) + ${width > 1 ? width - 1 : 0} * var(--board-gap, 4px))`, 
        height: `calc(${height} * var(${cellSizeVar}) + ${height > 1 ? height - 1 : 0} * var(--board-gap, 4px))`,
      }}
    >
      {block.cells.map((cell, i) => (
        <div
          key={i}
          className={`absolute block-cell block-${block.color}`}
          style={{
            left: `calc(${cell.x} * (var(${cellSizeVar}) + var(--board-gap, 4px)))`,
            top: `calc(${cell.y} * (var(${cellSizeVar}) + var(--board-gap, 4px)))`,
            width: `var(${cellSizeVar})`,
            height: `var(${cellSizeVar})`
          }}
        />
      ))}
    </div>
  );
};

export default function App() {
  const [board, setBoard] = useState<BoardState>(createEmptyBoard());
  const [currentBlocks, setCurrentBlocks] = useState<(Block | null)[]>(getRandomBlocks());
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem('blockBlastScore') || '0', 10));
  const [gameOver, setGameOver] = useState(false);
  const [comboCount, setComboCount] = useState(0);
  
  // Animation states
  const [clearingLines, setClearingLines] = useState<{rows: number[], cols: number[]} | null>(null);
  const [praise, setPraise] = useState<{id: number, text: string, subtext: string} | null>(null);

  const { cameraVideoRef, cameraCanvasRef, pointerStateRef, error, onFrameRef, startCamera } = useInteractionManager();

  // Refs to sync state with animation frame
  const boardRef = useRef(board);
  const blocksRef = useRef(currentBlocks);
  const comboRef = useRef(comboCount);
  const isProcessingRef = useRef(false);
  
  const draggedBlockRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const slotRefs = useRef<(HTMLDivElement|null)[]>([]);

  const grabbedSlotRef = useRef<number | null>(null);
  const prevIsGrabbingRef = useRef(false);
  const hoverCellRef = useRef<{r:number, c:number} | null>(null);

  useEffect(() => { boardRef.current = board; }, [board]);
  useEffect(() => { blocksRef.current = currentBlocks; }, [currentBlocks]);
  useEffect(() => { comboRef.current = comboCount; }, [comboCount]);
  useEffect(() => { localStorage.setItem('blockBlastScore', highScore.toString()); }, [highScore]);

  const clearHighlights = useCallback(() => {
    document.querySelectorAll('.highlight-valid').forEach(el => el.classList.remove('highlight-valid'));
    document.querySelectorAll('.highlight-invalid').forEach(el => el.classList.remove('highlight-invalid'));
  }, []);

  const drawHighlights = useCallback((block: Block, startRow: number, startCol: number, valid: boolean) => {
    for (const cell of block.cells) {
      const r = startRow + cell.y;
      const c = startCol + cell.x;
      const el = document.querySelector(`[data-row="${r}"][data-col="${c}"]`);
      if (el) {
        if (valid) el.classList.add('highlight-valid');
        else el.classList.add('highlight-invalid');
      }
    }
  }, []);

  const triggerPraise = (lines: number, combo: number) => {
    let text = "Nice!";
    if (lines === 2) text = ["Great!", "Awesome!"][Math.floor(Math.random() * 2)];
    else if (lines === 3) text = ["Amazing!", "Brilliant!"][Math.floor(Math.random() * 2)];
    else if (lines >= 4) text = ["Excellent!", "Unbelievable!"][Math.floor(Math.random() * 2)];

    let subtext = "";
    if (combo >= 4) subtext = "Combo Master!";
    else if (combo >= 2) subtext = `Combo x${combo}`;
    else if (lines >= 3) subtext = "Multi Clear!";

    setPraise({ id: Date.now(), text, subtext });
  };

  const handlePlaceBlock = useCallback((slotIdx: number, r: number, c: number) => {
    if (isProcessingRef.current) return;
    
    const block = blocksRef.current[slotIdx];
    if (!block) return;

    isProcessingRef.current = true;
    let { newBoard } = placeBlock(boardRef.current, block, r, c);
    
    const { newBoard: clearedBoard, linesCleared, clearedRows, clearedCols } = clearLines(newBoard);
    
    // Calculate Score & Combo
    let newCombo = comboRef.current;
    if (linesCleared > 0) {
      newCombo += 1;
    } else {
      newCombo = 0;
    }

    let basePoints = block.cells.length * 10;
    let clearPoints = 0;
    if (linesCleared === 1) clearPoints = 100;
    else if (linesCleared === 2) clearPoints = 250;
    else if (linesCleared === 3) clearPoints = 400;
    else if (linesCleared >= 4) clearPoints = 600;

    let multiplier = 1.0;
    if (newCombo === 2) multiplier = 1.2;
    else if (newCombo === 3) multiplier = 1.5;
    else if (newCombo >= 4) multiplier = 2.0;

    const totalPoints = Math.floor(basePoints + (clearPoints * multiplier));

    // Remove placed block from slots
    const newBlocks = [...blocksRef.current];
    newBlocks[slotIdx] = null;
    let nextBlocks = newBlocks;
    if (newBlocks.every(b => b === null)) {
      nextBlocks = getRandomBlocks();
    }
    
    setCurrentBlocks(nextBlocks);
    setBoard(newBoard); // Show placed block immediately
    
    if (linesCleared > 0) {
      setComboCount(newCombo);
      setClearingLines({ rows: clearedRows, cols: clearedCols });
      triggerPraise(linesCleared, newCombo);

      // Wait for flash animation then actually clear the lines
      setTimeout(() => {
        setBoard(clearedBoard);
        setClearingLines(null);
        setScore(s => {
          const ns = s + totalPoints;
          if (ns > highScore) setHighScore(ns);
          return ns;
        });
        checkGameOver(clearedBoard, nextBlocks);
        isProcessingRef.current = false;
      }, 300);
    } else {
      setComboCount(0);
      setScore(s => {
        const ns = s + totalPoints;
        if (ns > highScore) setHighScore(ns);
        return ns;
      });
      checkGameOver(newBoard, nextBlocks);
      isProcessingRef.current = false;
    }
  }, [highScore]);

  const checkGameOver = useCallback((b: BoardState, blks: (Block | null)[]) => {
    if (!isAnyMoveAvailable(b, blks)) {
      setGameOver(true);
    }
  }, []);

  const getBoardRectAndCellSize = () => {
    const boardEl = document.getElementById('board-container');
    if (!boardEl) return null;
    const rect = boardEl.getBoundingClientRect();
    
    // Fallbacks if css variables fail
    const rootStyle = getComputedStyle(document.documentElement);
    const cellSize = parseInt(rootStyle.getPropertyValue('--cell-size')) || 40;
    const gap = parseInt(rootStyle.getPropertyValue('--board-gap')) || 4;
    return { rect, totalCellSize: cellSize + gap, cellSize };
  };

  useEffect(() => {
    onFrameRef.current = (pointer: PointerState) => {
      if (cursorRef.current) {
         if (pointer.isActive) {
           cursorRef.current.style.display = 'block';
           cursorRef.current.style.left = `${pointer.x}px`;
           cursorRef.current.style.top = `${pointer.y}px`;
           cursorRef.current.className = `fixed z-50 rounded-full pointer-events-none transform -translate-x-1/2 -translate-y-1/2 transition-all duration-75 ${pointer.isGrabbing ? 'w-5 h-5 bg-[var(--color-accent)] opacity-80 scale-125 shadow-[0_0_15px_var(--color-accent)]' : 'w-3 h-3 bg-white opacity-40'}`;
         } else {
           cursorRef.current.style.display = 'none';
         }
      }

      if (pointer.isGrabbing && !prevIsGrabbingRef.current && !gameOver && !isProcessingRef.current) {
        // Find slot
        const el = document.elementFromPoint(pointer.x, pointer.y);
        const slotEl = el?.closest('[data-slot-index]');
        if (slotEl) {
          const idx = parseInt(slotEl.getAttribute('data-slot-index') || '-1', 10);
          if (idx !== -1 && blocksRef.current[idx] !== null) {
            grabbedSlotRef.current = idx;
            if (slotRefs.current[idx]) slotRefs.current[idx]!.style.transform = 'scale(0.9)';
            if (slotRefs.current[idx]) slotRefs.current[idx]!.style.opacity = '0.4';
          }
        }
      }

      if (grabbedSlotRef.current !== null && draggedBlockRef.current) {
        draggedBlockRef.current.style.display = 'block';
        
        // Exact center rendering
        draggedBlockRef.current.style.left = `${pointer.x}px`;
        draggedBlockRef.current.style.top = `${pointer.y}px`;

        const block = blocksRef.current[grabbedSlotRef.current];
        
        if (block) {
            const boardData = getBoardRectAndCellSize();
            let newHoverCell = null;
            
            if (boardData) {
               const { rect, totalCellSize, cellSize } = boardData;
               const { width, height } = getBlockSize(block);
               
               // The visual center of the dragged block is exactly at pointer.x, pointer.y (due to translate(-50%, -50%))
               // Calculate the top-left coordinate of the imaginary grid for this block:
               const blockTopLeftPxX = pointer.x - (width * cellSize + (width-1)*(totalCellSize - cellSize)) / 2;
               const blockTopLeftPxY = pointer.y - (height * cellSize + (height-1)*(totalCellSize - cellSize)) / 2;

               // Calculate relative grid position
               const exactCol = (blockTopLeftPxX - rect.left) / totalCellSize;
               const exactRow = (blockTopLeftPxY - rect.top) / totalCellSize;
               
               const snapC = Math.round(exactCol);
               const snapR = Math.round(exactRow);
               
               // Soft bounding box check (allows some leniency, but relies mostly on row/col mathematical range later inside canPlaceBlock)
               if (
                   pointer.x > rect.left - cellSize && pointer.x < rect.right + cellSize &&
                   pointer.y > rect.top - cellSize && pointer.y < rect.bottom + cellSize
               ) {
                   newHoverCell = { r: snapR, c: snapC };
               }
            }

            if (newHoverCell?.r !== hoverCellRef.current?.r || newHoverCell?.c !== hoverCellRef.current?.c) {
               clearHighlights();
               hoverCellRef.current = newHoverCell;
               
               if (newHoverCell && newHoverCell.r !== -1 && newHoverCell.c !== -1) {
                  const valid = canPlaceBlock(boardRef.current, block, newHoverCell.r, newHoverCell.c);
                  drawHighlights(block, newHoverCell.r, newHoverCell.c, valid);
               }
            }
        }
      }

      if (!pointer.isGrabbing && prevIsGrabbingRef.current) {
        if (grabbedSlotRef.current !== null) {
           const block = blocksRef.current[grabbedSlotRef.current];
           const hover = hoverCellRef.current;
           
           let placed = false;
           // Uses the mathematical center-snapped coordinate!
           if (hover && hover.r !== -1 && hover.c !== -1 && block) {
              if (canPlaceBlock(boardRef.current, block, hover.r, hover.c)) {
                 handlePlaceBlock(grabbedSlotRef.current, hover.r, hover.c);
                 placed = true;
              }
           }

           if (!placed && slotRefs.current[grabbedSlotRef.current]) {
              slotRefs.current[grabbedSlotRef.current]!.style.transform = 'scale(1)';
              slotRefs.current[grabbedSlotRef.current]!.style.opacity = '1';
           }

           grabbedSlotRef.current = null;
           hoverCellRef.current = null;
           clearHighlights();
           if (draggedBlockRef.current) draggedBlockRef.current.style.display = 'none';
        }
      }

      prevIsGrabbingRef.current = pointer.isGrabbing;
    };
  }, [clearHighlights, drawHighlights, handlePlaceBlock, gameOver]);

  return (
    <div className="flex flex-col h-[calc(100vh-var(--topbar-h))] w-full bg-[var(--color-bg-base)] text-[var(--color-text-primary)] font-sans p-6 select-none lg:flex-row lg:justify-center lg:items-stretch lg:gap-6 overflow-hidden relative touch-none">
      
      {/* Praise Overlay */}
      {praise && (
        <div 
          key={praise.id} 
          className="absolute top-1/2 left-1/2 pointer-events-none z-50 flex flex-col items-center justify-center praise-anim"
        >
          <div className="text-5xl md:text-7xl font-black text-white italic tracking-tighter" style={{ WebkitTextStroke: '2px var(--color-bg-base)' }}>
            {praise.text}
          </div>
          {praise.subtext && (
            <div className="text-2xl md:text-3xl font-bold text-[var(--color-block-yellow)] mt-2 uppercase tracking-widest bg-black/40 px-4 py-1 rounded-full">
              {praise.subtext}
            </div>
          )}
        </div>
      )}

      {/* Game Area */}
      <div className="flex flex-col items-center gap-6 justify-center flex-1 w-full max-w-xl min-w-0">
        
        {/* Header */}
        <div className="w-full flex items-center justify-between bg-[var(--color-card-bg)] px-6 py-4 rounded-2xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)] z-10">
          <div className="flex gap-6 items-end">
            <div>
               <div className="text-[12px] text-[var(--color-text-secondary)] uppercase tracking-[0.05em] mb-1">Score</div>
               <div className="text-[28px] font-bold text-[var(--color-accent)] leading-none transition-all duration-300">{score}</div>
            </div>
            <div>
               <div className="text-[12px] text-[var(--color-text-secondary)] uppercase tracking-[0.05em] mb-1">Best</div>
               <div className="text-[20px] font-bold text-[var(--color-text-secondary)] leading-none">{highScore}</div>
            </div>
            {comboCount > 1 && (
               <div className={`ml-2 mb-1 ${comboCount > 1 ? 'combo-active' : ''}`}>
                 <div className="text-[14px] font-bold text-[var(--color-block-yellow)] italic">
                   {comboCount >= 4 ? `2.0x` : comboCount === 3 ? `1.5x` : `1.2x`} COMBO
                 </div>
               </div>
            )}
          </div>
          <button 
             onClick={() => {
               setBoard(createEmptyBoard());
               setCurrentBlocks(getRandomBlocks());
               setScore(0);
               setComboCount(0);
               setGameOver(false);
               isProcessingRef.current = false;
             }}
             className="bg-transparent border border-[var(--color-grid-bg)] text-[var(--color-text-primary)] px-4 py-2 rounded-lg font-semibold hover:bg-[var(--color-grid-bg)] transition-colors cursor-pointer"
          >
            Restart
          </button>
        </div>

        {/* Board */}
        <div id="board-container" className="w-auto bg-[var(--color-card-bg)] p-3 rounded-xl shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.06)] z-10 flex shrink-0 relative">
          <div className="grid grid-cols-8 grid-rows-8 relative" style={{ gap: 'var(--board-gap)' }}>
            {board.map((row, r) => 
              row.map((cellObj, c) => {
                 const isClearing = clearingLines && (clearingLines.rows.includes(r) || clearingLines.cols.includes(c));
                 return (
                   <div 
                     key={`${r}-${c}`}
                     data-row={r}
                     data-col={c}
                     className={`cell-size transition-colors duration-200 ${cellObj ? `block-cell block-${cellObj}` : 'cell-bg rounded-[4px]'} ${isClearing ? 'clearing-cell' : ''}`}
                   />
                 )
              })
            )}
          </div>
        </div>

        {/* Slots */}
        <div className="w-full flex-1 max-h-[160px] grid grid-cols-3 gap-5 z-10">
          {currentBlocks.map((block, i) => (
             <div 
               key={i} 
               data-slot-index={i}
               ref={el => slotRefs.current[i] = el}
               className="bg-[var(--color-card-bg)] shadow-[inset_0_2px_10px_rgba(0,0,0,0.2)] rounded-xl flex items-center justify-center cursor-grab active:cursor-grabbing transition-all duration-200 border border-[var(--color-grid-bg)] p-2 min-h-[100px]"
             >
               {block && <GenericBlock block={block} cellSizeVar="--slot-cell-size" />}
             </div>
          ))}
        </div>
      </div>

      {/* Camera / Side Panel */}
      <div className="absolute top-4 right-4 z-20 flex w-32 flex-col gap-5 shrink-0 lg:static lg:w-[320px]">
        <div className="w-full aspect-video bg-black rounded-2xl relative overflow-hidden border-2 border-[var(--color-grid-bg)] shadow-xl">
           <video 
             ref={cameraVideoRef} 
             className="w-full h-full object-cover transform -scale-x-100" 
             playsInline muted autoPlay 
           />
           <canvas 
             ref={cameraCanvasRef} 
             className="absolute top-0 left-0 w-full h-full object-cover transform -scale-x-100 pointer-events-none"
           />
           {!pointerStateRef.current?.isActive && !error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-[var(--color-text-secondary)] text-[10px] lg:text-[14px]">
                 <Hand className="w-5 h-5 lg:w-6 lg:h-6 mb-1 lg:mb-2 animate-pulse" />
                 <span className="text-center">WEB CAMERA FEED</span>
              </div>
           )}
           {error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-center p-4">
                 <p className="text-[12px] text-red-400 font-medium mb-3">{error}</p>
                 <button 
                   onClick={startCamera}
                   className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors pointer-events-auto"
                 >
                   Allow Camera
                 </button>
              </div>
           )}
           {pointerStateRef.current?.isActive && (
              <div className="absolute top-1/2 left-1/2 w-5 h-5 bg-[var(--color-accent)] rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-[0_0_15px_var(--color-accent)] opacity-50 pointer-events-none" />
           )}
        </div>
        
        <div className="hidden bg-[var(--color-card-bg)] p-5 rounded-2xl flex-1 lg:flex flex-col">
           <div className="text-[14px] font-semibold mb-3 flex items-center gap-2 text-[var(--color-text-primary)]">
             <div className="w-2 h-2 bg-[var(--color-accent)] rounded-full animate-pulse"></div>
             <span>Hand Tracking Active</span>
           </div>
           
           <div className="font-mono text-[12px] text-[var(--color-text-secondary)] leading-relaxed mb-4 whitespace-pre">
             PINCH: {pointerStateRef.current?.isGrabbing ? 'ACTIVE' : 'READY'}<br/>
             BLOCK: {grabbedSlotRef.current !== null && currentBlocks[grabbedSlotRef.current] ? currentBlocks[grabbedSlotRef.current]!.name : 'NONE'}<br/>
             CELL:  {hoverCellRef.current?.r !== undefined && hoverCellRef.current?.r !== -1 ? `[${hoverCellRef.current.c}, ${hoverCellRef.current.r}]` : 'NONE'}
           </div>

           <hr className="border-none border-t border-[var(--color-grid-bg)] my-4" />

           <div className="text-[14px] font-semibold mb-3 text-[var(--color-text-primary)]">
             How to Play (Hand)
           </div>
           <div className="text-[13px] text-[var(--color-text-secondary)] leading-relaxed flex flex-col gap-1">
             <div>1. Pinch thumb & index to GRAB</div>
             <div>2. Move hand to DRAG block</div>
             <div>3. Release pinch to PLACE block</div>
           </div>
        </div>
      </div>

      {/* Game Over Overlay */}
      {gameOver && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
           <div className="bg-[var(--color-card-bg)] p-8 rounded-2xl flex flex-col items-center shadow-2xl border border-[var(--color-grid-bg)] transform scale-100 animate-in fade-in zoom-in duration-300">
             <h2 className="text-4xl font-black mb-2 text-[var(--color-text-primary)] tracking-tight">GAME OVER</h2>
             <p className="text-[var(--color-text-secondary)] mb-6">Final Score: <span className="text-[var(--color-text-primary)] font-bold">{score}</span></p>
             <button 
               onClick={() => {
                 setBoard(createEmptyBoard());
                 setCurrentBlocks(getRandomBlocks());
                 setScore(0);
                 setComboCount(0);
                 setGameOver(false);
                 isProcessingRef.current = false;
               }}
               className="flex items-center gap-2 bg-[var(--color-accent)] text-white px-6 py-3 rounded-lg font-bold transition-all hover:scale-105 active:scale-95"
             >
               <RefreshCw className="w-5 h-5" />
               PLAY AGAIN
             </button>
           </div>
        </div>
      )}

      {/* Virtual Cursor */}
      <div ref={cursorRef} style={{ display: 'none' }} className="fixed z-50 pointer-events-none" />

      {/* Dragged Block Container */}
      <div 
        ref={draggedBlockRef} 
        style={{ display: 'none' }} 
        className="fixed z-40 pointer-events-none drop-shadow-2xl opacity-90 scale-105 transform -translate-x-1/2 -translate-y-1/2"
      >
        {grabbedSlotRef.current !== null && currentBlocks[grabbedSlotRef.current] && (
          <>
            <GenericBlock block={currentBlocks[grabbedSlotRef.current]!} cellSizeVar="--cell-size" />
            <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-white/70 border-2 border-[var(--color-accent)] rounded-full transform -translate-x-1/2 -translate-y-1/2 z-10 shadow-lg"></div>
          </>
        )}
      </div>

    </div>
  );
}
