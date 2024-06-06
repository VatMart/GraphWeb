import {ModeBehavior} from "../../service/manager/mode-manager.service";
import {FederatedPointerEvent} from "pixi.js";
import {PixiService} from "../../service/pixi.service";
import {NodeView} from "../../model/graphical-model/node/node-view";
import {GraphViewService} from "../../service/graph-view.service";
import {EventBusService, HandlerNames} from "../../service/event-bus.service";
import {MoveNodeViewCommand, NodeMove} from "../command/move-node-view-command";
import {HistoryService} from "../../service/history.service";
import {EdgeView} from "../../model/graphical-model/edge/edge-view";
import {GraphicalUtils, Point, Rectangle} from "../../utils/graphical-utils";
import {SelectRectangle} from "../../model/graphical-model/select-rectangle";

/**
 * Default mode for the application
 */
export class DefaultMode implements ModeBehavior {

  private onDragStartBound: (event: FederatedPointerEvent) => void;
  private onDragMoveBound: (event: FederatedPointerEvent) => void;
  private onDragEndBound: () => void;

  private onSelectionElementBound: (event: FederatedPointerEvent) => void;
  private onRectangleSelectionMoveBound: (event: FederatedPointerEvent) => void;
  private onRectangleSelectionEndBound: (event: FederatedPointerEvent) => void;

  // Dragging
  private dragTarget: NodeMove[] | null = null;
  private isDragging = false;
  private dragThreshold = 2; // Pixels the mouse must move to start drag
  private moveCommand: MoveNodeViewCommand | null = null;

  // Selecting
  private isRectangleSelection = false;
  private rectangleSelection: SelectRectangle;
  private rectangleSelectionStart: Point | null = null;
  private rectangleSelectionThreshold = 2; // Pixels the mouse must move to start rectangle selection

  constructor(private pixiService: PixiService,
              private eventBus: EventBusService,
              private historyService: HistoryService,
              private graphViewService: GraphViewService) {
    this.onDragStartBound = this.onDragStart.bind(this);
    this.onDragMoveBound = this.onDragMove.bind(this);
    this.onDragEndBound = this.onDragEnd.bind(this);
    this.onSelectionElementBound = this.onSelectElement.bind(this);
    this.onRectangleSelectionMoveBound = this.onRectangleSelectionMove.bind(this);
    this.onRectangleSelectionEndBound = this.onRectangleSelectionEnd.bind(this);
    // Register event handlers
    this.eventBus.registerHandler(HandlerNames.ELEMENT_SELECT, this.onSelectionElementBound);
    this.eventBus.registerHandler(HandlerNames.NODE_DRAG_START, this.onDragStartBound);
    this.eventBus.registerHandler(HandlerNames.NODE_DRAG_MOVE, this.onDragMoveBound);
    this.eventBus.registerHandler(HandlerNames.NODE_DRAG_END, this.onDragEndBound);
    this.eventBus.registerHandler(HandlerNames.RECTANGLE_SELECTION_MOVE, this.onRectangleSelectionMoveBound);
    this.eventBus.registerHandler(HandlerNames.RECTANGLE_SELECTION_END, this.onRectangleSelectionEndBound);
    // Init rectangle selection
    this.rectangleSelection = new SelectRectangle();
    this.rectangleSelection.visible = false;
    this.pixiService.mainContainer.addChild(this.rectangleSelection);
  }

  modeOn(): void {
    console.log("DefaultMode ON"); // TODO remove
    this.selectableModeOn();
    this.moveableNodesOn();
  }

  modeOff(): void {
    console.log("DefaultMode OFF"); // TODO remove
    this.selectableModeOff();
    this.moveableNodesOff();
  }

  onAddedNode(nodeView: NodeView): void {
    this.moveableNodeOn(nodeView);
  }

  onAddedEdge(edgeView: EdgeView): void {
  }

  onRemovedNode(nodeView: NodeView): void {
  }

  onRemovedEdge(edgeView: EdgeView): void {
  }

  onGraphCleared(): void {
  }

  onUndoInvoked(): void {
  }

  onRedoInvoked(): void {
  }

  /**
   * Add listeners for moving nodes to all nodes
   */
  public moveableNodesOn() {
    // Add event listeners to all nodes
    this.graphViewService.nodeViews.forEach((nodeView: NodeView) => {
      this.moveableNodeOn(nodeView);
    });
  }

  /**
   * Remove listeners for moving nodes to all nodes
   */
  public moveableNodesOff() {
    this.graphViewService.nodeViews.forEach((nodeView: NodeView) => {
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
    this.eventBus.registerPixiEvent(this.pixiService.stage, 'pointerdown',
      HandlerNames.ELEMENT_SELECT);
  }

  private selectableModeOff() {
    this.eventBus.unregisterPixiEvent(this.pixiService.stage, 'pointerdown',
      HandlerNames.ELEMENT_SELECT);
  }

  private onDragStart(event: FederatedPointerEvent): void {
    const dragObject = event.target as NodeView;
    const position = event.getLocalPosition(this.pixiService.mainContainer);

    // Store the starting position of the drag
    let nodesMove: NodeMove[] = this.graphViewService.selectedElements
      .filter(el => el instanceof NodeView)
      .map(el => {
        let element = el as NodeView;
        return new NodeMove(element,
          {x: element.x, y: element.y},
          {x: position.x - element.x, y: position.y - element.y});
      });
    // If the node being dragged is not already in the list of nodes to move, add it
    if (!nodesMove.some(nm => nm.node === dragObject)) {
      nodesMove.push(new NodeMove(dragObject,
        {x: dragObject.x, y: dragObject.y},
        {x: position.x - dragObject.x, y: position.y - dragObject.y}));
    }
    this.moveCommand = new MoveNodeViewCommand(this.graphViewService, nodesMove);

    this.dragTarget = nodesMove;  // Store the targets being dragged
    this.isDragging = false;

    this.eventBus.registerPixiEvent(this.pixiService.stage, 'pointermove', HandlerNames.NODE_DRAG_MOVE);
    this.eventBus.registerPixiEvent(this.pixiService.stage, 'pointerup', HandlerNames.NODE_DRAG_END);
    this.eventBus.registerPixiEvent(this.pixiService.stage, 'pointerupoutside', HandlerNames.NODE_DRAG_END);
  }

  private onDragMove(event: FederatedPointerEvent): void {
    if (this.dragTarget) {
      const newPosition = event.getLocalPosition(this.pixiService.mainContainer);
      // Check if the drag has moved beyond the threshold
      if (!this.isDragging) {
        let nodeMove = this.dragTarget[0]
        const dx = Math.abs((newPosition.x - nodeMove.offset.x) - nodeMove.oldPosition.x);
        const dy = Math.abs((newPosition.y - nodeMove.offset.y) - nodeMove.oldPosition.y);
        if (dx > this.dragThreshold || dy > this.dragThreshold) {
          this.isDragging = true; // Start dragging if moved beyond threshold
        }
      }
      // Perform vertex dragging
      if (this.isDragging) {
        // Check selected elements to remove from drag target
        if (this.graphViewService.selectedElements.length !== this.dragTarget.length) {
          this.dragTarget = this.dragTarget
            .filter(nm => this.graphViewService.isElementSelected(nm.node));
        }
        // Move each selected node
        this.dragTarget.forEach(element => {
          const targetX = newPosition.x - element.offset.x;
          const targetY = newPosition.y - element.offset.y;

          // Apply canvas boundary constraints
          const constrainedX = Math.max(this.pixiService.canvasBoundaries.boundaryXMin,
            Math.min(targetX, this.pixiService.canvasBoundaries.boundaryXMax - element.node.width));
          const constrainedY = Math.max(this.pixiService.canvasBoundaries.boundaryYMin,
            Math.min(targetY, this.pixiService.canvasBoundaries.boundaryYMax - element.node.height));

          element.node.alpha = 0.5;
          this.graphViewService.moveNodeView(element.node, {
            x: constrainedX,
            y: constrainedY
          });
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
    this.eventBus.unregisterPixiEvent(this.pixiService.stage, 'pointermove', HandlerNames.NODE_DRAG_MOVE);
    this.eventBus.unregisterPixiEvent(this.pixiService.stage, 'pointerup', HandlerNames.NODE_DRAG_END);
    this.eventBus.unregisterPixiEvent(this.pixiService.stage, 'pointerupoutside', HandlerNames.NODE_DRAG_END);
  }

  private onSelectElement(event: FederatedPointerEvent): void {
    if (event.pointerType === 'mouse' && event.button !== 0) {
      return;
    }
    const selectedElement = event.target instanceof NodeView
      ? event.target as NodeView
      : event.target instanceof EdgeView
        ? event.target as EdgeView
        : null;

    if (!selectedElement) { // Canvas clicked (no selection before - clear selection, else - rectangle selection)
      // Rectangle selection
      if (event.pointerType === 'touch') { // Rectangle selection not supported for touchpad devices
        this.graphViewService.clearSelection();
        return;
      }
      this.onRectangleSelectionStart(event);
      return; // No element selected
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
    } else { // Multiple selection (ctrl pressed)
      if (this.graphViewService.isElementSelected(selectedElement)) {
        this.graphViewService.unselectElement(selectedElement);
      } else {
        this.graphViewService.selectElement(selectedElement);
      }
    }
  }

  private onRectangleSelectionStart(event: FederatedPointerEvent): void {
    const position = event.getLocalPosition(this.pixiService.mainContainer);
    if (!this.pixiService.isPointWithinCanvasBoundaries(position.x, position.y, 0)) {
      return;
    }
    this.rectangleSelectionStart = {x: position.x, y: position.y};
    this.rectangleSelection.visible = false;
    this.isRectangleSelection = false;
    this.eventBus.registerPixiEvent(this.pixiService.stage,
      'pointermove', HandlerNames.RECTANGLE_SELECTION_MOVE);
    this.eventBus.registerPixiEvent(this.pixiService.stage,
      'pointerup', HandlerNames.RECTANGLE_SELECTION_END);
    this.eventBus.registerPixiEvent(this.pixiService.stage,
      'pointerupoutside', HandlerNames.RECTANGLE_SELECTION_END);
    this.eventBus.registerPixiEvent(this.pixiService.stage,
      'rightdown', HandlerNames.RECTANGLE_SELECTION_END);
  }

  private onRectangleSelectionMove(event: FederatedPointerEvent): void {
    const newPosition = event.getLocalPosition(this.pixiService.mainContainer);
    if (this.rectangleSelectionStart) {
      // Check if the drag has moved beyond the threshold
      if (!this.isRectangleSelection) {
        const dx = Math.abs((newPosition.x) - this.rectangleSelectionStart.x);
        const dy = Math.abs((newPosition.y) - this.rectangleSelectionStart.y);
        if (dx > this.rectangleSelectionThreshold || dy > this.rectangleSelectionThreshold) {
          this.isRectangleSelection = true; // Start dragging if moved beyond threshold
          this.rectangleSelection.visible = true;
        }
      }
    }

    if (this.isRectangleSelection && this.rectangleSelectionStart) {
      let rectangle: Rectangle = this.rectangleSelection.toRectangle();
      this.rectangleSelection.updatePosition(this.rectangleSelectionStart, newPosition);
      this.graphViewService.nodeViews.forEach((nodeView: NodeView) => { // TODO optimize by using canvas with grid
        if (GraphicalUtils.rectanglesIntersect(rectangle, GraphicalUtils.nodeViewToRectangle(nodeView))) {
          if (!this.graphViewService.isElementSelected(nodeView)) {
            this.graphViewService.selectElement(nodeView);
          }
        } else if (!event.ctrlKey && this.graphViewService.isElementSelected(nodeView)) {
            this.graphViewService.unselectElement(nodeView);
          }
      });
      this.graphViewService.edgeViews.forEach((edgeView: EdgeView) => {
        if (GraphicalUtils.rectanglesIntersect(rectangle, GraphicalUtils.edgeViewToRectangle(edgeView))) {
          if (!this.graphViewService.isElementSelected(edgeView)) {
            this.graphViewService.selectElement(edgeView);
          }
        } else if (!event.ctrlKey && this.graphViewService.isElementSelected(edgeView)) {
          this.graphViewService.unselectElement(edgeView);
        }
      });
    }
  }

  private onRectangleSelectionEnd(event: FederatedPointerEvent): void {
    if (this.rectangleSelection) {
      this.rectangleSelection.visible = false;
    }
    if (!this.isRectangleSelection) {
      this.graphViewService.clearSelection();
    }
    this.rectangleSelectionStart = null;
    this.isRectangleSelection = false;
    this.eventBus.unregisterPixiEvent(this.pixiService.stage,
      'pointerup', HandlerNames.RECTANGLE_SELECTION_END);
    this.eventBus.unregisterPixiEvent(this.pixiService.stage,
      'pointerupoutside', HandlerNames.RECTANGLE_SELECTION_END);
  }
}
