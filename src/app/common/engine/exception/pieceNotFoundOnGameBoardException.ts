import { Coordinate } from '../internal';

export class PieceNotFoundOnGameBoardException extends Error {
  constructor(coordinate: Coordinate) {
    super(`No Piece was found at Coordinate[${JSON.stringify(coordinate)}].`);
  }
}
