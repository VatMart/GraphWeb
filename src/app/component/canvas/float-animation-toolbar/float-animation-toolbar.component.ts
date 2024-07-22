import {Component, HostListener, OnDestroy, OnInit} from '@angular/core';
import {animate, state, style, transition, trigger} from "@angular/animations";
import {Subscription} from "rxjs";
import {NgClass, NgIf} from "@angular/common";
import {SvgIconService} from "../../../service/svg-icon.service";
import {Ripple} from "primeng/ripple";
import {SvgIconDirective} from "../../../directive/svg-icon.directive";
import {TooltipModule} from "primeng/tooltip";
import {EnvironmentService} from "../../../service/config/environment.service";
import {MenuModule} from "primeng/menu";
import {MenuItem} from "primeng/api";
import {StateService} from "../../../service/event/state.service";

/**
 * Float animation toolbar component.
 * Uses for managing algorithm animations.
 */
@Component({
  selector: 'app-float-animation-toolbar',
  standalone: true,
  imports: [
    NgClass,
    NgIf,
    Ripple,
    SvgIconDirective,
    TooltipModule,
    MenuModule
  ],
  templateUrl: './float-animation-toolbar.component.html',
  styleUrl: './float-animation-toolbar.component.css',
  animations: [
    trigger('slideIn', [
      state('in', style({
        transform: 'translateY(0)'
      })),
      transition('void => in', [
        style({transform: 'translateY(100%)'}),
        animate('200ms ease-in')
      ])
    ])
  ]
})
export class FloatAnimationToolbarComponent implements OnInit, OnDestroy {
  private subscriptions!: Subscription;
  isMobile: boolean;

  canStepBack: boolean = false;
  canPlay: boolean = true;
  canStepForward: boolean = true;
  canGoToStep: boolean = true;
  canChangeSpeed: boolean = true;
  speedValue: number = 1;
  isPlaying: boolean = false; // Indicates if the animation is playing

  // Speed select dropdown button (only for mobile version)
  speedItems: MenuItem[] | undefined;

  totalSteps: number; // Total steps in the animation
  currentStep: number = 0; // Current step in the animation

  constructor(protected svgIconService: SvgIconService,
              private environmentService: EnvironmentService,
              private stateService: StateService) {
    this.isMobile = this.environmentService.isMobile();
    this.totalSteps = this.stateService.getTotalAlgorithmSteps();
  }

  ngOnInit(): void {
    this.svgIconService.addIcon('play-alg-icon', '<svg xmlns="http://www.w3.org/2000/svg" height="38" viewBox="0 -960 960 960" width="38"><path fill="currentColor" d="m380-300 280-180-280-180zM480-80q-83 0-156-31.5T197-197t-85.5-127T80-480t31.5-156T197-763t127-85.5T480-880t156 31.5T763-763t85.5 127T880-480t-31.5 156T763-197t-127 85.5T480-80m0-80q134 0 227-93t93-227-93-227-227-93-227 93-93 227 93 227 227 93m0-320"/></svg>');
    this.svgIconService.addIcon('step-forward-icon', '<svg xmlns="http://www.w3.org/2000/svg" height="38" viewBox="100 -850 750 750" width="38" fill="currentColor"><path d="M673.33-240v-480H740v480zM220-240v-480l350.67 240zm66.67-126.67 166-113.33-166-113.33z"/></svg>');
    this.svgIconService.addIcon('step-back-icon', '<svg xmlns="http://www.w3.org/2000/svg" height="38" viewBox="100 -850 750 750" width="38" fill="currentColor"><path d="M220-240v-480h66.67v480zm520 0L389.33-480 740-720zm-66.67-126.67v-226.66L507.33-480z"/></svg>');
    this.svgIconService.addIcon('pause-alg-icon', '<svg xmlns="http://www.w3.org/2000/svg" height="38" viewBox="0 -960 960 960" width="38"><path fill="currentColor" d="M366.67-320h66.66v-320h-66.66zm160 0h66.66v-320h-66.66zM480-80q-82.33 0-155.33-31.5t-127.34-85.83Q143-251.67 111.5-324.67T80-480q0-83 31.5-156t85.83-127q54.34-54 127.34-85.5T480-880q83 0 156 31.5T763-763t85.5 127T880-480q0 82.33-31.5 155.33T763-197.33Q709-143 636-111.5T480-80m0-66.67q139.33 0 236.33-97.33t97-236q0-139.33-97-236.33t-236.33-97q-138.67 0-236 97T146.67-480q0 138.67 97.33 236t236 97.33M480-480"/></svg>');
    this.speedItems = [
      {
        label: 'Speed level',
        items: [
          {
            label: '0.5X', command: () => {
              this.onMobileSpeedChange(0.5);
            }
          },
          {
            label: '1X', command: () => {
              this.onMobileSpeedChange(1);
            }
          },
          {
            label: '1.5X', command: () => {
              this.onMobileSpeedChange(1.5);
            }
          },
          {
            label: '2X', command: () => {
              this.onMobileSpeedChange(2);
            }
          },
          {
            label: '2.5X', command: () => {
              this.onMobileSpeedChange(2.5);
            }
          },
          {
            label: '3X', command: () => {
              this.onMobileSpeedChange(3.);
            }
          },
        ]
      }
    ];

    // Init subscriptions
    this.subscriptions = new Subscription();
    // Current step state
    this.subscriptions.add(
      this.stateService.changeAlgorithmCurrentStep$.subscribe((value: number) => {
        this.currentStep = value;
      })
    );
    // Subscribe to algorithm playing state
    this.subscriptions.add(
      this.stateService.isAlgorithmPlaying$.subscribe((value: boolean) => {
        this.isPlaying = value;
      })
    );
    // Can algorithm play state
    this.subscriptions.add(
      this.stateService.canAlgorithmPlay$.subscribe((value: boolean) => {
        this.canPlay = value;
      })
    );
    // Can step forward state
    this.subscriptions.add(
      this.stateService.canAlgorithmStepForward$.subscribe((value: boolean) => {
        this.canStepForward = value;
      })
    );
    // Can step backward state
    this.subscriptions.add(
      this.stateService.canAlgorithmStepBackward$.subscribe((value: boolean) => {
        this.canStepBack = value;
      })
    );
    // Can go to step state
    this.subscriptions.add(
      this.stateService.canAlgorithmGoToStep$.subscribe((value: boolean) => {
        this.canGoToStep = value
      })
    );
    // Can change speed state
    this.subscriptions.add(
      this.stateService.canAlgorithmChangeSpeed$.subscribe((value: boolean) => {
        this.canChangeSpeed = value;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    console.log("Key pressed: " + event.key);
    if (event.key.toLowerCase() === 'arrowright' && this.canStepForward) {
      this.onStepForwardButton();
    }
    if (event.key.toLowerCase() === 'arrowleft' && this.canStepBack) {
      this.onStepBackButton();
    }
  }

  onStepBackButton() {
    this.stateService.algorithmAnimationStepBackward();
  }

  onPlayButton() {
    this.stateService.algorithmAnimationPlay();
  }

  onPauseButton() {
    this.stateService.algorithmAnimationPause();
  }

  onStepForwardButton() {
    this.stateService.algorithmAnimationStepForward();
  }

  onGoToStep(event: Event) {
    const step = (event.target as HTMLInputElement).valueAsNumber;
    this.stateService.algorithmAnimationGoToStep(step);
  }

  onSpeedChange(event: Event) {
    this.speedValue = (event.target as HTMLInputElement).valueAsNumber;
    this.stateService.algorithmAnimationChangeSpeed(this.speedValue);
  }

  onMobileSpeedChange(value: number) {
    this.speedValue = value;
    this.stateService.algorithmAnimationChangeSpeed(this.speedValue);
  }
}
