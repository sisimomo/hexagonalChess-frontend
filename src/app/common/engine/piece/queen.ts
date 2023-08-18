import { Coordinate, LastMove, Piece, PieceSide, PieceType, PossibleMovement } from '../internal';

export class Queen extends Piece {
  private static readonly POSSIBLE_MOVES: PossibleMovement[] = [
    new PossibleMovement(Coordinate.DIRECTION_VECTORS[2], Number.MAX_SAFE_INTEGER),
    new PossibleMovement(Coordinate.DIRECTION_VECTORS[1], Number.MAX_SAFE_INTEGER),
    new PossibleMovement(Coordinate.DIRECTION_VECTORS[0], Number.MAX_SAFE_INTEGER),
    new PossibleMovement(Coordinate.DIRECTION_VECTORS[5], Number.MAX_SAFE_INTEGER),
    new PossibleMovement(Coordinate.DIRECTION_VECTORS[4], Number.MAX_SAFE_INTEGER),
    new PossibleMovement(Coordinate.DIRECTION_VECTORS[3], Number.MAX_SAFE_INTEGER),
    new PossibleMovement(Coordinate.DIAGONAL_VECTORS[1], Number.MAX_SAFE_INTEGER),
    new PossibleMovement(Coordinate.DIAGONAL_VECTORS[0], Number.MAX_SAFE_INTEGER),
    new PossibleMovement(Coordinate.DIAGONAL_VECTORS[5], Number.MAX_SAFE_INTEGER),
    new PossibleMovement(Coordinate.DIAGONAL_VECTORS[4], Number.MAX_SAFE_INTEGER),
    new PossibleMovement(Coordinate.DIAGONAL_VECTORS[3], Number.MAX_SAFE_INTEGER),
    new PossibleMovement(Coordinate.DIAGONAL_VECTORS[2], Number.MAX_SAFE_INTEGER),
  ];

  public constructor(side: PieceSide, coordinate: Coordinate) {
    super(PieceType.QUEEN, side, coordinate);
  }

  public allPossibleMoves(
    piecesOnGameBoard: Piece[],
    lastMove: LastMove | undefined,
    checkForSelfCheck: boolean
  ): Coordinate[] {
    return this.extractPlayableMoves(Queen.POSSIBLE_MOVES, piecesOnGameBoard, lastMove, checkForSelfCheck);
  }
}
