import {Component, OnInit} from '@angular/core';
import {CdkMenu, CdkMenuItem, CdkMenuTrigger} from '@angular/cdk/menu';
import {ClarityModule} from "@clr/angular";
import {NgIf} from "@angular/common";
import {StateService} from "../../service/state.service";
import {EnvironmentService} from "../../service/environment.service";
import {HistoryService} from "../../service/history.service";

@Component({
  selector: 'app-tool-bar',
  standalone: true,
  imports: [ClarityModule, CdkMenuTrigger, CdkMenu, CdkMenuItem, NgIf],
  templateUrl: './tool-bar.component.html',
  styleUrl: './tool-bar.component.css'
})
export class ToolBarComponent implements OnInit {
  isMobileDevice: boolean;

  // Modes buttons
  isAddVertexButtonActive: boolean = false;

  // Undo/Redo buttons
  canUndo: boolean = false;
  canRedo: boolean = false;

  // Cursor coordinates on canvas
  xCursor: number = 0;
  yCursor: number = 0;

  constructor(private stateService: StateService,
              private environmentService: EnvironmentService,
              private historyService: HistoryService) {
    this.isMobileDevice = this.environmentService.isMobile();
  }

  toggleAddVertexButton() {
    this.isAddVertexButtonActive = !this.isAddVertexButtonActive;
    this.stateService.changeAddVertexModeState(this.isAddVertexButtonActive);
  }

  ngOnInit(): void {
    this.stateService.currentCursorX.subscribe(state => {
      this.xCursor = state;
      //console.log(this.isAddVertexModeActive);
    });
    this.stateService.currentCursorY.subscribe(state => {
      this.yCursor = state;
      //console.log(this.isAddVertexModeActive);
    });
    this.stateService.canUndo$.subscribe(state => {
      this.canUndo = state;
    });
    this.stateService.canRedo$.subscribe(state => {
      this.canRedo = state;
    });
  }

  undoAction() {
    this.historyService.undo();
  }

  redoAction() {
    this.historyService.redo()
  }


}
