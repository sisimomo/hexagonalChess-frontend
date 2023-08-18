import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { PieceSide, PieceType } from 'src/app/common/engine/internal';
import { PieceComponent } from '../piece/piece.component';

@Component({
  selector: 'app-piece-list',
  standalone: true,
  imports: [CommonModule, PieceComponent],
  templateUrl: './piece-list.component.html',
  styleUrls: ['./piece-list.component.scss'],
})
export class PieceListComponent {
  @Input() public types: PieceType[];
  @Input() public side: PieceSide;
}
