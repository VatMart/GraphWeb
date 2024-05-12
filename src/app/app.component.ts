import {Component, OnInit} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {HttpClient, HttpClientModule} from "@angular/common/http";
import {ToolBarComponent} from "./component/tool-bar/tool-bar.component";
import {ClarityModule} from "@clr/angular";
import {NgOptimizedImage} from "@angular/common";
import '@clr/icons';
import '@clr/icons/clr-icons.min.css';
import '@cds/core/icon/register.js';
import {CanvasComponent} from "./component/canvas/canvas.component";
import {ModeManagerService} from "./service/event/mode-manager.service";
import {GraphStateManagerService} from "./service/graph-state-manager.service";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HttpClientModule, ToolBarComponent, CanvasComponent, ClarityModule, NgOptimizedImage],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'GraphWeb';

  constructor(private http: HttpClient,
              private modeManagerService: ModeManagerService,
              private graphStateManager: GraphStateManagerService) {}

  async ngOnInit(): Promise<void> {
  }

}
