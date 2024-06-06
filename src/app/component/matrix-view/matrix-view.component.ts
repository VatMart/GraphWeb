import {Component, OnInit} from '@angular/core';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TableModule } from 'primeng/table';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {GraphMatrix, TypeMatrix} from "../../model/graph-matrix";
import {NgForOf, NgIf} from "@angular/common";
import {StateService} from "../../service/state.service";
import {GraphOrientation} from "../../model/orientation";

@Component({
  selector: 'app-matrix-view',
  standalone: true,
  imports: [
    SelectButtonModule,
    TableModule,
    FormsModule,
    NgIf,
    NgForOf,
    ReactiveFormsModule
  ],
  templateUrl: './matrix-view.component.html',
  styleUrls: ['./matrix-view.component.css']
})
export class MatrixViewComponent implements OnInit {

  useExpandButtonGradient: boolean = false;

  protected readonly TypeMatrix = TypeMatrix;
  matrixType = new FormControl(TypeMatrix.ADJACENCY);

  columns: string[] = [];
  valuesOfFirstColumn: string[] = [];
  matrix: number[][] = [];

  // products = [
  //   { code: '1', name: '1', category: '0', quantity: 1 },
  //   { code: '2', name: '0', category: '1', quantity: 0 },
  //   { code: '3', name: '1', category: '0', quantity: 1 },
  //   { code: '4', name: '0', category: '1', quantity: 0 },
  //   { code: '5', name: '1', category: '0', quantity: 1 }
  // ];

  constructor(private stateService: StateService) {
  }

  ngOnInit(): void {
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

  protected readonly GraphOrientation = GraphOrientation;
}
