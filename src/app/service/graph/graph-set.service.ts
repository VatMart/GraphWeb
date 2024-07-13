import {Injectable} from '@angular/core';
import {Graph} from "../../model/graph";
import {GraphSet, TypeGraphSet} from "../../model/graph-set";
import {EdgesGraphSetBuilder, GraphSetBuilder, VerticesGraphSetBuilder} from "../../logic/set/graph-set-builder";
import {ValidationError} from "../../error/validation-error";
import {GraphSetRequest} from "../../component/tab-nav/input-view/input-view.component";

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
   * Input string should be validated before calling this method.
   */
  public buildGraphSetFromString(input: string, typeGraphSet: TypeGraphSet): GraphSet {
    const builder = this.getBuilder(typeGraphSet);
    return builder.buildFromString(input);
  }

  private getBuilder(typeGraphSet: TypeGraphSet): GraphSetBuilder {
    if (typeGraphSet === TypeGraphSet.VERTICES) {
      //console.log("Building vertices set"); // TODO remove
      return new VerticesGraphSetBuilder();
    } else if (typeGraphSet === TypeGraphSet.EDGES) {
      //console.log("Building edges set"); // TODO remove
      return new EdgesGraphSetBuilder();
    }
    throw new Error("Set type not supported: " + typeGraphSet); // TODO change
  }

  /**
   * Validate vertices set string.
   * @param input string representation of vertices set
   */
  validateVerticesSet(input: string): SetValidationResult {
    if (!input || input.trim().length === 0) {
      return {isValid: false, message: "Input string cannot be empty."};
    }
    // Normalize the input: replace all possible separators with a single one
    const normalizedInput = input
      .replace(/[,;\n]/g, ' ')    // Replace commas, semicolons, and newlines with spaces
      .replace(/\s+/g, ' ');      // Replace multiple spaces with a single space

    // Split the input by spaces, considering quoted labels
    const values = normalizedInput.match(/(?:[^\s']+|'[^']*')+/g) || [];
    const vertices = new Set<number | string>();
    for (let i = 0; i < values.length; i++) {
      const vertex = values[i];
      if (vertex.trim().length === 0) {
        continue;
      }
      if (vertices.has(vertex)) {
        return {isValid: false, message: "Vertices set contains duplicates.", value: vertex};
      }
      vertices.add(vertex);
    }
    return {isValid: true, value: Array.from(vertices).join(' ')};
  }

  /**
   * Validate edges set string.
   * @param input request for validation
   */
  validateEdgesSet(input: GraphSetRequest): SetValidationResult {
    const edgeInput = input.edgeSetInput;
    const verticesInput = input.verticesSetInput;
    if (!edgeInput || edgeInput.trim().length === 0) {
      return {isValid: true, value: edgeInput};
    }
    // Normalize the input: replace all possible separators with a single one
    const normalizedInput = edgeInput
      .replace(/\n/g, '')
      .replace(/[,;]/g, ';')    // Replace commas, semicolons, and newlines with spaces
      .replace(/\s+/g, ' ');      // Replace multiple spaces with a single space
    const values = normalizedInput.trim().split(';');
    const edges = new Set<string>();
    for (let i = 0; i < values.length; i++) {
      const edge = values[i];
      if (edge.trim().length === 0) {
        continue;
      }
      const verticesIds = edge.split('-'); // Split edge into two vertices
      console.log("Vertices: " + verticesIds[1]); // TODO remove
      if (verticesIds.length !== 2 || verticesIds[0].trim().length === 0 || verticesIds[1].trim().length === 0){
        return {isValid: false, message: "Invalid edge format: '" + edge + "'. Expected format: 'vertexId1-vertexId2'"};
      }
      const vertex1 = verticesIds[0];
      const vertex2 = verticesIds[1];
      if (!verticesInput.includes(vertex1) && !verticesInput.includes(vertex2)) {
        return {isValid: false, message: "Edge contains vertex not present in the vertices set. Edge: '" + edge + "'" +
            ", vertex1: '" + vertex1 + "', vertex2: '" + vertex2 + "'"};
      }
      if (edges.has(edge)) {
        return {isValid: false, message: "Edges set contains duplicates.", value: edge};
      }
      edges.add(edge);
    }
    return {isValid: true, value: values.join(' ')};
  }
}

export interface SetValidationResult {
  isValid: boolean;
  message?: string;
  value?: string;
}
