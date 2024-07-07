import {Graph} from "../../graph";
import {NodeView} from "../node/node-view";
import {EdgeView} from "../edge/edge-view";

/**
 * Graph view model
 */
export class GraphView {

  private _graph: Graph;
  private _nodeViews: Map<number, NodeView>; // key is the node index
  private _edgeViews: Map<string, EdgeView>; // key is the edge index

  constructor(graph: Graph, nodeViews?: Map<number, NodeView>, edgeViews?: Map<string, EdgeView>) {
    this._graph = graph;
    this._nodeViews = nodeViews ? nodeViews : new Map<number, NodeView>();
    this._edgeViews = edgeViews ? edgeViews : new Map<string, EdgeView>();
  }

  public isEmpty(): boolean {
    return this._nodeViews.size === 0 && this._edgeViews.size === 0;
  }

  toJSON() {
    return {
      graph: this._graph.toJSON(),
      nodeViews: Array.from(this._nodeViews.entries()).map(([key, value]) => [key, value.toJSON()]),
      edgeViews: Array.from(this._edgeViews.entries()).map(([key, value]) => [key, value.toJSON()])
    };
  }

  static fromJSON(json: any): GraphView {
    const graph = Graph.fromJSON(json.graph); // Assuming Graph class has a fromJSON method
    const nodeViews = new Map<number, NodeView>(json.nodeViews.map(([key, value]: [number, any]) => [key, NodeView.fromJSON(value, graph.getNodes())]));
    const edgeViews = new Map<string, EdgeView>(json.edgeViews.map(([key, value]: [string, any]) => [key, EdgeView.fromJSON(value, graph.getEdges(), nodeViews)]));
    return new GraphView(graph, nodeViews, edgeViews);
  }

  get graph(): Graph {
    return this._graph;
  }

  set graph(value: Graph) {
    this._graph = value;
  }

  get nodeViews(): Map<number, NodeView> {
    return this._nodeViews;
  }

  set nodeViews(value: Map<number, NodeView>) {
    this._nodeViews = value;
  }

  get edgeViews(): Map<string, EdgeView> {
    return this._edgeViews;
  }

  set edgeViews(value: Map<string, EdgeView>) {
    this._edgeViews = value;
  }
}
