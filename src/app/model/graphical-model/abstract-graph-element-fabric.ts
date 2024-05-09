import {GraphElement} from "./graph-element";
import {NodeView} from "./node/node-view";

/**
 * Abstract class for fabric of graph elements
 */
export abstract class AbstractGraphElementFabric {

  /**
   * Changes the style of the graph element
   */
  abstract changeToStyle(graphElement: GraphElement, style: any): void;

  abstract changeToPreviousStyle(graphElement: GraphElement): void;
}
