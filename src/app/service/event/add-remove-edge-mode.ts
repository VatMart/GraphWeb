import {ModeBehavior} from "./mode-manager.service";
import {PixiService} from "../pixi.service";
import {GraphViewService} from "../graph-view.service";
import {NodeView} from "../../model/graphical-model/node-view";

export class AddRemoveEdgeMode implements ModeBehavior {
  private static instance: AddRemoveEdgeMode;

  static getInstance() : AddRemoveEdgeMode {
    return this.instance;
  }

  constructor(private pixiService: PixiService,
              private graphViewService: GraphViewService) {
    AddRemoveEdgeMode.instance = this;
  }
  modeOff(): void {
  }

  modeOn(): void {
  }

  onAddedNode(nodeView: NodeView): void {
  }
}
