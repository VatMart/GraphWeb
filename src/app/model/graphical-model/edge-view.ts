import {GraphElement} from "./graph-element";
import {Edge} from "../edge";
import {GraphicalUtils, Point} from "../../utils/graphical-utils";
import {NodeView} from "./node-view";
import {Graphics} from "pixi.js";

/**
 * Graphical representation of edge
 */
export class EdgeView extends Graphics implements GraphElement {
  // Math model
  private _edge: Edge;

  private _startNode: NodeView;
  private _endNode: NodeView;

  private _startCoordinates: Point;
  private _endCoordinates: Point;

  private nodeStyle: EdgeStyle = DEFAULT_EDGE_STYLE;

  public static createFrom(edge: Edge, startNode: NodeView, endNode: NodeView) : EdgeView {
    let edgeGraphical = new EdgeView(edge, startNode, endNode, DEFAULT_EDGE_STYLE);
    edgeGraphical.interactive = true;
    edgeGraphical.draw();
    return edgeGraphical;
  }

  constructor(edge: Edge, startNode: NodeView, endNode: NodeView,
              nodeStyle: EdgeStyle) {
    super();
    this._edge = edge;
    this._startNode = startNode;
    this._endNode = endNode;
    const points = this.resolveConnectors();
    this._startCoordinates = points[0];
    this._endCoordinates = points[1];
    this.nodeStyle = nodeStyle;
  }

  public draw() {
    this.clear();
    //console.log(`Drawing edge from x: ${this._startCoordinates.x}, y: ${this._startCoordinates.y} to x: ${this._endCoordinates.x}, y: ${this._endCoordinates.y}`); // TODO remove
    this.moveTo(this._startCoordinates.x, this._startCoordinates.y)
      .lineTo(this._endCoordinates.x, this._endCoordinates.y)
      .stroke({width: this.nodeStyle.strokeWidth, color: this.nodeStyle.strokeColor, cap: 'round'});
    this.zIndex = 0;
  }

  getIndex(): string | number {
    return this._edge.edgeIndex.value;
  }

  move(): void {
    const points = this.resolveConnectors();
    this._startCoordinates = points[0];
    this._endCoordinates = points[1];
    this.draw();
  }

  /**
   * Resolve coordinates of connectors of edge
   * @return [startConnector, endConnector] - coordinates of start and end nodes connectors
   */
  public resolveConnectors(): [Point, Point] {
    const centerNode1 = this._startNode.centerCoordinates();
    const centerNode2 = this._endNode.centerCoordinates();
    const distance = GraphicalUtils.distanceBetween(centerNode1, centerNode2);
    const ko1 = (this._startNode.width / 2) / distance;
    const xNode1 = centerNode1.x + (centerNode2.x - centerNode1.x) * ko1;
    const yNode1 = centerNode1.y + (centerNode2.y - centerNode1.y) * ko1;
    const ko2 = (this._endNode.width / 2) / distance;
    const xNode2 = centerNode2.x + (centerNode1.x - centerNode2.x) * ko2;
    const yNode2 = centerNode2.y + (centerNode1.y - centerNode2.y) * ko2;
    return [{x: xNode1, y: yNode1}, {x: xNode2, y: yNode2}];
  }

  get edge(): Edge {
    return this._edge;
  }

  get startNode(): NodeView {
    return this._startNode;
  }

  get endNode(): NodeView {
    return this._endNode;
  }
}

export const DEFAULT_EDGE_STYLE: EdgeStyle = {
  strokeColor: '#000000',
  strokeWidth: 8
};

export const SELECTED_EDGE_STYLE: EdgeStyle = {
  strokeColor: '#006FFF',
  strokeWidth: 10
};

export interface EdgeStyle {
  strokeColor: string;
  strokeWidth: number;
}

export interface EdgeWeightStyle {
  // TODO add properties
}
