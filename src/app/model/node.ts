/**
 * Model of graph node (vertex)
 */
export class Node {

  private _index: number;

  constructor(index: number) {
    this._index = index;
  }

  get index(): number {
    return this._index;
  }

  set index(value: number) {
    this._index = value;
  }
}
