import {Command} from "./command";
import {NodeView} from "../../model/graphical-model/node/node-view";
import {Point} from "../../utils/graphical-utils";
import {GraphViewService} from "../../service/graph-view.service";
import {DefaultMode} from "../mode/default-mode";
import {StateService} from "../../service/state.service";

export class ChangeForceModeCommand implements Command {

  constructor(private graphViewService: GraphViewService,
              private stateService: StateService,
              private defaultMode: DefaultMode,
              private nodePositions: NodePosition[],
              private forceMode: boolean) {
  }
  execute(): void {
    if (this.forceMode) {
      this.defaultMode.forceModeOn();
    } else {
      this.defaultMode.forceModeOff();
    }
    this.stateService.forceModeStateChanged(); // Notify that force mode state has changed
  }

  undo(): void {
    if (this.forceMode) {
      this.defaultMode.forceModeOff();
      this.nodePositions.forEach(nodePosition => {
        this.graphViewService.moveNodeView(nodePosition.node, nodePosition.position);
      });
    } else {
      this.defaultMode.forceModeOn();
    }
    this.stateService.forceModeStateChanged();
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
