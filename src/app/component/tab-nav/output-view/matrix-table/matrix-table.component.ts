import {Component, Input} from '@angular/core';
import {TableModule} from "primeng/table";
import {NgForOf, NgIf} from "@angular/common";

@Component({
  selector: 'app-matrix-table',
  standalone: true,
  imports: [
    TableModule,
    NgForOf,
    NgIf
  ],
  templateUrl: './matrix-table.component.html',
  styleUrl: './matrix-table.component.css'
})
export class MatrixTableComponent {
  @Input() fullscreen: boolean = false;
  @Input() columns: string[] = [];
  @Input() valuesOfFirstColumn: string[] = [];
  @Input() matrix: number[][] = [];
  @Input() scrollHeight: string | undefined;
  hugeContent: boolean = false;
  emptyHeaderMessage: string = 'Graph is empty';
  emptyContentMessage: string = 'Add a vertex/edge to see actual matrix';
  hugeHeaderMessage: string = 'Huge matrix';
  hugeContentMessage: string = 'Graph consists of more than 50 vertices! Use fullscreen view to see matrix. ' +
    'Generation of huge matrix table may take some time.';

  canShowContent(): boolean {
     if (this.columns.length > 50 || this.valuesOfFirstColumn.length > 50) {
       this.hugeContent = true;
     }
     return (!this.hugeContent || this.fullscreen) && this.columns.length > 0 && this.valuesOfFirstColumn.length > 0;
  }
}
