import { PieceType } from '../../../common/engine/internal';
import { PieceTypeDto } from '../dto/enumeration/pieceTypeDto';

export class PieceTypeMapper {
  public static convertToModel(pieceTypeDto: PieceTypeDto): PieceType {
    switch (pieceTypeDto) {
      case PieceTypeDto.BISHOP:
        return PieceType.BISHOP;
      case PieceTypeDto.KING:
        return PieceType.KING;
      case PieceTypeDto.KNIGHT:
        return PieceType.KNIGHT;
      case PieceTypeDto.PAWN:
        return PieceType.PAWN;
      case PieceTypeDto.QUEEN:
        return PieceType.QUEEN;
      case PieceTypeDto.ROOK:
        return PieceType.ROOK;
    }
  }
  public static convertToDto(pieceType: PieceType): PieceTypeDto {
    switch (pieceType) {
      case PieceType.BISHOP:
        return PieceTypeDto.BISHOP;
      case PieceType.KING:
        return PieceTypeDto.KING;
      case PieceType.KNIGHT:
        return PieceTypeDto.KNIGHT;
      case PieceType.PAWN:
        return PieceTypeDto.PAWN;
      case PieceType.QUEEN:
        return PieceTypeDto.QUEEN;
      case PieceType.ROOK:
        return PieceTypeDto.ROOK;
    }
  }
}
