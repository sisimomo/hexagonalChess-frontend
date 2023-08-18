import { Coordinate, Piece } from '../internal';

export class MovementNotAllowedException extends Error {
  constructor(piece: Piece, coordinate: Coordinate) {
    super(`The Piece[${JSON.stringify(piece)}] is not allowed to move to Coordinate[${JSON.stringify(coordinate)}].`);
  }
}
