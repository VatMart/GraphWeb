import * as PIXI from "pixi.js";
import {Graphics, Sprite, Text, Texture} from "pixi.js";
import {Point} from "../../../utils/graphical-utils";
import {Node} from "../../node";
import {GraphElement} from "../graph-element";

/**
 * Graphical representation of node
 */
export class NodeView extends Sprite implements GraphElement { // TODO extends Sprite instead of Container, wrap text and graphics to sprite
  // Math model
  private _node: Node;

  // Coordinates of node center
  private _coordinates: Point;
  private _radius: number;
  private _text: Text;

  // TEST
  vx: number = 0;
  vy: number = 0;

  // Properties of circle of vertex
  private _nodeStyle: NodeStyle = DEFAULT_NODE_STYLE;
  // Properties for label
  private _labelText: string;
  private labelStyle: NodeLabelStyle = DEFAULT_NODE_LABEL_STYLE;

  public static readonly DEFAULT_RADIUS = 30; // TODO move to constants

  public static createFromTexture(node: Node, coordinates: Point, radius: number, texture: Texture): NodeView {
    let nodeGraphical = new NodeView(node, coordinates, radius, texture);
    nodeGraphical.interactive = true;
    nodeGraphical.addChild(nodeGraphical.text); // Add text to node
    nodeGraphical.draw();
    return nodeGraphical;
  }

  private constructor(node: Node, coordinates: Point, radius: number, texture: Texture) {
    super(texture);
    this.hitArea = new PIXI.Circle(this.width / 2, this.height / 2, NodeView.DEFAULT_RADIUS);
    this._node = node;
    this._coordinates = coordinates;
    this._labelText = node.index.toString();
    this._text = new Text();
    this._radius = radius;
  }

  getIndex(): string | number {
    return this._node.index;
  }

  private draw(): void {
    this._text.text = this._labelText;
    this._text.style = new PIXI.TextStyle({
      fill: this.labelStyle.labelColor,
      fontSize: this.labelStyle.labelFontSize,
      fontFamily: this.labelStyle.labelFontFamily,
      fontWeight: 'bold'
    });
    //this.tint = 'white';
    this._text.anchor.set(0.5);
    this.coordinates = this._coordinates;
    this.zIndex = 1; // TODO set to 1
  }

  public move() {
    this.x = this.coordinates.x;
    this.y = this.coordinates.y;
    this._text.x = this.width / 2;
    this._text.y = this.height / 2;
  }

  public centerCoordinates(): Point {
    return {x: this.x + this.width / 2, y: this.y + this.height / 2};
  }

  get node(): Node {
    return this._node;
  }

  get radius(): number {
    return this._radius;
  }

  set radius(value: number) {
    this._radius = value;
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

export const DEFAULT_NODE_STYLE: NodeStyle = {
  fillNode: '#FFFFFF',
  strokeColor: '#000000',
  strokeWidth: 3
};

export const DEFAULT_NODE_LABEL_STYLE: NodeLabelStyle = {
  labelColor: '#000000',
  labelFontSize: 24,
  labelFontFamily: 'Calibri', // Calibri bold
  labelFontWeight: 'bold'
};

export const SELECTED_NODE_STYLE: NodeStyle = {
  fillNode: DEFAULT_NODE_STYLE.fillNode,
  strokeColor: '#006FFF',
  strokeWidth: DEFAULT_NODE_STYLE.strokeWidth + 1
};

export interface NodeStyle {
  fillNode: string;
  strokeColor: string;
  strokeWidth: number;
}

export interface NodeLabelStyle {
  labelColor: string;
  labelFontSize: number;
  labelFontFamily: string;
  labelFontWeight: string;
}

// Test
export class NodeGraphics extends Graphics {
  acceleration: Point;
  mass: number;
  constructor(mass: number = 1, acceleration?: Point) {
    super();
    this.mass = mass;
    this.acceleration = acceleration || new PIXI.Point(0, 0);
  }
}
