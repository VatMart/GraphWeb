import {Node} from "../../model/node";
import {Point} from "../../utils/graphical-utils";
import {Graph} from "../../model/graph";
import {NodeView} from "../../model/graphical-model/node/node-view";
import {EdgeView} from "../../model/graphical-model/edge/edge-view";

/**
 * Base class for graph view generation
 */
export abstract class GraphViewGenerator {

  /**
   * Generate graph view elements from graph.
   * @param graph
   */
  public abstract generateGraphViewElements(graph: Graph): { nodes: NodeView[], edges: EdgeView[] };

  /**
   * Calculate positions of nodes in graph view.
   */
  public abstract calculateNodesPositions(graph: Graph): NodeViewPosition[];
}

export interface NodeViewPosition {
  node: Node;
  position: Point;
}
