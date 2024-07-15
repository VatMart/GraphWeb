/**
 * Interface for node radius.
 */
export interface Radius {

  /**
   * Returns the radius value.
   */
  getRadius(): number;

  /**
   * Sets the radius value.
   * @param value - The radius value.
   */
  setRadius(value: number): void;
}

/**
 * Default node radius class.
 */
export class DefaultRadius implements Radius {
  value: number;

  constructor(value: number) {
    this.value = value;
  }

  getRadius(): number {
    return this.value;
  }

  setRadius(value: number): void {
    this.value = value;
  }
}

/**
 * Dynamic node radius class.
 * The radius is calculated based on the base value and the number of adjacent edges.
 */
export class DynamicRadius implements Radius {
  private readonly maxExtent: number = 25; // Maximum extent of the radius
  private _baseValue: number;
  private _adjEdges: number;

  constructor(baseValue: number, adjEdges: number) {
    this._baseValue = baseValue;
    this._adjEdges = adjEdges;
  }

  getRadius(): number {
    if (this._adjEdges <= 1) { // If there are no adjacent edges or only one
      return this._baseValue;
    }
    return Math.min(this._baseValue + this._adjEdges*3, this._baseValue + this.maxExtent);
  }

  setRadius(value: number): void {
    this._baseValue = value;
  }

  get baseValue(): number {
    return this._baseValue;
  }

  get adjEdges(): number {
    return this._adjEdges;
  }

  set adjEdges(value: number) {
    this._adjEdges = value;
  }
}
