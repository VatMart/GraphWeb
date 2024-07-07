import {Node} from "./node";
import {EdgeOrientation} from "./orientation";

/**
 * Model of graph edge
 *
 * Note: Right now nodes are immutable. If you want to change one of node to other
 * you'll need to create new Edge instance
 */
export class Edge {

  private _firstNode: Node;

  private _secondNode: Node;

  private _edgeIndex: EdgeIndex;

  /**
   * Label of node. Replace index in representations if set
   * TODO implement label
   */
  private _label: string = "";

  // If you use oriented edge, remember that order of nodes is important.
  // First node is always one which initiate direction: firstNode -> secondNode
  private _orientation: EdgeOrientation;

  // Weight of graph (default value is 1.0)
  private _weight: number;

  constructor(firstNode: Node, secondNode: Node, orientation?: EdgeOrientation, weight?: number, label?: string) {
    this._firstNode = firstNode;
    this._secondNode = secondNode;
    this._edgeIndex = EdgeIndex.fromNodes(firstNode, secondNode);
    this._weight = weight ? weight : 1.0; // default value
    this._orientation = orientation ? orientation : EdgeOrientation.ORIENTED; // default value
    this._label = label ? label : "";
  }

  /**
   * If edge is loop (edge with equals nodes)
   */
  isLoop(): boolean {
    return this._firstNode.index === this._secondNode.index;
  }

  clone() {
    const edge = new Edge(this._firstNode, this._secondNode, this._orientation, this._weight);
    edge.label = this._label;
    return edge;
  }

  toJSON() {
    return {
      firstNode: this._firstNode.toJSON(),
      secondNode: this._secondNode.toJSON(),
      edgeIndex: this._edgeIndex.toJSON(),
      label: this._label,
      orientation: this._orientation,
      weight: this._weight
    };
  }

  static fromJSON(json: any, nodes: Map<number, Node>): Edge {
    const firstNode = nodes.get(json.firstNode.index)!;
    const secondNode = nodes.get(json.secondNode.index)!;
    const edgeIndex = EdgeIndex.fromString(json.edgeIndex.value); // Using fromString to reconstruct EdgeIndex
    const edge = new Edge(firstNode, secondNode, json.orientation, json.weight, json.label);
    edge._edgeIndex = edgeIndex;
    return edge;
  }

  get firstNode(): Node {
    return this._firstNode;
  }

  get secondNode(): Node {
    return this._secondNode;
  }

  get edgeIndex(): EdgeIndex {
    return this._edgeIndex;
  }

  get label(): string {
    return this._label;
  }

  set label(value: string) {
    this._label = value;
  }

  get orientation(): EdgeOrientation {
    return this._orientation;
  }

  set orientation(value: EdgeOrientation) {
    this._orientation = value;
  }

  get weight(): number {
    return this._weight;
  }

  set weight(value: number) {
    this._weight = value;
  }
}

/**
 * Represent edge index as string
 */
export class EdgeIndex {
  private readonly _value: string;
  readonly from: number;
  readonly to: number;

  constructor(from: number, to: number) {
    this.from = from;
    this.to = to;
    // Create a unique index by concatenating the node indexes
    this._value = `${from}-${to}`;
  }

  /**
   * Return reverse edge index
   */
  reverse(): string {
    return new EdgeIndex(this.to, this.from).value;
  }

  /**
   * Get Edge index from nodes.
   *
   * Note: Beware that this function is not check if graph has edge with this two nodes
   */
  static fromNodes(from: Node, to: Node): EdgeIndex {
    return new this(from.index, to.index)
  }

  /**
   * Get Edge index from edge.
   */
  static fromEdge(edge: Edge): EdgeIndex {
    return new this(edge.firstNode.index, edge.secondNode.index)
  }

  /**
   * Get Edge index from string.
   */
  static fromString(input: string): EdgeIndex {
    const [fromStr, toStr] = input.split('-');
    const from = parseInt(fromStr, 10);
    const to = parseInt(toStr, 10);

    if (isNaN(from) || isNaN(to)) {
      throw new Error('Invalid input string'); // TODO change
    }

    return new this(from, to);
  }

  toJSON() {
    return {
      value: this._value,
      from: this.from,
      to: this.to
    };
  }

  static fromJSON(json: any): EdgeIndex {
    return new EdgeIndex(json.from, json.to);
  }

  get value(): string {
    return this._value;
  }
}
