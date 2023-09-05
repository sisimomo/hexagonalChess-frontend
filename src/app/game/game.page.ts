import { Component, OnInit, ViewChild } from '@angular/core';

import { NgIf } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { IFrame } from '@stomp/rx-stomp';
import { KeycloakEventType, KeycloakService } from 'keycloak-angular';
import { ActiveToast, ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { Game, GameState, PieceSide } from '../common/engine/internal';
import { onError, onHttpError, showErrorToast } from '../common/utils/errorUtils';
import { ErrorDto } from '../service/common/dto/errorDto';
import {
  GameUpdateMovePieceMessageDto,
  GameUpdateSurrenderMessageDto,
} from '../service/game/dto/request/message/gameUpdateMessageDto';
import { GameDto } from '../service/game/dto/response/gameDto';
import {
  GameBaseMessageDto,
  GameJoinMessageDto,
  GameMovePieceMessageDto,
  GameSurrenderMessageDto,
} from '../service/game/dto/response/message/gameMessageDto';
import { GameSaveMapper } from '../service/game/mapper/gameSaveMapper';
import { RestGameService } from '../service/game/restGame.service';
import { WebsocketGameService } from '../service/game/websocketGame.service';
import { CoordinateMapper } from '../service/piece/mapper/coordinateMapper';
import { PieceTypeMapper } from '../service/piece/mapper/pieceTypeMapper';
import { BoardComponent, MovePiece, MovePiece as PieceMove } from './board/board.component';
import { InfoComponent } from './info/info.component';
import { WarningComponent } from './warning/warning.component';

@Component({
  standalone: true,
  imports: [BoardComponent, InfoComponent, NgIf, WarningComponent],
  templateUrl: './game.page.html',
  styleUrls: ['./game.page.scss'],
})
export class GamePage implements OnInit {
  @ViewChild(BoardComponent) public gameComponent: BoardComponent;
  protected userUuid: string | undefined;
  protected userSide: PieceSide | null | undefined;
  protected gameModel: Game | undefined;
  protected gameDto: GameDto | undefined;

  private gameUpdateSubscription: Subscription | undefined;
  private gameUpdateErrorSubscription: Subscription | undefined;
  private keycloakEventSubscription: Subscription | undefined;

  public get pieceSideEnum(): typeof PieceSide {
    return PieceSide;
  }

  constructor(
    private toastr: ToastrService,
    private restGameService: RestGameService,
    private websocketGameService: WebsocketGameService,
    private keycloak: KeycloakService,
    private route: ActivatedRoute
  ) {}

  public get gameAsStarted(): boolean | undefined {
    return this.gameDto !== undefined
      ? this.gameDto!.whiteUserUuid !== undefined && this.gameDto!.blackUserUuid !== undefined
      : undefined;
  }

  ngOnInit(): void {
    this.restGameService.get(this.route.snapshot.paramMap.get('gameFriendlyId')!).subscribe({
      next: (gameDto) => {
        this.gameDto = gameDto;
        this.gameModel = GameSaveMapper.convertToModel(gameDto.gameSave!);
        this.keycloak.loadUserProfile().then((userProfile) => {
          this.userUuid = userProfile.id;
          this.userSide =
            this.gameDto?.whiteUserUuid === this.userUuid
              ? PieceSide.WHITE
              : this.gameDto?.blackUserUuid === this.userUuid
              ? PieceSide.BLACK
              : null;
        });
        this.subscribeToGameTopic();
      },
      error: (err) => {
        onHttpError(this.toastr, err, 'An error occurred while retrieving the game.');
      },
    });
    this.keycloakEventSubscription = this.keycloak.keycloakEvents$.subscribe({
      next: (event) => {
        if (event.type === KeycloakEventType.OnTokenExpired) {
          this.keycloak.updateToken();
        }
      },
    });
  }

  ngOnDestroy() {
    this.gameUpdateSubscription?.unsubscribe();
    this.gameUpdateErrorSubscription?.unsubscribe();
    this.keycloakEventSubscription?.unsubscribe();
  }

  onMove(pieceMove: PieceMove) {
    this.websocketGameService.updateGame(
      this.gameDto!.friendlyId,
      new GameUpdateMovePieceMessageDto(
        CoordinateMapper.convertToDto(pieceMove.from),
        CoordinateMapper.convertToDto(pieceMove.to),
        pieceMove.wantedPromotionPieceType !== undefined
          ? PieceTypeMapper.convertToDto(pieceMove.wantedPromotionPieceType)
          : undefined
      )
    );
  }

  onSurrender() {
    this.websocketGameService.updateGame(this.gameDto!.friendlyId, new GameUpdateSurrenderMessageDto());
  }

  async subscribeToGameTopic() {
    this.gameUpdateSubscription = this.websocketGameService.subscribeToUpdate(this.gameDto!.friendlyId).subscribe({
      next: (gameMessageDto: GameBaseMessageDto) => {
        if (gameMessageDto instanceof GameMovePieceMessageDto) {
          this.onGameMovePieceMessage(gameMessageDto);
        } else if (gameMessageDto instanceof GameSurrenderMessageDto) {
          this.onSurrenderMessage(gameMessageDto);
        } else if (gameMessageDto instanceof GameJoinMessageDto) {
          this.gameDto!.blackUserUuid = gameMessageDto.emitter;
        }
      },
    });
    let reloadPageErrorToast: ActiveToast<any>;

    this.gameUpdateErrorSubscription = (
      await this.websocketGameService.subscribeToUpdateError(this.gameDto!.friendlyId)
    ).subscribe({
      next: (errorDto: ErrorDto) => {
        if (reloadPageErrorToast === undefined) {
          reloadPageErrorToast = onError(
            this.toastr,
            errorDto,
            'An error occurred while making a action in the game. Page will automatically reload in 7.5 seconds.'
          );
          setTimeout(() => window.location.reload(), 7500);
        }
      },
    });
    this.websocketGameService.correlateErrors.subscribe({
      next: (error: IFrame) => {
        if (reloadPageErrorToast === undefined) {
          console.error(error);
          reloadPageErrorToast = showErrorToast(
            this.toastr,
            'An expected error occurred. Page will automatically reload in 7.5 seconds.'
          );
          setTimeout(() => window.location.reload(), 7500);
        }
      },
    });
  }

  onSurrenderMessage(gameSurrenderMessageDto: GameSurrenderMessageDto) {
    const pieceSide =
      gameSurrenderMessageDto.emitter === this.gameDto!.whiteUserUuid ? PieceSide.WHITE : PieceSide.BLACK;
    const supposedGameState =
      pieceSide === PieceSide.WHITE ? GameState.BLACK_WON_BY_SURRENDER : GameState.WHITE_WON_BY_SURRENDER;
    if (this.gameComponent.game.state !== supposedGameState) {
      this.gameComponent.game.surrender(pieceSide);
    }
  }

  onGameMovePieceMessage(gameMovePieceMessageDto: GameMovePieceMessageDto) {
    const from = CoordinateMapper.convertToModel(gameMovePieceMessageDto.from);
    const to = CoordinateMapper.convertToModel(gameMovePieceMessageDto.to);
    if (!from.equals(this.gameComponent.game.lastMove?.from) || !to.equals(this.gameComponent.game.lastMove?.to)) {
      this.gameComponent.movePiece(
        new MovePiece(
          gameMovePieceMessageDto.emitter === this.gameDto!.whiteUserUuid ? PieceSide.WHITE : PieceSide.BLACK,
          from,
          to,
          gameMovePieceMessageDto.wantedPromotionPieceType !== undefined
            ? PieceTypeMapper.convertToModel(gameMovePieceMessageDto.wantedPromotionPieceType)
            : undefined
        )
      );
    }
  }
}
