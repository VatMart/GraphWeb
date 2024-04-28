import {Graphics} from "pixi.js";
import {Point, Rectangle} from "../../utils/graphical-utils";

export class SelectRectangle extends Graphics {

  private fillColor: string = '#FFC618';  // Convert hex string to number if needed
  private fillAlpha: number = 0.1;
  private strokeColor: string = '#FFC618';  // Convert hex string to number if needed
  private strokeWidth: number = 2;

  private xRect: number = 0;
  private yRect: number = 0;
  private widthRect: number = 0;
  private heightRect: number = 0;

  constructor() {
    super();
  }

  public updatePosition(startPoint: Point, endPoint: Point): void {
    this.clear();
    let newStartX = endPoint.x < startPoint.x ? endPoint.x : startPoint.x;
    let newStartY = endPoint.y < startPoint.y ? endPoint.y : startPoint.y;
    let width = Math.abs(endPoint.x - startPoint.x);
    let height = Math.abs(endPoint.y - startPoint.y);
    this.xRect = newStartX;
    this.yRect = newStartY;
    this.widthRect = width;
    this.heightRect = height;
    this.rect(newStartX, newStartY, width, height)
      .fill({color: this.fillColor, alpha: this.fillAlpha})
      .stroke({color: this.strokeColor, width: this.strokeWidth});
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
