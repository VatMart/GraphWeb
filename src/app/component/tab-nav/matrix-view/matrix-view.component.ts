import {Component, OnDestroy, OnInit} from '@angular/core';
import {SelectButtonModule} from 'primeng/selectbutton';
import {TableModule} from 'primeng/table';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {GraphMatrix, TypeMatrix} from "../../../model/graph-matrix";
import {NgForOf, NgIf} from "@angular/common";
import {StateService} from "../../../service/state.service";
import {MenuModule} from "primeng/menu";
import {DropdownModule} from "primeng/dropdown";

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
    DropdownModule
  ],
  templateUrl: './matrix-view.component.html',
  styleUrls: ['./matrix-view.component.css']
})
export class MatrixViewComponent implements OnInit, OnDestroy {

  useExpandButtonGradient: boolean = false;

  protected readonly TypeMatrix = TypeMatrix;
  matrixTypes: SelectMatrixTypeItem[] | undefined;
  matrixType = new FormControl(TypeMatrix.ADJACENCY);

  columns: string[] = [];
  valuesOfFirstColumn: string[] = [];
  matrix: number[][] = [];

  constructor(private stateService: StateService) {
  }

  ngOnInit(): void {
    this.matrixTypes = [
      {label: 'Adjacency', value: TypeMatrix.ADJACENCY},
      {label: 'Incidence', value: TypeMatrix.INCIDENCE}
    ];
    // On matrix type change
    this.matrixType.valueChanges.subscribe(value => {
      if (value !== null) {
        this.onChoseMatrixType(value);
      }
    });

    // On matrix change
    this.stateService.currentMatrix$.subscribe(matrix => {
      if (matrix !== null) {
        this.onMatrixChange(matrix);
      }
    });
    this.stateService.changedMatrixViewVisibility(true);
  }

  ngOnDestroy(): void {
    this.stateService.changedMatrixViewVisibility(false);
  }

  private onChoseMatrixType(value: TypeMatrix) {
    this.stateService.changeMatrixType(value);
  }

  private onMatrixChange(matrix: GraphMatrix) {
    this.matrix = matrix.matrix;
    let indexesToString = matrix.vertexIndexes.map(index => index.toString());
    this.columns = indexesToString;
    this.valuesOfFirstColumn = indexesToString;
  }

  onExpandTable() {
    this.useExpandButtonGradient = false;
  }
}

interface SelectMatrixTypeItem {
  label: string;
  value: TypeMatrix;
}
