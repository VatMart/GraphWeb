import {FederatedPointerEvent} from "pixi.js";
import {PixiService} from "../../service/pixi.service";
import {EventBusService, HandlerNames} from "../../service/event-bus.service";
import {StateService} from "../../service/state.service";
import {InitializationError} from "../../error/initialization-error";
import Hammer from "hammerjs";
import {Subscription} from "rxjs";
import {EventUtils} from "../../utils/event-utils";
import {GraphicalUtils, Point, Rectangle} from "../../utils/graphical-utils";
import {NodeView} from "../../model/graphical-model/node/node-view";
import {EdgeView} from "../../model/graphical-model/edge/edge-view";
import {SelectRectangle} from "../../model/graphical-model/select-rectangle";
import {GraphViewService} from "../../service/graph-view.service";

/**
 * Class for handling events on the canvas. Should be used after pixi canvas is initialized.
 * How to use:
 * 1. Call CanvasEventHandler.initialize() to create an instance of the class.
 * 2. Use CanvasEventHandler.getInstance() to get the instance of the class for use.
 * 3. Call initializeEventHandlers() to initialize the event handlers.
 * 4. Call destroyEventHandlers() when the event handlers are no longer needed.
 */
export class CanvasEventHandler {
  private static instance: CanvasEventHandler | undefined = undefined

  /**
   * Returns the instance of the CanvasEventHandler.
   * Before calling this method, the CanvasEventHandler must be initialized.
   * Throws InitializationError if the instance is not initialized.
   */
  public static getInstance(): CanvasEventHandler {
    if (this.instance === undefined) {
      throw new InitializationError("CanvasEventHandler is not initialized. Call initialize() first.");
    }
    return this.instance;
  }

  private subscriptions: Subscription = new Subscription();

  // Touchscreen manager events
  private hammerManager!: HammerManager;
  private pinchRecognizer!: PinchRecognizer;

  private boundHandleCursorMoving: (event: FederatedPointerEvent) => void;
  private boundHandleContextMenu: (event: any) => void;
  private boundHandleResizeCanvas: () => void;
  private boundHandleCanvasStartDragging: (event: FederatedPointerEvent) => void;
  private boundHandleCanvasDragging: (event: FederatedPointerEvent) => void;
  private boundHandleCanvasEndDragging: (event: FederatedPointerEvent) => void;
  private boundHandleWheelZooming: (event: WheelEvent) => void;
  private boundHandlePinchStart: (event: HammerInput) => void;
  private boundHandlePinchZoom: (event: HammerInput) => void;
  private onSelectionElementBound: (event: FederatedPointerEvent) => void;
  private onRectangleSelectionMoveBound: (event: FederatedPointerEvent) => void;
  private onRectangleSelectionEndBound: (event: FederatedPointerEvent) => void;

  // CursorCoordinates
  xCursor: number = 0;
  yCursor: number = 0;

  // Canvas panning
  private canvasDragging: boolean = false;
  private previousPoint = {x: 0, y: 0};
  // Map of active touches for multitouch dragging (used to prevent dragging with multiple fingers)
  private activeTouches: Map<number, { x: number; y: number }> = new Map();

  // Canvas zooming
  // Touch screen zooming
  private initialPinchScale: number = 1.0;

  // Selecting
  private isRectangleSelection = false;
  private rectangleSelection: SelectRectangle;
  private rectangleSelectionStart: Point | null = null;
  private rectangleSelectionThreshold = 2; // Pixels the mouse must move to start rectangle selection

  private constructor(private pixiService: PixiService,
                      private eventBus: EventBusService,
                      private stateService: StateService,
                      private graphViewService: GraphViewService) {
    // Binding event handlers
    this.boundHandleCursorMoving = this.handleCursorMoving.bind(this);
    this.boundHandleContextMenu = this.handlerContextMenu.bind(this);
    this.boundHandleResizeCanvas = this.handlerResizeCanvas.bind(this);
    this.boundHandleCanvasStartDragging = this.handleCanvasStartDragging.bind(this);
    this.boundHandleCanvasDragging = this.handleCanvasDragging.bind(this);
    this.boundHandleCanvasEndDragging = this.handleCanvasEndDragging.bind(this);
    this.boundHandleWheelZooming = this.handleWheelZooming.bind(this);
    this.boundHandlePinchStart = this.handlePinchStart.bind(this);
    this.boundHandlePinchZoom = this.handlePinchZoom.bind(this);
    this.onSelectionElementBound = this.onSelectElement.bind(this);
    this.onRectangleSelectionMoveBound = this.onRectangleSelectionMove.bind(this);
    this.onRectangleSelectionEndBound = this.onRectangleSelectionEnd.bind(this);

    // Registering event handlers
    this.eventBus.registerHandler(HandlerNames.CANVAS_CURSOR_MOVE, this.boundHandleCursorMoving);
    this.eventBus.registerHandler(HandlerNames.CANVAS_CONTEXT_MENU, this.boundHandleContextMenu);
    this.eventBus.registerHandler(HandlerNames.CANVAS_RESIZE, this.boundHandleResizeCanvas);
    this.eventBus.registerHandler(HandlerNames.CANVAS_DRAG_START, this.boundHandleCanvasStartDragging);
    this.eventBus.registerHandler(HandlerNames.CANVAS_DRAG_MOVE, this.boundHandleCanvasDragging);
    this.eventBus.registerHandler(HandlerNames.CANVAS_DRAG_END, this.boundHandleCanvasEndDragging);
    this.eventBus.registerHandler(HandlerNames.CANVAS_ZOOM, this.boundHandleWheelZooming);
    this.eventBus.registerHandler(HandlerNames.CANVAS_PINCH_START, this.boundHandlePinchStart);
    this.eventBus.registerHandler(HandlerNames.CANVAS_PINCH_ZOOM, this.boundHandlePinchZoom);
    this.eventBus.registerHandler(HandlerNames.ELEMENT_SELECT, this.onSelectionElementBound);
    this.eventBus.registerHandler(HandlerNames.RECTANGLE_SELECTION_MOVE, this.onRectangleSelectionMoveBound);
    this.eventBus.registerHandler(HandlerNames.RECTANGLE_SELECTION_END, this.onRectangleSelectionEndBound);
    // Initialize hammer manager (touchscreen events handler)
    this.initializeHammerManager();
    // Initialize rectangle selection
    this.rectangleSelection = new SelectRectangle();
    this.rectangleSelection.visible = false;
    this.pixiService.mainContainer.addChild(this.rectangleSelection);
  }

  /**
   * Initializes the CanvasEventHandler.
   * Method should be called only once.
   */
  public static initialize(pixiService: PixiService, eventBus: EventBusService,
                           stateService: StateService, graphViewService: GraphViewService): CanvasEventHandler {
    if (this.instance !== undefined) {
      throw new InitializationError("CanvasEventHandler has already been initialized");
    }
    this.instance = new CanvasEventHandler(pixiService, eventBus, stateService, graphViewService);
    return this.instance;
  }

  /**
   * Initializes the event handlers, that should work in any mode.
   */
  public initializeDefaultEventHandlers(): void {
    // Init listeners
    // Cursor move event
    this.eventBus.registerPixiEvent(this.pixiService.stage, 'pointermove', HandlerNames.CANVAS_CURSOR_MOVE);
    // Context menu on canvas event
    this.eventBus.registerTsEvent(this.pixiService.renderer.canvas, 'contextmenu',
      HandlerNames.CANVAS_CONTEXT_MENU);
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
    // Initialize subscriptions
    this.initSubscriptions();
  }

  private initSubscriptions() {
    // Resize canvas on UI change
    this.subscriptions.add(
      this.stateService.needResizeCanvas$.subscribe(value => {
        this.handlerResizeCanvas();
      })
    );
    // Zoom to a specific percentage on call from UI
    this.subscriptions.add(
      this.stateService.zoomToChange$.subscribe(percentage => {
        if (percentage !== null) {
          this.zoomCanvasTo(percentage);
        }
      })
    );
    this.subscriptions.add(
      this.stateService.showGrid$.subscribe(value => {
        this.pixiService.canvasVisualGrid.renderable = value;
        if (value) {
          this.pixiService.canvasVisualGrid.drawGrid();
        }
      })
    );
    this.subscriptions.add(
      this.stateService.needCenterCanvasView$.subscribe(value => {
        if (value) {
          this.pixiService.centerCanvasView();
        }
      })
    );
  }

  private destroySubscriptions() {
    this.subscriptions.unsubscribe();
  }

  private initializeHammerManager() {
    const canvasElement = document.getElementById('pixiCanvas');
    if (canvasElement == null) {
      throw new InitializationError('Hammer manager can\'t be initialized. Canvas container not found');
    }
    this.hammerManager = new Hammer.Manager(canvasElement);
    this.pinchRecognizer = new Hammer.Pinch();
  }

  /**
   * Destroys the event handlers.
   */
  public destroyDefaultEventHandlers(): void {
    this.eventBus.unregisterPixiEvent(this.pixiService.stage, 'pointermove', HandlerNames.CANVAS_CURSOR_MOVE);
    this.eventBus.unregisterTsEvent(this.pixiService.renderer.canvas, 'contextmenu',
      HandlerNames.CANVAS_CONTEXT_MENU);
    this.eventBus.unregisterTsEvent(window, 'resize', HandlerNames.CANVAS_RESIZE);
    this.eventBus.unregisterPixiEvent(this.pixiService.stage, 'pointerdown', HandlerNames.CANVAS_DRAG_START);
    this.eventBus.unregisterPixiEvent(this.pixiService.stage, 'pointermove', HandlerNames.CANVAS_DRAG_MOVE);
    this.eventBus.unregisterPixiEvent(this.pixiService.stage, 'pointerup', HandlerNames.CANVAS_DRAG_END);
    this.eventBus.unregisterPixiEvent(this.pixiService.stage, 'pointerupoutside', HandlerNames.CANVAS_DRAG_END);
    this.eventBus.unregisterTsEvent(this.pixiService.renderer.canvas, 'wheel', HandlerNames.CANVAS_ZOOM);
    this.eventBus.unregisterHammerEvent(this.hammerManager, this.pinchRecognizer, 'pinchstart',
      HandlerNames.CANVAS_PINCH_START);
    this.eventBus.unregisterHammerEvent(this.hammerManager, this.pinchRecognizer, 'pinch',
      HandlerNames.CANVAS_PINCH_ZOOM);
    this.destroySubscriptions();
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
    if (EventUtils.isNodeView(event.target) || EventUtils.isEdgeView(event.target)) {
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

        const newPoint: Point = {
          x: this.pixiService.mainContainer.x + dx,
          y: this.pixiService.mainContainer.y + dy
        };

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
  private handleWheelZooming(event: WheelEvent): void {
    event.preventDefault();
    const scaleFactor = event.deltaY > 0 ? 1 / 1.1 : 1.1;
    const cursorPosition = this.pixiService.renderer.events.pointer.global
    this.pixiService.zoomCanvasView(scaleFactor, cursorPosition);
  }

  /**
   * Zoom the canvas to a specific percentage.
   * This method is used to set the zoom level from the outside.
   */
  private zoomCanvasTo(percentage: number) {
    const scaleFactor = percentage / 100;
    // Center of the canvas
    const scalePosition = {
      x: this.pixiService.renderer.width / 2,
      y: this.pixiService.renderer.height / 2
    };
    this.pixiService.zoomCanvasView(scaleFactor, scalePosition, 1.0);
  }

  private addTouchscreenListeners() {
    // Touchscreen zooming event
    this.addPinchListeners(this.hammerManager);
  }

  private addPinchListeners(hammerManager: HammerManager) {
    this.eventBus.registerHammerEvent(hammerManager, this.pinchRecognizer, 'pinchstart',
      HandlerNames.CANVAS_PINCH_START);
    this.eventBus.registerHammerEvent(hammerManager, this.pinchRecognizer, 'pinch',
      HandlerNames.CANVAS_PINCH_ZOOM);
  }

  private handlePinchStart(event: HammerInput) {
    this.initialPinchScale = this.pixiService.mainContainer.scale.x; // Assuming uniform scaling
  }

  private handlePinchZoom(event: HammerInput) {
    const scaleFactor = event.scale;
    const cursorPosition = {
      x: (event.pointers[0].pageX + event.pointers[1].pageX) / 2,
      y: (event.pointers[0].pageY + event.pointers[1].pageY) / 2,
    };
    this.pixiService.zoomCanvasView(scaleFactor, cursorPosition, this.initialPinchScale);
  }

  // ----------------- Not global handlers -----------------
  private onSelectElement(event: FederatedPointerEvent): void {
    if (event.pointerType === 'mouse' && event.button !== 0) {
      return;
    }
    let selectedElement = EventUtils.getGraphElement(event.target);

    if (!selectedElement) { // Canvas clicked (no selection before - clear selection, else - rectangle selection)
      // Rectangle selection
      if (event.pointerType === 'touch') { // Rectangle selection not supported for touchpad devices
        this.graphViewService.clearSelection();
        return;
      }
      this.onRectangleSelectionStart(event);
      return; // No element selected
    }

    if (!event.ctrlKey) { // Single selection
      if (this.graphViewService.isElementSelected(selectedElement)) {
        return;
      }
      if (!this.graphViewService.isSelectionEmpty()) {
        this.graphViewService.clearSelection();
        this.graphViewService.selectElement(selectedElement);
        return;
      }
      this.graphViewService.selectElement(selectedElement);
    } else { // Multiple selection (ctrl pressed)
      if (this.graphViewService.isElementSelected(selectedElement)) {
        this.graphViewService.unselectElement(selectedElement);
      } else {
        this.graphViewService.selectElement(selectedElement);
      }
    }
  }

  private onRectangleSelectionStart(event: FederatedPointerEvent): void {
    const position = event.getLocalPosition(this.pixiService.mainContainer);
    if (!this.pixiService.isPointWithinCanvasBoundaries(position.x, position.y, 0)) {
      return;
    }
    this.rectangleSelectionStart = {x: position.x, y: position.y};
    this.rectangleSelection.visible = false;
    this.isRectangleSelection = false;
    this.eventBus.registerPixiEvent(this.pixiService.stage,
      'pointermove', HandlerNames.RECTANGLE_SELECTION_MOVE);
    this.eventBus.registerPixiEvent(this.pixiService.stage,
      'pointerup', HandlerNames.RECTANGLE_SELECTION_END);
    this.eventBus.registerPixiEvent(this.pixiService.stage,
      'pointerupoutside', HandlerNames.RECTANGLE_SELECTION_END);
    this.eventBus.registerPixiEvent(this.pixiService.stage,
      'rightdown', HandlerNames.RECTANGLE_SELECTION_END);
  }

  private onRectangleSelectionMove(event: FederatedPointerEvent): void {
    const newPosition = event.getLocalPosition(this.pixiService.mainContainer);
    if (this.rectangleSelectionStart) {
      // Check if the drag has moved beyond the threshold
      if (!this.isRectangleSelection) {
        const dx = Math.abs((newPosition.x) - this.rectangleSelectionStart.x);
        const dy = Math.abs((newPosition.y) - this.rectangleSelectionStart.y);
        if (dx > this.rectangleSelectionThreshold || dy > this.rectangleSelectionThreshold) {
          this.isRectangleSelection = true; // Start dragging if moved beyond threshold
          this.rectangleSelection.visible = true;
        }
      }
    }

    if (this.isRectangleSelection && this.rectangleSelectionStart) {
      let rectangle: Rectangle = this.rectangleSelection.toRectangle();
      this.rectangleSelection.updatePosition(this.rectangleSelectionStart, newPosition);
      this.graphViewService.nodeViews.forEach((nodeView: NodeView) => { // TODO optimize by using canvas with grid
        if (GraphicalUtils.rectanglesIntersect(rectangle, GraphicalUtils.nodeViewToRectangle(nodeView))) {
          if (!this.graphViewService.isElementSelected(nodeView)) {
            this.graphViewService.selectElement(nodeView);
          }
        } else if (!event.ctrlKey && this.graphViewService.isElementSelected(nodeView)) {
          this.graphViewService.unselectElement(nodeView);
        }
      });
      this.graphViewService.edgeViews.forEach((edgeView: EdgeView) => {
        if (GraphicalUtils.rectanglesIntersect(rectangle, GraphicalUtils.edgeViewToRectangle(edgeView))) {
          if (!this.graphViewService.isElementSelected(edgeView)) {
            this.graphViewService.selectElement(edgeView);
          }
        } else if (!event.ctrlKey && this.graphViewService.isElementSelected(edgeView)) {
          this.graphViewService.unselectElement(edgeView);
        }
      });
    }
  }

  private onRectangleSelectionEnd(event: FederatedPointerEvent): void {
    if (this.rectangleSelection) {
      this.rectangleSelection.visible = false;
    }
    if (!this.isRectangleSelection) {
      this.graphViewService.clearSelection();
    }
    this.rectangleSelectionStart = null;
    this.isRectangleSelection = false;
    this.eventBus.unregisterPixiEvent(this.pixiService.stage,
      'pointerup', HandlerNames.RECTANGLE_SELECTION_END);
    this.eventBus.unregisterPixiEvent(this.pixiService.stage,
      'pointerupoutside', HandlerNames.RECTANGLE_SELECTION_END);
  }
}
