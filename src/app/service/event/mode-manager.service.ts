import {Injectable} from '@angular/core';
import {NodeView} from "../../model/graphical-model/node/node-view";
import {StateService} from "../state.service";
import {DefaultMode} from "../../logic/event/default-mode";
import {AddRemoveVertexMode} from "../../logic/event/add-remove-vertex-mode";
import {AddRemoveEdgeMode} from "../../logic/event/add-remove-edge-mode";
import {PixiService} from "../pixi.service";
import {GraphViewService} from "../graph-view.service";
import {EventBusService} from "./event-bus.service";
import {NodeViewFabricService} from "../node-view-fabric.service";
import {HistoryService} from "../history.service";
import {EdgeViewFabricService} from "../edge-view-fabric.service";
import {EdgeView} from "../../model/graphical-model/edge/edge-view";

/**
 * Service for managing the modes of the application.
 */
@Injectable({
  providedIn: 'root'
})
export class ModeManagerService {

  private modeStateActions: { [key in ModeState]: ModeBehavior };

  private currentModeState: ModeState;

  constructor(private stateService: StateService,
              private eventBus: EventBusService,
              private pixiService: PixiService,
              private nodeViewFabricService: NodeViewFabricService,
              private edgeViewFabricService: EdgeViewFabricService,
              private historyService: HistoryService,
              private graphViewService: GraphViewService) {

    this.modeStateActions = {
      'default': new DefaultMode(pixiService, eventBus, historyService, graphViewService),
      'AddRemoveVertex': new AddRemoveVertexMode(pixiService, eventBus, nodeViewFabricService, historyService,
        graphViewService),
      'AddRemoveEdge': new AddRemoveEdgeMode(pixiService, eventBus, nodeViewFabricService, edgeViewFabricService, historyService,
        graphViewService)
      // TODO Add selection mode for mobile devices (for multiple selection)
    };

    // Subscribe to the currentMode$ mode state
    this.stateService.currentMode$.subscribe(mode => {
      console.log("ModeManagerService: mode: " + mode);
      console.log("ModeManagerService: currentMode: " + this.currentModeState);
      if (this.currentModeState !== mode) {
        this.graphViewService.clearSelection();
        this.updateModeState(mode);
      }
    });

    // Subscribe to the currentAddVertexState mode state
    this.stateService.currentAddVertexState.subscribe(state => {
      const newState: ModeState = state ? 'AddRemoveVertex' : 'default';
      this.stateService.changeMode(newState);
    });
    this.stateService.currentAddEdgesState.subscribe(state => {
      const newState: ModeState = state ? 'AddRemoveEdge' : 'default';
      this.stateService.changeMode(newState);
    });
    this.stateService.nodeAdded$.subscribe(nodeView => {
      if (nodeView) {
        this.onAddedNode(nodeView);
      }
    });
    this.stateService.nodeDeleted$.subscribe(nodeView => {
      if (nodeView) {
        this.onRemovedNode(nodeView);
      }
    });
    this.stateService.edgeAdded$.subscribe(edgeView => {
      if (edgeView) {
        this.onAddedEdge(edgeView);
      }
    });
    this.stateService.edgeDeleted$.subscribe(edgeView => {
      if (edgeView) {
        this.onRemovedEdge(edgeView);
      }
    });
    this.stateService.graphCleared$.subscribe(() => {
      this.onGraphCleared();
    });
    this.stateService.undoInvoked$.subscribe(() => {
      this.onUndoInvoked();
    });
    this.stateService.redoInvoked$.subscribe(() => {
      this.onRedoInvoked();
    });
    // Set default mode
    this.currentModeState = 'default';
  }

  updateModeState(newState: ModeState) {
    if (this.modeStateActions[this.currentModeState]) {
      this.modeStateActions[this.currentModeState].modeOff(); // Turn off current mode
    }
    if (this.modeStateActions[newState]) {
      this.modeStateActions[newState].modeOn();
    }
    this.currentModeState = newState;
  }

  /**
   * On added node handling, while mode is active
   */
  public onAddedNode(nodeView: NodeView) {
    this.modeStateActions[this.currentModeState].onAddedNode(nodeView);
  }

  /**
   * On removed node handling, while mode is active
   */
  public onRemovedNode(nodeView: NodeView) {
    this.modeStateActions[this.currentModeState].onRemovedNode(nodeView);
  }

  /**
   * On added edge handling, while mode is active
   */
  public onAddedEdge(edgeView: EdgeView) {
    this.modeStateActions[this.currentModeState].onAddedEdge(edgeView);
  }

  /**
   * On removed edge handling, while mode is active
   */
  public onRemovedEdge(edgeView: EdgeView) {
    this.modeStateActions[this.currentModeState].onRemovedEdge(edgeView);
  }

  /**
   * On graph cleared handling, while mode is active
   */
  public onGraphCleared() {
    this.modeStateActions[this.currentModeState].onGraphCleared();
  }

  /**
   * On undo invoked handling, while mode is active
   */
  public onUndoInvoked() {
    this.modeStateActions[this.currentModeState].onUndoInvoked();
  }

  /**
   * On redo invoked handling, while mode is active
   */
  public onRedoInvoked() {
    this.modeStateActions[this.currentModeState].onRedoInvoked();
  }

}

export interface ModeBehavior {
  modeOn(): void;

  modeOff(): void;

  onAddedNode(nodeView: NodeView): void;

  onRemovedNode(nodeView: NodeView): void;

  onAddedEdge(edgeView: EdgeView): void;

  onRemovedEdge(edgeView: EdgeView): void;

  onGraphCleared(): void;

  onUndoInvoked(): void;

  onRedoInvoked(): void;
}

export type ModeState = 'AddRemoveVertex' | 'AddRemoveEdge' | 'default';
