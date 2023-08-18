import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { Coordinate, PieceSide, PieceType } from '../../common/engine/internal';
import { Coordinate2D } from '../coordinate2D';
import { PieceComponent } from '../piece/piece.component';

@Component({
  selector: '[app-cell]',
  standalone: true,
  imports: [CommonModule, PieceComponent],
  templateUrl: './cell.component.html',
  styleUrls: ['./cell.component.scss'],
})
export class CellComponent {
  @Input() public colorIndex: number;
  @Input() public translate: Coordinate2D;
  @Input() public coordinate: Coordinate;

  @Output() hexagonClick: EventEmitter<CellComponent> = new EventEmitter();
  @ViewChild('piece') public piece?: PieceComponent;
  public selected = false;
  public highlighted = false;
  public moveHighlighted = false;
  protected hexagonPath = '100,0 50,-87 -50,-87 -100,0 -50,87 50,87';
  protected pieceType?: PieceType;
  protected PieceSide?: PieceSide;

  // https://www.redblobgames.com/grids/hexagons/#basics
  public static readonly WIDTH = 100 * 2;
  public static readonly HEIGHT = Math.sqrt(3) * 100;

  public static readonly PIECE_SCALE = 1.15;

  get width() {
    return CellComponent.WIDTH;
  }

  get height() {
    return CellComponent.HEIGHT;
  }

  get pieceScale() {
    return CellComponent.PIECE_SCALE;
  }

  get pieceWidth() {
    return PieceComponent.WIDTH;
  }

  get pieceHeight() {
    return PieceComponent.HEIGHT;
  }

  protected click() {
    this.hexagonClick.emit(this);
  }

  public removePiece() {
    this.pieceType = undefined;
    this.PieceSide = undefined;
  }

  public setPiece(pieceType: PieceType, PieceSide: PieceSide) {
    this.pieceType = pieceType;
    this.PieceSide = PieceSide;
  }
}
