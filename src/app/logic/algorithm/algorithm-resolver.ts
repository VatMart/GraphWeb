import {Graph} from "../../model/graph";
import {
  AlgorithmCalculationRequest,
  ShortestPathRequest,
  TraverseRequest
} from "../../service/manager/algorithm-manager.service";
import {AlgorithmCalculator} from "./algorithm-calculator";
import {CheckedPath, DijkstraAlgorithmCalculator} from "./dijkstra-algorithm-calculator";
import {Algorithm} from "../../model/Algorithm";
import {DfsAlgorithmCalculator} from "./dfs-algorithm-calculator";
import {BfsAlgorithmCalculator} from "./bfs-algorithm-calculator";

/**
 * Determines the algorithm calculator and performs the calculation.
 */
export class AlgorithmResolver {

  constructor(private graph: Graph,
              private request: AlgorithmCalculationRequest) {
  }

  /**
   * Perform the algorithm calculation.
   */
  performAlgorithmCalculation(): any {
    // Determine the algorithm calculator
    let calculator: AlgorithmCalculator | undefined = undefined;
    switch (this.request.algorithm) {
      case Algorithm.DFS: {
        const traverseRequest = this.request as TraverseRequest;
        calculator = new DfsAlgorithmCalculator(this.graph, traverseRequest.startNodeIndex);
        break;
      }
      case Algorithm.BFS: {
        const traverseRequest = this.request as TraverseRequest;
        calculator = new BfsAlgorithmCalculator(this.graph, traverseRequest.startNodeIndex);
        break;
      }
      case Algorithm.DIJKSTRA: {
        const shortestPathRequest = this.request as ShortestPathRequest;
        calculator = new DijkstraAlgorithmCalculator(this.graph, shortestPathRequest.startNodeIndex,
          shortestPathRequest.endNodeIndex);
        break;
      }
      default:
        throw new Error('Invalid algorithm: ' + this.request.algorithm);
    }
    if (!calculator) {
      throw new Error('Algorithm calculator not found.');
    }
    // Perform the calculation
    return calculator.calculate();
  }
}

/**
 * Shortest path result from the algorithm calculation.
 */
export interface ShortPathResult {
  startNode: number;
  endNode: number;
  distance: number;
  path: number[];
  checkedPaths: CheckedPath[];
}
