import {ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {CommonModule, NgClass, NgForOf, NgIf} from "@angular/common";
import {MatrixViewComponent} from "../matrix-view/matrix-view.component";
import {StateService} from "../../service/state.service";
import {TypeMatrix} from "../../model/graph-matrix";
import {EnvironmentService} from "../../service/environment.service";
import {TabMenuModule} from "primeng/tabmenu";
import {MenuItem} from "primeng/api";
import {RippleModule} from "primeng/ripple";
import {SvgIconService} from "../../service/svg-icon.service";
import {SvgIconDirective} from "../../directive/svg-icon.directive";
import {SidebarModule} from "primeng/sidebar";

// ClarityIcons.addIcons(['matrix-icon', '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="3 3 27 27"><path d="M4 4a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h1a1 1 0 1 0 0-2V6a1 1 0 1 0 0-2zm15 0a1 1 0 1 0 0 2v12a1 1 0 1 0 0 2h1a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1zm-4.25 4.426c-.499-.01-1 .113-1.404.39-.26.178-.484.406-.74.625-.392-.777-1.1-.984-1.907-.998-.817-.013-1.45.358-2.017 1.036a.84.84 0 0 0-.838-.838h-.006A.84.84 0 0 0 7 9.479v4.615a.895.895 0 0 0 1.787 0c0-.8.001-1.95.004-2.66.001-.222.01-.45.06-.664.146-.627.865-1.03 1.495-.9.485.1.708.434.734 1.081.004.087.007 1.983.008 3.145 0 .493.4.89.894.89h.022a.893.893 0 0 0 .894-.892c0-.815 0-1.987.006-2.63a3.5 3.5 0 0 1 .094-.81c.148-.588.627-.875 1.275-.804.572.063.857.379.899 1v3.257c0 .494.4.895.894.895h.024a.89.89 0 0 0 .892-.887c.004-1.039.01-2.735-.01-3.715a2.2 2.2 0 0 0-.238-.904c-.332-.667-1.153-1.053-1.984-1.07"/></svg>']);
// ClarityIcons.addIcons(['matrix-adjacency', '<svg width="32" height="32" viewBox="0 1 60 60" xmlns="http://www.w3.org/2000/svg"><path d="M18 13V4h-2v2h-3v2h3v5h-3v2h8v-2zm-1.5 7a3.5 3.5 0 1 1-3.5 3.5 3.5 3.5 0 0 1 3.5-3.5m0-2a5.5 5.5 0 1 0 5.5 5.5 5.5 5.5 0 0 0-5.5-5.5M8 30H2V2h6v2H4v24h4zm22 0h-6v-2h4V4h-4V2h6z"/></svg>']);
// ClarityIcons.addIcons(['matrix-incidence', '<svg width="32" height="32" viewBox="0 1 60 60" xmlns="http://www.w3.org/2000/svg"><path d="M18 13V4h-2v2h-3v2h3v5h-3v2h8v-2zm-1.5 7a3.5 3.5 0 1 1-3.5 3.5 3.5 3.5 0 0 1 3.5-3.5m0-2a5.5 5.5 0 1 0 5.5 5.5 5.5 5.5 0 0 0-5.5-5.5M8 30H2V2h6v2H4v24h4zm22 0h-6v-2h4V4h-4V2h6zM8.903 9.427h3.871v1.935H8.903z"/></svg>']);
// ClarityIcons.addIcons(['close-panel', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48"><path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2m4.707 13.293a.999.999 0 1 1-1.414 1.414L12 13.414l-3.293 3.293a.997.997 0 0 1-1.414 0 1 1 0 0 1 0-1.414L10.586 12 7.293 8.707a.999.999 0 1 1 1.414-1.414L12 10.586l3.293-3.293a.999.999 0 1 1 1.414 1.414L13.414 12z"/></svg>']);
// ClarityIcons.addIcons(namespaceIcon, barsIcon);

@Component({
  selector: 'app-tab-nav',
  standalone: true,
  imports: [CommonModule, NgClass, NgIf, NgForOf, MatrixViewComponent, TabMenuModule, RippleModule,
    SvgIconDirective, SidebarModule],
  templateUrl: './tab-nav.component.html',
  styleUrl: './tab-nav.component.css'
})
export class TabNavComponent implements OnInit {

  isMobileDevice: boolean;

  includeIcons = true;
  @Input() activeIndex: number | null = null;

  // Mobile
  items: MenuItem[] | undefined;
  activeItem: MenuItem | undefined;
  bottomPanelVisible: boolean = false;

  // matricesLinks = [
  //   { navName: 'Adjacency', header: 'Matrix view', iconShapeTuple: ['matrix-adjacency'] },
  //   { navName: 'Incidence', header: 'Matrix view', iconShapeTuple: ['matrix-incidence'] }
  // ];

  useCloseButtonGradient: boolean = false;

  constructor(private stateService: StateService,
              private environmentService: EnvironmentService,
              protected svgIconService: SvgIconService,
              private cdr: ChangeDetectorRef) {
    this.isMobileDevice = this.environmentService.isMobile();
  }

  ngOnInit(): void {
    this.items = [
      {label: 'hidden', visible: false},
      {label: 'Matrices', icon: 'matrix-icon', header: 'Matrix view'},
      {label: 'Test1', icon: 'pi pi-chart-line'},
      {label: 'Test2', icon: 'pi pi-list'},
      {label: 'Test3', icon: 'pi pi-inbox'}
    ];
  }

  onMatrixItemClick() {
    if (this.activeIndex !== null) {
      this.activeIndex = null;
    } else {
      this.activeIndex = 0;
      this.stateService.changedMatrixViewVisibility(true); // TODO change when more components will be added
    }
    // Resize canvas on UI changes
    this.cdr.detectChanges();
    this.stateService.needResizeCanvas();
  }

  onCloseLeftSideContainer() {
    this.activeIndex = null;
    this.useCloseButtonGradient = false;
    this.stateService.changedMatrixViewVisibility(false); // TODO change when more components will be added
    // Resize canvas on UI changes
    this.cdr.detectChanges();
    this.stateService.needResizeCanvas();
  }

  onCollapseLeftNavBar() {
    this.stateService.needResizeCanvas();
  }

  protected readonly TypeMatrix = TypeMatrix;

  // ----------------
  // Mobile UI logic
  // ----------------
  onMobileTabMenuActiveItemChange(index: number) {
    console.log('this.activeItem:', this.activeItem);
    //this.activeItem = undefined;

    if (!this.items) {
      return;
    }
    if (this.activeItem === this.items[index]) {
      // If the clicked tab is already active, deactivate it
      //this.activeItem = undefined;
      // this.activeItem = this.items[0];
      // console.log('this.activeItem:', this.activeItem);
      // this.onBottomPanelVisible(false);
      // let someElement = document.getElementsByClassName('p-element p-tabmenuitem p-highlight').item(0);
      //
      // console.log('second time: ', this.activeItem);
      // if (someElement !== null) {
      //   this.renderer.removeClass(someElement, 'p-highlight');
      // }
    } else {
      // Otherwise, activate the clicked tab
      //this.activeItem = event;
      this.bottomPanelVisible = true;
    }
  }

  private onMobileMatrixItemClick() {
    // TODO Implement
    console.log('Matrix item clicked');
  }

  onBottomPanelVisible($event: boolean) {
    console.log('onBottomPanelVisible:', $event);
    this.bottomPanelVisible = $event;
    this.stateService.changedMatrixViewVisibility($event); // TODO CHANGE
    if (this.items) {
      this.activeItem = undefined;
    }
  }

  onBottomPanelHide() {
    if (this.items) {
      //console.log('hide:');
    }
  }
}
