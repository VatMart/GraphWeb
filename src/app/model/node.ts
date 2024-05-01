import {EdgeIndex} from "./edge";

/**
 * Model of graph node (vertex)
 */
export class Node {

  private _index: number;

  private _edges: string[] = []; // adjacent edge indexes

  constructor(index: number) {
    this._index = index;
  }

  addEdge(edgeIndex: EdgeIndex) {
    this._edges.push(edgeIndex.value);
  }

  removeEdge(edgeIndex: EdgeIndex) {
    const arrIndex = this._edges.indexOf(edgeIndex.value);
    if (arrIndex !== -1) {
      this._edges.splice(arrIndex, 1);
    }
  }

  get index(): number {
    return this._index;
  }

  set index(value: number) {
    this._index = value;
  }

  public getAdjacentEdges(): string[] {
    return this._edges;
  }
}
