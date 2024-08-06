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
   * Key for the local storage app data.
   */
  private appStorageKey = 'graph-web-app';

  private lastUploadAppTimeKey: string = 'latest-upload-app-time';

  constructor(private stateService: StateService,
              private fileService: FileService) {
  }

  /**
   * Save application data to local storage.
   */
  public saveAppData(data: string): void {
    localStorage.setItem(this.appStorageKey, data);
  }

  public isAppDataSaved(): boolean {
    return localStorage.getItem(this.appStorageKey) !== null;
  }

  /**
   * Save the last time the application was uploaded.
   * @param time UTC time in milliseconds.
   */
  public saveLastUploadAppTime(time: number): void {
    localStorage.setItem(this.lastUploadAppTimeKey, time.toString());
  }

  /**
   * Get the last time the application was uploaded.
   * @return UTC time in milliseconds.
   */
  public getLastUploadAppTime(): number {
    const savedData = localStorage.getItem(this.lastUploadAppTimeKey);
    return savedData !== null ? parseInt(savedData, 10) : 0;
  }

  /**
   * Load application data from local storage.
   * Call state service to apply the loaded data to the application.
   */
  public loadAppData(): void {
    const savedData = localStorage.getItem(this.appStorageKey);
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
