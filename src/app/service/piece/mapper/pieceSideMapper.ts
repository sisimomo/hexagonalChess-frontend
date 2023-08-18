import { PieceSide } from '../../../common/engine/internal';
import { PieceSideDto } from '../dto/enumeration/pieceSideDto';

export class PieceSideMapper {
  public static convertToModel(pieceSideDto: PieceSideDto): PieceSide {
    switch (pieceSideDto) {
      case PieceSideDto.WHITE:
        return PieceSide.WHITE;
      case PieceSideDto.BLACK:
        return PieceSide.BLACK;
    }
  }
}
