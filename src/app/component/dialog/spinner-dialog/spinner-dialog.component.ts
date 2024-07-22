import { Component } from '@angular/core';
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {GraphViewService} from "../../../service/graph/graph-view.service";
import {StateService} from "../../../service/event/state.service";
import {ProgressSpinnerModule} from "primeng/progressspinner";

/**
 * Spinner dialog component.
 * Used to display a loading spinner while the application is busy.
 */
@Component({
  selector: 'app-spinner-dialog',
  standalone: true,
  imports: [
    ProgressSpinnerModule
  ],
  templateUrl: './spinner-dialog.component.html',
  styleUrl: './spinner-dialog.component.css'
})
export class SpinnerDialogComponent {

  constructor(public ref: DynamicDialogRef,
              public config: DynamicDialogConfig,
              private graphService: GraphViewService,
              private stateService: StateService) {
  }
}
