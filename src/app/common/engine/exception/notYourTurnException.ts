import { PieceSide } from '../internal';

export class NotYourTurnException extends Error {
  constructor(side: PieceSide) {
    super(`It's not the ${side === PieceSide.WHITE ? 'White' : 'Black'} side turn.`);
  }
}
