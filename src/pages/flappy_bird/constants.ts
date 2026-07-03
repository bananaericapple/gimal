export const GAME_WIDTH = 400;
export const GAME_HEIGHT = 600;
export const GRAVITY = 0.5;
export const JUMP_STRENGTH = -8;
export const PIPE_SPEED = 3;
export const PIPE_SPAWN_RATE = 100; // Frames between pipes
export const PIPE_WIDTH = 52;
export const PIPE_GAP = 150;
export const BIRD_SIZE = 34;
export const BIRD_X_POSITION = 60; // Fixed X position of the bird
export const GROUND_HEIGHT = 100;

export enum GameState {
  START = 'START',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER'
}

export interface PipeData {
  x: number;
  topHeight: number;
  passed: boolean;
}