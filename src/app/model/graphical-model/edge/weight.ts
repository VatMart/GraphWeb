import {Sprite, Text} from "pixi.js";
import {GraphicalUtils, Point} from "../../../utils/graphical-utils";
import {TextStyleFontWeight} from "pixi.js/lib/scene/text/TextStyle";

export class Weight extends Sprite {

  private value: number;

  private _text: Text;

  private _weightStyle: WeightStyle;

  constructor(value: number, weightStyle?: WeightStyle) {
    super();
    this.anchor.set(0.5);
    this.value = value;
    this._text = new Text({text: value.toString(), anchor: 0.5});
    this._weightStyle = weightStyle ? weightStyle : DEFAULT_WEIGHT_STYLE;
    this.applyTextStyle(this._weightStyle.text);
    this.addChild(this.text);
  }

  move(startPoint: Point, endPoint: Point): void {
    const midpoint = GraphicalUtils.midpoint(startPoint, endPoint);
    this.x = midpoint.x;
    this.y = midpoint.y;
  }

  get text(): Text {
    return this._text;
  }

  get weightStyle(): WeightStyle {
    return this._weightStyle;
  }

  set weightStyle(value: WeightStyle) {
    this._weightStyle = value;
    this.applyTextStyle(value.text);
  }

  applyTextStyle(textStyle: TextStyle): void {
    this._text.style = {
      fill: textStyle.labelColor,
      fontSize: textStyle.size,
      fontFamily: textStyle.labelFontFamily,
      fontWeight: textStyle.labelFontWeight
    };
  }
}

export const DEFAULT_TEXT_STYLE: TextStyle = {
  size: 20,
  labelColor: 'black',
  labelFontFamily: 'Calibri', // Calibri bold
  labelFontWeight: 'bold'
}

export const SELECTED_TEXT_STYLE: TextStyle = {
  size: 20,
  labelColor: '#006FFF',
  labelFontFamily: 'Calibri', // Calibri bold
  labelFontWeight: 'bold'
}

export const DEFAULT_WEIGHT_STYLE: WeightStyle = {
  color: 'white',
  strokeWidth: 4,
  strokeColor: 'black',
  text: DEFAULT_TEXT_STYLE
}

export const SELECTED_WEIGHT_STYLE: WeightStyle = {
  color: 'white',
  strokeWidth: 5,
  strokeColor: '#006FFF',
  text: SELECTED_TEXT_STYLE
}

export interface WeightStyle {
  color: string;
  strokeWidth: number;
  strokeColor: string;
  text: TextStyle;
}

export interface TextStyle {
  size: number;
  labelColor: string;
  labelFontFamily: string;
  labelFontWeight: TextStyleFontWeight;
}
