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

  private _type: GraphType;

  constructor(orientation?: GraphOrientation, type?: GraphType) {
    this.nodes = new Map<number, Node>();
    this.edges = new Map<string, Edge>();
    if (orientation) {
      this._orientation = orientation;
    } else {
      this._orientation = ConfService.DEFAULT_GRAPH_ORIENTATION; // default orientation
    }
    this._type = type ? type : GraphType.DEFAULT;
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

  /**
   * Serialize graph to JSON. This method is used to save graph to file.
   * Save only the most important data (indexes and labels of nodes and edges).
   */
  toJSON() {
    return {
      nodes: Array.from(this.nodes.entries()).map(([key, value]) => [key, value.toJSON()]),
      edges: Array.from(this.edges.entries()).map(([key, value]) => [key, value.toJSON()]),
      orientation: this._orientation,
      type: this._type
    };
  }

  static fromJSON(json: any): Graph {
    const graph = new Graph(json.orientation);
    const nodes = new Map<number, Node>(json.nodes.map(([key, value]: [number, any]) =>
      [key, Node.fromJSON(value)]));
    const edges = new Map<string, Edge>(json.edges.map(([key, value]: [string, any]) =>
      [key, Edge.fromJSON(value, nodes)]));
    graph.nodes = nodes;
    graph.edges = edges;
    return graph;
  }

  /**
   * This method is used to convert graph to full JSON (keep all data).
   */
  toFullJSON() {
    return {
      nodes: Array.from(this.nodes.entries()).map(([key, value]) => [key, value.toFullJSON()]),
      edges: Array.from(this.edges.entries()).map(([key, value]) => [key, value.toJSON()]), // Already full JSON
      orientation: this._orientation,
      type: this._type
    }
  }

  /**
   * This method is used to convert graph from full JSON (keep all data).
   */
  static fromFullJSON(json: any): Graph {
    const graph = new Graph(json.orientation);
    const nodes = new Map<number, Node>(json.nodes.map(([key, value]: [number, any]) =>
      [key, Node.fromFullJSON(value)]));
    const edges = new Map<string, Edge>(json.edges.map(([key, value]: [string, any]) =>
      [key, Edge.fromJSON(value, nodes)])); // Already full JSON
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

  get type(): GraphType {
    return this._type;
  }

  set type(value: GraphType) {
    this._type = value;
  }
}

export enum GraphType {
  DEFAULT = 'Default',
  TREE = 'Tree',
}
