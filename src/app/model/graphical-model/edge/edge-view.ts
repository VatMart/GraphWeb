import {GraphElement} from "../graph-element";
import {Edge} from "../../edge";
import {GraphicalUtils, Point} from "../../../utils/graphical-utils";
import {NodeView} from "../node/node-view";
import {Graphics, Polygon} from "pixi.js";
import {EdgeOrientation} from "../../orientation";
import {Arrow} from "./arrow";
import {Weight} from "./weight";
import {ConfService} from "../../../service/config/conf.service";
import {EdgeStyle} from "../graph/graph-view-properties";

/**
 * Graphical representation of edge
 */
export class EdgeView extends Graphics implements GraphElement {

  // Math model
  private _edge: Edge;

  // Representation of arrow, if edge is oriented
  private _arrow: Arrow | undefined;
  private _weightView: Weight;
  private _weightVisible: boolean = ConfService.SHOW_WEIGHT;
  private _offset: number | undefined;

  private _startNode: NodeView;
  private _endNode: NodeView;

  private _startCoordinates: Point;
  private _endCoordinates: Point;

  private _edgeStyle: EdgeStyle = JSON.parse(JSON.stringify(ConfService.currentEdgeStyle));

  /**
   * Create edge view from edge and two nodes
   * @param edge - edge model
   * @param startNode - start node view
   * @param endNode - end node view
   * @param edgeStyle - style of edge
   * @param offset - if graph has reverse edge to this (for example: graph has 1-2 edge index, reverse edge is 2-1),
   * than it should have offset to be drawn correctly
   */
  public static createFrom(edge: Edge, startNode: NodeView, endNode: NodeView, edgeStyle?: EdgeStyle,
                           offset?: number) : EdgeView {
    let edgeGraphical = new EdgeView(edge, startNode, endNode, edgeStyle, offset);
    edgeGraphical.interactive = true;
    edgeGraphical.move();
    return edgeGraphical;
  }

  constructor(edge: Edge, startNode: NodeView, endNode: NodeView,
              edgeStyle?: EdgeStyle, offset?: number) {
    super();
    this._edge = edge;
    this._startNode = startNode;
    this._endNode = endNode;
    if (edge.orientation === EdgeOrientation.ORIENTED && !this.edge.isLoop()) {
      this._arrow = new Arrow(edgeStyle?.arrow);
      this.addChild(this._arrow);
    }
    this._offset = offset;
    this._weightView = new Weight(this._edge.weight, edgeStyle?.weight);
    this.weightView.visible = this._weightVisible;
    this.addChild(this._weightView);
    const points = this.resolveConnectors(this.startNode, this.endNode);
    this._startCoordinates = points[0];
    this._endCoordinates = points[1];
    if (edgeStyle) {
      this._edgeStyle = edgeStyle;
    }
  }

  /**
   * Draw edge between two nodes. Should be called after creating edge and moving adjacent nodes.
   * Note: Do not call this method directly! Use move() method instead.
   */
  public draw() {
    this.clear();
    // Recalculate endpoint if edge will have arrow first, because it should reset end point coordinates
    let oldEndCoordinates = this._endCoordinates;
    if (this._edge.orientation === EdgeOrientation.ORIENTED && !this.edge.isLoop()) {
      this.recalculateEndpointWithArrow();
    }
    if (!this.edge.isLoop()) { // Draw straight edge
      const offset = this.drawStraightEdge();
      oldEndCoordinates = {x: oldEndCoordinates.x + offset.x, y: oldEndCoordinates.y + offset.y};
      // Draw the hit area with offset
      this.hitArea = this.calculateHitArea(this._startCoordinates, this._endCoordinates);
    } else { // Draw loop edge
      this.drawLoopEdge();
    }
    if (this._edge.orientation === EdgeOrientation.ORIENTED && !this.edge.isLoop()) {
      this.drawArrow(oldEndCoordinates);
    }
    this.zIndex = 0;
  }

  private drawStraightEdge(): Point {
    let offset = {x: 0, y: 0};
    if (this._offset) {
      offset = this.getPerpendicularOffset(this._startCoordinates, this._endCoordinates, this._offset);
      this._startCoordinates.x += offset.x;
      this._startCoordinates.y += offset.y;
      this._endCoordinates.x += offset.x;
      this._endCoordinates.y += offset.y;
    }
    this.moveTo(this._startCoordinates.x, this._startCoordinates.y)
      .lineTo(this._endCoordinates.x, this._endCoordinates.y)
      .stroke({width: this._edgeStyle.strokeWidth, color: this._edgeStyle.strokeColor, cap: 'round'});
    return offset;
  }

  public getPerpendicularOffset(start: Point, end: Point, offset: number): Point {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    if (length === 0) {
      return { x: 0, y: 0 }; // Avoid division by zero
    }
    const offsetX = offset * dy / length;
    const offsetY = -offset * dx / length;
    return { x:offsetX, y:offsetY };
  }

  public drawLoopEdge() {
    const control1 = {x: this._startCoordinates.x - 2 * this.startNode.radius,
      y: this._startCoordinates.y - 2 * this.startNode.radius};
    const control2 = {x: this._endCoordinates.x + 2 * this.startNode.radius,
      y: this._endCoordinates.y - 2 * this.startNode.radius};
    this.moveTo(this._startCoordinates.x, this._startCoordinates.y)
      .bezierCurveTo(control1.x, control1.y, control2.x, control2.y, this._endCoordinates.x, this._endCoordinates.y)
      .stroke({width: this._edgeStyle.strokeWidth, color: this._edgeStyle.strokeColor, cap: 'round', alignment: 1});
    const nodeCenter = this._startNode.centerCoordinates();
    this._weightView.curveCenter = GraphicalUtils.calculateBezierCenter(nodeCenter, control1, control2, nodeCenter);
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

  /**
   * Recalculate the endpoint of the edge with the arrow.
   */
  public recalculateEndpointWithArrow() {
    if (this._arrow) {
      this._endCoordinates = this._arrow.calculateNewEndPoint(this._startCoordinates, this._endCoordinates);
    }
  }

  /**
   * Draw arrow at the end of the edge.
   * Note: Do not call this method directly! Use move() method instead.
   */
  public drawArrow(oldEndCoordinates: Point) {
    if (this._arrow) {
      this._endCoordinates = this._arrow.draw(this._startCoordinates, oldEndCoordinates);
    }
  }

  /**
   * Move the weight of the edge to the correct position.
   * Note: Do not call this method directly! Use move() method instead.
   */
  public moveWeight() {
    if (this._weightView) {
      this._weightView.move(this._startCoordinates, this._endCoordinates, this.edge.isLoop());
    }
  }

  /**
   * Get the index of the edge.
   */
  public getIndex(): string {
    return this._edge.edgeIndex.value;
  }

  /**
   * Move the edge to the correct position.
   */
  public move(): void {
    const points = this.resolveConnectors(this.startNode, this.endNode);
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
    if (orientation === EdgeOrientation.ORIENTED && this._arrow) {
      this._arrow.renderable = true;
    } else if (orientation === EdgeOrientation.ORIENTED && !this._arrow) {
      this._arrow = new Arrow();
      this.addChild(this._arrow);
      this._arrow.renderable = true;
    }
    if (orientation === EdgeOrientation.NON_ORIENTED && this._arrow) {
      this._arrow.renderable = false;
    }
    this.move();
  }

  public changeEdgeWeight(value: number) {
    this._edge.weight = value;
    this._weightView.value = value;
    this._weightView.text.text = value.toString();
  }

  public changeWeightVisible(bool: boolean) {
    this._weightVisible = bool;
    this.weightView.visible = this._weightVisible;
    if (this.weightVisible) {
      this.moveWeight();
    }
  }

  /**
   * Resolve coordinates of connectors of edge
   * @return [startConnector, endConnector] - coordinates of start and end nodes connectors
   */
  public resolveConnectors(startNode: NodeView, endNode: NodeView): [Point, Point] {
    if (this.edge.isLoop()) {
      return this.resolveLoopConnectors();
    }
    const centerNode1 = startNode.centerCoordinates();
    const centerNode2 = endNode.centerCoordinates();
    const distance = GraphicalUtils.distanceBetween(centerNode1, centerNode2);
    const ko1 = (startNode.width / 2) / distance;
    const xNode1 = centerNode1.x + (centerNode2.x - centerNode1.x) * ko1;
    const yNode1 = centerNode1.y + (centerNode2.y - centerNode1.y) * ko1;
    const ko2 = (endNode.width / 2) / distance;
    const xNode2 = centerNode2.x + (centerNode1.x - centerNode2.x) * ko2;
    const yNode2 = centerNode2.y + (centerNode1.y - centerNode2.y) * ko2;
    return [{x: xNode1, y: yNode1}, {x: xNode2, y: yNode2}];
  }

  // If edge is loop
  private resolveLoopConnectors(): [Point, Point] {
    const nodeCenter = this._startNode.centerCoordinates();
    const v1X = nodeCenter.x - this._startNode.radius + 2;
    const v1Y = nodeCenter.y - this._startNode.radius + this._startNode.radius/2;
    const v2X = nodeCenter.x + this._startNode.radius - 2;
    const v2Y = nodeCenter.y - this._startNode.radius + this._startNode.radius/2;
    return [{x: v1X, y: v1Y}, {x: v2X, y: v2Y}];
  }

  toJSON() {
    return {
      edge: this._edge.toJSON(),
      startNode: this._startNode.toJSON(),
      endNode: this._endNode.toJSON(),
      startCoordinates: this._startCoordinates,
      endCoordinates: this._endCoordinates,
      weightVisible: this._weightVisible,
      edgeStyle: this._edgeStyle
    };
  }

  static fromJSON(json: any, edges: Map<string, Edge>, nodeViewMap: Map<number, NodeView>): EdgeView {
    const edge = edges.get(json.edge.edgeIndex.value)!;
    const startNode = nodeViewMap.get(edge.firstNode.index)!;
    const endNode = nodeViewMap.get(edge.secondNode.index)!;
    const edgeView = new EdgeView(edge, startNode, endNode, json.edgeStyle);
    edgeView._startCoordinates = json.startCoordinates;
    edgeView._endCoordinates = json.endCoordinates;
    edgeView._weightVisible = json.weightVisible;
    edgeView.move();
    return edgeView;
  }

  get edge(): Edge {
    return this._edge;
  }

  get startNode(): NodeView {
    return this._startNode;
  }

  set startNode(value: NodeView) {
    this._startNode = value;
  }

  get endNode(): NodeView {
    return this._endNode;
  }

  set endNode(value: NodeView) {
    this._endNode = value;
  }

  get arrow(): Arrow | undefined {
    return this._arrow;
  }

  get startCoordinates(): Point {
    return this._startCoordinates;
  }

  set startCoordinates(value: Point) {
    this._startCoordinates = value;
  }

  get endCoordinates(): Point {
    return this._endCoordinates;
  }

  set endCoordinates(value: Point) {
    this._endCoordinates = value;
  }

  get offset(): number | undefined {
    return this._offset;
  }

  set offset(value: number | undefined) {
    this._offset = value;
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
    if (this._arrow !== undefined && value.arrow !== undefined) {
      this._arrow.arrowStyle = value.arrow;
    }
    this.move();
  }
}
