import {Command} from "./command";
import {GraphViewPropertiesService} from "../../service/graph/graph-view-properties.service";
import {NodeView} from "../../model/graphical-model/node/node-view";

/**
 * Command to change node label
 */
export class ChangeNodeLabelCommand implements Command {

  private oldLabel: string;

  constructor(private graphPropertiesService: GraphViewPropertiesService,
              private node: NodeView,
              private newLabel: string) {
    this.oldLabel = node.node.label;
  }

  execute(): void {
    this.graphPropertiesService.changeNodeLabel(this.node, this.newLabel);
  }

  undo(): void {
    this.graphPropertiesService.changeNodeLabel(this.node, this.oldLabel);
  }

  redo(): void {
    this.execute();
  }
}
