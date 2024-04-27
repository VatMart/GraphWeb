import {Point} from "../../utils/graphical-utils";
import {Command} from "./command";
import {NodeView} from "../../model/graphical-model/node-view";

export class MoveNodeViewCommand implements Command {

  constructor(private selectedNodes: NodeMove[]) {
  }

  execute(): void {
    this.selectedNodes.forEach(nodeMove => {
      if (nodeMove.newPosition) {
        nodeMove.node.coordinates = nodeMove.newPosition;
      }
    });
  }

  undo(): void {
    this.selectedNodes.forEach(nodeMove => {
      nodeMove.node.coordinates = nodeMove.oldPosition;
    });
  }

  redo(): void {
    this.execute();
  }
}

export class NodeMove {
  node: NodeView;
  oldPosition: Point;
  offset: Point;

  private _newPosition: Point | undefined;

  constructor(node: NodeView, oldPosition: Point, offset: Point) {
    this.node = node;
    this.oldPosition = oldPosition;
    this.offset = offset;
  }

  set newPosition(value: Point | undefined) {
    this._newPosition = value;
  }

  get newPosition(): Point | undefined {
    return <Point>this._newPosition;
  }
}
