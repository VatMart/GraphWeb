import {Command} from "./command";
import {GraphViewService} from "../../service/graph/graph-view.service";
import {NodeView} from "../../model/graphical-model/node/node-view";
import {EdgeView} from "../../model/graphical-model/edge/edge-view";

/**
 * Command to clear the graph view.
 */
export class ClearGraphViewCommand implements Command {

  private nodes: NodeView[];
  private edges: EdgeView[];

  constructor(private graphService: GraphViewService) {
    this.nodes = Array.from(this.graphService.nodeViews.values());
    this.edges = Array.from(this.graphService.edgeViews.values());
  }

  execute(): void {
    this.graphService.clearAllElementsView(this.graphService.currentGraph);
  }

  undo(): void {
    this.graphService.populateGraphView(this.graphService.currentGraph, this.nodes, this.edges)
  }

  redo(): void {
    this.execute();
  }

}
