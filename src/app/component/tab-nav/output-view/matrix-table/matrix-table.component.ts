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
  @Input() columns: string[] = [];
  @Input() valuesOfFirstColumn: string[] = [];
  @Input() matrix: number[][] = [];
  @Input() scrollHeight: string | undefined;
}
