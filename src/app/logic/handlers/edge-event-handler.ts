import {InitializationError} from "../../error/initialization-error";
import {PixiService} from "../../service/pixi.service";
import {EventBusService, HandlerNames} from "../../service/event-bus.service";
import {StateService} from "../../service/state.service";
import {GraphViewService} from "../../service/graph-view.service";
import {HistoryService} from "../../service/history.service";
import {FederatedPointerEvent} from "pixi.js";
import {EventUtils} from "../../utils/event-utils";
import {Weight} from "../../model/graphical-model/edge/weight";
import {DEFAULT_NODE_STYLE, NodeStyle, NodeView} from "../../model/graphical-model/node/node-view";
import {EdgeIndex} from "../../model/edge";
import {AddEdgeViewCommand} from "../command/add-edge-view-command";
import {EdgeView} from "../../model/graphical-model/edge/edge-view";
import {RemoveEdgeViewCommand} from "../command/remove-edge-view-command";
import {NodeViewFabricService} from "../../service/node-view-fabric.service";
import {EdgeViewFabricService} from "../../service/edge-view-fabric.service";

/**
 * Handles all events related to the edge views.
 */
export class EdgeEventHandler {
  // TODO move all edge related event handling here
  private static instance: EdgeEventHandler | undefined = undefined

  /**
   * Returns the instance of the EdgeEventHandler.
   * Before calling this method, the EdgeEventHandler must be initialized.
   * Throws InitializationError if the instance is not initialized.
   */
  public static getInstance(): EdgeEventHandler {
    if (this.instance === undefined) {
      throw new InitializationError("EdgeEventHandler is not initialized. Call initialize() first.");
    }
    return this.instance;
  }

  private onEdgeWeightEditStartBound: (event: FederatedPointerEvent) => void;
  private boundSelectableNodePointerDown: (event: FederatedPointerEvent) => void;

  // Double-click detection
  private clickTimeout: number | null = null;
  private clickDelay = 300; // Time in milliseconds to distinguish single and double clicks

  // Edge adding
  public static startNodeStyle: NodeStyle = {
    fillNode: DEFAULT_NODE_STYLE.fillNode,
    strokeColor: '#FFC618',
    strokeWidth: DEFAULT_NODE_STYLE.strokeWidth + 1
  };
  private static startNode: NodeView | undefined;
  private static endNode: NodeView | undefined;


  private constructor(private pixiService: PixiService,
                      private eventBus: EventBusService,
                      private stateService: StateService,
                      private graphViewService: GraphViewService,
                      private historyService: HistoryService,
                      private nodeFabric: NodeViewFabricService,
                      private edgeFabric: EdgeViewFabricService) {
    this.onEdgeWeightEditStartBound = this.onEdgeWeightEditStart.bind(this);
    this.boundSelectableNodePointerDown = this.onAddRemoveEdge.bind(this);
    // Register event handlers
    this.eventBus.registerHandler(HandlerNames.EDGE_WEIGHT_CHANGE, this.onEdgeWeightEditStartBound);
    this.eventBus.registerHandler(HandlerNames.CANVAS_ADD_REMOVE_EDGE, this.boundSelectableNodePointerDown);
  }

  /**
   * Initializes the EdgeEventHandler.
   * Method should be called only once.
   */
  public static initialize(pixiService: PixiService,
                           eventBus: EventBusService,
                           stateService: StateService,
                           graphViewService: GraphViewService,
                           historyService: HistoryService,
                           nodeFabric: NodeViewFabricService,
                           edgeFabric: EdgeViewFabricService): EdgeEventHandler {
    if (this.instance !== undefined) {
      throw new InitializationError("EdgeEventHandler has already been initialized");
    }
    this.instance = new EdgeEventHandler(pixiService, eventBus, stateService, graphViewService, historyService, nodeFabric,
      edgeFabric);
    return this.instance;
  }

  // Edit edge weight handlers
  private onEdgeWeightEditStart(event: FederatedPointerEvent): void {
    if (event.pointerType === 'mouse' && event.button !== 0) {
      return;
    }
    const selectedElement = EventUtils.isEdgeViewWeight(event.target)
      ? event.target as Weight : null;
    if (selectedElement === null) {
      return;
    }
    if (this.clickTimeout) {
      clearTimeout(this.clickTimeout);
      this.clickTimeout = null;
      this.onEdgeDoubleClick(selectedElement);
    } else {
      this.clickTimeout = setTimeout(() => {
        this.clickTimeout = null;
      }, this.clickDelay);
    }
  }

  private onEdgeDoubleClick(weight: Weight): void {
    this.stateService.showEditEdgeWeight(weight);
  }


  private onAddRemoveEdge(event: FederatedPointerEvent): void {
    if (event.pointerType === 'mouse' && event.button !== 0) {
      return;
    }
    if (EventUtils.isNodeView(event.target)) {
      let nodeView: NodeView = event.target as NodeView;
      if (!EdgeEventHandler.startNode) {
        console.log("Start node selected"); // TODO remove
        EdgeEventHandler.startNode = nodeView;
        this.switchStartNodeStyle(nodeView, true);
      } else if (!EdgeEventHandler.endNode) {
        console.log("End node selected"); // TODO remove
        EdgeEventHandler.endNode = nodeView;
        const newEdgeIndex = EdgeIndex.fromNodes(EdgeEventHandler.startNode.node, EdgeEventHandler.endNode.node);
        // TODO check graph orientation, if non oriented, check if edge exists in reverse order
        if (this.graphViewService.edgeViews.has(newEdgeIndex.value)) {
          console.log(`Edge: '${newEdgeIndex.value}' already exists between nodes`); // TODO remove
          return;
        }
        // Add edge to graph
        const edgeView = this.edgeFabric.createDefaultEdgeView(this.graphViewService.currentGraph,
          EdgeEventHandler.startNode, EdgeEventHandler.endNode);
        let command = new AddEdgeViewCommand(this.graphViewService, edgeView);
        this.historyService.execute(command);
        // Clear selected nodes
        this.clearSelectedNodes();
      }
    } else if (EventUtils.isEdgeView(event.target)) {
      this.clearSelectedNodes();
      console.log("Edge remove event"); // TODO remove
      // Remove edge
      let edgeView: EdgeView = event.target as EdgeView;
      let command = new RemoveEdgeViewCommand(this.graphViewService, edgeView);
      this.historyService.execute(command);
    } else { // Clicked on empty space
      this.clearSelectedNodes();
    }
  }

  public clearSelectedNodes(): void {
    this.switchStartNodeStyle(EdgeEventHandler.startNode, false);
    EdgeEventHandler.startNode = undefined;
    EdgeEventHandler.endNode = undefined;
  }

  public switchStartNodeStyle(nodeView: NodeView | undefined, enable: boolean): void {
    if (enable && nodeView) {
      EdgeEventHandler.startNodeStyle.fillNode = nodeView.nodeStyle.fillNode;
      EdgeEventHandler.startNodeStyle.strokeWidth = nodeView.nodeStyle.strokeWidth + 1;
      this.nodeFabric.changeToStyle(nodeView, EdgeEventHandler.startNodeStyle);
    } else if (nodeView) {
      this.nodeFabric.changeToPreviousStyle(nodeView);
    }
  }
}
