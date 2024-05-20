import {GraphElement} from "../graph-element";
import {Edge} from "../../edge";
import {GraphicalUtils, Point} from "../../../utils/graphical-utils";
import {NodeView} from "../node/node-view";
import {Graphics} from "pixi.js";
import {EdgeOrientation} from "../../orientation";
import {Arrow, ArrowStyle, DEFAULT_ARROW_STYLE, SELECTED_ARROW_STYLE} from "./arrow";
import {DEFAULT_WEIGHT_STYLE, SELECTED_WEIGHT_STYLE, Weight, WeightStyle} from "./weight";

/**
 * Graphical representation of edge
 */
export class EdgeView extends Graphics implements GraphElement {

  // Default value for showing weight of edge
  public static SHOW_WEIGHT: boolean; // Default value sets via event handling

  // Math model
  private _edge: Edge;

  // Representation of arrow, if edge is oriented
  private arrow: Arrow | undefined;
  private _weightView: Weight;
  private _weightVisible: boolean = EdgeView.SHOW_WEIGHT;

  private _startNode: NodeView;
  private _endNode: NodeView;

  private _startCoordinates: Point;
  private _endCoordinates: Point;

  private _nodeStyle: EdgeStyle = DEFAULT_EDGE_STYLE;

  public static createFrom(edge: Edge, startNode: NodeView, endNode: NodeView) : EdgeView {
    let edgeGraphical = new EdgeView(edge, startNode, endNode, DEFAULT_EDGE_STYLE);
    edgeGraphical.interactive = true;
    edgeGraphical.move();
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
    this._weightView = new Weight(this._edge.weight);
    this.weightView.renderable = this._weightVisible;
    this.addChild(this._weightView);
    const points = this.resolveConnectors();
    this._startCoordinates = points[0];
    this._endCoordinates = points[1];
    this._nodeStyle = nodeStyle;
  }

  /**
   * Draw edge between two nodes. Should be called after creating edge and moving adjacent nodes.
   */
  private draw() {
    this.clear();
    // Draw Arrow of edge first, because it reset end point coordinates
    if (this._edge.orientation === EdgeOrientation.ORIENTED) {
      this.drawArrow();
    }
    this.moveTo(this._startCoordinates.x, this._startCoordinates.y)
      .lineTo(this._endCoordinates.x, this._endCoordinates.y)
      .stroke({width: this._nodeStyle.strokeWidth, color: this._nodeStyle.strokeColor, cap: 'round'});
    this.zIndex = 0;
  }

  private drawArrow() {
    if (this.arrow) {
      this._endCoordinates = this.arrow.draw(this._startCoordinates, this._endCoordinates);
    }
  }

  private moveWeight() {
    if (this._weightView) {
      this._weightView.move(this._startCoordinates, this._endCoordinates);
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
    if (this.weightVisible) {
      this.moveWeight()
    }
  }

  public changeEdgeOrientation(orientation: EdgeOrientation) {
    if (orientation === this.edge.orientation) {
      return;
    }
    this.edge.orientation = orientation;
    if (orientation === EdgeOrientation.ORIENTED && this.arrow) {
      this.arrow.renderable = true;
    } else if (orientation === EdgeOrientation.ORIENTED && !this.arrow) {
      this.arrow = new Arrow();
      this.addChild(this.arrow);
      this.arrow.renderable = true;
    }
    if (orientation === EdgeOrientation.NON_ORIENTED && this.arrow) {
      this.arrow.renderable = false;
    }
    this.move();
  }

  public changeEdgeWeight(weight: number) {
    // TODO implement change edge weight
  }

  public changeWeightVisible(bool: boolean) {
    // TODO Test implementation
    this._weightVisible = bool;
    this.weightView.renderable = this._weightVisible;
    if (this.weightVisible) {
      this.moveWeight();
    }
  }

  /**
   * Resolve coordinates of connectors of edge
   * @return [startConnector, endConnector] - coordinates of start and end nodes connectors
   */
  private resolveConnectors(): [Point, Point] {
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

  get weightView(): Weight {
    return this._weightView;
  }

  get weightVisible(): boolean {
    return this._weightVisible;
  }

  get nodeStyle(): EdgeStyle {
    return this._nodeStyle;
  }

  set nodeStyle(value: EdgeStyle) {
    this._nodeStyle = value;
    this._weightView.weightStyle = value.weight;
    if (this.arrow !== undefined && value.arrow !== undefined) {
      this.arrow.arrowStyle = value.arrow;
    }
    this.move();
  }
}

export const DEFAULT_EDGE_STYLE: EdgeStyle = {
  strokeColor: '#000000',
  strokeWidth: 8,
  arrow: DEFAULT_ARROW_STYLE,
  weight: DEFAULT_WEIGHT_STYLE
};

export const SELECTED_EDGE_STYLE: EdgeStyle = {
  strokeColor: '#006FFF',
  strokeWidth: 10,
  arrow: SELECTED_ARROW_STYLE,
  weight: SELECTED_WEIGHT_STYLE
};

export interface EdgeStyle {
  strokeColor: string;
  strokeWidth: number;
  weight: WeightStyle;
  arrow?: ArrowStyle;
}
