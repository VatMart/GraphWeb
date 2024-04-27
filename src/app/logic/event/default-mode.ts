import {ModeBehavior} from "../../service/event/mode-manager.service";
import {FederatedPointerEvent} from "pixi.js";
import {PixiService} from "../../service/pixi.service";
import {NodeView} from "../../model/graphical-model/node-view";
import {GraphViewService} from "../../service/graph-view.service";
import {EventBusService, HandlerNames} from "../../service/event/event-bus.service";
import {MoveNodeViewCommand, NodeMove} from "../command/move-node-view-command";
import {HistoryService} from "../../service/history.service";
import {EdgeView} from "../../model/graphical-model/edge-view";

/**
 * Default mode for the application
 */
export class DefaultMode implements ModeBehavior {

  private onDragStartBound: (event: FederatedPointerEvent) => void;
  private onDragMoveBound: (event: FederatedPointerEvent) => void;
  private onDragEndBound: () => void;
  private onSelectionElementBound: (event: FederatedPointerEvent) => void;

  // Dragging
  private dragTarget: NodeMove[] | null = null;
  private isDragging = false;
  private dragThreshold = 2; // Pixels the mouse must move to start drag
  private moveCommand: MoveNodeViewCommand | null = null;

  constructor(private pixiService: PixiService,
              private eventBus: EventBusService,
              private historyService: HistoryService,
              private graphViewService: GraphViewService) {
    this.onDragStartBound = this.onDragStart.bind(this);
    this.onDragMoveBound = this.onDragMove.bind(this);
    this.onDragEndBound = this.onDragEnd.bind(this);
    this.onSelectionElementBound = this.onSelectElement.bind(this);
    // Register event handlers
    this.eventBus.registerHandler(HandlerNames.ELEMENT_SELECT, this.onSelectionElementBound);
    this.eventBus.registerHandler(HandlerNames.NODE_DRAG_START, this.onDragStartBound);
    this.eventBus.registerHandler(HandlerNames.NODE_DRAG_MOVE, this.onDragMoveBound);
    this.eventBus.registerHandler(HandlerNames.NODE_DRAG_END, this.onDragEndBound);
    console.log("DefaultMode constructor"); // TODO REMOVE
  }

  modeOn(): void {
    console.log("DefaultMode ON");
    this.selectableModeOn();
    this.moveableNodesOn();
  }

  modeOff(): void {
    console.log("DefaultMode OFF");
    this.selectableModeOff();
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

  private selectableModeOn() {
    this.eventBus.registerPixiEvent(this.pixiService.getApp().stage, 'pointerdown',
      HandlerNames.ELEMENT_SELECT);
  }

  private selectableModeOff() {
    this.eventBus.unregisterPixiEvent(this.pixiService.getApp().stage, 'pointerdown',
      HandlerNames.ELEMENT_SELECT);
  }

  private onDragStart(event: FederatedPointerEvent): void {
    const dragObject = event.target as NodeView;

    // Store the starting position of the drag
    let nodesMove: NodeMove[] = [...this.graphViewService.selectedElements]
      .filter(el => el instanceof NodeView)
      .map(el => {
        let element = el as NodeView;
        return new NodeMove(element,
          {x: element.x, y: element.y},
          {x: event.global.x - element.x, y: event.global.y - element.y});
      });
    // If the node being dragged is not already in the list of nodes to move, add it
    if (!nodesMove.some(nm => nm.node === dragObject)) {
      nodesMove.push(new NodeMove(dragObject,
        {x: dragObject.x, y: dragObject.y},
        {x: event.global.x - dragObject.x, y: event.global.y - dragObject.y}));
    }
    this.moveCommand = new MoveNodeViewCommand(nodesMove);

    this.dragTarget = nodesMove;  // Store the targets being dragged
    this.isDragging = false;

    this.eventBus.registerPixiEvent(this.pixiService.getApp().stage, 'pointermove', HandlerNames.NODE_DRAG_MOVE);
    this.eventBus.registerPixiEvent(this.pixiService.getApp().stage, 'pointerup', HandlerNames.NODE_DRAG_END);
    this.eventBus.registerPixiEvent(this.pixiService.getApp().stage, 'pointerupoutside', HandlerNames.NODE_DRAG_END);
  }

  private onDragMove(event: FederatedPointerEvent): void {
    if (this.dragTarget) {
      const newPosition = event.getLocalPosition(this.pixiService.getApp().stage);
      // Check if the drag has moved beyond the threshold
      if (!this.isDragging) {
        let nodeMove = this.dragTarget[0]
        const dx = Math.abs((newPosition.x - nodeMove.offset.x) - nodeMove.oldPosition.x);
        const dy = Math.abs((newPosition.y - nodeMove.offset.y) - nodeMove.oldPosition.y);
        if (dx > this.dragThreshold || dy > this.dragThreshold) {
          this.isDragging = true; // Start dragging if moved beyond threshold
        }
      }
      // Move the nodes if dragging
      if (this.isDragging) {
        // Check selected elements to remove from drag target (bug fix for multiple selection drag
        if (this.graphViewService.selectedElements.size !== this.dragTarget.length) {
          this.dragTarget = this.dragTarget
            .filter(nm => this.graphViewService.selectedElements.has(nm.node));
        }
        // Move the nodes to the new position
        this.dragTarget.forEach(element => {
          element.node.alpha = 0.5;
          element.node.coordinates = {x: newPosition.x - element.offset.x, y: newPosition.y - element.offset.y};
        });
      }
    }
  }

  private onDragEnd(): void {
    if (this.dragTarget) {
      if (this.moveCommand && this.isDragging) {
        this.dragTarget.forEach(element => {
          element.newPosition = element.node.coordinates;
        });
        // Execute the move command
        this.historyService.execute(this.moveCommand);
      }
      // Reset the alpha of the nodes being dragged
      this.dragTarget.forEach(element => {
        element.node.alpha = 1;
      });
      // Clear the drag target
      this.dragTarget = null;
      this.isDragging = false;
    }
    this.eventBus.unregisterPixiEvent(this.pixiService.getApp().stage, 'pointerup', HandlerNames.NODE_DRAG_END);
    this.eventBus.unregisterPixiEvent(this.pixiService.getApp().stage, 'pointerupoutside', HandlerNames.NODE_DRAG_END);
  }

  private onSelectElement(event: FederatedPointerEvent): void {
    event.stopImmediatePropagation();
    const selectedElement = event.target instanceof NodeView
      ? event.target as NodeView
      : event.target instanceof EdgeView
        ? event.target as EdgeView
        : null;

    if (!selectedElement) { // Canvas selected
      this.graphViewService.clearSelection();
      return;
    }

    if (!event.ctrlKey) { // Single selection
      if (this.graphViewService.isElementSelected(selectedElement)) {
        return;
      }
      if (!this.graphViewService.isSelectionEmpty()) {
        this.graphViewService.clearSelection();
        this.graphViewService.selectElement(selectedElement);
        return;
      }
      this.graphViewService.selectElement(selectedElement);
    } else { // Multiple selection
      if (this.graphViewService.isElementSelected(selectedElement)) {
        this.graphViewService.unselectElement(selectedElement);
      } else {
        this.graphViewService.selectElement(selectedElement);
      }
    }
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
