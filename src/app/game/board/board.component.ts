import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { BOARD_SIDE_LENGTH } from 'src/app/common/engine/constant';
import { Coordinate } from 'src/app/common/engine/coordinate';
import { Game, PieceSide } from 'src/app/common/engine/internal';
import { Pawn, Piece, PieceType } from '../../common/engine/internal';
import { CellComponent, CellDef } from '../cell/cell.component';
import { Coordinate2D } from '../cell/coordinate2D';
import { PieceTypeDialogDialog } from '../pawn-promotion/pawn-promotion.dialog';

interface GridLegendDef {
  text: string;
  translation: Coordinate2D;
}

export class MovePiece {
  constructor(
    public readonly emitter: PieceSide,
    public readonly from: Coordinate,
    public readonly to: Coordinate,
    public readonly wantedPromotionPieceType?: PieceType
  ) {}
}

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule, CellComponent, MatDialogModule],
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
})
export class BoardComponent implements OnInit {
  @Input() public game: Game;
  @Input() public lock: boolean;
  @Input() public flip: boolean;

  private static readonly WIDTH = ((CellComponent.WIDTH * 3) / 4) * (BOARD_SIDE_LENGTH * 2 - 0.5);
  private static readonly HEIGHT = CellComponent.HEIGHT * (BOARD_SIDE_LENGTH * 2 - 1);
  protected viewBox = `${(BoardComponent.WIDTH / 2) * -1} ${(BoardComponent.HEIGHT / 2) * -1} ${BoardComponent.WIDTH} ${
    BoardComponent.HEIGHT + 50
  }`;
  protected cells: CellDef[];
  protected gridLegend: GridLegendDef[];

  @Output() move: EventEmitter<MovePiece> = new EventEmitter();

  constructor(private dialog: MatDialog) {}

  private initializeGridCellDefList(): CellDef[] {
    const coordinates = Coordinate.spiral(Coordinate.ORIGIN, BOARD_SIDE_LENGTH - 1);
    const translations = Coordinate2D.spiral(Coordinate2D.ORIGIN, BOARD_SIDE_LENGTH - 1);
    const gridCellDef = coordinates.map((element, index) => {
      return new CellDef(0, element, translations[index]);
    });
    let colCount = 1;
    Object.values(groupBy(gridCellDef, (a) => a.coordinate.q))
      .sort((a, b) => a[0].coordinate.q - b[0].coordinate.q)
      .forEach((a) => {
        let rowCount = 0;
        a.sort((a, b) => a.coordinate.r - b.coordinate.r).forEach((b) => (b.colorIndex = (colCount + rowCount++) % 3));
        colCount += colCount < BOARD_SIDE_LENGTH ? 1 : 2;
      });
    return gridCellDef.map((cellDef) => {
      if (this.flip) {
        cellDef.coordinate = cellDef.coordinate.horizontalReflection();
      }
      return cellDef;
    });
  }

  private generateGridLegendDefList(grid: CellDef[]): GridLegendDef[] {
    return [
      ...Object.entries(Coordinate.FIRST_COORDINATE_OF_EACH_COLUMN).map((entry) => {
        let translation = grid
          .find((g) => g.coordinate.equals(entry[1]))
          ?.translation.add(Coordinate2D.DIRECTION_VECTORS[5].multiply(0.7).multiply(this.flip ? -1 : 1));
        return {
          text: entry[0],
          translation: translation,
        } as GridLegendDef;
      }),
      ...Object.entries(Coordinate.FIRST_COORDINATE_OF_EACH_ROW).map((entry) => {
        let translation = grid.find((g) => g.coordinate.equals(entry[1]))?.translation.add(new Coordinate2D(-80, -55));
        if (translation !== undefined && this.flip) {
          translation = translation.add(Coordinate2D.DIRECTION_VECTORS[5].multiply(0.7));
        }
        return {
          text: entry[0],
          translation: translation,
        } as GridLegendDef;
      }),
    ];
  }

  ngOnInit(): void {
    this.cells = this.initializeGridCellDefList();
    this.gridLegend = this.generateGridLegendDefList(this.cells);
    this.setPieces();
    this.updateHighlightedLastMove();
  }

  protected getPiece(coordinate: Coordinate): Piece | undefined {
    return Piece.findPiece(this.game.pieces, undefined, undefined, coordinate);
  }

  protected onCellClick(cell: CellDef) {
    if (!this.game.isEnded() && !this.lock) {
      if (cell.moveHighlighted) {
        this.onHighlightedCellClick(cell);
      } else if (
        cell.pieceType !== undefined &&
        cell.pieceSide === this.game.sideTurn &&
        !cell.coordinate.equals(this.cells.find((cell) => cell.selected)?.coordinate)
      ) {
        this.selectAPiece(cell);
      } else {
        this.resetClickableAndSelectedCells();
      }
    } else {
      this.resetClickableAndSelectedCells();
    }
  }

  private onHighlightedCellClick(cell: CellDef) {
    let selectedCell = this.cells.find((cell) => cell.selected)!;
    if (
      selectedCell.pieceType === PieceType.PAWN &&
      Pawn.getPossibleCoordinatesToPromote(selectedCell.pieceSide!).some((c) => c.equals(cell.coordinate))
    ) {
      this.openPieceTypeDialog()
        .afterClosed()
        .subscribe((result) => {
          const movePiece = new MovePiece(this.game.sideTurn, selectedCell.coordinate, cell.coordinate, result);
          this.movePiece(movePiece);
          this.move.emit(movePiece);
          this.resetClickableAndSelectedCells();
        });
    } else {
      const movePiece = new MovePiece(this.game.sideTurn, selectedCell.coordinate, cell.coordinate);
      this.movePiece(movePiece);
      this.move.emit(movePiece);
      this.resetClickableAndSelectedCells();
    }
  }

  private selectAPiece(cell: CellDef) {
    this.resetClickableAndSelectedCells();
    cell.selected = true;
    const piece = Piece.findPiece(this.game.pieces, undefined, undefined, cell.coordinate)!;
    piece.allPossibleMovesFromGame(this.game, true).forEach((move) => {
      const cellFound = this.cells.find((cell) => cell.coordinate.equals(move));
      cellFound!.moveHighlighted = true;
    });
  }

  private resetClickableAndSelectedCells() {
    this.cells
      .filter((cell) => cell.selected || cell.moveHighlighted)
      .forEach((cell) => {
        cell.selected = false;
        cell.moveHighlighted = false;
      });
  }

  public movePiece(movePiece: MovePiece) {
    this.game.movePiece(movePiece.from, movePiece.to, movePiece.wantedPromotionPieceType);
    this.updateBoard();
  }

  private updateBoard() {
    this.resetBoard();
    this.setPieces();
    this.updateHighlightedLastMove();
  }

  private resetHighlightedLastMove() {
    this.cells
      .filter((cell) => cell.lastMoveHighlighted)
      .forEach((cell) => {
        cell.lastMoveHighlighted = false;
      });
  }

  private updateHighlightedLastMove() {
    this.resetHighlightedLastMove();
    if (this.game.lastMove !== undefined) {
      const from = this.cells.find((cell) => cell.coordinate.equals(this.game.lastMove!.from))!;
      const to = this.cells.find((cell) => cell.coordinate.equals(this.game.lastMove!.to))!;
      from.lastMoveHighlighted = true;
      to.lastMoveHighlighted = true;
    }
  }

  private resetBoard() {
    this.cells.forEach((cell) => {
      cell.pieceType = undefined;
      cell.pieceSide = undefined;
      cell.lastMoveHighlighted = false;
      cell.moveHighlighted = false;
      cell.selected = false;
    });
  }

  private setPieces() {
    this.game.pieces.forEach((piece) => this.setPiece(piece.type, piece.side, piece.coordinate));
  }

  private setPiece(type: PieceType, side: PieceSide, coordinate: Coordinate) {
    const piece = this.cells.find((cell) => coordinate.equals(cell.coordinate))!;
    piece.pieceType = type;
    piece.pieceSide = side;
  }

  openPieceTypeDialog(): MatDialogRef<PieceTypeDialogDialog, any> {
    return this.dialog.open(PieceTypeDialogDialog, {
      disableClose: true,
      data: { pieceSide: this.game.sideTurn },
    });
  }
}

// https://upmostly.com/typescript/implementing-groupby-in-typescript
function groupBy<T>(arr: T[], fn: (item: T) => any) {
  return arr.reduce<Record<string, T[]>>((prev, curr) => {
    const groupKey = fn(curr);
    const group = prev[groupKey] || [];
    group.push(curr);
    return { ...prev, [groupKey]: group };
  }, {});
}
