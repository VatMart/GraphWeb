import {Injectable} from '@angular/core';
import {DEFAULT_NODE_STYLE, NodeStyle, NodeView} from "../model/graphical-model/node-view";
import {Node} from "../model/node";
import {GraphModelService} from "./graph-model.service";
import {Graph} from "../model/graph";
import {Graphics, RenderTexture, Texture} from "pixi.js";
import * as PIXI from "pixi.js";
import {PixiService} from "./pixi.service";
import {Point} from "../utils/graphical-utils";
import {LineCap} from "pixi.js/lib/scene/graphics/shared/const";

@Injectable({
  providedIn: 'root'
})
export class NodeViewFabricService {

  private textureCache: Map<string, Texture> = new Map();

  constructor(private pixiService: PixiService,
              private graphModelService: GraphModelService) {
  }

  private getOrCreateTexture(point: Point, radius: number, nodeStyle: NodeStyle): Texture {
    const key = `${radius}_${nodeStyle.fillNode}_${nodeStyle.strokeColor}_${nodeStyle.strokeWidth}`;
    if (!this.textureCache.has(key)) {
      // Create new texture, cache it, and return
      const graphics = new Graphics();
      const totalRadius = radius + nodeStyle.strokeWidth;
      graphics.circle(totalRadius, totalRadius, radius).
      fill(nodeStyle.fillNode).
      stroke({color: nodeStyle.strokeColor, width: nodeStyle.strokeWidth, cap: 'round', join: 'round'});

      const texture = RenderTexture.create({width: 2 * totalRadius, height: 2 * totalRadius, antialias: true,
        resolution: Math.max(2, window.devicePixelRatio)});
      this.pixiService.getApp().renderer.render({container: graphics, target: texture, clear: true});

      this.textureCache.set(key, texture);
    }
    return <Texture>this.textureCache.get(key);
  }

  public createDefaultNodeViewWithCoordinates(graph: Graph, point: Point): NodeView {
    let index = this.graphModelService.calculateNewNodeIndex(graph);
    const texture: Texture = <Texture>this.getOrCreateTexture(point, NodeView.DEFAULT_RADIUS, DEFAULT_NODE_STYLE);
    return NodeView.createFromTexture(new Node(index), point, NodeView.DEFAULT_RADIUS, texture);
  }
}
