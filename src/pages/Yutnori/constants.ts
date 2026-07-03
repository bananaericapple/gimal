
import { NodePosition, YutResult } from './types';

// Board layout logic
// 0 is start (bottom-right)
// 1-19 is outer circle counter-clockwise
// 20-24 is diagonal from top-right to bottom-left
// 25-29 is diagonal from top-left to bottom-right
// Note: 22 is the center node

export const BOARD_NODES: NodePosition[] = [
  // Outer circle (0-19)
  { id: 0, x: 90, y: 90, type: 'START' }, // Start
  { id: 1, x: 90, y: 72, type: 'NORMAL' },
  { id: 2, x: 90, y: 54, type: 'NORMAL' },
  { id: 3, x: 90, y: 36, type: 'NORMAL' },
  { id: 4, x: 90, y: 18, type: 'NORMAL' },
  { id: 5, x: 90, y: 10, type: 'CORNER' }, // Top-right corner
  { id: 6, x: 72, y: 10, type: 'NORMAL' },
  { id: 7, x: 54, y: 10, type: 'NORMAL' },
  { id: 8, x: 36, y: 10, type: 'NORMAL' },
  { id: 9, x: 18, y: 10, type: 'NORMAL' },
  { id: 10, x: 10, y: 10, type: 'CORNER' }, // Top-left corner
  { id: 11, x: 10, y: 28, type: 'NORMAL' },
  { id: 12, x: 10, y: 46, type: 'NORMAL' },
  { id: 13, x: 10, y: 64, type: 'NORMAL' },
  { id: 14, x: 10, y: 82, type: 'NORMAL' },
  { id: 15, x: 10, y: 90, type: 'CORNER' }, // Bottom-left corner
  { id: 16, x: 28, y: 90, type: 'NORMAL' },
  { id: 17, x: 46, y: 90, type: 'NORMAL' },
  { id: 18, x: 64, y: 90, type: 'NORMAL' },
  { id: 19, x: 82, y: 90, type: 'NORMAL' },

  // Diagonals
  { id: 20, x: 75, y: 25, type: 'NORMAL' }, // TR -> Center 1
  { id: 21, x: 62, y: 38, type: 'NORMAL' }, // TR -> Center 2
  { id: 22, x: 50, y: 50, type: 'CENTER' }, // Center
  { id: 23, x: 38, y: 62, type: 'NORMAL' }, // Center -> BL 1
  { id: 24, x: 25, y: 75, type: 'NORMAL' }, // Center -> BL 2

  { id: 25, x: 25, y: 25, type: 'NORMAL' }, // TL -> Center 1
  { id: 26, x: 38, y: 38, type: 'NORMAL' }, // TL -> Center 2
  // Center is id 22
  { id: 27, x: 62, y: 62, type: 'NORMAL' }, // Center -> BR 1
  { id: 28, x: 75, y: 75, type: 'NORMAL' }, // Center -> BR 2
];

export const YUT_VALUES: Record<YutResult, number> = {
  'DO': 1,
  'GAE': 2,
  'GEOL': 3,
  'YUT': 4,
  'MO': 5,
  'BACK_DO': -1
};

export const PLAYER_COLORS = [
  '#ef4444', // Red
  '#3b82f6', // Blue
  '#22c55e', // Green
  '#eab308', // Yellow
];

export const PIECES_PER_PLAYER = 3;
