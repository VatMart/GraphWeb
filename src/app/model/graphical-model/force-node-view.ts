import {NodeView} from "./node/node-view";
import {Point} from "../../utils/graphical-utils";

/**
 * Force node view to simulate forces on the node.
 */
export class ForceNodeView {
  node: NodeView;
  vx: number = 0; // Velocity in x direction
  vy: number = 0; // Velocity in y direction
  ax: number = 0; // Acceleration in x direction
  ay: number = 0; // Acceleration in y direction
  mass: number = 1; // Optional: Mass of the node
  damping: number = 0.9; // Damping factor to simulate friction
  maxVelocity: number = 10; // Maximum velocity that can be achieved
  forceThreshold: number = 0.01; // Threshold to consider a node at rest

  constructor(node: NodeView) {
    this.node = node;
  }

  /**
   * Apply force to the node.
   * @param fx - Force in x direction
   * @param fy - Force in y direction
   */
  applyForce(fx: number, fy: number) {
    this.ax += fx / this.mass;
    this.ay += fy / this.mass;
  }

  /**
   * Return position of the node based on the forces applied.
   * @returns New position of the node.
   */
  updatePosition() : Point {
    const totalForce = Math.sqrt(this.ax * this.ax + this.ay * this.ay);
    // If the total force is less than the threshold, stop the node
    if (totalForce < this.forceThreshold) {
      this.ax = 0;
      this.ay = 0;
      this.vx = 0;
      this.vy = 0;
      return {x: this.node.x, y: this.node.y};
    }
    // Apply damping and limit the velocity
    this.vx = (this.vx + this.ax) * this.damping;
    this.vy = (this.vy + this.ay) * this.damping;
    const velocity = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    if (velocity > this.maxVelocity) {
      const scale = this.maxVelocity / velocity;
      this.vx *= scale;
      this.vy *= scale;
    }
    this.ax = 0;
    this.ay = 0;
    return {x: this.node.x + this.vx, y: this.node.y + this.vy};
  }
}
