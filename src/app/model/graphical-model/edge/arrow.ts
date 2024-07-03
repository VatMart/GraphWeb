import {Graphics} from "pixi.js";
import {GraphicalUtils, Point} from "../../../utils/graphical-utils";
import {ConfService} from "../../../service/config/conf.service";
import {ArrowStyle} from "../graph/graph-view-properties";

/**
 * Graphical representation of arrow for edge
 */
export class Arrow extends Graphics {

  private _arrowStyle: ArrowStyle;

  constructor(arrowStyle?: ArrowStyle) {
    super();
    this._arrowStyle = arrowStyle ? arrowStyle : ConfService.currentEdgeStyle.arrow;
  }

  /**
   * Draw arrow. End point is the arrow head.
   * Returns the center point of arrow
   */
  public draw(startPoint: Point, endPoint: Point): Point {
    this.clear();
    const distance = GraphicalUtils.distanceBetween(endPoint, startPoint);
    let ko = this._arrowStyle.size / distance;
    const base: Point = {
      x: endPoint.x + (startPoint.x - endPoint.x) * ko,
      y: endPoint.y + (startPoint.y - endPoint.y) * ko};
    ko = (this._arrowStyle.size / 1.6) / distance;
    const curve: Point = {
      x: endPoint.x + (startPoint.x - endPoint.x) * ko,
      y: endPoint.y + (startPoint.y - endPoint.y) * ko};
    const radius = this._arrowStyle.size + 2;
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
      .fill(this._arrowStyle.color)
      .stroke({width: this._arrowStyle.strokeWidth, color: this._arrowStyle.strokeColor}); // TODO
    return GraphicalUtils.midpoint(base, endPoint);
  }

  get arrowStyle(): ArrowStyle {
    return this._arrowStyle;
  }

  set arrowStyle(value: ArrowStyle) {
    this._arrowStyle = value;
  }
}
