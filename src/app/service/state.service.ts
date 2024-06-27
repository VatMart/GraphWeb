import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {ModeState} from "./manager/mode-manager.service";
import {NodeView} from "../model/graphical-model/node/node-view";
import {EdgeView} from "../model/graphical-model/edge/edge-view";
import {GraphOrientation} from "../model/orientation";
import {GraphMatrix, TypeMatrix} from "../model/graph-matrix";
import {DEFAULT_HELPER_ITEM, FloatHelperItem} from "../component/canvas/float-helper/float-helper.component";
import {Weight} from "../model/graphical-model/edge/weight";
import {ForceMode} from "../logic/mode/force-mode";
import {GraphSet, GraphSets} from "../model/graph-set";
import {
  MatrixStringInput,
  MatrixParseResult,
  GraphSetRequest, GraphSetParseResult
} from "../component/tab-nav/input-view/input-view.component";
import {SetValidationResult} from "./graph-set.service";

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

  private showGridSource = new BehaviorSubject<boolean>(false);
  public showGrid$ = this.showGridSource.asObservable();

  // Current mode (default, add vertex, add edges etc.)
  private modeStateSource = new BehaviorSubject<ModeState>('default');
  public currentMode$ = this.modeStateSource.asObservable();

  // All modes
  private stateAddVertexSource = new BehaviorSubject<boolean>(false);
  public currentAddVertexState = this.stateAddVertexSource.asObservable();
  private stateAddEdgesSource = new BehaviorSubject<boolean>(false);
  public currentAddEdgesState = this.stateAddEdgesSource.asObservable();

  // --------------------------------------------------
  // UI component states. Nav bar components. Output view
  // --------------------------------------------------
  private outputViewVisibilitySource = new BehaviorSubject<boolean>(false);
  public outputViewVisibility$ = this.outputViewVisibilitySource.asObservable();

  private outputMatrixTypeSource = new BehaviorSubject<TypeMatrix>(TypeMatrix.ADJACENCY);
  public currentOutputMatrixType$ = this.outputMatrixTypeSource.asObservable();

  private outputMatrixSource = new BehaviorSubject<GraphMatrix | null>(null);
  public currentOutputMatrix$ = this.outputMatrixSource.asObservable();

  private needUpdateOutputMatrixSource = new BehaviorSubject<boolean>(false);
  public needUpdateOutputMatrix$ = this.needUpdateOutputMatrixSource.asObservable();

  private verticesGraphSetSource = new BehaviorSubject<GraphSet | null>(null);
  public currentVerticesGraphSet$ = this.verticesGraphSetSource.asObservable();

  private edgesGraphSetSource = new BehaviorSubject<GraphSet | null>(null);
  public currentEdgesGraphSet$ = this.edgesGraphSetSource.asObservable();

  private needUpdateGraphSetSource = new BehaviorSubject<boolean>(false);
  public needUpdateGraphSet$ = this.needUpdateGraphSetSource.asObservable();

  // --------------------------------------------------
  // UI component states. Nav bar components. Input view
  // --------------------------------------------------
  private inputMatrixSource = new BehaviorSubject<MatrixStringInput | null>(null);
  public currentMatrixInput$ = this.inputMatrixSource.asObservable();

  private inputMatrixParseResultSource = new BehaviorSubject<MatrixParseResult | null>(null);
  public currentMatrixParseResult$ = this.inputMatrixParseResultSource.asObservable();

  private generateGraphByMatrixSource = new BehaviorSubject<GraphMatrix | null>(null);
  public generateGraphByMatrix$ = this.generateGraphByMatrixSource.asObservable();

  private validateVerticesInputSource = new BehaviorSubject<string | null>(null);
  public validateVerticesInput$ = this.validateVerticesInputSource.asObservable();

  private currentInputVerticesSetValidationResultSource = new BehaviorSubject<SetValidationResult | null>(null);
  public currentInputVerticesSetValidationResult$ = this.currentInputVerticesSetValidationResultSource.asObservable();

  private validateEdgesInputSource = new BehaviorSubject<GraphSetRequest | null>(null);
  public validateEdgesInput$ = this.validateEdgesInputSource.asObservable();

  private currentInputEdgesSetValidationResultSource = new BehaviorSubject<SetValidationResult | null>(null);
  public currentInputEdgesSetValidationResult$ = this.currentInputEdgesSetValidationResultSource.asObservable();

  private inputGraphSetSource = new BehaviorSubject<GraphSetRequest | null>(null);
  public currentInputGraphSet$ = this.inputGraphSetSource.asObservable();

  private inputGraphSetParseResultSource = new BehaviorSubject<GraphSetParseResult | null>(null);
  public currentInputGraphSetParseResult$ = this.inputGraphSetParseResultSource.asObservable();

  private generateGraphBySetsSource = new BehaviorSubject<GraphSets | null>(null);
  public generateGraphBySets$ = this.generateGraphBySetsSource.asObservable();

  // --------------------------------------------------
  // UI component states. Canvas
  // --------------------------------------------------
  private pixiStartedSource = new BehaviorSubject<boolean>(false);
  public pixiStarted$ = this.pixiStartedSource.asObservable();

  // Canvas cursor coordinates
  private cursorXSource = new BehaviorSubject<number>(0);
  private cursorYSource = new BehaviorSubject<number>(0);
  public currentCursorX = this.cursorXSource.asObservable();
  public currentCursorY = this.cursorYSource.asObservable();

  private needResizeCanvasSource = new BehaviorSubject<boolean>(false);
  public needResizeCanvas$ = this.needResizeCanvasSource.asObservable();

  private rendererResizedSource = new BehaviorSubject<{width: number, height: number}>({width: 0, height: 0});
  public rendererResized$ = this.rendererResizedSource.asObservable();

  private zoomToChangeSource = new BehaviorSubject<number | null>(null);
  public zoomToChange$ = this.zoomToChangeSource.asObservable();

  private zoomChangedSource = new BehaviorSubject<number>(100);
  public zoomChanged$ = this.zoomChangedSource.asObservable();

  // --------------------------------------------------
  // UI component states. Canvas Float toolbar
  // --------------------------------------------------

  private needCenterCanvasViewSource = new BehaviorSubject<boolean>(false);
  public needCenterCanvasView$ = this.needCenterCanvasViewSource.asObservable();

  private forceModeDisabledSource = new BehaviorSubject<boolean>(false);
  public forceModeDisabled$ = this.forceModeDisabledSource.asObservable();

  private forceModeStateSource = new BehaviorSubject<boolean | null>(null);
  public forceModeState$ = this.forceModeStateSource.asObservable();

  private forceModeStateChangedSource = new BehaviorSubject<boolean>(false);
  public forceModeStateChanged$ = this.forceModeStateChangedSource.asObservable();

  private centerForceStateSource = new BehaviorSubject<boolean | null>(null);
  public centerForceState$ = this.centerForceStateSource.asObservable();

  private linkForceStateSource = new BehaviorSubject<boolean | null>(null);
  public linkForceState$ = this.linkForceStateSource.asObservable();

  // --------------------------------------------------
  // UI component states. Canvas Float helper
  // --------------------------------------------------
  private alwaysHideFloatHelperSource = new BehaviorSubject<boolean>(false);
  public alwaysHideFloatHelper$ = this.alwaysHideFloatHelperSource.asObservable();

  private currentFloatHelperItemSource = new BehaviorSubject<FloatHelperItem>(DEFAULT_HELPER_ITEM);
  public currentFloatHelperItem$ = this.currentFloatHelperItemSource.asObservable();

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

  private showEditEdgeWeightSource = new BehaviorSubject<Weight | null>(null);
  public showEditEdgeWeight$ = this.showEditEdgeWeightSource.asObservable();

  private edgeWeightToChangeSource = new BehaviorSubject<WeightToChange | null>(null);
  public edgeWeightToChange$ = this.edgeWeightToChangeSource.asObservable();

  private edgeWeightChangedSource = new BehaviorSubject<EdgeView | null>(null);
  public edgeWeightChanged$ = this.edgeWeightChangedSource.asObservable();

  // Graph related events
  /**
   * State of any changes with graph (added node/edge, deleted node/edge, changed weight, changed orientation etc.).
   * Be careful with this event, if you already subscribed to child events (nodeAdded$, nodeDeleted$ etc.).
   */
  private graphChangedSource = new BehaviorSubject<boolean>(false);
  public graphChanged$ = this.graphChangedSource.asObservable();

  private graphClearedSource = new BehaviorSubject<boolean | null>(null);
  public graphCleared$ = this.graphClearedSource.asObservable();

  private showWeightsSource = new BehaviorSubject<boolean>(true);
  public showWeights$ = this.showWeightsSource.asObservable();

  private graphOrientationSource = new BehaviorSubject<GraphOrientation>(GraphOrientation.ORIENTED);
  public graphOrientation$ = this.graphOrientationSource.asObservable();

  private graphOrientationChangedSource = new BehaviorSubject<GraphOrientation>(GraphOrientation.ORIENTED);
  public graphOrientationChanged$ = this.graphOrientationChangedSource.asObservable();

  private graphViewGeneratedSource = new BehaviorSubject<boolean | null>(null);
  public graphViewGenerated$ = this.graphViewGeneratedSource.asObservable();

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
   * Change the state of showing grid.
   */
  changeShowGrid(state: boolean) {
    this.showGridSource.next(state);
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
   * Notify that the graph view has been generated.
   */
  graphViewGenerated() {
    this.graphViewGeneratedSource.next(true);
    this.graphChangedSource.next(true);
  }

  /**
   * Change the visibility of the matrix view.
   */
  changedOutputViewVisibility(value: boolean) {
    console.log("Output view visibility changed: " + value);
    this.outputViewVisibilitySource.next(value);
  }

  /**
   * Change the output matrix type.
   */
  changeOutputMatrixType(type: TypeMatrix) {
    this.outputMatrixTypeSource.next(type);
  }

  /**
   * Notify that the matrix needs to be updated.
   */
  needUpdateOutputMatrix() {
    this.needUpdateOutputMatrixSource.next(true);
  }

  /**
   * Change the current vertices graph set.
   */
  changeVerticesGraphSet(graphSet: GraphSet) {
    this.verticesGraphSetSource.next(graphSet);
  }

  /**
   * Change the current edges graph set.
   */
  changeEdgesGraphSet(graphSet: GraphSet) {
    this.edgesGraphSetSource.next(graphSet);
  }

  /**
   * Notify that the graph set needs to be updated.
   */
  needUpdateGraphSet() {
    this.needUpdateGraphSetSource.next(true);
  }

  /**
   * Change the input matrix string.
   */
  changeMatrixInput(matrixInput: MatrixStringInput) {
    this.inputMatrixSource.next(matrixInput);
  }

  /**
   * Change the input matrix parse result.
   */
  changeMatrixParseResult(result: MatrixParseResult | null) {
    this.inputMatrixParseResultSource.next(result);
  }

  /**
   * Generate graph by matrix.
   */
  generateGraphByMatrix(matrix: GraphMatrix) {
    this.generateGraphByMatrixSource.next(matrix);
  }

  /**
   * Validate vertices input.
   */
  validateVerticesInput(value: string) {
    this.validateVerticesInputSource.next(value);
  }

  /**
   * Change vertices set validation result.
   */
  changeInputVerticesSetValidationResult(result: SetValidationResult) {
    this.currentInputVerticesSetValidationResultSource.next(result);
  }

  /**
   * Validate edges input.
   */
  validateEdgesInput(value: GraphSetRequest) {
    this.validateEdgesInputSource.next(value);
  }

  /**
   * Change edges set validation result.
   */
  changeInputEdgesSetValidationResult(result: SetValidationResult) {
    this.currentInputEdgesSetValidationResultSource.next(result);
  }

  /**
   * Change the input graph set.
   */
  changeInputGraphSet(graphSet: GraphSetRequest) {
    this.inputGraphSetSource.next(graphSet);
  }

  /**
   * Change the input graph set parse result.
   */
  changeInputGraphSetParseResult(result: GraphSetParseResult | null) {
    this.inputGraphSetParseResultSource.next(result);
  }

  /**
   * Generate graph by sets.
   */
  generateGraphBySets(sets: GraphSets) {
    this.generateGraphBySetsSource.next(sets);
  }

  /**
   * Change the output matrix.
   */
  changeOutputMatrix(matrix: GraphMatrix) {
    this.outputMatrixSource.next(matrix);
  }

  /**
   * Notify that the PIXI renderer has been started.
   */
  pixiStarted() {
    this.pixiStartedSource.next(true);
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
   * Change the zoom value (in percentage) for canvas.
   */
  changeZoomTo(percentage: number) {
    this.zoomToChangeSource.next(percentage);
  }

  /**
   * Changed zoom value for canvas.
   */
  changedZoomPercentage(value: number) {
    this.zoomChangedSource.next(value);
  }

  /**
   * Notify that the canvas view needs to be centered.
   */
  needCenterCanvasView() {
    this.needCenterCanvasViewSource.next(true);
  }

  /**
   * Change the force mode disabled state.
   */
  changeForceModeDisabledState(state: boolean) {
    this.forceModeDisabledSource.next(state);
  }

  /**
   * Change force the mode state.
   */
  changeForceModeState(state: boolean) {
    this.forceModeStateSource.next(state);
  }

  /**
   * Notify that the force mode state has been changed.
   */
  forceModeStateChanged() {
    this.forceModeStateChangedSource.next(true);
  }

  /**
   * Change the center force state.
   */
  changeCenterForceState(state: boolean) {
    this.centerForceStateSource.next(state);
  }

  /**
   * Change the link force state.
   */
  changeLinkForceState(state: boolean) {
    this.linkForceStateSource.next(state);
  }

  /**
   * Change the visibility of the float helper.
   */
  changeAlwaysHideFloatHelperState(value: boolean) {
    this.alwaysHideFloatHelperSource.next(value);
  }

  /**
   * Change the current float helper item.
   */
  changeFloatHelperItem(item: FloatHelperItem) {
    this.currentFloatHelperItemSource.next(item);
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

  /**
   * Show the edit edge weight input.
   */
  showEditEdgeWeight(weight: Weight) {
    this.showEditEdgeWeightSource.next(weight);
  }

  /**
   * Change the edge weight.
   */
  changeEdgeWeight(weightToChange: WeightToChange) {
    this.edgeWeightToChangeSource.next(weightToChange);
  }

  /**
   * Notify that the edge weight has been changed for the edge.
   */
  edgeWeightChanged(edgeView: EdgeView) {
    this.edgeWeightChangedSource.next(edgeView);
  }

  /**
   * Get current force mode state.
   */
  isForceModeEnabled(): boolean {
    return ForceMode.isActive;
  }

  isForceModeDisabled(): boolean {
    return this.forceModeDisabledSource.value;
  }
}

export interface WeightToChange {
  weight: Weight;
  changeValue: number;
}
