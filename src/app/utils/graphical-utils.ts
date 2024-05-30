import {NodeView} from "../model/graphical-model/node/node-view";
import {EdgeView} from "../model/graphical-model/edge/edge-view";

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
   * Utility function to calculate the distance between two points
   */
  public static distanceBetween(p1: Point, p2: Point): number {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
  }

  /**
   * Calculate the midpoint between two points
   */
  public static midpoint(p1: Point, p2: Point): Point {
    return {x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2};
  }

  /**
   * Convert degrees to radians
   */
  public static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Utility function to check if a point is inside a rectangle
   */
  public static edgeViewToRectangle(edgeView: EdgeView): Rectangle {
    let pixiRectangle = edgeView.getLocalBounds();
    return {x: pixiRectangle.x, y: pixiRectangle.y, width: pixiRectangle.width, height: pixiRectangle.height};
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
