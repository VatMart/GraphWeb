import {Injectable} from '@angular/core';
import {autoDetectRenderer, Container, Renderer, Ticker} from "pixi.js";
import {EnvironmentService} from "./environment.service";
import {VisualGrid} from "../model/graphical-model/visual-grid";
import {CanvasBorder} from "../model/graphical-model/canvas-border";

/**
 * Service for handling the PixiJS rendering engine.
 */
@Injectable({
  providedIn: 'root'
})
export class PixiService {

  // Those properties should be initialized
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

  constructor(private environment: EnvironmentService) {
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

  public startRendering() {
    if (this.ticker) {
      this.ticker.start();
    }
  }

  public stopRendering() {
    if (this.ticker) {
      this.ticker.stop();
    }
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
