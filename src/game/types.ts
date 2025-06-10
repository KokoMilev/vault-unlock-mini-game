export enum GameState {
  LOCKED,
  INPUT,
  OPENING,
  OPEN,
  RESETTING,
}

export type Direction = 1 | -1; // 1 = clockwise, -1 = counterclockwise

export type CombinationStep = {
  steps: number;
  dir: Direction;
};

export type CombinationResult = 'continue' | 'success' | 'fail';