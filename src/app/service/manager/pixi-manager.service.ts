import {Injectable} from '@angular/core';
import {PixiService} from "../pixi.service";
import {Container, FederatedPointerEvent, FederatedWheelEvent, Graphics, Point, Renderer} from "pixi.js";
import {ModeManagerService} from "./mode-manager.service";
import {EventBusService, HandlerNames} from "../event-bus.service";
import {StateService} from "../state.service";
import {NodeView} from "../../model/graphical-model/node/node-view";
import {EdgeView} from "../../model/graphical-model/edge/edge-view";
import * as Hammer from 'hammerjs';
import {VisualGrid} from "../../model/graphical-model/visual-grid";
import {CanvasBorder} from "../../model/graphical-model/canvas-border";

/**
 * Service to manage the PIXI canvas
 */
@Injectable({
  providedIn: 'root'
})
export class PixiManagerService {

  // Refactor class to move all event handlers to separate class (CanvasEventHandler)

  private boundHandleCursorMoving: (event: FederatedPointerEvent) => void;
  private boundHandleContextMenu: (event: any) => void;
  private boundHandleResizeCanvas: () => void;
  private boundHandleCanvasStartDragging: (event: FederatedPointerEvent) => void;
  private boundHandleCanvasDragging: (event: FederatedPointerEvent) => void;
  private boundHandleCanvasEndDragging: (event: FederatedPointerEvent) => void;
  private boundHandleWheelZooming: (event: WheelEvent) => void;

  // CursorCoordinates
  xCursor: number = 0;
  yCursor: number = 0;

  // Canvas panning
  private canvasDragging: boolean = false;
  private previousPoint = {x: 0, y: 0};
  // Map of active touches for multitouch dragging (used to prevent dragging with multiple fingers)
  private activeTouches: Map<number, { x: number; y: number }> = new Map();

  // Canvas zooming
  // Initial scale values for calculating zoom percentage
  private initialScaleX: number = 1.0;
  private initialScaleY: number = 1.0;
  private maxScale: number = 3.0;  // Maximum zoom level (300%)
  private minScale: number = 0.5;  // Minimum zoom level (50%)
  // Touch screen zooming
  private initialPinchScale: number = 1.0;

  constructor(private pixiService: PixiService,
              private eventBus: EventBusService,
              private stateService: StateService,
              private modeManagerService: ModeManagerService) {
    // Binding event handlers
    this.boundHandleCursorMoving = this.handleCursorMoving.bind(this);
    this.boundHandleContextMenu = this.handlerContextMenu.bind(this);
    this.boundHandleResizeCanvas = this.handlerResizeCanvas.bind(this);
    this.boundHandleCanvasStartDragging = this.handleCanvasStartDragging.bind(this);
    this.boundHandleCanvasDragging = this.handleCanvasDragging.bind(this);
    this.boundHandleCanvasEndDragging = this.handleCanvasEndDragging.bind(this);
    this.boundHandleWheelZooming = this.handleWheelZooming.bind(this);

    // Registering event handlers
    this.eventBus.registerHandler(HandlerNames.CANVAS_CURSOR_MOVE, this.boundHandleCursorMoving);
    this.eventBus.registerHandler(HandlerNames.CANVAS_CONTEXT_MENU, this.boundHandleContextMenu);
    this.eventBus.registerHandler(HandlerNames.CANVAS_RESIZE, this.boundHandleResizeCanvas);
    this.eventBus.registerHandler(HandlerNames.CANVAS_DRAG_START, this.boundHandleCanvasStartDragging);
    this.eventBus.registerHandler(HandlerNames.CANVAS_DRAG_MOVE, this.boundHandleCanvasDragging);
    this.eventBus.registerHandler(HandlerNames.CANVAS_DRAG_END, this.boundHandleCanvasEndDragging);
    this.eventBus.registerHandler(HandlerNames.CANVAS_ZOOM, this.boundHandleWheelZooming);
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
    // Canvas zooming event
    this.eventBus.registerTsEvent(this.pixiService.renderer.canvas, 'wheel', HandlerNames.CANVAS_ZOOM);
    // Touchscreen events
    this.addTouchscreenListeners();

    // Subscriptions
    this.initSubscriptions();
  }

  private initSubscriptions() {
    // Resize canvas on UI change
    this.stateService.needResizeCanvas$.subscribe(value => {
      this.handlerResizeCanvas();
    });
    // Zoom to a specific percentage on call from UI
    this.stateService.zoomToChange$.subscribe(percentage => {
      if (percentage !== null) {
        this.zoomCanvasTo(percentage);
      }
    });
    this.stateService.showGrid$.subscribe(value => {
      this.pixiService.canvasVisualGrid.renderable = value;
      if (value) {
        this.pixiService.canvasVisualGrid.drawGrid();
      }
    });
  }

  private handleCursorMoving(event: FederatedPointerEvent): void {
    this.xCursor = event.globalX;
    this.yCursor = event.globalY;
    const currentPoint = event.getLocalPosition(this.pixiService.mainContainer); // TODO Change back
    this.stateService.changeCursorX(currentPoint.x)
    this.stateService.changeCursorY(currentPoint.y)
    // this.stateService.changeCursorX(this.xCursor)
    // this.stateService.changeCursorY(this.yCursor)
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
    this.activeTouches.set(event.pointerId, {x: event.globalX, y: event.globalY});
    if (this.activeTouches.size === 1) {
      this.canvasDragging = true;
      this.previousPoint = {x: event.globalX, y: event.globalY};
    } else {
      // More than one touch, likely starting a pinch zoom
      this.canvasDragging = false;
    }
  }

  private handleCanvasDragging(event: FederatedPointerEvent): void {
    if (this.activeTouches.has(event.pointerId)) {
      this.activeTouches.set(event.pointerId, {x: event.globalX, y: event.globalY});

      if (this.canvasDragging) {
        const currentPoint = event.getLocalPosition(this.pixiService.stage);
        const dx = currentPoint.x - this.previousPoint.x;
        const dy = currentPoint.y - this.previousPoint.y;

        const newPoint: Point = new Point(this.pixiService.mainContainer.x + dx, this.pixiService.mainContainer.y + dy);

        const currentBoundaryMinPosition = this.pixiService.mainContainer.toLocal(this.pixiService.stage); // TODO Change back
        const currentBoundaryMaxPosition = this.pixiService.mainContainer.toLocal(new Point(this.pixiService.renderer.screen.x+this.pixiService.renderer.screen.width, this.pixiService.renderer.screen.y + this.pixiService.renderer.screen.height), this.pixiService.stage); // TODO Change back
        const newBoundaryMinPosition = new Point(currentBoundaryMinPosition.x + dx, currentBoundaryMinPosition.y + dy);
        const newBoundaryMaxPosition = new Point(currentBoundaryMaxPosition.x + dx, currentBoundaryMaxPosition.y + dy);
        //this.drawDebugBoundaries();
        // console.log(`newPoint x: ${newPoint.x}, y: ${newPoint.y}`)
        // console.log(`currentBoundaryMinPosition.x: ${currentBoundaryMinPosition.x}, y: ${currentBoundaryMinPosition.y}`)
        if (newBoundaryMinPosition.x < this.pixiService.boundaryXMin) {
          //console.log("Out of bounds left");
          //newPoint.x = -currentBoundaryMinPosition.x - 2;
        }
        //console.log(`stage max position: ${newBoundaryMaxPosition.x}`)
        if (newBoundaryMaxPosition.x > this.pixiService.boundaryXMax) {
          //console.log("Out of bounds right");
          //newPoint.x = -currentBoundaryMinPosition.x + 2;
        }
        if (newBoundaryMaxPosition.y > this.pixiService.boundaryYMax) {
          //console.log("Out of bounds bottom");
          //newPoint.y = -currentBoundaryMinPosition.y + 2;
        }
        if (newBoundaryMinPosition.y < this.pixiService.boundaryYMin) {
          //console.log("Out of bounds top");
          //newPoint.y = -currentBoundaryMinPosition.y - 2;
        }

        this.pixiService.mainContainer.x = newPoint.x;
        this.pixiService.mainContainer.y = newPoint.y;

        this.previousPoint = currentPoint;
        // Move boundary graphics with the container
        this.pixiService.canvasBoundaries.position.set(this.pixiService.mainContainer.x,
          this.pixiService.mainContainer.y);
      }
    }
  }

  private handleCanvasEndDragging(event: FederatedPointerEvent): void {
    this.activeTouches.delete(event.pointerId);
    if (this.activeTouches.size < 2) {
      // End of pinch or back to single touch, may resume dragging
      this.canvasDragging = false;
    }
  }

  /**
   * Handle the wheel event for zooming the canvas.
   */
  handleWheelZooming(event: WheelEvent): void {
    event.preventDefault();
    const scaleFactor = event.deltaY > 0 ? 1 / 1.1 : 1.1;
    // Calculate potential new scales
    const newScaleX = this.pixiService.mainContainer.scale.x * scaleFactor;
    const newScaleY = this.pixiService.mainContainer.scale.y * scaleFactor;
    // Check if the new scale exceeds maximum or minimum bounds
    if (newScaleX < this.minScale || newScaleY < this.minScale || newScaleX > this.maxScale || newScaleY > this.maxScale) {
      return;
    }

    const cursorPosition = this.pixiService.renderer.events.pointer.global;
    const localPosition = this.pixiService.mainContainer.toLocal(cursorPosition, this.pixiService.stage);

    // Set the pivot to the local cursor position
    this.pixiService.mainContainer.pivot.set(localPosition.x, localPosition.y);
    this.pixiService.mainContainer.position.set(cursorPosition.x, cursorPosition.y);
    this.pixiService.mainContainer.scale.set(newScaleX, newScaleY);
    // TODO update textures resolutions on zoom

    // Scale boundaries
    this.pixiService.canvasBoundaries.pivot.set(localPosition.x, localPosition.y);
    this.pixiService.canvasBoundaries.position.set(cursorPosition.x, cursorPosition.y);
    this.pixiService.canvasBoundaries.scale.set(newScaleX, newScaleY);

    this.publishZoomPercentage();
  }

  /**
   * Zoom the canvas to a specific percentage.
   * This method is used to set the zoom level from the outside.
   */
  private zoomCanvasTo(percentage: number) {
    this.pixiService.mainContainer.pivot.set(this.pixiService.mainContainer.width/2, this.pixiService.stage.height/2); // Center of the canvas
    const newScaleX = (percentage / 100) * this.initialScaleX;
    const newScaleY = (percentage / 100) * this.initialScaleY;
    this.pixiService.mainContainer.scale.x = newScaleX;
    this.pixiService.mainContainer.scale.y = newScaleY;
    // Scale boundaries
    this.pixiService.canvasBoundaries.pivot.set(this.pixiService.mainContainer.width/2, this.pixiService.stage.height/2);
    this.pixiService.canvasBoundaries.scale.set(newScaleX, newScaleY);
    // TODO update textures resolutions on zoom

    this.stateService.changedZoomPercentage(percentage);
  }

  private publishZoomPercentage() {
    const zoomPercentage = (this.pixiService.mainContainer.scale.x / this.initialScaleX) * 100;
    console.log(`Zoom Percentage: ${zoomPercentage.toFixed(2)}%`); // TODO remove
    this.stateService.changedZoomPercentage(zoomPercentage);
  }

  private addTouchscreenListeners() {
    const canvasElement = document.getElementById('pixiCanvas');
    if (canvasElement == null) {
      throw new Error('Canvas container not found');
    }
    const hammerManager = new Hammer.Manager(canvasElement);
    // Touchscreen zooming event
    this.addPinchListeners(hammerManager);
  }

  private addPinchListeners(hammerManager: HammerManager) {
    const pinch = new Hammer.Pinch();

    // TODO add hammerjs mode managing to mode bus
    hammerManager.add(pinch);
    hammerManager.on('pinchstart', (e) => {
      this.handlePinchStart(e);
    });
    hammerManager.on('pinch', (e) => {
      this.handlePinchZoom(e);
    });
  }

  private handlePinchStart(event: HammerInput) {
    this.initialPinchScale = this.pixiService.mainContainer.scale.x; // Assuming uniform scaling
  }

  private handlePinchZoom(event: HammerInput) {
    const scaleFactor = event.scale;
    const newScaleX = this.initialPinchScale * scaleFactor;
    const newScaleY = this.initialPinchScale * scaleFactor;

    // Clamp the scale to prevent exceeding zoom limits
    const clampedScaleX = Math.min(Math.max(newScaleX, this.minScale), this.maxScale);
    const clampedScaleY = Math.min(Math.max(newScaleY, this.minScale), this.maxScale);

    // Calculate the cursor position (average of the touches)
    const cursorPosition = {
      x: (event.pointers[0].pageX + event.pointers[1].pageX) / 2,
      y: (event.pointers[0].pageY + event.pointers[1].pageY) / 2,
    };

    const localPosition = this.pixiService.mainContainer.toLocal(cursorPosition, this.pixiService.stage);

    this.pixiService.mainContainer.pivot.set(localPosition.x, localPosition.y);
    this.pixiService.mainContainer.position.set(cursorPosition.x, cursorPosition.y);
    this.pixiService.mainContainer.scale.set(clampedScaleX, clampedScaleY);
    // Scale boundaries
    this.pixiService.canvasBoundaries.pivot.set(localPosition.x, localPosition.y);
    this.pixiService.canvasBoundaries.position.set(cursorPosition.x, cursorPosition.y);
    this.pixiService.canvasBoundaries.scale.set(clampedScaleX, clampedScaleY);

    // TODO update textures resolutions on zoom

    this.publishZoomPercentage();
  }
}
