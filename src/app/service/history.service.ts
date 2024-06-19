import { Injectable } from '@angular/core';
import {Command} from "../logic/command/command";
import {StateService} from "./state.service";

/**
 * Service for storing and managing the history of commands.
 */
@Injectable({
  providedIn: 'root'
})
export class HistoryService {
  private commands: Command[] = [];
  private redoStack: Command[] = [];
  private readonly maxCommands = 15;

  // TODO Limit the number of commands stored in the history
  constructor(private stateService: StateService) {
  }

  /**
   * Execute the command and store it in the history.
   * @param command Command to execute
   */
  public execute(command: Command) {
    command.execute();
    this.commands.push(command);
    if (this.commands.length > this.maxCommands) {
      this.commands.shift(); // Remove the oldest command if limit is exceeded
    }
    this.redoStack = [];
    this.updateStates();
  }

  /**
   * Undo the last command.
   */
  public undo() {
    if (this.commands.length === 0) {
      return;
    }
    const command = this.commands.pop()!;
    command.undo();
    this.redoStack.push(command);
    this.updateStates();
  }

  /**
   * Redo the last undone command.
   */
  public redo() {
    if (this.redoStack.length === 0) {
      return;
    }
    const command = this.redoStack.pop()!;
    command.execute();
    this.commands.push(command);
    if (this.commands.length > this.maxCommands) {
      this.commands.shift(); // Remove the oldest command if limit is exceeded
    }
    this.updateStates();
  }

  private updateStates() {
    this.stateService.setCanUndo(this.commands.length > 0);
    this.stateService.setCanRedo(this.redoStack.length > 0);
  }
}
