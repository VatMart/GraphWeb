import {PixiService} from "../../service/pixi.service";
import {EventBusService} from "../../service/event-bus.service";
import {HistoryService} from "../../service/history.service";
import {GraphViewService} from "../../service/graph-view.service";
import {StateService} from "../../service/state.service";

/**
 * Mode for applying forces to the graph elements.
 */
export class ForceMode {

  constructor(pixiService: PixiService,
              eventBus: EventBusService,
              historyService: HistoryService,
              graphViewService: GraphViewService,
              stateService: StateService) {
  }

  modeOn(): void {
    this.enableForces();
  }

  modeOff(): void {
    //super.modeOff();
    this.disableForces();
  }

  private enableForces(): void {
    // TODO implement
    console.log("Forces enabled");
  }

  private disableForces(): void {
    // TODO implement
    // TODO override moveable nodes??
    console.log("Forces disabled");
  }
}
