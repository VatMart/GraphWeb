
import {EdgeView} from "../../model/graphical-model/edge/edge-view";
import {NodeView} from "../../model/graphical-model/node/node-view";
import {PixiService} from "../../service/pixi.service";
import {EventBusService, HandlerNames} from "../../service/event/event-bus.service";
import {StateService} from "../../service/event/state.service";
import {DEFAULT_HELPER_ITEM, SELECT_MODE_HELPER_ITEM} from "../../component/canvas/float-helper/float-helper.component";
import {BaseMode, Mode, ModeBehavior, ModeState, Submode, SubmodeState} from "./mode";

/**
 * Selection mode class.
 * Used for selecting elements on the canvas.
 * Its used only for mobile version of the application.
 */
export class SelectionMode extends BaseMode implements Mode {

  override readonly modeState: ModeState = 'SelectionMode';
  override submode: Submode | undefined;

  constructor(private pixiService: PixiService,
              private eventBus: EventBusService,
              private stateService: StateService,
              submode?: Submode) {
    super();
    this.submode = submode ? submode : undefined;
  }

  modeOn(): void {
    console.log("SelectionMode ON"); // TODO remove
    this.eventBus.registerPixiEvent(this.pixiService.stage, 'pointerdown',
      HandlerNames.MULTI_SELECTION);
    this.stateService.changeFloatHelperItem(SELECT_MODE_HELPER_ITEM);
  }

  modeOff(): void {
    console.log("SelectionMode OFF"); // TODO remove
    this.eventBus.unregisterPixiEvent(this.pixiService.stage, 'pointerdown',
      HandlerNames.MULTI_SELECTION);
    this.stateService.changeFloatHelperItem(DEFAULT_HELPER_ITEM);
  }

  onAddedEdge(edgeView: EdgeView): void {
  }

  onAddedNode(nodeView: NodeView): void {
  }

  onGraphCleared(): void {
  }

  onGraphViewGenerated(): void {
  }

  onRedoInvoked(): void {
  }

  onRemovedEdge(edgeView: EdgeView): void {
  }

  onBeforeNodeDeleted(nodeView: NodeView): void {
  }

  onRemovedNode(nodeView: NodeView): void {
  }

  onUndoInvoked(): void {
  }
}
