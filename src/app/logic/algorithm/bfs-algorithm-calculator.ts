import {AlgorithmCalculator} from "./algorithm-calculator";
import {Node} from "../../model/node";
import {Graph} from "../../model/graph";
import {TraverseGraphResult, TraversePath} from "./dfs-algorithm-calculator";

/**
 * BFS algorithm calculator.
 * Calculates the BFS algorithm.
 */
export class BfsAlgorithmCalculator extends AlgorithmCalculator {
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
   * Perform breadth-first search (BFS) traversal of the graph.
   * @returns {TraverseGraphResult} - The result of the traversal, including the order of visited nodes.
   */
  calculate(): TraverseGraphResult {
    const visited = new Set<Node>();
    const path: TraversePath[] = [];
    const queue: Node[] = [];

    queue.push(this.startNode);
    visited.add(this.startNode);

    while (queue.length > 0) {
      const node = queue.shift() as Node;

      this.graphService.getAdjacentNodes(this.graph, node).forEach(neighbor => {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
          path.push({ firstNode: node.index, secondNode: neighbor.index });
        }
      });
    }

    return {
      startNode: this.startNode.index,
      totalFoundNodes: visited.size,
      path: path
    };
  }
}
