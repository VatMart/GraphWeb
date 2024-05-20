import {Component} from '@angular/core';
import {ToolBarComponent} from "./component/tool-bar/tool-bar.component";
import {ClarityModule} from "@clr/angular";
import '@clr/icons';
import '@clr/icons/clr-icons.min.css';
import '@cds/core/icon/register.js';
import {CanvasComponent} from "./component/canvas/canvas.component";
import {ModeManagerService} from "./service/event/mode-manager.service";
import {GraphStateManagerService} from "./service/graph-state-manager.service";
import {LeftSideNavComponent} from "./component/left-side-nav/left-side-nav.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ToolBarComponent, CanvasComponent, ClarityModule, LeftSideNavComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'GraphWeb';

  constructor(private modeManagerService: ModeManagerService,
              private graphStateManager: GraphStateManagerService) {
  }

}
