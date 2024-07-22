import {NodeView} from "../model/graphical-model/node/node-view";
import {EdgeView} from "../model/graphical-model/edge/edge-view";
import {Bounds, Container} from "pixi.js";

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

  /**
   * Calculate the center point of a cubic bezier curve.
   * @param p0 Start point
   * @param p1 Control point 1
   * @param p2 Control point 2
   * @param p3 End point
   * @return Center point of the bezier curve
   */
  public static calculateBezierCenter(p0: Point, p1: Point, p2: Point, p3: Point): Point {
    const t = 0.5;
    const x = Math.pow((1 - t), 3) * p0.x + 3 * Math.pow((1 - t), 2) * t * p1.x + 3 * (1 - t) * Math.pow(t, 2) * p2.x + Math.pow(t, 3) * p3.x;
    const y = Math.pow((1 - t), 3) * p0.y + 3 * Math.pow((1 - t), 2) * t * p1.y + 3 * (1 - t) * Math.pow(t, 2) * p2.y + Math.pow(t, 3) * p3.y;
    return {x, y};
  }

  /**
   * Calculate the bounding box for multiple pixi.Container objects
   */
  public static calculateCompositeBounds(bounds: Rectangle[]): Rectangle {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    bounds.forEach(boundary => {
      // Update the minimum and maximum boundaries
      minX = Math.min(minX, boundary.x);
      minY = Math.min(minY, boundary.y);
      maxX = Math.max(maxX, boundary.x + boundary.width);
      maxY = Math.max(maxY, boundary.y + boundary.height);
    });

    // Return rectangle that represents the bounds of all containers objects
    return {x: minX, y: minY, width: maxX - minX, height: maxY - minY};
  }

  /**
   * Converts a hex number to a hex color string.
   * @param hex - The hex number (e.g., 0x2db72d).
   * @returns The hex color string (e.g., "#2db72d").
   */
  public static hexNumberToString(hex: number): string {
    // Convert the number to a hex string and pad with leading zeros if necessary
    const hexString = hex.toString(16).padStart(6, '0');
    return `#${hexString}`;
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
