import {Component} from '@angular/core';
import {ToolBarComponent} from "./component/tool-bar/tool-bar.component";
import {ClarityModule} from "@clr/angular";
import '@clr/icons';
import '@clr/icons/clr-icons.min.css';
import '@cds/core/icon/register.js';
import {CanvasComponent} from "./component/canvas/canvas.component";
import {ModeManagerService} from "./service/event/mode-manager.service";
import {GraphStateManagerService} from "./service/graph-state-manager.service";
import {TabNavComponent} from "./component/left-side-nav/tab-nav.component";
import {GraphMatrixViewStateManagerService} from "./service/graph-matrix-view-state-manager.service";
import {EnvironmentService} from "./service/environment.service";
import {NgClass} from "@angular/common";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ToolBarComponent, CanvasComponent, ClarityModule, TabNavComponent, NgClass],
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
