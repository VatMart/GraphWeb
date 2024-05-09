import {Graphics} from "pixi.js";
import {GraphicalUtils, Point} from "../../../utils/graphical-utils";

export class Arrow extends Graphics {

  constructor() {
    super();
  }

  /**
   * Draw arrow. End point is the arrow head.
   * Returns the center point of arrow
   */
  public draw(startPoint: Point, endPoint: Point, arrowStyle?: ArrowStyle): Point {
    this.clear();
    let actualArrowStyle = arrowStyle ? arrowStyle : DEFAULT_ARROW_STYLE;
    const distance = GraphicalUtils.distanceBetween(endPoint, startPoint);
    let ko = actualArrowStyle.size / distance;
    const base: Point = {
      x: endPoint.x + (startPoint.x - endPoint.x) * ko,
      y: endPoint.y + (startPoint.y - endPoint.y) * ko};
    ko = (actualArrowStyle.size / 1.6) / distance;
    const curve: Point = {
      x: endPoint.x + (startPoint.x - endPoint.x) * ko,
      y: endPoint.y + (startPoint.y - endPoint.y) * ko};
    const radius = actualArrowStyle.size + 2;
    const angle = Math.atan2(base.y - endPoint.y, base.x - endPoint.x);
    const left: Point = {
      x: endPoint.x + radius * Math.cos(GraphicalUtils.toRadians(30) + angle),
      y: endPoint.y + radius * Math.sin(GraphicalUtils.toRadians(30) + angle)};
    const right: Point = {
      x: endPoint.x + radius * Math.cos(GraphicalUtils.toRadians(330) + angle),
      y: endPoint.y + radius * Math.sin(GraphicalUtils.toRadians(330) + angle)};

    this.moveTo(endPoint.x, endPoint.y)
      .lineTo(left.x, left.y)
      .quadraticCurveTo(curve.x, curve.y, right.x, right.y)
      .closePath()
      .fill(actualArrowStyle.color)
      .stroke({width: actualArrowStyle.strokeWidth, color: actualArrowStyle.strokeColor}); // TODO
    return GraphicalUtils.midpoint(base, endPoint);
  }

}

export const DEFAULT_ARROW_STYLE: ArrowStyle = {
  size: 25,
  color: 'red',
  strokeWidth: 3,
  strokeColor: 'black'
}

export const SELECTED_ARROW_STYLE: ArrowStyle = {
  size: 25,
  color: '#006FFF',
  strokeWidth: 3,
  strokeColor: '#006FFF'
}

export interface ArrowStyle {
  size: number;
  color: string;
  strokeWidth: number;
  strokeColor: string;
}
