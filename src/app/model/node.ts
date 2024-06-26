import {EdgeIndex} from "./edge";

/**
 * Model of graph node (vertex)
 */
export class Node {

  private _index: number;

  /**
   * Label of node. Replace index in representations if set
   * TODO implement label
   */
  private _label: string = "";

  private _edges: string[] = []; // adjacent edge indexes

  constructor(index: number) {
    this._index = index;
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

  get index(): number {
    return this._index;
  }

  set index(value: number) {
    this._index = value;
  }

  get label(): string {
    return this._label;
  }

  set label(value: string) {
    this._label = value;
  }
}
