import {AfterViewInit, Component, OnDestroy} from '@angular/core';
import * as PIXI from "pixi.js";
import {StateService} from "../../service/event/state.service";
import {PixiService} from "../../service/pixi.service";
import {GraphViewService} from "../../service/graph/graph-view.service";
import {PixiManagerService} from "../../service/manager/pixi-manager.service";
import {LocalStorageService} from "../../service/local-storage.service";
import {FileService} from "../../service/file.service";
import {ConfService} from "../../service/config/conf.service";

/**
 * Component for the main canvas.
 * All graph elements are drawn on this canvas.
 * When it is initialized, PIXI is started and the graph view is initialized.
 */
@Component({
  selector: 'app-canvas',
  standalone: true,
  imports: [],
  templateUrl: './canvas.component.html',
  styleUrl: './canvas.component.css'
})
export class CanvasComponent implements AfterViewInit, OnDestroy {

  private bindSaveAppData = this.saveAppData.bind(this);

  constructor(private pixiService: PixiService,
              private stateService: StateService,
              private localStorageService: LocalStorageService,
              private fileService: FileService,
              private graphViewService: GraphViewService,
              private pixiManager: PixiManagerService) {
  }

  async ngAfterViewInit(): Promise<void> {
    await document.fonts.ready; // Wait for fonts to load
    // Start PIXI after the view canvas container is initialized
    await this.pixiManager.startPixi();
    // Notify state service that PIXI is started
    this.stateService.pixiStarted();
    // Resize canvas on container resize
    this.graphViewService.initializeGraphView(); // Init graph view
    // Set default mode
    this.stateService.changeMode('default');
    // Load app data from local storage if exists
    if (this.localStorageService.isAppDataSaved()) {
      this.localStorageService.loadAppData(); // Initialize app data from local storage
    }
    // Set default grid
    this.stateService.changeShowGrid(ConfService.SHOW_GRID);

    // ----------------- TODO Remove below -----------------
    (window as any).__PIXI_DEVTOOLS__ = { // TODO remove in production
      pixi: PIXI,
      renderer: this.pixiService.renderer,
      stage: this.pixiService.stage
    };
    // ----------------- TODO Remove above -----------------
    // Save the state before the user reloads/closes the page
    window.addEventListener('beforeunload', this.bindSaveAppData);
    window.addEventListener('pagehide', this.bindSaveAppData); // For mobile

    // Start auto-save every 5 minutes
    this.localStorageService.startAutoSave(5,
      () => this.fileService.serializeCurrentGraphAndSettings());
  }

  ngOnDestroy(): void {
    if (this.pixiManager.isPixiStarted()) {
      this.pixiManager.stopPixi();
    }
    window.removeEventListener('beforeunload', this.bindSaveAppData);
    window.removeEventListener('pagehide', this.bindSaveAppData);
  }

  private saveAppData(): void {
    if (this.graphViewService.currentGraphView.isEmpty()) {
      return; // Do not save empty graph
    }
    const data = this.fileService.serializeCurrentGraphAndSettings();
    this.localStorageService.saveAppData(data);
  }
}
