export interface Point {
  x: number;
  y: number;
}

export interface CircleResult {
  score: number; // 0 to 100
  grade: string;
  center: Point;
  radius: number;
  deviation: number;
  closureGap: number;
  isClosed: boolean;
  points: Point[];
}

export enum GameState {
  IDLE = 'IDLE',
  DRAWING = 'DRAWING',
  ANALYZING = 'ANALYZING',
  RESULT = 'RESULT',
}

export interface GeminiFeedback {
  comment: string;
  tips: string[];
}
