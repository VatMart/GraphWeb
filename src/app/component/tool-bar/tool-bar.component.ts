import { Component } from '@angular/core';
import {CdkMenu, CdkMenuItem, CdkMenuTrigger} from '@angular/cdk/menu';
import {ClarityModule} from "@clr/angular";
import {BrowserModule} from "@angular/platform-browser";

@Component({
  selector: 'app-tool-bar',
  standalone: true,
  imports: [ClarityModule, CdkMenuTrigger, CdkMenu, CdkMenuItem],
  templateUrl: './tool-bar.component.html',
  styleUrl: './tool-bar.component.css'
})
export class ToolBarComponent {

}
