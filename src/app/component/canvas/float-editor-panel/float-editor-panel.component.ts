import {ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, Renderer2, ViewChild} from '@angular/core';
import {Ripple} from "primeng/ripple";
import {SvgIconService} from "../../../service/svg-icon.service";
import {StateService} from "../../../service/event/state.service";
import {NgForOf, NgIf} from "@angular/common";
import {Subscription} from "rxjs";
import {EnvironmentService} from "../../../service/config/environment.service";
import {SvgIconDirective} from "../../../directive/svg-icon.directive";
import {TooltipModule} from "primeng/tooltip";
import {OverlayPanel, OverlayPanelModule} from "primeng/overlaypanel";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {DialogService, DynamicDialogRef} from "primeng/dynamicdialog";
import {EditNodeLabelDialogComponent} from "./edit-graph-element-dialog/edit-node-label-dialog.component";

/**
 * Component for the floating editor panel.
 * It is used for editing selected graph elements.
 */
@Component({
  selector: 'app-float-editor-panel',
  standalone: true,
  imports: [
    Ripple,
    NgForOf,
    NgIf,
    SvgIconDirective,
    TooltipModule,
    OverlayPanelModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [DialogService],
  templateUrl: './float-editor-panel.component.html',
  styleUrl: './float-editor-panel.component.css'
})
export class FloatEditorPanelComponent implements OnInit, OnDestroy {
  private subscriptions!: Subscription;
  isMobile: boolean;
  // TODO
  isSingularSelection: boolean = true;
  isMultipleSelection: boolean = false;
  isEdgeSelection: boolean = false;
  isNodeSelection: boolean = true;
  isDragging: boolean = false;

  // TODO
  nodeItems: NodeItem[] = [];
  edgeItems: EdgeItem[] = [];

  // Color items
  colorItems: ColorItem[] = [];
  nodeColorItems: ColorItem[] = [];
  edgeColorItems: ColorItem[] = [];

  ref: DynamicDialogRef | undefined;

  constructor(protected svgIconService: SvgIconService,
              public dialogService: DialogService,
              private environmentService: EnvironmentService,
              private stateService: StateService,
              private renderer: Renderer2,
              private cdr: ChangeDetectorRef) {
    this.isMobile = this.environmentService.isMobile();
  }

  ngOnInit(): void {
    this.svgIconService.addIcon('editWeightIcon', `<svg xmlns="http://www.w3.org/2000/svg" height="1.5rem" viewBox="100 -850 750 750" width="1.5rem"><path fill="currentColor" d="M480-280h80v-400H400v80h80v320ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm0-560v560-560Z"/></svg>`);
    this.svgIconService.addIcon('editNodeLabel', `<svg xmlns="http://www.w3.org/2000/svg" height="1.5rem" viewBox="100 -850 750 750" width="1.5rem"><path fill="currentColor"  d="M80-120v-66.67h800V-120H80Zm693.33-160v-560H820v560h-46.67ZM160-280l216.67-560h86.66L680-280h-82l-54.67-148.67h-246L242-280h-82Zm162.67-217.33h194.66l-95.33-258h-4l-95.33 258Z"/></svg>`);
    this.edgeItems = [
      {
        customIcon: false,
        icon: 'pi pi-palette',
        label: 'Colors',
        tooltip: 'Change edge colors',
        allowMultiple: true,
        command: (index: number, event: MouseEvent, op?: OverlayPanel) => {
          this.toggleOverlayPanel(op!, event, index);
        }
      },
      {
        customIcon: true,
        icon: 'editWeightIcon',
        label: 'Weight',
        tooltip: 'Edit edge weight',
        allowMultiple: false,
        command: (index: number, event: MouseEvent, op?: OverlayPanel) => {
          this.showEditEdgeWeightInput();
        }
      },
    ];
    this.nodeItems = [
      {
        customIcon: false,
        icon: 'pi pi-palette',
        label: 'Colors',
        tooltip: 'Change node colors',
        allowMultiple: true,
        command: (index: number, event: MouseEvent, op?: OverlayPanel) => {
          this.toggleOverlayPanel(op!, event, index);
        }
      },
      {
        customIcon: true,
        icon: 'editNodeLabel',
        label: 'Label',
        tooltip: 'Change node label',
        allowMultiple: false,
        command: (index: number, event: MouseEvent, op?: OverlayPanel) => {
          this.openEditNodeLabelDialog();
        }
      },
    ];
    // Color items
    this.colorItems = [
      {
        label: 'Fill',
        color: '#FFFFFF',
        graphElement: 'node'
      },
      {
        label: 'Label',
        color: '#FFFFFF',
        graphElement: 'node'
      },
      {
        label: 'Stroke',
        color: '#FFFFFF',
        graphElement: 'node'
      },
      {
        label: 'Stroke',
        color: '#FFFFFF',
        graphElement: 'edge'
      },
      {
        label: 'Arrow',
        color: '#FFFFFF',
        graphElement: 'edge'
      },
      {
        label: 'Weight',
        color: '#FFFFFF',
        graphElement: 'edge'
      },
    ]
    this.nodeColorItems = this.colorItems.filter((item) => item.graphElement === 'node');
    this.edgeColorItems = this.colorItems.filter((item) => item.graphElement === 'edge');
  }

  ngOnDestroy(): void {
  }

  toggleOverlayPanel(op: OverlayPanel, event: MouseEvent, i: number) {
    op.toggle(event);
    console.log('toggleOverlayPanel', i); // TODO remove
  }

  openEditNodeLabelDialog() {
    this.dialogService.open(EditNodeLabelDialogComponent, {
      header: 'Edit Node Label',
      contentStyle: { overflow: 'auto'},
      breakpoints: { '960px': '75vw', '640px': '90vw' },
      modal: true,
      dismissableMask: true,
    });
  }

  showEditEdgeWeightInput() {
    // TODO
  }

  onDeleteSelectedClick() {
    // TODO
  }
}

export interface NodeItem {
  customIcon: boolean;
  icon: string;
  label: string;
  allowMultiple: boolean;
  command: (index: number, event: MouseEvent, op?: OverlayPanel) => void;
  tooltip?: string;
}

export interface EdgeItem {
  customIcon: boolean;
  icon: string;
  label: string;
  allowMultiple: boolean;
  command: (index: number, event: MouseEvent, op?: OverlayPanel) => void;
  tooltip?: string;
}

export interface ColorItem {
  label: string;
  color: string;
  graphElement: 'node' | 'edge';
}
