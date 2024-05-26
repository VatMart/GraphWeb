export class GraphMatrix {
  // TODO implement
  /**
   * Graph matrix. Do not modify matrix directly.
   */
  public matrix: number[][];

  private _vertexIndexes: number[] = [];

  constructor(matrix?: number[][], type?: TypeMatrix) {
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
    console.log('Setting vertex indexes: ' + value);
    this._vertexIndexes = value;
  }
}

export enum TypeMatrix {
  ADJACENCY = 'Adjacency',
  INCIDENCE = 'Incidence'
}
