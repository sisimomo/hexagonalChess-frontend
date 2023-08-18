import { CoordinateDto } from 'src/app/service/piece/dto/coordinateDto';
import { PieceTypeDto } from 'src/app/service/piece/dto/enumeration/pieceTypeDto';
import { GameMessageType } from '../../enumeration/gameMessageType';

export abstract class GameUpdateBaseMessageDto {
  constructor(public type: GameMessageType) {}
}

export class GameUpdateSurrenderMessageDto extends GameUpdateBaseMessageDto {
  constructor() {
    super(GameMessageType.SURRENDER);
  }
}

export class GameUpdateMovePieceMessageDto extends GameUpdateBaseMessageDto {
  constructor(public from: CoordinateDto, public to: CoordinateDto, public wantedPromotionPieceType?: PieceTypeDto) {
    super(GameMessageType.MOVE_PIECE);
    this.from = from;
    this.to = to;
    this.wantedPromotionPieceType = wantedPromotionPieceType;
  }
}
