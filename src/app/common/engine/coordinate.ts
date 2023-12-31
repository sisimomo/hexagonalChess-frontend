export class Coordinate {
  public static readonly ORIGIN = new Coordinate(0, 0, 0);

  public static readonly DIRECTION_VECTORS = [
    new Coordinate(1, 0, -1),
    new Coordinate(1, -1, 0),
    new Coordinate(0, -1, 1),
    new Coordinate(-1, 0, 1),
    new Coordinate(-1, 1, 0),
    new Coordinate(0, 1, -1),
  ];

  public static readonly DIAGONAL_VECTORS = [
    new Coordinate(2, -1, -1),
    new Coordinate(1, -2, 1),
    new Coordinate(-1, -1, 2),
    new Coordinate(-2, 1, 1),
    new Coordinate(-1, 2, -1),
    new Coordinate(1, 1, -2),
  ];

  public static readonly FIRST_COORDINATE_OF_EACH_ROW = {
    1: new Coordinate(-5, 5, 0),
    2: new Coordinate(-5, 4, 1),
    3: new Coordinate(-5, 3, 2),
    4: new Coordinate(-5, 2, 3),
    5: new Coordinate(-5, 1, 4),
    6: new Coordinate(-5, 0, 5),
    7: new Coordinate(-4, -1, 5),
    8: new Coordinate(-3, -2, 5),
    9: new Coordinate(-2, -3, 5),
    10: new Coordinate(-1, -4, 5),
    11: new Coordinate(0, -5, 5),
  };

  public static readonly FIRST_COORDINATE_OF_EACH_COLUMN: { [key: string]: Coordinate } = {
    a: new Coordinate(-5, 5, 0),
    b: new Coordinate(-4, 5, -1),
    c: new Coordinate(-3, 5, -2),
    d: new Coordinate(-2, 5, -3),
    e: new Coordinate(-1, 5, -4),
    f: new Coordinate(0, 5, -5),
    g: new Coordinate(1, 4, -5),
    h: new Coordinate(2, 3, -5),
    i: new Coordinate(3, 2, -5),
    j: new Coordinate(4, 1, -5),
    k: new Coordinate(5, 0, -5),
  };

  private readonly _q;
  private readonly _r;
  private readonly _s;

  constructor(q: number, r: number, s: number) {
    this._q = q;
    this._r = r;
    this._s = s;
  }

  /**
   * Generates a list of {@link Coordinate}s in a hexagonal ring shape around a given center
   * coordinate.
   * <a href="https://www.redblobgames.com/grids/hexagons/#rings-single">Source</a>
   *
   * @param center The center of the ring.
   * @param radius The distance from the center coordinate to the outermost coordinates in the ring.
   * @return A List of {@link Coordinate} objects.
   */
  public static ring(center: Coordinate, radius: number): Coordinate[] {
    const results: Coordinate[] = [];
    let hex = center.add(Coordinate.DIRECTION_VECTORS[4].multiply(radius));
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < radius; j++) {
        results.push(hex);
        hex = hex.add(Coordinate.DIRECTION_VECTORS[i]);
      }
    }
    return results;
  }

  /**
   * A list of {@link Coordinate}s in a spiral pattern, starting from a given center coordinate and
   * expanding outwards up to a specified radius.
   * <a href="https://www.redblobgames.com/grids/hexagons/#rings-spiral">Source</a>
   *
   * @param center The center of the ring.
   * @param radius The distance from the center coordinate to the outermost coordinates in the spiral.
   * @return The method is returning a List of Coordinate objects.
   */
  public static spiral(center: Coordinate, radius: number): Coordinate[] {
    const results: Coordinate[] = [];
    results.push(center);
    for (let i = 1; i <= radius; i++) {
      results.push(...Coordinate.ring(center, i));
    }
    return results;
  }

  public get q(): number {
    return this._q;
  }

  public get r(): number {
    return this._r;
  }

  public get s(): number {
    return this._s;
  }

  public add(coordinate: Coordinate): Coordinate {
    return new Coordinate(this._q + coordinate.q, this._r + coordinate.r, this._s + coordinate.s);
  }

  public subtract(coordinate: Coordinate): Coordinate {
    return new Coordinate(this._q - coordinate.q, this._r - coordinate.r, this._s - coordinate.s);
  }

  public multiply(multiplier: number): Coordinate {
    return new Coordinate(this._q * multiplier, this._r * multiplier, this._s * multiplier);
  }

  public horizontalReflection(): Coordinate {
    return new Coordinate(this._q, this._s, this._r);
  }

  public verticalReflection(): Coordinate {
    return new Coordinate(this._q * -1, this._s * -1, this._r * -1);
  }

  public distance(coordinate: Coordinate): number {
    const vec = this.subtract(coordinate);
    return (Math.abs(vec.q) + Math.abs(vec.r) + Math.abs(vec.s)) / 2;
  }

  public get cellColumnNotation(): string {
    let firstCoordinateOfColumn: Coordinate = this;
    while (firstCoordinateOfColumn.r !== 5 && firstCoordinateOfColumn.s !== -5) {
      firstCoordinateOfColumn = firstCoordinateOfColumn.add(Coordinate.DIRECTION_VECTORS[5]);
    }
    return Object.entries(Coordinate.FIRST_COORDINATE_OF_EACH_COLUMN).find((key) =>
      firstCoordinateOfColumn.equals(key[1])
    )![0];
  }

  public get cellRowNotation(): string {
    let firstCoordinateOfRow: Coordinate = this;
    while (firstCoordinateOfRow.q !== -5 && firstCoordinateOfRow.s !== 5) {
      firstCoordinateOfRow = firstCoordinateOfRow.add(Coordinate.DIRECTION_VECTORS[3]);
    }
    return Object.entries(Coordinate.FIRST_COORDINATE_OF_EACH_ROW).find((key) =>
      firstCoordinateOfRow.equals(key[1])
    )![0];
  }

  public get cellNotation(): string {
    return this.cellColumnNotation + this.cellRowNotation;
  }

  public equals(coordinate?: Coordinate): boolean {
    if (coordinate === undefined) {
      return false;
    }
    return this._q === coordinate.q && this._r === coordinate.r && this._s === coordinate.s;
  }
}

export interface LastMove {
  from: Coordinate;
  to: Coordinate;
}
