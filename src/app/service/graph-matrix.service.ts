import {Injectable} from '@angular/core';
import {Graph} from "../model/graph";
import {Node} from "../model/node";
import {GraphMatrix, TypeMatrix} from "../model/graph-matrix";
import {AdjacencyMatrixBuilder, GraphMatrixBuilder, IncidenceMatrixBuilder} from "../logic/matrix/graph-matrix-builder";
import {Edge} from "../model/edge";

/**
 * Service for building matrix; matrix operations.
 */
@Injectable({
  providedIn: 'root'
})
export class GraphMatrixService {
  constructor() { }

  /**
   * Build matrix from graph.
   * @param graph graph to be converted
   * @param matrixType type of matrix
   */
  public buildMatrixFromGraph(graph: Graph, matrixType: TypeMatrix): GraphMatrix {
    const builder = this.getBuilder(matrixType);
    return builder.buildFromGraph(graph);
  }

  /**
   * Build matrix from string.
   * @param input unchecked string representation of matrix
   * @param matrixType type of matrix
   * @throws {ValidationError} If input string is not valid matrix
   */
  public buildMatrixFromString(input: string, matrixType: TypeMatrix): GraphMatrix {
    const builder = this.getBuilder(matrixType);
    return builder.buildFromString(input);
  }

  public addNodeToMatrix(matrix: GraphMatrix, node: Node) {
    // TODO implement
  }

  public removeNodeFromMatrix(matrix: GraphMatrix, node: Node) {
    // TODO implement
  }

  public addEdgeToMatrix(matrix: GraphMatrix, edge: Edge) {
    // TODO implement
  }

  public removeEdgeFromMatrix(matrix: GraphMatrix, edge: Edge) {
    // TODO implement
  }

  private getBuilder(matrixType: TypeMatrix): GraphMatrixBuilder {
    if (matrixType === TypeMatrix.ADJACENCY) {
      console.log("Building adjacency matrix"); // TODO remove
      return new AdjacencyMatrixBuilder();
    } else if (matrixType === TypeMatrix.INCIDENCE) {
      console.log("Building incidence matrix"); // TODO remove
      return new IncidenceMatrixBuilder();
    }
    throw new Error("Matrix type not supported: " + matrixType); // TODO change
  }
}
