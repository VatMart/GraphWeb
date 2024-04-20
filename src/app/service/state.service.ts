import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {ModeState} from "./event/mode-manager.service";
import {NodeView} from "../model/graphical-model/node-view";

@Injectable({
  providedIn: 'root'
})
export class StateService {

  // Can undo and redo
  private canUndoSource = new BehaviorSubject<boolean>(false);
  public canUndo$ = this.canUndoSource.asObservable();
  private canRedoSource = new BehaviorSubject<boolean>(false);
  public canRedo$ = this.canRedoSource.asObservable();

  // Current mode
  private modeStateSource = new BehaviorSubject<ModeState>('default');
  public currentMode$ = this.modeStateSource.asObservable();

  // All modes
  private stateAddVertexSource = new BehaviorSubject<boolean>(false);
  currentAddVertexState = this.stateAddVertexSource.asObservable();

  // Canvas cursor coordinates
  private cursorXSource = new BehaviorSubject<number>(0);
  private cursorYSource = new BehaviorSubject<number>(0);
  currentCursorX = this.cursorXSource.asObservable();
  currentCursorY = this.cursorYSource.asObservable();

  // Node related events
  private nodeAddedSource = new BehaviorSubject<NodeView | null>(null);
  public nodeAdded$ = this.nodeAddedSource.asObservable();

  private nodeDeletedSource = new BehaviorSubject<NodeView | null>(null);
  public nodeDeleted$ = this.nodeDeletedSource.asObservable();

  /**
   * Change the undo state.
   */
  setCanUndo(state: boolean) {
    this.canUndoSource.next(state);
  }

  /**
   * Change the redo state.
   */
  setCanRedo(state: boolean) {
    this.canRedoSource.next(state);
  }

  /**
   * Change the mode of the application.
   */
  changeMode(mode: ModeState) {
    this.modeStateSource.next(mode);
  }

  /**
   * Change the cursor x coordinate.
   */
  changeCursorX(x: number) {
    this.cursorXSource.next(x);
  }

  /**
   * Change the cursor y coordinate.
   */
  changeCursorY(y: number) {
    this.cursorYSource.next(y);
  }

  /**
   * Change the add vertex mode state.
   */
  changeAddVertexModeState(state: boolean) {
    this.stateAddVertexSource.next(state);
  }

  /**
   * Notify that a node has been added.
   */
  addedNode(nodeView: NodeView) {
    this.nodeAddedSource.next(nodeView);
  }

  /**
   * Notify that a node has been deleted.
   */
  deletedNode(nodeView: NodeView) {
    this.nodeDeletedSource.next(nodeView);
  }

  constructor() { }
}
