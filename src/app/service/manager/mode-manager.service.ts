import {Injectable} from '@angular/core';
import {NodeView} from "../../model/graphical-model/node/node-view";
import {StateService} from "../event/state.service";
import {DefaultMode} from "../../logic/mode/default-mode";
import {AddRemoveVertexMode} from "../../logic/mode/add-remove-vertex-mode";
import {AddRemoveEdgeMode} from "../../logic/mode/add-remove-edge-mode";
import {PixiService} from "../pixi.service";
import {GraphViewService} from "../graph/graph-view.service";
import {EventBusService} from "../event/event-bus.service";
import {HistoryService} from "../history.service";
import {EdgeView} from "../../model/graphical-model/edge/edge-view";
import {
  ADD_REMOVE_EDGE_MODE_HELPER_ITEM,
  ADD_REMOVE_VERTEX_MODE_HELPER_ITEM,
  DEFAULT_HELPER_ITEM
} from "../../component/canvas/float-helper/float-helper.component";
import {Subscription} from "rxjs";
import {ServiceManager} from "../../logic/service-manager";
import {ChangeForceModeCommand, NodePosition} from "../../logic/command/change-force-mode-command";
import {SelectionMode} from "../../logic/mode/selection-mode";
import {Mode, ModeState, Submode, SubmodeState} from "../../logic/mode/mode";
import {DijkstraSubmode} from "../../logic/mode/algorithm-submode/dijkstra-submode";
import {BfsSubmode} from "../../logic/mode/algorithm-submode/bfsSubmode";
import {DfsSubmode} from "../../logic/mode/algorithm-submode/dfsSubmode";
import {ForceSubmode} from "../../logic/mode/force-submode";
import {Algorithm} from "../../model/Algorithm";
import {AlgorithmMode} from "../../logic/mode/algorithm-mode";
import {ConfService} from "../config/conf.service";
import {NodeViewFabricService} from "../fabric/node-view-fabric.service";
import {EdgeViewFabricService} from "../fabric/edge-view-fabric.service";

/**
 * Service for managing the modes of the application.
 */
@Injectable({
  providedIn: 'root'
})
export class ModeManagerService implements ServiceManager {
  private subscriptions!: Subscription;

  private defaultMode?: DefaultMode;
  private modeStateActions?: { [key in ModeState]: Mode };
  private submodeStateActions?: { [key in SubmodeState]: Submode | undefined };

  private currentModeState?: ModeState;

  constructor(private stateService: StateService,
              private eventBus: EventBusService,
              private pixiService: PixiService,
              private historyService: HistoryService,
              private nodeFabric: NodeViewFabricService,
              private edgeFabric: EdgeViewFabricService,
              private graphViewService: GraphViewService) {
  }

  /**
   * Initialize the mode manager service.
   * Should be called after all ui components are initialized (including Pixi canvas)
   */
  initialize(): void {
    // Initialize mode state actions
    this.submodeStateActions = {
      'none': undefined,
      'force': new ForceSubmode(this.pixiService, this.eventBus, this.historyService, this.graphViewService,
        this.stateService),
      // Algorithm submodes
      'Dijkstra': new DijkstraSubmode(this.pixiService, this.graphViewService, this.stateService, this.eventBus,
        this.nodeFabric, this.edgeFabric),
      'BFS': new BfsSubmode(this.pixiService, this.graphViewService, this.stateService, this.eventBus,
        this.nodeFabric, this.edgeFabric),
      'DFS': new DfsSubmode(this.pixiService, this.graphViewService, this.stateService, this.eventBus,
        this.nodeFabric, this.edgeFabric)
    };
    this.defaultMode = new DefaultMode(this.pixiService, this.eventBus, this.historyService, this.graphViewService,
      this.stateService, this.submodeStateActions.force); // Default mode with force submode
    this.modeStateActions = {
      'default': this.defaultMode,
      'AddRemoveVertex': new AddRemoveVertexMode(this.pixiService, this.eventBus, this.stateService),
      'AddRemoveEdge': new AddRemoveEdgeMode(this.pixiService, this.eventBus, this.stateService),
      'SelectionMode': new SelectionMode(this.pixiService, this.eventBus, this.stateService),
      'Algorithm': new AlgorithmMode(this.pixiService, this.eventBus, this.stateService),
    };
    this.initSubscriptions();
  }

  /**
   * Initialize subscriptions for the mode manager service
   */
  initSubscriptions(): void {
    // Create a new Subscription object
    this.subscriptions = new Subscription();
    // Subscribe to the currentMode$ mode state
    this.subscriptions.add(
      this.stateService.currentMode$.subscribe(mode => {
        if (this.currentModeState !== mode) {
          this.updateModeState(mode);
          this.updateHelperItem(mode);
        }
      })
    );
    // Subscribe to the submode state
    this.subscriptions.add(
      this.stateService.changeSubmode$.subscribe(submode => {
        this.changeSubmodeOfMode(this.modeStateActions![this.currentModeState!], this.submodeStateActions![submode]);
      })
    );
    // Subscribe to mode states
    this.subscriptions.add(
      this.stateService.currentAddVertexState.subscribe(state => {
        const newState: ModeState = state ? 'AddRemoveVertex' : 'default';
        this.stateService.changeMode(newState);
      })
    );
    // Subscribe to edge mode state
    this.subscriptions.add(
      this.stateService.currentAddEdgesState.subscribe(state => {
        const newState: ModeState = state ? 'AddRemoveEdge' : 'default';
        this.stateService.changeMode(newState);
      })
    );
    // Subscribe to selection mode state
    this.subscriptions.add(
      this.stateService.selectionModeState$.subscribe(state => {
        const newState: ModeState = state ? 'SelectionMode' : 'default';
        this.stateService.changeMode(newState);
      })
    );
    // ----------------- Algorithm related -----------------
    // Subscribe to algorithm mode state
    this.subscriptions.add(
      this.stateService.activateAlgorithm$.subscribe((value) => {
        this.stateService.changeMode('Algorithm'); // Change mode to algorithm
        const submodeState = this.getSubmodeStateFromAlgorithm(value);
        this.stateService.changeSubmode(submodeState); // Change submode to selected algorithm
        ConfService.DEFAULT_ALGORITHM = value; // Set default algorithm
      })
    );
    // Subscribe to reset algorithm state
    this.subscriptions.add(
      this.stateService.resetAlgorithm$.subscribe(async (value) => {
        if (this.currentModeState === 'Algorithm') {
          await (this.modeStateActions![this.currentModeState!] as AlgorithmMode).resetAlgorithm();
        }
      })
    );
    // Subscribe to resolve algorithm animation
    this.subscriptions.add(
      this.stateService.resolveAlgorithmAnimation$.subscribe((value) => {
        if (this.currentModeState === 'Algorithm') {
          (this.modeStateActions![this.currentModeState!] as AlgorithmMode).resolveAlgorithmAnimation(value);
        }
      })
    );
    // Subscribe to algorithm animation step forward
    this.subscriptions.add(
      this.stateService.algorithmAnimationStepForward$.subscribe((value) => {
        if (!value) {
          return;
        }
        if (this.currentModeState === 'Algorithm') {
          (this.modeStateActions![this.currentModeState!] as AlgorithmMode).stepForward();
        }
      })
    );
    // Subscribe to algorithm animation step backward
    this.subscriptions.add(
      this.stateService.algorithmAnimationStepBackward$.subscribe((value) => {
        if (!value) {
          return;
        }
        if (this.currentModeState === 'Algorithm') {
          (this.modeStateActions![this.currentModeState!] as AlgorithmMode).stepBackward();
        }
      })
    );
    // Subscribe to algorithm animation go to step
    this.subscriptions.add(
      this.stateService.algorithmAnimationGoToStep$.subscribe((value) => {
        if (this.currentModeState === 'Algorithm') {
          (this.modeStateActions![this.currentModeState!] as AlgorithmMode).goToStep(value);
        }
      })
    );
    // Subscribe to algorithm animation play
    this.subscriptions.add(
      this.stateService.algorithmAnimationPlay$.subscribe((value) => {
        if (!value) {
          return;
        }
        if (this.currentModeState === 'Algorithm') {
          (this.modeStateActions![this.currentModeState!] as AlgorithmMode).play();
        }
      })
    );
    // Subscribe to algorithm animation pause
    this.subscriptions.add(
      this.stateService.algorithmAnimationPause$.subscribe((value) => {
        if (!value) {
          return;
        }
        if (this.currentModeState === 'Algorithm') {
          (this.modeStateActions![this.currentModeState!] as AlgorithmMode).pause();
        }
      })
    );
    // Subscribe to algorithm animation speed change
    this.subscriptions.add(
      this.stateService.algorithmAnimationChangeSpeed$.subscribe((value) => {
        if (this.currentModeState === 'Algorithm') {
          (this.modeStateActions![this.currentModeState!] as AlgorithmMode).changeSpeed(value);
        }
      })
    );
    // ----------------- Force related -----------------
    // Subscribe to force mode state
    this.subscriptions.add(
      this.stateService.forceModeState$.subscribe(mode => {
        const nodePositions: NodePosition[] = [...this.graphViewService.nodeViews.values()]
          .map(node => new NodePosition(node, node.coordinates));
        const command = new ChangeForceModeCommand(this.graphViewService, this.stateService, this.defaultMode!,
          nodePositions, mode)
        this.historyService.execute(command);
      })
    );
    // Subscribe to restore force mode state
    this.subscriptions.add(
      this.stateService.restoreForceModeState$.subscribe((state) => {
        if (this.defaultMode!.getSubmodeState() === 'force') {
          if (state) {
            this.defaultMode!.submodeOn();
          } else {
            this.defaultMode!.submodeOff();
          }
        }
      })
    );
    // Subscribe to center force mode state
    this.subscriptions.add(
      this.stateService.centerForceState$.subscribe(value => {
        (this.submodeStateActions?.force as ForceSubmode).centerForceToggle(value);
      })
    );
    // Subscribe to link force mode state
    this.subscriptions.add(
      this.stateService.linkForceState$.subscribe(value => {
        (this.submodeStateActions?.force as ForceSubmode).linkForceToggle(value);
      })
    );
    // Subscribe to changes in the graph
    this.subscriptions.add(
      this.stateService.nodeAdded$.subscribe(nodeView => {
        this.onAddedNode(nodeView);
      })
    );
    this.subscriptions.add(
      this.stateService.beforeNodeDeleted$.subscribe(nodeView => {
        this.onBeforeNodeDeleted(nodeView);
      })
    );
    this.subscriptions.add(
      this.stateService.nodeDeleted$.subscribe(nodeView => {
        this.onRemovedNode(nodeView);
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
        this.onRemovedEdge(edgeView);
      })
    );
    this.subscriptions.add(
      this.stateService.graphCleared$.subscribe((value) => {
        if (value) {
          this.onGraphCleared();
        }
      })
    );
    this.subscriptions.add(
      this.stateService.graphViewGenerated$.subscribe((value) => {
        if (value) {
          this.onGraphViewGenerated();
        }
      })
    );
    this.subscriptions.add(
      this.stateService.undoInvoked$.subscribe((value) => {
        if (value) {
          this.onUndoInvoked();
        }
      })
    );
    this.subscriptions.add(
      this.stateService.redoInvoked$.subscribe((value) => {
        if (value) {
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

  /**
   * Destroy the mode manager service
   */
  destroy() {
    this.destroySubscriptions();
    this.modeStateActions![this.currentModeState!].modeOff(); // Turn off current mode
    this.defaultMode = undefined;
    this.modeStateActions = undefined;
    this.currentModeState = undefined;
  }

  private updateModeState(newState: ModeState) {
    if (this.modeStateActions![this.currentModeState!]) {
      this.modeStateActions![this.currentModeState!].modeOff(); // Turn off current mode
    }
    if (this.modeStateActions![newState]) {
      this.modeStateActions![newState].modeOn();
    }
    this.currentModeState = newState;
  }

  private changeSubmodeOfMode(mode: Mode, submode: Submode | undefined) {
    mode.unregisterSubmode();
    if (submode) {
      mode.registerSubmode(submode);
      mode.submodeOn(); // Turn on submode
    }
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

  private getSubmodeStateFromAlgorithm(value: Algorithm): SubmodeState {
    switch (value) {
      case 'Dijkstra':
        return 'Dijkstra';
      case 'BFS':
        return 'BFS';
      case 'DFS':
        return 'DFS';
    }
    throw new Error('Invalid algorithm value: ' + value); // TODO replace with custom error
  }

  /**
   * On added node handling, while mode is active
   */
  public onAddedNode(nodeView: NodeView) {
    this.modeStateActions![this.currentModeState!].onAddedNode(nodeView);
  }

  public onBeforeNodeDeleted(nodeView: NodeView) {
    this.modeStateActions![this.currentModeState!].onBeforeNodeDeleted(nodeView);
  }

  /**
   * On removed node handling, while mode is active
   */
  public onRemovedNode(nodeView: NodeView) {
    this.modeStateActions![this.currentModeState!].onRemovedNode(nodeView);
  }

  /**
   * On added edge handling, while mode is active
   */
  public onAddedEdge(edgeView: EdgeView) {
    this.modeStateActions![this.currentModeState!].onAddedEdge(edgeView);
  }

  /**
   * On removed edge handling, while mode is active
   */
  public onRemovedEdge(edgeView: EdgeView) {
    this.modeStateActions![this.currentModeState!].onRemovedEdge(edgeView);
  }

  /**
   * On graph cleared handling, while mode is active
   */
  public onGraphCleared() {
    this.modeStateActions![this.currentModeState!].onGraphCleared();
  }

  /**
   * On graph view generated handling, while mode is active
   */
  public onGraphViewGenerated() {
    this.modeStateActions![this.currentModeState!].onGraphViewGenerated();
  }

  /**
   * On undo invoked handling, while mode is active
   */
  public onUndoInvoked() {
    this.modeStateActions![this.currentModeState!].onUndoInvoked();
  }

  /**
   * On redo invoked handling, while mode is active
   */
  public onRedoInvoked() {
    this.modeStateActions![this.currentModeState!].onRedoInvoked();
  }
}
