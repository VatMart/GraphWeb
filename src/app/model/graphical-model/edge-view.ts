import {GraphElement} from "./graph-element";
import {Edge} from "../edge";
import {Point} from "../../utils/graphical-utils";
import {NodeView} from "./node-view";
import {Graphics} from "pixi.js";

export class EdgeView extends Graphics implements GraphElement {
  // Math model
  private _edge: Edge;

  private startNode: NodeView;
  private endNode: NodeView;

  private _startCoordinates: Point;
  private _endCoordinates: Point;

  private nodeStyle: EdgeStyle = DEFAULT_EDGE_STYLE;

  public static createFromGraphics(edge: Edge, startNode: NodeView, endNode: NodeView, startCoordinates: Point,
                                   endCoordinates: Point, graphics: Graphics) {

  }

  constructor(edge: Edge, startNode: NodeView, endNode: NodeView, startCoordinates: Point, endCoordinates: Point,
              nodeStyle: EdgeStyle) {
    super();
    this._edge = edge;
    this.startNode = startNode;
    this.endNode = endNode;
    this._startCoordinates = startCoordinates;
    this._endCoordinates = endCoordinates;
    this.nodeStyle = nodeStyle;
  }

  getIndex(): string | number {
    return this._edge.edgeIndex.value;
  }

  move(): void {
  }

  get edge(): Edge {
    return this._edge;
  }
}

export const DEFAULT_EDGE_STYLE: EdgeStyle = {
  strokeColor: '#000000',
  strokeWidth: 2
};

export interface EdgeStyle {
  strokeColor: string;
  strokeWidth: number;
}

export interface EdgeWeightStyle {
  // TODO add properties
}
