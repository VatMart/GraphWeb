import {PixiService} from "../../service/pixi.service";
import {NodeView} from "../../model/graphical-model/node/node-view";
import {EventBusService, HandlerNames} from "../../service/event/event-bus.service";
import {EdgeView} from "../../model/graphical-model/edge/edge-view";
import {StateService} from "../../service/event/state.service";
import {EdgeEventHandler} from "../handler/edge-event-handler";
import {BaseMode, Mode, ModeState, Submode} from "./mode";

/**
 * Mode to add or remove edges between nodes.
 */
export class AddRemoveEdgeMode extends BaseMode implements Mode {

  override readonly modeState: ModeState = 'AddRemoveEdge';
  override submode: Submode | undefined;

  constructor(private pixiService: PixiService,
              private eventBus: EventBusService,
              private stateService: StateService,
              submode?: Submode) {
    super();
    this.submode = submode ? submode : undefined;
  }

  modeOff(): void {
    this.selectableElementsOff();
    EdgeEventHandler.getInstance().clearSelectedNodes();
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

  onBeforeNodeDeleted(nodeView: NodeView): void {
  }

  onRemovedNode(nodeView: NodeView): void {
  }

  onGraphCleared(): void {
    EdgeEventHandler.getInstance().clearSelectedNodes();
  }

  onGraphViewGenerated(): void {
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
