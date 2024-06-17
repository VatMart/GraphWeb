import {Injectable} from '@angular/core';
import {PixiService} from "../pixi.service";
import {Container, Renderer} from "pixi.js";
import {ModeManagerService} from "./mode-manager.service";
import {EventBusService} from "../event-bus.service";
import {StateService} from "../state.service";
import {VisualGrid} from "../../model/graphical-model/visual-grid";
import {CanvasBorder} from "../../model/graphical-model/canvas-border";
import {CanvasEventHandler} from "../../logic/handlers/canvas-event-handler";
import {ServiceManager} from "../../logic/service-manager";
import {NodeEventHandler} from "../../logic/handlers/node-event-handler";
import {GraphViewService} from "../graph-view.service";
import {HistoryService} from "../history.service";
import {EdgeEventHandler} from "../../logic/handlers/edge-event-handler";
import {NodeViewFabricService} from "../node-view-fabric.service";
import {EdgeViewFabricService} from "../edge-view-fabric.service";

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

  constructor(private pixiService: PixiService,
              private eventBus: EventBusService,
              private stateService: StateService,
              private modeManagerService: ModeManagerService,
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
    // Initialize mode listeners
    this.modeManagerService.initialize();
    // Notify state service that PIXI is started
    this.stateService.pixiStarted();
  }

  /**
   * Stop the PIXI rendering. Clean up the resources.
   */
  public stopPixi() {
    // TODO implement
    this.destroySubscriptions();
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
    try {
      // Initialize all event handlers
      this.canvasEventHandler = CanvasEventHandler.initialize(this.pixiService, this.eventBus, this.stateService,
        this.graphViewService);
      this.nodeEventHandler = NodeEventHandler.initialize(this.pixiService, this.eventBus, this.stateService,
        this.graphViewService, this.historyService, this.nodeFabric);
      this.edgeEventHandler = EdgeEventHandler.initialize(this.pixiService, this.eventBus, this.stateService,
        this.graphViewService, this.historyService, this.nodeFabric, this.edgeFabric);
      // Initialize default canvas event handlers (zoom, drag canvas etc)
      this.canvasEventHandler.initializeDefaultEventHandlers();
    } catch (e) {
      console.error("Error initializing event handlers: " + e);
    }
  }

  destroySubscriptions(): void {
    this.canvasEventHandler.destroyDefaultEventHandlers();
  }
}
