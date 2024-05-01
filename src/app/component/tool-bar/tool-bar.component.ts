import {Component, OnDestroy, OnInit} from '@angular/core';
import {CdkMenu, CdkMenuItem, CdkMenuTrigger} from '@angular/cdk/menu';
import '@clr/icons';
import '@clr/icons/clr-icons.min.css';
import '@cds/core/icon/register.js';
import {ClarityIcons, redoIcon, undoIcon} from '@cds/core/icon';
import {ClarityModule} from "@clr/angular";
import {DecimalPipe, NgIf} from "@angular/common";
import {StateService} from "../../service/state.service";
import {EnvironmentService} from "../../service/environment.service";
import {HistoryService} from "../../service/history.service";
import {Subscription} from "rxjs";
import {ModeState} from "../../service/event/mode-manager.service";

ClarityIcons.addIcons(undoIcon, redoIcon);

@Component({
  selector: 'app-tool-bar',
  standalone: true,
  imports: [ClarityModule, CdkMenuTrigger, CdkMenu, CdkMenuItem, NgIf, DecimalPipe],
  templateUrl: './tool-bar.component.html',
  styleUrl: './tool-bar.component.css'
})
export class ToolBarComponent implements OnInit, OnDestroy {
  private subscriptions = new Subscription();

  isMobileDevice: boolean;

  // Buttons states
  isAddVertexButtonActive: boolean = false;
  isAddVertexButtonPressed: boolean = false;
  isAddEdgesButtonActive: boolean = false;
  isAddEdgesButtonPressed: boolean = false;

  // Gradient state
  useAddVertexGradient: boolean = false;
  useAddEdgesGradient: boolean = false;
  useUndoGradient: boolean = false;
  useRedoGradient: boolean = false;
  useClearGradient: boolean = false;

  // Undo/Redo buttons
  canUndo: boolean = false;
  canRedo: boolean = false;

  // Cursor coordinates on canvas
  xCursor: number = 0;
  yCursor: number = 0;

  // Gradient colors
  gradientColorStart: string = '#FFC618';
  gradientColorEnd: string = '#ff0000';

  constructor(private stateService: StateService,
              private environmentService: EnvironmentService,
              private historyService: HistoryService) {
    this.isMobileDevice = this.environmentService.isMobile();
  }

  ngOnInit(): void {
    this.subscriptions.add(this.stateService.currentCursorX.subscribe(state => this.xCursor = state));
    this.subscriptions.add(this.stateService.currentCursorY.subscribe(state => this.yCursor = state));
    this.subscriptions.add(this.stateService.canUndo$.subscribe(state => this.canUndo = state));
    this.subscriptions.add(this.stateService.canRedo$.subscribe(state => this.canRedo = state));
    this.subscriptions.add(this.stateService.currentMode$.subscribe(state => {
      if (this.isAddVertexButtonActive && state !== 'AddRemoveVertex') {
        console.log("Switching add vertex button");
        this.switchAddVertexButton(); // Turn off add vertex mode
      }
      if (this.isAddEdgesButtonActive && state !== 'AddRemoveEdge') {
        console.log("Switching add edges button");
        this.switchAddEdgesButton(); // Turn off add edges mode
      }
    }));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  onToggleAddVertexButton() {
    this.switchAddVertexButton();
    this.stateService.changeAddVertexModeState(this.isAddVertexButtonActive);
  }

  switchAddVertexButton() {
    this.isAddVertexButtonActive = !this.isAddVertexButtonActive;
    // Toggle use of gradient on button press
    this.useAddVertexGradient = this.isAddVertexButtonActive;
  }

  onToggleAddEdgesButton() {
    this.switchAddEdgesButton()
    this.stateService.changeAddEdgesModeState(this.isAddEdgesButtonActive);
  }

  switchAddEdgesButton() {
    this.isAddEdgesButtonActive = !this.isAddEdgesButtonActive;
    // Toggle use of gradient on button press
    this.useAddEdgesGradient = this.isAddEdgesButtonActive;
  }

  undoAction() {
    this.historyService.undo();
    this.stateService.undoInvoked();
  }

  redoAction() {
    this.historyService.redo()
    this.stateService.redoInvoked();
  }

  buttonAddVertexMouseLeave() {
    if (this.isAddVertexButtonPressed) {
      if (!this.isAddVertexButtonActive) {
        this.useAddVertexGradient = false;
      } else {
        this.gradientColorStart = '#FFC618';
        this.gradientColorEnd = '#ff0000';
      }
    }
  }

  buttonAddVertexMouseDown() {
    this.isAddVertexButtonPressed = true;
    this.gradientColorStart = '#ff0000';
    this.gradientColorEnd = '#FFC618';
    this.useAddVertexGradient = true;
  }

  buttonAddVertexMouseUp() {
    this.isAddVertexButtonPressed = false;
    this.gradientColorStart = '#FFC618';
    this.gradientColorEnd = '#ff0000';
    this.useAddVertexGradient = false;
  }

  buttonAddEdgesMouseLeave() {
    if (this.isAddEdgesButtonPressed) {
      if (!this.isAddEdgesButtonActive) {
        this.useAddEdgesGradient = false;
      } else {
        this.gradientColorStart = '#FFC618';
        this.gradientColorEnd = '#ff0000';
      }
    }
  }

  buttonAddEdgesMouseDown() {
    this.isAddEdgesButtonPressed = true;
    this.gradientColorStart = '#ff0000';
    this.gradientColorEnd = '#FFC618';
    this.useAddEdgesGradient = true;
  }

  buttonAddEdgesMouseUp() {
    this.isAddEdgesButtonPressed = false;
    this.gradientColorStart = '#FFC618';
    this.gradientColorEnd = '#ff0000';
    this.useAddEdgesGradient = false;
  }
}
