import {Injectable} from '@angular/core';
import {Graph} from "../model/graph";
import {Node} from "../model/node";
import {Edge} from "../model/edge";

/**
 * Service for handling the model of the graph.
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
  public addNodeToGraph(graph: Graph, nodeOrIndex?: Node | number) {
    if (nodeOrIndex === undefined) {
      nodeOrIndex = this.calculateNewNodeIndex(graph);
    }
    let node: Node;
    if (typeof nodeOrIndex === "number") {
      node = new Node(nodeOrIndex);
    } else {
      node = nodeOrIndex;
    }
    graph.getNodes().has(node.index) ? console.error("Node already exists in graph") // TODO throw exception
      : graph.getNodes().set(node.index, node);
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

  private removeAdjacentEdgeOfNodes(edge: Edge) {
    edge.firstNode.removeEdge(edge.edgeIndex);
    edge.secondNode.removeEdge(edge.edgeIndex);
  }
}
