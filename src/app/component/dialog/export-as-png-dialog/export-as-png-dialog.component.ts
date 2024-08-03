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

  resolutionLevelItems: ResolutionLevelItem[] | undefined;
  selectedResolutionLevel: FormControl<'low' | 'medium' | 'high' | null> = new FormControl('high');
  transparentBackground = new FormControl(false);

  constructor(public ref: DynamicDialogRef,
              public config: DynamicDialogConfig,
              private cdr: ChangeDetectorRef,
              private stateService: StateService) {
  }

  ngOnInit(): void {
    this.resolutionLevelItems = [
      {
        label: 'Low',
        value: 'low',
        command: () => {
          this.selectedResolutionLevel.setValue('low');
        }
      },
      {
        label: 'Medium',
        value: 'medium',
        command: () => {
          this.selectedResolutionLevel.setValue('medium');
        }
      },
      {
        label: 'High',
        value: 'high',
        command: () => {
          this.selectedResolutionLevel.setValue('high');
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
      transparentBackground: this.transparentBackground.value === null ? false : this.transparentBackground.value,
      resolutionLevel: this.selectedResolutionLevel.value === null ? 'high' : this.selectedResolutionLevel.value
    };
    this.stateService.callExportAsPng(request);
    this.ref.close();
  }
}

interface ResolutionLevelItem {
  label: string;
  value: string;
  command: () => void;
}

export interface ExportAsPngRequest {
  transparentBackground: boolean;
  resolutionLevel: 'low' | 'medium' | 'high';
}
