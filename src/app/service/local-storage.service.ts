import {Injectable} from '@angular/core';
import {StateService} from "./event/state.service";
import {interval} from "rxjs";
import {FileService} from "./file.service";

/**
 * Service for managing the local storage of the application.
 */
@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  /**
   * Key for the local storage.
   */
  private storageKey = 'graph-web-app';

  constructor(private stateService: StateService,
              private fileService: FileService) {
  }

  /**
   * Save application data to local storage.
   */
  public saveAppData(data: string): void {
    localStorage.setItem(this.storageKey, data);
  }

  public isAppDataSaved(): boolean {
    return localStorage.getItem(this.storageKey) !== null;
  }

  /**
   * Load application data from local storage.
   * Call state service to apply the loaded data to the application.
   */
  public loadAppData(): void {
    const savedData = localStorage.getItem(this.storageKey);
    if (savedData !== null) {
      let appData;
      try {
        appData = this.fileService.deserializeGraphAndSettings(savedData);
      } catch (e) {
        console.error('Error while loading app data from local storage: ' + e);
        return;
      }
      this.stateService.loadApp(appData);
    }
  }

  /**
   * Start auto save of the application data.
   */
  public startAutoSave(intervalMinutes: number, getAppData: () => string): void {
    interval(intervalMinutes * 60 * 1000).subscribe(() => {
      const appData = getAppData();
      this.saveAppData(appData);
    });
  }
}
