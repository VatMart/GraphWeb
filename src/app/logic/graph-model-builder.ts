import {GraphMatrix} from "../model/graph-matrix";
import {Graph} from "../model/graph";
import {GraphModelService} from "../service/graph/graph-model.service";
import {Edge} from "../model/edge";
import {EdgeOrientation, GraphOrientation} from "../model/orientation";
import {GraphSet, GraphSets} from "../model/graph-set";
import {Node} from "../model/node";
import {GenerateGraphOptions} from "../component/tab-nav/generate-view/generate-view.component";
import {ConfService} from "../service/config/conf.service";

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
    let result: Graph;
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

  /**
   * Generate default graph from options.
   * @param options options for generating graph
   */
  buildDefaultGraphFromOptions(options: GenerateGraphOptions): Graph {
    // Calculate number of nodes
    const numberOfNodes: number = this.calculateNodesNumber (options);
    const edgesNumber: number = this.calculateEdgesNumber(numberOfNodes, options);
    const edgesWeights: number[] = options.edgeWeightSpecify ? this.calculateEdgeWeights(edgesNumber, options) :
      Array(edgesNumber).fill(1);
    // Generate graph
    const graph = this.createDefaultGraph(numberOfNodes, edgesNumber, edgesWeights, options);
    // console.log('Number of nodes: ' + numberOfNodes + '; Number of edges: ' + edgesNumber); // TODO remove
    // console.log('Edges weights: ' + edgesWeights); // TODO remove
    return graph;
  }

  /**
   * Generate tree graph from options.
   * @param options options for generating graph
   */
  buildTreeGraphFromOptions(options: GenerateGraphOptions): Graph {
    // TODO
    return new Graph();
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
    const loopEdges: Node[] = [];
    for (let j = 0; j < cols; j++) {
      let firstNodeIndex: { index: number, first: boolean } | null = null;
      let secondNodeIndex: { index: number, first: boolean } | null = null;
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

      if (firstNodeIndex !== null && secondNodeIndex === null && edgeWeight === 2) {
        // Handle loop edge case
        const loopNode = graph.getNodes().get(firstNodeIndex.index);
        if (!loopNode) {
          throw new Error("Can't generate graph from matrix. Node not found"); // Todo handle exception
        }
        loopEdges.push(loopNode); // Save loop edge to add it later
      } else if (firstNodeIndex !== null && secondNodeIndex !== null) {
        // Handle regular edge case
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
    // Add loop edges with correct orientation
    loopEdges.forEach(node => {
      const edgeOrientation = graph.orientation === GraphOrientation.ORIENTED ? EdgeOrientation.ORIENTED : EdgeOrientation.NON_ORIENTED;
      const edge = new Edge(node, node, edgeOrientation, 1); // Default weight
      this.graphService.addEdgeToGraph(graph, edge);
    });
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
      let firstNode: Node;
      let secondNode: Node;
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

  private calculateNodesNumber(options: GenerateGraphOptions): number {
    if (options.fixedNumberOfNodes) {
      return options.fixedNodesNumber;
    } else { // Range of nodes
      // Generate random number of nodes based on range
      const minNodes = Math.min(options.dynamicNodesNumber[0], options.dynamicNodesNumber[1]);
      const maxNodes = Math.max(options.dynamicNodesNumber[0], options.dynamicNodesNumber[1]);
      return Math.floor(Math.random() * (maxNodes - minNodes + 1)) + minNodes;
    }
  }

  private calculateEdgesNumber(numberOfNodes: number, options: GenerateGraphOptions): number {
    const maxEdges = options.graphOrientation === GraphOrientation.NON_ORIENTED
      ? (numberOfNodes * (numberOfNodes - 1)) / 2
      : numberOfNodes * (numberOfNodes - 1);
    // To avoid exponential growth of edges number, used reverse quadratic function with exponential decrease
    // Function params works good only for 1-350 nodes. Need to adjust for more nodes
    const a = 2;  // Starting value of exponential function
    const b = 6;  // Ending value of exponential function
    const c = ConfService.MAX_NUMBER_OF_NODES; // The range limit
    const k = 2; // Reverse aggressiveness factor
    // Normalize x to the range [0, 1]
    const normalizedX = (numberOfNodes - 1) / (c - 1);
    // Calculate exponential function
    const quadraticFunction = a + (b - a) * (1 - Math.pow(1 - normalizedX, k));
    //console.log('Quadratic function: ' + quadraticFunction); // TODO remove
    const expFun = maxEdges * options.edgesProbability * Math.exp(-quadraticFunction);
    //console.log('Exponential function: ' + expFun); // TODO remove
    return Math.floor(expFun);
  }

  private calculateEdgeWeights(edgesNumber: number, options: GenerateGraphOptions): number[] {
    const result: number[] = [];
    const minWeight = Math.min(options.edgeWeightRange[0], options.edgeWeightRange[1]);
    const maxWeight = Math.max(options.edgeWeightRange[0], options.edgeWeightRange[1]);
    for (let i = 0; i < edgesNumber; i++) {
      result.push(Math.floor(Math.random() * Math.abs(maxWeight - minWeight + 1)) + minWeight);
    }
    return result;
  }

  private createDefaultGraph(numberOfNodes: number, edgesNumber: number, edgesWeights: number[],
                             options: GenerateGraphOptions): Graph {
    const graph = new Graph(options.graphOrientation);
    // Create nodes
    for (let i = 0; i < numberOfNodes; i++) {
      this.graphService.addNodeToGraph(graph);
    }
    // Generate all possible valid pairs of nodes (for creating edges) once
    // Such approach was used to avoid creating the same pair of nodes twice
    const validPairs = this.generateAllValidNodePairs(graph, options);
    // Shuffle the list of valid pairs to randomize selection
    for (let i = validPairs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [validPairs[i], validPairs[j]] = [validPairs[j], validPairs[i]];
    }

    // Create edges
    for (let i = 0; i < edgesNumber; i++) {
      const nodePair: NodePair = validPairs.pop()!;
      const startNode = graph.getNodes().get(nodePair.firstNode)!;
      const endNode = graph.getNodes().get(nodePair.secondNode)!;
      const orientation = options.graphOrientation === GraphOrientation.NON_ORIENTED ?
        EdgeOrientation.NON_ORIENTED : EdgeOrientation.ORIENTED;
      const edge = new Edge(startNode, endNode, orientation, edgesWeights[i]);
      this.graphService.addEdgeToGraph(graph, edge);
    }

    return graph;
  }

  private generateAllValidNodePairs(graph: Graph, options: GenerateGraphOptions): NodePair[] {
    const nodesIndexes = [...graph.getNodes().keys()];
    const validPairs: NodePair[] = [];

    // Generate all possible valid pairs
    for (let i = 0; i < nodesIndexes.length; i++) {
      for (let j = 0; j < nodesIndexes.length; j++) {
        if (!options.allowLoops && i === j) {
          continue;
        }
        const pair: NodePair = { firstNode: nodesIndexes[i], secondNode: nodesIndexes[j] };
        // Check if the pair already exists or reverse pair exists (if graph is oriented and two direction edges are not allowed)
        const edgeExists = (this.graphService.isEdgeExists(graph, pair.firstNode, pair.secondNode))
          || (!options.allowTwoDirectionEdges && options.graphOrientation === GraphOrientation.ORIENTED &&
            this.graphService.isEdgeExists(graph, pair.secondNode, pair.firstNode));
        if (!edgeExists) {
          validPairs.push(pair);
        }
      }
    }

    return validPairs;
  }
}

export interface NodePair {
  firstNode: number;
  secondNode: number;
}
