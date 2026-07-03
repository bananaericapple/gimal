
export type YutResult = 'DO' | 'GAE' | 'GEOL' | 'YUT' | 'MO' | 'BACK_DO';

export interface Player {
  id: number;
  name: string;
  avatar: string;
  isAi: boolean;
  color: string;
  finishedCount: number;
  rank?: number;
}

export interface Piece {
  id: number;
  ownerId: number;
  position: number | null; // null means not on board yet
  isFinished: boolean;
  groupId?: number; // For stacked pieces
  path?: 'OUTER' | 'DIAG_TR' | 'DIAG_TL'; // 추적 경로
}

export type GameStatus = 'SETUP' | 'CAMERA' | 'PLAYING' | 'GAMEOVER';

export interface GameState {
  status: GameStatus;
  players: Player[];
  pieces: Piece[];
  currentTurn: number;
  throwResults: YutResult[];
  lastThrow: YutResult | null;
  isThrowing: boolean;
  winners: number[]; // Array of player IDs in order of finish
  bonusThrows: number; // 윷, 모, 또는 상대 말을 잡았을 때 발생하는 추가 던지기 기회 횟수
}

export interface NodePosition {
  x: number;
  y: number;
  type: 'CORNER' | 'NORMAL' | 'CENTER' | 'START';
  id: number;
}
