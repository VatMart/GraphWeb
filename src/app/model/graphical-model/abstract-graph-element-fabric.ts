import {GraphElement} from "./graph-element";

/**
 * Abstract class for fabric of graph elements
 */
export abstract class AbstractGraphElementFabric {

  /**
   * Changes the style of the graph element and saves it in cache
   */
  abstract changeToStyleAndSave(graphElement: GraphElement, style: any): void;

  /**
   * Changes the style of the graph element
   */
  abstract changeToStyle(graphElement: GraphElement, style: any): void;

  /**
   * Changes the style of the graph element to the previous style
   */
  abstract changeToPreviousStyle(graphElement: GraphElement): void;
}
