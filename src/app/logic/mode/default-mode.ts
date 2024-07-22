import {PixiService} from "../../service/pixi.service";
import {NodeView} from "../../model/graphical-model/node/node-view";
import {GraphViewService} from "../../service/graph/graph-view.service";
import {EventBusService, HandlerNames} from "../../service/event/event-bus.service";
import {HistoryService} from "../../service/history.service";
import {EdgeView} from "../../model/graphical-model/edge/edge-view";
import {StateService} from "../../service/event/state.service";
import {BaseMode, Mode, ModeState, Submode, SubmodeState} from "./mode";
import {ForceSubmode} from "./force-submode";

/**
 * Default mode for the application
 */
export class DefaultMode extends BaseMode implements Mode {
  override readonly modeState: ModeState = 'default';
  override submode: Submode | undefined;

  constructor(private pixiService: PixiService,
              private eventBus: EventBusService,
              private historyService: HistoryService,
              private graphViewService: GraphViewService,
              private stateService: StateService,
              submode?: Submode) {
    super();
    this.submode = submode ? submode : undefined;
  }

  modeOn(): void {
    console.log("DefaultMode ON"); // TODO remove
    // Special case for force submode
    if (this.submode?.submodeState === 'force' && ForceSubmode.activatedByUserMemory) {
      this.submodeOn();
    }
    this.selectableModeOn();
    this.moveableNodesOn();
    this.editableEdgesWeightOn();
  }

  modeOff(): void {
    console.log("DefaultMode OFF"); // TODO remove
    if (this.submode?.isActive()) {
      this.submodeOff();
    }
    this.selectableModeOff();
    this.moveableNodesOff();
    this.editableEdgesWeightOff()
    this.graphViewService.clearSelection();
  }

  onAddedNode(nodeView: NodeView): void {
    this.moveableNodeOn(nodeView);
    if (this.submode) {
      this.submode.onAddedNode(nodeView);
    }
  }

  onAddedEdge(edgeView: EdgeView): void {
    if (this.submode) {
      this.submode.onAddedEdge(edgeView);
    }
  }

  onBeforeNodeDeleted(nodeView: NodeView): void {
    if (this.submode) {
      this.submode.onBeforeNodeDeleted(nodeView);
    }
  }

  onRemovedNode(nodeView: NodeView): void {
    if (this.submode) {
      this.submode.onRemovedNode(nodeView);
    }
  }

  onRemovedEdge(edgeView: EdgeView): void {
    if (this.submode) {
      this.submode.onRemovedEdge(edgeView);
    }
  }

  onGraphCleared(): void {
    if (this.submode) {
      this.submode.onGraphCleared();
    }
  }

  onGraphViewGenerated(): void {
    if (this.submode) {
      this.submode.onGraphViewGenerated();
    }
  }

  onUndoInvoked(): void {
    if (this.submode) {
      this.submode.onUndoInvoked();
    }
  }

  onRedoInvoked(): void {
    if (this.submode) {
      this.submode.onRedoInvoked();
    }
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
