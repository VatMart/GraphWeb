import {Injectable} from '@angular/core';
import {GraphicsContext, Texture} from "pixi.js";
import {Graph} from "../model/graph";
import {NodeView} from "../model/graphical-model/node-view";
import {GraphModelService} from "./graph-model.service";
import {Edge} from "../model/edge";
import {EdgeView} from "../model/graphical-model/edge-view";
import {AbstractGraphElementFabric} from "../model/graphical-model/abstract-graph-element-fabric";

/**
 * Fabric for creating edge views.
 */
@Injectable({
  providedIn: 'root'
})
export class EdgeViewFabricService extends AbstractGraphElementFabric {

  // TODO
  private textureCache: Map<string, Texture> = new Map();
  private graphics: GraphicsContext = new GraphicsContext();

  constructor(private graphModelService: GraphModelService) {
    super();
  }

  public createDefaultEdgeView(graph: Graph, startNodeView: NodeView, endNodeView: NodeView): EdgeView {
    let newEdge: Edge = new Edge(startNodeView.node, endNodeView.node);
    return EdgeView.createFrom(newEdge, startNodeView, endNodeView);
  }

  changeToStyle(graphElement: EdgeView, style: any): void {
  }
}
