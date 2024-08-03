import {Injectable} from '@angular/core';
import {BehaviorSubject, Subject} from "rxjs";
import {NodeView} from "../../model/graphical-model/node/node-view";
import {EdgeView} from "../../model/graphical-model/edge/edge-view";
import {GraphOrientation} from "../../model/orientation";
import {GraphMatrix, TypeMatrix} from "../../model/graph-matrix";
import {FloatHelperItem} from "../../component/canvas/float-helper/float-helper.component";
import {Weight} from "../../model/graphical-model/edge/weight";
import {GraphSet, GraphSets} from "../../model/graph-set";
import {
  GraphSetParseResult,
  GraphSetRequest,
  MatrixParseResult,
  MatrixStringInput
} from "../../component/tab-nav/input-view/input-view.component";
import {SetValidationResult} from "../graph/graph-set.service";
import {CustomizationFormValues} from "../../component/tab-nav/customization-view/customization-view.component";
import {AppData} from "../file.service";
import {GraphElement} from "../../model/graphical-model/graph-element";
import {GenerateGraphOptions} from "../../component/tab-nav/generate-view/generate-view.component";
import {ModeState, SubmodeState} from "../../logic/mode/mode";
import {Algorithm} from "../../model/Algorithm";
import {
  AlgorithmCalculationRequest,
  AlgorithmCalculationResponse,
  ShortestPathRequest
} from "../manager/algorithm-manager.service";
import {ExportAsPngRequest} from "../../component/dialog/export-as-png-dialog/export-as-png-dialog.component";

/**
 * Service for managing the state of the application.
 */
@Injectable({
  providedIn: 'root'
})
export class StateService {

  // --------------------------------------------------
  // Global events
  // --------------------------------------------------
  private resetUiStateSource = new Subject<boolean>();
  public resetUiState$ = this.resetUiStateSource.asObservable();

  private notifyErrorSource = new Subject<string>();
  public notifyError$ = this.notifyErrorSource.asObservable();

  private callExportAsPngSource = new Subject<ExportAsPngRequest>();
  public callExportAsPng$ = this.callExportAsPngSource.asObservable();

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

  private callExportAsPngWindowSource = new Subject<boolean>();
  public callExportAsPngWindow$ = this.callExportAsPngWindowSource.asObservable();

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
  // UI component states. Nav bar components. Generate graph view
  // --------------------------------------------------
  private callGenerateGraphWithOptionsSource = new Subject<GenerateGraphOptions>();
  public callGenerateGraphWithOptions$ = this.callGenerateGraphWithOptionsSource.asObservable();

  // --------------------------------------------------
  // UI component states. Canvas
  // --------------------------------------------------
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

  private selectionModeStateSource = new Subject<boolean>();
  public selectionModeState$ = this.selectionModeStateSource.asObservable();

  private forceModeDisabledSource = new Subject<boolean>();
  public forceModeDisabled$ = this.forceModeDisabledSource.asObservable();

  private forceModeStateSource = new Subject<boolean>();
  public forceModeState$ = this.forceModeStateSource.asObservable();

  private restoreForceModeStateSource = new Subject<boolean>();
  public restoreForceModeState$ = this.restoreForceModeStateSource.asObservable();

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
  // UI component states. Canvas Float editor panel
  // --------------------------------------------------
  private elementSelectedSource = new Subject<GraphElement>();
  public elementSelected$ = this.elementSelectedSource.asObservable();

  private elementUnselectedSource = new Subject<GraphElement>();
  public elementUnselected$ = this.elementUnselectedSource.asObservable();

  private selectionClearedSource = new Subject<boolean>();
  public selectionCleared$ = this.selectionClearedSource.asObservable();

  // --------------------------------------------------
  // Graph elements and graph states
  // --------------------------------------------------
  // Node related events
  private nodeAddedSource = new Subject<NodeView>();
  public nodeAdded$ = this.nodeAddedSource.asObservable();

  private beforeNodeDeletedSource = new Subject<NodeView>();
  public beforeNodeDeleted$ = this.beforeNodeDeletedSource.asObservable();

  private nodeDeletedSource = new Subject<NodeView>();
  public nodeDeleted$ = this.nodeDeletedSource.asObservable();

  private nodeStartDraggingSource = new Subject<boolean>();
  public nodeStartDragging$ = this.nodeStartDraggingSource.asObservable();

  private nodeEndDraggingSource = new Subject<boolean>();
  public nodeEndDragging$ = this.nodeEndDraggingSource.asObservable();

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

  // --------------------------------------------------
  // Algorithms related events
  // --------------------------------------------------
  private activateAlgorithmSource = new Subject<Algorithm>();
  public activateAlgorithm$ = this.activateAlgorithmSource.asObservable();

  private changeSubmodeSource = new Subject<SubmodeState>();
  public changeSubmode$ = this.changeSubmodeSource.asObservable();

  private algorithmModeStateChangedSource = new Subject<boolean>();
  public algorithmModeStateChanged$ = this.algorithmModeStateChangedSource.asObservable();

  private canResetAlgorithmSource = new Subject<boolean>();
  public canResetAlgorithm$ = this.canResetAlgorithmSource.asObservable();

  private callResetAlgorithmSource = new Subject<boolean>();
  public callResetAlgorithm$ = this.callResetAlgorithmSource.asObservable();

  private resetAlgorithmSource = new Subject<boolean>();
  public resetAlgorithm$ = this.resetAlgorithmSource.asObservable();

  private performAlgorithmCalculationSource = new Subject<AlgorithmCalculationRequest>();
  public performAlgorithmCalculation$ = this.performAlgorithmCalculationSource.asObservable();

  private algorithmCalculatedSource = new Subject<AlgorithmCalculationResponse>();
  public algorithmCalculated$ = this.algorithmCalculatedSource.asObservable();

  private showAnimationToolbarSource = new Subject<boolean>();
  public showAnimationToolbar$ = this.showAnimationToolbarSource.asObservable();

  private resolveAlgorithmAnimationSource = new Subject<AlgorithmCalculationResponse>();
  public resolveAlgorithmAnimation$ = this.resolveAlgorithmAnimationSource.asObservable();

  private changeAlgorithmCurrentStepSource = new Subject<number>();
  public changeAlgorithmCurrentStep$ = this.changeAlgorithmCurrentStepSource.asObservable();

  private canAlgorithmStepForwardSource = new Subject<boolean>();
  public canAlgorithmStepForward$ = this.canAlgorithmStepForwardSource.asObservable();

  private algorithmAnimationStepForwardSource = new Subject<boolean>();
  public algorithmAnimationStepForward$ = this.algorithmAnimationStepForwardSource.asObservable();

  private canAlgorithmStepBackwardSource = new Subject<boolean>();
  public canAlgorithmStepBackward$ = this.canAlgorithmStepBackwardSource.asObservable();

  private algorithmAnimationStepBackwardSource = new Subject<boolean>();
  public algorithmAnimationStepBackward$ = this.algorithmAnimationStepBackwardSource.asObservable();

  private canAlgorithmGoToStepSource = new Subject<boolean>();
  public canAlgorithmGoToStep$ = this.canAlgorithmGoToStepSource.asObservable();

  private algorithmAnimationGoToStepSource = new Subject<number>();
  public algorithmAnimationGoToStep$ = this.algorithmAnimationGoToStepSource.asObservable();

  private canAlgorithmPlaySource = new Subject<boolean>();
  public canAlgorithmPlay$ = this.canAlgorithmPlaySource.asObservable();

  private algorithmAnimationPlaySource = new Subject<boolean>();
  public algorithmAnimationPlay$ = this.algorithmAnimationPlaySource.asObservable();

  private isAlgorithmPlayingSource = new Subject<boolean>()
  public isAlgorithmPlaying$ = this.isAlgorithmPlayingSource.asObservable();

  private algorithmAnimationPauseSource = new Subject<boolean>();
  public algorithmAnimationPause$ = this.algorithmAnimationPauseSource.asObservable();

  private canAlgorithmChangeSpeedSource = new Subject<boolean>();
  public canAlgorithmChangeSpeed$ = this.canAlgorithmChangeSpeedSource.asObservable();

  private algorithmAnimationChangeSpeedSource = new Subject<number>();
  public algorithmAnimationChangeSpeed$ = this.algorithmAnimationChangeSpeedSource.asObservable();

  // Shortest path algs related
  private shortestPathRequestSource = new Subject<ShortestPathRequest>();
  public shortestPathRequest$ = this.shortestPathRequestSource.asObservable();

  constructor() { }

  /**
   * Notify about error.
   */
  notifyError(message: string) {
    this.notifyErrorSource.next(message);
  }

  /**
   * Call export as PNG.
   */
  callExportAsPng(request: ExportAsPngRequest) {
    this.callExportAsPngSource.next(request);
  }

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
   * Activate the algorithm.
   */
  activateAlgorithm(algorithm: Algorithm) {
    this.activeAlgorithm = algorithm; // Save the active algorithm
    this.activateAlgorithmSource.next(algorithm);
  }

  /**
   * Change the submode state.
   */
  changeSubmode(state: SubmodeState) {
    this.changeSubmodeSource.next(state);
  }

  /**
   * Notify that the state of algorithm mode has been changed.
   */
  algorithmModeEnabled(value: boolean) {
    this.algorithmModeStateChangedSource.next(value);
    this.isAlgModeActiveBool = value; // Save the state
    if (!value) {
      this.activeAlgorithm = undefined; // Clear the active algorithm
    }
  }

  /**
   * Change state of reset algorithm button.
   */
  changeCanResetAlgorithm(state: boolean) {
    this.canResetAlgorithmSource.next(state);
  }

  /**
   * Call reset the algorithm.
   */
  callResetAlgorithm() {
    this.callResetAlgorithmSource.next(true);
  }

  /**
   * Reset the algorithm.
   */
  resetAlgorithm() {
    this.resetAlgorithmSource.next(true);
  }

  /**
   * Perform algorithm calculation.
   */
  performAlgorithmCalculation(request: AlgorithmCalculationRequest) {
    this.performAlgorithmCalculationSource.next(request);
  }

  /**
   * Notify that the algorithm has been calculated.
   */
  algorithmCalculated(response: AlgorithmCalculationResponse) {
    this.algorithmCalculatedSource.next(response);
  }

  /**
   * Show the animation toolbar.
   */
  showAnimationToolbar(value: boolean) {
    this.showAnimationToolbarSource.next(value);
  }

  /**
   * Resolve the algorithm animation.
   */
  resolveAlgorithmAnimation(response: AlgorithmCalculationResponse) {
    this.resolveAlgorithmAnimationSource.next(response);
  }

  /**
   * Change the current step of the algorithm.
   */
  changeAlgorithmCurrentStep(step: number) {
    this.changeAlgorithmCurrentStepSource.next(step);
  }

  /**
   * Change can step forward algorithm state.
   */
  canAlgorithmStepForward(value: boolean) {
    this.canAlgorithmStepForwardSource.next(value);
  }

  /**
   * Step forward in the algorithm animation.
   */
  algorithmAnimationStepForward() {
    this.algorithmAnimationStepForwardSource.next(true);
  }

  /**
   * Change can step backward algorithm state.
   */
  canAlgorithmStepBackward(value: boolean) {
    this.canAlgorithmStepBackwardSource.next(value);
  }

  /**
   * Step backward in the algorithm animation.
   */
  algorithmAnimationStepBackward() {
    this.algorithmAnimationStepBackwardSource.next(true);
  }

  /**
   * Change can go to step algorithm state.
   */
  canAlgorithmGoToStep(value: boolean) {
    this.canAlgorithmGoToStepSource.next(value);
  }

  /**
   * Go to step in the algorithm animation.
   */
  algorithmAnimationGoToStep(step: number) {
    this.algorithmAnimationGoToStepSource.next(step);
  }

  /**
   * Change can play algorithm state.
   */
  canAlgorithmPlay(value: boolean) {
    this.canAlgorithmPlaySource.next(value);
  }

  /**
   * Play the algorithm animation.
   */
  algorithmAnimationPlay() {
    this.algorithmAnimationPlaySource.next(true);
  }

  /**
   * Is algorithm playing
   */
  algorithmPlaying(value: boolean) {
    this.isAlgorithmPlayingSource.next(value);
  }

  /**
   * Pause the algorithm animation.
   */
  algorithmAnimationPause() {
    this.algorithmAnimationPauseSource.next(true);
  }

  /**
   * Change can change speed algorithm state.
   */
  canAlgorithmChangeSpeed(value: boolean) {
    this.canAlgorithmChangeSpeedSource.next(value);
  }

  /**
   * Change the speed of the algorithm animation.
   */
  algorithmAnimationChangeSpeed(speed: number) {
    this.algorithmAnimationChangeSpeedSource.next(speed);
  }

  /**
   * Request to perform the shortest path algorithm.
   */
  requestShortestPath(request: ShortestPathRequest) {
    this.shortestPathRequestSource.next(request);
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
   * Call generate graph with options.
   */
  callGenerateGraphWithOptions(options: GenerateGraphOptions) {
    this.callGenerateGraphWithOptionsSource.next(options);
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
   * Change the selection mode state.
   */
  changeSelectionModeState(state: boolean) {
    this.selectionModeStateSource.next(state);
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
   * Restore force mode state.
   */
  restoreForceModeState(state: boolean) {
    this.restoreForceModeStateSource.next(state);
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
   * Graph element selected.
   */
  elementSelected(element: GraphElement) {
    this.elementSelectedSource.next(element);
  }

  /**
   * Graph element unselected.
   */
  elementUnselected(element: GraphElement) {
    this.elementUnselectedSource.next(element);
  }

  /**
   * Cleared the selection.
   */
  selectionCleared() {
    this.selectionClearedSource.next(true);
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
   * Call export as PNG window.
   */
  callExportAsPngWindow() {
    this.callExportAsPngWindowSource.next(true);
  }

  /**
   * Notify that a node has been added.
   */
  addedNode(nodeView: NodeView) {
    this.nodeAddedSource.next(nodeView);
    this.graphChangedSource.next(true);
  }

  /**
   * Notify that a node is about to be deleted.
   */
  beforeNodeDeleted(nodeView: NodeView) {
    this.beforeNodeDeletedSource.next(nodeView);
  }

  /**
   * Notify that a node has been deleted.
   */
  deletedNode(nodeView: NodeView) {
    this.nodeDeletedSource.next(nodeView);
    this.graphChangedSource.next(true);
  }

  /**
   * Notify that a node is dragging.
   */
  nodeStartDragging(value: boolean) {
    this.nodeStartDraggingSource.next(value);
  }

  /**
   * Notify that a node has been dragged.
   */
  nodeEndDragging(value: boolean) {
    this.nodeEndDraggingSource.next(value);
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

  private isForceModeDisabledBool: boolean = false;

  isForceModeDisabled(): boolean {
    return this.isForceModeDisabledBool;
  }

  private isAlgModeActiveBool: boolean = false;

  isAlgorithmModeActive(): boolean {
    return this.isAlgModeActiveBool;
  }

  private activeAlgorithm: Algorithm | undefined;

  getActiveAlgorithm(): Algorithm | undefined {
    return this.activeAlgorithm;
  }

  private totalAlgorithmSteps: number = 0;

  setTotalAlgorithmSteps(value: number) {
    this.totalAlgorithmSteps = value;
  }

  getTotalAlgorithmSteps(): number {
    return this.totalAlgorithmSteps;
  }
}

export interface WeightToChange {
  weight: Weight;
  changeValue: number;
}
