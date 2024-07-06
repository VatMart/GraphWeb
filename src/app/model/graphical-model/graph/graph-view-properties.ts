import {TextStyleFontWeight} from "pixi.js/lib/scene/text/TextStyle";
import {Radius} from "../node/radius";
import {GraphOrientation} from "../../orientation";

/**
 * Graph view properties class.
 */
export interface GraphViewProperties {
  graphStyle: GraphViewStyle;
  nodeProperties: NodeProperties;
  edgeProperties: EdgeProperties;
  graphOrientation: GraphOrientation;
  showGrid: boolean;
  enableForceMode: boolean;
  enableCenterForce: boolean;
  enableLinkForce: boolean;
}

/**
 * Node properties class.
 */
export interface NodeProperties {
  showLabel: boolean;
  dynamicNodeSize: boolean;
}

/**
 * Edge properties class.
 */
export interface EdgeProperties {
  showWeight: boolean;
  dynamicEdgeWeightValue: boolean;
}

/**
 * Graph view style class.
 */
export interface GraphViewStyle {
  name: string;
  nodeStyle: NodeStyle;
  edgeStyle: EdgeStyle;
}

// Node styles
export interface NodeStyle {
  radius: Radius;
  fillNode: string;
  strokeColor: string;
  strokeWidth: number;
  labelStyle: NodeLabelStyle;
}

export interface NodeLabelStyle {
  labelColor: string;
  labelFontSize: number;
  labelFontFamily: string;
  labelFontWeight: string;
}

// Edge styles
export interface EdgeStyle {
  strokeColor: string;
  strokeWidth: number;
  weight: WeightStyle;
  arrow: ArrowStyle;
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

export interface ArrowStyle {
  size: number;
  color: string;
  strokeWidth: number;
  strokeColor: string;
}


