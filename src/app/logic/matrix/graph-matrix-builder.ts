import {GraphMatrix} from "../../model/graph-matrix";
import {Graph} from "../../model/graph";
import {EdgeOrientation} from "../../model/orientation";

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
    console.log(vertexIndexes); // TODO remove
    return vertexIndexes;
  }
}

/**
 * Builder for adjacency matrix.
 */
export class AdjacencyMatrixBuilder extends GraphMatrixBuilder {

  buildFromGraph(graph: Graph): GraphMatrix {
    if (!graph) {
      return new GraphMatrix();
    }
    const nodes = graph.getNodes();
    const size = nodes.size;
    const graphMatrix = new GraphMatrix();
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
export class IncidenceMatrixBuilder extends GraphMatrixBuilder {
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
