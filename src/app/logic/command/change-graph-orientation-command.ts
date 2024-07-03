import {Command} from "./command";
import {GraphViewService} from "../../service/graph/graph-view.service";
import {EdgeView} from "../../model/graphical-model/edge/edge-view";
import {EdgeOrientation, GraphOrientation} from "../../model/orientation";

/**
 * Command for changing the orientation of the graph.
 */
export class ChangeGraphOrientationCommand implements Command {

  private _previousOrientation: GraphOrientation;
  private _edgeOrientations: Map<string, EdgeOrientation> = new Map<string, EdgeOrientation>(); // key is the edge index

  constructor(private graphService: GraphViewService,
              private orientation: GraphOrientation) {
    this._previousOrientation = this.graphService.currentGraph.orientation;
    // if the graph is mixed, save the edge orientations
    if (this._previousOrientation === GraphOrientation.MIXED) {
      this.graphService.edgeViews.forEach((edgeView: EdgeView) => {
        this._edgeOrientations.set(edgeView.getIndex(), edgeView.edge.orientation);
      });
    }
  }
  execute(): void {
    this.graphService.changeGraphOrientation(this.graphService.currentGraphView, this.orientation);
  }

  undo(): void {
    this.graphService.changeGraphOrientation(this.graphService.currentGraphView, this._previousOrientation);
    // Only if the graph is mixed, restore the edge orientations
    if (this._previousOrientation === GraphOrientation.MIXED && this._edgeOrientations.size > 0) {

      this.graphService.edgeViews.forEach((edgeView: EdgeView) => {
        const edgeOrientation = this._edgeOrientations.get(edgeView.getIndex());
        if (edgeOrientation) {
          edgeView.changeEdgeOrientation(edgeOrientation);
        }
      });
    }
  }

  redo(): void {
    this.execute();
  }
}
