import {Component, OnDestroy, OnInit} from '@angular/core';
import {SelectButtonModule} from 'primeng/selectbutton';
import {TableModule} from 'primeng/table';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {GraphMatrix, TypeMatrix} from "../../../model/graph-matrix";
import {NgForOf, NgIf} from "@angular/common";
import {StateService} from "../../../service/state.service";
import {MenuModule} from "primeng/menu";
import {DropdownModule} from "primeng/dropdown";
import {RippleModule} from "primeng/ripple";
import {Subscription} from "rxjs";
import {MessageService} from "primeng/api";
import {ToastModule} from "primeng/toast";
import {DialogModule} from "primeng/dialog";
import {MatrixTableComponent} from "./matrix-table/matrix-table.component";

@Component({
  selector: 'app-matrix-view',
  standalone: true,
  imports: [
    SelectButtonModule,
    TableModule,
    FormsModule,
    NgIf,
    NgForOf,
    ReactiveFormsModule,
    MenuModule,
    DropdownModule,
    RippleModule,
    ToastModule,
    DialogModule,
    MatrixTableComponent
  ],
  providers: [MessageService],
  templateUrl: './matrix-view.component.html',
  styleUrls: ['./matrix-view.component.css']
})
export class MatrixViewComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();

  matrixTypes: SelectMatrixTypeItem[] | undefined;
  matrixType = new FormControl(TypeMatrix.ADJACENCY);
  fullScreen = false;

  // Table data
  columns: string[] = [];
  valuesOfFirstColumn: string[] = [];
  matrix: number[][] = [];

  graphMatrix: GraphMatrix | undefined;

  constructor(private stateService: StateService,
              private messageService: MessageService) {
  }

  ngOnInit(): void {
    this.matrixTypes = [
      {label: 'Adjacency', value: TypeMatrix.ADJACENCY},
      {label: 'Incidence', value: TypeMatrix.INCIDENCE}
    ];
    // On matrix type change
    this.subscriptions.add(
      this.matrixType.valueChanges.subscribe(value => {
        if (value !== null) {
          this.onChoseMatrixType(value);
        }
      })
    );

    // On matrix change
    this.subscriptions.add(
      this.stateService.currentMatrix$.subscribe(matrix => {
        if (matrix !== null) {
          this.onMatrixChange(matrix);
        }
      })
    );
    this.stateService.changedMatrixViewVisibility(true);
  }

  ngOnDestroy(): void {
    this.stateService.changedMatrixViewVisibility(false);
    this.subscriptions.unsubscribe(); // Unsubscribe from all subscriptions
  }

  private onChoseMatrixType(value: TypeMatrix) {
    this.stateService.changeMatrixType(value);
  }

  private onMatrixChange(matrix: GraphMatrix) {
    this.graphMatrix = matrix;
    this.matrix = matrix.matrix;
    let vertexIndexesToString = matrix.vertexIndexes.map(index => index.toString());
    this.columns = matrix.type === TypeMatrix.ADJACENCY ? vertexIndexesToString : matrix.edgeIndexes;
    this.valuesOfFirstColumn = vertexIndexesToString;
  }

  onExpandTable() {
    this.fullScreen = true;
  }

  onCopyToClipboard() {
    if (!this.graphMatrix || this.graphMatrix.matrix.length === 0) {
      return;
    }
    const textToCopy = this.graphMatrix.toString();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy).then(() => {
        this.showSuccessCopy();
      }).catch(err => {
        this.showErrorCopy('Could not copy text: ' + err);
      });
    } else {
      // Fallback method for browsers that do not support Clipboard API
      this.fallbackCopyTextToClipboard(textToCopy);
    }
  }

  fallbackCopyTextToClipboard(textToCopy: string) {
    const textArea = document.createElement('textarea');
    textArea.value = textToCopy;
    // Ensure the text area is invisible and doesn't disrupt layout
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    textArea.style.padding = '0';
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';
    textArea.style.opacity = '0';
    textArea.style.pointerEvents = 'none';

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand('copy');
      const msg = successful ? 'successful' : 'unsuccessful';
      console.log('Fallback: Copying text command was ' + msg);
    } catch (err) {
      this.showErrorCopy('Could not copy text: ' + err);
      return;
    }

    document.body.removeChild(textArea);
    this.showSuccessCopy();
  }

  showSuccessCopy() {
    this.messageService.add({ severity: 'contrast', summary: 'Copied', detail: 'Matrix copied to clipboard!' });
  }

  showErrorCopy(message: string) {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: message });
  }
}

interface SelectMatrixTypeItem {
  label: string;
  value: TypeMatrix;
}
