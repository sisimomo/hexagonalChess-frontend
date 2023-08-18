import { CoordinateDto } from '../coordinateDto';
import { PieceSideDto } from '../enumeration/pieceSideDto';
import { PieceTypeDto } from '../enumeration/pieceTypeDto';

export class PieceDto {
  constructor(public type: PieceTypeDto, public side: PieceSideDto, public coordinate: CoordinateDto) {}
}
