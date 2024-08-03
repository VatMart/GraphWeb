import {ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit} from '@angular/core';
import {DecimalPipe, NgClass, NgForOf, NgIf, NgOptimizedImage} from "@angular/common";
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
import {Algorithm} from "../../model/Algorithm";
import {SvgIconService} from "../../service/svg-icon.service";
import {SvgIconDirective} from "../../directive/svg-icon.directive";

/**
 * Toolbar component.
 * Placed on the top of the application.
 */
@Component({
  selector: 'app-tool-bar',
  standalone: true,
  imports: [NgIf, DecimalPipe, FormsModule, ReactiveFormsModule, MenuModule, ButtonModule, RippleModule, CheckboxModule, DropdownModule, NgForOf, BadgeModule, NgClass, NgOptimizedImage, SvgIconDirective],
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

  // Algorithm dropdown button (only for desktop version)
  algorithmsItems: MenuItem[] | undefined;

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
  // Export items
  exportItems: MenuItem[] | undefined;

  // Save/load graph
  filename: string = 'graph.json';  // Default filename
  showSaveFileForm: boolean = false;  // Control the visibility of the save file form

  // Gradient colors
  gradientColorStart: string = '#FFC618';
  gradientColorEnd: string = '#ff0000';

  // Algorithm mode state
  isAlgorithmModeActive: boolean = false;
  private activeAlgIndex?: number[];
  private activeAlg?: Algorithm;
  canReset: boolean = false;


  constructor(private stateService: StateService,
              private environmentService: EnvironmentService,
              private historyService: HistoryService,
              private graphViewService: GraphViewService,
              private fileService: FileService,
              private localStorageService: LocalStorageService,
              private primengConfig: PrimeNGConfig,
              protected svgIconService: SvgIconService,
              protected cdr: ChangeDetectorRef) {
    this.isMobileDevice = this.environmentService.isMobile();
  }

  ngOnInit(): void {
    this.primengConfig.ripple = true;
    this.svgIconService.addIcon('play-alg-icon', '<svg xmlns="http://www.w3.org/2000/svg" height="38" viewBox="0 -960 960 960" width="38"><path fill="currentColor" d="m380-300 280-180-280-180zM480-80q-83 0-156-31.5T197-197t-85.5-127T80-480t31.5-156T197-763t127-85.5T480-880t156 31.5T763-763t85.5 127T880-480t-31.5 156T763-197t-127 85.5T480-80m0-80q134 0 227-93t93-227-93-227-227-93-227 93-93 227 93 227 227 93m0-320"/></svg>');
    this.svgIconService.addIcon('step-forward-icon', '<svg xmlns="http://www.w3.org/2000/svg" height="38" viewBox="100 -850 750 750" width="38" fill="currentColor"><path d="M673.33-240v-480H740v480zM220-240v-480l350.67 240zm66.67-126.67 166-113.33-166-113.33z"/></svg>');
    this.svgIconService.addIcon('step-back-icon', '<svg xmlns="http://www.w3.org/2000/svg" height="38" viewBox="100 -850 750 750" width="38" fill="currentColor"><path d="M220-240v-480h66.67v480zm520 0L389.33-480 740-720zm-66.67-126.67v-226.66L507.33-480z"/></svg>');

    this.initSubscriptions();
    // Init algorithm dropdown items
    this.algorithmsItems = [
      {
        label: 'Shortest Path Finding',
        items: [
          {
            label: 'Dijkstra\'s Algorithm',
            value: Algorithm.DIJKSTRA,
            command: (event) => this.onActivateAlgorithm(Algorithm.DIJKSTRA),
          },
        ]
      },
      {
        label: 'Traversal',
        items: [
          {
            label: 'Depth First Search',
            value: Algorithm.DFS,
            command: (event) => this.onActivateAlgorithm(Algorithm.DFS),
          },
          {
            label: 'Breadth First Search',
            value: Algorithm.BFS,
            command: (event) => this.onActivateAlgorithm(Algorithm.BFS),
          },
        ]
      }
    ];
    // Init zooming button dropdown items
    this.zoomItems = [
      {
        label: 'Zoom level',
        items: [
          {
            label: '300%', command: () => {
              this.onZoomDropdownItemClick(300);
            }
          },
          {
            label: '200%', command: () => {
              this.onZoomDropdownItemClick(200);
            }
          },
          {
            label: '150%', command: () => {
              this.onZoomDropdownItemClick(150);
            }
          },
          {
            label: '125%', command: () => {
              this.onZoomDropdownItemClick(125);
            }
          },
          {
            label: '100%', command: () => {
              this.onZoomDropdownItemClick(100);
            }
          },
          {
            label: '75%', command: () => {
              this.onZoomDropdownItemClick(75);
            }
          },
          {
            label: '50%', command: () => {
              this.onZoomDropdownItemClick(50);
            }
          }
        ]
      }
    ];
    // Init settings button dropdown items
    this.orientations = [
      {label: 'Directed', value: GraphOrientation.ORIENTED},
      {label: 'Undirected', value: GraphOrientation.NON_ORIENTED}
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
          },
          {
            id: 'exportItems',
            label: 'Export'
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
      {
        separator: true,
        visible: this.isMobileDevice,
      },
      {
        label: 'Graph Algorithms',
        visible: this.isMobileDevice,
        items: [
          {
            id: 'algorithms',
            label: 'Select algorithm',
          }
        ]
      }
    ];
    this.exportItems = [
      {
        label: 'Export as PNG',
        command: () => {
          this.exportAsPng();
        }
      }
    ];
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
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
    // On enable algorithm mode
    this.subscriptions.add(
      this.stateService.algorithmModeStateChanged$.subscribe((value) => {
        if (this.isAlgorithmModeActive !== value) {
          this.toggleAlgorithmModeStyles(value);
        }
      })
    );
    // On algorithm activation
    this.subscriptions.add(
      this.stateService.activateAlgorithm$.subscribe((value) => {
        if (this.activeAlgIndex) {
          // @ts-ignore
          this!.algorithmsItems[this.activeAlgIndex[0]].items[this.activeAlgIndex[1]].style = {'background-color': '#ffffff'};
        }
        const index = this.getIndexOfAlgorithm(value);
        if (index) {
          this.activeAlgIndex = index;
          this.activeAlg = value;
          // @ts-ignore
          this!.algorithmsItems[this.activeAlgIndex[0]].items[this.activeAlgIndex[1]].style = {'background-color': '#4d9aff'};
        }
      })
    );
    // On can reset algorithm
    this.subscriptions.add(
      this.stateService.canResetAlgorithm$.subscribe((value) => {
        this.canReset = value;
      })
    );
    // On reset algorithm
    this.subscriptions.add(
      this.stateService.callResetAlgorithm$.subscribe((value) => {
        if (this.canReset) {
          this.onResetButton();
        }
      })
    );
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
    if (this.isAlgorithmModeActive) {
      return; // Do not allow to use keyboard shortcuts in algorithm mode
    }
    if (event.ctrlKey && event.key.toLowerCase() === 's') {
      event.preventDefault();
      this.saveGraphClick();
    }
    if (event.ctrlKey && event.key.toLowerCase() === 'y') {
      this.redoAction();
    }
    if (event.ctrlKey && event.key.toLowerCase() === 'z') {
      this.undoAction();
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
        await writableStream.write(new Blob([data], {type: 'application/json'}));
        // Close the file and write the contents to disk.
        await writableStream.close();
        console.log("File saved successfully"); // TODO remove
      } else {
        // Fallback to the Blob API if the File System Access API is not supported
        const blob = new Blob([data], {type: 'application/json'});
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
        case 'enableCenterForce': {
          if (this.isAlgorithmModeActive) {
            return; // Do not allow to change force options in algorithm mode
          }
          this.enableCenterForce.setValue(!this.enableCenterForce.value);
          break;
        }
        case 'enableLinkForce': {
          if (this.isAlgorithmModeActive) {
            return; // Do not allow to change force options in algorithm mode
          }
          this.enableLinkForce.setValue(!this.enableLinkForce.value);
          break;
        }
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

  /**
   * Open export sub menu.
   */
  openExportItemsSubMenu(event: MouseEvent, exportSubMenu: Menu) {
    event.stopPropagation();
    exportSubMenu.toggle(event);
  }

  /**
   * Open algorithms sub menu in settings menu.
   * Only for mobile version.
   */
  openAlgorithmSubMenu(event: MouseEvent, algorithmsItemsMenu: Menu) {
    event.stopPropagation();
    algorithmsItemsMenu.toggle(event);
  }

  onActivateAlgorithm(algorithm: Algorithm) {
    if (this.activeAlg !== algorithm) {
      this.stateService.activateAlgorithm(algorithm);
    }
  }

  private exportAsPng() {
    // Allow to export only in default mode or algorithm mode
    if (this.stateService.getCurrentMode() !== 'default' && this.stateService.getCurrentMode() !== 'Algorithm') {
      this.stateService.changeMode('default'); // Switch to default mode if not already
      this.stateService.clearSelectedElements(); // Clear selected elements
    }
    this.stateService.callExportAsPngWindow();
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

  private toggleAlgorithmModeStyles(value: boolean) {
    this.isAlgorithmModeActive = value;
    if (value) {
      this.selectedOrientation.disable();
      this.enableCenterForce.disable();
      this.enableLinkForce.disable();
    } else {
      this.selectedOrientation.enable();
      this.enableCenterForce.enable();
      this.enableLinkForce.enable();
      if (this.activeAlgIndex) {
        // @ts-ignore
        this!.algorithmsItems[this.activeAlgIndex[0]].items[this.activeAlgIndex[1]].style = {'background-color': '#ffffff'};
        this.activeAlgIndex = undefined;
        this.activeAlg = undefined;
      }
    }
  }

  // ---------------------
  // Algorithm mode logic
  // ---------------------
  onExitAlgMode() {
    this.stateService.showAnimationToolbar(false);
    this.stateService.changeMode('default');
  }

  onResetButton() {
    this.stateService.resetAlgorithm();
    this.stateService.showAnimationToolbar(false); // Hide animation toolbar if shown
  }

  // ---------------------

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

  private getIndexOfAlgorithm(alg: Algorithm): number[] | undefined {
    let subIndex;
    const index = this.algorithmsItems?.findIndex(item => {
      const find = item.items?.findIndex(subItem => subItem['value'] === alg) !== -1
      if (find) {
        subIndex = item.items?.findIndex(subItem => subItem['value'] === alg);
      }
      return find;
    })
    if (index === -1) {
      return undefined;
    }
    if (subIndex === undefined) {
      return undefined;
    }
    return [index!, subIndex!];
  }
}

interface SelectOrientationItem {
  label: string;
  value: GraphOrientation;
}
