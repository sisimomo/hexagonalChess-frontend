import {
  BOARD_SIDE_LENGTH,
  Bishop,
  Coordinate,
  Game,
  King,
  Knight,
  LastMove,
  MultiplePiecesFoundRuntimeException,
  Pawn,
  PieceSide,
  PieceType,
  PossibleMovement,
  Queen,
  Rook,
} from '../internal';

export abstract class Piece {
  protected constructor(
    protected readonly _type: PieceType,
    protected _side: PieceSide,
    protected _coordinate: Coordinate
  ) {}

  public get type(): PieceType {
    return this._type;
  }

  public get side(): PieceSide {
    return this._side;
  }

  public set side(side: PieceSide) {
    this._side = side;
  }

  public get coordinate(): Coordinate {
    return this._coordinate;
  }

  public set coordinate(coordinate: Coordinate) {
    this._coordinate = coordinate;
  }

  /**
   * Takes a list of {@link Piece} objects and returns a new list containing clones of each object.
   *
   * @param pieces The list of {@link Piece}s.
   * @return A new list of cloned {@link Piece}s.
   */
  public static clone(pieces: Piece[]): Piece[] {
    return pieces.map((p) => p.clone());
  }

  /**
   * The function creates a new instance of a chess piece based on the given piece type, side, and
   * coordinate.
   *
   * @param type The type of the chess piece that needs to be created.
   * @param side The side/color of the piece.
   * @param coordinate The position of the piece on a chessboard.
   * @return A new {@link Piece} object.
   */
  public static createPiece(type: PieceType, side: PieceSide, coordinate: Coordinate): Piece {
    switch (type) {
      case PieceType.BISHOP:
        return new Bishop(side, coordinate);
      case PieceType.KING:
        return new King(side, coordinate);
      case PieceType.KNIGHT:
        return new Knight(side, coordinate);
      case PieceType.PAWN:
        return new Pawn(side, coordinate);
      case PieceType.QUEEN:
        return new Queen(side, coordinate);
      case PieceType.ROOK:
        return new Rook(side, coordinate);
    }
  }

  /**
   * Finds a {@link Piece} by a specific coordinate, type and/or side.
   *
   * @param pieces A list of {@link Piece} objects.
   * @param type The type of the piece you are looking for.
   * @param side The side of the piece you are looking for.
   * @param coordinate The coordinate of the piece you are looking for.
   * @return A {@link Piece} object or undefined.
   */
  public static findPiece(
    pieces: Piece[],
    type: PieceType | undefined,
    side: PieceSide | undefined,
    coordinate: Coordinate | undefined
  ): Piece | undefined {
    const p = Piece.findPieces(pieces, type, side).filter(
      (piece) => coordinate === undefined || piece.coordinate.equals(coordinate)
    );
    if (p.length > 1) {
      throw new MultiplePiecesFoundRuntimeException(pieces, type, side, coordinate);
    }
    return p.length > 0 ? p.at(0) : undefined;
  }

  /**
   * Finds a list of {@link Piece}s by a specific type and/or side.
   *
   * @param pieces A list of {@link Piece} objects.
   * @param type The type of the piece you are looking for.
   * @param side The side of the piece you are looking for.
   * @return A {@link List} of {@link Piece} objects.
   */
  public static findPieces(pieces: Piece[], type: PieceType | undefined, side: PieceSide | undefined): Piece[] {
    return pieces.filter(
      (piece) => (side === undefined || piece.side === side) && (type === undefined || piece.type === type)
    );
  }

  /**
   * Checks if two lists of {@link Piece}s are equal.
   *
   * @param piecesA A list of {@link Piece} objects.
   * @param piecesB A second list of {@link Piece} objects.
   * @return A boolean value.
   */
  public static listEquals(piecesA: Piece[], piecesB: Piece[]): boolean {
    if (piecesA.length != piecesB.length) {
      return false;
    }
    const sortFn = (a: Piece, b: Piece) => {
      if (a.coordinate.q != b.coordinate.q) {
        return a.coordinate.q - b.coordinate.q;
      } else if (a.coordinate.r != b.coordinate.r) {
        return a.coordinate.r - b.coordinate.r;
      } else if (a.coordinate.s != b.coordinate.s) {
        return a.coordinate.s - b.coordinate.s;
      }
      return 0;
    };
    const sortedPiecesA = Piece.clone(piecesA);
    sortedPiecesA.sort(sortFn);
    const sortedPiecesB = Piece.clone(piecesB);
    sortedPiecesB.sort(sortFn);

    for (let i = 0; i < sortedPiecesA.length; i++) {
      if (!Piece.equals(sortedPiecesA[i], sortedPiecesB[i])) {
        return false;
      }
    }
    return true;
  }

  /**
   * Checks if two {@link Piece} objects are equal.
   *
   * @param piecesA A {@link Piece} object.
   * @param piecesB A second {@link Piece} object.
   * @return A boolean value.
   */
  public static equals(piecesA: Piece, piecesB: Piece): boolean {
    return piecesA == piecesB || (piecesA != null && piecesA.equals(piecesB));
  }

  /**
   * The function checks if a given move is valid using {@link #allPossibleMoves}.
   *
   * @param to Represents the coordinate where the player wants to move a piece to on the game board.
   * @param piecesOnGameBoard The list of {@link Piece}s currently on the game board.
   * @param lastMove Represents the last move made in the game.
   * @return The method is returning a boolean value.
   */
  public isMoveValid(to: Coordinate, piecesOnGameBoard: Piece[], lastMove: LastMove | undefined): boolean {
    return this.allPossibleMoves(piecesOnGameBoard, lastMove, true).some((c) => c.equals(to));
  }

  /**
   * Checks all the possible movements the piece can do on a game board.
   *
   * @param game The {@link Game}.
   * @param checkForSelfCheck If it is set to true, the method should consider the possibility of the move
   *        resulting in a check condition for the player making the move.
   * @return A list of {@link Coordinate}s representing possible moves.
   */
  public allPossibleMovesFromGame(game: Game, checkForSelfCheck: boolean): Coordinate[] {
    return this.allPossibleMoves(game.pieces, game.lastMove, checkForSelfCheck);
  }

  /**
   * Checks all the possible movements the piece can do on a game board.
   *
   * @param piecesOnGameBoard The list of {@link Piece}s currently on the game board.
   * @param lastMove Represents the last move made in the game.
   * @param checkForSelfCheck If it is set to true, the method should consider the possibility of the move
   *        resulting in a check condition for the player making the move.
   * @return A list of {@link Coordinate}s representing possible moves.
   */
  public abstract allPossibleMoves(
    piecesOnGameBoard: Piece[],
    lastMove: LastMove | undefined,
    checkForSelfCheck: boolean
  ): Coordinate[];

  /**
   * The function checks if a move would cause the player's own king to be in check.
   *
   * @param to The coordinate where the piece is being moved to on the game board.
   * @param piecesOnGameBoard The list of {@link Piece}s currently on the game board.
   * @return {@code true} if the move would cause the player's own king to be in check.
   */
  protected checkIfMoveCauseSelfCheck(
    to: Coordinate,
    piecesOnGameBoard: Piece[],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    lastMove: LastMove | undefined
  ): boolean {
    let newBoard = Piece.clone(piecesOnGameBoard);
    const newPiece = newBoard.find((p) => p.equals(this))!;
    const newLastMove = { from: newPiece.coordinate, to: to };
    newBoard = newBoard.filter((piece) => !piece.coordinate.equals(to));
    newPiece.coordinate = to;
    return (newBoard.find((piece) => piece.side === this._side && piece.type === PieceType.KING)! as King).isCheck(
      newBoard,
      newLastMove
    );
  }

  /**
   * Extracts a list of playable moves from a list of possible movements, given the pieces on the game
   * board.
   *
   * @param possibleMovements A list of {@link PossibleMovement} objects, which represent the possible
   *        movements that the piece can make.
   * @param piecesOnGameBoard The list of {@link Piece}s currently on the game board.
   * @param lastMove Represents the last move made in the game.
   * @param checkForSelfCheck If it is set to true, the method should consider the possibility of the
   *        move resulting in a check condition for the player making the move.
   * @return The method is returning a List of {@link Coordinate}.
   */
  protected extractPlayableMoves(
    possibleMovements: PossibleMovement[],
    piecesOnGameBoard: Piece[],
    lastMove: LastMove | undefined,
    checkForSelfCheck: boolean
  ): Coordinate[] {
    return possibleMovements.flatMap((possibleMovement) => {
      const moves: Coordinate[] = [];
      const vector = this.reflectIfBlack(possibleMovement.vector);
      let c = this._coordinate;
      for (let i = 0; i < Math.min(possibleMovement.maxRange, (BOARD_SIDE_LENGTH - 1) * 2); i++) {
        c = c.add(vector);
        if (c.distance(Coordinate.ORIGIN) < BOARD_SIDE_LENGTH) {
          const piece = piecesOnGameBoard.find((piece) => piece.coordinate.equals(c));
          if (piece !== undefined) {
            if (
              piece.side !== this._side &&
              (!checkForSelfCheck || !this.checkIfMoveCauseSelfCheck(c, piecesOnGameBoard, lastMove))
            ) {
              moves.push(c);
            }
            break;
          }
          if (!checkForSelfCheck || !this.checkIfMoveCauseSelfCheck(c, piecesOnGameBoard, lastMove)) {
            moves.push(c);
          }
        }
      }
      return moves;
    });
  }

  /**
   * Reflects the {@link Coordinate} if the {@link Piece#side piece side} is black.
   *
   * @param coordinate The {@link Coordinate} to reflect.
   * @return The {@link Coordinate} possibly reflected.
   */
  protected reflectIfBlack(coordinate: Coordinate): Coordinate {
    return this._side === PieceSide.WHITE ? coordinate : coordinate.horizontalReflection();
  }

  /**
   * Reflects the {@link Coordinate}s if the {@link Piece#side piece side} is black.
   *
   * @param coordinates The {@link Coordinate}s to reflect.
   * @return The {@link Coordinate}s possibly reflected.
   */
  protected reflectListIfBlack(coordinates: Coordinate[]): Coordinate[] {
    return coordinates.map((c) => this.reflectIfBlack(c));
  }

  /**
   * Create a clone of an {@link Piece} by using the specific copy constructor of the Piece.
   *
   * @return A clone of the {@link Piece} object.
   */
  public clone(): Piece {
    return Piece.createPiece(this._type, this._side, this._coordinate);
  }

  public equals(piece: Piece): boolean {
    return this._type === piece.type && this._side === piece.side && this._coordinate.equals(piece.coordinate);
  }
}
