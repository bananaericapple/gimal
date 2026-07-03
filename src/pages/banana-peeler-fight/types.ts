export interface PlayerScore {
  id: string;
  name: string;
  peels: number;
  date: number;
}

export type GameView = 'WELCOME' | 'GAME' | 'LEADERBOARD';

export interface GameState {
  playerName: string;
  totalPeels: number;
  peelStage: number; // 0 (full) to 3 (peeled)
  isRegrowing: boolean;
}