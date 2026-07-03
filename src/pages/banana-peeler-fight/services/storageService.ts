import { PlayerScore } from '../types';

const STORAGE_KEY = 'banana_peeler_scores_v1';

export const saveScore = (name: string, peels: number) => {
  const existingData = localStorage.getItem(STORAGE_KEY);
  let scores: PlayerScore[] = existingData ? JSON.parse(existingData) : [];

  const existingIndex = scores.findIndex(s => s.name === name);
  
  if (existingIndex >= 0) {
    scores[existingIndex].peels = Math.max(scores[existingIndex].peels, peels);
    scores[existingIndex].date = Date.now();
  } else {
    scores.push({
      id: crypto.randomUUID(),
      name,
      peels,
      date: Date.now()
    });
  }

  // Sort by score desc
  scores.sort((a, b) => b.peels - a.peels);
  
  // Keep top 50
  if (scores.length > 50) {
    scores = scores.slice(0, 50);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
};

export const getScores = (): PlayerScore[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const isNameTaken = (name: string): boolean => {
  const scores = getScores();
  // Case-insensitive check
  return scores.some(s => s.name.trim().toLowerCase() === name.trim().toLowerCase());
};
