import { Coordinate } from '../../../common/engine/internal';
import { CoordinateDto } from '../dto/coordinateDto';

export class CoordinateMapper {
  public static convertToModel(coordinateDto: CoordinateDto): Coordinate {
    return new Coordinate(coordinateDto.q, coordinateDto.r, coordinateDto.s);
  }
  public static convertToDto(coordinateDto: Coordinate): CoordinateDto {
    return { q: coordinateDto.q, r: coordinateDto.r, s: coordinateDto.s } as CoordinateDto;
  }
}
