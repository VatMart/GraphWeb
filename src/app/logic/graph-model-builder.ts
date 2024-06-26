import {GraphMatrix} from "../model/graph-matrix";
import {Graph} from "../model/graph";
import {GraphModelService} from "../service/graph-model.service";
import {Edge} from "../model/edge";
import {EdgeOrientation, GraphOrientation} from "../model/orientation";

/**
 * Graph builder. Builds graph from different types of input.
 * All input should be validated before passing to builder.
 */
export class GraphModelBuilder {
  constructor(private graphService: GraphModelService) {
  }

  /**
   * Build graph from matrix.
   * @param matrix Valid graph matrix
   */
  public buildGraphFromMatrix(matrix: GraphMatrix): Graph {
    // TODO implement
    let result : Graph;
    if (matrix.type === 'Adjacency') {
      result = this.buildGraphFromAdjacencyMatrix(matrix);
    } else {
      result = this.buildGraphFromIncidenceMatrix(matrix);
    }
    return result;
  }

  private buildGraphFromAdjacencyMatrix(matrix: GraphMatrix): Graph {
    const size = matrix.matrix.length;
    const graph = new Graph();
    // Fill nodes
    for (let i = 0; i < size; i++) {
      this.graphService.addNodeToGraph(graph);
    }
    // Create edges
    const edges: NodePair[] = [];
    const edgesOrientations: EdgeOrientation[] = [];
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (matrix.matrix[i][j] >= 1 &&
          !edges.some(pair => pair.firstNode === j + 1 && pair.secondNode === i + 1)) {
          const reverseValue = matrix.matrix[j][i];
          let orientation = EdgeOrientation.NON_ORIENTED;
          const startNode = graph.getNodes().get(i + 1);
          const endNode = graph.getNodes().get(j + 1);
          if (reverseValue === 0) {
            orientation = EdgeOrientation.ORIENTED;
          }
          if (!startNode || !endNode) {
            throw new Error("Can't generate graph from matrix. Node not found"); // Todo handle exception
          }
          const edge = new Edge(startNode, endNode, orientation, matrix.matrix[i][j]);
          edgesOrientations.push(orientation);
          edges.push({firstNode: i + 1, secondNode: j + 1});
          this.graphService.addEdgeToGraph(graph, edge);
        }
      }
    }
    // Check edges orientation to set graph orientation
    if (edgesOrientations.every(orientation => orientation === EdgeOrientation.NON_ORIENTED)) {
      graph.orientation = GraphOrientation.NON_ORIENTED;
    } else if (edgesOrientations.every(orientation => orientation === EdgeOrientation.ORIENTED)) {
      graph.orientation = GraphOrientation.ORIENTED;
    } else {
      graph.orientation = GraphOrientation.MIXED;
    }
    //console.log("Graph edges: " + [...graph.getEdges().values()].map(e => 'edge: ' + e.edgeIndex.value + '; orient: ' + e.orientation.toString())); // TODO remove
    return graph;
  }

  private buildGraphFromIncidenceMatrix(matrix: GraphMatrix): Graph {
    return new Graph();
  }
}

export interface NodePair {
  firstNode: number;
  secondNode: number;
}
