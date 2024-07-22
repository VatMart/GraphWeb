import {
  AlgorithmCalculationRequest,
  ShortestPathRequest,
  TraverseRequest
} from "../service/manager/algorithm-manager.service";
import {AlgorithmType} from "../model/Algorithm";

/**
 * Get the calculation request type.
 * @param request the calculation request
 */
export function getCalculationRequestType(request: AlgorithmCalculationRequest): ShortestPathRequest | TraverseRequest {
  switch (request.algorithmType) {
    case AlgorithmType.SHORTEST_PATH:
      return request as ShortestPathRequest;
    case AlgorithmType.TRAVERSE:
      return request as TraverseRequest;
    default:
      throw new Error('Invalid algorithm type: ' + request.algorithmType);
  }
}
