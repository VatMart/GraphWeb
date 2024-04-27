import { Injectable } from '@angular/core';
import {Texture} from "pixi.js";

@Injectable({
  providedIn: 'root'
})
export class EdgeViewFabricService {

  // TODO
  private textureCache: Map<string, Texture> = new Map();

  constructor() { }
}
