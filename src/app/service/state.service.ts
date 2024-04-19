import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {ModeState} from "./event/mode-manager.service";
import {NodeView} from "../model/graphical-model/node-view";

@Injectable({
  providedIn: 'root'
})
export class StateService {

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

  changeMode(mode: ModeState) {
    this.modeStateSource.next(mode);
  }

  changeCursorX(x: number) {
    this.cursorXSource.next(x);
  }

  changeCursorY(y: number) {
    this.cursorYSource.next(y);
  }

  changeAddVertexModeState(state: boolean) {
    this.stateAddVertexSource.next(state);
  }

  addedNode(nodeView: NodeView) {
    this.nodeAddedSource.next(nodeView);
  }

  deletedNode(nodeView: NodeView) {
    this.nodeDeletedSource.next(nodeView);
  }

  constructor() { }
}
