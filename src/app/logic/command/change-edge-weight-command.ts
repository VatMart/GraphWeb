import {Command} from "./command";
import {GraphViewService} from "../../service/graph/graph-view.service";
import {EdgeView} from "../../model/graphical-model/edge/edge-view";
import {GraphViewPropertiesService} from "../../service/graph/graph-view-properties.service";

/**
 * Change edge weight command.
 */
export class ChangeEdgeWeightCommand implements Command {
  private previousWeight: number;

  constructor(private propertyService: GraphViewPropertiesService,
              private edgeView: EdgeView,
              private newWeight: number) {
    this.previousWeight = edgeView.edge.weight;
  }

  execute(): void {
    this.propertyService.changeEdgeViewWeight(this.edgeView, this.newWeight);
  }

  undo(): void {
    this.propertyService.changeEdgeViewWeight(this.edgeView, this.previousWeight);
  }

  redo(): void {
    this.execute();
  }
}
