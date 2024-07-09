import {Component, OnInit} from '@angular/core';
import {DynamicDialogRef} from "primeng/dynamicdialog";
import {FormsModule} from "@angular/forms";
import {InputTextModule} from "primeng/inputtext";
import {Button} from "primeng/button";

@Component({
  selector: 'app-edit-graph-element-dialog',
  standalone: true,
  imports: [
    FormsModule,
    InputTextModule,
    Button
  ],
  templateUrl: './edit-node-label-dialog.component.html',
  styleUrl: './edit-node-label-dialog.component.css'
})
export class EditNodeLabelDialogComponent implements OnInit {

  nodeLabel?: string;

  constructor(public ref: DynamicDialogRef) { }

  ngOnInit(): void {
    // TODO load selected graph element data
  }

}
