import {GraphViewService} from "../../service/graph-view.service";
import {Point} from "../../utils/graphical-utils";
import {Command} from "./command";
import {NodeView} from "../../model/graphical-model/node-view";

export class MoveNodeViewCommand implements Command {

  private _oldPosition: Point | undefined;
  private _newPosition: Point | undefined;

  constructor(private nodeView: NodeView,
              private graphViewService: GraphViewService) {
  }

  execute(): void {
    if (this.newPosition !== undefined) {
      this.nodeView.coordinates = this.newPosition;
    }
  }

  undo(): void {
    if (this.oldPosition !== undefined) {
      this.nodeView.coordinates = this.oldPosition;
    }
  }

  redo(): void {
    this.execute();
  }

  get oldPosition(): Point {
    return <Point>this._oldPosition;
  }

  set oldPosition(value: Point) {
    this._oldPosition = value;
  }

  get newPosition(): Point {
    return <Point>this._newPosition;
  }

  set newPosition(value: Point) {
    this._newPosition = value;
  }
}
