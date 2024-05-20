export class GraphMatrix {
  // TODO implement
  /**
   * Graph matrix. Do not modify matrix directly.
   */
  public matrix: number[][];

  constructor(matrix?: number[][], type?: TypeMatrix) {
    matrix ? this.matrix = matrix : this.matrix = [];
  }

  toString(): string {
    return this.matrix
      .map(row => row.join(', '))
      .join(';\n') + ';';
  }
}

export enum TypeMatrix {
  ADJACENCY,
  INCIDENCE
}
