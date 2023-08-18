import { GameOverException } from './exception/gameOverException';
import {
  BOARD_SIDE_LENGTH,
  Bishop,
  Coordinate,
  GameState,
  King,
  Knight,
  LastMove,
  MovementNotAllowedException,
  NotYourTurnException,
  Pawn,
  Piece,
  PieceNotFoundOnGameBoardException,
  PieceSide,
  PieceType,
  PromotionNotAllowedException,
  Queen,
  Rook,
  WantedPromotionPieceTypeNotProvidedException,
} from './internal';

export class Game {
  private static readonly BOARD_TO_STRING_PIECE_SPACING = 8;
  private static readonly BOARD_TO_STRING_EMPTY_CELL_PLACE_HOLDER = '*';

  private _state: GameState;

  private _sideTurn: PieceSide;

  private _lastMove: LastMove | undefined;

  private _pieces: Piece[];

  private _history: Piece[][];

  public constructor(
    state?: GameState,
    sideTurn?: PieceSide,
    lastMove?: LastMove | undefined,
    pieces?: Piece[],
    history?: Piece[][]
  ) {
    if (state !== undefined && sideTurn !== undefined && pieces !== undefined && history !== undefined) {
      this._state = state;
      this._sideTurn = sideTurn;
      this._lastMove = lastMove;
      this._pieces = Piece.clone(pieces);
      this._history = history.map((h) => Piece.clone(h));
    } else {
      this._state = GameState.IN_PROGRESS;
      this._sideTurn = PieceSide.WHITE;
      this._pieces = Game.getInitialPiecesPositions();
      this._history = [];
    }
  }

  public get state(): GameState {
    return this._state;
  }

  public get sideTurn(): PieceSide {
    return this._sideTurn;
  }

  public get lastMove(): LastMove | undefined {
    return this._lastMove;
  }

  public get pieces(): Piece[] {
    return Piece.clone(this._pieces);
  }

  public get history(): Piece[][] {
    return this._history.map((h) => Piece.clone(h));
  }

  /**
   * Get the list of captured piece types for a given side in a
   * chess game.
   *
   * @param pieceSide The side of the captured piece types.
   * @returns List of captured piece types by
   * the specified piece side.
   */
  public getCapturedPieceTypeList(pieceSide: PieceSide) {
    const capturedPiecesType: PieceType[] = [];
    for (let i = pieceSide === PieceSide.WHITE ? 2 : 1; i <= this._history.length; i += 2) {
      const previous = this._history[i - 1];
      const current = i < this._history.length ? this._history[i] : this.pieces;
      const previousTypes = previous.filter((piece) => piece.side === pieceSide).map((piece) => piece.type);
      const currentTypes = current.filter((piece) => piece.side === pieceSide).map((piece) => piece.type);
      if (previousTypes.length !== currentTypes.length) {
        const missingType = previousTypes.find(
          (pType) =>
            previousTypes.filter((type) => type === pType).length !==
            currentTypes.filter((type) => type === pType).length
        );
        capturedPiecesType.push(missingType!);
      }
    }
    return capturedPiecesType;
  }

  /**
   * Get the list of initial positions for both white and black chess pieces.
   *
   * @return A list of {@link Piece} objects.
   */
  private static getInitialPiecesPositions(): Piece[] {
    const whites = [
      // Pawn
      new Pawn(PieceSide.WHITE, new Coordinate(-4, 5, -1)),
      new Pawn(PieceSide.WHITE, new Coordinate(-3, 4, -1)),
      new Pawn(PieceSide.WHITE, new Coordinate(-2, 3, -1)),
      new Pawn(PieceSide.WHITE, new Coordinate(-1, 2, -1)),
      new Pawn(PieceSide.WHITE, new Coordinate(0, 1, -1)),
      new Pawn(PieceSide.WHITE, new Coordinate(1, 1, -2)),
      new Pawn(PieceSide.WHITE, new Coordinate(2, 1, -3)),
      new Pawn(PieceSide.WHITE, new Coordinate(3, 1, -4)),
      new Pawn(PieceSide.WHITE, new Coordinate(4, 1, -5)),
      // Bishop
      new Bishop(PieceSide.WHITE, new Coordinate(0, 5, -5)),
      new Bishop(PieceSide.WHITE, new Coordinate(0, 4, -4)),
      new Bishop(PieceSide.WHITE, new Coordinate(0, 3, -3)),
      // Knight
      new Knight(PieceSide.WHITE, new Coordinate(-2, 5, -3)),
      new Knight(PieceSide.WHITE, new Coordinate(2, 3, -5)),
      // Rook
      new Rook(PieceSide.WHITE, new Coordinate(-3, 5, -2)),
      new Rook(PieceSide.WHITE, new Coordinate(3, 2, -5)),
      // King
      new King(PieceSide.WHITE, new Coordinate(-1, 5, -4)),
      // Queen
      new Queen(PieceSide.WHITE, new Coordinate(1, 4, -5)),
    ];
    const blacks = Piece.clone(whites);
    blacks.forEach((piece) => {
      piece.side = PieceSide.BLACK;
      piece.coordinate = piece.coordinate.horizontalReflection();
    });
    return [...whites, ...blacks];
  }

  /**
   * Moves a piece from one coordinate to another, performing necessary checks and updates.
   *
   * @param from The current {@link Coordinate} of the {@link Piece} that needs to be moved.
   * @param to The destination {@link Coordinate} where the {@link Piece} is being moved to.
   * @param wantedPromotionPieceType The type of piece that the pawn wants to be promoted to.
   */
  public movePiece(from: Coordinate, to: Coordinate, wantedPromotionPieceType: PieceType | undefined): void {
    if (this.isEnded()) {
      throw new GameOverException(this._state);
    }
    let piece = Piece.findPiece(this._pieces, undefined, undefined, from);
    if (piece === undefined) {
      throw new PieceNotFoundOnGameBoardException(from);
    }
    if (piece.side !== this._sideTurn) {
      throw new NotYourTurnException(piece.side);
    }
    if (!piece.isMoveValid(to, this._pieces, this._lastMove)) {
      throw new MovementNotAllowedException(piece, to);
    }
    if (piece instanceof Pawn && Pawn.getPossibleCoordinatesToPromote(piece.side).some((c) => c.equals(to))) {
      piece = this.promotesPawn(piece, wantedPromotionPieceType);
    } else if (wantedPromotionPieceType != null) {
      throw new PromotionNotAllowedException(piece, to);
    } else {
      this.addCurrentPiecesToHistory();
    }
    this.removeCapturedPiece(piece, to);
    piece.coordinate = to;
    this._lastMove = { from, to } as LastMove;
    this.updateGameState();
    this._sideTurn = this._sideTurn === PieceSide.WHITE ? PieceSide.BLACK : PieceSide.WHITE;
  }

  /**
   * Promotes a pawn to a desired piece type and returns the new piece.
   *
   * @param pawn Represents the pawn piece that needs to be promoted.
   * @param wantedPromotionPieceType Represents the type of piece that the pawn wants to be promoted
   *        to.
   * @return The newly created {@link Piece}.
   */
  private promotesPawn(pawn: Pawn, wantedPromotionPieceType: PieceType | undefined): Piece {
    if (wantedPromotionPieceType === undefined) {
      throw new WantedPromotionPieceTypeNotProvidedException();
    }
    this.addCurrentPiecesToHistory();
    this._pieces = this._pieces.filter((p) => !p.equals(pawn));
    const newPiece = Piece.createPiece(wantedPromotionPieceType!, pawn.side, pawn.coordinate);
    this._pieces.push(newPiece);
    return newPiece;
  }

  /**
   * Set and determines the current state of the game.
   */
  private updateGameState() {
    const king = Piece.findPiece(
      this._pieces,
      PieceType.KING,
      this._sideTurn === PieceSide.WHITE ? PieceSide.BLACK : PieceSide.WHITE,
      undefined
    )! as King;
    if (king.isCheck(this._pieces, undefined)) {
      this.updateGameStateCheck();
    } else if (this.isDrawStalemate()) {
      this._state = GameState.DRAW_STALEMATE;
    } else if (this.isDrawInsufficientMaterial()) {
      this._state = GameState.DRAW_INSUFFICIENT_MATERIAL;
    } else if (this.isDrawThreefoldRepetition()) {
      this._state = GameState.DRAW_THREEFOLD_REPETITION;
    } else {
      this._state = GameState.IN_PROGRESS;
    }
  }

  /**
   * Set and determines the game state to indicate whether the white or black side has won, or if
   * either side is in check.
   */
  private updateGameStateCheck() {
    const king = Piece.findPiece(
      this._pieces,
      PieceType.KING,
      this._sideTurn === PieceSide.WHITE ? PieceSide.BLACK : PieceSide.WHITE,
      undefined
    )! as King;
    if (king.isCheckMate(this._pieces, undefined)) {
      this._state = king.side === PieceSide.WHITE ? GameState.BLACK_WON : GameState.WHITE_WON;
    } else {
      this._state = king.side === PieceSide.WHITE ? GameState.WHITE_IN_CHECK : GameState.BLACK_IN_CHECK;
    }
  }

  private isEnded() {
    return !(
      this._state === GameState.IN_PROGRESS ||
      this._state === GameState.WHITE_IN_CHECK ||
      this._state === GameState.BLACK_IN_CHECK
    );
  }

  /**
   * Checks if there is a stalemate in the game.
   *
   * @return A boolean value.
   */
  private isDrawStalemate(): boolean {
    return Piece.findPieces(
      this._pieces,
      undefined,
      this._sideTurn === PieceSide.WHITE ? PieceSide.BLACK : PieceSide.WHITE
    ).every((piece) => piece.allPossibleMoves(this._pieces, this._lastMove, true).length === 0);
  }

  /**
   * Checks if there is insufficient material in the game.
   *
   * @return A boolean value.
   */
  private isDrawInsufficientMaterial(): boolean {
    return this.isDrawInsufficientMaterialSide(PieceSide.WHITE) && this.isDrawInsufficientMaterialSide(PieceSide.BLACK);
  }

  /**
   * Checks if a given side is insufficient material in the game.
   *
   * @param side Represents the side of the chessboard for which we want to check if there is
   *        insufficient material.
   * @return A boolean value.
   */
  private isDrawInsufficientMaterialSide(side: PieceSide): boolean {
    const sidePieces = Piece.findPieces(this._pieces, undefined, side);
    return (
      sidePieces.length <= 2 &&
      !sidePieces.some((piece) => piece.type === PieceType.PAWN) &&
      sidePieces.filter((piece) => [PieceType.KING, PieceType.BISHOP, PieceType.KNIGHT].includes(piece.type)).length ==
        sidePieces.length
    );
  }

  /**
   * Checks if there is a threefold repetition in a game of chess.
   *
   * @return A boolean value.
   */
  private isDrawThreefoldRepetition(): boolean {
    if (this._history.length > 3) {
      let count = 0;
      for (let i = this._history.length - 1; i > 0; i--) {
        if (Piece.listEquals(this._history.at(-1)!, this._history.at(i)!)) {
          count++;
        }
      }
      return count >= 3;
    }
    return false;
  }

  /**
   * Adds a clone of the current pieces to the history list.
   */
  private addCurrentPiecesToHistory() {
    this._history.push(Piece.clone(this._pieces));
  }

  /**
   * Removes the captured piece from the game based on the type of piece and the move made.
   *
   * @param piece Represents the chess piece that is being moved.
   * @param to Represents the coordinate where the piece is being moved to.
   */
  private removeCapturedPiece(piece: Piece, to: Coordinate) {
    let pieceCoordinateToRemove: Coordinate;
    if (
      piece.type === PieceType.PAWN && // En Passant
      to.equals((piece as Pawn).enPassantMove(this._pieces, this._lastMove, true))
    ) {
      pieceCoordinateToRemove = to.add(
        piece.side === PieceSide.WHITE ? Coordinate.DIRECTION_VECTORS[5] : Coordinate.DIRECTION_VECTORS[2]
      );
    } else {
      pieceCoordinateToRemove = to;
    }
    this._pieces = this._pieces.filter((p) => !p.coordinate.equals(pieceCoordinateToRemove));
  }

  /**
   * Generates a string representation of the game object, including its state, side turn, last move,
   * pieces, and the game board.
   *
   * @return A string.
   */
  public toString(): string {
    return `Game(state=${this._state}, sideTurn=${this._sideTurn}, lastMove=${JSON.stringify(
      this._lastMove
    )}, pieces=${JSON.stringify(this._pieces)})\n\n${this.gameBoardToString()}`;
  }

  /**
   * Generates a string representation of a game board.
   *
   * @return A string representation of the game board.
   */
  public gameBoardToString(): string {
    let str = '';

    let lastRowStartingCoordinate = new Coordinate(1, BOARD_SIDE_LENGTH * -1, BOARD_SIDE_LENGTH - 1);
    // Top
    let piecesInRow = 1;
    for (; piecesInRow < BOARD_SIDE_LENGTH + 1; piecesInRow++) {
      str += this.rowToString(piecesInRow, lastRowStartingCoordinate, 1);
      lastRowStartingCoordinate = lastRowStartingCoordinate.add(this.getGrowingDirectionVector(1));
    }
    // Middle
    piecesInRow = BOARD_SIDE_LENGTH;
    for (let row = 1; row < BOARD_SIDE_LENGTH * 2 - 2; row++) {
      const growingDirection = row % 2 == 0 ? 1 : -1;
      piecesInRow += growingDirection;
      str += this.rowToString(piecesInRow, lastRowStartingCoordinate, growingDirection);
      lastRowStartingCoordinate = lastRowStartingCoordinate.add(this.getGrowingDirectionVector(growingDirection));
    }
    // Bottom
    for (piecesInRow = BOARD_SIDE_LENGTH; piecesInRow > 0; piecesInRow--) {
      const growingDirection = piecesInRow == BOARD_SIDE_LENGTH ? 1 : -1;
      str += this.rowToString(piecesInRow, lastRowStartingCoordinate, growingDirection);
      lastRowStartingCoordinate = lastRowStartingCoordinate.add(this.getGrowingDirectionVector(growingDirection));
    }
    return str;
  }

  private getGrowingDirectionVector(growingDirection: number): Coordinate {
    return growingDirection == 1 ? Coordinate.DIRECTION_VECTORS[4] : Coordinate.DIRECTION_VECTORS[0];
  }

  /**
   * Generates a string representation of a row of the game board.
   *
   * @param piecesInRow Represents the number of pieces in the row.
   * @param lastRowStartingCoordinate Represents the starting coordinate of the last row.
   * @param growingDirection The `growingDirection` parameter represents the direction in which the
   *        row is growing.
   * @return A string representation of a row of the game board.
   */
  private rowToString(piecesInRow: number, lastRowStartingCoordinate: Coordinate, growingDirection: number): string {
    const row: (Piece | undefined)[] = [];
    lastRowStartingCoordinate = lastRowStartingCoordinate.add(this.getGrowingDirectionVector(growingDirection));
    for (let i = 0; i < piecesInRow; i++) {
      row.push(this._pieces.find((piece) => piece.coordinate.equals(lastRowStartingCoordinate)));
      lastRowStartingCoordinate = lastRowStartingCoordinate.add(Coordinate.DIAGONAL_VECTORS[0]);
    }
    return this.rowPiecesToString(row) + '\n';
  }

  /**
   * A helper method to generates a string representation of a row of the game board.
   *
   * @param pieces A list of Piece objects representing the pieces in a row on a chessboard.
   * @return A string representation of a row of the game board.
   */
  private rowPiecesToString(pieces: (Piece | undefined)[]): string {
    const width = (BOARD_SIDE_LENGTH - 1) * Game.BOARD_TO_STRING_PIECE_SPACING + BOARD_SIDE_LENGTH;
    const padding = (width - (pieces.length - 1) * Game.BOARD_TO_STRING_PIECE_SPACING) / 2;
    const row = pieces.map((piece) => {
      if (piece === undefined) {
        return Game.BOARD_TO_STRING_EMPTY_CELL_PLACE_HOLDER;
      }
      let str = '';
      if (this._lastMove !== undefined && piece.coordinate.equals(this._lastMove.to)) {
        str += '\x1B[1m';
      }
      if (piece.side === PieceSide.WHITE) {
        str += '\x1B[107m' + '\x1B[30m';
      } else {
        str += '\x1B[97m' + '\x1B[40m';
      }
      str += piece.type + '\x1B[0m';
      return str;
    });
    return ' '.repeat(padding) + row.join(' '.repeat(Game.BOARD_TO_STRING_PIECE_SPACING));
  }
}
