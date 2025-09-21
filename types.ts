
export enum GameState {
  START_MENU = 'START_MENU',
  INSTRUCTIONS = 'INSTRUCTIONS',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  GAME_OVER = 'GAME_OVER',
}

export enum EggType {
  NORMAL = 'NORMAL',
  GOLDEN = 'GOLDEN',
  ROTTEN = 'ROTTEN',
  BOMB = 'BOMB',
}

export interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Egg extends GameObject {
  id: number;
  type: EggType;
  vy: number; // vertical velocity
}

export interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  vy: number;
  opacity: number;
  life: number;
}
