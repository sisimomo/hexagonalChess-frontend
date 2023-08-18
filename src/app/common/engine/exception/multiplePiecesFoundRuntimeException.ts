import { Coordinate, Piece, PieceSide, PieceType } from '../internal';

export class MultiplePiecesFoundRuntimeException extends Error {
  constructor(
    pieces: Piece[],
    type: PieceType | undefined,
    side: PieceSide | undefined,
    coordinate: Coordinate | undefined
  ) {
    super(
      `Multiple pieces was found with search parameters [type: ${type}, side: ${side}, coordinate: ${coordinate}]\n${pieces.filter(
        (piece) =>
          (side === undefined || piece.side === side) &&
          (type == null || piece.type === type) &&
          (coordinate == null || piece.coordinate.equals(coordinate))
      )}`
    );
  }
}
