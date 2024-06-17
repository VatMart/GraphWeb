/**
 * Graph matrix model.
 */
export class GraphMatrix {

  /**
   * Graph matrix. Do not modify matrix directly.
   */
  public matrix: number[][];

  private _type: TypeMatrix;

  private _vertexIndexes: number[] = [];

  /**
   * Edge indexes. Should be filled if matrix is incidence matrix.
   */
  private _edgeIndexes: string[] = [];

  constructor(type: TypeMatrix, matrix?: number[][]) {
    this._type = type;
    matrix ? this.matrix = matrix : this.matrix = [];
  }

  toString(): string {
    return this.matrix
      .map(row => row.join(', '))
      .join(';\n') + ';';
  }

  get vertexIndexes(): number[] {
    return this._vertexIndexes;
  }

  set vertexIndexes(value: number[]) {
    this._vertexIndexes = value;
  }

  get edgeIndexes(): string[] {
    return this._edgeIndexes;
  }

  set edgeIndexes(value: string[]) {
    this._edgeIndexes = value;
  }

  get type(): TypeMatrix {
    return this._type;
  }
}

export enum TypeMatrix {
  ADJACENCY = 'Adjacency',
  INCIDENCE = 'Incidence'
}
