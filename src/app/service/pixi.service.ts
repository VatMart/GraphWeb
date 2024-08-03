import {Injectable} from '@angular/core';
import {autoDetectRenderer, Container, ContainerChild, Renderer, Ticker, WebGLRenderer, WebGPURenderer} from "pixi.js";
import {EnvironmentService} from "./config/environment.service";
import {VisualGrid} from "../model/graphical-model/visual-grid";
import {CanvasBorder} from "../model/graphical-model/canvas-border";
import {StateService} from "./event/state.service";
import {Point} from "../utils/graphical-utils";
import {ConfService} from "./config/conf.service";

/**
 * Service for handling the PixiJS rendering engine.
 */
@Injectable({
  providedIn: 'root'
})
export class PixiService {

  // These properties should be initialized by PixiManager
  private _stage?: Container;
  private _renderer?: Renderer;
  private _ticker?: Ticker;
  // Main container for all the elements
  private _mainContainer?: Container;
  private _canvasBoundaries?: CanvasBorder;
  private _canvasVisualGrid?: VisualGrid;

  // Boundary of panning coordinates
  private _boundaryXMin: number = ConfService.BOUNDS_X_MIN;
  private _boundaryXMax: number = ConfService.BOUNDS_X_MAX;
  private _boundaryYMin: number = ConfService.BOUNDS_Y_MIN;
  private _boundaryYMax: number = ConfService.BOUNDS_Y_MAX;
  private _boundaryGap: number = ConfService.BOUNDS_GAP;

  // Canvas zooming
  // Initial scale values for calculating zoom percentage
  private initialScaleX: number = 1.0;
  private initialScaleY: number = 1.0;
  private maxScale: number = 3.0;  // Maximum zoom level (300%)
  private minScale: number = 0.25;  // Minimum zoom level (50%)

  constructor(private environment: EnvironmentService,
              private stateService: StateService) {
  }

  /**
   * Create a default stage container.
   */
  createDefaultStage(): Container {
    const stage: Container = new Container();
    return stage;
  }

  /**
   * Create a default renderer with the given width and height.
   * Prefer WebGPU if available.
   */
  async createDefaultRenderer(width: number, height: number): Promise<Renderer> {
    const renderer: Renderer = await autoDetectRenderer({
      width: width,
      height: height,
      preference: 'webgl',
      background: '#ececec',
      antialias: true,
      autoDensity: true,
      resolution: Math.max(2, window.devicePixelRatio),
    });
    return renderer;
  }

  /**
   * Create a default ticker.
   */
  createDefaultTicker(): Ticker {
    const ticker: Ticker = new Ticker();
    return ticker;
  }

  /**
   * Calculate the size of the renderer based on the window size and UI components sizes.
   */
  public calculateRendererSize(): { width: number, height: number } {
    // UI components which occupy space
    const toolbar = document.getElementById('toolbar');
    const navbar = this.environment.isMobile() ? document.getElementById('mobile-navbar')
      : document.getElementById('navbar');
    if (navbar == null || toolbar == null) {
      throw new Error('Navbar or toolbar not found'); // TODO: Create custom error
    }
    let occupiedHeight = (this.environment.isMobile() ? navbar.offsetHeight : 0) + toolbar.offsetHeight+5;
    let occupiedWidth = (this.environment.isMobile() ? 0 : navbar.offsetWidth+8);
    //console.log("Occupied width: " + occupiedWidth + ", occupied height: " + occupiedHeight); // TODO remove
    return {
      width: window.innerWidth - occupiedWidth,
      height: window.innerHeight - occupiedHeight
    };
  }

  /**
   * Check if the node is inside the canvas boundaries.
   */
  public isPointWithinCanvasBoundaries(x: number, y: number, radius?: number): boolean {
    return this.canvasBoundaries.isNodeViewInside(x, y, radius);
  }

  /**
   * Start rendering the canvas.
   */
  public startRendering() {
    if (this.ticker) {
      this.ticker.start();
    }
  }

  /**
   * Stop rendering the canvas.
   */
  public stopRendering() {
    if (this.ticker) {
      this.ticker.stop();
    }
  }

  /**
   * Get the current zoom scale.
   */
  public getZoomScale(): number {
    return this.mainContainer.scale.x;
  }

  /**
   * Zoom the canvas view.
   * @param scaleFactor - scale factor
   * @param scalePosition - scale position
   * @param initialScale - initial scale
   */
  public zoomCanvasView(scaleFactor: number, scalePosition: Point, initialScale?: number) {
    // Calculate potential new scales
    const newScaleX = (initialScale ? initialScale : this.mainContainer.scale.x) * scaleFactor;
    const newScaleY = (initialScale ? initialScale : this.mainContainer.scale.y) * scaleFactor;

    // Clamp the scale to prevent exceeding zoom limits
    const clampedScaleX = Math.min(Math.max(newScaleX, this.minScale), this.maxScale);
    const clampedScaleY = Math.min(Math.max(newScaleY, this.minScale), this.maxScale);

    // Calculate the cursor position in the world coordinates
    const localPosition = this.mainContainer.toLocal(scalePosition, this.stage);

    // Set the pivot to the local cursor position
    this.mainContainer.pivot.set(localPosition.x, localPosition.y);
    this.mainContainer.position.set(scalePosition.x, scalePosition.y);
    this.mainContainer.scale.set(clampedScaleX, clampedScaleY);
    // TODO update textures resolutions on zoom

    // Scale boundaries
    this.canvasBoundaries.pivot.set(localPosition.x, localPosition.y);
    this.canvasBoundaries.position.set(scalePosition.x, scalePosition.y);
    this.canvasBoundaries.scale.set(clampedScaleX, clampedScaleY);

    // Publish the zoom percentage
    const zoomPercentage = (this.mainContainer.scale.x / this.initialScaleX) * 100;
    this.stateService.changedZoomPercentage(zoomPercentage);
  }

  /**
   * Center the canvas view. Zoom to default value and move view to the center.
   */
  centerCanvasView() {
    this.mainContainer.pivot.set(0, 0);
    this.canvasBoundaries.pivot.set(0, 0);

    this.mainContainer.position.set((this.renderer.width - (this.renderer.width) * this.mainContainer.scale.x)/2,
      (this.renderer.height - (this.renderer.height) * this.mainContainer.scale.y)/2);
    this.canvasBoundaries.position.set(this.mainContainer.x, this.mainContainer.y);
  }

  /**
   * Return the center point of the canvas.
   */
  getCenterCanvasPoint(): Point {
    const x = (this.boundaryXMin + this.boundaryXMax)/2;
    const y = (this.boundaryYMin + this.boundaryYMax)/2;
    return {x: x, y: y};
  }

  /**
   * Get width of the canvas borders.
   */
  getCanvasBorderWidth(): number {
    return this.boundaryXMax - this.boundaryXMin;
  }

  /**
   * Get height of the canvas borders.
   */
  getCanvasBorderHeight(): number {
    return this.boundaryYMax - this.boundaryYMin;
  }

  /**
   * Get the content bounds of the canvas.
   */
  getContentBounds() {
    return this.mainContainer.getBounds();
  }

  // ------------------
  // Getters and Setters
  // ------------------
  get stage(): Container {
    return <Container<ContainerChild>>this._stage;
  }

  set stage(value: Container | undefined) {
    this._stage = value;
  }

  get renderer(): Renderer {
    return <WebGLRenderer<HTMLCanvasElement> | WebGPURenderer<HTMLCanvasElement>>this._renderer;
  }

  set renderer(value: Renderer | undefined) {
    this._renderer = value;
  }

  get ticker(): Ticker {
    return <Ticker>this._ticker;
  }

  set ticker(value: Ticker | undefined) {
    this._ticker = value;
  }

  get mainContainer(): Container {
    return <Container<ContainerChild>>this._mainContainer;
  }

  set mainContainer(value: Container | undefined) {
    this._mainContainer = value;
  }

  get canvasBoundaries(): CanvasBorder {
    return <CanvasBorder>this._canvasBoundaries;
  }

  set canvasBoundaries(value: CanvasBorder | undefined) {
    this._canvasBoundaries = value;
  }

  get boundaryXMin(): number {
    return this._boundaryXMin;
  }

  set boundaryXMin(value: number) {
    this._boundaryXMin = value;
  }

  get boundaryXMax(): number {
    return this._boundaryXMax;
  }

  set boundaryXMax(value: number) {
    this._boundaryXMax = value;
  }

  get boundaryYMin(): number {
    return this._boundaryYMin;
  }

  set boundaryYMin(value: number) {
    this._boundaryYMin = value;
  }

  get boundaryYMax(): number {
    return this._boundaryYMax;
  }

  set boundaryYMax(value: number) {
    this._boundaryYMax = value;
  }

  get boundaryGap(): number {
    return this._boundaryGap;
  }

  set canvasVisualGrid(value: VisualGrid | undefined) {
    this._canvasVisualGrid = value;
  }

  get canvasVisualGrid(): VisualGrid {
    return <VisualGrid>this._canvasVisualGrid;
  }
}
