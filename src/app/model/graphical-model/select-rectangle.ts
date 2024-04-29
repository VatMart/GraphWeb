import {Graphics} from "pixi.js";
import {Point, Rectangle} from "../../utils/graphical-utils";

export class SelectRectangle extends Graphics {

  private fillColor: string = '#FFC618';  // Convert hex string to number if needed
  private fillAlpha: number = 0.3;

  private xRect: number = 0;
  private yRect: number = 0;
  private widthRect: number = 0;
  private heightRect: number = 0;

  constructor() {
    super();
    this.rect(0, 0, 4, 4)
      .fill({color: this.fillColor, alpha: this.fillAlpha});
  }

  public updatePosition(startPoint: Point, endPoint: Point): void {
    this.pivot = endPoint.x < startPoint.x && endPoint.y < startPoint.y ? {x: 1, y: 1} :
      endPoint.x > startPoint.x && endPoint.y > startPoint.y ? {x: -1, y: -1} :
        endPoint.x < startPoint.x && endPoint.y > startPoint.y ? {x: 1, y: -1} : {x: -1, y: 1};
    this.scale.x = Math.abs(endPoint.x - startPoint.x)/4;
    this.scale.y = Math.abs(endPoint.y - startPoint.y)/4;

    // Position the rectangle based on the smaller of the start or end points
    this.x = (endPoint.x > startPoint.x ? startPoint.x - this.scale.x : startPoint.x - this.scale.x*3);
    this.y = (endPoint.y > startPoint.y ? startPoint.y - this.scale.y : startPoint.y - this.scale.y*3);

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
