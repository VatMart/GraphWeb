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
  public static readonly GRID_SIZE: number = 150; // TODO move to separate class
  private forceMode: ForceMode;

  constructor(private pixiService: PixiService,
              private eventBus: EventBusService,
              private historyService: HistoryService,
              private graphViewService: GraphViewService,
              private stateService: StateService) {
    this.forceMode = new ForceMode(pixiService, eventBus, historyService, graphViewService, stateService,
      DefaultMode.GRID_SIZE);
  }

  modeOn(): void {
    console.log("DefaultMode ON"); // TODO remove
    this.stateService.changeForceModeDisabledState(false);
    this.selectableModeOn();
    this.moveableNodesOn();
    this.editableEdgesWeightOn();
  }

  modeOff(): void {
    console.log("DefaultMode OFF"); // TODO remove
    this.forceModeOff(); // Off force mode if it is enabled
    this.stateService.changeForceModeDisabledState(true);
    this.selectableModeOff();
    this.moveableNodesOff();
    this.editableEdgesWeightOff()
    this.graphViewService.clearSelection();
  }

  onAddedNode(nodeView: NodeView): void {
    this.moveableNodeOn(nodeView);
    if (this.stateService.isForceModeEnabled()) {
      this.forceMode.onAddedNode(nodeView);
    }
  }

  onAddedEdge(edgeView: EdgeView): void {
    if (this.stateService.isForceModeEnabled()) {
      this.forceMode.onAddedEdge(edgeView);
    }
  }

  onRemovedNode(nodeView: NodeView): void {
    if (this.stateService.isForceModeEnabled()) {
      this.forceMode.onRemovedNode(nodeView);
    }
  }

  onRemovedEdge(edgeView: EdgeView): void {
    if (this.stateService.isForceModeEnabled()) {
      this.forceMode.onRemovedEdge(edgeView);
    }
  }

  onGraphCleared(): void {
    if (this.stateService.isForceModeEnabled()) {
      this.forceMode.onGraphCleared();
    }
  }

  onUndoInvoked(): void {
    if (this.stateService.isForceModeEnabled()) {
      this.forceMode.onUndoInvoked();
    }
  }

  onRedoInvoked(): void {
    if (this.stateService.isForceModeEnabled()) {
      this.forceMode.onRedoInvoked();
    }
  }

  public forceModeOn(): void {
    if (this.stateService.isForceModeEnabled()) {
      return;
    }
    this.forceMode.modeOn();
    this.stateService.forceModeStateChanged();
  }

  public forceModeOff(): void {
    if (!this.stateService.isForceModeEnabled()) {
      return;
    }
    this.forceMode.modeOff();
    this.stateService.forceModeStateChanged();
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
