import { CommonModule, NgIf } from '@angular/common';
import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import {
  BOARD_SIDE_LENGTH,
  Coordinate,
  Game,
  GameState,
  Pawn,
  Piece,
  PieceSide,
  PieceType,
} from '../common/engine/internal';
import { onError } from '../common/utils/errorUtils';
import { GameUpdateMovePieceMessageDto } from '../service/game/dto/request/message/gameUpdateMessageDto';
import { GameDto } from '../service/game/dto/response/gameDto';
import {
  GameBaseMessageDto,
  GameJoinMessageDto,
  GameMovePieceMessageDto,
} from '../service/game/dto/response/message/gameMessageDto';
import { GameSaveMapper } from '../service/game/mapper/gameSaveMapper';
import { RestGameService } from '../service/game/restGame.service';
import { WebsocketGameService } from '../service/game/websocketGame.service';
import { CoordinateMapper } from '../service/piece/mapper/coordinateMapper';
import { PieceTypeMapper } from '../service/piece/mapper/pieceTypeMapper';
import { CellComponent } from './cell/cell.component';
import { Coordinate2D } from './coordinate2D';
import { PieceListComponent } from './piece-list/piece-list.component';
import { PieceTypeDialogDialog } from './piece-type-dialog/piece-type-dialog.dialog';
import { WarningComponent } from './warning/warning.component';

interface GridCellDef {
  colorIndex: number;
  coordinate: Coordinate;
  translation: Coordinate2D;
}

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [
    CommonModule,
    CellComponent,
    ToastrModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    NgIf,
    MatDialogModule,
    WarningComponent,
    PieceListComponent,
  ],
  templateUrl: './game.page.html',
  styleUrls: ['./game.page.scss'],
})
export class GamePage implements OnInit {
  private static readonly WIDTH = ((CellComponent.WIDTH * 3) / 4) * (BOARD_SIDE_LENGTH * 2 - 0.5);
  private static readonly HEIGHT = CellComponent.HEIGHT * (BOARD_SIDE_LENGTH * 2 - 1);
  protected viewBox = `${(GamePage.WIDTH / 2) * -1} ${(GamePage.HEIGHT / 2) * -1} ${GamePage.WIDTH} ${GamePage.HEIGHT}`;
  @ViewChildren(CellComponent) protected cells!: QueryList<CellComponent>;
  protected grid: GridCellDef[];
  protected whiteCapturedPieceTypes?: PieceType[];
  protected blackCapturedPieceTypes?: PieceType[];

  protected userUuid: string | undefined;
  protected userSide: PieceSide | null | undefined;
  protected gameModel: Game | undefined;
  protected gameDto: GameDto | undefined;
  private topicSubscription: Subscription | undefined;

  constructor(
    private toastr: ToastrService,
    private restGameService: RestGameService,
    private websocketGameService: WebsocketGameService,
    private keycloak: KeycloakService,
    private route: ActivatedRoute,
    private dialog: MatDialog
  ) {
    this.grid = GamePage.generateGridCellDefList();
  }

  public get pieceSideEnum(): typeof PieceSide {
    return PieceSide;
  }

  public get gameStateEnum(): typeof GameState {
    return GameState;
  }

  public get gameAsStarted(): boolean | undefined {
    return this.gameDto !== undefined
      ? this.gameDto!.whiteUserUuid !== undefined && this.gameDto!.blackUserUuid !== undefined
      : undefined;
  }

  private static generateGridCellDefList(): GridCellDef[] {
    const coordinates = Coordinate.spiral(Coordinate.ORIGIN, BOARD_SIDE_LENGTH - 1);
    const translations = Coordinate2D.spiral(Coordinate2D.ORIGIN, BOARD_SIDE_LENGTH - 1);
    const gridCellDef = coordinates.map((element, index) => {
      return {
        colorIndex: 0,
        coordinate: element,
        translation: translations[index],
      } as GridCellDef;
    });
    let colCount = 1;
    Object.values(groupBy(gridCellDef, (a) => a.coordinate.q))
      .sort((a, b) => a[0].coordinate.q - b[0].coordinate.q)
      .forEach((a) => {
        let rowCount = 0;
        a.sort((a, b) => a.coordinate.r - b.coordinate.r).forEach((b) => (b.colorIndex = (colCount + rowCount++) % 3));
        colCount += colCount < BOARD_SIDE_LENGTH ? 1 : 2;
      });
    return gridCellDef;
  }

  ngOnInit(): void {
    this.restGameService.get(this.route.snapshot.paramMap.get('gameFriendlyId')!).subscribe({
      next: (gameDto) => {
        this.updateBoardWithDto(gameDto);
        this.keycloak.isLoggedIn().then((isLoggedIn) => {
          if (isLoggedIn) {
            this.keycloak.loadUserProfile().then((userProfile) => {
              this.userUuid = userProfile.id;
              this.userSide =
                this.gameDto?.whiteUserUuid === this.userUuid
                  ? PieceSide.WHITE
                  : this.gameDto?.blackUserUuid === this.userUuid
                  ? PieceSide.BLACK
                  : null;
            });
          } else {
            this.userSide = null;
          }
        });
        this.subscribeToGameTopic();
      },
      error: (err) => {
        onError(this.toastr, err, 'An error occurred while retrieving the game.');
      },
    });
  }

  ngOnDestroy() {
    this.topicSubscription?.unsubscribe();
  }

  subscribeToGameTopic() {
    this.topicSubscription = this.websocketGameService.subscribeToUpdate(this.gameDto!.friendlyId).subscribe({
      next: (gameMessageDto: GameBaseMessageDto) => {
        if (gameMessageDto.emitter !== this.userUuid) {
          if (gameMessageDto instanceof GameMovePieceMessageDto) {
            this.onGameMovePieceMessage(gameMessageDto);
          } else if (gameMessageDto instanceof GameJoinMessageDto) {
            this.gameDto!.blackUserUuid = gameMessageDto.emitter;
          }
        }
      },
      error: (err) => {
        onError(this.toastr, err, 'An error occurred while subscribing to the game.');
      },
    });
  }

  onGameMovePieceMessage(gameMovePieceMessageDto: GameMovePieceMessageDto) {
    this.gameModel!.movePiece(
      CoordinateMapper.convertToModel(gameMovePieceMessageDto.from),
      CoordinateMapper.convertToModel(gameMovePieceMessageDto.to),
      gameMovePieceMessageDto.wantedPromotionPieceType !== undefined
        ? PieceTypeMapper.convertToModel(gameMovePieceMessageDto.wantedPromotionPieceType)
        : undefined
    );
    this.updateBoard();
  }

  protected onCellClick(cell: CellComponent) {
    if (
      this.gameModel!.state === GameState.IN_PROGRESS ||
      this.gameModel!.state === GameState.WHITE_IN_CHECK ||
      this.gameModel!.state === GameState.BLACK_IN_CHECK
    ) {
      if (cell.highlighted) {
        this.onHighlightedCellClick(cell);
      } else if (
        cell.piece?.side === this.userSide &&
        cell.piece !== undefined &&
        !cell.coordinate.equals(this.cells.find((cell) => cell.selected)?.coordinate)
      ) {
        this.selectAPiece(cell);
      } else {
        this.resetClickableAndSelectedCells();
      }
    }
  }

  private onHighlightedCellClick(cell: CellComponent) {
    if (this.userSide !== null) {
      if (this.userSide !== this.gameModel!.sideTurn) {
        this.toastr.error(undefined, 'You must wait your turn before moving a piece!', {
          closeButton: true,
          timeOut: 15000,
        });
        this.resetClickableAndSelectedCells();
        return;
      }
      if (this.gameDto!.whiteUserUuid === undefined || this.gameDto!.blackUserUuid === undefined) {
        this.toastr.error(undefined, 'You must wait for an opponent to join the game!', {
          closeButton: true,
          timeOut: 15000,
        });
        this.resetClickableAndSelectedCells();
        return;
      }
    }
    if (this.userSide !== null && this.userSide !== this.gameModel!.sideTurn) {
      this.toastr.error(undefined, 'You must wait your turn before moving a piece!', {
        closeButton: true,
        timeOut: 15000,
      });
      this.resetClickableAndSelectedCells();
      return;
    }
    let selectedCell = this.cells.find((cell) => cell.selected)!;
    if (
      selectedCell.piece!.type === PieceType.PAWN &&
      Pawn.getPossibleCoordinatesToPromote(selectedCell.piece!.side).some((c) => c.equals(cell.coordinate))
    ) {
      this.openPieceTypeDialog()
        .afterClosed()
        .subscribe((result) => {
          this.movePiece(cell.coordinate, selectedCell.coordinate, result);
          this.resetClickableAndSelectedCells();
        });
    } else {
      this.movePiece(cell.coordinate, selectedCell.coordinate, undefined);
      this.resetClickableAndSelectedCells();
    }
  }

  private selectAPiece(cell: CellComponent) {
    this.resetClickableAndSelectedCells();
    cell.selected = true;
    const piece = Piece.findPiece(this.gameModel!.pieces, undefined, undefined, cell.coordinate)!;
    piece.allPossibleMovesFromGame(this.gameModel!, true).forEach((move) => {
      const cellFound = this.cells.find((cell) => cell.coordinate.equals(move));
      cellFound!.highlighted = true;
    });
  }

  private resetClickableAndSelectedCells() {
    this.cells
      .filter((cell) => cell.selected || cell.highlighted)
      .forEach((c) => {
        c.selected = false;
        c.highlighted = false;
      });
  }

  private movePiece(
    clickedCell: Coordinate,
    selectedCell: Coordinate,
    wantedPromotionPieceType: PieceType | undefined
  ) {
    this.gameModel!.movePiece(selectedCell, clickedCell, wantedPromotionPieceType);
    this.updateBoard();
    this.websocketGameService.updateGame(
      this.gameDto!.friendlyId,
      new GameUpdateMovePieceMessageDto(
        CoordinateMapper.convertToDto(selectedCell),
        CoordinateMapper.convertToDto(clickedCell),
        wantedPromotionPieceType !== undefined ? PieceTypeMapper.convertToDto(wantedPromotionPieceType) : undefined
      )
    );
  }

  private updateBoardWithDto(gameDto: GameDto) {
    this.gameDto = gameDto;
    this.gameModel = GameSaveMapper.convertToModel(gameDto.gameSave!);
    this.updateBoard();
  }

  private updateBoard() {
    this.resetBoard();
    this.gameModel!.pieces.forEach((piece) => this.setPiece(piece.type, piece.side, piece.coordinate));
    this.updateCapturedPieceTypes();
    this.highlightedLastMove();
  }

  private updateCapturedPieceTypes() {
    this.whiteCapturedPieceTypes = this.gameModel!.getCapturedPieceTypeList(PieceSide.WHITE);
    this.blackCapturedPieceTypes = this.gameModel!.getCapturedPieceTypeList(PieceSide.BLACK);
  }

  private highlightedLastMove() {
    if (this.gameModel!.lastMove !== undefined) {
      const from = this.cells.find((cell) => cell.coordinate.equals(this.gameModel!.lastMove!.from))!;
      const to = this.cells.find((cell) => cell.coordinate.equals(this.gameModel!.lastMove!.to))!;
      from.moveHighlighted = true;
      to.moveHighlighted = true;
      setTimeout(() => {
        from.moveHighlighted = false;
        to.moveHighlighted = false;
      }, 7500);
    }
  }

  private resetBoard() {
    this.resetClickableAndSelectedCells();
    this.cells.filter((cell) => cell.piece).forEach((cell) => cell.removePiece());
  }

  private setPiece(type: PieceType, side: PieceSide, coordinate: Coordinate) {
    this.cells.find((cell) => coordinate.equals(cell.coordinate))!.setPiece(type, side);
  }

  openPieceTypeDialog(): MatDialogRef<PieceTypeDialogDialog, any> {
    return this.dialog.open(PieceTypeDialogDialog, {
      disableClose: true,
      data: { pieceSide: this.userSide },
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
