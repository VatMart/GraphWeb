import {Component} from '@angular/core';
import {ToolBarComponent} from "./component/tool-bar/tool-bar.component";
import {CanvasComponent} from "./component/canvas/canvas.component";
import {ModeManagerService} from "./service/manager/mode-manager.service";
import {GraphStateManagerService} from "./service/manager/graph-state-manager.service";
import {TabNavComponent} from "./component/tab-nav/tab-nav.component";
import {GraphMatrixViewStateManagerService} from "./service/manager/graph-matrix-view-state-manager.service";
import {EnvironmentService} from "./service/environment.service";
import {NgClass} from "@angular/common";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ToolBarComponent, CanvasComponent, TabNavComponent, NgClass],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'GraphWeb';

  isMobileDevice: boolean;

  constructor(private modeManagerService: ModeManagerService,
              private graphStateManager: GraphStateManagerService,
              private matrixManager: GraphMatrixViewStateManagerService,
              private environmentService: EnvironmentService) {
    this.isMobileDevice = this.environmentService.isMobile();
  }

}
