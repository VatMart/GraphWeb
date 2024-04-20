import {ModeBehavior} from "../../service/event/mode-manager.service";
import * as PIXI from "pixi.js";
import {FederatedPointerEvent} from "pixi.js";
import {PixiService} from "../../service/pixi.service";
import {NodeView} from "../../model/graphical-model/node-view";
import {Point} from "../../utils/graphical-utils";
import {GraphViewService} from "../../service/graph-view.service";
import {EventBusService, HandlerNames} from "../../service/event/event-bus.service";
import {MoveNodeViewCommand} from "../command/move-node-view-command";
import {HistoryService} from "../../service/history.service";

/**
 * Default mode for the application
 */
export class DefaultMode implements ModeBehavior {

  private onDragStartBound: (event: FederatedPointerEvent) => void;
  private onDragMoveBound: (event: FederatedPointerEvent) => void;
  private onDragEndBound: () => void;

  private dragTarget: NodeView | null = null;
  private dragOffset: PIXI.Point = new PIXI.Point();
  private dragStartPoint: Point = {x: 0, y: 0};
  private moveCommand: MoveNodeViewCommand | null = null;

  constructor(private pixiService: PixiService,
              private eventBus: EventBusService,
              private historyService: HistoryService,
              private graphViewService: GraphViewService) {
    this.onDragStartBound = this.onDragStart.bind(this);
    this.onDragMoveBound = this.onDragMove.bind(this);
    this.onDragEndBound = this.onDragEnd.bind(this);
    // Register event handlers
    this.eventBus.registerHandler(HandlerNames.NODE_DRAG_START, this.onDragStartBound);
    this.eventBus.registerHandler(HandlerNames.NODE_DRAG_MOVE, this.onDragMoveBound);
    this.eventBus.registerHandler(HandlerNames.NODE_DRAG_END, this.onDragEndBound);
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
    this.eventBus.registerPixiEvent(nodeView, 'pointerdown', HandlerNames.NODE_DRAG_START);
  }

  /**
   * Remove listeners for moving node of particular node
   */
  public moveableNodeOff(nodeView: NodeView) {
    this.eventBus.unregisterPixiEvent(nodeView, 'pointerdown', HandlerNames.NODE_DRAG_START);
  }

  private onDragStart(event: FederatedPointerEvent): void {
    const dragObject = event.currentTarget as NodeView;

    // Store the starting position of the drag
    this.dragStartPoint = {x: dragObject.x, y: dragObject.y};
    this.moveCommand = new MoveNodeViewCommand(dragObject, this.graphViewService);
    this.moveCommand.oldPosition = {x: dragObject.x, y: dragObject.y};

    this.dragOffset.x = event.global.x - dragObject.x;
    this.dragOffset.y = event.global.y - dragObject.y;
    dragObject.alpha = 0.5;
    this.dragTarget = dragObject;  // Store the target being dragged

    this.eventBus.registerPixiEvent(this.pixiService.getApp().stage, 'pointermove', HandlerNames.NODE_DRAG_MOVE);
    this.eventBus.registerPixiEvent(this.pixiService.getApp().stage, 'pointerup', HandlerNames.NODE_DRAG_END);
    this.eventBus.registerPixiEvent(this.pixiService.getApp().stage, 'pointerupoutside', HandlerNames.NODE_DRAG_END);
  }

  private onDragMove(event: FederatedPointerEvent): void {
    if (this.dragTarget) {
      const newPosition = event.getLocalPosition(this.pixiService.getApp().stage);
      this.dragTarget.coordinates = {x: newPosition.x - this.dragOffset.x, y: newPosition.y - this.dragOffset.y};
    }
  }

  private onDragEnd(): void {
    if (this.dragTarget) {
      if (this.moveCommand) {
        this.moveCommand.newPosition = this.dragTarget.coordinates;
        this.historyService.execute(this.moveCommand); // Execute the move command
      }
      this.dragTarget.alpha = 1;  // Reset the alpha to fully opaque
      this.dragTarget = null;  // Clear the drag target
    }
    this.eventBus.unregisterPixiEvent(this.pixiService.getApp().stage, 'pointerup', HandlerNames.NODE_DRAG_END);
    this.eventBus.unregisterPixiEvent(this.pixiService.getApp().stage, 'pointerupoutside', HandlerNames.NODE_DRAG_END);
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
