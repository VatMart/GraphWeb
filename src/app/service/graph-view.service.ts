import {Injectable} from '@angular/core';
import {Graph} from "../model/graph";
import {Node} from "../model/node";
import {PixiService} from "./pixi.service";
import {GraphModelService} from "./graph-model.service";
import {NodeView} from "../model/graphical-model/node-view";
import {NodeViewFabricService} from "./node-view-fabric.service";
import {StateService} from "./state.service";
import {GraphElement} from "../model/graphical-model/graph-element";
import {EdgeView} from "../model/graphical-model/edge-view";
import {EdgeViewFabricService} from "./edge-view-fabric.service";

/**
 * Service for handling the graphical representation of the graph.
 */
@Injectable({
  providedIn: 'root'
})
export class GraphViewService extends GraphModelService {

  private _map: Map<Node, NodeView> = new Map<Node, NodeView>();

  private _currentGraph: Graph | undefined;

  private _selectedElements: Set<GraphElement> = new Set<GraphElement>();

  constructor(private pixiService: PixiService,
              private nodeViewFabricService: NodeViewFabricService,
              private edgeViewFabricService: EdgeViewFabricService,
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
    console.log("Added node to graph: " + nodeView.node.index); // TODO remove
  }

  /**
   * Removes a node from the graph and the graph view.
   * All other methods for removing nodes should call this method.
   */
  public removeNodeFromGraphView(graph: Graph, nodeView: NodeView) {
    if (this._selectedElements.has(nodeView)) { // remove from selected elements
      this.unselectElement(nodeView);
    }
    super.removeNodeFromGraph(graph, nodeView.node);
    this._map.delete(nodeView.node);
    this.pixiService.getApp().stage.removeChild(nodeView);
    console.log("Removed node from graph: " + nodeView.node.index); // TODO remove
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

  public isElementSelected(element: GraphElement): boolean {
    return this._selectedElements.has(element);
  }

  public selectElement(element: GraphElement) {
    this._selectedElements.add(element);
    if (element instanceof NodeView) {
      this.nodeViewFabricService.changeToSelectedStyle(element);
    } else if (element instanceof EdgeView) {
      // TODO implement
    }
  }

  public unselectElement(element: GraphElement) {
    this._selectedElements.delete(element);
    if (element instanceof NodeView) {
      this.nodeViewFabricService.changeToDefaultStyle(element);
    } else if (element instanceof EdgeView) {
      // TODO implement
    }
  }

  public clearSelection() {
    this._selectedElements.forEach((element: GraphElement) => {
      this.unselectElement(element);
    });
  }

  public isSelectionEmpty(): boolean {
    return this._selectedElements.size === 0;
  }

  get selectedElements(): Set<GraphElement> {
    return this._selectedElements;
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
