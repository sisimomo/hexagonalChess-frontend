import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { Game } from 'src/app/common/engine/internal';

interface Item {
  position: number;
  white: string;
  black: string;
}

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule],
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss'],
})
export class HistoryComponent {
  @Input() public game: Game;

  protected columns: string[] = ['', 'white', 'black'];

  public get dataSource(): Item[] {
    if (this.game === undefined) {
      return [];
    }
    const moveHistory = this.game.moveHistory;
    let dataSource = [];
    for (let i = 0; i < moveHistory.white.length; i++) {
      dataSource.push({ position: i + 1, white: moveHistory.white[i], black: moveHistory.black[i] } as Item);
    }
    return dataSource;
  }
}
