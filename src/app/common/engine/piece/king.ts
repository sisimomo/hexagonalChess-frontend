import { Coordinate, LastMove, Piece, PieceSide, PieceType, PossibleMovement } from '../internal';

export class King extends Piece {
  private static readonly POSSIBLE_MOVES: PossibleMovement[] = [
    new PossibleMovement(Coordinate.DIRECTION_VECTORS[2], 1),
    new PossibleMovement(Coordinate.DIRECTION_VECTORS[1], 1),
    new PossibleMovement(Coordinate.DIRECTION_VECTORS[0], 1),
    new PossibleMovement(Coordinate.DIRECTION_VECTORS[5], 1),
    new PossibleMovement(Coordinate.DIRECTION_VECTORS[4], 1),
    new PossibleMovement(Coordinate.DIRECTION_VECTORS[3], 1),
    new PossibleMovement(Coordinate.DIAGONAL_VECTORS[1], 1),
    new PossibleMovement(Coordinate.DIAGONAL_VECTORS[0], 1),
    new PossibleMovement(Coordinate.DIAGONAL_VECTORS[5], 1),
    new PossibleMovement(Coordinate.DIAGONAL_VECTORS[4], 1),
    new PossibleMovement(Coordinate.DIAGONAL_VECTORS[3], 1),
    new PossibleMovement(Coordinate.DIAGONAL_VECTORS[2], 1),
  ];

  public constructor(side: PieceSide, coordinate: Coordinate) {
    super(PieceType.KING, side, coordinate);
  }

  public allPossibleMoves(
    piecesOnGameBoard: Piece[],
    lastMove: LastMove | undefined,
    checkForSelfCheck: boolean
  ): Coordinate[] {
    return this.extractPlayableMoves(King.POSSIBLE_MOVES, piecesOnGameBoard, lastMove, checkForSelfCheck);
  }

  public isCheck(piecesOnGameBoard: Piece[], lastMove: LastMove | undefined): boolean {
    return piecesOnGameBoard
      .filter((piece) => piece.side !== this._side)
      .some((piece) =>
        piece.allPossibleMoves(piecesOnGameBoard, lastMove, false).some((c) => this._coordinate.equals(c))
      );
  }

  public isCheckMate(piecesOnGameBoard: Piece[], lastMove: LastMove | undefined): boolean {
    if (!this.isCheck(piecesOnGameBoard, lastMove)) {
      return false;
    }
    return !piecesOnGameBoard
      .filter((piece) => piece.side === this._side)
      .some((piece) =>
        piece.allPossibleMoves(piecesOnGameBoard, lastMove, false).some((c) => {
          const newBoard = Piece.clone(piecesOnGameBoard);
          const pieceOfNewBoard = newBoard.find((p) => piece.equals(p))!;
          pieceOfNewBoard.coordinate = c;
          return !(Piece.findPiece(newBoard, this.type, this.side, undefined) as King).isCheck(newBoard, {
            from: piece.coordinate,
            to: c,
          } as LastMove);
        })
      );
  }
}
