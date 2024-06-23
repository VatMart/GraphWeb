import {Injectable} from '@angular/core';
import {ServiceManager} from "../../logic/service-manager";
import {Subscription} from "rxjs";
import {StateService} from "../state.service";
import {GraphViewService} from "../graph-view.service";
import {GraphSetService} from "../graph-set.service";
import {TypeGraphSet} from "../../model/graph-set";

/**
 * Service for managing the graph set view.
 */
@Injectable({
  providedIn: 'root'
})
export class GraphSetViewManagerService implements ServiceManager {
  private subscriptions: any = new Subscription();

  isGraphSetViewVisible: boolean = false;

  constructor(private stateService: StateService,
              private graphSetService: GraphSetService,
              private graphService: GraphViewService) {
    this.initSubscriptions();
  }

  initSubscriptions(): void {
    // Subscribe to state changes
    // Matrix view visibility
    this.subscriptions.add(
      this.stateService.outputViewVisibility$.subscribe(value => {
        if (value === this.isGraphSetViewVisible) {
          return;
        }
        this.isGraphSetViewVisible = value;
        this.buildAndShowGraphSetView(); // if matrix view is visible then build and show matrix
      })
    );
    this.subscriptions.add(
      this.stateService.needUpdateGraphSet$.subscribe((value) => {
        if (value) {
          this.buildAndShowGraphSetView();
        }
      })
    );
  }

  destroySubscriptions(): void {
    this.subscriptions.unsubscribe();
  }

  private buildAndShowGraphSetView() {
    if (!this.isGraphSetViewVisible) {
      return;
    }
    const verticesGraphSet = this.graphSetService.buildGraphSetFromGraph(this.graphService.currentGraph,
      TypeGraphSet.VERTICES);
    const edgesGraphSet = this.graphSetService.buildGraphSetFromGraph(this.graphService.currentGraph,
      TypeGraphSet.EDGES);
    this.stateService.changeVerticesGraphSet(verticesGraphSet); // Update set on view
    this.stateService.changeEdgesGraphSet(edgesGraphSet); // Update set on view
  }
}
