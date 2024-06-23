/**
 * Graph set class
 */
export class GraphSet {
  private _type : TypeGraphSet;
  graphSet: string[];

  constructor(type: TypeGraphSet, graphSet?: string[]) {
    this._type = type;
    graphSet ? this.graphSet = graphSet : this.graphSet = [];
  }

  /**
   * Convert graph set to string
   */
  toString(): string {
    return this.graphSet.join(', ');
  }

  get type(): TypeGraphSet {
    return this._type;
  }
}

/**
 * Type of graph set
 */
export enum TypeGraphSet {
  VERTICES = 'Vertices',
  EDGES = 'Edges'
}
