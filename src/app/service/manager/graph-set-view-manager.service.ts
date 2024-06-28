import {Injectable} from '@angular/core';
import {ServiceManager} from "../../logic/service-manager";
import {Subscription} from "rxjs";
import {StateService} from "../event/state.service";
import {GraphViewService} from "../graph/graph-view.service";
import {GraphSetService, SetValidationResult} from "../graph/graph-set.service";
import {TypeGraphSet} from "../../model/graph-set";
import {GraphSetRequest} from "../../component/tab-nav/input-view/input-view.component";
import {ValidationError} from "../../error/validation-error";

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
    // Validate vertices set
    this.subscriptions.add(
      this.stateService.validateVerticesInput$.subscribe((input) => {
        if (input !== null) {
          this.validateVerticesSet(input);
        }
      })
    );
    // Validate edges set
    this.subscriptions.add(
      this.stateService.validateEdgesInput$.subscribe((input) => {
        if (input !== null) {
          this.validateEdgesSet(input);
        }
      })
    );
    // Validate and build matrix on UI request
    this.subscriptions.add(
      this.stateService.currentInputGraphSet$.subscribe(value => {
        if (value !== null) {
          // Validate
          const verticesResult = this.graphSetService.validateVerticesSet(value.verticesSetInput);
          const edgesResult = this.graphSetService.validateEdgesSet(value);
          if (verticesResult.isValid && edgesResult.isValid) { // Build if valid
            const verticesSet = this.graphSetService.buildGraphSetFromString(verticesResult.value!,
              TypeGraphSet.VERTICES);
            const edgesSet = this.graphSetService.buildGraphSetFromString(edgesResult.value!,
              TypeGraphSet.EDGES);
            this.stateService.changeInputGraphSetParseResult({
              valid: true, vertices: verticesSet,
              edges: edgesSet
            });
          } else {
            let error: SetValidationResult[] = [];
            if (!verticesResult.isValid) {
              error.push(verticesResult)
            }
            if (!edgesResult.isValid) {
              error.push(edgesResult)
            }
            this.stateService.changeInputGraphSetParseResult({valid: false, error: error})
          }
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

  private validateVerticesSet(input: string) {
    const result = this.graphSetService.validateVerticesSet(input);
    this.stateService.changeInputVerticesSetValidationResult(result);
  }

  private validateEdgesSet(input: GraphSetRequest) {
    const result = this.graphSetService.validateEdgesSet(input);
    this.stateService.changeInputEdgesSetValidationResult(result);
  }
}
