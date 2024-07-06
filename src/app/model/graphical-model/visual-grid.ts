import {Graphics} from "pixi.js";

/**
 * Graphical representation of canvas border
 */
export class VisualGrid extends Graphics {

  private cellSize: number;
  private boundaryXMin: number;
  private boundaryXMax: number;
  private boundaryYMin: number;
  private boundaryYMax: number;

  public static DEFAULT_CELL_SIZE = 68;

  constructor(cellSize: number, boundaryXMin: number, boundaryXMax: number, boundaryYMin: number,
              boundaryYMax: number) {
    super();
    this.cellSize = cellSize;
    this.boundaryXMin = boundaryXMin;
    this.boundaryXMax = boundaryXMax;
    this.boundaryYMin = boundaryYMin;
    this.boundaryYMax = boundaryYMax;
  }

  /**
   * Draw grid on canvas
   */
  drawGrid(): void {
    this.clear();
    for (let x = this.boundaryXMin; x <= this.boundaryXMax; x += this.cellSize) {
      this.moveTo(x, this.boundaryYMin);
      this.lineTo(x, this.boundaryYMax);
    }
    for (let y = this.boundaryYMin; y <= this.boundaryYMax; y += this.cellSize) {
      this.moveTo(this.boundaryXMin, y);
      this.lineTo(this.boundaryXMax, y);
    }
    this.stroke({width: 1, color: '#C0C0C0', alpha: 0.5});
    this.zIndex = -1001;
  }
}
