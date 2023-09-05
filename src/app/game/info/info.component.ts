import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Game } from 'src/app/common/engine/game';
import { PieceSide } from 'src/app/common/engine/internal';
import { HistoryComponent } from '../history/history.component';
import { PieceListComponent } from '../piece-list/piece-list.component';

@Component({
  selector: 'app-info',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, HistoryComponent, PieceListComponent],
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.scss'],
})
export class InfoComponent implements AfterViewInit {
  @Input() public userSide: PieceSide | null;
  @Input() public game: Game;
  @Input() public gameAsStarted: boolean;

  @ViewChild('history') private history: ElementRef;

  @Output() resign: EventEmitter<undefined> = new EventEmitter();

  public get pieceSideEnum(): typeof PieceSide {
    return PieceSide;
  }

  public get whiteCapturedPieceTypes() {
    return this.game.getCapturedPieceTypeList(PieceSide.WHITE);
  }
  public get blackCapturedPieceTypes() {
    return this.game.getCapturedPieceTypeList(PieceSide.BLACK);
  }

  ngAfterViewInit(): void {
    this.history.nativeElement.scroll({
      top: this.history.nativeElement.scrollHeight,
    });
  }

  onResignButtonClick() {
    if (window.confirm('Do you really want to surrender?')) {
      this.resign.emit();
    }
  }
}
