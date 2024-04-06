import {Edge, EdgeIndex} from "./edge";
import {Node} from "./node";

/**
 * Model of graph
 */
export class Graph {

  // key: index; value: Node
  private nodes: Map<number, Node>;

  // key: index, value: Edge
  private edges: Map<EdgeIndex, Edge>;

  constructor() {
    this.nodes = new Map<number, Node>();
    this.edges = new Map<EdgeIndex, Edge>();
  }

}
