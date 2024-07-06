import { Injectable } from '@angular/core';
import {BehaviorSubject, Subject} from "rxjs";
import {ModeState} from "../manager/mode-manager.service";
import {NodeView} from "../../model/graphical-model/node/node-view";
import {EdgeView} from "../../model/graphical-model/edge/edge-view";
import {GraphOrientation} from "../../model/orientation";
import {GraphMatrix, TypeMatrix} from "../../model/graph-matrix";
import {DEFAULT_HELPER_ITEM, FloatHelperItem} from "../../component/canvas/float-helper/float-helper.component";
import {Weight} from "../../model/graphical-model/edge/weight";
import {ForceMode} from "../../logic/mode/force-mode";
import {GraphSet, GraphSets} from "../../model/graph-set";
import {
  MatrixStringInput,
  MatrixParseResult,
  GraphSetRequest, GraphSetParseResult
} from "../../component/tab-nav/input-view/input-view.component";
import {SetValidationResult} from "../graph/graph-set.service";
import {CustomizationFormValues} from "../../component/tab-nav/customization-view/customization-view.component";
import {AppData} from "../file.service";

/**
 * Service for managing the state of the application.
 */
@Injectable({
  providedIn: 'root'
})
export class StateService {

  private resetUiStateSource = new Subject<boolean>();
  public resetUiState$ = this.resetUiStateSource.asObservable();

  // --------------------------------------------------
  // UI component states. Tool bar
  // --------------------------------------------------
  // Can undo and redo
  private canUndoSource = new BehaviorSubject<boolean>(false);
  public canUndo$ = this.canUndoSource.asObservable();
  private canRedoSource = new BehaviorSubject<boolean>(false);
  public canRedo$ = this.canRedoSource.asObservable();

  private undoInvokedSource = new Subject<boolean>();
  public undoInvoked$ = this.undoInvokedSource.asObservable();

  private redoInvokedSource = new Subject<boolean>();
  public redoInvoked$ = this.redoInvokedSource.asObservable();

  private showGridSource = new Subject<boolean>();
  public showGrid$ = this.showGridSource.asObservable();

  // Current mode (default, add vertex, add edges etc.)
  private modeStateSource = new Subject<ModeState>();
  public currentMode$ = this.modeStateSource.asObservable();

  // All modes
  private stateAddVertexSource = new Subject<boolean>();
  public currentAddVertexState = this.stateAddVertexSource.asObservable();
  private stateAddEdgesSource = new Subject<boolean>();
  public currentAddEdgesState = this.stateAddEdgesSource.asObservable();

  private loadAppSource = new Subject<AppData>();
  public loadApp$ = this.loadAppSource.asObservable();

  // --------------------------------------------------
  // UI component states. Nav bar components.
  // --------------------------------------------------
  private closeNavBarMenuSource = new Subject<boolean>();
  public closeNavBarMenu$ = this.closeNavBarMenuSource.asObservable();

  // --------------------------------------------------
  // UI component states. Nav bar components. Output view
  // --------------------------------------------------
  private outputViewVisibilitySource = new Subject<boolean>();
  public outputViewVisibility$ = this.outputViewVisibilitySource.asObservable();

  private outputMatrixTypeSource = new Subject<TypeMatrix>();
  public currentOutputMatrixType$ = this.outputMatrixTypeSource.asObservable();

  private outputMatrixSource = new Subject<GraphMatrix>();
  public currentOutputMatrix$ = this.outputMatrixSource.asObservable();

  private needUpdateOutputMatrixSource = new Subject<boolean>();
  public needUpdateOutputMatrix$ = this.needUpdateOutputMatrixSource.asObservable();

  private verticesGraphSetSource = new Subject<GraphSet>();
  public currentVerticesGraphSet$ = this.verticesGraphSetSource.asObservable();

  private edgesGraphSetSource = new Subject<GraphSet>();
  public currentEdgesGraphSet$ = this.edgesGraphSetSource.asObservable();

  private needUpdateGraphSetSource = new Subject<boolean>();
  public needUpdateGraphSet$ = this.needUpdateGraphSetSource.asObservable();

  // --------------------------------------------------
  // UI component states. Nav bar components. Input view
  // --------------------------------------------------
  private inputMatrixSource = new Subject<MatrixStringInput>();
  public currentMatrixInput$ = this.inputMatrixSource.asObservable();

  private inputMatrixParseResultSource = new Subject<MatrixParseResult>();
  public currentMatrixParseResult$ = this.inputMatrixParseResultSource.asObservable();

  private generateGraphByMatrixSource = new Subject<GraphMatrix>();
  public generateGraphByMatrix$ = this.generateGraphByMatrixSource.asObservable();

  private validateVerticesInputSource = new Subject<string>();
  public validateVerticesInput$ = this.validateVerticesInputSource.asObservable();

  private currentInputVerticesSetValidationResultSource = new Subject<SetValidationResult>();
  public currentInputVerticesSetValidationResult$ = this.currentInputVerticesSetValidationResultSource.asObservable();

  private validateEdgesInputSource = new Subject<GraphSetRequest>();
  public validateEdgesInput$ = this.validateEdgesInputSource.asObservable();

  private currentInputEdgesSetValidationResultSource = new Subject<SetValidationResult>();
  public currentInputEdgesSetValidationResult$ = this.currentInputEdgesSetValidationResultSource.asObservable();

  private inputGraphSetSource = new Subject<GraphSetRequest>();
  public currentInputGraphSet$ = this.inputGraphSetSource.asObservable();

  private inputGraphSetParseResultSource = new Subject<GraphSetParseResult>();
  public currentInputGraphSetParseResult$ = this.inputGraphSetParseResultSource.asObservable();

  private generateGraphBySetsSource = new Subject<GraphSets>();
  public generateGraphBySets$ = this.generateGraphBySetsSource.asObservable();

  // --------------------------------------------------
  // UI component states. Nav bar components. Customization view
  // --------------------------------------------------
  private applyCustomizationSource = new Subject<Partial<CustomizationFormValues>>();
  public applyCustomization$ = this.applyCustomizationSource.asObservable();

  // --------------------------------------------------
  // UI component states. Canvas
  // --------------------------------------------------
  private pixiStartCallSource = new Subject<boolean>();
  public pixiStartCall$ = this.pixiStartCallSource.asObservable();

  private pixiStartedSource = new Subject<boolean>();
  public pixiStarted$ = this.pixiStartedSource.asObservable();

  private pixiStopCallSource = new Subject<boolean>();
  public pixiStopCall$ = this.pixiStopCallSource.asObservable();

  private pixiStoppedSource = new Subject<boolean>();
  public pixiStopped$ = this.pixiStoppedSource.asObservable();

  // Canvas cursor coordinates
  private cursorXSource = new BehaviorSubject<number>(0);
  private cursorYSource = new BehaviorSubject<number>(0);
  public currentCursorX = this.cursorXSource.asObservable();
  public currentCursorY = this.cursorYSource.asObservable();

  private needResizeCanvasSource = new Subject<boolean>();
  public needResizeCanvas$ = this.needResizeCanvasSource.asObservable();

  private rendererResizedSource = new Subject<{width: number, height: number}>();
  public rendererResized$ = this.rendererResizedSource.asObservable();

  private zoomToChangeSource = new Subject<number>();
  public zoomToChange$ = this.zoomToChangeSource.asObservable();

  private zoomChangedSource = new Subject<number>();
  public zoomChanged$ = this.zoomChangedSource.asObservable();

  // --------------------------------------------------
  // UI component states. Canvas Float toolbar
  // --------------------------------------------------

  private needCenterCanvasViewSource = new Subject<boolean>();
  public needCenterCanvasView$ = this.needCenterCanvasViewSource.asObservable();

  private forceModeDisabledSource = new Subject<boolean>();
  public forceModeDisabled$ = this.forceModeDisabledSource.asObservable();

  private forceModeStateSource = new Subject<boolean>();
  public forceModeState$ = this.forceModeStateSource.asObservable();

  private forceModeStateChangedSource = new Subject<boolean>();
  public forceModeStateChanged$ = this.forceModeStateChangedSource.asObservable();

  private centerForceStateSource = new Subject<boolean>();
  public centerForceState$ = this.centerForceStateSource.asObservable();

  private linkForceStateSource = new Subject<boolean>();
  public linkForceState$ = this.linkForceStateSource.asObservable();

  // --------------------------------------------------
  // UI component states. Canvas Float helper
  // --------------------------------------------------
  private alwaysHideFloatHelperSource = new Subject<boolean>();
  public alwaysHideFloatHelper$ = this.alwaysHideFloatHelperSource.asObservable();

  private currentFloatHelperItemSource = new Subject<FloatHelperItem>();
  public currentFloatHelperItem$ = this.currentFloatHelperItemSource.asObservable();

  // --------------------------------------------------
  // Graph elements and graph states
  // --------------------------------------------------
  // Node related events
  private nodeAddedSource = new Subject<NodeView>();
  public nodeAdded$ = this.nodeAddedSource.asObservable();

  private nodeDeletedSource = new Subject<NodeView>();
  public nodeDeleted$ = this.nodeDeletedSource.asObservable();

  // Edge related events
  private edgeAddedSource = new Subject<EdgeView>();
  public edgeAdded$ = this.edgeAddedSource.asObservable();

  private edgeDeletedSource = new Subject<EdgeView>();
  public edgeDeleted$ = this.edgeDeletedSource.asObservable();

  private showEditEdgeWeightSource = new Subject<Weight>();
  public showEditEdgeWeight$ = this.showEditEdgeWeightSource.asObservable();

  private edgeWeightToChangeSource = new Subject<WeightToChange>();
  public edgeWeightToChange$ = this.edgeWeightToChangeSource.asObservable();

  private edgeWeightChangedSource = new Subject<EdgeView>();
  public edgeWeightChanged$ = this.edgeWeightChangedSource.asObservable();

  // Graph related events
  /**
   * State of any changes with graph (added node/edge, deleted node/edge, changed weight, changed orientation etc.).
   * Be careful with this event, if you already subscribed to child events (nodeAdded$, nodeDeleted$ etc.).
   */
  private graphChangedSource = new Subject<boolean>();
  public graphChanged$ = this.graphChangedSource.asObservable();

  private graphClearedSource = new Subject<boolean>();
  public graphCleared$ = this.graphClearedSource.asObservable();

  private graphOrientationSource = new Subject<GraphOrientation>();
  public graphOrientation$ = this.graphOrientationSource.asObservable();

  private graphOrientationChangedSource = new Subject<GraphOrientation>();
  public graphOrientationChanged$ = this.graphOrientationChangedSource.asObservable();

  private graphViewGeneratedSource = new Subject<boolean>();
  public graphViewGenerated$ = this.graphViewGeneratedSource.asObservable();

  constructor() { }

  /**
   * Reset the UI state.
   */
  resetUiState() {
    this.resetUiStateSource.next(true);
  }

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
   * Close the nav bar menu.
   */
  closeSidebarMenu() {
    this.closeNavBarMenuSource.next(true);
  }

  /**
   * Change the visibility of the matrix view.
   */
  changedOutputViewVisibility(value: boolean) {
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
  changeMatrixParseResult(result: MatrixParseResult) {
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
  changeInputGraphSetParseResult(result: GraphSetParseResult) {
    this.inputGraphSetParseResultSource.next(result);
  }

  /**
   * Generate graph by sets.
   */
  generateGraphBySets(sets: GraphSets) {
    this.generateGraphBySetsSource.next(sets);
  }

  /**
   * Apply customization values.
   */
  applyCustomization(values: Partial<CustomizationFormValues>) {
    this.applyCustomizationSource.next(values);
  }

  /**
   * Change the output matrix.
   */
  changeOutputMatrix(matrix: GraphMatrix) {
    this.outputMatrixSource.next(matrix);
  }

  /**
   * Notify that the PIXI renderer needs to be started.
   */
  pixiStartCall() {
    this.pixiStartCallSource.next(true);
  }

  /**
   * Notify that the PIXI renderer has been started.
   */
  pixiStarted() {
    this.pixiStartedSource.next(true);
  }

  /**
   * Notify that the PIXI renderer needs to be stopped.
   */
  pixiStopCall() {
    this.pixiStopCallSource.next(true);
  }

  /**
   * Notify that the PIXI renderer has been stopped.
   */
  pixiStopped() {
    this.pixiStoppedSource.next(true);
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
    this.isForceModeDisabledBool = state;
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
   * Load the application state.
   */
  loadApp(appData: AppData) {
    this.loadAppSource.next(appData);
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

  private isForceModeDisabledBool: boolean = false;

  isForceModeDisabled(): boolean {
    return this.isForceModeDisabledBool;
  }
}

export interface WeightToChange {
  weight: Weight;
  changeValue: number;
}
