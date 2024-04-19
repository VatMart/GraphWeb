import { Injectable } from '@angular/core';
import {Graph} from "../model/graph";
import {Node} from "../model/node";

/**
 * Service for handling the model of the graph.
 * This service shouldn't have public methods.
 */
@Injectable({
  providedIn: 'root'
})
export class GraphModelService {

  constructor() { }

  protected addNodeToGraph(graph: Graph, nodeOrIndex: Node | number) {
    let node: Node;
    if (typeof nodeOrIndex === "number") {
      node = new Node(nodeOrIndex);
    } else {
      node = nodeOrIndex;
    }
    graph.getNodes().has(node.index) ? console.error("Node already exists in graph") // TODO throw exception
      : graph.getNodes().set(node.index, node);
  }

  protected removeNodeFromGraph(graph: Graph, node: Node | number): boolean {
    let index: number;
    if (typeof node === "number") {
      index = node;
    } else {
      index = node.index;
    }
    return graph.getNodes().delete(index);
  }

  public calculateNewNodeIndex(graph: Graph): number {
    for (let i = 0; i < graph.getNodes().size; i++) {
      if (!graph.getNodes().has(i + 1)) { // Indexes start from 1
        return i + 1;
      }
    }
    return graph.getNodes().size + 1;
  }
}
