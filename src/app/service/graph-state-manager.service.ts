import {Injectable} from '@angular/core';
import {GraphViewService} from "./graph-view.service";
import {StateService} from "./state.service";
import {EdgeView} from "../model/graphical-model/edge/edge-view";
import {ChangeGraphOrientationCommand} from "../logic/command/change-graph-orientation-command";
import {HistoryService} from "./history.service";
import {GraphMatrixService} from "./graph-matrix.service";
import {TypeMatrix} from "../model/graph-matrix";

/**
 * Service for managing the state of the graph.
 */
@Injectable({
  providedIn: 'root'
})
export class GraphStateManagerService {

  constructor(private stateService: StateService,
              private historyService: HistoryService,
              private graphService: GraphViewService,
              private matrixService: GraphMatrixService) {
    // Subscribe to state changes
    // Change edge weights visibility
    this.stateService.showWeights$.subscribe(showWeights => {
      this.graphService.changeEdgeWeightsVisibility(showWeights);
    });
    // Change edge weights visibility
    this.stateService.edgeAdded$.subscribe(edge => {
      if (edge && edge.weightVisible !== EdgeView.SHOW_WEIGHT) {
        edge.changeWeightVisible(EdgeView.SHOW_WEIGHT);
      }
    });
    // Change graph orientation
    this.stateService.graphOrientation$.subscribe(orientation => {
      if (!this.graphService.currentGraph) {
        return;
      }
      if (orientation === this.graphService.currentGraph.orientation) {
        return;
      }
      const command = new ChangeGraphOrientationCommand(this.graphService, orientation);
      this.historyService.execute(command);
    });
    // Only during developing matrix implementation. TODO CHANGE
    this.stateService.graphChanged$.subscribe(() => {
      this.matrixService.buildMatrixFromGraph(this.graphService.currentGraph, TypeMatrix.ADJACENCY); // Only for testing
    });
  }
}
