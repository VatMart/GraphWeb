import {GraphElement} from "../graph-element";
import {Edge} from "../../edge";
import {GraphicalUtils, Point} from "../../../utils/graphical-utils";
import {NodeView} from "../node/node-view";
import {Graphics, Polygon} from "pixi.js";
import {EdgeOrientation} from "../../orientation";
import {Arrow, ArrowStyle} from "./arrow";
import {Weight, WeightStyle} from "./weight";
import {ConfService} from "../../../service/config/conf.service";

/**
 * Graphical representation of edge
 */
export class EdgeView extends Graphics implements GraphElement {

  // Math model
  private _edge: Edge;

  // Representation of arrow, if edge is oriented
  private arrow: Arrow | undefined;
  private _weightView: Weight;
  private _weightVisible: boolean = ConfService.SHOW_WEIGHT;

  private _startNode: NodeView;
  private _endNode: NodeView;

  private _startCoordinates: Point;
  private _endCoordinates: Point;

  private _edgeStyle: EdgeStyle = ConfService.DEFAULT_EDGE_STYLE;

  public static createFrom(edge: Edge, startNode: NodeView, endNode: NodeView) : EdgeView {
    let edgeGraphical = new EdgeView(edge, startNode, endNode, ConfService.DEFAULT_EDGE_STYLE);
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
    this._edgeStyle = nodeStyle;
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
    if (!this.edge.isLoop()) {
      this.moveTo(this._startCoordinates.x, this._startCoordinates.y)
        .lineTo(this._endCoordinates.x, this._endCoordinates.y)
        .stroke({width: this._edgeStyle.strokeWidth, color: this._edgeStyle.strokeColor, cap: 'round'});
    } else {
      // TODO Implement loop edge
    }
    // Draw the hit area
    this.hitArea = this.calculateHitArea(this._startCoordinates, this._endCoordinates);
    this.zIndex = 0;
  }

  /**
   * Calculate the hit area of the edge.
   * Hit area should be larger than the edge itself, so it is easier to click on it.
   */
  private calculateHitArea(startPoint: Point, endPoint: Point) {
    const padding = ConfService.EDGE_HIT_AREA_PADDING;
    // Calculate the direction vector
    const dx = endPoint.x - startPoint.x;
    const dy = endPoint.y - startPoint.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const unitX = dx / length;
    const unitY = dy / length;

    // Perpendicular vectors
    const perpX = -unitY * padding;
    const perpY = unitX * padding;

    // Create the expanded polygon
    const polygonPoints = [
      startPoint.x + perpX, startPoint.y + perpY,
      startPoint.x - perpX, startPoint.y - perpY,
      endPoint.x - perpX, endPoint.y - perpY,
      endPoint.x + perpX, endPoint.y + perpY
    ];

    return new Polygon(polygonPoints);
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

  public changeEdgeWeight(value: number) {
    this._edge.weight = value;
    this._weightView.value = value;
    this._weightView.text.text = value.toString();
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
    if (this.edge.isLoop()) {
      return this.resolveLoopConnectors();
    }
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

  private resolveLoopConnectors(): [Point, Point] {
    // TODO Implement loop edge
    return [{x: 0, y: 0}, {x: 0, y: 0}];
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

  get edgeStyle(): EdgeStyle {
    return this._edgeStyle;
  }

  set edgeStyle(value: EdgeStyle) {
    this._edgeStyle = value;
    this._weightView.weightStyle = value.weight;
    if (this.arrow !== undefined && value.arrow !== undefined) {
      this.arrow.arrowStyle = value.arrow;
    }
    this.move();
  }
}

export interface EdgeStyle {
  strokeColor: string;
  strokeWidth: number;
  weight: WeightStyle;
  arrow?: ArrowStyle;
}
