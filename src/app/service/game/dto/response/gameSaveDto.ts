import { CoordinateDto } from 'src/app/service/piece/dto/coordinateDto';
import { PieceSideDto } from 'src/app/service/piece/dto/enumeration/pieceSideDto';
import { PieceDto } from 'src/app/service/piece/dto/response/pieceDto';
import { GameStateDto } from '../enumeration/gameStateDto';

export class GameSaveDto {
  constructor(
    public state: GameStateDto,
    public sideTurn: PieceSideDto,
    public lastMoveFrom: CoordinateDto,
    public lastMoveTo: CoordinateDto,
    public pieces?: PieceDto[],
    public history?: PieceDto[][]
  ) {}
}
