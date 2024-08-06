import {Injectable} from '@angular/core';
import {Subscription} from "rxjs";
import {ServiceManager} from "../../logic/service-manager";
import {ExportService} from "../export.service";
import {StateService} from "../event/state.service";
import {DialogService} from "primeng/dynamicdialog";
import {ExportAsPngDialogComponent} from "../../component/dialog/export-as-png-dialog/export-as-png-dialog.component";
import {AboutPageDialogComponent} from "../../component/dialog/about-page-dialog/about-page-dialog.component";
import {WelcomePageDialogComponent} from "../../component/dialog/welcome-page-dialog/welcome-page-dialog.component";

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
    // On show welcome page dialog
    this.subscriptions.add(
      this.stateService.showWelcomeDialog$.subscribe((value) => {
        if (value){
          this.showWelcomePageDialog();
        }
      })
    );
    // On show about page dialog
    this.subscriptions.add(
      this.stateService.showAboutDialog$.subscribe((value) => {
        if (value){
          this.showAboutPageDialog();
        }
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

  private showWelcomePageDialog() {
    this.dialogService.open(WelcomePageDialogComponent, {
      contentStyle: {
        overflow: 'auto',
        ['background-image']: 'url(\'../../../../assets/img/AboutPageBackground.webp\')',
        ['background-size']: 'cover',
        ['background-repeat']: 'no-repeat',
        ['background-position']: 'center',
        ['align-content']: 'center',
        padding: '2% 5%'
      },
      width: '95vw',
      height: '95vh',
      modal: true,
      focusOnShow: false,
      dismissableMask: true,
      showHeader: false,
    });
  }

  private showAboutPageDialog() {
    this.dialogService.open(AboutPageDialogComponent, {
      contentStyle: {
        overflow: 'auto',
        ['background-image']: 'url(\'../../../../assets/img/AboutPageBackground.webp\')',
        ['background-size']: 'cover',
        ['background-repeat']: 'no-repeat',
        ['background-position']: 'center',
        ['align-content']: 'center',
        padding: '2% 5%'
      },
      width: '95vw',
      height: '95vh',
      modal: true,
      focusOnShow: false,
      dismissableMask: true,
      showHeader: false,
    });
  }
}
