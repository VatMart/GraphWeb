import {ModeBehavior} from "../../service/manager/mode-manager.service";
import {PixiService} from "../../service/pixi.service";
import {NodeView} from "../../model/graphical-model/node/node-view";
import {EventBusService, HandlerNames} from "../../service/event-bus.service";
import {EdgeView} from "../../model/graphical-model/edge/edge-view";
import {StateService} from "../../service/state.service";
import {EdgeEventHandler} from "../handlers/edge-event-handler";

/**
 * Mode to add or remove edges between nodes.
 */
export class AddRemoveEdgeMode implements ModeBehavior {
  constructor(private pixiService: PixiService,
              private eventBus: EventBusService,
              private stateService: StateService) {
  }

  modeOff(): void {
    this.selectableElementsOff();
    EdgeEventHandler.getInstance().clearSelectedNodes();
  }

  modeOn(): void {
    if (this.stateService.isForceModeEnabled()) {
      this.stateService.changeForceModeState(false);
    }
    this.stateService.changeForceModeDisabledState(true);
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

  onGraphCleared(): void {
    EdgeEventHandler.getInstance().clearSelectedNodes();
  }

  onUndoInvoked(): void {
    EdgeEventHandler.getInstance().clearSelectedNodes();
  }

  onRedoInvoked(): void {
    EdgeEventHandler.getInstance().clearSelectedNodes();
  }

  private selectableElementsOn(): void {
    this.eventBus.registerPixiEvent(this.pixiService.stage, 'pointerdown', HandlerNames.CANVAS_ADD_REMOVE_EDGE);
  }

  private selectableElementsOff(): void {
    this.eventBus.unregisterPixiEvent(this.pixiService.stage, 'pointerdown', HandlerNames.CANVAS_ADD_REMOVE_EDGE);
  }
}
