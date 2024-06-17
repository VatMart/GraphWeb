import {ModeBehavior} from "../../service/manager/mode-manager.service";
import {PixiService} from "../../service/pixi.service";
import {NodeView} from "../../model/graphical-model/node/node-view";
import {GraphViewService} from "../../service/graph-view.service";
import {EventBusService, HandlerNames} from "../../service/event-bus.service";
import {HistoryService} from "../../service/history.service";
import {EdgeView} from "../../model/graphical-model/edge/edge-view";
import {StateService} from "../../service/state.service";
import {ForceMode} from "./force-mode";

/**
 * Default mode for the application
 */
export class DefaultMode implements ModeBehavior {
  private forceMode: ForceMode;

  constructor(private pixiService: PixiService,
              private eventBus: EventBusService,
              private historyService: HistoryService,
              private graphViewService: GraphViewService,
              private stateService: StateService) {
    this.forceMode = new ForceMode(pixiService, eventBus, historyService, graphViewService, stateService);
  }

  modeOn(): void {
    console.log("DefaultMode ON"); // TODO remove
    this.stateService.changeForceModeDisabledState(false);
    this.selectableModeOn();
    this.moveableNodesOn();
    this.editableEdgesWeightOn();
    if (this.stateService.isForceModeEnabled()) {
      this.forceMode.modeOn();
    }
  }

  modeOff(): void {
    console.log("DefaultMode OFF"); // TODO remove
    this.selectableModeOff();
    this.moveableNodesOff();
    this.editableEdgesWeightOff()
    this.graphViewService.clearSelection();
    this.forceMode.modeOff();
  }

  onAddedNode(nodeView: NodeView): void {
    this.moveableNodeOn(nodeView);
  }

  onAddedEdge(edgeView: EdgeView): void {
  }

  onRemovedNode(nodeView: NodeView): void {
  }

  onRemovedEdge(edgeView: EdgeView): void {
  }

  onGraphCleared(): void {
  }

  onUndoInvoked(): void {
  }

  onRedoInvoked(): void {
  }

  public forceModeOn(): void {
    this.forceMode.modeOn();
  }

  public forceModeOff(): void {
    this.forceMode.modeOff();
  }

  /**
   * Add listeners for moving nodes to all nodes
   */
  public moveableNodesOn() {
    // Add event listeners to all nodes
    this.graphViewService.nodeViews.forEach((nodeView: NodeView) => {
      this.moveableNodeOn(nodeView);
    });
  }

  /**
   * Remove listeners for moving nodes to all nodes
   */
  public moveableNodesOff() {
    this.graphViewService.nodeViews.forEach((nodeView: NodeView) => {
      this.moveableNodeOff(nodeView);
    });
  }

  /**
   * Remove listeners for moving nodes of particular node
   */
  public moveableNodeOn(nodeView: NodeView) {
    this.eventBus.registerPixiEvent(nodeView, 'pointerdown', HandlerNames.NODE_DRAG_START);
  }

  /**
   * Remove listeners for moving node of particular node
   */
  public moveableNodeOff(nodeView: NodeView) {
    this.eventBus.unregisterPixiEvent(nodeView, 'pointerdown', HandlerNames.NODE_DRAG_START);
  }

  private selectableModeOn() {
    this.eventBus.registerPixiEvent(this.pixiService.stage, 'pointerdown',
      HandlerNames.ELEMENT_SELECT);
  }

  private selectableModeOff() {
    this.eventBus.unregisterPixiEvent(this.pixiService.stage, 'pointerdown',
      HandlerNames.ELEMENT_SELECT);
  }

  private editableEdgesWeightOn() {
    this.eventBus.registerPixiEvent(this.pixiService.stage, 'pointerdown',
      HandlerNames.EDGE_WEIGHT_CHANGE);
  }

  private editableEdgesWeightOff() {
    this.eventBus.unregisterPixiEvent(this.pixiService.stage, 'pointerdown',
      HandlerNames.EDGE_WEIGHT_CHANGE);
  }
}
