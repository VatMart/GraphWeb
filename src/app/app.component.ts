import {ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ToolBarComponent} from "./component/tool-bar/tool-bar.component";
import {CanvasComponent} from "./component/canvas/canvas.component";
import {ModeManagerService} from "./service/manager/mode-manager.service";
import {GraphStateManagerService} from "./service/manager/graph-state-manager.service";
import {TabNavComponent} from "./component/tab-nav/tab-nav.component";
import {EnvironmentService} from "./service/config/environment.service";
import {NgClass, NgIf} from "@angular/common";
import {FloatToolBarComponent} from "./component/canvas/float-tool-bar/float-tool-bar.component";
import {StateService} from "./service/event/state.service";
import {FloatHelperComponent} from "./component/canvas/float-helper/float-helper.component";
import {
  FloatEdgeWeightInputComponent
} from "./component/canvas/float-edge-weight-input/float-edge-weight-input.component";
import {Subscription} from "rxjs";
import {GraphSetViewManagerService} from "./service/manager/graph-set-view-manager.service";
import {GraphMatrixViewStateManagerService} from "./service/manager/graph-matrix-view-state-manager.service";
import {ConfService} from "./service/config/conf.service";
import {PixiManagerService} from "./service/manager/pixi-manager.service";
import {ImportService} from "./service/import.service";
import {ToastModule} from "primeng/toast";
import {MessageService} from "primeng/api";
import {FloatEditorPanelComponent} from "./component/canvas/float-editor-panel/float-editor-panel.component";
import {GraphViewService} from "./service/graph/graph-view.service";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ToolBarComponent, CanvasComponent, TabNavComponent, NgClass, FloatToolBarComponent, NgIf,
    FloatHelperComponent, FloatEdgeWeightInputComponent, ToastModule, FloatEditorPanelComponent],
  providers: [MessageService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy {
  private subscriptions!: Subscription;
  @ViewChild('floatingEdgeWeightInput') floatingEdgeWeightInput!: FloatEdgeWeightInputComponent;
  title = 'GraphWeb';

  isMobileDevice: boolean;
  showFloatToolBar: boolean = false;
  showFloatHelper: boolean = false;
  showFloatEditorPanel: boolean = false;

  constructor(private modeManagerService: ModeManagerService,
              private graphStateManager: GraphStateManagerService,
              private matrixManager: GraphMatrixViewStateManagerService,
              private graphSetManager: GraphSetViewManagerService,
              private graphService: GraphViewService,
              private importService: ImportService,
              private pixiManager: PixiManagerService,
              private environmentService: EnvironmentService,
              private stateService: StateService,
              private messageService: MessageService,
              private cdr: ChangeDetectorRef) {
    this.isMobileDevice = this.environmentService.isMobile();
  }

  ngOnInit(): void {
    this.subscriptions = new Subscription();
    // On notify error event
    this.subscriptions.add(
      this.stateService.notifyError$.subscribe((value) => {
        this.notifyError(value);
      })
    );

    // On import graph from JSON
    this.subscriptions.add(
      this.stateService.loadApp$.subscribe((value) => {
        console.log("Importing graph from JSON"); // TODO remove
        // Load graph from JSON
        this.importService.importAppData(value);
      })
    );

    // Subscribe to pixi stop event
    this.subscriptions.add(
      this.stateService.pixiStopCall$.subscribe((value) => {
        if (value) {
          this.pixiManager.stopPixi();
        }
      })
    );

    // Subscribe to pixi started event
    this.subscriptions.add(
      this.stateService.pixiStarted$.subscribe((value) => {
        if (!value) {
          return;
        }
        this.cdr.detectChanges();
        // Show float toolbar and helper
        this.showFloatToolBar = true;
        this.showFloatHelper = true;
      })
    );

    // Subscribe to pixi stopped event
    this.subscriptions.add(
      this.stateService.pixiStopped$.subscribe((value) => {
        if (!value) {
          return;
        }
        this.cdr.detectChanges();
        // Hide float toolbar and helper
        this.showFloatToolBar = false;
        this.showFloatHelper = false;
      })
    );

    // Subscribe to changes of float helper visibility
    this.subscriptions.add(
      this.stateService.alwaysHideFloatHelper$.subscribe((value) => {
        ConfService.ALWAYS_HIDE_HELPER_TEXT = value;
        if (this.showFloatHelper === value) {
          this.showFloatHelper = !value;
        }
      })
    );

    // Subscribe to changes of float change edge weight input visibility
    this.subscriptions.add(
      this.stateService.showEditEdgeWeight$.subscribe((value) => {
        this.floatingEdgeWeightInput.showInput(value);
      })
    );

    // Subscribe to changes of float editor panel visibility
    this.subscriptions.add(
      this.stateService.elementSelected$.subscribe((value) => {
        this.showFloatEditorPanel = true;
      })
    );
    this.subscriptions.add(
      this.stateService.elementUnselected$.subscribe((value) => {
        if (this.graphService.isSelectionEmpty()) {
          this.showFloatEditorPanel = false;
        }
      })
    );
    this.subscriptions.add(
      this.stateService.selectionCleared$.subscribe((value) => {
        if (value) {
          this.showFloatEditorPanel = false;
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private notifyError(value: string) {
    this.messageService.add({severity: 'error', summary: 'Error', detail: value, life: 5000});
  }
}
