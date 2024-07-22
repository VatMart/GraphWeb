import {EdgeIndex} from "./edge";

/**
 * Model of graph node (vertex)
 */
export class Node {

  private _index: number;

  /**
   * Label of node. Replace index in representations if set
   */
  private _label: string = "";

  private _edges: string[]; // adjacent edge indexes

  constructor(index: number, label: string = "",
              edges: string[] = []) {
    this._index = index;
    this._label = label;
    // It's not recommended to set adjacent edges through constructor because of possible inconsistency.
    // Use GraphModelService methods.
    this._edges = edges;
  }

  /**
   * Add edge to adjacent edges
   */
  addEdge(edgeIndex: EdgeIndex) {
    this._edges.push(edgeIndex.value);
  }

  /**
   * Remove edge from adjacent edges
   */
  removeEdge(edgeIndex: EdgeIndex) {
    const arrIndex = this._edges.indexOf(edgeIndex.value);
    if (arrIndex !== -1) {
      this._edges.splice(arrIndex, 1);
    }
  }

  /**
   * Clear all adjacent edges
   */
  clearEdges() {
    this._edges = [];
  }

  /**
   * Get adjacent edges
   */
  public getAdjacentEdges(): string[] {
    return this._edges;
  }

  clone() {
    const node = new Node(this._index);
    node.label = this._label;
    node._edges = this._edges.slice();
    return node;
  }

  /**
   * Serialize node to JSON. This method is used to save graph to file.
   */
  toJSON() {
    return {
      index: this._index,
      label: this._label
      // Do not copy adj edges
    };
  }

  static fromJSON(json: any): Node {
    return new Node(json.index, json.label);
  }

  /**
   * This method is used to convert node to full JSON (keep all data).
   */
  toFullJSON() {
    return {
      index: this._index,
      label: this._label,
      edges: this._edges // copy adj edges
    };
  }

  static fromFullJSON(json: any): Node {
    return new Node(json.index, json.label, json.edges);
  }

  get index(): number {
    return this._index;
  }

  set index(value: number) {
    this._index = value;
  }

  get label(): string {
    if (this._label === "") {
      return this._index.toString();
    } else {
      return this._label;
    }
  }

  set label(value: string) {
    this._label = value;
  }
}
