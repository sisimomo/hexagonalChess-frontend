import { Coordinate, Piece, PieceSide, PieceType } from '../internal';

export class MultiplePiecesFoundRuntimeException extends Error {
  constructor(pieces: Piece[], type?: PieceType, side?: PieceSide, coordinate?: Coordinate) {
    super(
      `Multiple pieces was found with search parameters [type: ${type}, side: ${side}, coordinate: ${coordinate}]\n${pieces.filter(
        (piece) =>
          (side === undefined || piece.side === side) &&
          (type === undefined || piece.type === type) &&
          (coordinate === undefined || piece.coordinate.equals(coordinate))
      )}`
    );
  }
}
