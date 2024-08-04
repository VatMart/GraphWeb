import {EdgeView} from "../../model/graphical-model/edge/edge-view";
import {NodeView} from "../../model/graphical-model/node/node-view";
import {AlgorithmSubmode, BaseMode, Mode, ModeState} from "./mode";
import {PixiService} from "../../service/pixi.service";
import {EventBusService} from "../../service/event/event-bus.service";
import {StateService} from "../../service/event/state.service";
import {AlgorithmCalculationResponse} from "../../service/manager/algorithm-manager.service";

/**
 * Algorithm mode class.
 */
export class AlgorithmMode extends BaseMode implements Mode {

  override readonly modeState: ModeState = 'Algorithm';
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

  async modeOff(): Promise<void> {
    console.log("AlgorithmMode OFF"); // TODO remove
    if (this.submode?.isActive()) {
      await this.submodeOff();
    }
    this.stateService.algorithmModeEnabled(false);
  }

  async resetAlgorithm() {
    if (this.submode) {
      await this.submode.resetAlgorithm();
    }
  }

  resolveAlgorithmAnimation(data: AlgorithmCalculationResponse) {
    if (this.submode && this.submode.isActive()) {
      this.submode.resolveAlgorithmAnimation(data);
    }
  }

  stepForward() {
    if (this.submode && this.submode.isActive()) {
      this.submode.stepForward();
    }
  }

  stepBackward() {
    if (this.submode && this.submode.isActive()) {
      this.submode.stepBackward();
    }
  }

  goToStep(value: number) {
    if (this.submode && this.submode.isActive()) {
      this.submode.goToStep(value);
    }
  }

  play() {
    if (this.submode && this.submode.isActive()) {
      this.submode.play();
    }
  }

  pause() {
    if (this.submode && this.submode.isActive()) {
      this.submode.pause();
    }
  }

  changeSpeed(value: number) {
    if (this.submode && this.submode.isActive()) {
      this.submode.changeSpeed(value);
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
