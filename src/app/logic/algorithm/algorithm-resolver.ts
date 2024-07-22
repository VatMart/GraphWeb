import {Graph} from "../../model/graph";
import {AlgorithmCalculationRequest, ShortestPathRequest} from "../../service/manager/algorithm-manager.service";
import {AlgorithmCalculator} from "./algorithm-calculator";
import {DijkstraAlgorithmCalculator} from "./dijkstra-algorithm-calculator";
import {Algorithm} from "../../model/Algorithm";

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
      case Algorithm.DFS: // TODO
        break;
      case Algorithm.BFS: // TODO
        break;
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
