import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
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

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ToolBarComponent, CanvasComponent, TabNavComponent, NgClass, FloatToolBarComponent, NgIf,
    FloatHelperComponent, FloatEdgeWeightInputComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  private subscriptions: Subscription = new Subscription();
  @ViewChild('floatingEdgeWeightInput') floatingEdgeWeightInput!: FloatEdgeWeightInputComponent;
  title = 'GraphWeb';

  isMobileDevice: boolean;
  showFloatToolBar: boolean = false;
  showFloatHelper: boolean = false;

  constructor(private modeManagerService: ModeManagerService,
              private graphStateManager: GraphStateManagerService,
              private matrixManager: GraphMatrixViewStateManagerService,
              private graphSetManager: GraphSetViewManagerService,
              private environmentService: EnvironmentService,
              private stateService: StateService,
              private cdr: ChangeDetectorRef) {
    this.isMobileDevice = this.environmentService.isMobile();
  }

  ngOnInit(): void {
    // Subscribe to pixi started event
    this.subscriptions.add(
      this.stateService.pixiStarted$.subscribe((value) => {
        if (value === null) {
          return;
        }
        this.cdr.detectChanges();
        // Show float toolbar and helper
        this.showFloatToolBar = true;
        this.showFloatHelper = true;
      })
    );

    // Subscribe to changes of float helper visibility
    this.subscriptions.add(
      this.stateService.alwaysHideFloatHelper$.subscribe((value) => {
        if (this.showFloatHelper === value) {
          this.showFloatHelper = !value;
        }
      })
    );

    // Subscribe to changes of float change edge weight input visibility
    this.subscriptions.add(
      this.stateService.showEditEdgeWeight$.subscribe((value) => {
        if (value !== null) {
          this.floatingEdgeWeightInput.showInput(value);
        }
      })
    );
    // TODO implement handling for pixi stop event
  }
}
