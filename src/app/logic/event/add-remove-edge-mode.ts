import {ModeBehavior} from "../../service/event/mode-manager.service";
import {PixiService} from "../../service/pixi.service";
import {GraphViewService} from "../../service/graph-view.service";
import {NodeView} from "../../model/graphical-model/node-view";
import {EventBusService} from "../../service/event/event-bus.service";

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
