import {Injectable} from '@angular/core';
import {PixiService} from "../pixi.service";
import {Container, Renderer} from "pixi.js";
import {ModeManagerService} from "./mode-manager.service";
import {EventBusService} from "../event/event-bus.service";
import {StateService} from "../event/state.service";
import {VisualGrid} from "../../model/graphical-model/visual-grid";
import {CanvasBorder} from "../../model/graphical-model/canvas-border";
import {CanvasEventHandler} from "../../logic/handler/canvas-event-handler";
import {ServiceManager} from "../../logic/service-manager";
import {NodeEventHandler} from "../../logic/handler/node-event-handler";
import {GraphViewService} from "../graph/graph-view.service";
import {HistoryService} from "../history.service";
import {EdgeEventHandler} from "../../logic/handler/edge-event-handler";
import {NodeViewFabricService} from "../fabric/node-view-fabric.service";
import {EdgeViewFabricService} from "../fabric/edge-view-fabric.service";
import {GraphStateManagerService} from "./graph-state-manager.service";
import {GraphSetViewManagerService} from "./graph-set-view-manager.service";
import {GraphMatrixViewStateManagerService} from "./graph-matrix-view-state-manager.service";
import {AlgorithmManagerService} from "./algorithm-manager.service";
import {AlgorithmEventHandler} from "../../logic/handler/algorithm/algorithm-event-handler";

/**
 * Service to manage the PIXI canvas
 */
@Injectable({
  providedIn: 'root'
})
export class PixiManagerService implements ServiceManager {

  private canvasEventHandler!: CanvasEventHandler;
  private nodeEventHandler!: NodeEventHandler;
  private edgeEventHandler!: EdgeEventHandler;
  private algorithmEventHandler!: AlgorithmEventHandler;

  constructor(private pixiService: PixiService,
              private eventBus: EventBusService,
              private stateService: StateService,
              private modeManagerService: ModeManagerService,
              private algorithmManagerService: AlgorithmManagerService,
              private graphManagerService: GraphStateManagerService,
              private setViewManager: GraphSetViewManagerService,
              private matrixManagerService: GraphMatrixViewStateManagerService,
              private graphViewService: GraphViewService,
              private historyService: HistoryService,
              private nodeFabric: NodeViewFabricService,
              private edgeFabric: EdgeViewFabricService) {
  }

  /**
   * Start point for the PIXI canvas initialization.
   */
  public async startPixi() {
    await this.setUpDefaultPixiCanvas();
    // Render the PIXI canvas
    this.pixiService.startRendering();
    console.log("Pixi initialized. Renderer: " + this.pixiService.renderer.constructor.name); // TODO remove
    // Initialize pixi global listeners. Init all handlers
    this.initSubscriptions();
    // Initialize all managers
    this.modeManagerService.initialize();
    this.algorithmManagerService.initialize();
    this.graphManagerService.initialize();
    this.setViewManager.initialize();
    this.matrixManagerService.initialize();
    console.log("Pixi started"); // TODO remove
  }

  /**
   * Stop the PIXI rendering. Destroy all subscriptions.
   */
  public stopPixi() {
    this.pixiService.stopRendering();
    this.historyService.clear(); // Clear history
    this.destroySubscriptions(); // Stop default canvas event listeners
    this.modeManagerService.destroy();
    this.algorithmManagerService.destroy();
    this.graphManagerService.destroy();
    this.setViewManager.destroy();
    this.matrixManagerService.destroy();
    this.edgeFabric.destroy();
    this.nodeFabric.destroy();
    this.eventBus.destroy(); // Clear all non-state listeners, handlers
    // Destroy pixi Canvas
    this.destroyDefaultPixiCanvas();
    this.pixiService.stage = undefined;
    this.pixiService.renderer = undefined;
    this.pixiService.ticker = undefined;
    this.pixiService.mainContainer = undefined;
    this.pixiService.canvasBoundaries = undefined;
    this.pixiService.canvasVisualGrid = undefined;
    console.log("MANAGER.Pixi stopped"); // TODO remove
    // Notify state service that PIXI is stopped
    this.stateService.pixiStopped();
  }

  /**
   * Check if PIXI is started.
   */
  public isPixiStarted(): boolean {
    return this.pixiService.renderer !== undefined;
  }

  // Set up the default PIXI canvas
  protected async setUpDefaultPixiCanvas() {
    const htmlContainer = document.getElementById('pixiCanvas');
    if (htmlContainer == null) {
      throw new Error('Canvas container not found');
    }

    // Initialize
    const rendererSize = this.pixiService.calculateRendererSize();
    console.log("Renderer size: " + rendererSize.width + "x" + rendererSize.height); // TODO remove
    const stage = this.pixiService.createDefaultStage();
    const renderer: Renderer = await this.pixiService.createDefaultRenderer(rendererSize.width, rendererSize.height);
    const ticker = this.pixiService.createDefaultTicker();
    const mainContainer = new Container();
    const boundaryCanvasGraphics = new CanvasBorder(this.pixiService.boundaryXMin,
      this.pixiService.boundaryXMax, this.pixiService.boundaryYMin, this.pixiService.boundaryYMax);
    const visualGrid = new VisualGrid(VisualGrid.DEFAULT_CELL_SIZE, this.pixiService.boundaryXMin,
      this.pixiService.boundaryXMax, this.pixiService.boundaryYMin, this.pixiService.boundaryYMax);
    this.pixiService.renderer = renderer;
    this.pixiService.ticker = ticker;
    this.pixiService.stage = stage;
    this.pixiService.mainContainer = mainContainer;
    this.pixiService.canvasBoundaries = boundaryCanvasGraphics;
    this.pixiService.canvasVisualGrid = visualGrid;

    // Set up
    mainContainer.label = 'Main container';
    stage.eventMode = 'dynamic';
    stage.hitArea = renderer.screen;
    stage.addChild(mainContainer);

    // Add boundaries to limit space
    this.pixiService.canvasBoundaries.drawBorder();
    stage.addChild(this.pixiService.canvasBoundaries);
    // Add visual grid container
    mainContainer.addChild(this.pixiService.canvasVisualGrid);

    // Append the canvas to the container
    htmlContainer.appendChild(renderer.canvas);
    // Append the stage to the renderer and ticker to renderer
    ticker.add(() => renderer.render(stage));
  }

  /**
   * Initialize global listeners related with pixi.
   * Resizing window, cursor move, etc.
   */
  initSubscriptions() {
    // Initialize all event handlers
    this.canvasEventHandler = CanvasEventHandler.initialize(this.pixiService, this.eventBus, this.stateService,
      this.graphViewService);
    this.nodeEventHandler = NodeEventHandler.initialize(this.pixiService, this.eventBus, this.stateService,
      this.graphViewService, this.historyService, this.nodeFabric);
    this.edgeEventHandler = EdgeEventHandler.initialize(this.pixiService, this.eventBus, this.stateService,
      this.graphViewService, this.historyService, this.nodeFabric, this.edgeFabric);
    this.algorithmEventHandler = AlgorithmEventHandler.initialize(this.pixiService, this.eventBus, this.stateService,
      this.graphViewService, this.nodeFabric, this.edgeFabric);
    // Initialize default canvas event handlers (zoom, drag canvas etc)
    this.canvasEventHandler.initializeDefaultEventHandlers();
  }

  destroySubscriptions(): void {
    this.canvasEventHandler.destroyDefaultEventHandlers();
  }

  private destroyDefaultPixiCanvas() {
    const htmlContainer = document.getElementById('pixiCanvas');
    if (htmlContainer == null) {
      throw new Error('Canvas container not found');
    }
    htmlContainer.removeChild(this.pixiService.renderer.canvas); // Remove pixi canvas from DOM
  }
}
