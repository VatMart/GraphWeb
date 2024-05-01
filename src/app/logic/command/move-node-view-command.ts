import {Point} from "../../utils/graphical-utils";
import {Command} from "./command";
import {NodeView} from "../../model/graphical-model/node-view";
import {GraphViewService} from "../../service/graph-view.service";

/**
 * Command to move a node view.
 */
export class MoveNodeViewCommand implements Command {

  constructor(private graphViewService: GraphViewService,
              private selectedNodes: NodeMove[]) {
  }

  execute(): void {
    this.selectedNodes.forEach(nodeMove => {
      if (nodeMove.newPosition) {
        this.graphViewService.moveNodeView(nodeMove.node, nodeMove.newPosition);
      }
    });
  }

  undo(): void {
    this.selectedNodes.forEach(nodeMove => {
      this.graphViewService.moveNodeView(nodeMove.node, nodeMove.oldPosition);
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
