import {ChangeDetectorRef, Component, ElementRef, Input, OnInit, Renderer2, ViewChild} from '@angular/core';
import {CommonModule, NgClass, NgForOf, NgIf} from "@angular/common";
import {OutputViewComponent} from "./matrix-view/output-view.component";
import {StateService} from "../../service/state.service";
import {EnvironmentService} from "../../service/environment.service";
import {TabMenuModule} from "primeng/tabmenu";
import {MenuItem} from "primeng/api";
import {RippleModule} from "primeng/ripple";
import {SvgIconService} from "../../service/svg-icon.service";
import {SvgIconDirective} from "../../directive/svg-icon.directive";
import {Sidebar, SidebarModule} from "primeng/sidebar";

// ClarityIcons.addIcons(['matrix-adjacency', '<svg width="32" height="32" viewBox="0 1 60 60" xmlns="http://www.w3.org/2000/svg"><path d="M18 13V4h-2v2h-3v2h3v5h-3v2h8v-2zm-1.5 7a3.5 3.5 0 1 1-3.5 3.5 3.5 3.5 0 0 1 3.5-3.5m0-2a5.5 5.5 0 1 0 5.5 5.5 5.5 5.5 0 0 0-5.5-5.5M8 30H2V2h6v2H4v24h4zm22 0h-6v-2h4V4h-4V2h6z"/></svg>']);
// ClarityIcons.addIcons(['matrix-incidence', '<svg width="32" height="32" viewBox="0 1 60 60" xmlns="http://www.w3.org/2000/svg"><path d="M18 13V4h-2v2h-3v2h3v5h-3v2h8v-2zm-1.5 7a3.5 3.5 0 1 1-3.5 3.5 3.5 3.5 0 0 1 3.5-3.5m0-2a5.5 5.5 0 1 0 5.5 5.5 5.5 5.5 0 0 0-5.5-5.5M8 30H2V2h6v2H4v24h4zm22 0h-6v-2h4V4h-4V2h6zM8.903 9.427h3.871v1.935H8.903z"/></svg>']);
// ClarityIcons.addIcons(['close-panel', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48"><path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2m4.707 13.293a.999.999 0 1 1-1.414 1.414L12 13.414l-3.293 3.293a.997.997 0 0 1-1.414 0 1 1 0 0 1 0-1.414L10.586 12 7.293 8.707a.999.999 0 1 1 1.414-1.414L12 10.586l3.293-3.293a.999.999 0 1 1 1.414 1.414L13.414 12z"/></svg>']);

@Component({
  selector: 'app-tab-nav',
  standalone: true,
  imports: [CommonModule, NgClass, NgIf, NgForOf, OutputViewComponent, TabMenuModule, RippleModule,
    SvgIconDirective, SidebarModule],
  templateUrl: './tab-nav.component.html',
  styleUrl: './tab-nav.component.css'
})
export class TabNavComponent implements OnInit {

  isMobileDevice: boolean;
  items: MenuItem[] | undefined;

  // Desktop
  @Input() activeIndex: number | null = null;
  verticalNavExpanded: boolean = false;

  // Mobile
  @ViewChild('sidebarRef') sidebarRef!: Sidebar;
  @ViewChild('mobileTabNav') bottomNavbar!: ElementRef;
  @ViewChild('mobileSidebarHeader') header!: ElementRef;
  @ViewChild('mobileSidebarContent') content!: ElementRef;
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
    this.svgIconService.addIcon('matrix-icon', '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="2 0 20 20"><path fill="currentColor" d="M3 4v16h3v-2H5V6h1V4zm15 0v2h1v12h-1v2h3V4zm-3.248 4.424c-.499-.01-1.002.113-1.406.39-.26.18-.484.408-.74.627-.392-.777-1.098-.984-1.905-.998-.818-.013-1.451.358-2.02 1.036V8.64H7v6.347h1.787s-.003-2.38.002-3.554c.001-.21.012-.422.055-.627.132-.628.67-1.015 1.314-.963.613.05.892.383.922 1.107.005.126.008 4.033.008 4.033h1.81s-.007-2.471.004-3.521c.003-.271.03-.549.096-.81.148-.589.625-.876 1.273-.805.572.062.859.378.9 1V15h1.804s.029-3.12 0-4.602a2.2 2.2 0 0 0-.24-.902c-.333-.667-1.152-1.055-1.983-1.072"/></svg>');
    this.items = [
      {label: 'Output view', id: 'output', icon: 'matrix-icon', header: 'Output view', customIcon: true},
      {label: 'Test1', icon: 'pi pi-chart-line'},
      {label: 'Test2', icon: 'pi pi-list'},
      {label: 'Test3', icon: 'pi pi-inbox'}
    ];
  }

  onCloseLeftSideContainer() {
    this.activeIndex = null;
    this.useCloseButtonGradient = false;
    this.stateService.changedOutputViewVisibility(false); // TODO change when more components will be added
    // Resize canvas on UI changes
    this.cdr.detectChanges();
    this.stateService.needResizeCanvas();
  }

  onToggleExpandVerticalNav($event: MouseEvent) {
    this.verticalNavExpanded = !this.verticalNavExpanded;
    this.cdr.detectChanges();
    this.stateService.needResizeCanvas();
  }

  onDesktopNavItemClick(index: number) {
    this.activeIndex = index;
    console.log('Desktop nav item clicked:', index);
    // Resize canvas on UI changes
    this.cdr.detectChanges();
    this.stateService.needResizeCanvas();
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
      this.cdr.detectChanges();
      this.setContentHeight();
    }
  }

  onBottomPanelHide(event: any) {
    this.bottomPanelVisible = false;
    if (this.items) {
      this.activeItem = undefined;
    }
  }

  private setContentHeight() {
    const headerHeight = this.header.nativeElement.offsetHeight;
    const bottomNavbarHeight = this.bottomNavbar.nativeElement.offsetHeight;
    console.log('headerHeight:', headerHeight);
    const windowHeight = window.innerHeight;
    const contentHeight = windowHeight - headerHeight - bottomNavbarHeight - 8;
    this.renderer.setStyle(this.content.nativeElement, 'max-height', `${contentHeight}px`);
  }
}
