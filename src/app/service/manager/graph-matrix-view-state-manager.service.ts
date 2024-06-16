import {Injectable} from '@angular/core';
import {StateService} from "../state.service";
import {HistoryService} from "../history.service";
import {GraphViewService} from "../graph-view.service";
import {GraphMatrixService} from "../graph-matrix.service";
import {TypeMatrix} from "../../model/graph-matrix";
import {ServiceManager} from "../../logic/service-manager";
import {Subscription} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class GraphMatrixViewStateManagerService implements ServiceManager {
  private subscriptions: any = new Subscription();

  isMatrixViewVisible: boolean = false;

  currentMatrixType: TypeMatrix = TypeMatrix.ADJACENCY; // TODO Move all default values to the separate file

  constructor(private stateService: StateService,
              private historyService: HistoryService,
              private graphService: GraphViewService,
              private matrixService: GraphMatrixService) {
    this.initSubscriptions();
  }

  initSubscriptions(): void {
    // Subscribe to state changes
    // Matrix view visibility
    this.subscriptions.add(
      this.stateService.matrixViewVisibility$.subscribe(value => {
        if (value === this.isMatrixViewVisible) {
          return;
        }
        this.isMatrixViewVisible = value;
        this.buildAndShowMatrixView(); // if matrix view is visible then build and show matrix
      })
    );
    // Change matrix type on changes in the matrix view
    this.subscriptions.add(
      this.stateService.currentMatrixType$.subscribe(value => {
        if (value !== this.currentMatrixType) {
          this.currentMatrixType = value;
          this.buildAndShowMatrixView();
        }
      })
    );
    // Change matrix type on changes in the graph
    this.subscriptions.add(
      this.stateService.graphChanged$.subscribe(() => { // TODO find a way to optimize this (removing of node will lead to removing of its edges, so it unnecessary will called more than once)
        this.buildAndShowMatrixView();
      })
    );
  }

  destroySubscriptions(): void {
    this.subscriptions.unsubscribe();
  }

  private buildAndShowMatrixView() {
    if (!this.isMatrixViewVisible) {
      return;
    }
    const graphMatrix = this.matrixService.buildMatrixFromGraph(this.graphService.currentGraph,
      this.currentMatrixType);
    this.stateService.changeMatrix(graphMatrix); // Update matrix on view
  }
}
