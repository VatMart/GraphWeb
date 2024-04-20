import {NodeView} from "../../model/graphical-model/node-view";
import {GraphViewService} from "../../service/graph-view.service";
import {Command} from "./command";
import {Graph} from "../../model/graph";

export class AddNodeViewCommand implements Command {
  private node: NodeView;
  private graphService: GraphViewService;

  constructor(node: NodeView, graphService: GraphViewService) {
    this.node = node;
    this.graphService = graphService;
  }

  execute(): void {
    this.graphService.addNodeToGraphView(this.graphService.currentGraph, this.node);
  }

  undo(): void {
    this.graphService.removeNodeFromGraphView(this.graphService.currentGraph, this.node);
  }

  redo(): void {
    this.execute();
  }


}
