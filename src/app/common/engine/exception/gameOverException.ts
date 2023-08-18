import { GameState } from '../internal';

export class GameOverException extends Error {
  constructor(gameState: GameState) {
    super(`The game is over [${GameState[gameState]}].`);
  }
}
