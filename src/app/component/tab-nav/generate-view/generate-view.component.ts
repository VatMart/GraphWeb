import {Component, OnDestroy, OnInit} from '@angular/core';
import {PaginatorModule} from "primeng/paginator";
import {FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule} from "@angular/forms";
import {Subscription} from "rxjs";
import {ConfService} from "../../../service/config/conf.service";
import {Button} from "primeng/button";
import {CheckboxModule} from "primeng/checkbox";
import {NgForOf, NgIf} from "@angular/common";
import {OverlayPanelModule} from "primeng/overlaypanel";
import {Ripple} from "primeng/ripple";
import {SliderChangeEvent, SliderModule} from "primeng/slider";
import {TabViewModule} from "primeng/tabview";
import {TagModule} from "primeng/tag";
import {TooltipModule} from "primeng/tooltip";
import {GraphOrientation} from "../../../model/orientation";
import {InputTextModule} from "primeng/inputtext";
import {StateService} from "../../../service/event/state.service";
import {MessageModule} from "primeng/message";
import {GraphType} from "../../../model/graph";

@Component({
  selector: 'app-generate-view',
  standalone: true,
  imports: [
    PaginatorModule,
    ReactiveFormsModule,
    Button,
    CheckboxModule,
    NgForOf,
    NgIf,
    OverlayPanelModule,
    Ripple,
    SliderModule,
    TabViewModule,
    TagModule,
    TooltipModule,
    InputTextModule,
    MessageModule
  ],
  templateUrl: './generate-view.component.html',
  styleUrl: './generate-view.component.css'
})
export class GenerateViewComponent implements OnInit, OnDestroy {
  private subscriptions!: Subscription;
  protected readonly ConfService = ConfService;

  form!: FormGroup;
  orientations: SelectOrientationItem[] | undefined;
  graphTypes: SelectGraphTypeItem[] | undefined;

  constructor(private fb: FormBuilder,
              private stateService: StateService) {
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      graphOrientation: [this.ConfService.DEFAULT_GRAPH_ORIENTATION],
      graphType: [GraphType.DEFAULT],
      nArity: [2],
      nArityText: ['2'],
      // Nodes
      fixedNumberOfNodes: [false],
      fixedNodesNumber: [50],
      dynamicNodesNumber: this.fb.array([5, 50].map(num => new FormControl(num))),
      // Edges
      allowLoops: [false],
      allowTwoDirectionEdges: [false],
      edgesProbability: [0.15], // chance of edge creation between each two nodes in the graph
      // Weights
      edgeWeightSpecify: [false],
      edgeWeightRange: this.fb.array([1, 10].map(num => new FormControl(num))),
    });
    this.orientations = [
      {label: 'Directed', value: GraphOrientation.ORIENTED},
      {label: 'Undirected', value: GraphOrientation.NON_ORIENTED},
      // Currently generation of Mixed graph not supported
    ];
    this.graphTypes = [
      {label: 'Default', value: GraphType.DEFAULT},
      {label: 'Tree', value: GraphType.TREE},
    ];

    // Init subscriptions
    this.subscriptions = new Subscription();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  onGenerate() {
    const formValues = this.form.getRawValue() as GenerateGraphOptions;
    this.stateService.callGenerateGraphWithOptions(formValues);
  }

  isDirectedGraph(): boolean {
    return this.form.get('graphOrientation')?.value === GraphOrientation.ORIENTED;
  }

  isDefaultGraphType(): boolean {
    return this.form.get('graphType')?.value === GraphType.DEFAULT;
  }

  isTreeGraphType(): boolean {
    return this.form.get('graphType')?.value === GraphType.TREE;
  }

  onNArityChange(event: any) {
    if (event.value === 0) {
      this.form.patchValue({nArityText: 'N/A'}, {emitEvent: false});
    } else {
      this.form.patchValue({nArityText: event.value.toString()}, {emitEvent: false});
    }
  }

  onFixedNodeNumbersChange(event: SliderChangeEvent) {
    const newValue = event.value;
    this.form.patchValue({fixedNodesNumber: newValue}, {emitEvent: false});
  }

  isFixedNumberOfNodes(): boolean {
    return this.form.get('fixedNumberOfNodes')?.value;
  }

  onDynamicNodeNumbersChange(event: any) {
    this.dynamicNodesNumberControls.setValue([event.values[0], event.values[1]]);
  }

  onEdgesProbabilityChange(event: SliderChangeEvent) {
    const newValue = event.value;
    this.form.patchValue({edgesProbability: newValue}, {emitEvent: false});
  }

  isEdgeWeightSpecify() {
    return this.form.get('edgeWeightSpecify')?.value;
  }

  onEdgeWeightRangeChange(event: any) {
    this.edgeWeightRangeControls.setValue([event.values[0], event.values[1]]);
  }

  // ------------------------
  // Getters for form controls
  // ------------------------
  get dynamicNodesNumberControls(): FormArray {
    return this.form.get('dynamicNodesNumber') as FormArray;
  }

  get dynamicNodesNumberControl(): FormControl {
    const formArray = this.dynamicNodesNumberControls;
    // Need to create new FormControl, because dynamicNodesNumber is a FormArray
    return new FormControl([formArray.at(0).value, formArray.at(1).value]);
  }

  get edgeWeightRangeControls(): FormArray {
    return this.form.get('edgeWeightRange') as FormArray;
  }

  get edgeWeightRangeControl(): FormControl {
    const formArray = this.edgeWeightRangeControls;
    return new FormControl([formArray.at(0).value, formArray.at(1).value]);
  }
}

interface SelectOrientationItem {
  label: string;
  value: GraphOrientation;
}

interface SelectGraphTypeItem {
  label: string;
  value: GraphType;
}

export interface GenerateGraphOptions {
  graphOrientation: GraphOrientation;
  graphType: GraphType;
  nArity: number;
  fixedNumberOfNodes: boolean;
  fixedNodesNumber: number;
  dynamicNodesNumber: number[];
  allowLoops: boolean;
  allowTwoDirectionEdges: boolean;
  edgesProbability: number;
  edgeWeightSpecify: boolean;
  edgeWeightRange: number[];
}
