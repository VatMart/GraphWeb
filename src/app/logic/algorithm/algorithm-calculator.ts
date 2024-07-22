import {GraphModelService} from "../../service/graph/graph-model.service";

/**
 * Base class for all algorithm calculators.
 * Should be extended by all algorithm calculators.
 */
export abstract class AlgorithmCalculator {

  protected graphService: GraphModelService;
  protected constructor() {
    this.graphService = new GraphModelService();
  }

  /**
   * Perform the algorithm calculation.
   * @returns the result of the calculation
   */
  public abstract calculate(): any;
}
