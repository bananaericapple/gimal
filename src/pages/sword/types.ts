
export interface SwordStats {
  level: number;
  name: string;
  description: string;
  enhanceCost: number;
  sellPrice: number;
  successRate: number;
  destroyRate: number;
  materialCost: number;
}

export interface PlayerState {
  gold: number;
  protectionTickets: number;
  materials: number;
}

export enum GameLogType {
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
  DESTROYED = 'DESTROYED',
  SHOP = 'SHOP',
  SELL = 'SELL'
}

export interface GameLog {
  id: string;
  type: GameLogType;
  message: string;
  timestamp: number;
}
