import {Injectable} from '@angular/core';
import {NodeView} from "../../model/graphical-model/node/node-view";
import {Node} from "../../model/node";
import {GraphModelService} from "../graph/graph-model.service";
import * as PIXI from "pixi.js";
import {FillGradient, Graphics, RenderTexture, Texture} from "pixi.js";
import {PixiService} from "../pixi.service";
import {Point} from "../../utils/graphical-utils";
import {AbstractGraphElementFabric} from "../../model/graphical-model/abstract-graph-element-fabric";
import {ConfService} from "../config/conf.service";
import {NodeStyle} from "../../model/graphical-model/graph/graph-view-properties";
import {GraphView} from "../../model/graphical-model/graph/graph-view";

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

  private getOrCreateTexture(nodeStyle: NodeStyle, strokeGradient?: FillGradient): Texture {
    const key = `${nodeStyle.radius.getRadius()}_${nodeStyle.fillNode}_${nodeStyle.strokeColor}_${nodeStyle.strokeWidth}`;
    if (!this.textureCache.has(key)) {
      // Create new texture, cache it, and return
      const graphics = new Graphics();
      const totalRadius = nodeStyle.radius.getRadius() + nodeStyle.strokeWidth;
      graphics.circle(totalRadius, totalRadius, nodeStyle.radius.getRadius()).
      fill(nodeStyle.fillNode);
      if (strokeGradient) {
        graphics.stroke({fill: strokeGradient, alignment: 0, width: nodeStyle.strokeWidth,
          cap: 'round', join: 'round'});
      } else {
        graphics.stroke({color: nodeStyle.strokeColor, alignment: 0, width: nodeStyle.strokeWidth,
          cap: 'round', join: 'round'});
      }

      const texture = RenderTexture.create({width: 2 * totalRadius, height: 2 * totalRadius, antialias: true,
        resolution: Math.max(2, window.devicePixelRatio)});
      this.pixiService.renderer.render({container: graphics, target: texture, clear: true});
      this.textureCache.set(key, texture);
    }
    return <Texture>this.textureCache.get(key);
  }

  /**
   * Create default node view with coordinates.
   * @param graphView - graph to which node belongs
   * @param point - coordinates of node center on main container
   */
  public createDefaultNodeViewWithCoordinates(graphView: GraphView, point: Point): NodeView {
    let index = this.graphModelService.calculateNewNodeIndex(graphView.graph);
    const texture: Texture = <Texture>this.getOrCreateTexture(ConfService.currentNodeStyle);
    return NodeView.createFromTexture(new Node(index), point, ConfService.currentNodeStyle.radius.getRadius(), texture);
  }

  /**
   * Create default node view from node and coordinates.
   * @param node - node to create view
   * @param point - coordinates of node center on main container
   */
  public createDefaultNodeViewFromNode(node: Node, point: Point): NodeView {
    const texture: Texture = <Texture>this.getOrCreateTexture(ConfService.currentNodeStyle);
    return NodeView.createFromTexture(node, point, ConfService.currentNodeStyle.radius.getRadius(), texture);
  }

  /**
   * Initialize imported node view.
   * @param nodeView - node view to initialize
   */
  public createFromImportedNodeView(nodeView: NodeView) {
    const texture: Texture = <Texture>this.getOrCreateTexture(nodeView.nodeStyle);
    const result = NodeView.createFromTexture(nodeView.node, nodeView.coordinates, nodeView.radius, texture);
    return result;
  }

  /**
   * Change node style and save current style in cache.
   */
  public changeToStyleAndSave(nodeView: NodeView, nodeStyle: NodeStyle, gradientColor?: GradientColor) {
    // Save current key of texture in cache
    const textureKey = `${nodeView.radius}_${nodeView.nodeStyle.fillNode}_${nodeView.nodeStyle.strokeColor}_${nodeView.nodeStyle.strokeWidth}`;
    this.styleCache.set(nodeView.node.index, textureKey);
    // Build new style
    this.switchNodeStyle(nodeView, nodeStyle, gradientColor);
    nodeView.hitArea = new PIXI.Circle(nodeView.width / 2, nodeView.height / 2, nodeView.radius);
    nodeView.move(); // adjust position
  }

  /**
   * Change node style.
   */
  public changeToStyle(nodeView: NodeView, nodeStyle: NodeStyle, gradientColor?: GradientColor): void {
    this.switchNodeStyle(nodeView, nodeStyle, gradientColor);
    nodeView.hitArea = new PIXI.Circle(nodeView.width / 2, nodeView.height / 2, nodeView.radius);
    nodeView.move(); // adjust position
  }

  public changeToPreviousStyle(nodeView: NodeView) {
    if (this.styleCache.has(nodeView.node.index)) {
      let textureKey = this.styleCache.get(nodeView.node.index);
      this.styleCache.delete(nodeView.node.index);
      let nodeStyle = this.textureCacheKeyToNodeStyle(textureKey, nodeView);
      this.switchNodeStyle(nodeView, nodeStyle);
      nodeView.hitArea = new PIXI.Circle(nodeView.width / 2, nodeView.height / 2, nodeView.radius);
      nodeView.move(); // adjust position
    } else {
      console.error('NodeViewFabricService: NodeView not found in selected cache'); // TODO throw exception
    }
  }

  /**
   * Update texture of node view.
   * Used when node style is changed.
   */
  public updateTexture(nodeView: NodeView) {
    this.switchNodeStyle(nodeView, nodeView.nodeStyle);
    nodeView.hitArea = new PIXI.Circle(nodeView.width / 2, nodeView.height / 2, nodeView.radius);
    nodeView.move(); // adjust position
  }

  private textureCacheKeyToNodeStyle(key: string | undefined, nodeView: NodeView): NodeStyle {
    if (key == null) {
      console.error('NodeViewFabricService: Invalid texture cache key'); // TODO throw exception
      return ConfService.currentNodeStyle;
    }
    let parts = key.split('_');
    if (parts.length !== 4) {
      console.error('NodeViewFabricService: Invalid texture cache key'); // TODO throw exception
      return ConfService.currentNodeStyle;
    }
    return {
      radius: nodeView.nodeStyle.radius,
      fillNode: parts[1],
      strokeColor: parts[2],
      strokeWidth: parseInt(parts[3]),
      labelStyle: ConfService.currentNodeStyle.labelStyle
    };
  }

  private switchNodeStyle(nodeView: NodeView, nodeStyle: NodeStyle, gradientColor?: GradientColor) {
    let strokeGradient: FillGradient | undefined;
    if (gradientColor) {
      strokeGradient = this.buildStrokeGradient(nodeStyle, gradientColor);
    }
    const texture: Texture = <Texture>this.getOrCreateTexture(nodeStyle,
      strokeGradient ? strokeGradient : undefined);
    nodeView.texture = texture;
  }

  private buildStrokeGradient(nodeStyle: NodeStyle, gradientColor: GradientColor): FillGradient {
    const fullRadius = nodeStyle.radius.getRadius() + nodeStyle.strokeWidth;
    return new FillGradient(fullRadius, 0, fullRadius, (2 * fullRadius))
    .addColorStop(0, gradientColor.startColor)
    .addColorStop(1, gradientColor.endColor);
  }

  destroy() {
    this.textureCache.clear();
    this.styleCache.clear();
  }
}

/**
 * Interface for gradient color.
 */
export interface GradientColor {
  startColor: string;
  endColor: string;
}
