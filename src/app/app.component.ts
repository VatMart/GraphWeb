import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {ToolBarComponent} from "./component/tool-bar/tool-bar.component";
import {CanvasComponent} from "./component/canvas/canvas.component";
import {ModeManagerService} from "./service/manager/mode-manager.service";
import {GraphStateManagerService} from "./service/manager/graph-state-manager.service";
import {TabNavComponent} from "./component/tab-nav/tab-nav.component";
import {GraphMatrixViewStateManagerService} from "./service/manager/graph-matrix-view-state-manager.service";
import {EnvironmentService} from "./service/environment.service";
import {NgClass, NgIf} from "@angular/common";
import {FloatToolBarComponent} from "./component/float-tool-bar/float-tool-bar.component";
import {StateService} from "./service/state.service";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ToolBarComponent, CanvasComponent, TabNavComponent, NgClass, FloatToolBarComponent, NgIf],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'GraphWeb';

  isMobileDevice: boolean;
  showFloatToolBar: boolean = false;

  constructor(private modeManagerService: ModeManagerService,
              private graphStateManager: GraphStateManagerService,
              private matrixManager: GraphMatrixViewStateManagerService,
              private environmentService: EnvironmentService,
              private stateService: StateService,
              private cdr: ChangeDetectorRef) {
    this.isMobileDevice = this.environmentService.isMobile();
  }

  ngOnInit(): void {
    this.stateService.pixiStarted$.subscribe(() => {
      this.cdr.detectChanges();
      this.showFloatToolBar = true;
    });
    // TODO implement handling for pixi stop event
  }
}
