import {GraphMatrix} from "../model/graph-matrix";
import {Graph} from "../model/graph";
import {GraphModelService} from "../service/graph/graph-model.service";
import {Edge} from "../model/edge";
import {EdgeOrientation, GraphOrientation} from "../model/orientation";
import {GraphSet, GraphSets} from "../model/graph-set";
import {Node} from "../model/node";

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
    let result : Graph;
    if (matrix.type === 'Adjacency') {
      result = this.buildGraphFromAdjacencyMatrix(matrix);
    } else {
      result = this.buildGraphFromIncidenceMatrix(matrix);
    }
    return result;
  }

  /**
   * Build graph from vertices and edges sets.
   * @param graphSets valid vertices and edges sets
   */
  public buildGraphFromSets(graphSets: GraphSets): Graph {
    let graph = new Graph();
    this.processVerticesSet(graphSets.verticesSet, graph);
    this.processEdgesSet(graphSets.edgesSet, graph);
    return graph;
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
    graph.orientation = this.determineGraphOrientation(edgesOrientations);
    //console.log("Graph edges: " + [...graph.getEdges().values()].map(e => 'edge: ' + e.edgeIndex.value + '; orient: ' + e.orientation.toString())); // TODO remove
    return graph;
  }

  private buildGraphFromIncidenceMatrix(matrix: GraphMatrix): Graph {
    const rows = matrix.matrix.length;
    const cols = matrix.matrix[0].length;
    const graph = new Graph();

    // Fill nodes
    for (let i = 0; i < rows; i++) {
      this.graphService.addNodeToGraph(graph);
    }

    // Create edges
    for (let j = 0; j < cols; j++) {
      let firstNodeIndex: {index: number, first: boolean} | null = null;
      let secondNodeIndex: {index: number, first: boolean} | null = null;
      let edgeWeight = 0;
      let orientation = EdgeOrientation.NON_ORIENTED; // Default orientation


      for (let i = 0; i < rows; i++) {
        const value = matrix.matrix[i][j];
        if (value !== 0) {
          orientation = value < 0 ? EdgeOrientation.ORIENTED : orientation;
          if (firstNodeIndex === null) {
            firstNodeIndex = {index: i + 1, first: value > 0};
            edgeWeight = Math.abs(value);
          } else {
            secondNodeIndex = {index: i + 1, first: value > 0};
          }
        }
      }

      if (firstNodeIndex !== null && secondNodeIndex !== null) {
        let startNode;
        let endNode;
        if (orientation === EdgeOrientation.ORIENTED) {
          startNode = firstNodeIndex.first ? graph.getNodes().get(firstNodeIndex.index) :
            graph.getNodes().get(secondNodeIndex.index);
          endNode = firstNodeIndex.first ? graph.getNodes().get(secondNodeIndex.index) :
            graph.getNodes().get(firstNodeIndex.index);
        } else {
          startNode = graph.getNodes().get(firstNodeIndex.index);
          endNode = graph.getNodes().get(secondNodeIndex.index);
        }
        if (!startNode || !endNode) {
          throw new Error("Can't generate graph from matrix. Node not found"); // Todo handle exception
        }
        const edge = new Edge(startNode, endNode, orientation, edgeWeight);
        this.graphService.addEdgeToGraph(graph, edge);
      }
    }

    // Determine graph orientation
    const edges = graph.getEdges().values();
    const edgesOrientations = [...edges].map(edge => edge.orientation);
    graph.orientation = this.determineGraphOrientation(edgesOrientations);
    return graph;
  }

  private processVerticesSet(verticesSet: GraphSet, graph: Graph) {
    verticesSet.graphSet.forEach(value => {
      let numValue = Number(value);
      if (isNaN(numValue)) {
        this.graphService.addNodeToGraphWithLabel(graph, value);
      } else {
        this.graphService.addNodeToGraph(graph, numValue);
      }
    });
  }

  private processEdgesSet(edgesSet: GraphSet, graph: Graph) {
    edgesSet.graphSet.forEach(value => {
      let vertices = value.split('-');
      const weight = 1; // Default weight TODO get from property service
      const orientation = EdgeOrientation.ORIENTED; // Default orientation TODO get from property service
      const firstNodeNum = Number(vertices[0]);
      const secondNodeNum = Number(vertices[1]);
      let firstNode : Node;
      let secondNode : Node;
      if (isNaN(firstNodeNum)) { // If not a number, then it's a label
        firstNode = [...graph.getNodes().values()].find(node => node.label === vertices[0])!;
      } else { // If a number, then it's a node index
        firstNode = graph.getNodes().get(firstNodeNum)!;
      }
      if (isNaN(secondNodeNum)) { // If not a number, then it's a label
        secondNode = [...graph.getNodes().values()].find(node => node.label === vertices[1])!;
      } else { // If a number, then it's a node index
        secondNode = graph.getNodes().get(secondNodeNum)!;
      }
      const edge = new Edge(firstNode, secondNode, orientation, weight);
      this.graphService.addEdgeToGraph(graph, edge);
    });
  }

  private determineGraphOrientation(edgesOrientations: EdgeOrientation[]): GraphOrientation {
    if (edgesOrientations.every(orientation => orientation === EdgeOrientation.NON_ORIENTED)) {
      return GraphOrientation.NON_ORIENTED;
    } else if (edgesOrientations.every(orientation => orientation === EdgeOrientation.ORIENTED)) {
      return GraphOrientation.ORIENTED;
    } else {
      return GraphOrientation.MIXED;
    }
  }
}

export interface NodePair {
  firstNode: number;
  secondNode: number;
}
