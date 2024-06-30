import {ChangeDetectorRef, Component, ElementRef, Input, OnInit, Renderer2, ViewChild} from '@angular/core';
import {CommonModule, NgClass, NgForOf, NgIf} from "@angular/common";
import {OutputViewComponent} from "./output-view/output-view.component";
import {StateService} from "../../service/event/state.service";
import {EnvironmentService} from "../../service/config/environment.service";
import {TabMenuModule} from "primeng/tabmenu";
import {MenuItem} from "primeng/api";
import {RippleModule} from "primeng/ripple";
import {SvgIconService} from "../../service/svg-icon.service";
import {SvgIconDirective} from "../../directive/svg-icon.directive";
import {Sidebar, SidebarModule} from "primeng/sidebar";
import {InputViewComponent} from "./input-view/input-view.component";
import {CustomizationViewComponent} from "./customization-view/customization-view.component";

/**
 * Component for the tab navigation.
 * In mobile version its placed in bottom of the screen.
 * In desktop version its placed in left side of the screen.
 */
@Component({
  selector: 'app-tab-nav',
  standalone: true,
  imports: [CommonModule, NgClass, NgIf, NgForOf, OutputViewComponent, TabMenuModule, RippleModule,
    SvgIconDirective, SidebarModule, InputViewComponent, CustomizationViewComponent],
  templateUrl: './tab-nav.component.html',
  styleUrl: './tab-nav.component.css'
})
export class TabNavComponent implements OnInit {

  isMobileDevice: boolean;
  items: MenuItem[] | undefined;

  // Desktop
  @Input() activeIndex: number | null = null;
  @ViewChild('desktopSidebarHeader') desktopHeader!: ElementRef;
  @ViewChild('desktopSidebarContent') desktopSidebarContent!: ElementRef;
  verticalNavExpanded: boolean = false;

  // Mobile
  @ViewChild('sidebarRef') sidebarRef!: Sidebar;
  @ViewChild('mobileTabNav') bottomNavbar!: ElementRef;
  @ViewChild('mobileSidebarHeader') mobileHeader!: ElementRef;
  @ViewChild('mobileSidebarContent') mobileSidebarContent!: ElementRef;
  activeItem: MenuItem | undefined;
  bottomPanelVisible: boolean = false;

  useCloseButtonGradient: boolean = false;

  constructor(private stateService: StateService,
              private environmentService: EnvironmentService,
              protected svgIconService: SvgIconService,
              private cdr: ChangeDetectorRef,
              private renderer: Renderer2) {
    this.isMobileDevice = this.environmentService.isMobile();
  }

  ngOnInit(): void {
    this.svgIconService.addIcon('matrix-icon', '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="2 0 20 20"><path fill="currentColor" d="M3 4v16h3v-2H5V6h1V4zm15 0v2h1v12h-1v2h3V4zm-3.248 4.424c-.499-.01-1.002.113-1.406.39-.26.18-.484.408-.74.627-.392-.777-1.098-.984-1.905-.998-.818-.013-1.451.358-2.02 1.036V8.64H7v6.347h1.787s-.003-2.38.002-3.554c.001-.21.012-.422.055-.627.132-.628.67-1.015 1.314-.963.613.05.892.383.922 1.107.005.126.008 4.033.008 4.033h1.81s-.007-2.471.004-3.521c.003-.271.03-.549.096-.81.148-.589.625-.876 1.273-.805.572.062.859.378.9 1V15h1.804s.029-3.12 0-4.602a2.2 2.2 0 0 0-.24-.902c-.333-.667-1.152-1.055-1.983-1.072"/></svg>');
    this.svgIconService.addIcon('algorithm-icon', '<svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 24 24"><path fill="#fe6b00" d="m14.996 13.038 2.266-.22a3.5 3.5 0 0 0 3.238 2.181c1.93 0 3.5-1.57 3.5-3.5s-1.57-3.5-3.5-3.5a3.5 3.5 0 0 0-3.432 2.829l-2.458.238a5 5 0 0 0-.957-1.456l1.839-2.776c.321.098.655.166 1.008.166C18.43 7 20 5.43 20 3.5S18.43 0 16.5 0 13 1.57 13 3.5c0 .851.318 1.622.824 2.229L12.029 8.44C11.407 8.162 10.724 8 10 8s-1.407.162-2.029.44L6.176 5.729A3.47 3.47 0 0 0 7 3.5C7 1.57 5.43 0 3.5 0S0 1.57 0 3.5 1.57 7 3.5 7c.353 0 .687-.068 1.008-.166L6.347 9.61A4.97 4.97 0 0 0 5 13c0 1.129.391 2.161 1.025 2.999l-1.112 1.304A3.5 3.5 0 0 0 3.501 17c-1.93 0-3.5 1.57-3.5 3.5s1.57 3.5 3.5 3.5 3.5-1.57 3.5-3.5c0-.7-.212-1.35-.567-1.898l1.094-1.283a4.94 4.94 0 0 0 2.473.681 4.95 4.95 0 0 0 2.948-.982l2.367 2.049a3.5 3.5 0 0 0-.315 1.434c0 1.93 1.57 3.5 3.5 3.5s3.5-1.57 3.5-3.5-1.57-3.5-3.5-3.5a3.47 3.47 0 0 0-1.875.555l-2.338-2.023a4.94 4.94 0 0 0 .709-2.493ZM20.5 10c.827 0 1.5.673 1.5 1.5s-.673 1.5-1.5 1.5-1.5-.673-1.5-1.5.673-1.5 1.5-1.5m-4-8c.827 0 1.5.673 1.5 1.5S17.327 5 16.5 5 15 4.327 15 3.5 15.673 2 16.5 2M2 3.5C2 2.673 2.673 2 3.5 2S5 2.673 5 3.5 4.327 5 3.5 5 2 4.327 2 3.5M3.5 22c-.827 0-1.5-.673-1.5-1.5S2.673 19 3.5 19s1.5.673 1.5 1.5S4.327 22 3.5 22m6.5-6c-1.654 0-3-1.346-3-3s1.346-3 3-3 3 1.346 3 3-1.346 3-3 3m8.5 3c.827 0 1.5.673 1.5 1.5s-.673 1.5-1.5 1.5-1.5-.673-1.5-1.5.673-1.5 1.5-1.5"/></svg>')
    this.items = [
      {label: 'Output', id: 'output', icon: 'matrix-icon', header: 'Graph output', customIcon: true},
      {label: 'Input', id: 'input', icon: 'pi pi-pen-to-square', header: 'Input graph data'},
      {label: 'Algorithms', id: 'algorithms', icon: 'algorithm-icon', header: 'Graph algorithms', customIcon: true},
      {label: 'Customization', id: 'customization', icon: 'pi pi-palette', header: 'Graph customization'},
      {label: 'Generate graph', id: 'generation', icon: 'pi pi-wrench', header: 'Graph generation'}
    ];
  }

  onCloseLeftSideContainer() {
    this.activeIndex = null;
    this.useCloseButtonGradient = false;
    this.stateService.changedOutputViewVisibility(false); // TODO change when more components will be added
    // Resize canvas on UI changes
    this.cdr.detectChanges();
  }

  onToggleExpandVerticalNav($event: MouseEvent) {
    this.verticalNavExpanded = !this.verticalNavExpanded;
    this.cdr.detectChanges();
  }

  onDesktopNavItemClick(index: number) {
    this.activeIndex = index;
    console.log('Desktop nav item clicked:', index);
    // Resize canvas on UI changes
    this.cdr.detectChanges();
    this.setDesktopSidebarContentHeight();
  }

  // ----------------
  // Mobile UI logic
  // ----------------
  onCloseMobileSidebar(e: MouseEvent) {
    this.bottomPanelVisible = false;
    if (this.items) {
      this.activeItem = undefined;
    }
    this.sidebarRef.close(e);
  }

  onMobileTabMenuActiveItemChange(index: number) {
    if (!this.items) {
      return;
    }
    if (this.activeItem !== this.items[index]) {
      this.bottomPanelVisible = true;
      this.sidebarRef.el.nativeElement.focus();
      this.cdr.detectChanges();
      this.setMobileSidebarContentHeight();
    }
  }

  onBottomPanelHide(event: any) {
    this.bottomPanelVisible = false;
    if (this.items) {
      this.activeItem = undefined;
    }
  }

  private setMobileSidebarContentHeight() {
    const headerHeight = this.mobileHeader.nativeElement.offsetHeight;
    const bottomNavbarHeight = this.bottomNavbar.nativeElement.offsetHeight;
    console.log('headerHeight:', headerHeight);
    const windowHeight = window.innerHeight;
    const contentHeight = windowHeight - headerHeight - bottomNavbarHeight - 16;
    this.renderer.setStyle(this.mobileSidebarContent.nativeElement, 'max-height', `${contentHeight}px`);
  }

  private setDesktopSidebarContentHeight() {
    const headerHeight = this.desktopHeader.nativeElement.offsetHeight;
    const toolbarHeight = document.getElementById('toolbar')!.offsetHeight; // TODO get from toolbar
    const windowHeight = window.innerHeight;
    const contentHeight = windowHeight - headerHeight - toolbarHeight - 32;
    this.renderer.setStyle(this.desktopSidebarContent.nativeElement, 'max-height', `${contentHeight}px`);
  }
}
