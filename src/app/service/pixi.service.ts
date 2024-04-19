import { Injectable } from '@angular/core';
import {Container, FederatedPointerEvent, Graphics} from "pixi.js";
import * as PIXI from "pixi.js";
@Injectable({
  providedIn: 'root'
})
export class PixiService {
  private app: PIXI.Application;

  constructor() {
    this.app = new PIXI.Application();
  }

  createStage(): Container {
    // TODO: Create a stage
    return this.app.stage;
  }

  getApp(): PIXI.Application {
    return this.app;
  }
}
