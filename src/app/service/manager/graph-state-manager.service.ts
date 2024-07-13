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
import {GraphOrientation} from "../../model/orientation";
import {EdgeViewFabricService} from "../fabric/edge-view-fabric.service";

/**
 * Service for managing the state of the graph.
 */
@Injectable({
  providedIn: 'root'
})
export class GraphStateManagerService implements ServiceManager {
  private subscriptions!: Subscription;

  constructor(private stateService: StateService,
              private historyService: HistoryService,
              private graphService: GraphViewService,
              private edgeFabric: EdgeViewFabricService,
              private graphPropertiesService: GraphViewPropertiesService,
              private graphGeneratorService: GraphModelGeneratorService) {
  }

  public initialize(): void {
    this.initSubscriptions();
  }

  initSubscriptions(): void {
    this.subscriptions = new Subscription();
    // Subscribe to state changes
    // Handle edge added event
    this.subscriptions.add(
      this.stateService.edgeAdded$.subscribe(edge => {
        if (edge.weightVisible !== ConfService.SHOW_WEIGHT) {
          edge.changeWeightVisible(ConfService.SHOW_WEIGHT);
        }
        if (this.graphService.edgeViews.has(edge.edge.edgeIndex.reverse()) &&
          this.graphService.currentGraph.orientation === GraphOrientation.ORIENTED) {
          const reverseEdge = this.graphService.edgeViews.get(edge.edge.edgeIndex.reverse())!;
          reverseEdge.offset = edge.offset!;
          reverseEdge.move();
        }
      })
    );
    // Handle edge removed event
    this.subscriptions.add(
      this.stateService.edgeDeleted$.subscribe(edge => {
        if (this.graphService.edgeViews.has(edge.edge.edgeIndex.reverse()) &&
          this.graphService.currentGraph.orientation === GraphOrientation.ORIENTED) {
          const reverseEdge = this.graphService.edgeViews.get(edge.edge.edgeIndex.reverse())!;
          reverseEdge.offset = undefined;
          reverseEdge.move();
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
        const command = new ChangeEdgeWeightCommand(this.graphPropertiesService,
          weightToChange.weight.parent as EdgeView, weightToChange.changeValue);
        this.historyService.execute(command);
      })
    );
    // Generate graph from matrix on UI request
    this.subscriptions.add(
      this.stateService.generateGraphByMatrix$.subscribe((value) => {
        // Generate graph from matrix
        const graph: Graph = this.graphGeneratorService.generateFromMatrix(value);
        // Command saves current graph before generating new one
        const command = new GenerateNewGraphCommand(this.graphService, graph);
        // Execute command
        this.historyService.execute(command);
      })
    );
    // Generate graph from graph sets on UI request
    this.subscriptions.add(
      this.stateService.generateGraphBySets$.subscribe((graphSets) => {
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
        const resolver = new CustomizationResolver(this.graphService,
          this.graphPropertiesService, this.edgeFabric);
        const actions = resolver.resolveGlobal(value);
        const rollbackActions = resolver.resolveGlobalRollback(value);
        const command = new ChangeGraphViewPropertiesCommand(actions, rollbackActions);
        this.historyService.execute(command);
      })
    );
  }

  destroySubscriptions(): void {
    this.subscriptions.unsubscribe();
  }

  destroy() {
    this.destroySubscriptions();
  }
}
