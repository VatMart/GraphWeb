import {Injectable} from '@angular/core';
import {Graphics, RenderTexture, Text, Texture} from "pixi.js";
import {Graph} from "../model/graph";
import {NodeView} from "../model/graphical-model/node/node-view";
import {Edge} from "../model/edge";
import {EdgeStyle, EdgeView} from "../model/graphical-model/edge/edge-view";
import {AbstractGraphElementFabric} from "../model/graphical-model/abstract-graph-element-fabric";
import {WeightStyle} from "../model/graphical-model/edge/weight";
import {PixiService} from "./pixi.service";
import {EdgeOrientation, GraphOrientation} from "../model/orientation";

/**
 * Fabric for creating edge views.
 */
@Injectable({
  providedIn: 'root'
})
export class EdgeViewFabricService extends AbstractGraphElementFabric {

  private styleCache: Map<string, EdgeStyle> = new Map();
  private textureWeightCache: Map<string, Texture> = new Map();

  constructor(private pixiService: PixiService) {
    super();
  }

  private getOrCreateWeightTexture(text: Text, weightStyle: WeightStyle): Texture {
    const key = `${weightStyle.text.size}_${weightStyle.color}_${weightStyle.text.labelColor}
    _${weightStyle.strokeColor}_${weightStyle.strokeWidth}_${weightStyle.text.labelFontWeight}
    _${weightStyle.text.labelFontFamily}`;
    if (!this.textureWeightCache.has(key)) {
      // Create new texture, cache it, and return
      const graphics = new Graphics();
      const totalWidth = text.bounds.width + 10; // padding
      const totalHeight = text.bounds.height;
      graphics.rect(0, 0, totalWidth, totalHeight)
        .fill(weightStyle.color)
        .stroke({width: weightStyle.strokeWidth, color: weightStyle.strokeColor});

      const texture = RenderTexture.create({width: totalWidth, height: totalHeight, antialias: true,
        resolution: Math.max(2, window.devicePixelRatio)});
      this.pixiService.renderer.render({container: graphics, target: texture, clear: true});
      this.textureWeightCache.set(key, texture);
    }
    return <Texture>this.textureWeightCache.get(key);
  }

  public createDefaultEdgeView(graph: Graph, startNodeView: NodeView, endNodeView: NodeView): EdgeView {
    const edgeOrientation = graph.orientation === GraphOrientation.NON_ORIENTED ?
      EdgeOrientation.NON_ORIENTED : EdgeOrientation.ORIENTED
    let newEdge: Edge = new Edge(startNodeView.node, endNodeView.node, edgeOrientation);
    const result: EdgeView = EdgeView.createFrom(newEdge, startNodeView, endNodeView);
    const weightTexture = this.getOrCreateWeightTexture(result.weightView.text, result.weightView.weightStyle);
    result.weightView.texture = weightTexture;
    return result;
  }

  changeToStyle(edge: EdgeView, style: EdgeStyle): void {
    // Save current style to cache before changing
    this.styleCache.set(edge.getIndex(), edge.nodeStyle);
    this.switchEdgeStyle(edge, style);
    edge.move(); // Move edge to new position by redraw
  }

  changeToPreviousStyle(edge: EdgeView): void {
    const previousStyle = this.styleCache.get(edge.getIndex());
    if (previousStyle) {
      this.styleCache.delete(edge.getIndex());
      this.switchEdgeStyle(edge, previousStyle);
      edge.move(); // Move edge to new position by redraws
    } else {
      console.error("Previous style not found in cache for edge: " + edge.getIndex());
    }
  }

  private switchEdgeStyle(edgeView: EdgeView, style: EdgeStyle) {
    const weightTexture: Texture = <Texture>this.getOrCreateWeightTexture(edgeView.weightView.text, style.weight);
    edgeView.weightView.texture = weightTexture;
    edgeView.nodeStyle = style;
  }
}
