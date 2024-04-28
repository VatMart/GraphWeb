import {NodeView} from "../model/graphical-model/node-view";
import {EdgeView} from "../model/graphical-model/edge-view";

/**
 * Utility class for graphical operations
 */
export class GraphicalUtils {

  /**
   * Utility function to check if two rectangles intersect
   */
  public static rectanglesIntersect(rect1: Rectangle, rect2: Rectangle): boolean {
    return rect1.x <= rect2.x && rect1.y <= rect2.y
      && (rect1.x + rect1.width) >= (rect2.x + rect2.width) && (rect1.y + rect1.height) >= (rect2.y + rect2.height);
  }

  /**
   * Utility function to check if a point is inside a rectangle
   */
  public static nodeViewToRectangle(nodeView: NodeView): Rectangle {
    return {
      x: nodeView.coordinates.x,
      y: nodeView.coordinates.y,
      width: nodeView.width,
      height: nodeView.height
    };
  }

  /**
   * Utility function to check if a point is inside a rectangle
   */
  public static edgeViewToRectangle(edgeView: EdgeView): Rectangle {
    // TODO implement
    return {x: 0, y: 0, width: 0, height: 0};
  }
}

export type Rectangle = {
  x: number; // x-coordinate of the top-left corner
  y: number; // y-coordinate of the top-left corner
  width: number;
  height: number;
}

export type Point = {
  x: number;
  y: number;
}
