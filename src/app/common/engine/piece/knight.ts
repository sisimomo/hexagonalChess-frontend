import { Coordinate, LastMove, Piece, PieceSide, PieceType, PossibleMovement } from '../internal';

export class Knight extends Piece {
  private static readonly POSSIBLE_MOVES: PossibleMovement[] = [
    new PossibleMovement(new Coordinate(3, -2, -1), 1),
    new PossibleMovement(new Coordinate(3, -1, -2), 1),
    new PossibleMovement(new Coordinate(2, 1, -3), 1),
    new PossibleMovement(new Coordinate(1, 2, -3), 1),
    new PossibleMovement(new Coordinate(-2, 3, -1), 1),
    new PossibleMovement(new Coordinate(-1, 3, -2), 1),
    new PossibleMovement(new Coordinate(-3, 1, 2), 1),
    new PossibleMovement(new Coordinate(-3, 2, 1), 1),
    new PossibleMovement(new Coordinate(-1, -2, 3), 1),
    new PossibleMovement(new Coordinate(-2, -1, 3), 1),
    new PossibleMovement(new Coordinate(1, -3, 2), 1),
    new PossibleMovement(new Coordinate(2, -3, 1), 1),
  ];

  public constructor(side: PieceSide, coordinate: Coordinate) {
    super(PieceType.KNIGHT, side, coordinate);
  }

  public allPossibleMoves(
    piecesOnGameBoard: Piece[],
    lastMove: LastMove | undefined,
    checkForSelfCheck: boolean
  ): Coordinate[] {
    return this.extractPlayableMoves(Knight.POSSIBLE_MOVES, piecesOnGameBoard, lastMove, checkForSelfCheck);
  }
}
