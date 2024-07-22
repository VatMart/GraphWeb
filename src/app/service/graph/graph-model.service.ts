import {Injectable} from '@angular/core';
import {Graph} from "../../model/graph";
import {Node} from "../../model/node";
import {Edge, EdgeIndex} from "../../model/edge";
import {GraphOrientation} from "../../model/orientation";

/**
 * Service for handling the model of the graph.
 * Note: Since the service used both via Angular DI and manually init (in separate thread of WebWorker),
 * it should be purely functional and do not contain any states.
 */
@Injectable({
  providedIn: 'root'
})
export class GraphModelService {

  constructor() {
  }

  /**
   * Adds a node to the graph.
   * All other methods for adding nodes should call this method.
   */
  public addNodeToGraph(graph: Graph, nodeOrIndex?: Node | number, label?: string) {
    if (nodeOrIndex === undefined) {
      nodeOrIndex = this.calculateNewNodeIndex(graph);
    }
    let node: Node;
    if (typeof nodeOrIndex === "number") {
      node = label ? new Node(nodeOrIndex, label) : new Node(nodeOrIndex);
    } else {
      node = nodeOrIndex;
    }
    graph.getNodes().has(node.index) ? console.error("Node already exists in graph") // TODO throw exception
      : graph.getNodes().set(node.index, node);
  }

  /**
   * Adds a node to the graph with a label.
   */
  public addNodeToGraphWithLabel(graph: Graph, label: string) {
    const index = this.calculateNewNodeIndex(graph);
    this.addNodeToGraph(graph, index, label);
  }

  /**
   * Removes a node from the graph.
   * All other methods for removing nodes should call this method.
   */
  public removeNodeFromGraph(graph: Graph, node: Node | number): boolean {
    let toNode;
    if (typeof node === "number") {
      toNode = graph.getNodes().get(node);
    } else {
      toNode = node;
    }
    if (toNode) {
      this.getAdjacentEdges(graph, toNode).forEach((edge: Edge) => {
        this.removeEdgeFromGraph(graph, edge);
      });
      return graph.getNodes().delete(toNode.index);
    }
    console.error("Node not found in graph") // TODO throw exception
    return false;
  }

  /**
   * Adds an edge to the graph.
   * All other methods for adding edges should call this method.
   */
  public addEdgeToGraph(graph: Graph, edge: Edge) {
    if (!graph.getEdges().has(edge.edgeIndex.value)) {
      edge.firstNode.addEdge(edge.edgeIndex);
      edge.secondNode.addEdge(edge.edgeIndex);
      graph.getEdges().set(edge.edgeIndex.value, edge);
    } else {
      console.error("Edge already exists in graph") // TODO throw exception
    }
  }

  /**
   * Removes an edge from the graph.
   * All other methods for removing edges should call this method.
   */
  public removeEdgeFromGraph(graph: Graph, edge: Edge): boolean {
    this.removeAdjacentEdgeOfNodes(edge);
    return graph.getEdges().delete(edge.edgeIndex.value);
  }

  public clearAllElements(graph: Graph) {
    graph.getEdges().clear();
    graph.getNodes().clear();
  }

  public calculateNewNodeIndex(graph: Graph): number {
    for (let i = 0; i < graph.getNodes().size; i++) {
      if (!graph.getNodes().has(i + 1)) { // Indexes start from 1
        return i + 1;
      }
    }
    return graph.getNodes().size + 1;
  }

  /**
   * Returns all edges that are adjacent to the given node.
   */
  public getAdjacentEdges(graph: Graph, node: Node): Edge[] {
    let edges: Edge[] = [];
    node.getAdjacentEdges().forEach((edgeIndex: string) => {
      const edge = graph.getEdges().get(edgeIndex);
      if (edge) {
        edges.push(edge);
      }
    });
    return edges;
  }

  /**
   * Returns all nodes that are adjacent to the given node.
   * If the graph is oriented, then the second node is adjacent to the first node.
   * If the graph is not oriented, then both nodes are adjacent to each other.
   */
  public getAdjacentNodes(graph: Graph, node: Node, considerOrientation: boolean = true): Node[] {
    let nodes: Node[] = [];
    for (const edgeIndex of node.getAdjacentEdges()) {
      const edge = graph.getEdges().get(edgeIndex);
      if (edge) {
        if (!considerOrientation) {
          if (edge.firstNode.index === node.index) {
            nodes.push(edge.secondNode);
          }
          continue;
        }
        // If the graph is oriented, then the second node is adjacent to the first node.
        if (graph.orientation === GraphOrientation.ORIENTED && edge.firstNode.index === node.index) {
          nodes.push(edge.secondNode);
        } else if (graph.orientation !== GraphOrientation.ORIENTED) { // If the graph is not oriented, then both nodes are adjacent to each other.
          nodes.push(edge.firstNode.index === node.index ? edge.secondNode : edge.firstNode);
        }
      }
    }
    return nodes;
  }

  /**
   * Returns all nodes that are connected to the given node.
   */
  public getConnectedNodes(graph: Graph, node: Node): Node[] {
    let nodes: Node[] = [];
    node.getAdjacentEdges().forEach((edgeIndex: string) => {
      const edge = graph.getEdges().get(edgeIndex);
      if (edge) {
        nodes.push(edge.firstNode.index === node.index ? edge.secondNode : edge.firstNode);
      }
    });
    return nodes;
  }

  /**
   * Checks if an edge exists between two nodes in the graph.
   */
  public isEdgeExists(graph: Graph, firstNodeIndex: number, secondNodeIndex: number): boolean {
    const edgeIndex = new EdgeIndex(firstNodeIndex, secondNodeIndex);
    return graph.getEdges().has(edgeIndex.value);
  }

  private removeAdjacentEdgeOfNodes(edge: Edge) {
    edge.firstNode.removeEdge(edge.edgeIndex);
    edge.secondNode.removeEdge(edge.edgeIndex);
  }
}
