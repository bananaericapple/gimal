export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Player extends Rect {
  vx: number;
  vy: number;
  isGrounded: boolean;
  facingRight: boolean;
}

export interface Platform extends Rect {
  id: string;
  type: 'desk' | 'book' | 'cup' | 'arm' | 'shoulder' | 'head' | 'pencil' | 'organic' | 'wax' | 'bone' | 'neuron' | 'synapse';
  color?: string;
  rotation?: number; // Visual rotation in degrees
}

export enum GameStatus {
  START = 'START',
  LEVEL_1 = 'LEVEL_1', // Desk
  LEVEL_2 = 'LEVEL_2', // Giant Body
  LEVEL_3 = 'LEVEL_3', // Ear Canal
  LEVEL_4 = 'LEVEL_4', // Middle Ear (Bones)
  LEVEL_5 = 'LEVEL_5', // Brain (Dream)
  WON = 'WON',
  GAME_OVER = 'GAME_OVER'
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