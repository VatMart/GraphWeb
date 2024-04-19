import {NodeView} from "../model/graphical-model/node-view";
import {Container, FederatedPointerEvent, Graphics} from "pixi.js";
import * as PIXI from "pixi.js";

/**
 * TODO
 */
export class NodeEventHandler {

  private dragTarget: NodeView | null = null;

  private stageContainer: Container; // TODO

  // private nodeState: NodeState;

  constructor(stageContainer: Container) {
    this.stageContainer = stageContainer;
    // Initialize handlers:
  }
}

// class DragHandler {
//   constructor(private node: NodeView) {
//     node.graphics.on('pointerdown', this.onDragStart.bind(this));
//     // ... add other event listeners ...
//   }

//   private onDragStart(event: any, nodeGraphical: NodeView): void {
//     const dragObject = event.currentTarget as Graphics;
//     const offset = new PIXI.Point();
//     offset.x = event.data.global.x - dragObject.x;
//     offset.y = event.data.global.y - dragObject.y;
//     dragObject.alpha = 0.5;
//     this.dragTarget = nodeGraphical;
//     this.stageContainer.on('pointermove', (event: FederatedPointerEvent) =>
//       this.onDragMove(event, offset.x, offset.y));
//     this.stageContainer.on('pointerup', this.onDragEnd.bind(this));
//     this.stageContainer.on('pointerupoutside', this.onDragEnd.bind(this));
//   }
//
//   private onDragMove(event: FederatedPointerEvent, offsetX: number, offsetY: number): void {
//     if (this.dragTarget) {
//       const newPosition = event.getLocalPosition(this.stageContainer);
//       this.dragTarget.coordinates = {x:(event.global.x - offsetX), y: (event.global.y - offsetY)};
//     }
//   }
//
//   private onDragEnd(): void {
//     if (this.dragTarget) {
//       this.dragTarget.graphics.alpha = 1;
//       //this.app.stage.off('pointermove', this.onDragMove.bind(this));
//       this.stageContainer.off('pointerup', this.onDragEnd.bind(this));
//       this.stageContainer.off('pointerupoutside', this.onDragEnd.bind(this));
//       this.dragTarget = null;
//     }
//   }
// }



interface NodeState {
  onMouseDown(event: any): void;
  onMouseMove(event: any): void;
  onMouseUp(event: any): void;
}

interface IdleState {
  onMouseDown(event: any): void; // select node (add createEdge draggable component)
  onContextMenu(event: any): void; // show context menu, select
  onMouseMove(event: any): void; // moving node
  onMouseUp(event: any): void; // stop moving
}

interface NodeSelected {
  unselect(event: any): void;
  updateContextMenu(event: any): void;
  dragStart(event: any): void;
}

export class CreatorEdgeEventManager {

  // add events
  // on dragging

  // remove events
}
