import {ModeBehavior} from "../../service/event/mode-manager.service";
import {PixiService} from "../../service/pixi.service";
import {GraphViewService} from "../../service/graph-view.service";
import {DEFAULT_NODE_STYLE, NodeStyle, NodeView} from "../../model/graphical-model/node-view";
import {EventBusService, HandlerNames} from "../../service/event/event-bus.service";
import {FederatedPointerEvent} from "pixi.js";
import {EdgeViewFabricService} from "../../service/edge-view-fabric.service";
import {EdgeView} from "../../model/graphical-model/edge-view";
import {EdgeIndex} from "../../model/edge";
import {AddEdgeViewCommand} from "../command/add-edge-view-command";
import {HistoryService} from "../../service/history.service";
import {RemoveEdgeViewCommand} from "../command/remove-edge-view-command";
import {NodeViewFabricService} from "../../service/node-view-fabric.service";

/**
 * Mode to add or remove edges between nodes.
 */
export class AddRemoveEdgeMode implements ModeBehavior {

  private boundSelectableNodePointerDown: (event: FederatedPointerEvent) => void;

  private startNodeStyle: NodeStyle = {
    fillNode: DEFAULT_NODE_STYLE.fillNode,
    strokeColor: '#FFC618',
    strokeWidth: DEFAULT_NODE_STYLE.strokeWidth + 1
  };
  // TODO Add helper UI messages for user

  private startNode: NodeView | undefined;
  private endNode: NodeView | undefined;

  constructor(private pixiService: PixiService,
              private eventBus: EventBusService,
              private nodeFabric: NodeViewFabricService,
              private edgeFabric: EdgeViewFabricService,
              private historyService: HistoryService,
              private graphService: GraphViewService) {
    this.boundSelectableNodePointerDown = this.onAddRemoveEdge.bind(this);
    // Register event handlers
    this.eventBus.registerHandler(HandlerNames.CANVAS_ADD_REMOVE_EDGE, this.boundSelectableNodePointerDown);
  }

  modeOff(): void {
    this.selectableElementsOff();
    this.clearSelectedNodes();
  }

  modeOn(): void {
    this.selectableElementsOn();
  }

  onAddedNode(nodeView: NodeView): void {
  }

  onAddedEdge(edgeView: EdgeView): void {
  }

  onRemovedEdge(edgeView: EdgeView): void {
  }

  onRemovedNode(nodeView: NodeView): void {
  }

  onUndoInvoked(): void {
    this.clearSelectedNodes();
  }

  onRedoInvoked(): void {
    this.clearSelectedNodes();
  }

  private selectableElementsOn(): void {
    this.eventBus.registerPixiEvent(this.pixiService.getApp().stage, 'pointerdown', HandlerNames.CANVAS_ADD_REMOVE_EDGE);
  }

  private selectableElementsOff(): void {
    this.eventBus.unregisterPixiEvent(this.pixiService.getApp().stage, 'pointerdown', HandlerNames.CANVAS_ADD_REMOVE_EDGE);
  }

  private onAddRemoveEdge(event: FederatedPointerEvent): void {
    if (event.target instanceof NodeView) {
      let nodeView: NodeView = event.target as NodeView;
      if (!this.startNode) {
        console.log("Start node selected"); // TODO remove
        this.startNode = nodeView;
        this.switchStartNodeStyle(nodeView, true);
      } else if (!this.endNode) {
        console.log("End node selected"); // TODO remove
        this.endNode = nodeView;
        const newEdgeIndex = EdgeIndex.fromNodes(this.startNode.node, this.endNode.node);
        // TODO check graph orientation, if non oriented, check if edge exists in reverse order
        if (this.graphService.edgeViews.has(newEdgeIndex.value)) {
          console.log(`Edge: '${newEdgeIndex.value}' already exists between nodes`); // TODO remove
          return;
        }
        // Add edge to graph
        const edgeView = this.edgeFabric.createDefaultEdgeView(this.graphService.currentGraph,
          this.startNode, this.endNode);
        let command = new AddEdgeViewCommand(this.graphService, edgeView);
        this.historyService.execute(command);
        // Clear selected nodes
        this.clearSelectedNodes();
      }
    } else if (event.target instanceof EdgeView) {
      this.clearSelectedNodes();
      console.log("Edge remove event"); // TODO remove
      // Remove edge
      let edgeView: EdgeView = event.target as EdgeView;
      let command = new RemoveEdgeViewCommand(this.graphService, edgeView);
      this.historyService.execute(command);
    } else { // Clicked on empty space
      this.clearSelectedNodes();
    }
  }

  private clearSelectedNodes(): void {
    this.switchStartNodeStyle(this.startNode, false);
    this.startNode = undefined;
    this.endNode = undefined;
  }

  private switchStartNodeStyle(nodeView: NodeView | undefined, enable: boolean): void {
    if (enable && nodeView) {
      this.startNodeStyle.fillNode = nodeView.nodeStyle.fillNode;
      this.startNodeStyle.strokeWidth = nodeView.nodeStyle.strokeWidth + 1;
      this.nodeFabric.changeToStyle(nodeView, this.startNodeStyle);
    } else if (nodeView) {
      this.nodeFabric.changeToPreviousStyle(nodeView);
    }
  }
}
