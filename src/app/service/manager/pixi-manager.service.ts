import { Injectable } from '@angular/core';
import {PixiService} from "../pixi.service";
import {FederatedPointerEvent, Renderer} from "pixi.js";
import {ModeManagerService} from "./mode-manager.service";
import {EventBusService, HandlerNames} from "../event-bus.service";
import {StateService} from "../state.service";

/**
 * Service to manage the PIXI canvas
 */
@Injectable({
  providedIn: 'root'
})
export class PixiManagerService {

  private boundHandleCursorMoving: (event: FederatedPointerEvent) => void;
  private boundHandleContextMenu: (event: any) => void;
  private boundHandleResizeCanvas: (event: UIEvent) => void;
  // CursorCoordinates
  xCursor: number = 0;
  yCursor: number = 0;

  constructor(private pixiService: PixiService,
              private eventBus: EventBusService,
              private stateService: StateService,
              private modeManagerService: ModeManagerService) {
    // Binding event handlers
    this.boundHandleCursorMoving = this.handlePointerDown.bind(this);
    this.boundHandleContextMenu = this.handlerContextMenu.bind(this);
    this.boundHandleResizeCanvas = this.handlerResizeCanvas.bind(this);

    // Registering event handlers
    this.eventBus.registerHandler(HandlerNames.CANVAS_CURSOR_MOVE, this.boundHandleCursorMoving);
    this.eventBus.registerHandler(HandlerNames.CANVAS_CONTEXT_MENU, this.boundHandleContextMenu);
    this.eventBus.registerHandler(HandlerNames.CANVAS_RESIZE, this.boundHandleResizeCanvas);
  }

  /**
   * Start point for the PIXI canvas initialization.
   */
  public async startPixi() {
    await this.setUpDefaultPixiCanvas();
    this.pixiService.startRendering();
    console.log("Pixi initialized. Renderer: " + this.pixiService.renderer.constructor.name); // TODO remove
    this.initPixiListeners();
    this.modeManagerService.initialize(); // Initialize default mode listeners
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
    this.pixiService.renderer = renderer;
    this.pixiService.ticker = ticker;
    this.pixiService.stage = stage;

    // Set up
    stage.eventMode = 'dynamic';
    stage.hitArea = renderer.screen;

    // Append the canvas to the container
    htmlContainer.appendChild(renderer.canvas);
    // Append the stage to the renderer and ticker to renderer
    ticker.add(() => renderer.render(stage));
  }

  /**
   * Initialize global listeners related with pixi.
   * Resizing window, cursor move, etc.
   */
  initPixiListeners() {
    // Init listeners
    // Cursor move event
    this.eventBus.registerPixiEvent(this.pixiService.stage, 'pointermove', HandlerNames.CANVAS_CURSOR_MOVE);
    // Context menu on canvas event
    this.eventBus.registerTsEvent(this.pixiService.renderer.canvas, 'contextmenu', HandlerNames.CANVAS_CONTEXT_MENU);
    // Resize window event
    this.eventBus.registerTsEvent(window, 'resize', HandlerNames.CANVAS_RESIZE);
  }

  private handlePointerDown(event: FederatedPointerEvent): void {
    this.xCursor = event.globalX;
    this.yCursor = event.globalY;
    this.stateService.changeCursorX(this.xCursor)
    this.stateService.changeCursorY(this.yCursor)
  }

  private handlerContextMenu(event: any): void {
    event.preventDefault();
    console.log("Context menu")
    // TODO add context menu
  }

  private handlerResizeCanvas(event: UIEvent) {
    const rendererSize = this.pixiService.calculateRendererSize();
    this.pixiService.renderer.resize(rendererSize.width, rendererSize.height);
    this.stateService.changedRendererSize(rendererSize.width, rendererSize.height);
  }

}
