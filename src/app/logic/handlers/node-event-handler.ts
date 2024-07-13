import {InitializationError} from "../../error/initialization-error";
import {PixiService} from "../../service/pixi.service";
import {EventBusService, HandlerNames} from "../../service/event/event-bus.service";
import {StateService} from "../../service/event/state.service";
import {FederatedPointerEvent} from "pixi.js";
import {MoveNodeViewCommand, NodeMove} from "../command/move-node-view-command";
import {NodeView} from "../../model/graphical-model/node/node-view";
import {GraphViewService} from "../../service/graph/graph-view.service";
import {HistoryService} from "../../service/history.service";
import {AddNodeViewCommand} from "../command/add-node-view-command";
import {EventUtils} from "../../utils/event-utils";
import {RemoveNodeViewCommand} from "../command/remove-node-view-command";
import {NodeViewFabricService} from "../../service/fabric/node-view-fabric.service";
import {InternalGrid} from "../../model/internal-grid";
import {ConfService} from "../../service/config/conf.service";

/**
 * Handles all events related to the node views.
 */
export class NodeEventHandler {
  private static instance: NodeEventHandler | undefined = undefined

  /**
   * Returns the instance of the NodeEventHandler.
   * Before calling this method, the NodeEventHandler must be initialized.
   * Throws InitializationError if the instance is not initialized.
   */
  public static getInstance(): NodeEventHandler {
    if (this.instance === undefined) {
      throw new InitializationError("NodeEventHandler is not initialized. Call initialize() first.");
    }
    return this.instance;
  }

  private onDragStartBound: (event: FederatedPointerEvent) => void;
  public static onDragMoveBound: (event: FederatedPointerEvent) => void;
  private onDragEndBound: () => void;
  private boundHandlePointerDown: (event: FederatedPointerEvent) => void;
  // Force dragging
  public static boundForceDragMove: (event: FederatedPointerEvent) => void;

  // Dragging
  public static dragTarget: NodeMove[] | null = null;
  private isDragging = false;
  private dragThreshold = 2; // Pixels the mouse must move to start drag
  private moveCommand: MoveNodeViewCommand | null = null;
  // Force Dragging
  public static grid: InternalGrid<NodeView> | null = null;

  private constructor(private pixiService: PixiService,
                      private eventBus: EventBusService,
                      private stateService: StateService,
                      private graphViewService: GraphViewService,
                      private historyService: HistoryService,
                      private nodeFabric: NodeViewFabricService) {
    this.onDragStartBound = this.onDragStart.bind(this);
    NodeEventHandler.onDragMoveBound = this.onDragMove.bind(this);
    this.onDragEndBound = this.onDragEnd.bind(this);
    this.boundHandlePointerDown = this.handlePointerDown.bind(this);
    NodeEventHandler.boundForceDragMove = this.onForceDragMove.bind(this);
    // Register event handlers
    this.eventBus.registerHandler(HandlerNames.NODE_DRAG_START, this.onDragStartBound);
    this.eventBus.registerHandler(HandlerNames.NODE_DRAG_MOVE, NodeEventHandler.onDragMoveBound);
    this.eventBus.registerHandler(HandlerNames.NODE_DRAG_END, this.onDragEndBound);
    this.eventBus.registerHandler(HandlerNames.CANVAS_ADD_REMOVE_NODE, this.boundHandlePointerDown);
  }

  /**
   * Initializes the NodeEventHandler.
   */
  public static initialize(pixiService: PixiService,
                           eventBus: EventBusService,
                           stateService: StateService,
                           graphViewService: GraphViewService,
                           historyService: HistoryService,
                           nodeFabric: NodeViewFabricService): NodeEventHandler {
    this.instance = new NodeEventHandler(pixiService, eventBus, stateService, graphViewService, historyService,
      nodeFabric);
    return this.instance;
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

    NodeEventHandler.dragTarget = nodesMove;  // Store the targets being dragged
    this.isDragging = false;

    this.eventBus.registerPixiEvent(this.pixiService.stage, 'pointermove', HandlerNames.NODE_DRAG_MOVE);
    this.eventBus.registerPixiEvent(this.pixiService.stage, 'pointerup', HandlerNames.NODE_DRAG_END);
    this.eventBus.registerPixiEvent(this.pixiService.stage, 'pointerupoutside', HandlerNames.NODE_DRAG_END);
  }

  private onDragMove(event: FederatedPointerEvent): void {
    if (NodeEventHandler.dragTarget) {
      const newPosition = event.getLocalPosition(this.pixiService.mainContainer);
      // Check if the drag has moved beyond the threshold
      if (!this.isDragging) {
        let nodeMove = NodeEventHandler.dragTarget[0];
        const dx = Math.abs((newPosition.x - nodeMove.offset.x) - nodeMove.oldPosition.x);
        const dy = Math.abs((newPosition.y - nodeMove.offset.y) - nodeMove.oldPosition.y);
        if (dx > this.dragThreshold || dy > this.dragThreshold) {
          this.isDragging = true; // Start dragging if moved beyond threshold
          this.stateService.nodeStartDragging(true);
        }
      }
      // Perform vertex dragging
      if (this.isDragging) {
        // Check selected elements to remove from drag target
        if (this.graphViewService.selectedElements.length !== NodeEventHandler.dragTarget.length) {
          NodeEventHandler.dragTarget = NodeEventHandler.dragTarget
            .filter(nm => this.graphViewService.isElementSelected(nm.node));
        }
        // Move each selected node
        NodeEventHandler.dragTarget.forEach(element => {
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

  /**
   * Handle moving nodes on the canvas, if the force mode is enabled.
   * Saves position of node in the grid.
   */
  public onForceDragMove(event: FederatedPointerEvent): void {
    if (NodeEventHandler.dragTarget && NodeEventHandler.grid !== null) {
      const newPosition = event.getLocalPosition(this.pixiService.mainContainer);
      // Check if the drag has moved beyond the threshold
      if (!this.isDragging) {
        let nodeMove = NodeEventHandler.dragTarget[0];
        const dx = Math.abs((newPosition.x - nodeMove.offset.x) - nodeMove.oldPosition.x);
        const dy = Math.abs((newPosition.y - nodeMove.offset.y) - nodeMove.oldPosition.y);
        if (dx > this.dragThreshold || dy > this.dragThreshold) {
          this.isDragging = true; // Start dragging if moved beyond threshold
          this.stateService.nodeStartDragging(true);
        }
      }
      // Perform vertex dragging
      if (this.isDragging) {
        // Check selected elements to remove from drag target
        if (this.graphViewService.selectedElements.length !== NodeEventHandler.dragTarget.length) {
          NodeEventHandler.dragTarget = NodeEventHandler.dragTarget
            .filter(nm => this.graphViewService.isElementSelected(nm.node));
        }
        // Move each selected node
        NodeEventHandler.dragTarget.forEach(element => {
          const targetX = newPosition.x - element.offset.x;
          const targetY = newPosition.y - element.offset.y;

          // Apply canvas boundary constraints
          const constrainedX = Math.max(this.pixiService.canvasBoundaries.boundaryXMin,
            Math.min(targetX, this.pixiService.canvasBoundaries.boundaryXMax - element.node.width));
          const constrainedY = Math.max(this.pixiService.canvasBoundaries.boundaryYMin,
            Math.min(targetY, this.pixiService.canvasBoundaries.boundaryYMax - element.node.height));

          element.node.alpha = 0.5;
          // Update the node position in the grid
          NodeEventHandler.grid!.updateNode(element.node, element.node.x, element.node.y, constrainedX, constrainedY);
          // Move the node
          this.graphViewService.moveNodeView(element.node, {
            x: constrainedX,
            y: constrainedY
          });
        });
      }
    }
  }

  private onDragEnd(): void {
    if (NodeEventHandler.dragTarget) {
      if (this.moveCommand && this.isDragging) {
        NodeEventHandler.dragTarget.forEach(element => {
          element.newPosition = element.node.coordinates;
        });
        // Execute the move command
        this.historyService.execute(this.moveCommand);
      }
      // Reset the alpha of the nodes being dragged
      NodeEventHandler.dragTarget.forEach(element => {
        element.node.alpha = 1;
      });
      // Clear the drag target
      NodeEventHandler.dragTarget = null;
      this.isDragging = false;
    }
    this.stateService.nodeEndDragging(true);
    this.eventBus.unregisterPixiEvent(this.pixiService.stage, 'pointermove', HandlerNames.NODE_DRAG_MOVE);
    this.eventBus.unregisterPixiEvent(this.pixiService.stage, 'pointerup', HandlerNames.NODE_DRAG_END);
    this.eventBus.unregisterPixiEvent(this.pixiService.stage, 'pointerupoutside', HandlerNames.NODE_DRAG_END);
  }

  private handlePointerDown(event: FederatedPointerEvent): void {
    if (event.pointerType === 'mouse' && event.button !== 0) {
      return;
    }
    const position = event.getLocalPosition(this.pixiService.mainContainer); // Get position relative to main container
    if (event.target === this.pixiService.stage) {
      if (!this.pixiService.isPointWithinCanvasBoundaries(position.x, position.y, ConfService.currentNodeStyle.radius.getRadius())) {
        // TODO implement notification to user, outside of borders
        return;
      }
      const positionNode = {x: position.x - ConfService.currentNodeStyle.radius.getRadius(),
        y: position.y - ConfService.currentNodeStyle.radius.getRadius()};
      let newNodeView: NodeView = this.nodeFabric
        .createDefaultNodeViewWithCoordinates(this.graphViewService.currentGraphView, positionNode);
      let command = new AddNodeViewCommand(newNodeView, this.graphViewService);
      this.historyService.execute(command);
      //this.graphViewService.addNodeToCurrentGraphView(mode.globalX, mode.globalY);
    } else if (EventUtils.isNodeView(event.target)) {
      let nodeView: NodeView = event.target as NodeView;
      let command = new RemoveNodeViewCommand(nodeView, this.graphViewService);
      this.historyService.execute(command);
    }
  }
}
