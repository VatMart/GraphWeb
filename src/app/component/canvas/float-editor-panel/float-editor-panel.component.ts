import {ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit, Renderer2} from '@angular/core';
import {Ripple} from "primeng/ripple";
import {SvgIconService} from "../../../service/svg-icon.service";
import {StateService} from "../../../service/event/state.service";
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {Subscription} from "rxjs";
import {EnvironmentService} from "../../../service/config/environment.service";
import {SvgIconDirective} from "../../../directive/svg-icon.directive";
import {TooltipModule} from "primeng/tooltip";
import {OverlayPanel, OverlayPanelModule} from "primeng/overlaypanel";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {DialogService, DynamicDialogRef} from "primeng/dynamicdialog";
import {EditTextElementDialogComponent} from "./edit-graph-element-dialog/edit-text-element-dialog.component";
import {GraphViewService} from "../../../service/graph/graph-view.service";
import {NodeView} from "../../../model/graphical-model/node/node-view";
import {EdgeView} from "../../../model/graphical-model/edge/edge-view";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {RemoveSelectedElementsCommand} from "../../../logic/command/remove-selected-elements-command";
import {HistoryService} from "../../../service/history.service";
import {CustomizationFormValues} from "../../tab-nav/customization-view/customization-view.component";
import {CustomizationResolver} from "../../../logic/customization-resolver";
import {ChangeGraphViewPropertiesCommand} from "../../../logic/command/change-graph-view-properties-command";
import {GraphElement} from "../../../model/graphical-model/graph-element";
import {GraphViewPropertiesService} from "../../../service/graph/graph-view-properties.service";
import {EdgeViewFabricService} from "../../../service/fabric/edge-view-fabric.service";

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
    ReactiveFormsModule,
    NgClass
  ],
  providers: [DialogService],
  templateUrl: './float-editor-panel.component.html',
  styleUrl: './float-editor-panel.component.css',
  animations: [
    trigger('slideIn', [
      state('in', style({
        transform: 'translateY(0)'
      })),
      transition('void => in', [
        style({ transform: 'translateY(100%)' }),
        animate('200ms ease-in')
      ])
    ])
  ]
})
export class FloatEditorPanelComponent implements OnInit, OnDestroy {
  private subscriptions!: Subscription;
  animationState: string = 'in';
  isMobile: boolean;

  isSingularSelection: boolean = false;
  isMultipleSelection: boolean = false;
  isEdgeSelection: boolean = false;
  isNodeSelection: boolean = false;
  isDragging: boolean = false;

  nodeItems!: NodeItem[];
  edgeItems!: EdgeItem[];

  // Color items
  colorItems!: ColorItem[];
  nodeColorItems!: ColorItem[];
  edgeColorItems!: ColorItem[];

  ref: DynamicDialogRef | undefined;

  constructor(protected svgIconService: SvgIconService,
              public dialogService: DialogService,
              private environmentService: EnvironmentService,
              private historyService: HistoryService,
              private stateService: StateService,
              private renderer: Renderer2,
              private cdr: ChangeDetectorRef,
              private graphService: GraphViewService,
              private propertyService: GraphViewPropertiesService,
              private edgeFabric: EdgeViewFabricService) {
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
        graphElement: 'node',
        command: (event, item) => {
          this.changeColorSelectedElements(event, item);
        }
      },
      {
        label: 'Label',
        color: '#FFFFFF',
        graphElement: 'node',
        command: (event, item) => {
          this.changeColorSelectedElements(event, item);
        }
      },
      {
        label: 'Stroke',
        color: '#FFFFFF',
        graphElement: 'node',
        command: (event, item) => {
          this.changeColorSelectedElements(event, item);
        }
      },
      {
        label: 'Stroke',
        color: '#FFFFFF',
        graphElement: 'edge',
        command: (event, item) => {
          this.changeColorSelectedElements(event, item);
        }
      },
      {
        label: 'Arrow',
        color: '#FFFFFF',
        graphElement: 'edge',
        command: (event, item) => {
          this.changeColorSelectedElements(event, item);
        }
      },
      {
        label: 'Weight',
        color: '#FFFFFF',
        graphElement: 'edge',
        command: (event, item) => {
          this.changeColorSelectedElements(event, item);
        }
      },
    ]
    this.nodeColorItems = this.colorItems.filter((item) => item.graphElement === 'node');
    this.edgeColorItems = this.colorItems.filter((item) => item.graphElement === 'edge');
    this.checkSelection();
    this.initSubscriptions();
    this.animationState = 'in';
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe(); // Unsubscribe from all subscriptions
  }

  toggleOverlayPanel(op: OverlayPanel, event: MouseEvent, i: number) {
    op.toggle(event);
    console.log('toggleOverlayPanel', i); // TODO remove
  }

  openEditNodeLabelDialog() {
    this.dialogService.open(EditTextElementDialogComponent, {
      header: 'Edit Node Label',
      contentStyle: { overflow: 'auto'},
      breakpoints: { '960px': '75vw', '640px': '90vw' },
      modal: true,
      dismissableMask: true,
      data: {
        type: 'nodeLabelEdit', // Type of the dialog
        nodeView: this.graphService.selectedElements[0] as NodeView,
      }
    });
  }

  showEditEdgeWeightInput() {
    this.dialogService.open(EditTextElementDialogComponent, {
      header: 'Edit Edge Weight',
      contentStyle: { overflow: 'auto'},
      breakpoints: { '960px': '75vw', '640px': '90vw' },
      modal: true,
      dismissableMask: true,
      data: {
        type: 'edgeWeightEdit', // Type of the dialog
        edgeView: this.graphService.selectedElements[0] as EdgeView,
      }
    });
  }

  onDeleteSelectedClick() {
    const selectedElements = this.graphService.selectedElements;
    const command = new RemoveSelectedElementsCommand(this.graphService,
      selectedElements);
    this.historyService.execute(command);
  }

  private initSubscriptions() {
    this.subscriptions = new Subscription();
    // Selection changes
    this.subscriptions.add(
      this.stateService.elementSelected$.subscribe((value) => {
        this.checkSelection();
      })
    );
    this.subscriptions.add(
      this.stateService.elementUnselected$.subscribe((value) => {
        this.checkSelection();
      })
    );
    // Dragging
    this.subscriptions.add(
      this.stateService.nodeStartDragging$.subscribe((value) => {
        if (value) {
          this.isDragging = true;
        }
      })
    );
    this.subscriptions.add(
      this.stateService.nodeEndDragging$.subscribe((value) => {
        if (value) {
          this.isDragging = false;
        }
      })
    );
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key.toLowerCase() === 'delete') {
      this.onDeleteSelectedClick()
    }
  }

  private checkSelection() {
    if (this.graphService.selectedElements.length > 1) {
      this.isMultipleSelection = true;
      this.isSingularSelection = false;
    } else {
      this.isMultipleSelection = false;
      this.isSingularSelection = true;
    }
    const allNodes: boolean[] = [];
    const allEdges: boolean[] = [];
    this.graphService.selectedElements.forEach((element) => {
      if (element instanceof NodeView) {
        allNodes.push(true);
      } else if (element instanceof EdgeView) {
        allEdges.push(true);
      }
    });
    this.isNodeSelection = allNodes.length > 0;
    this.isEdgeSelection = allEdges.length > 0;
  }

  private changeColorSelectedElements(event: Event, item: ColorItem) {
    const inputElement = event.target as HTMLInputElement;
    const newColor = inputElement.value;
    const selectedElements = this.graphService.selectedElements;
    console.log("Selected elements: ", selectedElements.length);
    switch (item.graphElement) {
      case 'node':
        this.changeNodeColor(item.label, newColor, selectedElements);
        break;
      case 'edge':
        this.changeEdgeColor(item.label, newColor, selectedElements);
        break;
    }
  }

  private changeNodeColor(label: string, newColor: string, selectedElements: GraphElement[]) {
    let form: Partial<CustomizationFormValues> = {};
    switch (label) {
      case 'Fill':
        form.nodeColor = newColor;
        break;
      case 'Label':
        form.nodeLabelColor = newColor;
        break;
      case 'Stroke':
        form.nodeStrokeColor = newColor;
        break;
    }
    const resolver = new CustomizationResolver(this.graphService, this.propertyService,
      this.edgeFabric);
    const action = resolver.resolveSpecific(form, selectedElements);
    const rollback = resolver.resolveSpecificRollback(form,selectedElements);
    const command = new ChangeGraphViewPropertiesCommand(action, rollback);
    this.historyService.execute(command);
  }

  private changeEdgeColor(label: string, newColor: string, selectedElements: GraphElement[]) {
    let form: Partial<CustomizationFormValues> = {};
    switch (label) {
      case 'Stroke':
        form.edgeColor = newColor;
        break;
      case 'Arrow':
        form.edgeArrowColor = newColor;
        break;
      case 'Weight':
        form.edgeWeightColor = newColor;
        break;
    }
    const resolver = new CustomizationResolver(this.graphService, this.propertyService,
      this.edgeFabric);
    const rollback = resolver.resolveSpecificRollback(form,selectedElements);
    const action = resolver.resolveSpecific(form, selectedElements);
    const command = new ChangeGraphViewPropertiesCommand(action, rollback);
    this.historyService.execute(command);
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
  command: (index: Event, item: ColorItem) => void;
}
