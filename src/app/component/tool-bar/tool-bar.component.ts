import {Component, OnDestroy, OnInit} from '@angular/core';
import {DecimalPipe, NgIf} from "@angular/common";
import {StateService} from "../../service/event/state.service";
import {EnvironmentService} from "../../service/config/environment.service";
import {HistoryService} from "../../service/history.service";
import {Subscription} from "rxjs";
import {GraphViewService} from "../../service/graph/graph-view.service";
import {ClearGraphViewCommand} from "../../logic/command/clear-graph-view-command";
import {FormControl, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {GraphOrientation} from "../../model/orientation";
import {MenuModule} from "primeng/menu";
import {ButtonModule} from "primeng/button";
import {MenuItem, PrimeNGConfig} from "primeng/api";
import {RippleModule} from "primeng/ripple";
import {CheckboxModule} from "primeng/checkbox";
import {DropdownModule} from "primeng/dropdown";
import {ConfService} from "../../service/config/conf.service";

@Component({
  selector: 'app-tool-bar',
  standalone: true,
  imports: [NgIf, DecimalPipe, FormsModule, ReactiveFormsModule, MenuModule, ButtonModule, RippleModule, CheckboxModule, DropdownModule],
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

  // Zooming button
  zoomItems: MenuItem[] | undefined;
  zoomPercentage: number = 100; // Default zoom percentage

  // Settings button
  settingsItems: MenuItem[] | undefined;
  // Dropdown components states
  showWeights =  new FormControl(ConfService.SHOW_WEIGHT);
  showGrid = new FormControl(ConfService.SHOW_GRID);
  hideHelper = new FormControl(ConfService.ALWAYS_HIDE_HELPER_TEXT);
  // Force options
  enableCenterForce = new FormControl(ConfService.DEFAULT_CENTER_FORCE_ON);
  enableLinkForce = new FormControl(ConfService.DEFAULT_LINK_FORCE_ON);
  orientations: SelectOrientationItem[] | undefined;
  selectedOrientation = new FormControl<GraphOrientation | null>(ConfService.DEFAULT_GRAPH_ORIENTATION);

  // Gradient colors
  gradientColorStart: string = '#FFC618';
  gradientColorEnd: string = '#ff0000';

  constructor(private stateService: StateService,
              private environmentService: EnvironmentService,
              private historyService: HistoryService,
              private graphViewService: GraphViewService,
              private primengConfig: PrimeNGConfig) {
    this.isMobileDevice = this.environmentService.isMobile();
  }

  ngOnInit(): void {
    this.primengConfig.ripple = true;
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
    this.hideHelper.valueChanges.subscribe(value => {
      if (value !== null) {
        this.onToggleAlwaysHideHelper(value);
      }
    });
    // Force options
    this.enableCenterForce.valueChanges.subscribe(value => {
      if (value !== null) {
        this.onCenterForceToggle(value);
      }
    });
    this.enableLinkForce.valueChanges.subscribe(value => {
      if (value !== null) {
        this.onLinkForceToggle(value)
      }
    });
    // Graph orientation
    this.subscriptions.add(this.selectedOrientation.valueChanges.subscribe(value => {
      if (value !== null) {
        this.onChoseGraphOrientation(value);
      }
    }));
    this.subscriptions.add(this.stateService.graphOrientationChanged$.subscribe(state => {
      if (state !== this.selectedOrientation.value) {
        this.selectedOrientation.setValue(state);
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
    // Init zooming button dropdown items
    this.zoomItems = [
      {
        label: 'Zoom level',
        items: [
          {label: '300%', command: () => { this.onZoomDropdownItemClick(300); }},
          {label: '200%', command: () => { this.onZoomDropdownItemClick(200); }},
          {label: '150%', command: () => { this.onZoomDropdownItemClick(150); }},
          {label: '125%', command: () => { this.onZoomDropdownItemClick(125); }},
          {label: '100%', command: () => { this.onZoomDropdownItemClick(100); }},
          {label: '75%', command: () => { this.onZoomDropdownItemClick(75); }},
          {label: '50%', command: () => { this.onZoomDropdownItemClick(50); }}
        ]
      }
    ];
    // Init settings button dropdown items
    this.orientations = [
      {label: 'Directed', value: GraphOrientation.ORIENTED},
      {label: 'Undirected', value: GraphOrientation.NON_ORIENTED},
      {label: 'Mixed', value: GraphOrientation.MIXED}
    ];
    this.settingsItems = [
      {
        label: 'View options',
        items: [
          {
            id: 'showWeights',
            label: 'Show weights',
          },
          {
            id: 'showGrid',
            label: 'Show grid',
          },
          {
            id: 'hideHelper',
            label: 'Always hide hint text',
          },
        ],
      },
      {
        separator: true,
      },
      {
        label: 'Graph orientation',
        items: [
          {
            id: 'selectOrientation'
          }
        ]
      },
      {
        separator: true,
      },
      {
        label: 'Force mode options',
        items: [
          {
            id: 'enableCenterForce',
            label: 'Enable center force',
          },
          {
            id: 'enableLinkForce',
            label: 'Enable link force',
          },
        ],
      },
    ];
    // Default values
    const showWeights = this.showWeights.value;
    if (showWeights) {
      this.onToggleShowWeights(showWeights); // Set initial state
    }
    const showGrid = this.showGrid.value;
    if (showGrid) {
      this.onToggleShowGrid(showGrid); // Set initial state
    }
    const hideHelper = this.hideHelper.value;
    if (hideHelper) {
      this.onToggleAlwaysHideHelper(hideHelper); // Set initial state
    }
    const orientation = this.selectedOrientation.value;
    if (orientation) {
      this.onChoseGraphOrientation(orientation); // Set initial state
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

  private onToggleAlwaysHideHelper(value: boolean) {
    this.stateService.changeAlwaysHideFloatHelperState(value);
  }

  onChoseGraphOrientation(value: GraphOrientation) {
    this.stateService.changeGraphOrientation(value);
  }

  private onCenterForceToggle(value: boolean) {
    this.stateService.changeCenterForceState(value);
  }

  private onLinkForceToggle(value: boolean) {
    this.stateService.changeLinkForceState(value);
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

  onCheckboxClick(event: Event, type: string) {
    event.stopPropagation();
    if (event.target?.constructor.name === "HTMLElement") { // Clicked on menu item, but not on checkbox directly
      switch (type) {
        case 'showWeights':
          this.showWeights.setValue(!this.showWeights.value);
          break;
        case 'showGrid':
          this.showGrid.setValue(!this.showGrid.value);
          break;
        case 'hideHelper':
          this.hideHelper.setValue(!this.hideHelper.value);
          break;
        case 'enableCenterForce':
          this.enableCenterForce.setValue(!this.enableCenterForce.value);
          break;
        case 'enableLinkForce':
          this.enableLinkForce.setValue(!this.enableLinkForce.value);
          break;
      }
    }
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

interface SelectOrientationItem {
  label: string;
  value: GraphOrientation;
}
