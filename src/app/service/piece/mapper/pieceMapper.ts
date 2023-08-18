import { Piece } from '../../../common/engine/internal';
import { PieceDto } from '../dto/response/pieceDto';
import { CoordinateMapper } from './coordinateMapper';
import { PieceSideMapper } from './pieceSideMapper';
import { PieceTypeMapper } from './pieceTypeMapper';

export class PieceMapper {
  public static convertToModel(pieceDto: PieceDto): Piece {
    return Piece.createPiece(
      PieceTypeMapper.convertToModel(pieceDto.type),
      PieceSideMapper.convertToModel(pieceDto.side),
      CoordinateMapper.convertToModel(pieceDto.coordinate)
    );
  }
}
