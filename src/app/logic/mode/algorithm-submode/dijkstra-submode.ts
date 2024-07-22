import {AlgorithmSubmode, SubmodeState} from "../mode";
import {EdgeView} from "../../../model/graphical-model/edge/edge-view";
import {NodeView} from "../../../model/graphical-model/node/node-view";
import {StateService} from "../../../service/event/state.service";
import {
  DEFAULT_HELPER_ITEM,
  DIJKSTRA_ALGORITHM_HELPER_ITEM
} from "../../../component/canvas/float-helper/float-helper.component";
import {EventBusService, HandlerNames} from "../../../service/event/event-bus.service";
import {PixiService} from "../../../service/pixi.service";
import {AlgorithmEventHandler} from "../../handler/algorithm/algorithm-event-handler";
import {DijkstraAnimationResolver} from "../../algorithm/animation/dijkstra-animation-resolver";
import {GraphViewService} from "../../../service/graph/graph-view.service";
import {AlgorithmCalculationResponse} from "../../../service/manager/algorithm-manager.service";
import {NodeViewFabricService} from "../../../service/fabric/node-view-fabric.service";
import {EdgeViewFabricService} from "../../../service/fabric/edge-view-fabric.service";

/**
 * Dijkstra submode class.
 */
export class DijkstraSubmode implements AlgorithmSubmode {

  readonly submodeState: SubmodeState = 'Dijkstra';
  private active: boolean = false;
  private animationResolver: DijkstraAnimationResolver | undefined;

  constructor(private pixiService: PixiService,
              private graphViewService: GraphViewService,
              private stateService: StateService,
              private eventBus: EventBusService,
              private nodeFabric: NodeViewFabricService,
              private edgeFabric: EdgeViewFabricService) {
  }

  modeOn(): void {
    console.log("Dijkstra submode ON");
    this.eventBus.registerPixiEvent(this.pixiService.stage, 'pointerdown',
      HandlerNames.SHORTEST_PATH_SELECTION);
    this.active = true;
    this.stateService.changeFloatHelperItem(DIJKSTRA_ALGORITHM_HELPER_ITEM);
  }

  async modeOff(): Promise<void> {
    console.log("Dijkstra submode OFF");
    await this.resetAlgorithm();
    console.log("resetAlgorithm done");
    this.eventBus.unregisterPixiEvent(this.pixiService.stage, 'pointerdown',
      HandlerNames.SHORTEST_PATH_SELECTION);
    this.active = false;
    this.stateService.changeFloatHelperItem(DEFAULT_HELPER_ITEM);
  }

  isActive(): boolean {
    return this.active;
  }

  async resetAlgorithm(): Promise<void> {
    if (this.active) {
      AlgorithmEventHandler.getInstance().clearSelectedNodes();
      if (this.animationResolver) {
        console.log("Dijkstra submode: resetAlgorithm");
        await this.animationResolver.reset();
        this.stateService.algorithmPlaying(false);
        this.stateService.canAlgorithmStepBackward(false);
        this.stateService.canAlgorithmStepForward(true);
        this.stateService.canAlgorithmPlay(true);
      }
    }
  }

  resolveAlgorithmAnimation(data: AlgorithmCalculationResponse): void {
    this.animationResolver = new DijkstraAnimationResolver(this.pixiService, this.stateService,
      this.graphViewService, this.nodeFabric, this.edgeFabric, data);
    this.stateService.setTotalAlgorithmSteps(this.animationResolver.totalSteps);
    this.animationResolver.prepareView();
  }

  async changeSpeed(speed: number): Promise<void> {
    if (this.animationResolver) {
      await this.animationResolver.changeSpeed(speed);
    }
  }

  async pause(): Promise<void> {
    if (this.animationResolver) {
      if (this.animationResolver.isFirstStep()) {
        this.stateService.canAlgorithmStepBackward(false);
      }
      this.stateService.algorithmPlaying(false);
      this.animationResolver.pause();
    }
  }

  async play(): Promise<void> {
    if (this.animationResolver) {
      this.stateService.algorithmPlaying(true);
      this.stateService.canAlgorithmStepBackward(false);
      this.stateService.canAlgorithmStepForward(false);
      this.stateService.canAlgorithmGoToStep(false);
      this.stateService.canAlgorithmChangeSpeed(false);
      await this.animationResolver.play();
      this.stateService.canAlgorithmChangeSpeed(true);
      this.stateService.canAlgorithmGoToStep(true);
      this.stateService.algorithmPlaying(false);
      this.stateService.canAlgorithmStepForward(true);
      if (this.animationResolver.isFirstStep()) {
        this.stateService.canAlgorithmStepBackward(false);
      } else {
        this.stateService.canAlgorithmStepBackward(true);
      }
      if (this.animationResolver.isLastStep()) {
        this.stateService.canAlgorithmPlay(false);
        this.stateService.canAlgorithmStepForward(false);
      }
    }
  }

  async stepBackward(): Promise<void> {
    if (this.animationResolver) {
      this.stateService.canAlgorithmPlay(false);
      this.stateService.canAlgorithmStepBackward(false);
      this.stateService.canAlgorithmStepForward(false);
      this.stateService.canAlgorithmGoToStep(false);
      this.stateService.canAlgorithmChangeSpeed(false);
      await this.animationResolver.stepBackward();
      if (this.animationResolver.isFirstStep()) {
        this.stateService.canAlgorithmStepBackward(false);
      } else {
        this.stateService.canAlgorithmStepBackward(true);
      }
      this.stateService.canAlgorithmChangeSpeed(true);
      this.stateService.canAlgorithmGoToStep(true);
      this.stateService.canAlgorithmPlay(true);
      this.stateService.canAlgorithmStepForward(true);
    }
  }

  async stepForward(): Promise<void> {
    if (this.animationResolver) {
      this.stateService.canAlgorithmPlay(false);
      this.stateService.canAlgorithmStepBackward(false);
      this.stateService.canAlgorithmStepForward(false);
      this.stateService.canAlgorithmGoToStep(false);
      this.stateService.canAlgorithmChangeSpeed(false);
      await this.animationResolver.stepForward();
      this.stateService.canAlgorithmPlay(true);
      this.stateService.canAlgorithmStepForward(true);
      this.stateService.canAlgorithmStepBackward(true);
      this.stateService.canAlgorithmGoToStep(true);
      this.stateService.canAlgorithmChangeSpeed(true);
      if (this.animationResolver.isLastStep()) {
        this.stateService.canAlgorithmPlay(false);
        this.stateService.canAlgorithmStepForward(false);
      }
    }
  }

  goToStep(value: number) {
    if (this.animationResolver) {
      this.animationResolver.goToStep(value);
      if (this.animationResolver.isLastStep()) {
        this.stateService.canAlgorithmPlay(false);
        this.stateService.canAlgorithmStepForward(false);
      } else {
        this.stateService.canAlgorithmPlay(true);
      }
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
