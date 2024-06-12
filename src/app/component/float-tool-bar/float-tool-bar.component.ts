import {Component, OnInit} from '@angular/core';
import {RippleModule} from "primeng/ripple";
import {SvgIconService} from "../../service/svg-icon.service";
import {SvgIconDirective} from "../../directive/svg-icon.directive";
import {NgForOf, NgIf} from "@angular/common";
import {StateService} from "../../service/state.service";

@Component({
  selector: 'app-float-tool-bar',
  standalone: true,
  imports: [
    RippleModule,
    SvgIconDirective,
    NgIf,
    NgForOf
  ],
  templateUrl: './float-tool-bar.component.html',
  styleUrl: './float-tool-bar.component.css'
})
export class FloatToolBarComponent implements OnInit {
  items!: FloatToolBarItem[];
  constructor(protected svgIconService: SvgIconService,
              private stateService: StateService) {

  }

  ngOnInit(): void {
    this.svgIconService.addIcon('align-centre-icon', '<svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 8.5 8.5"><path fill="currentColor" d="M.075.075v2.13h.869V.944h1.193v-.87Zm6.254 0v.87h1.193v1.26h.87V.074ZM2.45 2.606V5.86h3.565V2.606ZM.075 6.397v1.994h2.062v-.869H.944V6.397Zm7.447 0v1.125H6.33v.87h2.063V6.396Z"/></svg>');
    this.items = [
      {
        icon: 'align-centre-icon',
        customIcon: true,
        command: (index: number) => {
          this.onCenterCanvasViewAlign();
        }
      }
    ];
  }

  private onCenterCanvasViewAlign() {
    this.stateService.needCenterCanvasView();
  }
}

export interface FloatToolBarItem {
  icon: string;
  customIcon: boolean;
  command: (index: number) => void;
}
