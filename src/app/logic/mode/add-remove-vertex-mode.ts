import {ModeBehavior} from "../../service/manager/mode-manager.service";
import {PixiService} from "../../service/pixi.service";
import {GraphViewService} from "../../service/graph-view.service";
import {NodeView} from "../../model/graphical-model/node/node-view";
import {Container, FederatedPointerEvent} from "pixi.js";
import {EventBusService, HandlerNames} from "../../service/event-bus.service";
import {NodeViewFabricService} from "../../service/node-view-fabric.service";
import {AddNodeViewCommand} from "../command/add-node-view-command";
import {HistoryService} from "../../service/history.service";
import {RemoveNodeViewCommand} from "../command/remove-node-view-command";
import {EdgeView} from "../../model/graphical-model/edge/edge-view";

/**
 * Mode to add or remove vertices from the graph.
 */
export class AddRemoveVertexMode implements ModeBehavior {
  private boundHandlePointerDown: (event: FederatedPointerEvent) => void;

  constructor(private pixiService: PixiService,
              private eventBus: EventBusService,
              private nodeFabric: NodeViewFabricService,
              private historyService: HistoryService,
              private graphViewService: GraphViewService) {
    this.boundHandlePointerDown = this.handlePointerDown.bind(this);
    // Register event handlers
    this.eventBus.registerHandler(HandlerNames.CANVAS_ADD_REMOVE_NODE, this.boundHandlePointerDown);
  }

  modeOn(): void {
    console.log("AddRemoveVertexMode ON");
    this.eventBus.registerPixiEvent(this.pixiService.stage, 'pointerdown',
      HandlerNames.CANVAS_ADD_REMOVE_NODE);
  }

  modeOff(): void {
    console.log("AddRemoveVertexMode OFF");
    this.eventBus.unregisterPixiEvent(this.pixiService.stage, 'pointerdown',
      HandlerNames.CANVAS_ADD_REMOVE_NODE);
  }

  onAddedNode(nodeView: NodeView): void {
    // Do nothing
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

  private handlePointerDown(event: FederatedPointerEvent): void {
    if (event.pointerType === 'mouse' && event.button !== 0) {
      return;
    }
    const position = event.getLocalPosition(this.pixiService.mainContainer); // Get position relative to main container
    if (event.target === this.pixiService.stage) {
      if (!this.pixiService.isPointWithinCanvasBoundaries(position.x, position.y, NodeView.DEFAULT_RADIUS)) {
        // TODO implement notification to user, outside of borders
        return;
      }
      const positionNode = {x: position.x - NodeView.DEFAULT_RADIUS, y: position.y - NodeView.DEFAULT_RADIUS};
      let newNodeView: NodeView = this.nodeFabric
        .createDefaultNodeViewWithCoordinates(this.graphViewService.currentGraph, positionNode);
      let command = new AddNodeViewCommand(newNodeView, this.graphViewService);
      this.historyService.execute(command);
      //this.graphViewService.addNodeToCurrentGraphView(mode.globalX, mode.globalY);
    } else if (event.target instanceof NodeView) {
      let nodeView: NodeView = event.target as NodeView;
      let command = new RemoveNodeViewCommand(nodeView, this.graphViewService);
      this.historyService.execute(command);
      //this.graphViewService.removeNodeFromCurrentGraphView(nodeView);
    }
  }
}
