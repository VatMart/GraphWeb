import {Graphics} from "pixi.js";
import {Point, Rectangle} from "../../utils/graphical-utils";

/**
 * Class for drawing rectangle for selecting graph elements
 */
export class SelectRectangle extends Graphics {

  private fillColor: string = '#FFC618';
  private fillAlpha: number = 0.2;

  private xRect: number = 0;
  private yRect: number = 0;
  private widthRect: number = 0;
  private heightRect: number = 0;

  constructor() {
    super();
    this.rect(0, 0, 4, 4)
      .fill({color: this.fillColor, alpha: this.fillAlpha});
    this.zIndex = 1000; // On top of all elements
  }

  /**
   * Update position of rectangle
   */
  public updatePosition(startPoint: Point, endPoint: Point): void {
    // Set pivot and scale
    this.pivot = endPoint.x < startPoint.x && endPoint.y < startPoint.y ? {x: 1, y: 1} :
      endPoint.x > startPoint.x && endPoint.y > startPoint.y ? {x: -1, y: -1} :
        endPoint.x < startPoint.x && endPoint.y > startPoint.y ? {x: 1, y: -1} : {x: -1, y: 1};
    this.scale.x = Math.abs(endPoint.x - startPoint.x)/4;
    this.scale.y = Math.abs(endPoint.y - startPoint.y)/4;

    // Adjust position
    this.x = (endPoint.x > startPoint.x ? startPoint.x - this.scale.x : startPoint.x - this.scale.x*3);
    this.y = (endPoint.y > startPoint.y ? startPoint.y - this.scale.y : startPoint.y - this.scale.y*3);

    // Calculate actual size of rectangle
    let newStartX = endPoint.x < startPoint.x ? endPoint.x : startPoint.x;
    let newStartY = endPoint.y < startPoint.y ? endPoint.y : startPoint.y;
    let width = Math.abs(endPoint.x - startPoint.x);
    let height = Math.abs(endPoint.y - startPoint.y);
    this.xRect = newStartX;
    this.yRect = newStartY;
    this.widthRect = width;
    this.heightRect = height;
  }

  public toRectangle(): Rectangle {
    return {
      x: this.xRect,
      y: this.yRect,
      width: this.widthRect,
      height: this.heightRect
    }
  }
}
