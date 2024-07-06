import {Edge} from "./edge";
import {Node} from "./node";
import {GraphOrientation} from "./orientation";
import {ConfService} from "../service/config/conf.service";

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
      this._orientation = ConfService.DEFAULT_GRAPH_ORIENTATION; // default orientation
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

  toJSON() {
    return {
      nodes: Array.from(this.nodes.entries()).map(([key, value]) => [key, value.toJSON()]), // Assuming Node has a toJSON method
      edges: Array.from(this.edges.entries()).map(([key, value]) => [key, value.toJSON()]), // Assuming Edge has a toJSON method
      orientation: this._orientation
    };
  }

  static fromJSON(json: any): Graph {
    const graph = new Graph(json.orientation);
    const nodes = new Map<number, Node>(json.nodes.map(([key, value]: [number, any]) => [key, Node.fromJSON(value)])); // Assuming Node has a fromJSON method
    const edges = new Map<string, Edge>(json.edges.map(([key, value]: [string, any]) => [key, Edge.fromJSON(value, nodes)])); // Assuming Edge has a fromJSON method
    graph.nodes = nodes;
    graph.edges = edges;
    return graph;
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
