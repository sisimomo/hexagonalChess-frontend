import { Coordinate } from '../internal';

export class PossibleMovement {
  constructor(private _vector: Coordinate, private _maxRange: number) {}

  public get vector(): Coordinate {
    return this._vector;
  }

  public get maxRange(): number {
    return this._maxRange;
  }
}
