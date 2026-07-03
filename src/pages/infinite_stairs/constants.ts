
import { SkinId } from './types';

export const GAME_CONFIG = {
  STEP_WIDTH: 60,
  STEP_HEIGHT: 50,
  INITIAL_STAIRS: 20,
  STAMINA_MAX: 100,
  STAMINA_DECAY_RATE: 0.3, // per tick
  STAMINA_RECOVERY: 15,
  COIN_CHANCE: 0.15,
};

export const COLORS = {
  PRIMARY: '#3b82f6', // Blue-500
  ACCENT: '#fbbf24', // Amber-400
  DANGER: '#ef4444', // Red-500
  TEXT: '#ffffff',
};

export const SKINS: Record<SkinId, {name: string, cost: number, description: string}> = {
  business: { name: 'Business Man', cost: 5, description: 'Ready for work.' },
  training: { name: 'Red Tracksuit', cost: 5, description: 'Feel the burn!' },
  security: { name: 'Pink Guard', cost: 5, description: 'Strict enforcement.' },
  bear: { name: 'Polar Bear', cost: 5, description: 'Cute but fierce.' },
  chef: { name: 'Master Chef', cost: 5, description: 'Cooking up steps.' },
  ninja: { name: 'Shadow Ninja', cost: 5, description: 'Swift and silent.' },
  robot: { name: 'Bot-X', cost: 5, description: 'Beep boop climb.' },
  zombie: { name: 'Zombie', cost: 5, description: 'Brains... and stairs.' },
  astronaut: { name: 'Astronaut', cost: 5, description: 'One small step.' },
};

export const DEFAULT_KEYS = {
  turn: 'KeyZ',
  climb: 'KeyX'
};
