import {AfterViewInit, Component, OnDestroy, OnInit, Renderer2} from '@angular/core';
import {TabViewModule} from "primeng/tabview";
import {ColorPickerModule} from "primeng/colorpicker";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {ConfService} from "../../../service/config/conf.service";
import {SliderChangeEvent, SliderModule} from "primeng/slider";
import {InputNumberModule} from "primeng/inputnumber";
import {ToggleButtonModule} from "primeng/togglebutton";
import {CheckboxModule} from "primeng/checkbox";
import {NgForOf, NgIf} from "@angular/common";
import {Ripple} from "primeng/ripple";
import {TooltipModule} from "primeng/tooltip";
import {Button} from "primeng/button";
import {OverlayPanelModule} from "primeng/overlaypanel";
import {TagModule} from "primeng/tag";
import {StateService} from "../../../service/event/state.service";
import {Subscription} from "rxjs";
import {CardModule} from "primeng/card";
import {EnvironmentService} from "../../../service/config/environment.service";
import {BLACK_WHITE_SMALL_STYLE} from "../../../model/graphical-model/graph/style-template/black-white-small-style";
import {GraphViewStyle} from "../../../model/graphical-model/graph/graph-view-properties";
import {BLACK_WHITE_STYLE} from "../../../model/graphical-model/graph/style-template/black-white-style";
import {BLACK_BLACK_STYLE} from "../../../model/graphical-model/graph/style-template/black-black-style";
import {ORANGE_GRAY_STYLE} from "../../../model/graphical-model/graph/style-template/orange-gray-style";
import {ORANGE_BLUE_STYLE} from "../../../model/graphical-model/graph/style-template/orange-blue-style";
import {BLUE_ORANGE_STYLE} from "../../../model/graphical-model/graph/style-template/blue-orange-style";
import {MessageService} from "primeng/api";
import {ToastModule} from "primeng/toast";

@Component({
  selector: 'app-customization-view',
  standalone: true,
  imports: [
    TabViewModule,
    ColorPickerModule,
    FormsModule,
    SliderModule,
    InputNumberModule,
    ToggleButtonModule,
    CheckboxModule,
    NgIf,
    Ripple,
    TooltipModule,
    Button,
    OverlayPanelModule,
    TagModule,
    ReactiveFormsModule,
    CardModule,
    NgForOf,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: './customization-view.component.html',
  styleUrl: './customization-view.component.css'
})
export class CustomizationViewComponent implements OnInit, OnDestroy, AfterViewInit {
  private subscriptions: Subscription = new Subscription();

  protected readonly ConfService = ConfService;

  form!: FormGroup;
  initialFormValues!: CustomizationFormValues
  unsavedChanges: boolean = false;
  templateItems!: TemplateItem[];

  constructor(private fb: FormBuilder,
              private stateService: StateService,
              private renderer: Renderer2,
              private environmentService: EnvironmentService,
              private messageService: MessageService) {
  }

  ngOnInit(): void {
    this.templateItems = [
      {
        name: 'Black&White Small (Default style)',
        imageSrc: 'assets/style-templates/Black&WhiteSmallV1.png',
        default: true
      },
      {
        name: 'Black&White',
        imageSrc: 'assets/style-templates/Black&WhiteV1.png',
        default: false
      },
      {
        name: 'Black&Black',
        imageSrc: 'assets/style-templates/Black&BlackV1.png',
        default: false
      },
      {
        name: 'Orange&Gray',
        imageSrc: 'assets/style-templates/Orange&GrayV1.png',
        default: false
      },
      {
        name: 'Orange&Blue',
        imageSrc: 'assets/style-templates/Orange&BlueV1.png',
        default: false
      },
      {
        name: 'Blue&Orange',
        imageSrc: 'assets/style-templates/Blue&OrangeV1.png',
        default: false
      },
    ];
    this.form = this.fb.group({
      nodeColor: [ConfService.currentNodeStyle.fillNode],
      nodeStrokeColor: [ConfService.currentNodeStyle.strokeColor],
      nodeLabelColor: [ConfService.currentNodeStyle.labelStyle.labelColor],
      nodeRadius: [ConfService.currentNodeStyle.radius.getRadius()],
      nodeStrokeWidth: [ConfService.currentNodeStyle.strokeWidth],
      nodeLabelFontSize: [ConfService.currentNodeStyle.labelStyle.labelFontSize],
      showNodeLabel: [ConfService.SHOW_NODE_LABEL],
      dynamicNodeSize: [ConfService.DYNAMIC_NODE_SIZE],
      edgeColor: [ConfService.currentEdgeStyle.strokeColor],
      edgeWeightColor: [ConfService.currentEdgeStyle.weight.strokeColor],
      edgeArrowColor: [ConfService.currentEdgeStyle.arrow.strokeColor],
      edgeStrokeWidth: [ConfService.currentEdgeStyle.strokeWidth],
      edgeWeightSize: [ConfService.currentEdgeStyle.weight.text.size],
      edgeArrowSize: [ConfService.currentEdgeStyle.arrow.size],
      showEdgeWeight: [ConfService.SHOW_WEIGHT],
      dynamicEdgeWeight: [ConfService.DYNAMIC_EDGE_WEIGHT_VALUE],
      // TODO add showing edge label
      // TODO add option for turning edges to curves
    });
    this.initialFormValues = this.form.getRawValue() as CustomizationFormValues;
    // Subscribe to form changes
    this.subscriptions.add(
      this.form.valueChanges.subscribe(() => {
        this.checkForUnsavedChanges();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  ngAfterViewInit(): void {
    this.calculateHeight();
    window.addEventListener('resize', this.calculateHeight.bind(this));
  }

  /**
   * Template item select event handler.
   */
  onTemplateSelect(item: TemplateItem) {
    this.importTemplateValues(item.name);
  }

  /**
   * Apply button click event handler.
   */
  applyChanges(): void {
    const changedValues = this.getChangedValues();
    if (Object.keys(changedValues).length === 0) {
      return; // No changes to apply
    }
    console.log('Apply changes'); // TODO remove
    this.stateService.applyCustomization(changedValues);
    // Update initial values
    this.unsavedChanges = false;
    this.initialFormValues = this.form.getRawValue() as CustomizationFormValues;
  }

  /**
   * Resets the form to the default values.
   * Note: Default values is the values that are set in the configuration service, not "previous" values.
   */
  resetToDefault(): void {
    this.form.reset({
      nodeColor: ConfService.DEFAULT_GRAPH_STYLE.nodeStyle.fillNode,
      nodeStrokeColor: ConfService.DEFAULT_GRAPH_STYLE.nodeStyle.strokeColor,
      nodeLabelColor: ConfService.DEFAULT_GRAPH_STYLE.nodeStyle.labelStyle.labelColor,
      nodeRadius: ConfService.DEFAULT_GRAPH_STYLE.nodeStyle.radius.getRadius(),
      nodeStrokeWidth: ConfService.DEFAULT_GRAPH_STYLE.nodeStyle.strokeWidth,
      nodeLabelFontSize: ConfService.DEFAULT_GRAPH_STYLE.nodeStyle.labelStyle.labelFontSize,
      showNodeLabel: ConfService.SHOW_NODE_LABEL,
      dynamicNodeSize: ConfService.DYNAMIC_NODE_SIZE,
      edgeColor: ConfService.DEFAULT_GRAPH_STYLE.edgeStyle.strokeColor,
      edgeWeightColor: ConfService.DEFAULT_GRAPH_STYLE.edgeStyle.weight.strokeColor,
      edgeArrowColor: ConfService.DEFAULT_GRAPH_STYLE.edgeStyle.arrow.strokeColor,
      edgeStrokeWidth: ConfService.DEFAULT_GRAPH_STYLE.edgeStyle.strokeWidth,
      edgeWeightSize: ConfService.DEFAULT_GRAPH_STYLE.edgeStyle.weight.text.size,
      edgeArrowSize: ConfService.DEFAULT_GRAPH_STYLE.edgeStyle.arrow.size,
      showEdgeWeight: ConfService.SHOW_WEIGHT,
      dynamicEdgeWeight: ConfService.DYNAMIC_EDGE_WEIGHT_VALUE
    });
  }

  calculateHeight(): void {
    // p-tabview-nav-container
    if (!this.environmentService.isMobile()) {
      return;
    }
    const sidebarHeaderHeight = document.getElementById('mobileSidebarHeader')!.offsetHeight;
    const buttonPanelHeight = document.getElementById('customizationButtonPanel')!.offsetHeight;
    const tabViewContentHeight = window.innerHeight - sidebarHeaderHeight - buttonPanelHeight - 120;
    const customizationTabviewItems = document.getElementsByClassName('customization-tabview-item');
    for (let i = 0; i < customizationTabviewItems.length; i++) {
      this.renderer.setStyle(customizationTabviewItems[i], 'height', `${tabViewContentHeight}px`);
    }
  }

  private getChangedValues(): Partial<CustomizationFormValues> {
    const currentValues = this.form.getRawValue() as CustomizationFormValues;
    const changedValues: Partial<CustomizationFormValues> = {};
    for (const key in currentValues) {
      if (currentValues[key as keyof CustomizationFormValues] !== this.initialFormValues[key as keyof CustomizationFormValues]) {
        changedValues[key as keyof CustomizationFormValues] = currentValues[key as keyof CustomizationFormValues] as any;
      }
    }
    return changedValues;
  }

  private checkForUnsavedChanges() {
    this.unsavedChanges = !this.areValuesEqual(this.form.getRawValue(), this.initialFormValues);
  }

  private areValuesEqual(currentValues: any, initialValues: any): boolean {
    return JSON.stringify(currentValues) === JSON.stringify(initialValues);
  }

  private importTemplateValues(name: string) {
    switch (name) {
      case 'Black&White Small (Default style)':
        this.importTemplate(BLACK_WHITE_SMALL_STYLE());
        break;
      case 'Black&White':
        this.importTemplate(BLACK_WHITE_STYLE());
        break;
      case 'Black&Black':
        this.importTemplate(BLACK_BLACK_STYLE());
        break;
      case 'Orange&Gray':
        this.importTemplate(ORANGE_GRAY_STYLE());
        break;
      case 'Orange&Blue':
        this.importTemplate(ORANGE_BLUE_STYLE());
        break;
      case 'Blue&Orange':
        this.importTemplate(BLUE_ORANGE_STYLE());
        break;
      default:
        console.error('Template not found:', name);
        break;
    }
  }

  private importTemplate(graphViewStyle: GraphViewStyle) {
    console.log('Importing template:', graphViewStyle.name); // TODO remove
    this.form.patchValue({
      nodeColor: graphViewStyle.nodeStyle.fillNode,
      nodeStrokeColor: graphViewStyle.nodeStyle.strokeColor,
      nodeLabelColor: graphViewStyle.nodeStyle.labelStyle.labelColor,
      nodeRadius: graphViewStyle.nodeStyle.radius.getRadius(),
      nodeStrokeWidth: graphViewStyle.nodeStyle.strokeWidth,
      nodeLabelFontSize: graphViewStyle.nodeStyle.labelStyle.labelFontSize,
      edgeColor: graphViewStyle.edgeStyle.strokeColor,
      edgeWeightColor: graphViewStyle.edgeStyle.weight.strokeColor,
      edgeArrowColor: graphViewStyle.edgeStyle.arrow.strokeColor,
      edgeStrokeWidth: graphViewStyle.edgeStyle.strokeWidth,
      edgeWeightSize: graphViewStyle.edgeStyle.weight.text.size,
      edgeArrowSize: graphViewStyle.edgeStyle.arrow.size
    });
    this.messageService.add({severity: 'contrast', summary: 'Template imported', detail: "To apply changes click 'Apply' button."});
  }

  // ------------------------------------------------
  // Slider sync with input number fields methods
  onNodeRadiusChange(event: SliderChangeEvent) {
    const newValue = event.value;
    this.form.patchValue({nodeRadius: newValue}, {emitEvent: false});
  }

  onNodeStrokeWidthChange(event: SliderChangeEvent) {
    const newValue = event.value;
    this.form.patchValue({nodeStrokeWidth: newValue}, {emitEvent: false});
  }

  onNodeLabelSizeChange(event: SliderChangeEvent) {
    const newValue = event.value;
    this.form.patchValue({nodeLabelFontSize: newValue}, {emitEvent: false});
  }

  onEdgeStrokeWidthChange(event: SliderChangeEvent) {
    const newValue = event.value;
    this.form.patchValue({edgeStrokeWidth: newValue}, {emitEvent: false});
  }

  onEdgeArrowSizeChange(event: SliderChangeEvent) {
    const newValue = event.value;
    this.form.patchValue({edgeArrowSize: newValue}, {emitEvent: false});
  }

  onEdgeWeightSizeChange(event: SliderChangeEvent) {
    const newValue = event.value;
    this.form.patchValue({edgeWeightSize: newValue}, {emitEvent: false});
  }
}

/**
 * Interface for form values of the customization form.
 */
export interface CustomizationFormValues {
  // Node tab items
  nodeRadius: number;
  nodeColor: string;
  nodeStrokeColor: string;
  nodeLabelColor: string;
  nodeStrokeWidth: number;
  nodeLabelFontSize: number;
  showNodeLabel: boolean;
  dynamicNodeSize: boolean;
  // Edge tab items
  edgeColor: string;
  edgeWeightColor: string;
  edgeArrowColor: string;
  edgeStrokeWidth: number;
  edgeWeightSize: number;
  edgeArrowSize: number;
  showEdgeWeight: boolean;
  dynamicEdgeWeight: boolean;
  // Template tab items
}

export interface TemplateItem {
  name: string;
  imageSrc: string;
  default: boolean;
}
