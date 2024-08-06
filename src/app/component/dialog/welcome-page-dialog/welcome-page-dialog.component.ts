import { Component } from '@angular/core';
import {DynamicDialogRef} from "primeng/dynamicdialog";
import {Button} from "primeng/button";
import {NgIf, NgOptimizedImage} from "@angular/common";

@Component({
  selector: 'app-welcome-page-dialog',
  standalone: true,
  imports: [
    Button,
    NgIf,
    NgOptimizedImage
  ],
  templateUrl: './welcome-page-dialog.component.html',
  styleUrl: './welcome-page-dialog.component.css'
})
export class WelcomePageDialogComponent {

  constructor(public ref: DynamicDialogRef) {
  }

}
