import {Command} from "./command";
import {GraphViewService} from "../../service/graph-view.service";
import {EdgeView} from "../../model/graphical-model/edge-view";

/**
 * Command to add an edge to the graph view.
 */
export class AddEdgeViewCommand implements Command {

  constructor(private graphService: GraphViewService,
              private edge: EdgeView) {
  }

  execute(): void {
    this.graphService.addEdgeToGraphView(this.graphService.currentGraph, this.edge);
  }

  undo(): void {
    this.graphService.removeEdgeFromGraphView(this.graphService.currentGraph, this.edge);
  }

  redo(): void {
    this.execute();
  }
}
