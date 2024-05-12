import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {ModeState} from "./event/mode-manager.service";
import {NodeView} from "../model/graphical-model/node/node-view";
import {EdgeView} from "../model/graphical-model/edge/edge-view";
import {GraphOrientation} from "../model/orientation";

/**
 * Service for managing the state of the application.
 */
@Injectable({
  providedIn: 'root'
})
export class StateService {

  // Can undo and redo
  private canUndoSource = new BehaviorSubject<boolean>(false);
  public canUndo$ = this.canUndoSource.asObservable();
  private canRedoSource = new BehaviorSubject<boolean>(false);
  public canRedo$ = this.canRedoSource.asObservable();

  private undoInvokedSource = new BehaviorSubject<boolean>(false);
  public undoInvoked$ = this.undoInvokedSource.asObservable();

  private redoInvokedSource = new BehaviorSubject<boolean>(false);
  public redoInvoked$ = this.redoInvokedSource.asObservable();

  // Current mode
  private modeStateSource = new BehaviorSubject<ModeState>('default');
  public currentMode$ = this.modeStateSource.asObservable();

  // All modes
  private stateAddVertexSource = new BehaviorSubject<boolean>(false);
  public currentAddVertexState = this.stateAddVertexSource.asObservable();
  private stateAddEdgesSource = new BehaviorSubject<boolean>(false);
  public currentAddEdgesState = this.stateAddEdgesSource.asObservable();

  // Canvas cursor coordinates
  private cursorXSource = new BehaviorSubject<number>(0);
  private cursorYSource = new BehaviorSubject<number>(0);
  public currentCursorX = this.cursorXSource.asObservable();
  public currentCursorY = this.cursorYSource.asObservable();

  // Node related events
  private nodeAddedSource = new BehaviorSubject<NodeView | null>(null);
  public nodeAdded$ = this.nodeAddedSource.asObservable();

  private nodeDeletedSource = new BehaviorSubject<NodeView | null>(null);
  public nodeDeleted$ = this.nodeDeletedSource.asObservable();

  // Edge related events
  private edgeAddedSource = new BehaviorSubject<EdgeView | null>(null);
  public edgeAdded$ = this.edgeAddedSource.asObservable();

  private edgeDeletedSource = new BehaviorSubject<EdgeView | null>(null);
  public edgeDeleted$ = this.edgeDeletedSource.asObservable();

  // Graph related events
  private graphClearedSource = new BehaviorSubject<boolean>(false);
  public graphCleared$ = this.graphClearedSource.asObservable();

  private showWeightsSource = new BehaviorSubject<boolean>(true);
  public showWeights$ = this.showWeightsSource.asObservable();

  private graphOrientationSource = new BehaviorSubject<GraphOrientation>(GraphOrientation.ORIENTED);
  public graphOrientation$ = this.graphOrientationSource.asObservable();

  private graphOrientationChangedSource = new BehaviorSubject<GraphOrientation>(GraphOrientation.ORIENTED);
  public graphOrientationChanged$ = this.graphOrientationChangedSource.asObservable();

  constructor() { }

  /**
   * Change the undo state.
   */
  setCanUndo(state: boolean) {
    this.canUndoSource.next(state);
  }

  /**
   * Change the redo state.
   */
  setCanRedo(state: boolean) {
    this.canRedoSource.next(state);
  }

  /**
   * Notify that undo has been invoked.
   */
  undoInvoked() {
    this.undoInvokedSource.next(true);
  }

  /**
   * Notify that redo has been invoked.
   */
  redoInvoked() {
    this.redoInvokedSource.next(true);
  }

  /**
   * Change the mode of the application.
   */
  changeMode(mode: ModeState) {
    this.modeStateSource.next(mode);
  }

  /**
   * Notify that the graph has been cleared.
   */
  graphCleared() {
   this.graphClearedSource.next(true);
  }

  /**
   * Change the state of showing weights.
   */
  changeShowWeights(state: boolean) {
    this.showWeightsSource.next(state);
  }

  /**
   * Change the graph orientation.
   */
  changeGraphOrientation(value: GraphOrientation) {
    this.graphOrientationSource.next(value);
  }

  /**
   * Notify that the graph orientation has been changed.
   */
  graphOrientationChanged(value: GraphOrientation) {
    this.graphOrientationChangedSource.next(value);
  }

  /**
   * Change the cursor x coordinate.
   */
  changeCursorX(x: number) {
    this.cursorXSource.next(x);
  }

  /**
   * Change the cursor y coordinate.
   */
  changeCursorY(y: number) {
    this.cursorYSource.next(y);
  }

  /**
   * Change the add vertex mode state.
   */
  changeAddVertexModeState(state: boolean) {
    this.stateAddVertexSource.next(state);
  }

  /**
   * Change the add edges mode state.
   */
  changeAddEdgesModeState(state: boolean) {
    this.stateAddEdgesSource.next(state);
  }

  /**
   * Notify that a node has been added.
   */
  addedNode(nodeView: NodeView) {
    this.nodeAddedSource.next(nodeView);
  }

  /**
   * Notify that a node has been deleted.
   */
  deletedNode(nodeView: NodeView) {
    this.nodeDeletedSource.next(nodeView);
  }

  /**
   * Notify that an edge has been added.
   */
  addedEdge(edgeView: EdgeView) {
    this.edgeAddedSource.next(edgeView);
  }

  /**
   * Notify that an edge has been deleted.
   */
  deletedEdge(edgeView: EdgeView) {
    this.edgeDeletedSource.next(edgeView);
  }
}
