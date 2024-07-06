import * as PIXI from "pixi.js";
import {Sprite, Text, Texture} from "pixi.js";
import {Point} from "../../../utils/graphical-utils";
import {Node} from "../../node";
import {GraphElement} from "../graph-element";
import {ConfService} from "../../../service/config/conf.service";
import {NodeStyle} from "../graph/graph-view-properties";
import {DefaultRadius, DynamicRadius} from "./radius";

/**
 * Graphical representation of node
 */
export class NodeView extends Sprite implements GraphElement { // TODO extends Sprite instead of Container, wrap text and graphics to sprite
  // Math model
  private _node: Node;

  // Coordinates of node center
  private _coordinates: Point;
  private _text: Text;

  // Properties of circle of vertex
  private _nodeStyle: NodeStyle = JSON.parse(JSON.stringify(ConfService.currentNodeStyle)); // Use deep copy, to avoid changing default style
  // Properties for label
  private _labelText: string;

  public static createFromTexture(node: Node, coordinates: Point, radius: number, texture: Texture): NodeView {
    let nodeGraphical = new NodeView(node, coordinates, radius, texture);
    nodeGraphical.interactive = true;
    nodeGraphical.addChild(nodeGraphical.text); // Add text to node
    nodeGraphical.draw();
    return nodeGraphical;
  }

  private constructor(node: Node, coordinates: Point, radius: number, texture?: Texture) {
    super(texture);
    this.hitArea = new PIXI.Circle(this.width / 2, this.height / 2, radius);
    this._node = node;
    this._coordinates = coordinates;
    this._labelText = node.label ? node.label : node.index.toString();
    this._text = new Text();
    this.text.visible = ConfService.SHOW_NODE_LABEL;
    this.nodeStyle.radius = ConfService.DYNAMIC_NODE_SIZE ? new DynamicRadius(radius, node.getAdjacentEdges().length) :
      new DefaultRadius(radius);
  }

  getIndex(): string | number {
    return this._node.index;
  }

  /**
   * Draw node with label.
   * Should be called after creating node. Since it use texture, node shouldn't be redrawn when moving.
   */
  private draw(): void {
    this._text.text = this._labelText;
    this.text.style.fill = this.nodeStyle.labelStyle.labelColor;
    this.text.style.fontSize = this.nodeStyle.labelStyle.labelFontSize;
    this.text.style.fontFamily = this.nodeStyle.labelStyle.labelFontFamily;
    this.text.style.fontWeight = 'bold';
    this._text.anchor.set(0.5);
    this.coordinates = this._coordinates;
    this.zIndex = 1;
  }

  public move() {
    this.x = this.coordinates.x;
    this.y = this.coordinates.y;
    this._text.x = this.width / 2;
    this._text.y = this.height / 2;
  }

  /**
   * Change label (Text) visibility.
   */
  public changeLabelVisible(labelVisible: boolean) {
    this.text.visible = labelVisible;
  }

  /**
   * Get accurate coordinates of node center.
   * This method includes stroke width of node.
   */
  public centerCoordinates(): Point {
    return {x: this.x + this.width / 2, y: this.y + this.height / 2};
  }

  toJSON() {
    return {
      node: this._node.toJSON(),
      coordinates: this._coordinates,
      labelText: this._labelText,
      nodeStyle: this._nodeStyle,
      radius: this.nodeStyle.radius instanceof DynamicRadius ? this.nodeStyle.radius.baseValue
        : this.nodeStyle.radius.getRadius(),
    };
  }

  static fromJSON(json: any, nodes: Map<number, Node>): NodeView {
    const node = nodes.get(json.node.index)!;
    const coordinates: Point = json.coordinates;
    const radius = json.radius;
    const nodeView = new NodeView(node, coordinates, radius);
    const radiusImpl = nodeView.nodeStyle.radius;
    nodeView.nodeStyle = json.nodeStyle;
    nodeView.nodeStyle.radius = radiusImpl;
    nodeView.text.visible = ConfService.SHOW_NODE_LABEL;
    return nodeView;
  }

  get node(): Node {
    return this._node;
  }

  get radius(): number {
    return this.nodeStyle.radius.getRadius();
  }

  set radius(value: number) {
    this.nodeStyle.radius.setRadius(value);
  }

  get nodeStyle(): NodeStyle {
    return this._nodeStyle;
  }

  set nodeStyle(value: NodeStyle) {
    this._nodeStyle = value;
  }

  get text(): Text {
    return this._text;
  }

  get coordinates(): Point {
    return this._coordinates;
  }

  set coordinates(value: Point) {
    this._coordinates = value;
    this.move();
  }
}
