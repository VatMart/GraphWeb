import {Injectable} from '@angular/core';
import {DEFAULT_NODE_STYLE, NodeStyle, NodeView} from "../model/graphical-model/node/node-view";
import {Node} from "../model/node";
import {GraphModelService} from "./graph-model.service";
import {Graph} from "../model/graph";
import * as PIXI from "pixi.js";
import {Graphics, RenderTexture, Texture} from "pixi.js";
import {PixiService} from "./pixi.service";
import {Point} from "../utils/graphical-utils";
import {AbstractGraphElementFabric} from "../model/graphical-model/abstract-graph-element-fabric";

/**
 * Fabric for creating node views.
 */
@Injectable({
  providedIn: 'root'
})
export class NodeViewFabricService extends AbstractGraphElementFabric {

  // Key in textureCache: 'radius_fillNode_strokeColor_strokeWidth'
  private textureCache: Map<string, Texture> = new Map(); // TODO add cache clearing mechanism. (when node removed from graph)

  private styleCache: Map<number, string> = new Map(); // key: node index, value: key in textureCache

  constructor(private pixiService: PixiService,
              private graphModelService: GraphModelService) {
    super();
  }

  private getOrCreateTexture(point: Point, radius: number, nodeStyle: NodeStyle): Texture {
    const key = `${radius}_${nodeStyle.fillNode}_${nodeStyle.strokeColor}_${nodeStyle.strokeWidth}`;
    if (!this.textureCache.has(key)) {
      // Create new texture, cache it, and return
      const graphics = new Graphics();
      const totalRadius = radius + nodeStyle.strokeWidth;
      graphics.circle(totalRadius, totalRadius, radius).
      fill(nodeStyle.fillNode).
      stroke({color: nodeStyle.strokeColor, alignment: 0, width: nodeStyle.strokeWidth,
        cap: 'round', join: 'round'});

      const texture = RenderTexture.create({width: 2 * totalRadius, height: 2 * totalRadius, antialias: true,
        resolution: Math.max(2, window.devicePixelRatio)});
      this.pixiService.renderer.render({container: graphics, target: texture, clear: true});
      this.textureCache.set(key, texture);
    }
    return <Texture>this.textureCache.get(key);
  }

  /**
   * Create default node view with coordinates.
   * @param graph - graph to which node belongs
   * @param point - coordinates of node center on main container
   */
  public createDefaultNodeViewWithCoordinates(graph: Graph, point: Point): NodeView {
    let index = this.graphModelService.calculateNewNodeIndex(graph);
    const texture: Texture = <Texture>this.getOrCreateTexture(point, NodeView.DEFAULT_RADIUS, DEFAULT_NODE_STYLE);
    return NodeView.createFromTexture(new Node(index), point, NodeView.DEFAULT_RADIUS, texture);
  }

  /**
   * Create default node view from node and coordinates.
   * @param node - node to create view
   * @param point - coordinates of node center on main container
   */
  public createDefaultNodeViewFromNode(node: Node, point: Point): NodeView {
    const texture: Texture = <Texture>this.getOrCreateTexture(point, NodeView.DEFAULT_RADIUS, DEFAULT_NODE_STYLE);
    return NodeView.createFromTexture(node, point, NodeView.DEFAULT_RADIUS, texture);
  }

  public changeToStyle(nodeView: NodeView, nodeStyle: NodeStyle) {
    // Save current key of texture in cache
    const textureKey = `${nodeView.radius}_${nodeView.nodeStyle.fillNode}_${nodeView.nodeStyle.strokeColor}
    _${nodeView.nodeStyle.strokeWidth}`;
    this.styleCache.set(nodeView.node.index, textureKey);
    // Build new style
    this.switchNodeStyle(nodeView, nodeStyle);
    nodeView.hitArea = new PIXI.Circle(nodeView.width / 2, nodeView.height / 2, nodeView.radius);
    nodeView.move(); // adjust position
  }

  public changeToPreviousStyle(nodeView: NodeView) {
    if (this.styleCache.has(nodeView.node.index)) {
      let textureKey = this.styleCache.get(nodeView.node.index);
      this.styleCache.delete(nodeView.node.index);
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
