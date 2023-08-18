import { Coordinate, Piece } from '../internal';

export class PromotionNotAllowedException extends Error {
  constructor(piece: Piece, coordinate: Coordinate) {
    super(
      `The Piece[${JSON.stringify(piece)}] is not allowed to be promoted at Coordinate[${JSON.stringify(coordinate)}].`
    );
  }
}
