import {Edge, EdgeIndex} from "./edge";
import {Node} from "./node";
import {GraphOrientation} from "./orientation";

/**
 * Model of graph
 */
export class Graph {

  // key: index; value: Node
  private nodes: Map<number, Node>;

  // key: index, value: Edge
  private edges: Map<string, Edge>;

  private orientation: GraphOrientation;

  constructor(orientation?: GraphOrientation) {
    this.nodes = new Map<number, Node>();
    this.edges = new Map<string, Edge>();
    if (orientation) {
      this.orientation = orientation;
    } else {
      this.orientation = GraphOrientation.ORIENTED;
    }
  }

  getNodes(): Map<number, Node> {
    return this.nodes;
  }

  getEdges(): Map<string, Edge> {
    return this.edges;
  }
}
