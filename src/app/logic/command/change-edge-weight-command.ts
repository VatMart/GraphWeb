import {Command} from "./command";
import {GraphViewService} from "../../service/graph/graph-view.service";
import {EdgeView} from "../../model/graphical-model/edge/edge-view";

/**
 * Change edge weight command.
 */
export class ChangeEdgeWeightCommand implements Command {
  private previousWeight: number;

  constructor(private graphService: GraphViewService,
              private edgeView: EdgeView, private newWeight: number) {
    this.previousWeight = edgeView.edge.weight;
  }

  execute(): void {
    this.graphService.changeEdgeViewWeight(this.edgeView, this.newWeight);
  }

  undo(): void {
    this.graphService.changeEdgeViewWeight(this.edgeView, this.previousWeight);
  }

  redo(): void {
    this.execute();
  }
}
