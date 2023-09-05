import { BOARD_SIDE_LENGTH, Coordinate, King, LastMove, Piece, PieceSide, PieceType } from '../internal';

export class Pawn extends Piece {
  private static readonly FORWARD_2_ALLOWED_CELLS = [
    new Coordinate(-4, 5, -1),
    new Coordinate(-3, 4, -1),
    new Coordinate(-2, 3, -1),
    new Coordinate(-1, 2, -1),
    new Coordinate(0, 1, -1),
    new Coordinate(1, 1, -2),
    new Coordinate(2, 1, -3),
    new Coordinate(3, 1, -4),
    new Coordinate(4, 1, -5),
  ];

  public constructor(side: PieceSide, coordinate: Coordinate) {
    super(PieceType.PAWN, side, coordinate);
  }

  /**
   * Get a list of valid {@link Coordinate}s for promoting a pawn.
   *
   * @param side Represents the side of the chessboard for which we want to get the possible
   *        coordinates to promote a pawn.
   * @return A List of {@link Coordinate} objects.
   */
  public static getPossibleCoordinatesToPromote(side: PieceSide): Coordinate[] {
    const diagonals = [Coordinate.DIRECTION_VECTORS[4], Coordinate.DIRECTION_VECTORS[0]];
    const top = new Coordinate(0, (BOARD_SIDE_LENGTH - 1) * -1, BOARD_SIDE_LENGTH - 1);
    const result = diagonals.flatMap((diagonal) => {
      const coordinates: Coordinate[] = [];
      for (let i = 0; i < BOARD_SIDE_LENGTH - 1; i++) {
        coordinates.push((coordinates.length < 1 ? top : coordinates.at(-1))!.add(diagonal));
      }
      return coordinates;
    });
    result.push(top);
    return side === PieceSide.WHITE ? result : result.map((c) => c.horizontalReflection());
  }

  public allPossibleMoves(
    piecesOnGameBoard: Piece[],
    lastMove: LastMove | undefined,
    checkForSelfCheck: boolean
  ): Coordinate[] {
    const allPossibleMovements: (Coordinate | undefined)[] = [];
    allPossibleMovements.push(this.forward1Move(piecesOnGameBoard, lastMove, checkForSelfCheck));
    allPossibleMovements.push(this.forward2Move(piecesOnGameBoard, lastMove, checkForSelfCheck));
    allPossibleMovements.push(...this.captureMoves(piecesOnGameBoard, lastMove, checkForSelfCheck));
    allPossibleMovements.push(this.enPassantMove(piecesOnGameBoard, lastMove, checkForSelfCheck));
    return allPossibleMovements.filter((m) => m !== undefined) as Coordinate[];
  }

  /**
   * Checks if the pawn can move forward one spaces on a game board.
   *
   * @param piecesOnGameBoard The list of {@link Piece}s currently on the game board.
   * @param checkForSelfCheck If it is set to true, the method should consider the possibility of the
   *        move resulting in a check condition for the player making the move.
   * @return An {@link Optional} object that contains a {@link Coordinate} representing the possible
   *         move.
   */
  private forward1Move(
    piecesOnGameBoard: Piece[],
    lastMove: LastMove | undefined,
    checkForSelfCheck: boolean
  ): Coordinate | undefined {
    const forwardVector = this.reflectIfBlack(Coordinate.DIRECTION_VECTORS[2]);
    const forward = this._coordinate.add(forwardVector);
    if (
      piecesOnGameBoard.some((piece) => piece.coordinate.equals(forward)) ||
      (checkForSelfCheck && this.checkIfMoveCauseSelfCheck(forward, piecesOnGameBoard, lastMove))
    ) {
      return undefined;
    }
    return forward;
  }

  /**
   * Checks if the Pawn can move forward two spaces on a game board.
   *
   * @param piecesOnGameBoard The list of {@link Piece}s currently on the game board.
   * @param checkForSelfCheck If it is set to true, the method should consider the possibility of the
   *        move resulting in a check condition for the player making the move.
   * @return An {@link Optional} object that contains a {@link Coordinate} representing the possible
   *         move.
   */
  private forward2Move(
    piecesOnGameBoard: Piece[],
    lastMove: LastMove | undefined,
    checkForSelfCheck: boolean
  ): Coordinate | undefined {
    if (!this.reflectListIfBlack(Pawn.FORWARD_2_ALLOWED_CELLS).find((c) => c.equals(this._coordinate))) {
      return undefined;
    }
    const forwardVector = this.reflectIfBlack(Coordinate.DIRECTION_VECTORS[2]);
    const forward = this._coordinate.add(forwardVector);
    const forward2 = this._coordinate.add(forwardVector.multiply(2));
    if (
      piecesOnGameBoard.some((piece) => piece.coordinate.equals(forward) || piece.coordinate.equals(forward2)) ||
      (checkForSelfCheck && this.checkIfMoveCauseSelfCheck(forward2, piecesOnGameBoard, lastMove))
    ) {
      return undefined;
    }
    return forward2;
  }

  /**
   * Checks if the Pawn can eat other pieces on a game board.
   *
   * @param piecesOnGameBoard The list of {@link Piece}s currently on the game board.
   * @param checkForSelfCheck If it is set to true, the method should consider the possibility of the
   *        move resulting in a check condition for the player making the move.
   * @return A list of {@link Coordinate}s representing possible moves.
   */
  private captureMoves(
    piecesOnGameBoard: Piece[],
    lastMove: LastMove | undefined,
    checkForSelfCheck: boolean
  ): Coordinate[] {
    const diagonalVectors = [Coordinate.DIRECTION_VECTORS[1], Coordinate.DIRECTION_VECTORS[3]].map((c) =>
      this.reflectIfBlack(c)
    );
    return diagonalVectors
      .map((v) => this._coordinate.add(v))
      .filter(
        (c) =>
          piecesOnGameBoard.some((piece) => piece.coordinate.equals(c) && piece.side !== this._side) &&
          (!checkForSelfCheck || !this.checkIfMoveCauseSelfCheck(c, piecesOnGameBoard, lastMove))
      );
  }

  /**
   * Checks if the Pawn can eat other pieces on a game board using the "en passant" move.
   *
   * @param piecesOnGameBoard The list of {@link Piece}s currently on the game board.
   * @param lastMove Represents the last move made in the game.
   * @param checkForSelfCheck If it is set to true, the method should consider the possibility of the
   *        move resulting in a check condition for the player making the move.
   * @return An {@link Optional} object that contains a {@link Coordinate} representing the possible
   *         move.
   */
  public enPassantMove(
    piecesOnGameBoard: Piece[],
    lastMove: LastMove | undefined,
    checkForSelfCheck: boolean
  ): Coordinate | undefined {
    if (lastMove === undefined) {
      return undefined;
    }
    const lastMovePiece = Piece.findPiece(
      piecesOnGameBoard,
      undefined,
      this._side === PieceSide.WHITE ? PieceSide.BLACK : PieceSide.WHITE,
      lastMove.to
    );
    if (lastMovePiece === undefined) {
      return undefined;
    }
    if (lastMovePiece.type !== PieceType.PAWN || lastMove.from.distance(lastMove.to) !== 2) {
      return undefined;
    }
    const diagonalDownVectors = [Coordinate.DIRECTION_VECTORS[0], Coordinate.DIRECTION_VECTORS[4]].map((c) =>
      this.reflectIfBlack(c)
    );
    return diagonalDownVectors
      .filter(
        (v) =>
          this._coordinate.add(v).equals(lastMove.to) &&
          (!checkForSelfCheck || !this.checkIfMoveCauseSelfCheck(this._coordinate.add(v), piecesOnGameBoard, lastMove))
      )
      .map((v) => this._coordinate.add(v.horizontalReflection()))[0];
  }

  protected override checkIfMoveCauseSelfCheck(
    to: Coordinate,
    piecesOnGameBoard: Piece[],
    lastMove: LastMove | undefined
  ): boolean {
    let newBoard = Piece.clone(piecesOnGameBoard);
    const newPiece = newBoard.find((p) => p.equals(this))! as Pawn;
    const newLastMove = { from: newPiece.coordinate, to: to };
    let pieceCoordinateToRemove: Coordinate;
    if (to.equals(newPiece.enPassantMove(piecesOnGameBoard, lastMove, false))) {
      pieceCoordinateToRemove = to.add(
        this.side === PieceSide.WHITE ? Coordinate.DIRECTION_VECTORS[5] : Coordinate.DIRECTION_VECTORS[2]
      );
    } else {
      pieceCoordinateToRemove = to;
    }
    newBoard = newBoard.filter((piece) => !piece.coordinate.equals(pieceCoordinateToRemove));
    newPiece.coordinate = to;
    return (newBoard.find((piece) => piece.side === this._side && piece.type === PieceType.KING)! as King).isCheck(
      newBoard,
      newLastMove
    );
  }
}
