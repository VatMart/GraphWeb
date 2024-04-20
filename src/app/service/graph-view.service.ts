import {Injectable} from '@angular/core';
import {Graph} from "../model/graph";
import {Node} from "../model/node";
import {PixiService} from "./pixi.service";
import {GraphModelService} from "./graph-model.service";
import {NodeView} from "../model/graphical-model/node-view";
import {NodeViewFabricService} from "./node-view-fabric.service";
import {ModeManagerService} from "./event/mode-manager.service";
import {StateService} from "./state.service";

/**
 * Service for handling the graphical representation of the graph.
 */
@Injectable({
  providedIn: 'root'
})
export class GraphViewService extends GraphModelService {

  private _map: Map<Node, NodeView> = new Map<Node, NodeView>();

  private _currentGraph: Graph | undefined;

  constructor(private pixiService: PixiService,
              private nodeViewFabricService: NodeViewFabricService,
              private appState: StateService) {
    super();
  }

  /**
   * Adds a node to the graph and the graph view.
   * All other methods for adding nodes should call this method.
   */
  public addNodeToGraphView(graph: Graph, nodeView: NodeView) {
    super.addNodeToGraph(graph, nodeView.node);
    this._map.set(nodeView.node, nodeView);
    this.pixiService.getApp().stage.addChild(nodeView); // TODO Add container, not the node itself
    this.appState.addedNode(nodeView); // Notify state service
    console.log("Added node to graph: " + nodeView.node.index);
  }

  /**
   * Removes a node from the graph and the graph view.
   * All other methods for removing nodes should call this method.
   */
  public removeNodeFromGraphView(graph: Graph, nodeView: NodeView) {
    super.removeNodeFromGraph(graph, nodeView.node);
    this._map.delete(nodeView.node);
    this.pixiService.getApp().stage.removeChild(nodeView);
    console.log("Removed node from graph: " + nodeView.node.index);
  }

  /**
   * Adds a node to the current graph view with the given coordinates.
   */
  public addNodeToCurrentGraphView(x: number, y: number) {
    if (this.currentGraph) {
      let nodeView: NodeView = this.nodeViewFabricService.createDefaultNodeViewWithCoordinates(this.currentGraph,
        {x: x, y: y});
      this.addNodeToGraphView(this.currentGraph, nodeView);
    } else {
      console.error("No current graph set"); // TODO throw exception
    }
  }

  public removeNodeFromCurrentGraphView(nodeView: NodeView) {
    if (this.currentGraph) {
      this.removeNodeFromGraphView(this.currentGraph, nodeView);
    } else {
      console.error("No current graph set"); // TODO throw exception
    }
  }

  get map(): Map<Node, NodeView> {
    return this._map;
  }

  get currentGraph(): Graph {
    return <Graph>this._currentGraph;
  }

  set currentGraph(value: Graph) {
    this._currentGraph = value;
  }
}
