import {ModeBehavior} from "./mode-manager.service";
import * as PIXI from "pixi.js";
import {PixiService} from "../pixi.service";
import {NodeView} from "../../model/graphical-model/node-view";
import {FederatedPointerEvent, Graphics} from "pixi.js";
import {GraphViewService} from "../graph-view.service";

export class DefaultMode implements ModeBehavior {

  constructor(private pixiService: PixiService,
              private graphViewService: GraphViewService) {
    console.log("DefaultMode constructor"); // TODO REMOVE
  }

  modeOn(): void {
    console.log("DefaultMode ON");
    this.moveableNodesOn();
  }

  modeOff(): void {
    console.log("DefaultMode OFF");
    this.moveableNodesOff();
  }

  onAddedNode(nodeView: NodeView): void {
    this.moveableNodeOn(nodeView);
  }

  /**
   * Add listeners for moving nodes to all nodes
   */
  public moveableNodesOn() {
    // Add event listeners to all nodes
    this.graphViewService.map.forEach((nodeView: NodeView) => {
      this.moveableNodeOn(nodeView);
    });
  }

  /**
   * Remove listeners for moving nodes to all nodes
   */
  public moveableNodesOff() {
    this.graphViewService.map.forEach((nodeView: NodeView) => {
      this.moveableNodeOff(nodeView);
    });
  }

  /**
   * Remove listeners for moving nodes of particular node
   */
  public moveableNodeOn(nodeView: NodeView) {

    let dragTarget: NodeView | null = null;

    const onDragStart = (event: any, nodeGraphical: NodeView): void => {
      const dragObject = event.currentTarget as Graphics;
      const offset = new PIXI.Point();
      offset.x = event.data.global.x - dragObject.x;
      offset.y = event.data.global.y - dragObject.y;
      dragObject.alpha = 0.5;
      dragTarget = nodeGraphical;
      this.pixiService.getApp().stage.on('pointermove', (event: FederatedPointerEvent) =>
        onDragMove(event, offset.x, offset.y));
      this.pixiService.getApp().stage.on('pointerup', onDragEnd.bind(this));
      this.pixiService.getApp().stage.on('pointerupoutside', onDragEnd.bind(this));
    }

    const onDragMove = (event: FederatedPointerEvent, offsetX: number, offsetY: number): void => {
      if (dragTarget) {
        const newPosition = event.getLocalPosition(this.pixiService.getApp().stage);
        dragTarget.coordinates = {x: (event.global.x - offsetX), y: (event.global.y - offsetY)};
        // TODO TEST
        // this.calculateRepulsiveForces();
        // this.updatePositions(0.1);  // Update positions immediately while dragging
      }
    }

    const onDragEnd = (): void => {
      if (dragTarget) {
        dragTarget.alpha = 1;
        this.pixiService.getApp().stage.off('pointerup', onDragEnd.bind(this));
        this.pixiService.getApp().stage.off('pointerupoutside', onDragEnd.bind(this));
        dragTarget = null;
      }
    }

    nodeView.on('pointerdown', (event) =>
      onDragStart(event, nodeView), nodeView);
  }

  /**
   * Remove listeners for moving node of particular node
   */
  public moveableNodeOff(nodeView: NodeView) {
    nodeView.off('pointerdown');
  }

  // TEST
  private calculateRepulsiveForces() {
    const repulsionConstant = 5000;  // Adjust as needed for your specific scenario
    this.graphViewService.map.forEach((node, i) => {
      this.graphViewService.map.forEach((other, j) => {
        if (i !== j) {
          const dx = node.x - other.x;
          const dy = node.y - other.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const forceMagnitude = repulsionConstant / (distance * distance);

          const fx = (dx / distance) * forceMagnitude;
          const fy = (dy / distance) * forceMagnitude;

          other.vx += fx;
          other.vy += fy;
        }
      });
    });
  }

  private updatePositions(deltaTime: number) {
    this.graphViewService.map.forEach(node => {
      node.x += node.vx * deltaTime;
      node.y += node.vy * deltaTime;

      // Reset velocities after update to prevent runaway effects
      node.vx = 0;
      node.vy = 0;
    });
  }
}
