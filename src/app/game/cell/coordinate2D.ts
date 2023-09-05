export class Coordinate2D {
  public static readonly ORIGIN = new Coordinate2D(0, 0);

  public static readonly DIRECTION_VECTORS = [
    new Coordinate2D(150, 87),
    new Coordinate2D(150, -87),
    new Coordinate2D(0, -173),
    new Coordinate2D(-150, -87),
    new Coordinate2D(-150, 87),
    new Coordinate2D(0, 173),
  ];

  private readonly _x;
  private readonly _y;

  public get x(): number {
    return this._x;
  }

  public get y(): number {
    return this._y;
  }

  constructor(x: number, y: number) {
    this._x = x;
    this._y = y;
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
  public static ring(center: Coordinate2D, radius: number): Coordinate2D[] {
    const results: Coordinate2D[] = [];
    let hex = center.add(Coordinate2D.DIRECTION_VECTORS[4].multiply(radius));
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < radius; j++) {
        results.push(hex);
        hex = hex.add(Coordinate2D.DIRECTION_VECTORS[i]);
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
  public static spiral(center: Coordinate2D, radius: number): Coordinate2D[] {
    const results: Coordinate2D[] = [];
    results.push(center);
    for (let i = 1; i <= radius; i++) {
      results.push(...Coordinate2D.ring(center, i));
    }
    return results;
  }

  public add(coordinate: Coordinate2D): Coordinate2D {
    return new Coordinate2D(this._x + coordinate.x, this._y + coordinate.y);
  }

  public multiply(multiplier: number): Coordinate2D {
    return new Coordinate2D(this._x * multiplier, this._y * multiplier);
  }

  public equals(coordinate: Coordinate2D | undefined): boolean {
    if (coordinate === undefined) {
      return false;
    }
    return this._x === coordinate.x && this._y === coordinate.y;
  }
}
