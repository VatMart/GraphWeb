import {Injectable} from '@angular/core';
import * as PIXI from "pixi.js";
import {Container, Renderer, Ticker, autoDetectRenderer} from "pixi.js";
import {EnvironmentService} from "./environment.service";

/**
 * Service to manage the PIXI canvas
 */
@Injectable({
  providedIn: 'root'
})
export class PixiService {

  private _stage!: Container;
  private _renderer!: Renderer;
  private _ticker!: Ticker;

  constructor(private environment: EnvironmentService) {
  }

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
      background: '#F9F9F9',
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

  public calculateRendererSize(): { width: number, height: number } {
    const toolbar = document.getElementById('toolbar');
    const navbar = this.environment.isMobile() ? document.getElementById('mobile-navbar')
      : document.getElementById('navbar');
    if (navbar == null || toolbar == null) {
      throw new Error('Navbar or toolbar not found'); // TODO: Create custom error
    }
    console.log('navbar width: ' + navbar.offsetWidth);
    console.log('navbar height: ' + navbar.offsetHeight);
    let occupiedHeight = (this.environment.isMobile() ? navbar.offsetHeight : 0) + toolbar.offsetHeight+5;
    let occupiedWidth = (this.environment.isMobile() ? 0 : navbar.offsetWidth+8);
    console.log("Occupied width: " + occupiedWidth + ", occupied height: " + occupiedHeight); // TODO remove
    return {
      width: window.innerWidth - occupiedWidth,
      height: window.innerHeight - occupiedHeight
    };
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
}
