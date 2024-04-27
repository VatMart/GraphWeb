import {Injectable} from '@angular/core';
import {DEFAULT_NODE_STYLE, NodeStyle, NodeView, SELECTED_NODE_STYLE} from "../model/graphical-model/node-view";
import {Node} from "../model/node";
import {GraphModelService} from "./graph-model.service";
import {Graph} from "../model/graph";
import {Graphics, RenderTexture, Texture} from "pixi.js";
import * as PIXI from "pixi.js";
import {PixiService} from "./pixi.service";
import {Point} from "../utils/graphical-utils";

@Injectable({
  providedIn: 'root'
})
export class NodeViewFabricService {

  // Key in textureCache: 'radius_fillNode_strokeColor_strokeWidth'
  private textureCache: Map<string, Texture> = new Map();

  private selectedCache: Map<number, string> = new Map(); // key: node index, value: key in textureCache

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
      stroke({color: nodeStyle.strokeColor, alignment: 0.5, width: nodeStyle.strokeWidth, cap: 'round', join: 'round'});

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

  public changeToSelectedStyle(nodeView: NodeView) {
    // Save current key of texture in cache
    const textureKey = `${nodeView.radius}_${nodeView.nodeStyle.fillNode}_${nodeView.nodeStyle.strokeColor}_${nodeView.nodeStyle.strokeWidth}`;
    this.selectedCache.set(nodeView.node.index, textureKey);
    // Build selected style
    let selectedNodeStyle: NodeStyle = {
      fillNode: nodeView.nodeStyle.fillNode,
      strokeColor: SELECTED_NODE_STYLE.strokeColor,
      strokeWidth: nodeView.nodeStyle.strokeWidth + 2
    };
    this.switchNodeStyle(nodeView, selectedNodeStyle);
    nodeView.hitArea = new PIXI.Circle(nodeView.width / 2, nodeView.height / 2, nodeView.radius);
    nodeView.move(); // adjust position
  }

  public changeToDefaultStyle(nodeView: NodeView) {
    if (this.selectedCache.has(nodeView.node.index)) {
      let textureKey = this.selectedCache.get(nodeView.node.index);
      let nodeStyle = this.textureCacheKeyToNodeStyle(textureKey);
      this.switchNodeStyle(nodeView, nodeStyle);
      nodeView.hitArea = new PIXI.Circle(nodeView.width / 2, nodeView.height / 2, nodeView.radius);
      nodeView.move(); // adjust position
    } else {
      console.error('NodeViewFabricService: NodeView not found in selected cache'); // TODO throw exception
    }
  }

  private textureCacheKeyToNodeStyle(key: string | undefined): NodeStyle {
    if (key == null) {
      console.error('NodeViewFabricService: Invalid texture cache key'); // TODO throw exception
      return DEFAULT_NODE_STYLE;
    }
    let parts = key.split('_');
    if (parts.length !== 4) {
      console.error('NodeViewFabricService: Invalid texture cache key'); // TODO throw exception
      return DEFAULT_NODE_STYLE;
    }
    return {
      fillNode: parts[1],
      strokeColor: parts[2],
      strokeWidth: parseInt(parts[3])
    };
  }

  private switchNodeStyle(nodeView: NodeView, nodeStyle: NodeStyle) {
    const texture: Texture = <Texture>this.getOrCreateTexture(nodeView.coordinates, nodeView.radius, nodeStyle);
    nodeView.texture = texture;
    nodeView.nodeStyle = nodeStyle;
  }
}
