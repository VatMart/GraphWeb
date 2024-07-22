import {Injectable} from '@angular/core';
import {StateService} from "../event/state.service";
import {ServiceManager} from "../../logic/service-manager";
import {Subscription} from "rxjs";
import {Algorithm, AlgorithmType} from "../../model/Algorithm";
import {DialogService, DynamicDialogRef} from "primeng/dynamicdialog";
import {AlgorithmDialogComponent} from "../../component/dialog/algorithm-dialog/algorithm-dialog.component";
import {WebWorkerService} from "../web-worker.service";
import {GraphViewService} from "../graph/graph-view.service";
import {SpinnerDialogComponent} from "../../component/dialog/spinner-dialog/spinner-dialog.component";

/**
 * Service for managing the algorithms.
 */
@Injectable({
  providedIn: 'root'
})
export class AlgorithmManagerService implements ServiceManager {
  private subscriptions!: Subscription;
  private spinnerDialogRef: DynamicDialogRef | undefined; // Reference to the spinner dialog

  constructor(private stateService: StateService,
              private graphService: GraphViewService,
              private dialogService: DialogService,
              private workerService: WebWorkerService) {
  }

  /**
   * Initialize the service.
   */
  initialize() {
    this.initSubscriptions();
  }

  /**
   * Initialize all subscriptions.
   */
  initSubscriptions(): void {
    this.subscriptions = new Subscription();
    // On shortest path request
    this.subscriptions.add(
      this.stateService.shortestPathRequest$.subscribe((request: ShortestPathRequest) => {
        this.onShortestPathRequest(request);
      })
    );
    // On algorithm calculation request
    this.subscriptions.add(
      this.stateService.performAlgorithmCalculation$.subscribe((value: AlgorithmCalculationRequest) => {
        this.onPerformAlgorithmCalculation(value);
      })
    );
    // On algorithm calculation result
    this.subscriptions.add(
      this.stateService.algorithmCalculated$.subscribe((response: AlgorithmCalculationResponse) => {
        this.onAlgorithmCalculationResult(response);
      })
    );
  }

  /**
   * Destroy the service.
   */
  destroy() {
    this.destroySubscriptions();
  }

  /**
   * Destroy all subscriptions.
   */
  destroySubscriptions(): void {
    this.subscriptions.unsubscribe();
  }

  private onShortestPathRequest(request: ShortestPathRequest) {
    this.dialogService.open(AlgorithmDialogComponent, {
      header: 'Start calculating shortest path?',
      contentStyle: {overflow: 'auto'},
      breakpoints: {'960px': '75vw', '640px': '90vw'},
      modal: true,
      dismissableMask: false,
      closable: false,
      data: {
        request: request,
      }
    });
  }

  private onPerformAlgorithmCalculation(value: AlgorithmCalculationRequest) {
    // Serialize the graph to JSON
    const graph = this.graphService.currentGraph.toFullJSON();
    const request: ShortestPathRequest = value as ShortestPathRequest;
    this.showSpinnerDialog(); // Show spinner dialog while calculating algorithm
    // Send the calculation request to the web worker to calculate the algorithm on a separate thread
    this.workerService.sendMessage('algorithm', {graph, request})
      .then((response: any) => { // Successful calculation
        console.log('Algorithm calculation result: ', response); // TODO remove
        this.closeSpinnerDialog();
        this.stateService.algorithmCalculated({
          algorithmType: value.algorithmType,
          algorithm: value.algorithm,
          result: response
        });
      }).catch((error: any) => { // Error while calculating algorithm
      console.error('Error while calculating algorithm: ' + error); // TODO remove
      this.closeSpinnerDialog();
      this.stateService.notifyError('Error while calculating algorithm: ' + error.message);
      this.stateService.resetAlgorithm();
    });
  }

  private onAlgorithmCalculationResult(response: AlgorithmCalculationResponse) {
    this.stateService.resolveAlgorithmAnimation(response); // Notify mode manager to resolve the algorithm animation
    this.stateService.showAnimationToolbar(true);
  }

  private showSpinnerDialog() {
    this.spinnerDialogRef = this.dialogService.open(SpinnerDialogComponent, {
      header: 'Calculating algorithm...',
      contentStyle: {overflow: 'auto'},
      breakpoints: {'960px': '75vw', '640px': '90vw'},
      focusOnShow: false,
      focusTrap: true,
      modal: true,
      dismissableMask: false,
      closable: false,
    });
  }

  private closeSpinnerDialog() {
    if (this.spinnerDialogRef) {
      this.spinnerDialogRef.close();
      this.spinnerDialogRef = undefined;
    }
  }
}

/**
 * Base class for algorithm calculation requests.
 */
export interface AlgorithmCalculationRequest {
  algorithm: Algorithm;
  algorithmType: AlgorithmType;
}

/**
 * Request to perform the shortest path algorithm.
 */
export interface ShortestPathRequest extends AlgorithmCalculationRequest {
  startNodeIndex: number;
  endNodeIndex: number;
}

/**
 * Request to perform the traverse algorithm.
 */
export interface TraverseRequest extends AlgorithmCalculationRequest {
  startNodeIndex: number;
}

// ---------------- Algorithm calculation response ----------------
/**
 * Base class for algorithm calculation responses.
 */
export interface AlgorithmCalculationResponse {
  algorithm: Algorithm;
  algorithmType: AlgorithmType;
  result: any;
}
