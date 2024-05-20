import { Component } from '@angular/core';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-matrix-view',
  standalone: true,
  imports: [
    SelectButtonModule,
    TableModule,
    FormsModule
  ],
  templateUrl: './matrix-view.component.html',
  styleUrls: ['./matrix-view.component.css']
})
export class MatrixViewComponent {
  sizes = [
    { name: 'Small', class: 'p-datatable-sm' },
    { name: 'Normal', class: 'p-datatable-md' },
    { name: 'Large', class: 'p-datatable-lg' }
  ];

  selectedSize = this.sizes[1]; // Default to 'Normal'

  products = [
    { code: '1', name: '1', category: '0', quantity: 1 },
    { code: '2', name: '0', category: '1', quantity: 0 },
    { code: '3', name: '1', category: '0', quantity: 1 },
    { code: '4', name: '0', category: '1', quantity: 0 },
    { code: '5', name: '1', category: '0', quantity: 1 }
  ];
}
