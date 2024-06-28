import {Injectable} from '@angular/core';
import {GraphMatrix} from "../../model/graph-matrix";
import {GraphModelBuilder} from "../../logic/graph-model-builder";
import {Graph} from "../../model/graph";
import {GraphModelService} from "./graph-model.service";
import {GraphSets} from "../../model/graph-set";

/**
 * Service for generating graph model from different inputs.
 * This service does not create view objects. For those purposes
 * use GraphViewGenerator.
 */
@Injectable({
  providedIn: 'root'
})
export class GraphModelGeneratorService {

  private graphBuilder: GraphModelBuilder;

  constructor(private graphService: GraphModelService) {
    this.graphBuilder = new GraphModelBuilder(this.graphService);
  }

  /**
   * Generate graph from matrix.
   * Matrix should be already validated.
   * @param graphMatrix
   */
  public generateFromMatrix(graphMatrix: GraphMatrix): Graph {
    return this.graphBuilder.buildGraphFromMatrix(graphMatrix);
  }

  /**
   * Generate graph from vertices and edges sets.
   * @param graphSets vertices and edges sets
   */
  public generateFromSets(graphSets: GraphSets) {
    return this.graphBuilder.buildGraphFromSets(graphSets);
  }
}
