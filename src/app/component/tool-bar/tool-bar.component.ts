import {ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit} from '@angular/core';
import {DecimalPipe, NgForOf, NgIf} from "@angular/common";
import {StateService} from "../../service/event/state.service";
import {EnvironmentService} from "../../service/config/environment.service";
import {HistoryService} from "../../service/history.service";
import {Subscription} from "rxjs";
import {GraphViewService} from "../../service/graph/graph-view.service";
import {ClearGraphViewCommand} from "../../logic/command/clear-graph-view-command";
import {FormControl, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {GraphOrientation} from "../../model/orientation";
import {Menu, MenuModule} from "primeng/menu";
import {ButtonModule} from "primeng/button";
import {MenuItem, PrimeNGConfig} from "primeng/api";
import {RippleModule} from "primeng/ripple";
import {CheckboxModule} from "primeng/checkbox";
import {DropdownModule} from "primeng/dropdown";
import {ConfService} from "../../service/config/conf.service";
import {BadgeModule} from "primeng/badge";
import {FileService} from "../../service/file.service";
import {LocalStorageService} from "../../service/local-storage.service";

/**
 * Toolbar component.
 * Placed on the top of the application.
 */
@Component({
  selector: 'app-tool-bar',
  standalone: true,
  imports: [NgIf, DecimalPipe, FormsModule, ReactiveFormsModule, MenuModule, ButtonModule, RippleModule, CheckboxModule, DropdownModule, NgForOf, BadgeModule],
  templateUrl: './tool-bar.component.html',
  styleUrl: './tool-bar.component.css'
})
export class ToolBarComponent implements OnInit, OnDestroy {
  private subscriptions!: Subscription;

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
  showGrid = new FormControl(ConfService.SHOW_GRID);
  hideHelper = new FormControl(ConfService.ALWAYS_HIDE_HELPER_TEXT);
  // Force options
  enableCenterForce = new FormControl(ConfService.DEFAULT_CENTER_FORCE_ON);
  enableLinkForce = new FormControl(ConfService.DEFAULT_LINK_FORCE_ON);
  orientations: SelectOrientationItem[] | undefined;
  selectedOrientation = new FormControl<GraphOrientation | null>(ConfService.DEFAULT_GRAPH_ORIENTATION);

  // Save/load graph
  filename: string = 'graph.json';  // Default filename
  showSaveFileForm: boolean = false;  // Control the visibility of the save file form

  // Gradient colors
  gradientColorStart: string = '#FFC618';
  gradientColorEnd: string = '#ff0000';

  constructor(private stateService: StateService,
              private environmentService: EnvironmentService,
              private historyService: HistoryService,
              private graphViewService: GraphViewService,
              private fileService: FileService,
              private localStorageService: LocalStorageService,
              private primengConfig: PrimeNGConfig,
              private cdr: ChangeDetectorRef) {
    this.isMobileDevice = this.environmentService.isMobile();
  }

  ngOnInit(): void {
    this.primengConfig.ripple = true;
    this.initSubscriptions();
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
        label: 'File',
        items: [
          {
            id: 'saveGraph',
            label: 'Save graph'
          },
          {
            id: 'loadGraph',
            label: 'Open graph',
          }
        ]
      },
      {
        label: 'View options',
        items: [
          {
            id: 'zoomLevels',
            label: 'Zoom',
          },
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
    this.historyService.execute(new ClearGraphViewCommand(this.graphViewService));
    this.stateService.graphCleared();
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

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.ctrlKey && event.key.toLowerCase() === 'y') {
      this.redoAction();
    }
    if (event.ctrlKey && event.key.toLowerCase() === 'z') {
      this.undoAction();
    }
    if (event.ctrlKey && event.key.toLowerCase() === 's') {
      event.preventDefault();
      this.saveGraphClick();
    }
  }

  redoAction() {
    this.historyService.redo()
    this.stateService.redoInvoked();
  }

  onZoomDropdownItemClick(number: number) {
    this.stateService.changeZoomTo(number);
  }

  /**
   * On save graph button click.
   */
  async saveGraphClick() {
    console.log("Save graph button clicked"); // TODO remove
    const appData = this.fileService.serializeCurrentGraphAndSettings();
    this.localStorageService.saveAppData(appData); // Also save to local storage
    await this.saveFile(appData, 'graph.json');
  }

  private async saveFile(data: string, filename: string): Promise<void> {
    try {
      if ('showSaveFilePicker' in window) {
        // Show the file save dialog
        const options = {
          suggestedName: filename,
          types: [{
            description: 'JSON Files',
            accept: {'application/json': ['.json']},
          }],
        };
        const fileHandle = await (window as any).showSaveFilePicker(options);
        // Create a writable stream
        const writableStream = await fileHandle.createWritable();
        // Write the data to the stream
        await writableStream.write(new Blob([data], { type: 'application/json' }));
        // Close the file and write the contents to disk.
        await writableStream.close();
        console.log("File saved successfully"); // TODO remove
      } else {
        // Fallback to the Blob API if the File System Access API is not supported
        const blob = new Blob([data], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
        console.log("File downloaded successfully"); // TODO remove
      }
    } catch (error) {
      console.error("Error saving file:", error);
    }
  }

  loadGraphClick() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (event: any) => this.handleFileSelect(event);
    input.click();
  }

  private handleFileSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result;
        if (typeof content === 'string') {
          this.importGraph(content);
        }
      };
      reader.readAsText(file);
    }
  }

  private importGraph(jsonContent: string) {
    try {
      const appData = this.fileService.deserializeGraphAndSettings(jsonContent);
      //console.log("Graph loaded successfully:", appData); // TODO: Remove
      this.stateService.loadApp(appData);
    } catch (error) {
      console.error("Error importing graph:", error); // TODO Replace with notification
      return;
    }
  }

  onCheckboxClick(event: Event, type: string) {
    event.stopPropagation();
    if (event.target?.constructor.name === "HTMLElement") { // Clicked on menu item, but not on checkbox directly
      switch (type) {
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

  /**
   * Open zoom sub menu in settings menu.
   * Only for mobile version.
   */
  openZoomSubMenu(event: MouseEvent, zoomSubMenu: Menu) {
    event.stopPropagation();
    zoomSubMenu.toggle(event);
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

  private initSubscriptions() {
    this.subscriptions = new Subscription();
    // Cursor coordinates
    this.subscriptions.add(this.stateService.currentCursorX.subscribe(state => this.xCursor = state));
    this.subscriptions.add(this.stateService.currentCursorY.subscribe(state => this.yCursor = state));
    // Undo/Redo buttons
    this.subscriptions.add(this.stateService.canUndo$.subscribe(state => this.canUndo = state));
    this.subscriptions.add(this.stateService.canRedo$.subscribe(state => this.canRedo = state));
    // Zooming button
    this.subscriptions.add(this.stateService.zoomChanged$.subscribe(state => {
      this.zoomPercentage = state;
    }));
    // Cog dropdown components
    this.subscriptions.add(this.showGrid.valueChanges.subscribe(value => {
      if (value !== null) {
        this.onToggleShowGrid(value);
      }
    }));
    this.subscriptions.add(this.hideHelper.valueChanges.subscribe(value => {
      if (value !== null) {
        this.onToggleAlwaysHideHelper(value);
      }
    }));
    // Force options
    this.subscriptions.add(this.enableCenterForce.valueChanges.subscribe(value => {
      if (value !== null) {
        this.onCenterForceToggle(value);
      }
    }));
    this.subscriptions.add(this.enableLinkForce.valueChanges.subscribe(value => {
      if (value !== null) {
        this.onLinkForceToggle(value)
      }
    }));
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
    // On reset UI state
    this.subscriptions.add(
      this.stateService.resetUiState$.subscribe((value) => {
        if (value) {
          this.resetUiState();
        }
      })
    );
  }

  private resetUiState() {
    this.subscriptions.unsubscribe();
    this.initDefaultValues();
    this.initSubscriptions();
  }

  private initDefaultValues() {
    this.cdr.detectChanges();
    this.showGrid.setValue(ConfService.SHOW_GRID);
    this.hideHelper.setValue(ConfService.ALWAYS_HIDE_HELPER_TEXT);
    this.enableCenterForce.setValue(ConfService.DEFAULT_CENTER_FORCE_ON);
    this.enableLinkForce.setValue(ConfService.DEFAULT_LINK_FORCE_ON);
    this.selectedOrientation.setValue(ConfService.DEFAULT_GRAPH_ORIENTATION);
    this.cdr.detectChanges();
  }
}

interface SelectOrientationItem {
  label: string;
  value: GraphOrientation;
}
