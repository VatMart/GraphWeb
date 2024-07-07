import {AfterViewInit, Component, ElementRef, OnDestroy, ViewChild} from '@angular/core';
import * as PIXI from "pixi.js";
import {StateService} from "../../service/event/state.service";
import {PixiService} from "../../service/pixi.service";
import {GraphViewService} from "../../service/graph/graph-view.service";
import {EventBusService} from "../../service/event/event-bus.service";
import {NodeViewFabricService} from "../../service/fabric/node-view-fabric.service";
import {EdgeViewFabricService} from "../../service/fabric/edge-view-fabric.service";
import {PixiManagerService} from "../../service/manager/pixi-manager.service";
import {LocalStorageService} from "../../service/local-storage.service";
import {FileService} from "../../service/file.service";

/**
 * Component for the main canvas.
 */
@Component({
  selector: 'app-canvas',
  standalone: true,
  imports: [],
  templateUrl: './canvas.component.html',
  styleUrl: './canvas.component.css'
})
export class CanvasComponent implements AfterViewInit, OnDestroy {

  @ViewChild('canvasContainer', { static: true }) canvasContainer!: ElementRef;
  private resizeObserver!: ResizeObserver;
  private bindSaveAppData = this.saveAppData.bind(this);

  constructor(private pixiService: PixiService,
              private stateService: StateService,
              private localStorageService: LocalStorageService,
              private fileService: FileService,
              private eventBus: EventBusService,
              private nodeFabric: NodeViewFabricService,
              private edgeFabric: EdgeViewFabricService,
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
    this.resizeObserver = new ResizeObserver(() => this.onResize());
    this.resizeObserver.observe(this.canvasContainer.nativeElement);
    this.graphViewService.initializeGraphView(); // Init graph view // TODO uncomment in production
    this.stateService.changeMode('default'); // Change mode to default // TODO uncomment in production
    if (this.localStorageService.isAppDataSaved()) {
      this.localStorageService.loadAppData(); // Initialize app data from local storage
    }

    // ----------------- TODO Remove below -----------------
    // let graph: Graph = new Graph();
    // let graphView = new GraphView(graph);
    // this.graphViewService.currentGraphView = graphView;
    // this.stateService.changeMode('default'); // Enable default mode
    // //this.localStorageService.loadAppData(); // Load app data from local storage
    //
    // let screenCenter = {x: this.pixiService.renderer.screen.width / 2,
    //   y: this.pixiService.renderer.screen.height / 2};
    //
    // let node1 = this.nodeFabric.createDefaultNodeViewWithCoordinates(graphView, {
    //   x: screenCenter.x,
    //   y: screenCenter.y + 30
    // });
    // this.graphViewService.addNodeToGraphView(graphView, node1);
    // let node2 = this.nodeFabric.createDefaultNodeViewWithCoordinates(graphView, {
    //   x: screenCenter.x - 155,
    //   y: screenCenter.y - 160
    // });
    // this.graphViewService.addNodeToGraphView(graphView, node2);
    // let node3 = this.nodeFabric.createDefaultNodeViewWithCoordinates(graphView, {
    //   x: screenCenter.x + 170,
    //   y: screenCenter.y
    // });
    // this.graphViewService.addNodeToGraphView(graphView, node3);
    // let node4 = this.nodeFabric.createDefaultNodeViewWithCoordinates(graphView, {
    //   x: screenCenter.x - 30,
    //   y: screenCenter.y - 160
    // });
    // this.graphViewService.addNodeToGraphView(graphView, node4);
    // // Create edges
    // let edge1 = this.edgeFabric.createDefaultEdgeView(graphView, node3, node2);
    // //edge2.changeEdgeOrientation(EdgeOrientation.NON_ORIENTED)
    // this.graphViewService.addEdgeToGraphView(graphView, edge1);
    // let edge2 = this.edgeFabric.createDefaultEdgeView(graphView, node4, node2);
    // this.graphViewService.addEdgeToGraphView(graphView, edge2);
    // let edge3 = this.edgeFabric.createDefaultEdgeView(graphView, node4, node3);
    // this.graphViewService.addEdgeToGraphView(graphView, edge3);

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
    this.resizeObserver.unobserve(this.canvasContainer.nativeElement);
    this.resizeObserver.disconnect();
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

  private onResize(): void {
    this.stateService.needResizeCanvas();
  }
}
