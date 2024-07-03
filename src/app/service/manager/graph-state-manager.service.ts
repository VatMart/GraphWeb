import {Injectable} from '@angular/core';
import {GraphViewService} from "../graph/graph-view.service";
import {StateService} from "../event/state.service";
import {EdgeView} from "../../model/graphical-model/edge/edge-view";
import {ChangeGraphOrientationCommand} from "../../logic/command/change-graph-orientation-command";
import {HistoryService} from "../history.service";
import {Subscription} from "rxjs";
import {ChangeEdgeWeightCommand} from "../../logic/command/change-edge-weight-command";
import {ServiceManager} from "../../logic/service-manager";
import {GraphModelGeneratorService} from "../graph/graph-model-generator.service";
import {Graph} from "../../model/graph";
import {GenerateNewGraphCommand} from "../../logic/command/generate-new-graph-command";
import {ConfService} from "../config/conf.service";
import {CustomizationResolver} from "../../logic/customization-resolver";
import {GraphViewPropertiesService} from "../graph/graph-view-properties.service";
import {ChangeGraphViewPropertiesCommand} from "../../logic/command/change-graph-view-properties-command";

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
              private graphPropertiesService: GraphViewPropertiesService,
              private graphGeneratorService: GraphModelGeneratorService) {
    this.initSubscriptions();
  }

  initSubscriptions(): void {
    // Subscribe to state changes
    // Change edge weights visibility
    this.subscriptions.add(
      this.stateService.edgeAdded$.subscribe(edge => {
        if (edge && edge.weightVisible !== ConfService.SHOW_WEIGHT) {
          edge.changeWeightVisible(ConfService.SHOW_WEIGHT);
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
    // Generate graph from graph sets on UI request
    this.subscriptions.add(
      this.stateService.generateGraphBySets$.subscribe((graphSets) => {
        if (graphSets === null) {
          return;
        }
        // Generate graph from sets
        const graph: Graph = this.graphGeneratorService.generateFromSets(graphSets);
        // Command saves current graph before generating new one
        const command = new GenerateNewGraphCommand(this.graphService, graph);
        // Execute command
        this.historyService.execute(command);
      })
    );
    // On customization form apply
    this.subscriptions.add(
      this.stateService.applyCustomization$.subscribe((value) => {
        if (value !== null) {
          // TODO implement
          const resolver = new CustomizationResolver(this.graphService,
            this.graphPropertiesService);
          const actions = resolver.resolve(value);
          const rollbackActions = resolver.resolveRollback(value);
          console.log("Actions: " + actions);
          console.log("Rollback actions: " + rollbackActions);
          const command = new ChangeGraphViewPropertiesCommand(actions, rollbackActions);
          this.historyService.execute(command);
        }
      })
    );
  }

  destroySubscriptions(): void {
    this.subscriptions.unsubscribe();
  }
}
