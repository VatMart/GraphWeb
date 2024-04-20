import { Injectable } from '@angular/core';
import {Command} from "../logic/command/command";
import {StateService} from "./state.service";

@Injectable({
  providedIn: 'root'
})
export class HistoryService {
  private commands: Command[] = [];
  private redoStack: Command[] = [];

  constructor(private stateService: StateService) {
  }

  public execute(command: Command) {
    command.execute();
    this.commands.push(command);
    this.redoStack = [];
    this.updateStates();
  }

  public undo() {
    if (this.commands.length === 0) {
      return;
    }
    const command = this.commands.pop()!;
    command.undo();
    this.redoStack.push(command);
    this.updateStates();
  }

  public redo() {
    if (this.redoStack.length === 0) {
      return;
    }
    const command = this.redoStack.pop()!;
    command.execute();
    this.commands.push(command);
    this.updateStates();
  }

  private updateStates() {
    this.stateService.setCanUndo(this.commands.length > 0);
    this.stateService.setCanRedo(this.redoStack.length > 0);
  }
}
