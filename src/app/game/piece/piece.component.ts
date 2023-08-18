import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { PieceSide, PieceType } from '../../common/engine/internal';

@Component({
  selector: '[app-piece]',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './piece.component.html',
  styleUrls: ['./piece.component.scss'],
})
export class PieceComponent {
  protected PieceType = PieceType;
  protected PieceSide = PieceSide;
  @Input() public type: PieceType;
  @Input() public side: PieceSide;
  public static readonly WIDTH = 126;
  public static readonly HEIGHT = 126;
}
