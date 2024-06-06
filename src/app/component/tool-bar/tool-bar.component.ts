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
import {GraphViewService} from "../../service/graph-view.service";
import {ClearGraphViewCommand} from "../../logic/command/clear-graph-view-command";
import {FormControl, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {GraphOrientation} from "../../model/orientation";

ClarityIcons.addIcons(undoIcon, redoIcon);

@Component({
  selector: 'app-tool-bar',
  standalone: true,
  imports: [ClarityModule, CdkMenuTrigger, CdkMenu, CdkMenuItem, NgIf, DecimalPipe, FormsModule, ReactiveFormsModule],
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

  // Dropdown components states
  showWeights =  new FormControl(true); // TODO change to false by default
  showGrid = new FormControl(false);
  graphOrientation = new FormControl(GraphOrientation.ORIENTED);

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

  // Zooming button
  zoomPercentage: number = 100; // Default zoom percentage

  // Gradient colors
  gradientColorStart: string = '#FFC618';
  gradientColorEnd: string = '#ff0000';

  constructor(private stateService: StateService,
              private environmentService: EnvironmentService,
              private historyService: HistoryService,
              private graphViewService: GraphViewService) {
    this.isMobileDevice = this.environmentService.isMobile();
  }

  ngOnInit(): void {
    // Init subscriptions
    // Cursor coordinates
    this.subscriptions.add(this.stateService.currentCursorX.subscribe(state => this.xCursor = state));
    this.subscriptions.add(this.stateService.currentCursorY.subscribe(state => this.yCursor = state));
    // Undo/Redo buttons
    this.subscriptions.add(this.stateService.canUndo$.subscribe(state => this.canUndo = state));
    this.subscriptions.add(this.stateService.canRedo$.subscribe(state => this.canRedo = state));
    // Zooming button
    this.subscriptions.add(this.stateService.zoomChanged$.subscribe(state => this.zoomPercentage = state));
    // Cog dropdown components
    // Show weights
    this.showWeights.valueChanges.subscribe(value => {
      if (value !== null) {
        this.onToggleShowWeights(value)
      }
    });
    this.showGrid.valueChanges.subscribe(value => {
      if (value !== null) {
        this.onToggleShowGrid(value);
      }
    });
    // Graph orientation
    this.subscriptions.add(this.graphOrientation.valueChanges.subscribe(value => {
      if (value !== null) {
        this.onChoseGraphOrientation(value);
      }
    }));
    this.subscriptions.add(this.stateService.graphOrientationChanged$.subscribe(state => {
      if (state !== this.graphOrientation.value) {
        this.graphOrientation.setValue(state);
      }
    }));
    // Mode buttons
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
    // Default values
    const showWeights = this.showWeights.value;
    if (showWeights) {
      this.onToggleShowWeights(showWeights); // Set initial state
    }
    const orientation = this.graphOrientation.value;
    if (orientation) {
      this.onChoseGraphOrientation(orientation);
    }
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

  onClearGraph() {
    this.historyService.execute(new ClearGraphViewCommand(this.graphViewService)); // TODO move to GraphStateManagerService
    this.stateService.graphCleared();
  }

  onToggleShowWeights(value: boolean) {
    this.stateService.changeShowWeights(value);
  }

  private onToggleShowGrid(value: boolean) {
    this.stateService.changeShowGrid(value);
  }

  onChoseGraphOrientation(value: GraphOrientation) {
    this.stateService.changeGraphOrientation(value);
  }

  undoAction() {
    this.historyService.undo();
    this.stateService.undoInvoked();
  }

  redoAction() {
    this.historyService.redo()
    this.stateService.redoInvoked();
  }

  onZoomDropdownItemClick(number: number) {
    this.stateService.changeZoomTo(number);
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

  protected readonly GraphOrientation = GraphOrientation;
}
