import {Injectable} from '@angular/core';
import {NodeView} from "../../model/graphical-model/node-view";
import {StateService} from "../state.service";
import {DefaultMode} from "../../logic/event/default-mode";
import {AddRemoveVertexMode} from "../../logic/event/add-remove-vertex-mode";
import {AddRemoveEdgeMode} from "../../logic/event/add-remove-edge-mode";
import {PixiService} from "../pixi.service";
import {GraphViewService} from "../graph-view.service";
import {EventBusService} from "./event-bus.service";
import {NodeViewFabricService} from "../node-view-fabric.service";
import {HistoryService} from "../history.service";

@Injectable({
  providedIn: 'root'
})
export class ModeManagerService {

  private modeStateActions: { [key in ModeState]: ModeBehavior };

  private currentModeState: ModeState = 'default';

  constructor(private stateService: StateService,
              private eventBus: EventBusService,
              private pixiService: PixiService,
              private nodeViewFabricService: NodeViewFabricService,
              private historyService: HistoryService,
              private graphViewService: GraphViewService) {

    this.modeStateActions = {
      'default': new DefaultMode(pixiService, eventBus, historyService, graphViewService),
      'AddRemoveVertex': new AddRemoveVertexMode(pixiService, eventBus, nodeViewFabricService, historyService,
        graphViewService),
      'AddRemoveEdge': new AddRemoveEdgeMode(pixiService, eventBus, graphViewService)
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
    console.log("On added node. currentModeState: " + this.currentModeState);
    this.modeStateActions[this.currentModeState].onAddedNode(nodeView);
  }

}

export interface ModeBehavior {
  modeOn(): void;

  modeOff(): void;

  /**
   * On added node handling, while mode is active
   */
  onAddedNode(nodeView: NodeView): void;
}

export type ModeState = 'AddRemoveVertex' | 'AddRemoveEdge' | 'default';
