import {Node} from "./node";
import {EdgeOrientation} from "./orientation";

/**
 * Model of graph edge
 *
 * Note: Right now nodes are immutable. If you want to change one of node to other
 * you'll need to create new Edge instance
 */
export class Edge {

  private _firstNode: Node;

  private _secondNode: Node;

  // If you use oriented edge, remember that order of nodes is important.
  // First node is always one which initiate direction: firstNode -> secondNode
  private orientation: EdgeOrientation;

  // Weight of graph (default value is 1.0)
  private weight: number;

  constructor(firstNode: Node, secondNode: Node) {
    this._firstNode = firstNode;
    this._secondNode = secondNode;
    this.weight = 1.0; // default value
    this.orientation = EdgeOrientation.NON_ORIENTED; // default value
  }


  get firstNode(): Node {
    return this._firstNode;
  }

  get secondNode(): Node {
    return this._secondNode;
  }
}

/**
 * Represent edge index as string
 */
export class EdgeIndex {
  private readonly _index: string;

  constructor(from: number, to: number) {
    // Create a unique index by concatenating the node indexes
    this._index = `${from}-${to}`;
  }

  /**
   * Get Edge index from nodes.
   *
   * Note: Beware that this function is not check if graph has edge with this two nodes
   */
  static fromNodes(from: Node, to: Node): EdgeIndex {
    return new this(from.index, to.index)
  }

  /**
   * Get Edge index from edge.
   */
  static fromEdge(edge: Edge): EdgeIndex {
    return new this(edge.firstNode.index, edge.secondNode.index)
  }


  get index(): string {
    return this._index;
  }
}
