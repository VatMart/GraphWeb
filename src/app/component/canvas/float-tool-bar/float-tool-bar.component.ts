import {ChangeDetectorRef, Component, OnDestroy, OnInit, Renderer2} from '@angular/core';
import {RippleModule} from "primeng/ripple";
import {SvgIconService} from "../../../service/svg-icon.service";
import {SvgIconDirective} from "../../../directive/svg-icon.directive";
import {NgForOf, NgIf} from "@angular/common";
import {StateService} from "../../../service/state.service";
import {TooltipModule} from "primeng/tooltip";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-float-tool-bar',
  standalone: true,
  imports: [
    RippleModule,
    SvgIconDirective,
    NgIf,
    NgForOf,
    TooltipModule
  ],
  templateUrl: './float-tool-bar.component.html',
  styleUrl: './float-tool-bar.component.css'
})
export class FloatToolBarComponent implements OnInit, OnDestroy {
  public static readonly DEFAULT_FORCE_MODE_ACTIVE: boolean = false; // TODO move to separate service // TODO set to true by default
  private subscriptions = new Subscription();

  items!: FloatToolBarItem[];

  constructor(protected svgIconService: SvgIconService,
              private stateService: StateService,
              private renderer: Renderer2,
              private cdr: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this.svgIconService.addIcon('align-centre-icon', `<svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 8.5 8.5"><path fill="currentColor" d="M.075.075v2.13h.869V.944h1.193v-.87Zm6.254 0v.87h1.193v1.26h.87V.074ZM2.45 2.606V5.86h3.565V2.606ZM.075 6.397v1.994h2.062v-.869H.944V6.397Zm7.447 0v1.125H6.33v.87h2.063V6.396Z"/></svg>`);
    this.svgIconService.addIcon('force-icon', '<svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 24 24"><defs><linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#ff0000"/><stop offset="100%" stop-color="#FFC618"/></linearGradient></defs><path fill="currentColor" d="M12 0C5.383 0 0 5.383 0 12s5.383 12 12 12 12-5.383 12-12S18.617 0 12 0m0 21c-4.962 0-9-4.037-9-9s4.038-9 9-9 9 4.038 9 9-4.038 9-9 9m4.5-13.5A1.5 1.5 0 0 1 15 9h-4a.5.5 0 0 0-.5.5V11H13a1.5 1.5 0 1 1 0 3h-2.5v2.5a1.5 1.5 0 1 1-3 0v-7C7.5 7.57 9.07 6 11 6h4a1.5 1.5 0 0 1 1.5 1.5"/></svg>')
    this.items = [
      {
        icon: 'align-centre-icon',
        customIcon: true,
        isActive: false,
        command: (index: number) => {
          this.onCenterCanvasViewAlign();
        },
        tooltip: 'Center view',
        disabled: false,
      },
      {
        icon: 'force-icon',
        customIcon: true,
        isActive: FloatToolBarComponent.DEFAULT_FORCE_MODE_ACTIVE,
        command: (index: number) => {
          this.toggleForceMode(index);
        },
        tooltip: 'Toggle force mode on/off', // TODO replace to PrimeNG OverlayPanel
        disabled: false,
      }
    ];
    // Subscribe to force mode disabled state changes
    this.subscriptions.add(
      this.stateService.forceModeDisabled$.subscribe((value) => {
        this.items[1].disabled = value;
      })
    );
    // Subscribe to force mode state changes
    this.subscriptions.add(
      this.stateService.forceModeState$.subscribe((value) => {
        if (value !== null) {
          this.onForceToggleButton(value);
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private onCenterCanvasViewAlign() {
    this.stateService.needCenterCanvasView();
  }

  private toggleForceMode(index: number) {
    const isActive: boolean = this.onForceToggleButton(!this.items[index].isActive!);
    // Change force mode state
    this.stateService.changeForceModeState(isActive);
  }

  private onForceToggleButton(state: boolean) : boolean {
    this.items[1].isActive = state; // Toggle the active state
    const isActive: boolean = state;

    // Force toggle the icon gradient fill using temporary removal and re-addition (needed for mobile version)
    const svgIconContainer = document.getElementById('icon-1');
    const svgIcon = svgIconContainer?.querySelector('svg path');
    if (svgIconContainer && svgIcon) {
      const parentNode = svgIconContainer.parentNode;
      parentNode?.removeChild(svgIconContainer); // Temporarily remove the SVG container
      if (isActive) {
        this.renderer.setAttribute(svgIcon, 'fill', 'url(#grad1)');
      } else {
        this.renderer.setAttribute(svgIcon, 'fill', 'currentColor');
      }
      parentNode?.appendChild(svgIconContainer); // Add the SVG container back
    }
    this.cdr.detectChanges();
    return isActive;
  }
}

export interface FloatToolBarItem {
  icon: string;
  customIcon: boolean;
  command: (index: number) => void;
  tooltip?: string;
  isActive?: boolean;
  disabled?: boolean;
}
