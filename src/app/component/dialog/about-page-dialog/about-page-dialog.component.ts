import { Component } from '@angular/core';
import {Button} from "primeng/button";
import {DynamicDialogRef} from "primeng/dynamicdialog";

@Component({
  selector: 'app-about-page-dialog',
  standalone: true,
  imports: [
    Button
  ],
  templateUrl: './about-page-dialog.component.html',
  styleUrl: './about-page-dialog.component.css'
})
export class AboutPageDialogComponent {

  constructor(public ref: DynamicDialogRef) {
  }

}
