import {GraphMatrix, TypeMatrix} from "../../model/graph-matrix";
import {Graph} from "../../model/graph";
import {EdgeOrientation} from "../../model/orientation";
import {Edge} from "../../model/edge";
import {ValidationError} from "../../error/validation-error";

/**
 * Abstraction for building graph matrix.
 */
export abstract class GraphMatrixBuilder {
  /**
   * Build matrix from string.
   * @param input unchecked string representation of matrix
   * @throws {ValidationError} If input string is not valid matrix
   */
  abstract buildFromString(input: string): GraphMatrix;

  /**
   * Build matrix from graph.
   * @param graph graph to be converted
   */
  abstract buildFromGraph(graph: Graph): GraphMatrix;

  /**
   * Get vertex indexes for matrix.
   * There is need to sort nodes by index and assign them to matrix indexes because indexes in graph can be not
   * continuous.
   */
  protected getVertexIndexes(graph: Graph): Map<number, number> {
    const nodes = graph.getNodes();
    const vertexIndexes = new Map<number, number>();
    // Sort nodes by index
    const sortedNodes = Array.from(nodes.values()).sort((a, b) => a.index - b.index);
    // Assign indexes to matrix indexes
    let index = 0;
    sortedNodes.forEach((node) => {
      vertexIndexes.set(node.index, index);
      index++;
    });
    return vertexIndexes;
  }

  /**
   * Get sorted edges. Edges are sorted by indexes of nodes.
   */
  protected getSortedEdges(graph: Graph): Map<string, Edge> {
    const edges = graph.getEdges();
    return new Map([...edges.entries()].sort((a, b) => {
      const [a1, a2] = this.getVertexIndexesFromEdge(a[0]);
      const [b1, b2] = this.getVertexIndexesFromEdge(b[0]);
      return a1 === b1 ? a2 - b2 : a1 - b1;
    }));
  }

  // Helper method to extract vertex indices from edge key
  private getVertexIndexesFromEdge(edgeKey: string): [number, number] {
    const parts = edgeKey.split('-').map(Number);
    return [parts[0], parts[1]];
  }
}

/**
 * Builder for adjacency matrix.
 * Adjacency matrix is matrix (n x n) where n is number of nodes.
 */
export class AdjacencyMatrixBuilder extends GraphMatrixBuilder {

  /**
   * Build matrix from graph.
   * @param graph graph to be converted
   */
  buildFromGraph(graph: Graph): GraphMatrix {
    if (!graph) {
      return new GraphMatrix(TypeMatrix.ADJACENCY); // Empty matrix
    }
    const nodes = graph.getNodes();
    const size = nodes.size;
    const graphMatrix = new GraphMatrix(TypeMatrix.ADJACENCY);
    // Initialize matrix with zeros
    graphMatrix.matrix = Array.from({ length: size }, () => Array(size).fill(0));

    // Init vertex indexes (see method documentation for details)
    const vertexIndexes = super.getVertexIndexes(graph); // key: node index, value: matrix index

    // Fill matrix
    const edges = graph.getEdges();
    edges.forEach((edge) => {
      let firstNodeIndex = vertexIndexes.get(edge.firstNode.index);
      let secondNodeIndex = vertexIndexes.get(edge.secondNode.index);
      const edgeWeight = edge.weight;
      if (firstNodeIndex === undefined || secondNodeIndex === undefined) {
        console.error("Node index not found in vertex indexes"); // TODO throw exception
        return;
      }
      graphMatrix.matrix[firstNodeIndex][secondNodeIndex] = edgeWeight; // Indexes are 1-based
      if (edge.orientation === EdgeOrientation.NON_ORIENTED) { // If non-oriented, fill symmetrically
        graphMatrix.matrix[secondNodeIndex][firstNodeIndex] = edgeWeight;
      }
    });
    graphMatrix.vertexIndexes = [...vertexIndexes.keys()];
    // console.log(graphMatrix.toString()); // TODO remove
    return graphMatrix;
  }

  /**
   * Build matrix from string.
   * @param input unchecked string representation of the matrix.
   * @returns A GraphMatrix instance representing the adjacency matrix.
   * @throws {ValidationError} If the input string is invalid.
   */
  buildFromString(input: string): GraphMatrix {
    if (!input || input.trim().length === 0) {
      throw new ValidationError("Input string cannot be empty.");
    }
    const separators = [' ', ',', ';', '\n']
    // Normalize the input: replace all possible separators with a single one
    const normalizedInput = input
      .replace(/[,;\n]/g, ' ')    // Replace commas, semicolons, and newlines with spaces
      .replace(/\s+/g, ' ');      // Replace multiple spaces with a single space
    // Split the normalized string into an array of values
    const values = normalizedInput.trim().split(' ');

    // Determine the size of the matrix
    const size = Math.sqrt(values.length);
    if (!Number.isInteger(size)) {
      throw new ValidationError("Invalid input string: The number of elements must form a perfect square." +
        " Please, check the number of rows and columns.");
    }
    // Convert the array of values into a 2D matrix
    const matrix: number[][] = [];
    for (let i = 0; i < size; i++) {
      const row: number[] = [];
      for (let j = 0; j < size; j++) {
        const value = Number(values[i * size + j]); // Taking values row by row
        if (isNaN(value)) {
          throw new ValidationError(`Invalid number in the input string: '${values[i * size + j]}' is not valid number.`);
        }
        row.push(value);
      }
      matrix.push(row);
    }

    //console.log("Built adjacency matrix from string: ", matrix); // TODO remove
    return new GraphMatrix(TypeMatrix.ADJACENCY, matrix);
  }

}

/**
 * Builder for incidence matrix.
 * Incidence matrix is matrix (n x m) where n is number of nodes and m is number of edges.
 */
export class IncidenceMatrixBuilder extends GraphMatrixBuilder {

  buildFromGraph(graph: Graph): GraphMatrix {
    if (!graph) {
      return new GraphMatrix(TypeMatrix.INCIDENCE); // Empty matrix
    }
    const graphMatrix = new GraphMatrix(TypeMatrix.INCIDENCE);
    const sortedEdges = super.getSortedEdges(graph); // Need to sort edges by indexes to fill matrix correctly
    // Init vertex indexes (see method documentation for details)
    const vertexIndexes = super.getVertexIndexes(graph); // key: node index, value: matrix index
    const columnsLength = sortedEdges.size;
    const rowsLength = vertexIndexes.size;

    // Initialize matrix with zeros
    graphMatrix.matrix = Array.from({ length: rowsLength }, () => Array(columnsLength).fill(0));

    // Fill matrix
    let columnIndex = 0; // Index of column (edge) in matrix
    for (let edgeEntry of sortedEdges) {
      const edge = edgeEntry[1];
      let firstNodeIndex = vertexIndexes.get(edge.firstNode.index);
      let secondNodeIndex = vertexIndexes.get(edge.secondNode.index);
      const edgeWeight = edge.weight;
      if (firstNodeIndex === undefined || secondNodeIndex === undefined) {
        console.error("Node index not found in vertex indexes"); // TODO throw exception
        return new GraphMatrix(TypeMatrix.INCIDENCE);
      }
      // Indexes of vertices are 1-based
      if (firstNodeIndex === secondNodeIndex) { // Edge is loop
        graphMatrix.matrix[firstNodeIndex][columnIndex] = 2 * edgeWeight;
      } else {
        graphMatrix.matrix[firstNodeIndex][columnIndex] = edgeWeight;
        graphMatrix.matrix[secondNodeIndex][columnIndex] = edge.orientation === EdgeOrientation.ORIENTED ? -edgeWeight : edgeWeight;
      }
      columnIndex++;
    }
    graphMatrix.vertexIndexes = [...vertexIndexes.keys()];
    graphMatrix.edgeIndexes = [...sortedEdges.keys()].map((key) => key.replace('-', ' ')); // Edge indexes
    // console.log(graphMatrix.toString()); // TODO remove
    return graphMatrix;
  }

  buildFromString(input: string): GraphMatrix {
    // TODO implement
    return new GraphMatrix(TypeMatrix.INCIDENCE);
  }

}
