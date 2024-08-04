import {AlgorithmSubmode, BaseAlgorithmSubmode, SubmodeState} from "../mode";
import {EdgeView} from "../../../model/graphical-model/edge/edge-view";
import {NodeView} from "../../../model/graphical-model/node/node-view";
import {StateService} from "../../../service/event/state.service";
import {DIJKSTRA_ALGORITHM_HELPER_ITEM} from "../../../component/canvas/float-helper/float-helper.component";
import {EventBusService, HandlerNames} from "../../../service/event/event-bus.service";
import {PixiService} from "../../../service/pixi.service";
import {DijkstraAnimationResolver} from "../../algorithm/animation/dijkstra-animation-resolver";
import {GraphViewService} from "../../../service/graph/graph-view.service";
import {AlgorithmCalculationResponse} from "../../../service/manager/algorithm-manager.service";
import {NodeViewFabricService} from "../../../service/fabric/node-view-fabric.service";
import {EdgeViewFabricService} from "../../../service/fabric/edge-view-fabric.service";

/**
 * Dijkstra submode class.
 */
export class DijkstraSubmode extends BaseAlgorithmSubmode implements AlgorithmSubmode {
  readonly submodeState: SubmodeState = 'Dijkstra';

  constructor(private pixiService: PixiService,
              private graphViewService: GraphViewService,
              stateService: StateService,
              private eventBus: EventBusService,
              private nodeFabric: NodeViewFabricService,
              private edgeFabric: EdgeViewFabricService) {
    super(stateService);
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
    this.eventBus.unregisterPixiEvent(this.pixiService.stage, 'pointerdown',
      HandlerNames.SHORTEST_PATH_SELECTION);
    this.active = false;
  }

  resolveAlgorithmAnimation(data: AlgorithmCalculationResponse): void {
    this.animationResolver = new DijkstraAnimationResolver(this.pixiService, this.stateService,
      this.graphViewService, this.nodeFabric, this.edgeFabric, data);
    this.stateService.setTotalAlgorithmSteps(this.animationResolver.totalSteps);
    this.animationResolver.prepareView();
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
