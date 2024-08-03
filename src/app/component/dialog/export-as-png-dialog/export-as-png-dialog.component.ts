import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {Button} from "primeng/button";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {StateService} from "../../../service/event/state.service";
import {FormControl, ReactiveFormsModule} from "@angular/forms";
import {Subscription} from "rxjs";
import {DropdownModule} from "primeng/dropdown";
import {CheckboxModule} from "primeng/checkbox";

/**
 * Export as PNG dialog component.
 */
@Component({
  selector: 'app-export-as-png-dialog',
  standalone: true,
  imports: [
    Button,
    DropdownModule,
    ReactiveFormsModule,
    CheckboxModule
  ],
  templateUrl: './export-as-png-dialog.component.html',
  styleUrl: './export-as-png-dialog.component.css'
})
export class ExportAsPngDialogComponent implements OnInit, OnDestroy {
  private subscriptions!: Subscription;

  zoomItems: ZoomItem[] | undefined;
  selectedZoom = new FormControl(100);
  transparentBackground = new FormControl(false);
  showGrid = new FormControl(false);

  constructor(public ref: DynamicDialogRef,
              public config: DynamicDialogConfig,
              private cdr: ChangeDetectorRef,
              private stateService: StateService) {
  }

  ngOnInit(): void {
    this.zoomItems = [
      {
        label: '50%',
        value: 50,
        command: () => {
          this.selectedZoom.setValue(50);
        }
      },
      {
        label: '75%',
        value: 75,
        command: () => {
          this.selectedZoom.setValue(75);
        }
      },
      {
        label: '100%',
        value: 100,
        command: () => {
          this.selectedZoom.setValue(100);
        }
      },
      {
        label: '150%',
        value: 150,
        command: () => {
          this.selectedZoom.setValue(150);
        }
      },
      {
        label: '200%',
        value: 200,
        command: () => {
          this.selectedZoom.setValue(200);
        }
      }
    ];

    this.subscriptions = new Subscription();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  onCancel() {
    this.ref.close();
  }

  onExport() {
    const request: ExportAsPngRequest = {
      showGrid: this.showGrid.value === null ? false : this.showGrid.value,
      transparentBackground: this.transparentBackground.value === null ? false : this.transparentBackground.value,
      zoom: this.selectedZoom.value === null ? 100 : this.selectedZoom.value
    };
    this.stateService.callExportAsPng(request);
    this.ref.close();
  }
}

interface ZoomItem {
  label: string;
  value: number;
  command: () => void;
}

export interface ExportAsPngRequest {
  showGrid: boolean;
  transparentBackground: boolean;
  zoom: number;
}
