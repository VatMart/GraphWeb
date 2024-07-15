import {GraphViewGenerator, NodeViewPosition} from "./graph-view-generator";
import {Graph} from "../../model/graph";
import {NodeView} from "../../model/graphical-model/node/node-view";
import {EdgeView} from "../../model/graphical-model/edge/edge-view";
import {PixiService} from "../../service/pixi.service";
import {NodeViewFabricService} from "../../service/fabric/node-view-fabric.service";
import {EdgeViewFabricService} from "../../service/fabric/edge-view-fabric.service";

/**
 * Tree graph view generator.
 * Generate graph view elements for tree graph with considering appropriate position generation for tree graph.
 */
export class TreeGraphViewGenerator extends GraphViewGenerator {

  constructor(private pixiService: PixiService,
              private nodeFabric: NodeViewFabricService,
              private edgeFabric: EdgeViewFabricService) {
    super();
  }

  calculateNodesPositions(graph: Graph): NodeViewPosition[] {
    // TODO
    return [];
  }

  generateGraphViewElements(graph: Graph): { nodes: NodeView[]; edges: EdgeView[] } {
    // TODO
    return {edges: [], nodes: []};
  }
}
