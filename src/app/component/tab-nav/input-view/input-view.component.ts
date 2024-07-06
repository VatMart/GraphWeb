import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {DropdownModule} from "primeng/dropdown";
import {ToastModule} from "primeng/toast";
import {FormControl, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {GraphMatrix, TypeMatrix} from "../../../model/graph-matrix";
import {SelectMatrixTypeItem} from "../output-view/output-view.component";
import {Subscription} from "rxjs";
import {StateService} from "../../../service/event/state.service";
import {ConfirmationService, MessageService} from "primeng/api";
import {EnvironmentService} from "../../../service/config/environment.service";
import {InputTextareaModule} from "primeng/inputtextarea";
import {KeyFilterModule} from "primeng/keyfilter";
import {TagModule} from "primeng/tag";
import {ButtonModule} from "primeng/button";
import {NgClass, NgIf} from "@angular/common";
import {ConfirmDialogModule} from "primeng/confirmdialog";
import {FileUploadModule} from "primeng/fileupload";
import {CardModule} from "primeng/card";
import {SetValidationResult} from "../../../service/graph/graph-set.service";
import {GraphSet} from "../../../model/graph-set";

/**
 * Component for the input view. It is used for generate graph from matrix or graph set.
 */
@Component({
  selector: 'app-input-view',
  standalone: true,
  imports: [
    DropdownModule,
    ToastModule,
    ReactiveFormsModule,
    InputTextareaModule,
    FormsModule,
    KeyFilterModule,
    TagModule,
    ButtonModule,
    NgIf,
    NgClass,
    ConfirmDialogModule,
    FileUploadModule,
    CardModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './input-view.component.html',
  styleUrl: './input-view.component.css'
})
export class InputViewComponent implements OnInit, OnDestroy {
  private subscriptions!: Subscription;
  isMobileDevice: boolean;

  @ViewChild('fileInput') fileInput!: ElementRef;
  selectedFileName: string | null = null; // Property to store the selected file name

  validationTypes!: ValidationItem[];
  buttonItems!: ButtonItem[];

  // Matrix types for select
  matrixTypes: SelectMatrixTypeItem[] | undefined;
  matrixType = new FormControl(TypeMatrix.ADJACENCY);

  // Matrix data
  readonly adjacencyMatrixPlaceholder = 'Allowed formats:\n0 1 0      0, 1, 0,      0; 1; 0;      ' +
    '0, 1, 0;\n1 0 1      1, 0, 1,      1; 0; 1;      1, 0, 1;\n0 1 0 or 0, 1, 0  or 0; 1; 0  or  0, 1, 0;\n\n' +
    'If your graph is weighted, use \nweights instead of 1s.';
  readonly incidenceMatrixPlaceholder = 'Allowed formats:\n 1 0       1, 0,        1; 0;' +
    '       1, 0;\n-1 1      -1, 1,      -1; 1;      -1, 1;\n 0 -1 or 0, -1 or  0; -1 or  0, -1;\n\n' +
    'If your graph is weighted, use \nweights instead of 1s.';
  matrixInput: string = '';
  matrixPlaceholder!: string;
  matrixInProcess: boolean = false;
  currentMatrValidationType!: ValidationItem;
  // Matrix submit button
  currentMatrixSubmitButton!: ButtonItem;

  // Graph sets
  verticesSetInput: string = '';
  edgesSetInput: string = '';
  readonly verticesSetPlaceholder = 'Allowed formats:\n1 pancake 3 Abc 5\nor ' +
    '1; pancake; 3; Abc; 5\nYou can use labels (without spaces) instead of numbers.';
  readonly edgesSetPlaceholder = 'Allowed formats:\n1-5, 1-pancake, pancake-Abc\nor ' +
    '1-5; 1-pancake; pancake-Abc.';
  graphSetInProcess: boolean = false;
  currentVertValidationType!: ValidationItem;
  currentEdgeValidationType!: ValidationItem;
  // Graph set submit button
  currentGraphSetSubmitButton!: ButtonItem;

  constructor(private stateService: StateService,
              private messageService: MessageService,
              private confirmationService: ConfirmationService,
              private environmentService: EnvironmentService) {
    this.isMobileDevice = this.environmentService.isMobile();
  }

  ngOnInit(): void {
    this.matrixTypes = [
      {label: 'Adjacency', value: TypeMatrix.ADJACENCY},
      {label: 'Incidence', value: TypeMatrix.INCIDENCE}
    ];
    // Default matrix placeholder
    this.matrixPlaceholder = this.adjacencyMatrixPlaceholder;
    // Matrix validation
    this.validationTypes = [
      {isValid: null, severity: 'secondary', message: 'Unchecked', icon: 'pi pi-circle'},
      {isValid: true, severity: 'info', message: 'Valid', icon: 'pi pi-check-circle'},
      {isValid: false, severity: 'danger', message: 'Invalid', icon: 'pi pi-exclamation-circle'}
    ];
    // Button items
    this.buttonItems = [
      {label: 'Submit', icon: 'pi pi-check', disabled: false},
      {label: 'In process', disabled: true, spin: true}
    ];
    // Default values
    this.currentMatrixSubmitButton = this.buttonItems[0];
    this.currentMatrValidationType = this.validationTypes[0];
    this.currentGraphSetSubmitButton = this.buttonItems[0];
    this.currentVertValidationType = this.validationTypes[0];
    this.currentEdgeValidationType = this.validationTypes[0];
    // Subscriptions
    // On matrix type change
    this.subscriptions = new Subscription();
    this.subscriptions.add(
      this.matrixType.valueChanges.subscribe(value => {
        if (value !== null) {
          this.onChoseMatrixType(value);
        }
      })
    );
    // On matrix parse result
    this.subscriptions.add(
      this.stateService.currentMatrixParseResult$.subscribe(result => {
        this.onMatrixParseResult(result);
      })
    );
    // On vertices set validation result
    this.subscriptions.add(
      this.stateService.currentInputVerticesSetValidationResult$.subscribe(result => {
        this.onValidationVerticesSetResult(result);
      })
    );
    // On edges set validation result
    this.subscriptions.add(
      this.stateService.currentInputEdgesSetValidationResult$.subscribe(result => {
        this.onValidationEdgesSetResult(result);
      })
    );
    // On graph set parse result
    this.subscriptions.add(
      this.stateService.currentInputGraphSetParseResult$.subscribe(result => {
        this.onGraphSetParseResult(result);
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private onChoseMatrixType(value: TypeMatrix) {
    this.matrixPlaceholder = value === TypeMatrix.ADJACENCY ? this.adjacencyMatrixPlaceholder : this.incidenceMatrixPlaceholder;
  }

  /**
   * On upload matrix file
   */
  onMatrixFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.matrixInput = reader.result as string;
        this.fileInput.nativeElement.value = ''; // Clear the input value to allow re-selection of the same file
        this.selectedFileName = file.name; // Set the selected file name
      };
      reader.readAsText(file);
    }
  }

  onMatrixInput(event: Event) {
    const inputElement = event.target as HTMLTextAreaElement;
    inputElement.value = inputElement.value.replace(/[^0-9\n ;,.\-]/g, '');
    this.matrixInput = inputElement.value;
    this.currentMatrValidationType = this.validationTypes[0]; // Set unchecked state till user press submit button
  }

  onSubmitMatrix() {
    this.matrixInProcess = true; // Set in process state
    this.currentMatrixSubmitButton = this.buttonItems[1]; // Change button to in process
    // Send input matrix string to the state service
    this.stateService.changeMatrixInput({
      value: this.matrixInput,
      matrixType: this.matrixType.value as TypeMatrix
    });
  }

  onGraphSetSubmit() {
    this.graphSetInProcess = true; // Set in process state
    this.currentGraphSetSubmitButton = this.buttonItems[1]; // Change button to in process
    // Send input vertices and edges set strings to the state service
    this.stateService.changeInputGraphSet({verticesSetInput: this.verticesSetInput, edgeSetInput: this.edgesSetInput});
  }

  private onMatrixParseResult(result: MatrixParseResult) {
    this.matrixInProcess = false;
    this.currentMatrixSubmitButton = this.buttonItems[0]; // Change button to submit
    if (result.valid) { // Matrix is valid and parsed
      this.currentMatrValidationType = this.validationTypes[1]; // Set valid state
      // Show confirmation dialog for graph generation
      this.confirmGraphGenerationByMatrix(result.value!);
    } else { // Matrix is invalid
      this.currentMatrValidationType = this.validationTypes[2]; // Set invalid state for tag element
      // Show error message to user
      this.showValidationMatrixInputError(result.message!);
    }
  }

  private onGraphSetParseResult(result: GraphSetParseResult) {
    this.graphSetInProcess = false;
    this.currentGraphSetSubmitButton = this.buttonItems[0]; // Change button to submit
    if (result.valid) { // Graph set is valid and parsed
      this.confirmGraphGenerationByGraphSet(result.vertices!, result.edges!);
    } else { // Graph set is invalid
      // Show error message to user
      this.showValidationGraphSetInputError(result.error!);
    }
  }

  private showValidationMatrixInputError(message: string) {
    this.messageService.add({severity: 'error', summary: 'Invalid matrix string', detail: message});
  }

  private showValidationGraphSetInputError(setValidationResults: SetValidationResult[]) {
    setValidationResults.forEach(result => {
      this.messageService.add({severity: 'error', summary: 'Invalid graph set string', detail: result.message!});
    });
  }

  /**
   * Show confirmation dialog for graph generation by matrix.
   */
  private confirmGraphGenerationByMatrix(graphMatrix: GraphMatrix) {
    this.confirmationService.confirm({
      message: 'Your matrix is valid. Are you sure you want to generate new graph by this matrix? Previous graph will be removed.',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptIcon: "none",
      rejectIcon: "none",
      rejectButtonStyleClass: "p-button-text",
      accept: () => {
        // Call state service to generate graph by matrix
        this.stateService.generateGraphByMatrix(graphMatrix);
        this.matrixInput = ''; // Clear input
      },
      reject: () => {
      } // Do nothing on reject
    });
  }

  private confirmGraphGenerationByGraphSet(vertexSet: GraphSet, edgeSet: GraphSet) {
    this.confirmationService.confirm({
      message: 'Your graph sets are valid. Are you sure you want to generate new graph by these sets? Previous graph will be removed.',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptIcon: "none",
      rejectIcon: "none",
      rejectButtonStyleClass: "p-button-text",
      accept: () => {
        // Call state service to generate graph by graph sets
        this.stateService.generateGraphBySets({verticesSet: vertexSet, edgesSet: edgeSet});
        this.verticesSetInput = ''; // Clear input
        this.edgesSetInput = ''; // Clear input
      },
      reject: () => {
      } // Do nothing on reject
    });
  }

  onVerticesSetInput(event: Event) {
    const inputElement = event.target as HTMLTextAreaElement;
    this.verticesSetInput = inputElement.value;
    this.callValidateVerticesInput(inputElement.value);
    // Also validate edges set
    this.callValidateEdgesInput(this.edgesSetInput);
  }

  onEdgesSetInput(event: Event) {
    const inputElement = event.target as HTMLTextAreaElement;
    this.edgesSetInput = inputElement.value;
    this.callValidateEdgesInput(inputElement.value);
  }

  private callValidateVerticesInput(value: string) {
    this.stateService.validateVerticesInput(value);
  }

  private callValidateEdgesInput(value: string) {
    // To validate edges set we need to have vertices set
    this.stateService.validateEdgesInput({edgeSetInput: value, verticesSetInput: this.verticesSetInput});
  }

  private onValidationVerticesSetResult(result: SetValidationResult) {
    this.currentVertValidationType = result.isValid ? this.validationTypes[1] : this.validationTypes[2];
  }

  private onValidationEdgesSetResult(result: SetValidationResult) {
    this.currentEdgeValidationType = result.isValid ? this.validationTypes[1] : this.validationTypes[2];
  }
}

export interface ValidationItem {
  isValid: boolean | null;
  severity: "info" | "secondary" | "danger";
  message: 'Valid' | 'Invalid' | 'Unchecked';
  icon: string;
}

export interface ButtonItem {
  label: string;
  disabled: boolean;
  icon?: string;
  spin?: boolean;
}

export interface MatrixStringInput {
  value: string;
  matrixType: TypeMatrix;
}

export interface MatrixParseResult {
  valid: boolean;
  message?: string;
  value?: GraphMatrix;
}

export interface GraphSetParseResult {
  valid: boolean;
  error?: SetValidationResult[];
  vertices?: GraphSet;
  edges?: GraphSet
}

export interface GraphSetRequest {
  edgeSetInput: string;
  verticesSetInput: string;
}
