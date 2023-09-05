import { GameState } from '../../../common/engine/internal';
import { GameStateDto } from '../dto/enumeration/gameStateDto';

export class GameStateMapper {
  public static convertToModel(gameStateDto: GameStateDto): GameState {
    switch (gameStateDto) {
      case GameStateDto.IN_PROGRESS:
        return GameState.IN_PROGRESS;
      case GameStateDto.WHITE_WON:
        return GameState.WHITE_WON;
      case GameStateDto.BLACK_WON:
        return GameState.BLACK_WON;
      case GameStateDto.WHITE_WON_BY_SURRENDER:
        return GameState.WHITE_WON_BY_SURRENDER;
      case GameStateDto.BLACK_WON_BY_SURRENDER:
        return GameState.BLACK_WON_BY_SURRENDER;
      case GameStateDto.WHITE_IN_CHECK:
        return GameState.WHITE_IN_CHECK;
      case GameStateDto.BLACK_IN_CHECK:
        return GameState.BLACK_IN_CHECK;
      case GameStateDto.DRAW_STALEMATE:
        return GameState.DRAW_STALEMATE;
      case GameStateDto.DRAW_INSUFFICIENT_MATERIAL:
        return GameState.DRAW_INSUFFICIENT_MATERIAL;
      case GameStateDto.DRAW_THREEFOLD_REPETITION:
        return GameState.DRAW_THREEFOLD_REPETITION;
    }
  }
}
