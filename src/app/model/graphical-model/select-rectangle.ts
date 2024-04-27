import {Graphics} from "pixi.js";

export class SelectRectangle extends Graphics {

  constructor() {
    super();
    this.rect(0,0,0,0)
      .fill({alpha: 0})
      .stroke({})
  }
}
