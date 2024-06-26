import {Component, OnDestroy, OnInit} from '@angular/core';
import {DropdownModule} from "primeng/dropdown";
import {ToastModule} from "primeng/toast";
import {FormControl, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {GraphMatrix, TypeMatrix} from "../../../model/graph-matrix";
import {SelectMatrixTypeItem} from "../output-view/output-view.component";
import {Subscription} from "rxjs";
import {StateService} from "../../../service/state.service";
import {ConfirmationService, MessageService} from "primeng/api";
import {EnvironmentService} from "../../../service/environment.service";
import {InputTextareaModule} from "primeng/inputtextarea";
import {KeyFilterModule} from "primeng/keyfilter";
import {TagModule} from "primeng/tag";
import {ButtonModule} from "primeng/button";
import {NgClass, NgIf} from "@angular/common";
import {ConfirmDialogModule} from "primeng/confirmdialog";

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
    ConfirmDialogModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './input-view.component.html',
  styleUrl: './input-view.component.css'
})
export class InputViewComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();
  isMobileDevice: boolean;

  // Matrix types for select
  matrixTypes: SelectMatrixTypeItem[] | undefined;
  matrixType = new FormControl(TypeMatrix.ADJACENCY);

  // Matrix data
  readonly adjacencyMatrixPlaceholder = 'Allowed formats:\n0 1 0      0, 1, 0,      0; 1; 0;      ' +
    '0, 1, 0;\n1 0 1      1, 0, 1,      1; 0; 1;      1, 0, 1;\n0 1 0 or 0, 1, 0  or 0; 1; 0  or  0, 1, 0;\n\n' +
    'If your graph is weighted, use weights\ninstead of 1s.';
  readonly incidenceMatrixPlaceholder = 'Allowed formats:\n 1 0       1, 0,        1; 0;' +
    '       1, 0;\n-1 1      -1, 1,      -1; 1;      -1, 1;\n 0 -1 or 0, -1 or  0; -1 or  0, -1;\n\n' +
    'If your graph is weighted, use weights\ninstead of 1s.';
  matrixInput: string = '';
  matrixPlaceholder!: string;
  matrixInProcess: boolean = false;
  currentValidationType!: MatrixValidationItem;
  matrixValidationTypes!: MatrixValidationItem[];
  // Matrix submit button
  currentMatrixSubmitButton!: ButtonItem;
  buttonItems!: ButtonItem[];

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
    this.matrixValidationTypes = [
      {isValid: null, severity: 'secondary', message: 'Unchecked', icon: 'pi pi-circle'},
      {isValid: true, severity: 'info', message: 'Valid', icon: 'pi pi-check-circle'},
      {isValid: false, severity: 'danger', message: 'Invalid', icon: 'pi pi-exclamation-circle'}
    ];
    // Button items
    this.buttonItems = [
      {label: 'Submit', icon: 'pi pi-check', command: () => this.submitMatrix(), disabled: false},
      {label: 'In process', command: () => {}, disabled: true, spin: true}
    ];
    this.currentMatrixSubmitButton = this.buttonItems[0];
    this.currentValidationType = this.matrixValidationTypes[0];
    // Subscriptions
    // On matrix type change
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
        if (result !== null) {
          this.onMatrixParseResult(result);
          this.stateService.changeMatrixParseResult(null); // Reset parse result
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private onChoseMatrixType(value: TypeMatrix) {
    this.matrixPlaceholder = value === TypeMatrix.ADJACENCY ? this.adjacencyMatrixPlaceholder : this.incidenceMatrixPlaceholder;
  }

  onMatrixInput(event: Event) {
    const inputElement = event.target as HTMLTextAreaElement;
    inputElement.value = inputElement.value.replace(/[^0-9\n ;,.\-]/g, '');
    this.matrixInput = inputElement.value;
    this.currentValidationType = this.matrixValidationTypes[0]; // Set unchecked state till user press submit button
  }

  private submitMatrix() {
    console.log('Submit matrix');
    this.matrixInProcess = true; // Set in process state
    this.currentMatrixSubmitButton = this.buttonItems[1]; // Change button to in process
    // Send input matrix string to the state service
    this.stateService.changeMatrixInput({value: this.matrixInput,
      matrixType: this.matrixType.value as TypeMatrix});
  }

  private onMatrixParseResult(result: MatrixParseResult) {
    this.matrixInProcess = false;
    this.currentMatrixSubmitButton = this.buttonItems[0]; // Change button to submit
    if (result.valid) { // Matrix is valid and parsed
      this.currentValidationType = this.matrixValidationTypes[1]; // Set valid state
      // Show confirmation dialog for graph generation
      this.confirmGraphGenerationByMatrix(result.value!);
    } else { // Matrix is invalid
      this.currentValidationType = this.matrixValidationTypes[2]; // Set invalid state for tag element
      // Show error message to user
      this.showValidationMatrixInputError(result.message!);
    }
  }

  private showValidationMatrixInputError(message: string) {
    this.messageService.add({ severity: 'error', summary: 'Invalid matrix string', detail: message });
  }

  /**
   * Show confirmation dialog for graph generation by matrix.
   */
  private confirmGraphGenerationByMatrix(graphMatrix: GraphMatrix) {
    this.confirmationService.confirm({
      message: 'Your matrix is valid. Are you sure you want to generate new graph by this matrix? Previous graph will be removed.',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptIcon:"none",
      rejectIcon:"none",
      rejectButtonStyleClass:"p-button-text",
      accept: () => {
        // Call state service to generate graph by matrix
        this.stateService.generateGraphByMatrix(graphMatrix);
        this.matrixInput = ''; // Clear input
      },
      reject: () => {} // Do nothing on reject
    });

  }
}

export interface MatrixValidationItem {
  isValid: boolean | null;
  severity: "info" | "secondary" | "danger";
  message: 'Valid' | 'Invalid' | 'Unchecked';
  icon: string;
}

export interface ButtonItem {
  label: string;
  command: () => void;
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
