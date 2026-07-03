
export enum Difficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD'
}

export interface Target {
  id: string;
  x: number;
  y: number;
  size: number;
  createdAt: number;
}

export interface GameStats {
  hits: number;
  misses: number;
  totalClicks: number;
  accuracy: number;
  score: number;
  reactionTimes: number[];
  startTime: number | null;
  endTime: number | null;
}

export interface AIAnalysis {
  summary: string;
  tips: string[];
  recommendedDrill: string;
}
