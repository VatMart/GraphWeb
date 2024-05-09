import {GraphElement} from "../graph-element";
import {Edge} from "../../edge";
import {GraphicalUtils, Point} from "../../../utils/graphical-utils";
import {NodeView} from "../node/node-view";
import {Graphics} from "pixi.js";
import {EdgeOrientation} from "../../orientation";
import {Arrow, ArrowStyle, DEFAULT_ARROW_STYLE, SELECTED_ARROW_STYLE} from "./arrow";

/**
 * Graphical representation of edge
 */
export class EdgeView extends Graphics implements GraphElement {
  // Math model
  private _edge: Edge;

  // Representation of arrow, if edge is oriented
  private arrow: Arrow | undefined;

  private _startNode: NodeView;
  private _endNode: NodeView;

  private _startCoordinates: Point;
  private _endCoordinates: Point;

  private _nodeStyle: EdgeStyle = DEFAULT_EDGE_STYLE;

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
    if (edge.orientation === EdgeOrientation.ORIENTED) {
      this.arrow = new Arrow();
      this.addChild(this.arrow);
    }
    const points = this.resolveConnectors();
    this._startCoordinates = points[0];
    this._endCoordinates = points[1];
    this._nodeStyle = nodeStyle;
  }

  public draw() {
    this.clear();
    // Draw Arrow of edge first, because it reset end point coordinates
    if (this._edge.orientation === EdgeOrientation.ORIENTED) {
      this.drawArrow();
    }
    this.moveTo(this._startCoordinates.x, this._startCoordinates.y)
      .lineTo(this._endCoordinates.x, this._endCoordinates.y)
      .stroke({width: this._nodeStyle.strokeWidth, color: this._nodeStyle.strokeColor, cap: 'round'});
    if (this._edge.weight) {
      // TODO implement draw weight
    }

    this.zIndex = 0;
  }

  private drawArrow() {
    if (this.arrow) {
      this._endCoordinates = this.arrow.draw(this._startCoordinates, this._endCoordinates, this._nodeStyle.arrow);
    }
  }

  public getIndex(): string {
    return this._edge.edgeIndex.value;
  }

  public move(): void {
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

  get nodeStyle(): EdgeStyle {
    return this._nodeStyle;
  }

  set nodeStyle(value: EdgeStyle) {
    this._nodeStyle = value;
  }
}

export const DEFAULT_EDGE_STYLE: EdgeStyle = {
  strokeColor: '#000000',
  strokeWidth: 8,
  arrow: DEFAULT_ARROW_STYLE
};

export const SELECTED_EDGE_STYLE: EdgeStyle = {
  strokeColor: '#006FFF',
  strokeWidth: 10,
  arrow: SELECTED_ARROW_STYLE
};

export interface EdgeStyle {
  strokeColor: string;
  strokeWidth: number;
  arrow?: ArrowStyle;
}

export interface EdgeWeightStyle {
  // TODO add properties
}
