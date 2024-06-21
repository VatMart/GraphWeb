import {Command} from "./command";
import {NodeView} from "../../model/graphical-model/node/node-view";
import {Point} from "../../utils/graphical-utils";
import {GraphViewService} from "../../service/graph-view.service";
import {DefaultMode} from "../mode/default-mode";
import {StateService} from "../../service/state.service";

/**
 * Command to change the force mode state.
 */
export class ChangeForceModeCommand implements Command {

  constructor(private graphViewService: GraphViewService,
              private stateService: StateService,
              private defaultMode: DefaultMode,
              private nodePositions: NodePosition[],
              private forceMode: boolean) {
  }
  execute(): void {
    if (this.forceMode) {
      if (!this.stateService.isForceModeDisabled()) {
        this.defaultMode.forceModeOn();
      }
    } else {
      this.defaultMode.forceModeOff();
    }
  }

  undo(): void {
    if (this.forceMode) {
      this.defaultMode.forceModeOff();
      this.nodePositions.forEach(nodePosition => {
        this.graphViewService.moveNodeView(nodePosition.node, nodePosition.position);
      });
    } else if (!this.stateService.isForceModeDisabled()) {
      this.defaultMode.forceModeOn();
    }
  }

  redo(): void {
    this.execute();
  }
}

export class NodePosition {
  node: NodeView;
  position: Point;

  constructor(node: NodeView, position: Point) {
    this.node = node;
    this.position = position;
  }
}
