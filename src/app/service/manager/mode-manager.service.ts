import {Injectable} from '@angular/core';
import {NodeView} from "../../model/graphical-model/node/node-view";
import {StateService} from "../event/state.service";
import {DefaultMode} from "../../logic/mode/default-mode";
import {AddRemoveVertexMode} from "../../logic/mode/add-remove-vertex-mode";
import {AddRemoveEdgeMode} from "../../logic/mode/add-remove-edge-mode";
import {PixiService} from "../pixi.service";
import {GraphViewService} from "../graph/graph-view.service";
import {EventBusService} from "../event/event-bus.service";
import {NodeViewFabricService} from "../fabric/node-view-fabric.service";
import {HistoryService} from "../history.service";
import {EdgeViewFabricService} from "../fabric/edge-view-fabric.service";
import {EdgeView} from "../../model/graphical-model/edge/edge-view";
import {
  ADD_REMOVE_EDGE_MODE_HELPER_ITEM,
  ADD_REMOVE_VERTEX_MODE_HELPER_ITEM, DEFAULT_HELPER_ITEM
} from "../../component/canvas/float-helper/float-helper.component";
import {Subscription} from "rxjs";
import {ServiceManager} from "../../logic/service-manager";
import {ChangeForceModeCommand, NodePosition} from "../../logic/command/change-force-mode-command";

/**
 * Service for managing the modes of the application.
 */
@Injectable({
  providedIn: 'root'
})
export class ModeManagerService implements ServiceManager {
  // TODO call unsubscribe on destroy app
  private subscriptions = new Subscription();

  private defaultMode!: DefaultMode;
  private modeStateActions!: { [key in ModeState]: ModeBehavior };

  private currentModeState!: ModeState;

  constructor(private stateService: StateService,
              private eventBus: EventBusService,
              private pixiService: PixiService,
              private nodeViewFabricService: NodeViewFabricService,
              private edgeViewFabricService: EdgeViewFabricService,
              private historyService: HistoryService,
              private graphViewService: GraphViewService) {
  }

  /**
   * Initialize the mode manager service.
   * Should be called after all ui components are initialized (including Pixi canvas)
   */
  initialize(): void {
    this.defaultMode = new DefaultMode(
      this.pixiService, this.eventBus, this.historyService,
      this.graphViewService, this.stateService
    );
    this.modeStateActions = {
      'default': this.defaultMode,
      'AddRemoveVertex': new AddRemoveVertexMode(this.pixiService, this.eventBus, this.stateService),
      'AddRemoveEdge': new AddRemoveEdgeMode(this.pixiService, this.eventBus, this.stateService)
      // TODO Add selection mode for mobile devices (for multiple selection)
    };
    this.initSubscriptions();
  }

  /**
   * Initialize subscriptions for the mode manager service
   */
  initSubscriptions(): void {
    // Subscribe to the currentMode$ mode state
    this.subscriptions.add(
      this.stateService.currentMode$.subscribe(mode => {
        if (mode === null) {
          return;
        }
        if (this.currentModeState !== mode) {
          this.updateModeState(mode);
          this.updateHelperItem(mode);
        }
      })
    );

    // Subscribe to mode states
    this.subscriptions.add(
      this.stateService.currentAddVertexState.subscribe(state => {
        if (state === null) {
          return;
        }
        const newState: ModeState = state ? 'AddRemoveVertex' : 'default';
        this.stateService.changeMode(newState);
      })
    );
    // Subscribe to edge mode state
    this.subscriptions.add(
      this.stateService.currentAddEdgesState.subscribe(state => {
        if (state === null) {
          return;
        }
        const newState: ModeState = state ? 'AddRemoveEdge' : 'default';
        this.stateService.changeMode(newState);
      })
    );
    // Subscribe to force mode state
    this.subscriptions.add(
      this.stateService.forceModeState$.subscribe(mode => {
        if (mode === null) {
          return;
        }
        const nodePositions: NodePosition[] = [...this.graphViewService.nodeViews.values()]
          .map(node => new NodePosition(node, node.coordinates));
        const command = new ChangeForceModeCommand(this.graphViewService, this.stateService, this.defaultMode,
          nodePositions, mode)
        this.historyService.execute(command);
      })
    );
    // Subscribe to center force mode state
    this.subscriptions.add(
      this.stateService.centerForceState$.subscribe(value => {
        if (value !== null) {
          this.defaultMode.centerForceToggle(value)
        }
      })
    );
    // Subscribe to link force mode state
    this.subscriptions.add(
      this.stateService.linkForceState$.subscribe(value => {
        if (value !== null) {
          this.defaultMode.linkForceToggle(value)
        }
      })
    );
    // Subscribe to changes in the graph
    this.subscriptions.add(
      this.stateService.nodeAdded$.subscribe(nodeView => {
        if (nodeView) {
          this.onAddedNode(nodeView);
        }
      })
    );
    this.subscriptions.add(
      this.stateService.nodeDeleted$.subscribe(nodeView => {
        if (nodeView) {
          this.onRemovedNode(nodeView);
        }
      })
    );
    this.subscriptions.add(
      this.stateService.edgeAdded$.subscribe(edgeView => {
        if (edgeView) {
          this.onAddedEdge(edgeView);
        }
      })
    );
    this.subscriptions.add(
      this.stateService.edgeDeleted$.subscribe(edgeView => {
        if (edgeView) {
          this.onRemovedEdge(edgeView);
        }
      })
    );
    this.subscriptions.add(
      this.stateService.graphCleared$.subscribe((value) => {
        if (value !== null) {
          this.onGraphCleared();
        }
      })
    );
    this.subscriptions.add(
      this.stateService.graphViewGenerated$.subscribe((value) => {
        if (value !== null) {
          this.onGraphViewGenerated();
        }
      })
    );
    this.subscriptions.add(
      this.stateService.undoInvoked$.subscribe((value) => {
        if (value !== null) {
          this.onUndoInvoked();
        }
      })
    );
    this.subscriptions.add(
      this.stateService.redoInvoked$.subscribe((value) => {
        if (value !== null) {
          this.onRedoInvoked();
        }
      })
    );
  }

  /**
   * Destroy all subscriptions
   */
  destroySubscriptions(): void {
    this.subscriptions.unsubscribe();
  }

  private updateModeState(newState: ModeState) {
    if (this.modeStateActions[this.currentModeState]) {
      this.modeStateActions[this.currentModeState].modeOff(); // Turn off current mode
    }
    if (this.modeStateActions[newState]) {
      this.modeStateActions[newState].modeOn();
    }
    this.currentModeState = newState;
  }

  private updateHelperItem(mode: ModeState) {
    switch (mode) {
      case 'AddRemoveVertex':
        this.stateService.changeFloatHelperItem(ADD_REMOVE_VERTEX_MODE_HELPER_ITEM);
        break;
      case 'AddRemoveEdge':
        this.stateService.changeFloatHelperItem(ADD_REMOVE_EDGE_MODE_HELPER_ITEM);
        break;
      case 'default':
        this.stateService.changeFloatHelperItem(DEFAULT_HELPER_ITEM);
    }
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
   * On graph view generated handling, while mode is active
   */
  public onGraphViewGenerated() {
    this.modeStateActions[this.currentModeState].onGraphViewGenerated();
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

  onGraphViewGenerated(): void;

  onUndoInvoked(): void;

  onRedoInvoked(): void;
}

export type ModeState = 'AddRemoveVertex' | 'AddRemoveEdge' | 'default';
