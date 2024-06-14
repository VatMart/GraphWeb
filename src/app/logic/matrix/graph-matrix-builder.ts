import {GraphMatrix, TypeMatrix} from "../../model/graph-matrix";
import {Graph} from "../../model/graph";
import {EdgeOrientation} from "../../model/orientation";
import {Edge} from "../../model/edge";

/**
 * Interface for building graph matrix.
 */
export abstract class GraphMatrixBuilder {
  /**
   * Build matrix from string.
   * @param input unchecked string representation of matrix
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

  buildFromString(input: string): GraphMatrix {
    // TODO implement
    return new GraphMatrix(TypeMatrix.ADJACENCY);
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
