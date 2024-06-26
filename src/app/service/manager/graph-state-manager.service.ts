import {Injectable} from '@angular/core';
import {GraphViewService} from "../graph-view.service";
import {StateService} from "../state.service";
import {EdgeView} from "../../model/graphical-model/edge/edge-view";
import {ChangeGraphOrientationCommand} from "../../logic/command/change-graph-orientation-command";
import {HistoryService} from "../history.service";
import {Subscription} from "rxjs";
import {ChangeEdgeWeightCommand} from "../../logic/command/change-edge-weight-command";
import {ServiceManager} from "../../logic/service-manager";
import {GraphModelGeneratorService} from "../graph-model-generator.service";
import {Graph} from "../../model/graph";
import {GenerateNewGraphCommand} from "../../logic/command/generate-new-graph-command";

/**
 * Service for managing the state of the graph.
 */
@Injectable({
  providedIn: 'root'
})
export class GraphStateManagerService implements ServiceManager {
  // TODO call unsubscribe on destroy app
  private subscriptions: Subscription = new Subscription();

  constructor(private stateService: StateService,
              private historyService: HistoryService,
              private graphService: GraphViewService,
              private graphGeneratorService: GraphModelGeneratorService) {
    this.initSubscriptions();
  }

  initSubscriptions(): void {
    // Subscribe to state changes
    // Change edge weights visibility
    this.subscriptions.add(
      this.stateService.showWeights$.subscribe(showWeights => {
        this.graphService.changeEdgeWeightsVisibility(showWeights);
      })
    );
    // Change edge weights visibility
    this.subscriptions.add(
      this.stateService.edgeAdded$.subscribe(edge => {
        if (edge && edge.weightVisible !== EdgeView.SHOW_WEIGHT) {
          edge.changeWeightVisible(EdgeView.SHOW_WEIGHT);
        }
      })
    );
    // Change graph orientation
    this.subscriptions.add(
      this.stateService.graphOrientation$.subscribe(orientation => {
        if (!this.graphService.currentGraph) {
          return;
        }
        if (orientation === this.graphService.currentGraph.orientation) {
          return;
        }
        const command = new ChangeGraphOrientationCommand(this.graphService, orientation);
        this.historyService.execute(command);
      })
    );
    // Change edge weight
    this.subscriptions.add(
      this.stateService.edgeWeightToChange$.subscribe(weightToChange => {
        if (weightToChange === null) {
          return;
        }
        const command = new ChangeEdgeWeightCommand(this.graphService,
          weightToChange.weight.parent as EdgeView, weightToChange.changeValue);
        this.historyService.execute(command);
      })
    );
    // Generate graph from matrix on UI request
    this.subscriptions.add(
      this.stateService.generateGraphByMatrix$.subscribe((value) => {
        if (value !== null) {
          // Generate graph from matrix
          const graph: Graph = this.graphGeneratorService.generateFromMatrix(value);
          // Command saves current graph before generating new one
          const command = new GenerateNewGraphCommand(this.graphService, graph);
          // Execute command
          this.historyService.execute(command);
        }
      })
    );
  }

  destroySubscriptions(): void {
    this.subscriptions.unsubscribe();
  }
}
