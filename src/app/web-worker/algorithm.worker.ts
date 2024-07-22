import {Graph} from "../model/graph";
import {AlgorithmResolver} from "../logic/algorithm/algorithm-resolver";

/**
 * Web worker for calculating the algorithms.
 */
addEventListener('message', ({ data }) => {
  try {
    if (data.request && data.request.algorithm && data.graph) {
      const graph: Graph = Graph.fromFullJSON(data.graph);
      const resolver = new AlgorithmResolver(graph, data.request);
      const result = resolver.performAlgorithmCalculation();
      postMessage({ type: 'result', result: result });
    } else {
      throw new Error('Invalid algorithm message data.');
    }
  } catch (error: any) { // TODO specify the error type
    postMessage({ type: 'error', message: error.message });
  }
});
