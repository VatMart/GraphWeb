import {Command} from "./command";
import {NodeView} from "../../model/graphical-model/node/node-view";
import {Point} from "../../utils/graphical-utils";
import {GraphViewService} from "../../service/graph/graph-view.service";
import {DefaultMode} from "../mode/default-mode";
import {StateService} from "../../service/event/state.service";
import {ForceSubmode} from "../mode/force-submode";

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
    console.log("ChangeForceModeCommand execute: ", this.forceMode); // TODO remove
    if (this.forceMode) {
      if (!this.stateService.isForceModeDisabled()) {
        if (this.defaultMode.getSubmodeState() === 'force') {
          this.defaultMode.submodeOn();
          ForceSubmode.activatedByUserMemory = true; // TODO
        }
      }
    } else {
      if (this.defaultMode.getSubmodeState() === 'force') {
        this.defaultMode.submodeOff();
        ForceSubmode.activatedByUserMemory = false; // TODO
      }
    }
  }

  undo(): void {
    if (this.forceMode) {
      if (this.defaultMode.getSubmodeState() === 'force') {
        this.defaultMode.submodeOff();
        ForceSubmode.activatedByUserMemory = false; // TODO
      }
      this.nodePositions.forEach(nodePosition => {
        this.graphViewService.moveNodeView(nodePosition.node, nodePosition.position);
      });
    } else if (!this.stateService.isForceModeDisabled()) {
      if (this.defaultMode.getSubmodeState() === 'force') {
        this.defaultMode.submodeOn();
        ForceSubmode.activatedByUserMemory = true; // TODO
      }
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
