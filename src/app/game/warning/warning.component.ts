import { AfterViewInit, Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { ActiveToast, IndividualConfig, ToastContainerDirective, ToastrService } from 'ngx-toastr';
import { ReplaySubject } from 'rxjs';
import { GameState, PieceSide } from '../../common/engine/internal';

enum ToastType {
  SUCCESS = 'success',
  ERROR = 'error',
  INFO = 'info',
  WARNING = 'warning',
}

interface Message {
  title: string;
  body: string | undefined;
  type: ToastType;
}

@Component({
  selector: 'app-warning',
  standalone: true,
  imports: [ToastContainerDirective],
  template: '<span toastContainer></span>',
})
export class WarningComponent implements OnChanges, AfterViewInit {
  @ViewChild(ToastContainerDirective) private inlineToastContainer: ToastContainerDirective;
  @Input() public gameAsStarted: boolean;
  @Input() public gameFriendlyId?: string;
  @Input() public gameState: GameState;
  @Input() public userSide: PieceSide | null;
  private onChanges = new ReplaySubject();
  lastShown: ActiveToast<any> | undefined = undefined;

  constructor(private toastr: ToastrService) {}

  ngOnChanges(changes: SimpleChanges): void {
    this.onChanges.next(changes);
  }

  ngAfterViewInit() {
    this.onChanges.subscribe(() => {
      this.showGameState();
    });
  }

  private removeLastShown() {
    if (this.lastShown !== undefined) {
      this.toastr.remove(this.lastShown.toastId);
      this.lastShown = undefined;
    }
  }

  private showWarning(title: string, message: string | undefined, type: ToastType) {
    this.removeLastShown();
    const temp = this.toastr.overlayContainer;
    this.toastr.overlayContainer = this.inlineToastContainer;
    this.lastShown = this.toastr.show(
      message,
      title,
      {
        disableTimeOut: true,
        closeButton: true,
        tapToDismiss: false,
        enableHtml: true,
        positionClass: 'inline',
      } as IndividualConfig,
      this.toastr.toastrConfig.iconClasses[type]
    );
    this.toastr.overlayContainer = temp;
  }

  private showGameState() {
    const message = this.getMessage();
    if (message !== undefined) {
      this.showWarning(message.title, message.body, message.type);
    } else {
      this.removeLastShown();
    }
  }

  getMessage(): Message | undefined {
    let title: string;
    let message: string | undefined;
    let type = ToastType.WARNING;

    if (this.gameFriendlyId !== undefined && !this.gameAsStarted) {
      title = 'Waiting for an opponent to join the game';
      message = `The Friendly Id of this game is: <h2>${this.gameFriendlyId}</h2> You can give it to anyone along with the game password (if set) so they can join you.`;
      type = ToastType.INFO;
    } else {
      const sideWhite = this.userSide === PieceSide.WHITE ? 'You' : 'White';
      const sideBlack = this.userSide === PieceSide.BLACK ? 'You' : 'Black';
      switch (this.gameState) {
        case GameState.IN_PROGRESS:
          this.removeLastShown();
          return;
        case GameState.WHITE_IN_CHECK:
          title = sideWhite + ' are in check';
          type = ToastType.INFO;
          break;
        case GameState.BLACK_IN_CHECK:
          title = sideBlack + ' are in check';
          type = ToastType.INFO;
          break;
        case GameState.WHITE_WON:
          title = sideWhite + ' WON';
          break;
        case GameState.BLACK_WON:
          title = sideBlack + ' WON';
          break;
        case GameState.WHITE_WON_BY_SURRENDER:
          title = `${sideWhite} WON, ${sideBlack.toLowerCase()} surrendered`;
          break;
        case GameState.BLACK_WON_BY_SURRENDER:
          title = `${sideBlack} WON, ${sideWhite.toLowerCase()} surrendered`;
          break;
        case GameState.DRAW_STALEMATE:
          title = 'Stalemate Draw, nobody won';
          message =
            'A "Stalemate" is a type of draw that occurs when the chess player who has to move cannot make any legal moves to a safe square but is also not in check.';
          break;
        case GameState.DRAW_INSUFFICIENT_MATERIAL:
          title = 'Insufficient Material Draw, nobody won';
          message =
            'A "Insufficient Material" is a type of draw that occurs when neither player has enough pieces left on the board so that they can Check-Mate the other player.';
          break;
        case GameState.DRAW_THREEFOLD_REPETITION:
          title = 'Threefold-Repetition Draw, nobody won';
          message =
            'A "Threefold-Repetition" is a type of draw that occurs when a position arises three times in a game. One thing to remember is that the repeated positions do not need to be in a row.';
          break;
      }
    }
    return { title, body: message, type } as Message;
  }
}
