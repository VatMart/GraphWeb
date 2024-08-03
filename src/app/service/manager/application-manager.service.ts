import {Injectable} from '@angular/core';
import {Subscription} from "rxjs";
import {ServiceManager} from "../../logic/service-manager";
import {ExportService} from "../export.service";
import {StateService} from "../event/state.service";
import {DialogService} from "primeng/dynamicdialog";
import {ExportAsPngDialogComponent} from "../../component/dialog/export-as-png-dialog/export-as-png-dialog.component";

/**
 * Service for managing the application state.
 */
@Injectable({
  providedIn: 'root'
})
export class ApplicationManagerService implements ServiceManager {
  private subscriptions!: Subscription;

  constructor(private stateService: StateService,
              private dialogService: DialogService,
              private exportService: ExportService) { }

  initSubscriptions(): void {
    this.subscriptions = new Subscription();
    // On export as PNG window call
    this.subscriptions.add(
      this.stateService.callExportAsPngWindow$.subscribe((value) => {
        this.showExportAsPngWindow();
      })
    );
    // On export as PNG request
    this.subscriptions.add(
      this.stateService.callExportAsPng$.subscribe((value) => {
        this.exportService.exportAsPng(value);
      })
    );
  }

  destroySubscriptions(): void {
    this.subscriptions.unsubscribe();
  }

  private showExportAsPngWindow() {
    this.dialogService.open(ExportAsPngDialogComponent, {
      header: 'Export as PNG',
      contentStyle: {overflow: 'auto'},
      breakpoints: {'960px': '75vw', '640px': '90vw'},
      modal: true,
      focusOnShow: false,
      focusTrap: true,
      dismissableMask: true,
      closable: true,
    });
  }
}
