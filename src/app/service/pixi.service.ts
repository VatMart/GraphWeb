import {Injectable} from '@angular/core';
import {autoDetectRenderer, Container, Renderer, Ticker} from "pixi.js";
import {EnvironmentService} from "./environment.service";
import {VisualGrid} from "../model/graphical-model/visual-grid";
import {CanvasBorder} from "../model/graphical-model/canvas-border";
import {StateService} from "./state.service";
import {Point} from "../utils/graphical-utils";

/**
 * Service for handling the PixiJS rendering engine.
 */
@Injectable({
  providedIn: 'root'
})
export class PixiService {

  // Those properties should be initialized by PixiManager
  private _stage!: Container;
  private _renderer!: Renderer;
  private _ticker!: Ticker;
  // Main container for all the elements
  private _mainContainer!: Container;
  private _canvasBoundaries!: CanvasBorder;
  private _canvasVisualGrid!: VisualGrid;

  // Boundary of panning coordinates
  // TODO move default values to the environment service
  private _boundaryXMin: number = -1000;
  private _boundaryXMax: number = 3000;
  private _boundaryYMin: number = -1000;
  private _boundaryYMax: number = 2000;
  private _boundaryGap: number = 200;

  // Canvas zooming
  // Initial scale values for calculating zoom percentage
  private initialScaleX: number = 1.0;
  private initialScaleY: number = 1.0;
  private maxScale: number = 3.0;  // Maximum zoom level (300%)
  private minScale: number = 0.5;  // Minimum zoom level (50%)

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
      preference: 'webgpu',
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
    console.log("Occupied width: " + occupiedWidth + ", occupied height: " + occupiedHeight); // TODO remove
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

  // ------------------
  // Getters and Setters
  // ------------------
  get stage(): Container {
    return this._stage;
  }

  set stage(value: Container) {
    this._stage = value;
  }

  get renderer(): Renderer {
    return this._renderer;
  }

  set renderer(value: Renderer) {
    this._renderer = value;
  }

  get ticker(): Ticker {
    return this._ticker;
  }

  set ticker(value: Ticker) {
    this._ticker = value;
  }

  get mainContainer(): Container {
    return this._mainContainer;
  }

  set mainContainer(value: Container) {
    this._mainContainer = value;
  }

  get canvasBoundaries(): CanvasBorder {
    return this._canvasBoundaries;
  }

  set canvasBoundaries(value: CanvasBorder) {
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

  set canvasVisualGrid(value: VisualGrid) {
    this._canvasVisualGrid = value;
  }

  get canvasVisualGrid(): VisualGrid {
    return this._canvasVisualGrid;
  }
}
