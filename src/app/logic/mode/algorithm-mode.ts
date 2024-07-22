import {EdgeView} from "../../model/graphical-model/edge/edge-view";
import {NodeView} from "../../model/graphical-model/node/node-view";
import {AlgorithmSubmode, BaseMode, Mode, ModeState, Submode} from "./mode";
import {PixiService} from "../../service/pixi.service";
import {EventBusService} from "../../service/event/event-bus.service";
import {StateService} from "../../service/event/state.service";

/**
 * Algorithm mode class.
 */
export class AlgorithmMode extends BaseMode implements Mode {

  override readonly modeState: ModeState = 'default'; // TODO: change to 'Algorithm'
  override submode: AlgorithmSubmode | undefined;

  constructor(private pixiService: PixiService,
              private eventBus: EventBusService,
              private stateService: StateService,
              submode?: AlgorithmSubmode) {
    super();
    this.submode = submode ? submode : undefined;
  }

  modeOn(): void {
    console.log("AlgorithmMode ON"); // TODO remove
    this.stateService.algorithmModeEnabled(true);
  }

  modeOff(): void {
    console.log("AlgorithmMode OFF"); // TODO remove
    if (this.submode?.isActive()) {
      this.submodeOff();
    }
    this.stateService.algorithmModeEnabled(false);
  }

  resetAlgorithm() {
    if (this.submode) {
      this.submode.resetAlgorithm();
    }
  }

  onAddedEdge(edgeView: EdgeView): void {
  }

  onAddedNode(nodeView: NodeView): void {
  }

  onBeforeNodeDeleted(nodeView: NodeView): void {
  }

  onGraphCleared(): void {
  }

  onGraphViewGenerated(): void {
  }

  onRedoInvoked(): void {
  }

  onRemovedEdge(edgeView: EdgeView): void {
  }

  onRemovedNode(nodeView: NodeView): void {
  }

  onUndoInvoked(): void {
  }
}
