import {PixiService} from "../../service/pixi.service";
import {NodeView} from "../../model/graphical-model/node/node-view";
import {EventBusService, HandlerNames} from "../../service/event/event-bus.service";
import {EdgeView} from "../../model/graphical-model/edge/edge-view";
import {StateService} from "../../service/event/state.service";
import {BaseMode, Mode, ModeState, Submode} from "./mode";

/**
 * Mode to add or remove vertices from the graph.
 */
export class AddRemoveVertexMode extends BaseMode implements Mode {

  override readonly modeState: ModeState = 'AddRemoveVertex';
  override submode: Submode | undefined;

  constructor(private pixiService: PixiService,
              private eventBus: EventBusService,
              private stateService: StateService,
              submode?: Submode) {
    super();
    this.submode = submode ? submode : undefined;
  }

  modeOn(): void {
    console.log("AddRemoveVertexMode ON"); // TODO remove
    this.eventBus.registerPixiEvent(this.pixiService.stage, 'pointerdown',
      HandlerNames.CANVAS_ADD_REMOVE_NODE);
  }

  modeOff(): void {
    console.log("AddRemoveVertexMode OFF"); // TODO remove
    this.eventBus.unregisterPixiEvent(this.pixiService.stage, 'pointerdown',
      HandlerNames.CANVAS_ADD_REMOVE_NODE);
  }

  onAddedNode(nodeView: NodeView): void {
    // Do nothing
  }

  onAddedEdge(edgeView: EdgeView): void {
  }

  onBeforeNodeDeleted(nodeView: NodeView): void {
  }

  onRemovedNode(nodeView: NodeView): void {
  }

  onRemovedEdge(edgeView: EdgeView): void {
  }

  onGraphCleared(): void {
  }

  onGraphViewGenerated(): void {
  }

  onUndoInvoked(): void {
  }

  onRedoInvoked(): void {
  }
}
