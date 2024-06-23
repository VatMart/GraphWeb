import {Graph} from "../../model/graph";
import {GraphSet, TypeGraphSet} from "../../model/graph-set";

/**
 * Abstract class for building a graph set.
 */
export abstract class GraphSetBuilder {

  /**
   * Build graph set from string.
   * @param input unchecked string representation of matrix
   */
  abstract buildFromString(input: string): GraphSet;

  /**
   * Build graph set from graph.
   * @param graph graph to be converted
   */
  abstract buildFromGraph(graph: Graph): GraphSet;
}

/**
 * Builder of vertices graphs set.
 */
export class VerticesGraphSetBuilder extends GraphSetBuilder {

  buildFromString(input: string): GraphSet {
    // TODO: implement
    return new GraphSet(TypeGraphSet.VERTICES);
  }

  buildFromGraph(graph: Graph): GraphSet {
    // Get vertices from graph (label or index if label is empty)
    const indexes: string[] = Array.from(graph.getNodes())
      .map(entry => entry[1].label !== '' ? entry[1].label : entry[0].toString());
    return new GraphSet(TypeGraphSet.VERTICES, indexes);
  }
}

/**
 * Builder of edges graphs set.
 */
export class EdgesGraphSetBuilder extends GraphSetBuilder {

    buildFromString(input: string): GraphSet {
      return new GraphSet(TypeGraphSet.EDGES);
    }

    buildFromGraph(graph: Graph): GraphSet {
      // Get edges from graph (label or index if label is empty)
      const edges = Array.from(graph.getEdges())
        .map(entry => entry[1].label !== '' ? entry[1].label : entry[0]);
      return new GraphSet(TypeGraphSet.EDGES, edges);
    }
}
