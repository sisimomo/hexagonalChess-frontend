import { Coordinate, LastMove, Piece, PieceSide, PieceType, PossibleMovement } from '../internal';

export class Rook extends Piece {
  private static readonly POSSIBLE_MOVES: PossibleMovement[] = [
    new PossibleMovement(Coordinate.DIRECTION_VECTORS[2], Number.MAX_SAFE_INTEGER),
    new PossibleMovement(Coordinate.DIRECTION_VECTORS[1], Number.MAX_SAFE_INTEGER),
    new PossibleMovement(Coordinate.DIRECTION_VECTORS[0], Number.MAX_SAFE_INTEGER),
    new PossibleMovement(Coordinate.DIRECTION_VECTORS[5], Number.MAX_SAFE_INTEGER),
    new PossibleMovement(Coordinate.DIRECTION_VECTORS[4], Number.MAX_SAFE_INTEGER),
    new PossibleMovement(Coordinate.DIRECTION_VECTORS[3], Number.MAX_SAFE_INTEGER),
  ];

  public constructor(side: PieceSide, coordinate: Coordinate) {
    super(PieceType.ROOK, side, coordinate);
  }

  public allPossibleMoves(
    piecesOnGameBoard: Piece[],
    lastMove: LastMove | undefined,
    checkForSelfCheck: boolean
  ): Coordinate[] {
    return this.extractPlayableMoves(Rook.POSSIBLE_MOVES, piecesOnGameBoard, lastMove, checkForSelfCheck);
  }
}
