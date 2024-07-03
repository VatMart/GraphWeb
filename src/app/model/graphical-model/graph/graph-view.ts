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
