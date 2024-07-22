import {ChangeDetectorRef, Component, OnDestroy, OnInit, Renderer2} from '@angular/core';
import {RippleModule} from "primeng/ripple";
import {SvgIconService} from "../../../service/svg-icon.service";
import {SvgIconDirective} from "../../../directive/svg-icon.directive";
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {StateService} from "../../../service/event/state.service";
import {TooltipModule} from "primeng/tooltip";
import {Subscription} from "rxjs";
import {ConfService} from "../../../service/config/conf.service";
import {EnvironmentService} from "../../../service/config/environment.service";

@Component({
  selector: 'app-float-tool-bar',
  standalone: true,
  imports: [
    RippleModule,
    SvgIconDirective,
    NgIf,
    NgForOf,
    TooltipModule,
    NgClass
  ],
  templateUrl: './float-tool-bar.component.html',
  styleUrl: './float-tool-bar.component.css'
})
export class FloatToolBarComponent implements OnInit, OnDestroy {
  private subscriptions!: Subscription;
  public isMobile: boolean = false;

  items!: FloatToolBarItem[];

  // Algorithm mode state
  isAlgorithmModeActive: boolean = false;

  constructor(protected svgIconService: SvgIconService,
              private stateService: StateService,
              private renderer: Renderer2,
              private cdr: ChangeDetectorRef,
              private environmentService: EnvironmentService) {
    this.isMobile = this.environmentService.isMobile();
  }

  ngOnInit(): void {
    this.svgIconService.addIcon('align-centre-icon', `<svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 8.5 8.5"><path fill="currentColor" d="M.075.075v2.13h.869V.944h1.193v-.87Zm6.254 0v.87h1.193v1.26h.87V.074ZM2.45 2.606V5.86h3.565V2.606ZM.075 6.397v1.994h2.062v-.869H.944V6.397Zm7.447 0v1.125H6.33v.87h2.063V6.396Z"/></svg>`);
    this.svgIconService.addIcon('force-icon', '<svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 24 24"><defs><linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#ff0000"/><stop offset="100%" stop-color="#FFC618"/></linearGradient></defs><path fill="currentColor" d="M12 0C5.383 0 0 5.383 0 12s5.383 12 12 12 12-5.383 12-12S18.617 0 12 0m0 21c-4.962 0-9-4.037-9-9s4.038-9 9-9 9 4.038 9 9-4.038 9-9 9m4.5-13.5A1.5 1.5 0 0 1 15 9h-4a.5.5 0 0 0-.5.5V11H13a1.5 1.5 0 1 1 0 3h-2.5v2.5a1.5 1.5 0 1 1-3 0v-7C7.5 7.57 9.07 6 11 6h4a1.5 1.5 0 0 1 1.5 1.5"/></svg>');
    this.svgIconService.addIcon('selection-mode-icon', '<svg xmlns="http://www.w3.org/2000/svg" height="25px" viewBox="80 -880 800 800" width="25px"><defs><linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#ff0000"/><stop offset="100%" stop-color="#FFC618"/></linearGradient></defs><path fill="currentColor" d="M147.67-517.33 81-524q5.33-46 20.17-89.83Q116-657.67 141-696l56.67 36q-19.34 33-31.84 69t-18.16 73.67Zm48.66 316.66Q164-232 139.67-270.17q-24.34-38.16-38.67-82.5L165-374q12.67 36.33 32.33 67.83Q217-274.67 243.67-248l-47.34 47.33ZM301-763.33 265-820q39.67-25 82.5-39.5t90.17-20.5l6.66 66.67q-39.66 5-74.33 17.16-34.67 12.17-69 32.84ZM485-82q-37 0-72.5-5.83-35.5-5.84-67.5-17.5l23.33-64q27 9.66 57.34 14.83 30.33 5.17 59.33 5.83V-82Zm230-632q-28-28-60.17-48.67-32.16-20.66-69.16-33.33l22.66-63.33q45.67 15.66 84.17 40.66 38.5 25 69.83 57.34L715-714Zm90.67 598L681-240.67v121.34h-66.67V-354H849v66.67H727.67l124.66 124.66L805.67-116Zm6.66-367.33q-.66-29-5.5-58-4.83-29-15.83-56L855-618q12.33 32 18.17 65.83 5.83 33.84 5.83 68.84h-66.67Z"/></svg>');
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
        hidden: false,
      },
      {
        icon: 'selection-mode-icon',
        customIcon: true,
        isActive: false,
        command: (index: number) => {
          // Change force mode state
          const state = !this.items[index].isActive!;
          this.onToggleButton(state, index);
          this.stateService.changeSelectionModeState(state);
        },
        tooltip: 'Toggle selection mode on/off',
        disabled: false,
        hidden: !this.isMobile, // Hide selection mode on desktop
      },
      {
        icon: 'force-icon',
        customIcon: true,
        isActive: false,
        command: (index: number) => {
          // Change force mode state
          this.stateService.changeForceModeState(!this.items[index].isActive!);
        },
        tooltip: 'Toggle force mode on/off', // TODO replace to PrimeNG OverlayPanel
        disabled: false,
        hidden: false,
      }
    ];
    this.subscriptions = new Subscription();
    // Subscribe to current mode state changes
    this.subscriptions.add(
      this.stateService.currentMode$.subscribe(state => {
      if (this.items[1].isActive && state !== 'SelectionMode') {
        this.onToggleButton(false, 1);
      }
    }));
    this.subscriptions.add(
      this.stateService.currentMode$.subscribe(state => {
        if (state != 'default') {
          this.stateService.changeForceModeDisabledState(true);
        } else {
          this.stateService.changeForceModeDisabledState(false);
        }
      })
    );
    // Subscribe to force mode disabled state changes
    this.subscriptions.add(
      this.stateService.forceModeDisabled$.subscribe((value) => {
        this.items[2].disabled = value;
      })
    );
    // Subscribe to force mode state changes
    this.subscriptions.add(
      this.stateService.forceModeStateChanged$.subscribe((value) => {
        if (value) {
          this.toggleForceMode();
          console.log('Force mode hidden: ' + this.items[2].isActive);
        }
      })
    );
    // On enable algorithm mode
    this.subscriptions.add(
      this.stateService.algorithmModeStateChanged$.subscribe((value) => {
        if (this.isAlgorithmModeActive !== value) {
          this.toggleAlgorithmModeStyles(value);
        }
      })
    );
    if (ConfService.DEFAULT_FORCE_MODE_ON) { // Enable force mode by default on start
      this.toggleForceMode();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private onCenterCanvasViewAlign() {
    this.stateService.needCenterCanvasView();
  }

  private toggleForceMode() {
    this.onToggleButton(!this.items[2].isActive!, 2);
  }

  private toggleAlgorithmModeStyles(value: boolean) {
    this.isAlgorithmModeActive = value;
    this.items[1].hidden = value || !this.isMobile; // Hide selection mode on algorithm mode
    this.items[2].hidden = value; // Hide force mode on algorithm mode
  }

  private onToggleButton(state: boolean, index: number) : boolean {
    this.items[index].isActive = state; // Toggle the active state
    const isActive: boolean = state;
    this.cdr.detectChanges(); // Need to detect on init state of components
    // Force toggle the icon gradient fill using temporary removal and re-addition (needed for mobile version)
    const svgIconContainer = document.getElementById('icon-' + index);
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
  hidden?: boolean;
}
