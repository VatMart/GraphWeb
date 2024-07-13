import {Graph} from "../../model/graph";
import {GraphSet, TypeGraphSet} from "../../model/graph-set";

/**
 * Abstract class for building a graph set.
 */
export abstract class GraphSetBuilder {

  /**
   * Build graph set from string.
   * Input string should be validated before calling this method.
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
    const vertices = this.parseQuotedStrings(input)
      .map(vertex => vertex.replaceAll('\'', ''));
    const sortedVertices = vertices.sort(this.customSort);
    return new GraphSet(TypeGraphSet.VERTICES, sortedVertices);
  }

  private parseQuotedStrings(input: string): string[] {
    const regex = /(?:[^\s']+|'[^']*')+/g;
    return input.match(regex) || [];
  }

  buildFromGraph(graph: Graph): GraphSet {
    // Get vertices from graph (label or index if label is empty)
    const indexes: string[] = Array.from(graph.getNodes())
      .map(entry => entry[1].label !== '' ? ('\'' + entry[1].label + '\'') : entry[0].toString());
    return new GraphSet(TypeGraphSet.VERTICES, indexes);
  }

  private customSort(a: string, b: string): number {
    const numA = Number(a);
    const numB = Number(b);

    const isNumA = !isNaN(numA);
    const isNumB = !isNaN(numB);

    if (isNumA && isNumB) {
      return numA - numB;
    }

    if (isNumA) {
      return -1;
    }

    if (isNumB) {
      return 1;
    }

    return a.localeCompare(b);
  }
}

/**
 * Builder of edges graphs set.
 */
export class EdgesGraphSetBuilder extends GraphSetBuilder {

    buildFromString(input: string): GraphSet {
      const edges = this.parseQuotedStrings(input);
      return new GraphSet(TypeGraphSet.EDGES,
        edges.map(edge => edge.replaceAll('\'' , '')));
    }

    buildFromGraph(graph: Graph): GraphSet {
      // Get edges from graph (label or index if label is empty)
      const edges = Array.from(graph.getEdges())
        .map(entry => {
          const edge = entry[1];
          const firstNode = edge.firstNode;
          const secondNode = edge.secondNode
          const firstNodeLabel = firstNode.label !== '' ? ('\'' + firstNode.label + '\'') :
            firstNode.index.toString();
          const secondNodeLabel = secondNode.label !== '' ? ('\'' + secondNode.label + '\'') :
            secondNode.index.toString();
          return `${firstNodeLabel}-${secondNodeLabel}`;
        });
      return new GraphSet(TypeGraphSet.EDGES, edges);
    }

  private parseQuotedStrings(input: string): string[] {
    const regex = /(?:[^\s']+|'[^']*')+/g;
    return input.match(regex) || [];
  }
}
