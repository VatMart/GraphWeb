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

/**
 * Dijkstra submode class.
 */
export class DijkstraSubmode implements AlgorithmSubmode {

  readonly submodeState: SubmodeState = 'Dijkstra';
  private active: boolean = false;

  constructor(private pixiService: PixiService,
              private stateService: StateService,
              private eventBus: EventBusService) {
  }

  modeOn(): void {
    console.log("Dijkstra submode ON");
    this.eventBus.registerPixiEvent(this.pixiService.stage, 'pointerdown',
      HandlerNames.SHORTEST_PATH_SELECTION);
    this.active = true;
    this.stateService.changeFloatHelperItem(DIJKSTRA_ALGORITHM_HELPER_ITEM);
  }

  modeOff(): void {
    console.log("Dijkstra submode OFF");
    AlgorithmEventHandler.getInstance().clearSelectedNodes();
    this.eventBus.unregisterPixiEvent(this.pixiService.stage, 'pointerdown',
      HandlerNames.SHORTEST_PATH_SELECTION);
    this.active = false;
    this.stateService.changeFloatHelperItem(DEFAULT_HELPER_ITEM);
  }

  isActive(): boolean {
    return this.active;
  }

  resetAlgorithm(): void {
    if (this.active) {
      AlgorithmEventHandler.getInstance().clearSelectedNodes();
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
