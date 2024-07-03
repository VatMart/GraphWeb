import {Command} from "./command";
import {Action} from "../customization-resolver";

/**
 * Command to change graph view properties.
 */
export class ChangeGraphViewPropertiesCommand implements Command {

  constructor(private actions: Action[],
              private rollbackActions: Action[]) {
  }

  execute(): void {
    this.actions.forEach(action => action());
  }

  undo(): void {
    this.rollbackActions.forEach(action => action());
  }

  redo(): void {
    this.execute();
  }
}
