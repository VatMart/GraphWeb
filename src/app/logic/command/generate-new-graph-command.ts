import {Command} from "./command";
import {NodeView} from "../../model/graphical-model/node/node-view";
import {EdgeView} from "../../model/graphical-model/edge/edge-view";
import {GraphViewService} from "../../service/graph/graph-view.service";
import {Graph} from "../../model/graph";
import {GraphOrientation} from "../../model/orientation";

/**
 * Command to generate new graph.
 */
export class GenerateNewGraphCommand implements Command {
  // Save graph elements before executing command
  private nodes: NodeView[];
  private edges: EdgeView[];
  private oldGraphOrientation: GraphOrientation;
  private newGraphCopy: Graph;

  constructor(private graphService: GraphViewService,
              private newGraph: Graph) {
    this.nodes = Array.from(this.graphService.nodeViews.values());
    this.edges = Array.from(this.graphService.edgeViews.values());
    this.oldGraphOrientation = this.graphService.currentGraph.orientation;
    this.newGraphCopy = this.newGraph.clone();
  }

  execute(): void {
    this.graphService.generateGraphView(this.newGraph);
  }

  undo(): void {
    this.graphService.clearAllElementsView(this.newGraph);
    if (this.oldGraphOrientation !== this.newGraph.orientation) { // restore old graph orientation
      this.graphService.changeGraphOrientation(this.graphService.currentGraph, this.oldGraphOrientation);
    }
    this.graphService.populateGraphView(this.graphService.currentGraph, this.nodes, this.edges);
  }

  redo(): void {
    console.log("OnRedo: " +this.newGraph);
    this.newGraph = this.newGraphCopy.clone();
    this.execute();
  }
}
