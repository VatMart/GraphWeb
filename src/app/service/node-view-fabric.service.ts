import {Injectable} from '@angular/core';
import {NodeView} from "../model/graphical-model/node-view";
import {HttpClient} from "@angular/common/http";
import {Node} from "../model/node";
import {GraphModelService} from "./graph-model.service";
import {Graph} from "../model/graph";

@Injectable({
  providedIn: 'root'
})
export class NodeViewFabricService {

  constructor(private graphModelService: GraphModelService) {
  }

  public createDefaultNodeViewWithCoordinates(graph: Graph, x: number, y: number): NodeView {
    let index = this.graphModelService.calculateNewNodeIndex(graph);
    return NodeView.create(new Node(index), {x: x, y: y}, NodeView.DEFAULT_RADIUS);
  }
}
