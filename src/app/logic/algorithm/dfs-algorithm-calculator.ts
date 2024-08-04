import {AlgorithmCalculator} from "./algorithm-calculator";
import {Node} from "../../model/node";
import {Graph} from "../../model/graph";

/**
 * DFS algorithm calculator.
 * Calculates the DFS algorithm.
 */
export class DfsAlgorithmCalculator extends AlgorithmCalculator {
  private startNode: Node;

  constructor(private graph: Graph,
              startNode: number) {
    super();
    this.startNode = this.graph.getNodes().get(startNode) as Node;
    if (!this.startNode) {
      throw new Error('Invalid start node index: ' + startNode); // TODO wrap in custom error
    }
  }

  /**
   * Perform depth-first search (DFS) traversal of the graph.
   * @returns {TraverseGraphResult} - The result of the traversal, including the order of visited nodes.
   */
  calculate(): TraverseGraphResult {
    const visited = new Set<Node>();
    const path: TraversePath[] = [];

    this.dfs(this.startNode, visited, path);

    return {
      startNode: this.startNode.index,
      totalFoundNodes: visited.size,
      path: path
    };
  }

  /**
   * Recursive DFS function.
   * @param {Node} node - The current node being visited.
   * @param {Set<Node>} visited - The set of visited nodes.
   * @param {number[]} path - The order of visited nodes.
   */
  private dfs(node: Node, visited: Set<Node>, path: TraversePath[]): void {
    visited.add(node);

    this.graphService.getAdjacentNodes(this.graph, node).forEach(neighbor => {
      if (!visited.has(neighbor)) {
        path.push({firstNode: node.index, secondNode: neighbor.index});
        this.dfs(neighbor, visited, path);
      }
    });
  }
}

export interface TraverseGraphResult {
  startNode: number;
  totalFoundNodes: number;
  path: TraversePath[]; // indexes of nodes in order of visiting
}

export interface TraversePath {
  firstNode: number;
  secondNode: number;
}
