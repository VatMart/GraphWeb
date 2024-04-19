import {ModeBehavior} from "./mode-manager.service";
import {PixiService} from "../pixi.service";
import {GraphViewService} from "../graph-view.service";
import {NodeView} from "../../model/graphical-model/node-view";
import {Container, FederatedPointerEvent} from "pixi.js";
import {EventBusService, HandlerNames} from "./event-bus.service";

export class AddRemoveVertexMode implements ModeBehavior {
  private boundHandlePointerDown: (event: FederatedPointerEvent) => void;

  constructor(private pixiService: PixiService,
              private eventBus: EventBusService,
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
      this.graphViewService.addNodeToCurrentGraphView(event.globalX, event.globalY);
    } else if (event.target instanceof NodeView) {
      let nodeView: NodeView = event.target as NodeView;
      this.graphViewService.removeNodeFromCurrentGraphView(nodeView);
    }
  }

  onAddedNode(nodeView: NodeView): void {
    // Do nothing
  }
}
