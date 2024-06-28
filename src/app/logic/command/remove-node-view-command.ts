import {GraphViewService} from "../../service/graph/graph-view.service";
import {NodeView} from "../../model/graphical-model/node/node-view";
import {Command} from "./command";
import {EdgeView} from "../../model/graphical-model/edge/edge-view";

/**
 * Command to remove a node from the graph view.
 */
export class RemoveNodeViewCommand implements Command {
  private node: NodeView;
  private graphService: GraphViewService;
  private adjacentEdges: EdgeView[] = [];

  constructor(node: NodeView, graphService: GraphViewService) {
    this.node = node;
    this.graphService = graphService;
    this.adjacentEdges = this.graphService.getAdjacentEdgeViews(this.graphService.currentGraph, this.node);
    console.log(`adjacentEdges: ${this.adjacentEdges.length}`);
  }

  execute(): void {
    this.graphService.removeNodeFromGraphView(this.graphService.currentGraph, this.node);
  }

  undo(): void {
    this.graphService.addNodeToGraphView(this.graphService.currentGraph, this.node);
    this.adjacentEdges.forEach((edge: EdgeView) => {
      this.graphService.addEdgeToGraphView(this.graphService.currentGraph, edge);
    });
  }

  redo(): void {
    this.execute();
  }
}
