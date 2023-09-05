import { Game, LastMove } from '../../../common/engine/internal';
import { CoordinateMapper } from '../../piece/mapper/coordinateMapper';
import { PieceMapper } from '../../piece/mapper/pieceMapper';
import { PieceSideMapper } from '../../piece/mapper/pieceSideMapper';
import { GameSaveDto } from '../dto/response/gameSaveDto';
import { GameStateMapper } from './gameStateMapper';

export class GameSaveMapper {
  public static convertToModel(gameSaveDto: GameSaveDto): Game {
    return Game.fromExistingGame(
      GameStateMapper.convertToModel(gameSaveDto.state),
      PieceSideMapper.convertToModel(gameSaveDto.sideTurn),
      gameSaveDto.lastMoveFrom !== undefined
        ? ({
            from: CoordinateMapper.convertToModel(gameSaveDto.lastMoveFrom),
            to: CoordinateMapper.convertToModel(gameSaveDto.lastMoveTo),
          } as LastMove)
        : undefined,
      gameSaveDto.pieces!.map((pieceDto) => PieceMapper.convertToModel(pieceDto)),
      gameSaveDto.history!.map((piecesDto) => piecesDto!.map((pieceDto) => PieceMapper.convertToModel(pieceDto)))
    );
  }
}
