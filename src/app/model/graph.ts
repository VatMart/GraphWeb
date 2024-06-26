import {Edge} from "./edge";
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

  private _orientation: GraphOrientation;

  constructor(orientation?: GraphOrientation) {
    this.nodes = new Map<number, Node>();
    this.edges = new Map<string, Edge>();
    if (orientation) {
      this._orientation = orientation;
    } else {
      this._orientation = GraphOrientation.ORIENTED;
    }
  }

  toString(): string {
    return `Graph: nodes: ${this.nodes.size}, edges: ${this.edges.size}`;
  }

  clone() {
    const graph = new Graph(this.orientation);
    for (const node of this.nodes.values()) {
      graph.nodes.set(node.index, node.clone());
    }
    for (const edge of this.edges.values()) {
      graph.edges.set(edge.edgeIndex.value, edge.clone());
    }
    return graph;
  }

  public isEmpty(): boolean {
    return this.nodes.size === 0;
  }

  getNodes(): Map<number, Node> {
    return this.nodes;
  }

  getEdges(): Map<string, Edge> {
    return this.edges;
  }

  get orientation(): GraphOrientation {
    return this._orientation;
  }

  set orientation(value: GraphOrientation) {
    this._orientation = value;
  }
}
