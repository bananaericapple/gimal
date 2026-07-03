export type GameState = 'START' | 'PLAYER_TURN' | 'ATTACK_GAME' | 'DIALOGUE' | 'ENEMY_TURN' | 'GAME_OVER' | 'VICTORY';

export type ActionType = 'FIGHT' | 'ACT' | 'ITEM' | 'MERCY' | null;

export interface PlayerStats {
  hp: number;
  maxHp: number;
  name: string;
  lv: number;
}

export interface Bullet {
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  vy: number;
  type: 'BONE' | 'BLASTER';
  id: number;
  hitCooldown?: number; // Tracks frames until this specific bullet can hit again
}

export interface Soul {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
}