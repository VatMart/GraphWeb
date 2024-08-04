import {AlgorithmSubmode, BaseAlgorithmSubmode, SubmodeState} from "../mode";
import {EdgeView} from "../../../model/graphical-model/edge/edge-view";
import {NodeView} from "../../../model/graphical-model/node/node-view";
import {PixiService} from "../../../service/pixi.service";
import {GraphViewService} from "../../../service/graph/graph-view.service";
import {StateService} from "../../../service/event/state.service";
import {EventBusService, HandlerNames} from "../../../service/event/event-bus.service";
import {NodeViewFabricService} from "../../../service/fabric/node-view-fabric.service";
import {EdgeViewFabricService} from "../../../service/fabric/edge-view-fabric.service";
import {TRAVERSE_ALGORITHM_HELPER_ITEM} from "../../../component/canvas/float-helper/float-helper.component";
import {TraverseAnimationResolver} from "../../algorithm/animation/traverse-animation-resolver";

/**
 * DFS submode impl
 */
export class DfsSubmode extends BaseAlgorithmSubmode implements AlgorithmSubmode {
  readonly submodeState: SubmodeState = 'DFS';

  constructor(private pixiService: PixiService,
              private graphViewService: GraphViewService,
              stateService: StateService,
              private eventBus: EventBusService,
              private nodeFabric: NodeViewFabricService,
              private edgeFabric: EdgeViewFabricService) {
    super(stateService);
  }

  modeOn(): void {
    console.log("DfsSubmode ON");
    this.eventBus.registerPixiEvent(this.pixiService.stage, 'pointerdown',
      HandlerNames.TRAVERSE_GRAPH_START_SELECTION);
    this.active = true;
    this.stateService.changeFloatHelperItem(TRAVERSE_ALGORITHM_HELPER_ITEM);
  }

  async modeOff(): Promise<void> {
    console.log("DfsSubmode OFF");
    await this.resetAlgorithm();
    this.eventBus.unregisterPixiEvent(this.pixiService.stage, 'pointerdown',
      HandlerNames.TRAVERSE_GRAPH_START_SELECTION);
    this.active = false;
  }

  async resolveAlgorithmAnimation(data: any): Promise<void> {
    this.animationResolver = new TraverseAnimationResolver(this.pixiService, this.stateService,
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
