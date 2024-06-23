import {Injectable} from '@angular/core';
import {Graph} from "../model/graph";
import {GraphSet, TypeGraphSet} from "../model/graph-set";
import {EdgesGraphSetBuilder, GraphSetBuilder, VerticesGraphSetBuilder} from "../logic/set/graph-set-builder";

/**
 * Service for managing the graph set (vertices and edges set).
 */
@Injectable({
  providedIn: 'root'
})
export class GraphSetService {

  constructor() { }

  /**
   * Build graph set from graph.
   */
  public buildGraphSetFromGraph(graph: Graph, typeGraphSet: TypeGraphSet): GraphSet {
    const builder = this.getBuilder(typeGraphSet);
    return builder.buildFromGraph(graph);
  }

  /**
   * Build graph set from string.
   */
  public buildGraphSetFromString(input: string, typeGraphSet: TypeGraphSet): GraphSet {
    // TODO implement
    const builder = this.getBuilder(typeGraphSet);
    return builder.buildFromString(input);
  }

  private getBuilder(typeGraphSet: TypeGraphSet): GraphSetBuilder {
    if (typeGraphSet === TypeGraphSet.VERTICES) {
      console.log("Building vertices set"); // TODO remove
      return new VerticesGraphSetBuilder();
    } else if (typeGraphSet === TypeGraphSet.EDGES) {
      console.log("Building edges set"); // TODO remove
      return new EdgesGraphSetBuilder();
    }
    throw new Error("Set type not supported: " + typeGraphSet); // TODO change
  }
}
