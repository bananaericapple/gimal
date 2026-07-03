export type Point = { x: number; y: number };

export interface Block {
  id: string;
  name: string;
  cells: Point[];
  color: string;
}

export const BLOCK_DEF: Omit<Block, 'id'>[] = [
  // 1칸
  { name: 'dot', cells: [{x:0, y:0}], color: 'bg-[var(--color-block-red)]' },
  
  // 1xN 가로
  { name: 'hline-2', cells: [{x:0, y:0}, {x:1, y:0}], color: 'bg-[var(--color-block-orange)]' },
  { name: 'hline-3', cells: [{x:0, y:0}, {x:1, y:0}, {x:2, y:0}], color: 'bg-[var(--color-block-blue)]' },
  { name: 'hline-4', cells: [{x:0, y:0}, {x:1, y:0}, {x:2, y:0}, {x:3, y:0}], color: 'bg-[var(--color-block-green)]' },
  { name: 'hline-5', cells: [{x:0, y:0}, {x:1, y:0}, {x:2, y:0}, {x:3, y:0}, {x:4, y:0}], color: 'bg-[var(--color-block-purple)]' },
  
  // Nx1 세로
  { name: 'vline-2', cells: [{x:0, y:0}, {x:0, y:1}], color: 'bg-[var(--color-block-orange)]' },
  { name: 'vline-3', cells: [{x:0, y:0}, {x:0, y:1}, {x:0, y:2}], color: 'bg-[var(--color-block-blue)]' },
  { name: 'vline-4', cells: [{x:0, y:0}, {x:0, y:1}, {x:0, y:2}, {x:0, y:3}], color: 'bg-[var(--color-block-green)]' },
  { name: 'vline-5', cells: [{x:0, y:0}, {x:0, y:1}, {x:0, y:2}, {x:0, y:3}, {x:0, y:4}], color: 'bg-[var(--color-block-purple)]' },
  
  // 정사각형
  { name: 'square-2', cells: [{x:0,y:0},{x:1,y:0},{x:0,y:1},{x:1,y:1}], color: 'bg-[var(--color-block-blue)]' },
  { name: 'square-3', cells: [{x:0,y:0},{x:1,y:0},{x:2,y:0},{x:0,y:1},{x:1,y:1},{x:2,y:1},{x:0,y:2},{x:1,y:2},{x:2,y:2}], color: 'bg-[var(--color-block-purple)]' },
  
  // L자 / ㄱ자
  { name: 'L-small', cells: [{x:0,y:0},{x:0,y:1},{x:1,y:1}], color: 'bg-[var(--color-block-red)]' },
  { name: 'L-small-rev', cells: [{x:1,y:0},{x:1,y:1},{x:0,y:1}], color: 'bg-[var(--color-block-orange)]' },
  { name: 'L-large', cells: [{x:0,y:0},{x:0,y:1},{x:0,y:2},{x:1,y:2}], color: 'bg-[var(--color-block-green)]' },
  { name: 'L-large-rev', cells: [{x:1,y:0},{x:1,y:1},{x:1,y:2},{x:0,y:2}], color: 'bg-[var(--color-block-purple)]' },
  { name: 'L-corner', cells: [{x:0,y:0},{x:0,y:1},{x:0,y:2},{x:1,y:2},{x:2,y:2}], color: 'bg-[var(--color-block-blue)]' },
  { name: 'L-corner-rev', cells: [{x:2,y:0},{x:2,y:1},{x:2,y:2},{x:1,y:2},{x:0,y:2}], color: 'bg-[var(--color-block-red)]' },
  
  // T자
  { name: 'T', cells: [{x:0,y:0},{x:1,y:0},{x:2,y:0},{x:1,y:1}], color: 'bg-[var(--color-block-orange)]' },
  { name: 'T-rev', cells: [{x:1,y:0},{x:0,y:1},{x:1,y:1},{x:2,y:1}], color: 'bg-[var(--color-block-green)]' },
  { name: 'T-vert', cells: [{x:0,y:0},{x:0,y:1},{x:0,y:2},{x:1,y:1}], color: 'bg-[var(--color-block-blue)]' },
  
  // 계단 / S
  { name: 'Z', cells: [{x:0,y:0},{x:1,y:0},{x:1,y:1},{x:2,y:1}], color: 'bg-[var(--color-block-purple)]' },
  { name: 'S', cells: [{x:1,y:0},{x:2,y:0},{x:0,y:1},{x:1,y:1}], color: 'bg-[var(--color-block-red)]' },
  { name: 'stairs-small', cells: [{x:0,y:0},{x:1,y:0},{x:1,y:1}], color: 'bg-[var(--color-block-orange)]' },
  
  // 직사각형
  { name: 'rect-2x3', cells: [{x:0,y:0},{x:1,y:0},{x:0,y:1},{x:1,y:1},{x:0,y:2},{x:1,y:2}], color: 'bg-[var(--color-block-green)]' },
  { name: 'rect-3x2', cells: [{x:0,y:0},{x:1,y:0},{x:2,y:0},{x:0,y:1},{x:1,y:1},{x:2,y:1}], color: 'bg-[var(--color-block-purple)]' },
];

// Palette of pure color names that match our CSS classes (.block-red, etc)
const PALETTE = ['red', 'orange', 'yellow', 'green', 'teal', 'blue', 'purple', 'pink'];

export const getRandomBlocks = (): Block[] => {
  return [1, 2, 3].map((_, i) => {
    const def = BLOCK_DEF[Math.floor(Math.random() * BLOCK_DEF.length)];
    const colorName = PALETTE[Math.floor(Math.random() * PALETTE.length)];
    return { ...def, color: colorName, id: `block-${Date.now()}-${i}` };
  });
};

export const getBlockSize = (block: Block): { width: number, height: number } => {
  let maxX = 0, maxY = 0;
  for (const cell of block.cells) {
    if (cell.x > maxX) maxX = cell.x;
    if (cell.y > maxY) maxY = cell.y;
  }
  return { width: maxX + 1, height: maxY + 1 };
}
