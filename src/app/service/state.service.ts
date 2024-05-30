import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {ModeState} from "./manager/mode-manager.service";
import {NodeView} from "../model/graphical-model/node/node-view";
import {EdgeView} from "../model/graphical-model/edge/edge-view";
import {GraphOrientation} from "../model/orientation";
import {GraphMatrix, TypeMatrix} from "../model/graph-matrix";

/**
 * Service for managing the state of the application.
 */
@Injectable({
  providedIn: 'root'
})
export class StateService {

  // --------------------------------------------------
  // UI component states. Tool bar
  // --------------------------------------------------
  // Can undo and redo
  private canUndoSource = new BehaviorSubject<boolean>(false);
  public canUndo$ = this.canUndoSource.asObservable();
  private canRedoSource = new BehaviorSubject<boolean>(false);
  public canRedo$ = this.canRedoSource.asObservable();

  private undoInvokedSource = new BehaviorSubject<boolean>(false);
  public undoInvoked$ = this.undoInvokedSource.asObservable();

  private redoInvokedSource = new BehaviorSubject<boolean>(false);
  public redoInvoked$ = this.redoInvokedSource.asObservable();

  // Current mode (default, add vertex, add edges etc.)
  private modeStateSource = new BehaviorSubject<ModeState>('default');
  public currentMode$ = this.modeStateSource.asObservable();

  // All modes
  private stateAddVertexSource = new BehaviorSubject<boolean>(false);
  public currentAddVertexState = this.stateAddVertexSource.asObservable();
  private stateAddEdgesSource = new BehaviorSubject<boolean>(false);
  public currentAddEdgesState = this.stateAddEdgesSource.asObservable();

  // --------------------------------------------------
  // UI component states. Nav bar components
  // --------------------------------------------------
  private matrixViewVisibilitySource = new BehaviorSubject<boolean>(false);
  public matrixViewVisibility$ = this.matrixViewVisibilitySource.asObservable();

  private matrixTypeSource = new BehaviorSubject<TypeMatrix>(TypeMatrix.ADJACENCY);
  public currentMatrixType$ = this.matrixTypeSource.asObservable();

  private matrixSource = new BehaviorSubject<GraphMatrix | null>(null);
  public currentMatrix$ = this.matrixSource.asObservable();

  private needResizeCanvasSource = new BehaviorSubject<boolean>(false);
  public needResizeCanvas$ = this.needResizeCanvasSource.asObservable();

  // --------------------------------------------------
  // UI component states. Canvas
  // --------------------------------------------------
  // Canvas cursor coordinates
  private cursorXSource = new BehaviorSubject<number>(0);
  private cursorYSource = new BehaviorSubject<number>(0);
  public currentCursorX = this.cursorXSource.asObservable();
  public currentCursorY = this.cursorYSource.asObservable();

  private rendererResizedSource = new BehaviorSubject<{width: number, height: number}>({width: 0, height: 0});
  public rendererResized$ = this.rendererResizedSource.asObservable();

  // --------------------------------------------------
  // Graph elements and graph states
  // --------------------------------------------------
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
  /**
   * State of any changes with graph (added node/edge, deleted node/edge, changed weight, changed orientation etc.).
   * Be careful with this event, if you already subscribed to child events (nodeAdded$, nodeDeleted$ etc.).
   */
  private graphChangedSource = new BehaviorSubject<boolean>(false);
  public graphChanged$ = this.graphChangedSource.asObservable();

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
   this.graphChangedSource.next(true);
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
    this.graphChangedSource.next(true);
  }

  /**
   * Change the visibility of the matrix view.
   */
  changedMatrixViewVisibility(value: boolean) {
    console.log("Matrix view visibility changed: " + value);
    this.matrixViewVisibilitySource.next(value);
  }

  /**
   * Change the matrix type.
   */
  changeMatrixType(type: TypeMatrix) {
    console.log("Matrix type changed: " + type);
    this.matrixTypeSource.next(type);
  }

  /**
   * Change the matrix.
   */
  changeMatrix(matrix: GraphMatrix) {
    this.matrixSource.next(matrix);
  }

  /**
   * Notify that the canvas needs to be resized.
   */
  needResizeCanvas() {
    this.needResizeCanvasSource.next(true);
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
   * Notify that the renderer size has been changed.
   */
  changedRendererSize(width: number, height: number) {
    this.rendererResizedSource.next({width: width, height: height});
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
    this.graphChangedSource.next(true);
  }

  /**
   * Notify that a node has been deleted.
   */
  deletedNode(nodeView: NodeView) {
    this.nodeDeletedSource.next(nodeView);
    this.graphChangedSource.next(true);
  }

  /**
   * Notify that an edge has been added.
   */
  addedEdge(edgeView: EdgeView) {
    this.edgeAddedSource.next(edgeView);
    this.graphChangedSource.next(true);
  }

  /**
   * Notify that an edge has been deleted.
   */
  deletedEdge(edgeView: EdgeView) {
    this.edgeDeletedSource.next(edgeView);
    this.graphChangedSource.next(true);
  }
}
