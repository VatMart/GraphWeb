import {Injectable} from '@angular/core';
import {StateService} from "../event/state.service";
import {ServiceManager} from "../../logic/service-manager";
import {Subscription} from "rxjs";
import {Algorithm, AlgorithmType} from "../../model/Algorithm";
import {DialogService} from "primeng/dynamicdialog";
import {AlgorithmDialogComponent} from "../../component/algorithm-dialog/algorithm-dialog.component";
import {WebWorkerService} from "../web-worker.service";
import {GraphViewService} from "../graph/graph-view.service";

/**
 * Service for managing the algorithms.
 */
@Injectable({
  providedIn: 'root'
})
export class AlgorithmManagerService implements ServiceManager {
  private subscriptions!: Subscription;

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
        console.log("Shortest path request received. ALG: " + request.algorithm);
        this.onShortestPathRequest(request);
      })
    );
    // On algorithm calculation request
    this.subscriptions.add(
      this.stateService.performAlgorithmCalculation$.subscribe((value: AlgorithmCalculationRequest) => {
        const graph = this.graphService.currentGraph.toFullJSON();
        const request: ShortestPathRequest = value as ShortestPathRequest;
        console.log("Algorithm BEFORE start node " + request.startNodeIndex);
        this.workerService.sendMessage('algorithm', {graph, request})
          .then((response: any) => {
            // TODO
          }).catch((error: any) => {
            // TODO
            console.error('Error while calculating algorithm: ' + error);
        });
        // TODO state service. Notify algorithm calculation started (render spinner)
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
