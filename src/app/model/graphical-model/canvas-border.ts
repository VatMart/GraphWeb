import {Graphics} from "pixi.js";

/**
 * Graphical representation of canvas border
 */
export class CanvasBorder extends Graphics {

  private _boundaryXMin: number;
  private _boundaryXMax: number;
  private _boundaryYMin: number;
  private _boundaryYMax: number;

  constructor(boundaryXMin: number, boundaryXMax: number, boundaryYMin: number, boundaryYMax: number) {
    super();
    this._boundaryXMin = boundaryXMin;
    this._boundaryXMax = boundaryXMax;
    this._boundaryYMin = boundaryYMin;
    this._boundaryYMax = boundaryYMax;
  }

  /**
   * Draw border on canvas
   */
  drawBorder(): void {
    this.clear();
    this.rect(this._boundaryXMin, this._boundaryYMin, this._boundaryXMax - this._boundaryXMin,
      this._boundaryYMax - this._boundaryYMin)
      .fill('#fafafa')
      .stroke({width: 3, color: '#adadad'});
    this.zIndex = -1000;
  }

  /**
   * Check if node view is inside the canvas border
   */
  isNodeViewInside(x: number, y: number, radius?: number): boolean {
    if (radius) {
      return x - radius >= this._boundaryXMin && x + radius <= this._boundaryXMax
        && y - radius >= this._boundaryYMin && y + radius <= this._boundaryYMax;
    }
    return x >= this._boundaryXMin && x <= this._boundaryXMax
      && y >= this._boundaryYMin && y <= this._boundaryYMax;
  }

  get boundaryXMin(): number {
    return this._boundaryXMin;
  }

  get boundaryXMax(): number {
    return this._boundaryXMax;
  }

  get boundaryYMin(): number {
    return this._boundaryYMin;
  }

  get boundaryYMax(): number {
    return this._boundaryYMax;
  }
}
