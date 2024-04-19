import {ModeBehavior} from "./mode-manager.service";
import {PixiService} from "../pixi.service";
import {GraphViewService} from "../graph-view.service";
import {NodeView} from "../../model/graphical-model/node-view";
import {EventBusService} from "./event-bus.service";

export class AddRemoveEdgeMode implements ModeBehavior {

  constructor(private pixiService: PixiService,
              private eventBus: EventBusService,
              private graphViewService: GraphViewService) {
  }
  modeOff(): void {
  }

  modeOn(): void {
  }

  onAddedNode(nodeView: NodeView): void {
  }
}
