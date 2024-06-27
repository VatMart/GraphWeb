import {Injectable} from '@angular/core';
import {StateService} from "../state.service";
import {HistoryService} from "../history.service";
import {GraphViewService} from "../graph-view.service";
import {GraphMatrixService} from "../graph-matrix.service";
import {TypeMatrix} from "../../model/graph-matrix";
import {ServiceManager} from "../../logic/service-manager";
import {Subscription} from "rxjs";
import {ValidationError} from "../../error/validation-error";

/**
 * Service for managing the graph matrix view.
 */
@Injectable({
  providedIn: 'root'
})
export class GraphMatrixViewStateManagerService implements ServiceManager {
  private subscriptions: any = new Subscription();

  isMatrixViewVisible: boolean = false;

  currentOutputMatrixType: TypeMatrix = TypeMatrix.ADJACENCY; // TODO Move all default values to the separate file

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
      this.stateService.outputViewVisibility$.subscribe(value => {
        if (value === this.isMatrixViewVisible) {
          return;
        }
        // If matrix view is visible then build and show matrix
        this.isMatrixViewVisible = value;
        if (this.graphService.currentGraph.getNodes().size <= 50) { // Do not show huge matrix on ui load
          this.buildAndShowMatrixView();
        }
      })
    );
    // Change matrix type on changes in the matrix view
    this.subscriptions.add(
      this.stateService.currentOutputMatrixType$.subscribe(value => {
        if (value !== this.currentOutputMatrixType) {
          this.currentOutputMatrixType = value;
          this.buildAndShowMatrixView();
        }
      })
    );
    // Change matrix type on UI request
    this.subscriptions.add(
      this.stateService.needUpdateOutputMatrix$.subscribe(() => {
        this.buildAndShowMatrixView();
      })
    );
    // Verify string and build matrix on UI request
    this.subscriptions.add(
      this.stateService.currentMatrixInput$.subscribe(value => {
        if (value !== null) {
          try {
            const graphMatrix = this.matrixService.buildMatrixFromString(value.value, value.matrixType);
            this.stateService.changeMatrixParseResult({valid: true, value: graphMatrix});
          } catch (e) { // Matrix input is invalid
            if (e instanceof ValidationError) {
              this.stateService.changeMatrixParseResult({valid: false, message: e.message});
            }
          }
        }
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
      this.currentOutputMatrixType);
    this.stateService.changeOutputMatrix(graphMatrix); // Update matrix on view
  }
}
