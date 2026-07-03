
import { Difficulty } from './types';

export const GAME_DURATION = 30; // Seconds

export const DIFFICULTY_SETTINGS = {
  [Difficulty.EASY]: {
    targetSize: 60,
    spawnRate: 1000,
    scoreMultiplier: 1,
    label: 'Easy'
  },
  [Difficulty.MEDIUM]: {
    targetSize: 40,
    spawnRate: 800,
    scoreMultiplier: 2,
    label: 'Medium'
  },
  [Difficulty.HARD]: {
    targetSize: 25,
    spawnRate: 600,
    scoreMultiplier: 4,
    label: 'Hard'
  }
};
