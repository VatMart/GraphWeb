import {ModeBehavior} from "../../service/manager/mode-manager.service";
import {EdgeView} from "../../model/graphical-model/edge/edge-view";
import {NodeView} from "../../model/graphical-model/node/node-view";
import {PixiService} from "../../service/pixi.service";
import {EventBusService, HandlerNames} from "../../service/event/event-bus.service";

/**
 * Selection mode class.
 * Used for selecting elements on the canvas.
 * Its used only for mobile version of the application.
 */
export class SelectionMode implements ModeBehavior {
  constructor(private pixiService: PixiService,
              private eventBus: EventBusService) {
  }

  modeOn(): void {
    console.log("SelectionMode ON"); // TODO remove
    this.eventBus.registerPixiEvent(this.pixiService.stage, 'pointerdown',
      HandlerNames.MULTI_SELECTION);
  }

  modeOff(): void {
    console.log("SelectionMode OFF"); // TODO remove
    this.eventBus.unregisterPixiEvent(this.pixiService.stage, 'pointerdown',
      HandlerNames.MULTI_SELECTION);
  }

  onAddedEdge(edgeView: EdgeView): void {
  }

  onAddedNode(nodeView: NodeView): void {
  }

  onGraphCleared(): void {
  }

  onGraphViewGenerated(): void {
  }

  onRedoInvoked(): void {
  }

  onRemovedEdge(edgeView: EdgeView): void {
  }

  onRemovedNode(nodeView: NodeView): void {
  }

  onUndoInvoked(): void {
  }
}
