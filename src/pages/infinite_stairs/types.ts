
export enum GameState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  GAMEOVER = 'GAMEOVER',
  PAUSED = 'PAUSED',
}

export enum Direction {
  LEFT = -1,
  RIGHT = 1,
}

export enum CharacterState {
  IDLE = 'IDLE',
  JUMP = 'JUMP',
  RUN = 'RUN',
  FALL = 'FALL',
}

export type SkinId = 'business' | 'training' | 'security' | 'bear' | 'chef' | 'ninja' | 'robot' | 'zombie' | 'astronaut';

export interface Skin {
  id: SkinId;
  name: string;
  cost: number;
}

export interface KeyConfig {
  turn: string; // Primary key code for turn
  climb: string; // Primary key code for climb
}

export interface StairData {
  id: number;
  x: number;
  y: number;
  direction: Direction; // The direction relative to the PREVIOUS stair
  hasCoin: boolean;
}

export interface Player {
  currentStepIndex: number; // The index of the stair the player is currently ON
  facing: Direction;
  state: CharacterState;
  skin: SkinId;
}

export interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}
