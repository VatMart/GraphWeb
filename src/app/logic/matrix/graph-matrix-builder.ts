import {GraphMatrix} from "../../model/graph-matrix";
import {Graph} from "../../model/graph";
import {EdgeOrientation} from "../../model/orientation";

/**
 * Interface for building graph matrix.
 */
export interface GraphMatrixBuilder {
  /**
   * Build matrix from string.
   * @param input unchecked string representation of matrix
   */
  buildFromString(input: string): GraphMatrix;

  /**
   * Build matrix from graph.
   * @param graph graph to be converted
   */
  buildFromGraph(graph: Graph): GraphMatrix;
}

/**
 * Builder for adjacency matrix.
 */
export class AdjacencyMatrixBuilder implements GraphMatrixBuilder {

  buildFromGraph(graph: Graph): GraphMatrix {
    if (!graph) {
      return new GraphMatrix();
    }
    const nodes = graph.getNodes();
    const size = nodes.size;
    const graphMatrix = new GraphMatrix();
    // Initialize matrix with zeros
    graphMatrix.matrix = Array.from({ length: size }, () => Array(size).fill(0));

    // Fill matrix
    const edges = graph.getEdges();
    edges.forEach((edge) => {
      const firstNodeIndex = edge.firstNode.index - 1; // Indexes are 1-based
      const secondNodeIndex = edge.secondNode.index - 1;
      const edgeWeight = edge.weight;
      graphMatrix.matrix[firstNodeIndex][secondNodeIndex] = edgeWeight;
      if (edge.orientation === EdgeOrientation.NON_ORIENTED) { // If non-oriented, fill symmetrically
        graphMatrix.matrix[secondNodeIndex][firstNodeIndex] = edgeWeight;
      }
    });
    console.log(graphMatrix.toString()); // TODO remove
    return graphMatrix;
  }

  buildFromString(input: string): GraphMatrix {
    // TODO implement
    return new GraphMatrix();
  }

}

/**
 * Builder for incidence matrix.
 */
export class IncidenceMatrixBuilder implements GraphMatrixBuilder {
  buildFromGraph(graph: Graph): GraphMatrix {
    if (!graph || graph.isEmpty()) {
      return new GraphMatrix();
    }
    // TODO implement
    return new GraphMatrix();
  }

  buildFromString(input: string): GraphMatrix {
    // TODO implement
    return new GraphMatrix();
  }

}
