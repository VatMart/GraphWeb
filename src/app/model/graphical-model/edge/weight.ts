import {Sprite, Text} from "pixi.js";
import {GraphicalUtils, Point} from "../../../utils/graphical-utils";
import {TextStyleFontWeight} from "pixi.js/lib/scene/text/TextStyle";
import {ConfService} from "../../../service/config/conf.service";

export class Weight extends Sprite {

  private _value: number;

  private _text: Text;

  private _weightStyle: WeightStyle;

  /**
   * If edge is curved, this is the center of the curve.
   */
  private _curveCenter: Point = {x: 0, y: 0};

  constructor(value: number, weightStyle?: WeightStyle) {
    super();
    this.anchor.set(0.5);
    this._value = value;
    this._text = new Text({text: value.toString(), anchor: 0.5});
    this._weightStyle = weightStyle ? weightStyle : ConfService.DEFAULT_WEIGHT_STYLE;
    this.interactive = true;
    this.applyTextStyle(this._weightStyle.text);
    this.addChild(this.text);
  }

  move(startPoint: Point, endPoint: Point, isEdgeLoop: boolean = false): void {
    const midpoint = isEdgeLoop ? this.curveCenter : GraphicalUtils.midpoint(startPoint, endPoint);
    this.x = midpoint.x;
    this.y = midpoint.y;
  }

  get value(): number {
    return this._value;
  }

  set value(value: number) {
    this._value = value;
  }

  get text(): Text {
    return this._text;
  }

  set text(value: Text) {
    this._text = value;
  }

  get weightStyle(): WeightStyle {
    return this._weightStyle;
  }

  set weightStyle(value: WeightStyle) {
    this._weightStyle = value;
    this.applyTextStyle(value.text);
  }

  get curveCenter(): Point {
    return this._curveCenter;
  }

  set curveCenter(value: Point) {
    this._curveCenter = value;
  }

  applyTextStyle(textStyle: WeightTextStyle): void {
    this._text.style = {
      fill: textStyle.labelColor,
      fontSize: textStyle.size,
      fontFamily: textStyle.labelFontFamily,
      fontWeight: textStyle.labelFontWeight
    };
  }
}

export interface WeightStyle {
  color: string;
  strokeWidth: number;
  strokeColor: string;
  text: WeightTextStyle;
}

export interface WeightTextStyle {
  size: number;
  labelColor: string;
  labelFontFamily: string;
  labelFontWeight: TextStyleFontWeight;
}
