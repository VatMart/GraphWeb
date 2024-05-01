import {GraphElement} from "./graph-element";

/**
 * Abstract class for fabric of graph elements
 */
export abstract class AbstractGraphElementFabric {

  /**
   * Changes the style of the graph element
   */
  abstract changeToStyle(graphElement: GraphElement, style: any): void;

  // TODO add more methods
}
