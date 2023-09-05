import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Coordinate } from 'src/app/common/engine/coordinate';
import { PieceSide, PieceType } from 'src/app/common/engine/internal';
import { PieceComponent } from '../piece/piece.component';
import { Coordinate2D } from './coordinate2D';

export class CellDef {
  constructor(
    public colorIndex: number,
    public coordinate: Coordinate,
    public translation: Coordinate2D,
    public pieceType?: PieceType,
    public pieceSide?: PieceSide,
    public selected: boolean = false,
    public moveHighlighted: boolean = false,
    public lastMoveHighlighted: boolean = false
  ) {}
}

@Component({
  selector: '[app-cell]',
  standalone: true,
  imports: [CommonModule, PieceComponent],
  templateUrl: './cell.component.html',
  styleUrls: ['./cell.component.scss'],
})
export class CellComponent {
  @Input() public def: CellDef;

  @Output() hexagonClick: EventEmitter<CellDef> = new EventEmitter();
  public static readonly HEXAGON_PATH = '100,0 50,-87 -50,-87 -100,0 -50,87 50,87';

  // https://www.redblobgames.com/grids/hexagons/#basics
  public static readonly WIDTH = 100 * 2;
  public static readonly HEIGHT = Math.sqrt(3) * 100;

  public static readonly PIECE_SCALE = 1.15;

  protected get hexagonPath() {
    return CellComponent.HEXAGON_PATH;
  }

  protected get width() {
    return CellComponent.WIDTH;
  }

  protected get height() {
    return CellComponent.HEIGHT;
  }

  protected get pieceScale() {
    return CellComponent.PIECE_SCALE;
  }

  protected get pieceWidth() {
    return PieceComponent.WIDTH;
  }

  protected get pieceHeight() {
    return PieceComponent.HEIGHT;
  }

  protected get moveHighlightedClass() {
    if (!this.def.moveHighlighted) {
      return undefined;
    }
    return this.def.pieceType !== undefined && this.def.pieceSide !== undefined
      ? 'captureMoveHighlighted'
      : 'moveHighlighted';
  }

  protected click() {
    this.hexagonClick.emit(this.def);
  }
}
