import { Block } from './blocks';

export const BOARD_SIZE = 8;

export type BoardState = (string | null)[][];

export const createEmptyBoard = (): BoardState => 
  Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));

export const canPlaceBlock = (board: BoardState, block: Block, startRow: number, startCol: number): boolean => {
  for (const cell of block.cells) {
    const r = startRow + cell.y;
    const c = startCol + cell.x;
    if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) {
      return false; // Out of bounds
    }
    if (board[r][c] !== null) {
      return false; // Cell already occupied
    }
  }
  return true;
};

export const placeBlock = (board: BoardState, block: Block, startRow: number, startCol: number): {newBoard: BoardState, placedCells: {r: number, c: number}[]} => {
  const newBoard = board.map(row => [...row]);
  const placedCells = [];
  for (const cell of block.cells) {
    const r = startRow + cell.y;
    const c = startCol + cell.x;
    newBoard[r][c] = block.color;
    placedCells.push({r, c});
  }
  return {newBoard, placedCells};
};

export const clearLines = (board: BoardState): { newBoard: BoardState, linesCleared: number, clearedRows: number[], clearedCols: number[] } => {
  const newBoard = board.map(row => [...row]);
  const clearedRows: number[] = [];
  const clearedCols: number[] = [];

  for (let r = 0; r < BOARD_SIZE; r++) {
    if (newBoard[r].every(cell => cell !== null)) {
      clearedRows.push(r);
    }
  }

  for (let c = 0; c < BOARD_SIZE; c++) {
    let colFull = true;
    for (let r = 0; r < BOARD_SIZE; r++) {
      if (board[r][c] === null) { // Check original board to prevent overlap bugs
        colFull = false;
        break;
      }
    }
    if (colFull) {
      clearedCols.push(c);
    }
  }

  for (const r of clearedRows) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      newBoard[r][c] = null;
    }
  }

  for (const c of clearedCols) {
    for (let r = 0; r < BOARD_SIZE; r++) {
      newBoard[r][c] = null;
    }
  }

  return { newBoard, linesCleared: clearedRows.length + clearedCols.length, clearedRows, clearedCols };
};

export const isAnyMoveAvailable = (board: BoardState, blocks: (Block | null)[]): boolean => {
  const availableBlocks = blocks.filter((b): b is Block => b !== null);
  for (const block of availableBlocks) {
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (canPlaceBlock(board, block, r, c)) {
          return true;
        }
      }
    }
  }
  return false;
};
