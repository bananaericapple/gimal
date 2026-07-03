
export enum Category {
  ANTHEM = '애국가',
  HYMN = '찬송가',
  QUOTES = '명언',
  PROVERBS = '속담',
  GENERAL = '일반 문장'
}

export interface TypingResult {
  accuracy: number;
  speed: number;
  timeTaken: number;
  sentence: string;
}

export interface SentenceData {
  category: Category;
  text: string;
}
