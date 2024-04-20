import {ModeBehavior} from "../../service/event/mode-manager.service";
import {PixiService} from "../../service/pixi.service";
import {GraphViewService} from "../../service/graph-view.service";
import {NodeView} from "../../model/graphical-model/node-view";
import {Container, FederatedPointerEvent} from "pixi.js";
import {EventBusService, HandlerNames} from "../../service/event/event-bus.service";
import {NodeViewFabricService} from "../../service/node-view-fabric.service";
import {AddNodeViewCommand} from "../command/add-node-view-command";
import {HistoryService} from "../../service/history.service";
import {RemoveNodeViewCommand} from "../command/remove-node-view-command";

export class AddRemoveVertexMode implements ModeBehavior {
  private boundHandlePointerDown: (event: FederatedPointerEvent) => void;

  constructor(private pixiService: PixiService,
              private eventBus: EventBusService,
              private nodeFabric: NodeViewFabricService,
              private historyService: HistoryService,
              private graphViewService: GraphViewService) {
    this.boundHandlePointerDown = this.handlePointerDown.bind(this);
    // Register event handlers
    this.eventBus.registerHandler(HandlerNames.NODE_ADD_REMOVE, this.boundHandlePointerDown);
  }

  modeOn(): void {
    console.log("AddRemoveVertexMode ON");
    const stage = this.pixiService.getApp().stage;
    this.eventBus.registerPixiEvent(this.pixiService.getApp().stage, 'pointerdown',
      HandlerNames.NODE_ADD_REMOVE);
  }

  modeOff(): void {
    console.log("AddRemoveVertexMode OFF");
    this.eventBus.unregisterPixiEvent(this.pixiService.getApp().stage, 'pointerdown',
      HandlerNames.NODE_ADD_REMOVE);
  }

  handlePointerDown(event: FederatedPointerEvent): void {
    const stage: Container = this.pixiService.getApp().stage;
    console.log(event.target.constructor.name)
    if (event.target === stage) {
      let newNodeView: NodeView = this.nodeFabric
        .createDefaultNodeViewWithCoordinates(this.graphViewService.currentGraph, event.globalX, event.globalY);
      let command = new AddNodeViewCommand(newNodeView, this.graphViewService);
      this.historyService.execute(command);
      //this.graphViewService.addNodeToCurrentGraphView(event.globalX, event.globalY);
    } else if (event.target instanceof NodeView) {
      let nodeView: NodeView = event.target as NodeView;
      let command = new RemoveNodeViewCommand(nodeView, this.graphViewService);
      this.historyService.execute(command);
      //this.graphViewService.removeNodeFromCurrentGraphView(nodeView);
    }
  }

  onAddedNode(nodeView: NodeView): void {
    // Do nothing
  }
}
