import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {ToolBarComponent} from "./component/tool-bar/tool-bar.component";
import {CanvasComponent} from "./component/canvas/canvas.component";
import {ModeManagerService} from "./service/manager/mode-manager.service";
import {GraphStateManagerService} from "./service/manager/graph-state-manager.service";
import {TabNavComponent} from "./component/tab-nav/tab-nav.component";
import {GraphMatrixViewStateManagerService} from "./service/manager/graph-matrix-view-state-manager.service";
import {EnvironmentService} from "./service/environment.service";
import {NgClass, NgIf} from "@angular/common";
import {FloatToolBarComponent} from "./component/canvas/float-tool-bar/float-tool-bar.component";
import {StateService} from "./service/state.service";
import {FloatHelperComponent} from "./component/canvas/float-helper/float-helper.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ToolBarComponent, CanvasComponent, TabNavComponent, NgClass, FloatToolBarComponent, NgIf, FloatHelperComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'GraphWeb';

  isMobileDevice: boolean;
  showFloatToolBar: boolean = false;
  showFloatHelper: boolean = false;

  constructor(private modeManagerService: ModeManagerService,
              private graphStateManager: GraphStateManagerService,
              private matrixManager: GraphMatrixViewStateManagerService,
              private environmentService: EnvironmentService,
              private stateService: StateService,
              private cdr: ChangeDetectorRef) {
    this.isMobileDevice = this.environmentService.isMobile();
  }

  ngOnInit(): void {
    // Subscribe to pixi started event
    this.stateService.pixiStarted$.subscribe(() => {
      this.cdr.detectChanges();
      // Show float toolbar and helper
      this.showFloatToolBar = true;
      this.showFloatHelper = true;
    });

    // Subscribe to changes of float helper visibility
    this.stateService.alwaysHideFloatHelper$.subscribe((value) => {
      if (this.showFloatHelper === value) {
        this.showFloatHelper = !value;
      }
    });
    // TODO implement handling for pixi stop event
  }
}
