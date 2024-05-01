import {Injectable} from '@angular/core';
import {GraphicsContext} from "pixi.js";
import {Graph} from "../model/graph";
import {NodeView} from "../model/graphical-model/node-view";
import {Edge} from "../model/edge";
import {EdgeStyle, EdgeView} from "../model/graphical-model/edge-view";
import {AbstractGraphElementFabric} from "../model/graphical-model/abstract-graph-element-fabric";

/**
 * Fabric for creating edge views.
 */
@Injectable({
  providedIn: 'root'
})
export class EdgeViewFabricService extends AbstractGraphElementFabric {

  // TODO
  private styleCache: Map<string, EdgeStyle> = new Map();
  private graphics: GraphicsContext = new GraphicsContext();

  constructor() {
    super();
  }

  public createDefaultEdgeView(graph: Graph, startNodeView: NodeView, endNodeView: NodeView): EdgeView {
    let newEdge: Edge = new Edge(startNodeView.node, endNodeView.node);
    return EdgeView.createFrom(newEdge, startNodeView, endNodeView);
  }

  changeToStyle(edge: EdgeView, style: EdgeStyle): void {
    // Save current style to cache before changing
    this.styleCache.set(edge.getIndex(), edge.nodeStyle);
    edge.nodeStyle = style;
    edge.move();
  }

  changeToPreviousStyle(edge: EdgeView): void {
    const previousStyle = this.styleCache.get(edge.getIndex());
    if (previousStyle) {
      this.styleCache.delete(edge.getIndex());
      edge.nodeStyle = previousStyle;
      edge.move();
    } else {
      console.error("Previous style not found in cache for edge: " + edge.getIndex());
    }
  }
}
