import { CoordinateDto } from 'src/app/service/piece/dto/coordinateDto';
import { PieceTypeDto } from 'src/app/service/piece/dto/enumeration/pieceTypeDto';
import { GameMessageType } from '../../enumeration/gameMessageType';

export abstract class GameBaseMessageDto {
  constructor(public emitter: string) {}

  static factory(json: any): GameBaseMessageDto {
    switch (json.type as GameMessageType) {
      case GameMessageType.JOIN:
        return new GameJoinMessageDto(json.emitter);
      case GameMessageType.SURRENDER:
        return new GameSurrenderMessageDto(json.emitter);
      case GameMessageType.MOVE_PIECE:
        return new GameMovePieceMessageDto(json.emitter, json.from, json.to, json.wantedPromotionPieceType);
    }
  }
}

export class GameJoinMessageDto extends GameBaseMessageDto {
  constructor(emitter: string) {
    super(emitter);
  }
}

export class GameSurrenderMessageDto extends GameBaseMessageDto {
  constructor(emitter: string) {
    super(emitter);
  }
}

export class GameMovePieceMessageDto extends GameBaseMessageDto {
  constructor(
    emitter: string,
    public from: CoordinateDto,
    public to: CoordinateDto,
    public wantedPromotionPieceType?: PieceTypeDto
  ) {
    super(emitter);
    this.from = from;
    this.to = to;
    this.wantedPromotionPieceType = wantedPromotionPieceType;
  }
}
