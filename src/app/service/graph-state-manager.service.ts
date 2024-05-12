import { Injectable } from '@angular/core';
import {GraphViewService} from "./graph-view.service";
import {StateService} from "./state.service";
import {EdgeView} from "../model/graphical-model/edge/edge-view";

/**
 * Service for managing the state of the graph.
 */
@Injectable({
  providedIn: 'root'
})
export class GraphStateManagerService {

  constructor(private stateService: StateService,
              private graphService: GraphViewService) {
    this.stateService.showWeights$.subscribe(showWeights => {
      this.graphService.changeEdgeWeightsVisibility(showWeights);
    });
    this.stateService.edgeAdded$.subscribe(edge => {
      if (edge && edge.weightVisible !== EdgeView.SHOW_WEIGHT) {
        edge.changeWeightVisible(EdgeView.SHOW_WEIGHT);
      }
    });
  }
}
