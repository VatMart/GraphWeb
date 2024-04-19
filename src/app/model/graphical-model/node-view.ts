import {Container, Graphics, Text, Sprite} from "pixi.js";
import * as PIXI from "pixi.js";
import {Point} from "../../utils/graphical-utils";
import {Node} from "../node";
import {HttpClient} from '@angular/common/http';
import {firstValueFrom} from 'rxjs';

export class NodeView extends Graphics { // TODO extends Sprite instead of Container, wrap text and graphics to sprite
  private svgTemplate: string | undefined;

  // Math model
  private _node: Node;

  // Coordinates of node center
  private _coordinates: Point;
  private _radius: number;
  // TEST
  vx: number = 0;
  vy: number = 0;

  // properties of svg node template
  private _label: string;
  private fillNode: string = '#FFFFFF';
  private strokeColor: string = '#000000';
  private strokeWidth: number = 5;

  public static readonly DEFAULT_RADIUS = 50; // TODO move to constants

  /**
   * Create instance of NodeGraphical
   */
  public static create(http: HttpClient, node: Node, coordinates: Point, radius: number) {
    let nodeGraphical = new NodeView(node, coordinates, radius);
    nodeGraphical.interactive = true;
    nodeGraphical.draw();
    return nodeGraphical;
  }

  private constructor(node: Node, coordinates: Point, radius: number) {
    super();
    this._node = node;
    this._coordinates = coordinates;
    this._label = node.index.toString();
    this._radius = radius;
  }

  // This method should be called after changing any graphical property in Node
  public redraw(): void {
    this.clear();
    this.draw();
  }

  // deprecated
  public async loadSvgTemplate(http: HttpClient) {
    this.svgTemplate = await firstValueFrom(http.get('assets/node.svg-template',
      {responseType: 'text'}));
  }

  // deprecated
  private templateToSvg() {
    if (!this.svgTemplate) {
      throw new Error('SVG template not loaded');
    }

    // Replace placeholders in the SVG template with the actual values
    let svgString = this.svgTemplate;
    svgString = svgString.replace('${radius}', this._radius.toString());
    svgString = svgString.replace('${fill}', this.fillNode);
    svgString = svgString.replace('${strokeColor}', this.strokeColor);
    svgString = svgString.replace('${strokeWidth}', this.strokeWidth.toString());
    svgString = svgString.replace('${label}', this._label);
    console.log(`SvgString: ${svgString}`)
    return svgString;
  }

  private draw(): void {
    this.circle(this.coordinates.x, this.coordinates.y, this.radius).
    fill(this.fillNode).
    stroke({color: this.strokeColor, width: this.strokeWidth});
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

  get coordinates(): Point {
    return this._coordinates;
  }

  set coordinates(value: Point) {
    this._coordinates = value;
    this.x = value.x;
    this.y = value.y;
  }
}

export class NodeGraphics extends Graphics {
  acceleration: Point;
  mass: number;
  constructor(mass: number = 1, acceleration?: Point) {
    super();
    this.mass = mass;
    this.acceleration = acceleration || new PIXI.Point(0, 0);
  }
}
