import {NodeView} from "../../model/graphical-model/node/node-view";
import {GraphViewService} from "../../service/graph/graph-view.service";
import {Command} from "./command";

/**
 * Command to add a node to the graph view.
 */
export class AddNodeViewCommand implements Command {
  private node: NodeView;
  private graphService: GraphViewService;

  constructor(node: NodeView, graphService: GraphViewService) {
    this.node = node;
    this.graphService = graphService;
  }

  execute(): void {
    this.graphService.addNodeToGraphView(this.graphService.currentGraphView, this.node);
  }

  undo(): void {
    this.graphService.removeNodeFromGraphView(this.graphService.currentGraphView, this.node);
  }

  redo(): void {
    this.execute();
  }
}
