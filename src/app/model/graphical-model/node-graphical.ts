import {Graphics} from "pixi.js";
import {Point} from "../../utils/graphical-utils";
import {Node} from "../node";
import {HttpClient} from '@angular/common/http';
import {firstValueFrom} from 'rxjs';

export class NodeGraphical {
  private readonly _graphics: Graphics;
  private svgTemplate: string | undefined;
  // Math model
  private node: Node;

  // Coordinates of node center
  private _coordinates: Point;
  private _radius: number;

  // styles with Default values:
  private fill: string = '#FFFFFF';
  private strokeColor: string = '#000000';
  private strokeWidth: number = 5;

  /**
   * Create instance of NodeGraphical
   */
  public static async create(http: HttpClient, node: Node, coordinates: Point, radius: number) {
    const nodeGraphical = new NodeGraphical(http, node, coordinates, radius);
    await nodeGraphical.loadSvgTemplate();
    if (typeof nodeGraphical.svgTemplate === "string") {
      nodeGraphical._graphics.svg(nodeGraphical.templateToSvg());
      nodeGraphical._graphics.x = coordinates.x;
      nodeGraphical._graphics.y = coordinates.y;
    }
    return nodeGraphical;
  }

  // This method should be called after changing any graphical property in Node
  public redraw(): void {
    this._graphics.clear();
    this._graphics.svg(this.templateToSvg());
    this._graphics.x = this._coordinates.x;
    this._graphics.y = this._coordinates.y;
  }

  private constructor(private http: HttpClient, node: Node, coordinates: Point, radius: number) {
    this._graphics = new Graphics();
    this.node = node;
    this._coordinates = coordinates;
    this._radius = radius;
  }

  async loadSvgTemplate() {
    this.svgTemplate = await firstValueFrom(this.http.get('assets/node-template.svg',
      {responseType: 'text'}));
  }

  private templateToSvg() {
    if (!this.svgTemplate) {
      throw new Error('SVG template not loaded');
    }

    // Replace placeholders in the SVG template with the actual values
    let svgString = this.svgTemplate;
    svgString = svgString.replace('${radius}', this._radius.toString());
    svgString = svgString.replace('${fill}', this.fill);
    svgString = svgString.replace('${strokeColor}', this.strokeColor);
    svgString = svgString.replace('${strokeWidth}', this.strokeWidth.toString());
    console.log(`SvgString: ${svgString}`)
    return svgString;
  }

  get graphics(): Graphics {
    return <Graphics>this._graphics;
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
    this._graphics.x = value.x;
    this._graphics.y = value.y;
  }
}
