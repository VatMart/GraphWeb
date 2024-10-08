import {Injectable} from '@angular/core';
import {Graphics, Rectangle, RenderTexture, Text, Texture} from "pixi.js";
import {NodeView} from "../../model/graphical-model/node/node-view";
import {Edge} from "../../model/edge";
import {EdgeView} from "../../model/graphical-model/edge/edge-view";
import {AbstractGraphElementFabric} from "../../model/graphical-model/abstract-graph-element-fabric";
import {Weight} from "../../model/graphical-model/edge/weight";
import {PixiService} from "../pixi.service";
import {EdgeOrientation, GraphOrientation} from "../../model/orientation";
import {ConfService} from "../config/conf.service";
import {EdgeStyle, WeightStyle} from "../../model/graphical-model/graph/graph-view-properties";
import {GraphView} from "../../model/graphical-model/graph/graph-view";

/**
 * Fabric for creating edge views.
 */
@Injectable({
  providedIn: 'root'
})
export class EdgeViewFabricService extends AbstractGraphElementFabric {

  private styleCache: Map<string, EdgeStyle> = new Map();
  private textureWeightCache: Map<string, Texture> = new Map(); // TODO add cache clearing mechanism. (when edge removed from graph)

  constructor(private pixiService: PixiService) {
    super();
  }

  private getOrCreateWeightTexture(text: Text, weightStyle: WeightStyle): Texture {
    const key = `${text.width}_${weightStyle.text.size}_${weightStyle.color}_${weightStyle.text.labelColor}
    _${weightStyle.strokeColor}_${weightStyle.strokeWidth}_${weightStyle.text.labelFontWeight}
    _${weightStyle.text.labelFontFamily}`;
    if (!this.textureWeightCache.has(key)) {
      // Create new texture, cache it, and return
      const texture = this.createWeightTexture(text, weightStyle);
      this.textureWeightCache.set(key, texture);
    }
    return <Texture>this.textureWeightCache.get(key);
  }

  /**
   * Create weight texture for edge.
   */
  public createWeightTexture(text: Text, weightStyle: WeightStyle): Texture {
    const graphics = new Graphics();
    const totalWidth = text.bounds.width + 10; // padding
    const totalHeight = text.bounds.height;
    graphics.rect(0, 0, totalWidth, totalHeight)
      .fill(weightStyle.color)
      .stroke({width: weightStyle.strokeWidth, color: weightStyle.strokeColor});

    const texture = RenderTexture.create({width: totalWidth, height: totalHeight, antialias: true,
      resolution: Math.max(2, window.devicePixelRatio)});
    this.pixiService.renderer.render({container: graphics, target: texture, clear: true});
    return texture;
  }

  /**
   * Create default edge view from start and end node views.
   * @param graphOrientation - graph orientation
   * @param startNodeView - start node view
   * @param endNodeView - end node view
   * @param hasReversEdge - if graph has reverse edge to this (for example: graph has 1-2 edge index, reverse edge is 2-1)
   */
  public createDefaultEdgeView(graphOrientation: GraphOrientation, startNodeView: NodeView, endNodeView: NodeView,
                               hasReversEdge: boolean = false): EdgeView {
    const edgeOrientation = graphOrientation === GraphOrientation.NON_ORIENTED ?
      EdgeOrientation.NON_ORIENTED : EdgeOrientation.ORIENTED
    let newEdge: Edge = new Edge(startNodeView.node, endNodeView.node, edgeOrientation);
    let edgeOffset: number | undefined;
    if (hasReversEdge && graphOrientation === GraphOrientation.ORIENTED) {
      edgeOffset = Math.min(20,
        Math.max(12, ConfService.currentEdgeStyle.strokeWidth + ConfService.currentEdgeStyle.weight.text.size/2));
    }
    const result: EdgeView = EdgeView.createFrom(newEdge, startNodeView, endNodeView, undefined,  edgeOffset);
    const weightTexture = this.getOrCreateWeightTexture(result.weightView.text, result.weightView.weightStyle);
    result.weightView.texture = weightTexture;
    result.weightView.hitArea = this.calculateWeightHitArea(result.weightView);
    return result;
  }

  /**
   * Create default edge view from edge and start and end node views.
   * @param graphOrientation - graph orientation
   * @param edge - edge to create view
   * @param startNodeView - start node view
   * @param endNodeView - end node view
   * @param hasReversEdge - if graph has reverse edge to this (for example: graph has 1-2 edge index, reverse edge is 2-1)
   */
  public createDefaultEdgeViewFromEdge(graphOrientation: GraphOrientation, edge: Edge, startNodeView: NodeView,
                                       endNodeView: NodeView, hasReversEdge: boolean = false): EdgeView {
    let edgeOffset: number | undefined;
    if (hasReversEdge && graphOrientation === GraphOrientation.ORIENTED) {
      edgeOffset = Math.min(20,
        Math.max(12, ConfService.currentEdgeStyle.strokeWidth + ConfService.currentEdgeStyle.weight.text.size/2));
    }
    const result: EdgeView = EdgeView.createFrom(edge, startNodeView, endNodeView, undefined, edgeOffset);
    const weightTexture = this.getOrCreateWeightTexture(result.weightView.text, result.weightView.weightStyle);
    result.weightView.texture = weightTexture;
    result.weightView.hitArea = this.calculateWeightHitArea(result.weightView);
    return result;
  }

  /**
   * Create edge view from imported edge view.
   */
  public createFromImportedEdgeView(graphOrientation: GraphOrientation, edgeView: EdgeView,
                                    hasReversEdge: boolean = false): EdgeView {
    let edgeOffset: number | undefined;
    if (hasReversEdge && graphOrientation === GraphOrientation.ORIENTED) {
      edgeOffset = Math.min(20,
        Math.max(12, ConfService.currentEdgeStyle.strokeWidth + ConfService.currentEdgeStyle.weight.text.size/2));
    }
    const result: EdgeView = EdgeView.createFrom(edgeView.edge, edgeView.startNode, edgeView.endNode,
      edgeView.edgeStyle, edgeOffset);
    const weightTexture = this.getOrCreateWeightTexture(result.weightView.text, result.weightView.weightStyle);
    result.weightView.texture = weightTexture;
    result.weightView.hitArea = this.calculateWeightHitArea(result.weightView);
    return result;
  }

  public updateEdgeViewWeightTexture(edge: EdgeView): void {
    const weightTexture: Texture = <Texture>this.getOrCreateWeightTexture(edge.weightView.text, edge.edgeStyle.weight);
    edge.weightView.texture = weightTexture;
    edge.weightView.hitArea = this.calculateWeightHitArea(edge.weightView);
    edge.move();
  }

  /**
   * Change edge style to the given style and save current style to cache.
   */
  changeToStyleAndSave(edge: EdgeView, style: EdgeStyle): void {
    // Save current style to cache before changing
    this.styleCache.set(edge.getIndex(), edge.edgeStyle);
    this.switchEdgeStyle(edge, style);
    edge.move(); // Move edge to new position by redraw
  }

  /**
   * Change edge style to the given style.
   */
  changeToStyle(edge: EdgeView, style: EdgeStyle): void {
    this.switchEdgeStyle(edge, style);
    edge.move(); // Move edge to new position by redraw
  }

  /**
   * Change edge style to the previous style saved in cache.
   */
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

  /**
   * Get previous style of edge.
   */
  getPreviousStyle(edge: EdgeView): EdgeStyle | undefined {
    return this.styleCache.get(edge.getIndex());
  }

  /**
   * Update edge weight texture.
   */
  updateTexture(edgeView: EdgeView) {
    const weightTexture: Texture = <Texture>this.getOrCreateWeightTexture(edgeView.weightView.text, edgeView.edgeStyle.weight);
    edgeView.weightView.texture = weightTexture;
    edgeView.weightView.hitArea = this.calculateWeightHitArea(edgeView.weightView);
  }

  private switchEdgeStyle(edgeView: EdgeView, style: EdgeStyle) {
    const weightTexture: Texture = <Texture>this.getOrCreateWeightTexture(edgeView.weightView.text, style.weight);
    edgeView.weightView.texture = weightTexture;
    edgeView.edgeStyle = style;
  }

  private calculateWeightHitArea(weightView: Weight): Rectangle {
    const weightViewBounds = weightView.getLocalBounds();
    const hitAreaPadding = Math.round(ConfService.EDGE_HIT_AREA_PADDING/2);
    return new Rectangle(weightViewBounds.x - hitAreaPadding, weightViewBounds.y - hitAreaPadding,
      weightViewBounds.width + hitAreaPadding*2, weightViewBounds.height + hitAreaPadding*2);
  }

  destroy() {
    this.textureWeightCache.clear();
    this.styleCache.clear();
  }
}
