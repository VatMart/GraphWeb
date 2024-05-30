import { Injectable } from '@angular/core';
import {PixiService} from "../pixi.service";
import {Container, FederatedPointerEvent, Renderer} from "pixi.js";
import {ModeManagerService} from "./mode-manager.service";
import {EventBusService, HandlerNames} from "../event-bus.service";
import {StateService} from "../state.service";
import {NodeView} from "../../model/graphical-model/node/node-view";
import {EdgeView} from "../../model/graphical-model/edge/edge-view";

/**
 * Service to manage the PIXI canvas
 */
@Injectable({
  providedIn: 'root'
})
export class PixiManagerService {

  private boundHandleCursorMoving: (event: FederatedPointerEvent) => void;
  private boundHandleContextMenu: (event: any) => void;
  private boundHandleResizeCanvas: () => void;
  private boundHandleCanvasStartDragging: (event: FederatedPointerEvent) => void;
  private boundHandleCanvasDragging: (event: FederatedPointerEvent) => void;
  private boundHandleCanvasEndDragging: (event: FederatedPointerEvent) => void;

  // CursorCoordinates
  xCursor: number = 0;
  yCursor: number = 0;

  // Canvas dragging
  private canvasDragging: boolean = false;
  private previousPoint = {x: 0, y: 0};

  constructor(private pixiService: PixiService,
              private eventBus: EventBusService,
              private stateService: StateService,
              private modeManagerService: ModeManagerService) {
    // Binding event handlers
    this.boundHandleCursorMoving = this.handlePointerDown.bind(this);
    this.boundHandleContextMenu = this.handlerContextMenu.bind(this);
    this.boundHandleResizeCanvas = this.handlerResizeCanvas.bind(this);
    this.boundHandleCanvasStartDragging = this.handleCanvasStartDragging.bind(this);
    this.boundHandleCanvasDragging = this.handleCanvasDragging.bind(this);
    this.boundHandleCanvasEndDragging = this.handleCanvasEndDragging.bind(this);

    // Registering event handlers
    this.eventBus.registerHandler(HandlerNames.CANVAS_CURSOR_MOVE, this.boundHandleCursorMoving);
    this.eventBus.registerHandler(HandlerNames.CANVAS_CONTEXT_MENU, this.boundHandleContextMenu);
    this.eventBus.registerHandler(HandlerNames.CANVAS_RESIZE, this.boundHandleResizeCanvas);
    this.eventBus.registerHandler(HandlerNames.CANVAS_DRAG_START, this.boundHandleCanvasStartDragging);
    this.eventBus.registerHandler(HandlerNames.CANVAS_DRAG_MOVE, this.boundHandleCanvasDragging);
    this.eventBus.registerHandler(HandlerNames.CANVAS_DRAG_END, this.boundHandleCanvasEndDragging);
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

  /**
   * Stop the PIXI rendering. Clean up the resources.
   */
  public stopPixi() {
    // TODO implement
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
    this.pixiService.renderer = renderer;
    this.pixiService.ticker = ticker;
    this.pixiService.stage = stage;
    this.pixiService.mainContainer = mainContainer;

    // Set up
    stage.eventMode = 'dynamic';
    stage.hitArea = renderer.screen;
    stage.addChild(mainContainer);

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
    // Canvas dragging events
    this.eventBus.registerPixiEvent(this.pixiService.stage, 'pointerdown', HandlerNames.CANVAS_DRAG_START);
    this.eventBus.registerPixiEvent(this.pixiService.stage, 'pointermove', HandlerNames.CANVAS_DRAG_MOVE);
    this.eventBus.registerPixiEvent(this.pixiService.stage, 'pointerup', HandlerNames.CANVAS_DRAG_END);
    this.eventBus.registerPixiEvent(this.pixiService.stage, 'pointerupoutside', HandlerNames.CANVAS_DRAG_END);

    // Subscriptions
    // Resize canvas on UI change
    this.stateService.needResizeCanvas$.subscribe(value => {
      this.handlerResizeCanvas();
    });
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

  private handlerResizeCanvas() {
    const rendererSize = this.pixiService.calculateRendererSize();
    this.pixiService.renderer.resize(rendererSize.width, rendererSize.height);
    this.stateService.changedRendererSize(rendererSize.width, rendererSize.height);
  }

  private handleCanvasStartDragging(event: FederatedPointerEvent): void {
    if (event.target instanceof NodeView || event.target instanceof EdgeView) {
      return;
    }
    if (event.pointerType === 'mouse' && event.button === 0) {
      return;
    }
    this.canvasDragging = true;
    this.previousPoint = {x: event.globalX, y: event.globalY};
  }

  private handleCanvasDragging(event: FederatedPointerEvent): void {
    if (this.canvasDragging) {
      const currentPoint = event.getLocalPosition(this.pixiService.stage);
      const dx = currentPoint.x - this.previousPoint.x;
      const dy = currentPoint.y - this.previousPoint.y;

      this.pixiService.mainContainer.x += dx;
      this.pixiService.mainContainer.y += dy;

      this.previousPoint = currentPoint;
    }
  }

  private handleCanvasEndDragging(event: FederatedPointerEvent): void {
    this.canvasDragging = false;
  }

}
